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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const openai_1 = require("openai");
const chatService_1 = require("../services/chatService");
const router = express_1.default.Router();
const openai = new openai_1.OpenAI({ apiKey: process.env.OPENAI_API_KEY });
router.get('/stream', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { conversationId, message, userData } = req.query;
    // Validate query parameters
    if (!conversationId || !message || !userData) {
        return res.status(400).json({ error: 'Missing required query parameters: conversationId, message, userData' });
    }
    try {
        // Decode query parameters
        const decodedMessage = decodeURIComponent(message);
        const decodedUserData = decodeURIComponent(userData);
        yield (0, chatService_1.chatStream)(req, res, openai, conversationId, decodedMessage, decodedUserData);
    }
    catch (error) {
        console.error('Error initiating chat stream:', error);
        res.status(500).json({ error: 'Failed to initiate chat stream' });
    }
}));
exports.default = router;
