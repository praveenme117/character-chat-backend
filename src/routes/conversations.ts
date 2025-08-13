import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Removed: Use /api/session instead to properly create conversations with valid user IDs

router.get('/:id', async (req, res) => {
  console.log('Fetching conversation:', req.params.id);
  
  // Always provide default avatar and empty messages if there are any issues
  const defaultResponse = {
    avatar: {
      id: 1,
      staticUrl: "/images/still.gif",
      listeningUrl: "/images/listening.gif",
      speakingUrl: "/images/speaking.gif",
      tapUrl: "/images/start.gif",
    },
    messages: []
  };

  try {
    // Check if database connection is available
    await prisma.$connect();
    
    const conversation = await prisma.conversation.findUnique({
      where: { id: req.params.id },
      include: { 
        messages: { 
          take: 50, 
          orderBy: { timestamp: 'asc' } 
        } 
      },
    });
    
    if (!conversation) {
      console.log('Conversation not found, returning defaults:', req.params.id);
      return res.json(defaultResponse);
    }

    // Expand each DB row into separate user and assistant messages (preserve order by timestamp)
    const messages: { id: string; role: 'user' | 'assistant'; content: string }[] = [];
    for (const m of conversation.messages) {
      if (m.userMessage) {
        messages.push({ id: `${m.id}-u`, role: 'user', content: m.userMessage });
      }
      if (m.aiResponse) {
        messages.push({ id: `${m.id}-a`, role: 'assistant', content: m.aiResponse });
      }
    }

    console.log('Conversation loaded:', {
      id: conversation.id,
      avatarId: conversation.avatarId,
      messageCount: messages.length
    });

    // Get the actual avatar for this conversation
    const avatar = await prisma.avatar.findUnique({
      where: { id: conversation.avatarId }
    });

    res.json({
      avatar: avatar || defaultResponse.avatar,
      messages: messages
    });
    
  } catch (error: any) {
    console.error('Database error, returning defaults:', error.message || error);
    console.error('Full error:', error);
    console.error('Error stack:', error.stack);
    // Return defaults instead of error for better UX
    res.json(defaultResponse);
  } finally {
    await prisma.$disconnect().catch(() => {});
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
