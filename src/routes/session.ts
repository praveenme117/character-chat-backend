import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import express from 'express';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  console.log('Session creation request body:', JSON.stringify(req.body, null, 2));
  
  const { avatarId, userData } = req.body;
  
  // Validate required fields
  if (!avatarId || !userData || !userData.name) {
    console.error('Invalid session creation payload:', { avatarId, userData });
    return res.status(400).json({ error: 'Missing required fields: avatarId and userData with name' });
  }
  
  // Ensure userData has proper structure
  const userInfo = {
    name: userData.name || 'User',
    city: userData.city || 'Unknown'
  };
  
  try {
    // Check if database is available
    await prisma.$connect();
    
    let user = await prisma.user.findFirst({ where: { name: userInfo.name } });
    if (!user) {
      user = await prisma.user.create({
        data: { id: crypto.randomUUID(), name: userInfo.name, city: userInfo.city },
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
    
    console.log('Successfully created conversation:', conversation.id, 'for user:', userInfo.name);
    res.json({ sessionId: conversation.id, userData: userInfo });
    
  } catch (error: any) {
    console.error('Database error creating session:', error.message || error);
    
    // If database fails, create a temporary session ID for the frontend
    const tempSessionId = crypto.randomUUID();
    console.log('Created temporary session ID:', tempSessionId);
    
    res.json({ 
      sessionId: tempSessionId, 
      userData: userInfo,
      temporary: true 
    });
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

export default router;
