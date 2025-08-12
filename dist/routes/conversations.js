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
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Removed: Use /api/session instead to properly create conversations with valid user IDs
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conversation = yield prisma.conversation.findUnique({
            where: { id: req.params.id },
            include: { avatar: true, messages: { take: 50, orderBy: { timestamp: 'asc' } } },
        });
        if (!conversation)
            return res.status(404).json({ error: 'Conversation not found' });
        res.json({
            avatar: conversation.avatar,
            messages: conversation.messages.map((m) => ({
                id: m.id,
                role: m.userMessage ? 'user' : 'assistant',
                content: m.userMessage || m.aiResponse || '',
            })),
        });
    }
    catch (error) {
        console.error('Error fetching conversation:', error);
        res.status(500).json({ error: 'Failed to get conversation' });
    }
}));
router.post('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { messages } = req.body;
    try {
        yield prisma.conversation.update({
            where: { id: req.params.id },
            data: {
                messages: {
                    deleteMany: {},
                    create: messages.map((m) => ({
                        id: m.id,
                        userMessage: m.role === 'user' ? m.content : null,
                        aiResponse: m.role === 'assistant' ? m.content : null,
                        timestamp: new Date(),
                    })),
                },
            },
        });
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error updating conversation:', error);
        res.status(500).json({ error: 'Failed to update conversation' });
    }
}));
exports.default = router;
