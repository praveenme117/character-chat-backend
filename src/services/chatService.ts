import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { Request, Response } from 'express';
import { OpenAI } from 'openai';

const prisma = new PrismaClient();
const clients: { [conversationId: string]: Response[] } = {};

interface MessageData {
  id: string;
  conversationId: string;
  userMessage: string;
  aiResponse: string;
  timestamp: Date;
}

export async function chatStream(
  req: Request,
  res: Response,
  openai: OpenAI,
  conversationId: string,
  message: string,
  userData: string
): Promise<void> {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  if (!clients[conversationId]) {
    clients[conversationId] = [];
  }
  clients[conversationId].push(res);
  console.log(`Client connected for conversation ${conversationId}. Total clients: ${clients[conversationId].length}`);

  const heartbeat = setInterval(() => {
    try {
      res.write('event: ping\ndata: {}\n\n');
    } catch (error) {
      console.error(`Heartbeat error for conversation ${conversationId}:`, error);
    }
  }, 15000);

  let isStreamComplete = false;

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { messages: { take: 10, orderBy: { timestamp: 'asc' } } },
    });
    if (!conversation) {
      res.write(`event: error\ndata: ${JSON.stringify({ error: 'Conversation not found' })}\n\n`);
      return;
    }

    const messageHistory = conversation.messages.map((msg) => ({
      role: (msg.userMessage ? 'user' : 'assistant') as 'user' | 'assistant',
      content: msg.userMessage || msg.aiResponse || '',
    }));

    console.log('OpenAI API Key:', process.env.OPENAI_API_KEY ? 'Set' : 'Missing');
    console.log(`Sending OpenAI request for conversation ${conversationId}`);
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an AI avatar living within a person's phone, acting as a confidante and personal assistant. Be warm, friendly, empathetic, and engaging. Adapt to the user's language (English or Japanese). Respect privacy, avoid unethical actions, and provide clear, concise help. User's details: ${userData}.`,
        },
        ...messageHistory,
        { role: 'user', content: message },
      ],
      stream: true,
    });

    let aiMessageContent = '';
    for await (const chunk of response) {
      const content = chunk.choices[0]?.delta?.content || '';
      aiMessageContent += content;
      try {
        res.write(`event: token\ndata: ${JSON.stringify({ content })}\n\n`);
      } catch (error) {
        console.error(`Error sending token for conversation ${conversationId}:`, error);
        res.write(`event: error\ndata: ${JSON.stringify({ error: 'Failed to send token' })}\n\n`);
        break;
      }
    }
    res.write(`event: done\ndata: {}\n\n`);
    isStreamComplete = true;

    if (isStreamComplete) {
      const messageData: MessageData = {
        id: crypto.randomUUID(),
        conversationId,
        userMessage: message,
        aiResponse: aiMessageContent,
        timestamp: new Date(),
      };

      await prisma.message.create({
        data: messageData,
      });
      console.log(`Message saved for conversation ${conversationId}:`, messageData);
    }
  } catch (error: any) {
    console.error(`Stream error for conversation ${conversationId}:`, error.message || error);
    let errorMessage = 'Stream error: Unknown error';
    if (error.response) {
      errorMessage = `OpenAI error: ${error.response.status} - ${error.response.data?.error?.message || 'Unknown'}`;
    } else if (error.message) {
      errorMessage = `Stream error: ${error.message}`;
    }
    res.write(`event: error\ndata: ${JSON.stringify({ error: errorMessage })}\n\n`);
  } finally {
    clearInterval(heartbeat);
    clients[conversationId] = clients[conversationId].filter((client) => client !== res);
    if (clients[conversationId].length === 0) {
      delete clients[conversationId];
      console.log(`All clients disconnected for conversation ${conversationId}`);
    }
    res.end();
  }
}
