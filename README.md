Avatar Chat Backend
   Node.js/Express.js backend for the Avatar Chat MVP.
Setup

Install dependencies: npm install
Set DATABASE_URL and OPENAI_API_KEY in .env.
Run migrations: npx prisma migrate dev --name init
Seed avatars: npm run seed
Start dev server: npm run dev

API Endpoints

GET /: Check server status.
POST /api/conversations: Create conversation (body: { avatarId: number }).
GET /api/conversations/:id: Get conversation and avatar.
POST /api/conversations/:id: Update messages.
POST /api/chat: Stream AI response (body: { conversationId: string, messages: any[], userData: object }).

Deployment

Build: npm run build
Docker: Use Dockerfile.
Deploy to Render/AWS ECS.
Run npx prisma migrate deploy and npm run seed in production.
