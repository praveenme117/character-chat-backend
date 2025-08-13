import express from 'express';
import { conversationController } from '../controllers/conversationController';

const router = express.Router();

router.get('/:id', conversationController.getConversation.bind(conversationController));
router.post('/:id', conversationController.updateMessages.bind(conversationController));

export default router;
