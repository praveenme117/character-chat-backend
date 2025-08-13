import { logger } from '../lib/logger';
import { prisma } from '../lib/prisma';
import { Message } from '../schemas/conversation';

export class ConversationService {
  private getDefaultResponse() {
    return {
      avatar: {
        id: 1,
        staticUrl: '/images/still.gif',
        listeningUrl: '/images/listening.gif',
        speakingUrl: '/images/speaking.gif',
        tapUrl: '/images/start.gif',
      },
      messages: [] as { id: string; role: 'user' | 'assistant'; content: string }[],
    };
  }

  async getConversation(conversationId: string) {
    try {
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: { take: 50, orderBy: { timestamp: 'asc' } },
        },
      });

      if (!conversation) {
        logger.info('Conversation not found, returning defaults', { conversationId });
        return this.getDefaultResponse();
      }

      const messages: { id: string; role: 'user' | 'assistant'; content: string }[] = [];
      for (const m of conversation.messages) {
        if (m.userMessage) messages.push({ id: `${m.id}-u`, role: 'user', content: m.userMessage });
        if (m.aiResponse) messages.push({ id: `${m.id}-a`, role: 'assistant', content: m.aiResponse });
      }

      const avatar = await prisma.avatar.findUnique({ where: { id: conversation.avatarId } });

      logger.info('Conversation loaded', { id: conversation.id, avatarId: conversation.avatarId, messageCount: messages.length });
      return { avatar: avatar || this.getDefaultResponse().avatar, messages };
    } catch (error: any) {
      logger.error('Database error, returning defaults', error?.message || error);
      return this.getDefaultResponse();
    }
  }

  async updateMessages(conversationId: string, messages: Message[]) {
    await prisma.conversation.update({
      where: { id: conversationId },
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
  }
}

export const conversationService = new ConversationService();


