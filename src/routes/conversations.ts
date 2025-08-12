import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Removed: Use /api/session instead to properly create conversations with valid user IDs

router.get('/:id', async (req, res) => {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: req.params.id },
      include: { avatar: true, messages: { take: 50, orderBy: { timestamp: 'asc' } } },
    });
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
    res.json({
      avatar: conversation.avatar,
      messages: conversation.messages.map((m: any) => ({
        id: m.id,
        role: m.userMessage ? 'user' : 'assistant',
        content: m.userMessage || m.aiResponse || '',
      })),
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
});

router.post('/:id', async (req, res) => {
  const { messages } = req.body;
  try {
    await prisma.conversation.update({
      where: { id: req.params.id },
      data: {
        messages: {
          deleteMany: {},
          create: messages.map((m: any) => ({
            id: m.id,
            userMessage: m.role === 'user' ? m.content : null,
            aiResponse: m.role === 'assistant' ? m.content : null,
            timestamp: new Date(),
          })),
        },
      },
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating conversation:', error);
    res.status(500).json({ error: 'Failed to update conversation' });
  }
});

export default router;
