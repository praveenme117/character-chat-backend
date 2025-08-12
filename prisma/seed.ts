import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const avatar = await prisma.avatar.create({
    data: {
      staticUrl: '/avatars/static.mp4',
      listeningUrl: '/avatars/listening.mp4',
      speakingUrl: '/avatars/speaking.mp4',
      tapUrl: '/avatars/tap.mp4',
    },
  });

  const users = await prisma.user.createMany({
    data: [
      { id: crypto.randomUUID(), name: 'John', city: 'Tokyo' },
      { id: crypto.randomUUID(), name: 'Aiko', city: 'Osaka' },
    ],
  });

  const user = await prisma.user.findFirst({ where: { name: 'John' } });
  if (!user) throw new Error('User not found');

  const conversation = await prisma.conversation.create({
    data: {
      avatarId: avatar.id,
      userId: user.id,
      messages: {
        create: Array.from({ length: 50 }, (_, i) => ({
          id: crypto.randomUUID(),
          userMessage: i % 2 === 0 ? `User message ${i + 1}` : null,
          aiResponse: i % 2 === 1 ? `AI response ${i + 1}` : null,
          timestamp: new Date(Date.now() - (50 - i) * 60000),
        })),
      },
    },
    select: { id: true },
  });

  console.log('Seeded conversation:', conversation.id);
  console.log('Avatar, User, and Conversation tables seeded successfully');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });