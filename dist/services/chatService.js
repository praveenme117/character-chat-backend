"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatStream = chatStream;
const client_1 = require("@prisma/client");
const crypto_1 = __importDefault(require("crypto"));
const prisma = new client_1.PrismaClient();
const clients = {};
function chatStream(req, res, openai, conversationId, message, userData) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, e_1, _b, _c;
        var _d, _e, _f, _g;
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();
        if (!clients[conversationId]) {
            clients[conversationId] = [];
        }
        clients[conversationId].push(res);
        console.log(`Client connected for conversation ${conversationId}. Total clients: ${clients[conversationId].length}`);
        const heartbeat = setInterval(() => {
            try {
                res.write('event: ping\ndata: {}\n\n');
            }
            catch (error) {
                console.error(`Heartbeat error for conversation ${conversationId}:`, error);
            }
        }, 15000);
        let isStreamComplete = false;
        try {
            const conversation = yield prisma.conversation.findUnique({
                where: { id: conversationId },
                include: { messages: { take: 50, orderBy: { timestamp: 'asc' } } },
            });
            if (!conversation) {
                res.write(`event: error\ndata: ${JSON.stringify({ error: 'Conversation not found' })}\n\n`);
                return;
            }
            const messageHistory = conversation.messages.map((msg) => ({
                role: (msg.userMessage ? 'user' : 'assistant'),
                content: msg.userMessage || msg.aiResponse || '',
            }));
            console.log('OpenAI API Key:', process.env.OPENAI_API_KEY ? 'Set' : 'Missing');
            console.log(`Sending OpenAI request for conversation ${conversationId}`);
            const response = yield openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `You are an AI avatar living within a person's phone, acting as a confidante and personal assistant. Be warm, friendly, empathetic, and engaging. Adapt to the user's language (English or Japanese). Respect privacy, avoid unethical actions, and provide clear, concise help. User's details: ${userData}.`,
                    },
                    ...messageHistory,
                    { role: 'user', content: message },
                ],
                stream: true,
            });
            let aiMessageContent = '';
            try {
                for (var _h = true, response_1 = __asyncValues(response), response_1_1; response_1_1 = yield response_1.next(), _a = response_1_1.done, !_a; _h = true) {
                    _c = response_1_1.value;
                    _h = false;
                    const chunk = _c;
                    const content = ((_e = (_d = chunk.choices[0]) === null || _d === void 0 ? void 0 : _d.delta) === null || _e === void 0 ? void 0 : _e.content) || '';
                    aiMessageContent += content;
                    try {
                        res.write(`event: token\ndata: ${JSON.stringify({ content })}\n\n`);
                    }
                    catch (error) {
                        console.error(`Error sending token for conversation ${conversationId}:`, error);
                        res.write(`event: error\ndata: ${JSON.stringify({ error: 'Failed to send token' })}\n\n`);
                        break;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_h && !_a && (_b = response_1.return)) yield _b.call(response_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            res.write(`event: done\ndata: {}\n\n`);
            isStreamComplete = true;
            if (isStreamComplete) {
                const messageData = {
                    id: crypto_1.default.randomUUID(),
                    conversationId,
                    userMessage: message,
                    aiResponse: aiMessageContent,
                    timestamp: new Date(),
                };
                yield prisma.message.create({
                    data: messageData,
                });
                console.log(`Message saved for conversation ${conversationId}:`, messageData);
            }
        }
        catch (error) {
            console.error(`Stream error for conversation ${conversationId}:`, error.message || error);
            let errorMessage = 'Stream error: Unknown error';
            if (error.response) {
                errorMessage = `OpenAI error: ${error.response.status} - ${((_g = (_f = error.response.data) === null || _f === void 0 ? void 0 : _f.error) === null || _g === void 0 ? void 0 : _g.message) || 'Unknown'}`;
            }
            else if (error.message) {
                errorMessage = `Stream error: ${error.message}`;
            }
            res.write(`event: error\ndata: ${JSON.stringify({ error: errorMessage })}\n\n`);
        }
        finally {
            clearInterval(heartbeat);
            clients[conversationId] = clients[conversationId].filter((client) => client !== res);
            if (clients[conversationId].length === 0) {
                delete clients[conversationId];
                console.log(`All clients disconnected for conversation ${conversationId}`);
            }
            res.end();
        }
    });
}
