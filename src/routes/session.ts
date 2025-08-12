import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import express from 'express';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  const { avatarId, userData } = req.body;
  try {
    let user = await prisma.user.findFirst({ where: { name: userData.name } });
    if (!user) {
      user = await prisma.user.create({
        data: { id: crypto.randomUUID(), name: userData.name, city: userData.city },
      });
    }
    const conversation = await prisma.conversation.create({
      data: {
        avatarId,
        userId: user.id,
        messages: { create: [] },
      },
      select: { id: true },
    });
    console.log('Created conversation:', conversation.id);
    res.json({ sessionId: conversation.id, userData });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

export default router;
