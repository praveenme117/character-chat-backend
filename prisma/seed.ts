import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed avatars
  await prisma.avatar.create({
    data: {
      staticUrl: 'https://gif-avatars.com/static-avatar.gif',
      listeningUrl: 'https://gif-avatars.com/listening-avatar.gif',
      speakingUrl: 'https://gif-avatars.com/speaking-avatar.gif',
      tapUrl: 'https://gif-avatars.com/tap-avatar.gif',
    },
  });

  // Seed demo users
  await prisma.user.createMany({
    data: [
      { id: crypto.randomUUID(), name: 'John', city: 'Tokyo' },
      { id: crypto.randomUUID(), name: 'Aiko', city: 'Osaka' },
    ],
  });

  console.log('Avatar and User tables seeded successfully');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
  