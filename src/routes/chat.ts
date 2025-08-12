import express, { Request, Response } from 'express';
import { OpenAI } from 'openai';
import { chatStream } from '../services/chatService';

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Interface for query parameters
interface ChatStreamQuery {
  conversationId: string;
  message: string;
  userData: string;
}

router.get('/stream', async (req: Request, res: Response) => {
  const { conversationId, message, userData } = req.query;

  // Validate query parameters
  if (!conversationId || !message || !userData) {
    return res.status(400).json({ error: 'Missing required query parameters: conversationId, message, userData' });
  }

  try {
    // Decode query parameters
    const decodedMessage = decodeURIComponent(message as string);
    const decodedUserData = decodeURIComponent(userData as string);

    await chatStream(req, res, openai, conversationId as string, decodedMessage, decodedUserData);
  } catch (error) {
    console.error('Error initiating chat stream:', error);
    res.status(500).json({ error: 'Failed to initiate chat stream' });
  }
});

export default router;