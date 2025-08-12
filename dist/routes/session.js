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
const client_1 = require("@prisma/client");
const crypto_1 = __importDefault(require("crypto"));
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { avatarId, userData } = req.body;
    try {
        let user = yield prisma.user.findFirst({ where: { name: userData.name } });
        if (!user) {
            user = yield prisma.user.create({
                data: { id: crypto_1.default.randomUUID(), name: userData.name, city: userData.city },
            });
        }
        const conversation = yield prisma.conversation.create({
            data: {
                avatarId,
                userId: user.id,
                messages: { create: [] },
            },
            select: { id: true },
        });
        console.log('Created conversation:', conversation.id);
        res.json({ sessionId: conversation.id, userData });
    }
    catch (error) {
        console.error('Error creating session:', error);
        res.status(500).json({ error: 'Failed to create session' });
    }
}));
exports.default = router;
