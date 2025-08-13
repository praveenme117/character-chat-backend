import express from 'express';
import { chatController } from '../controllers/chatController';

const router = express.Router();

router.get('/stream', chatController.streamChat.bind(chatController));

export default router;