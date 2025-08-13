Avatar Chat Backend
Node.js/Express backend for the Avatar Chat MVP.

Project structure (src/)

- config/: env.ts (validated env vars)
- lib/: prisma (singleton), openai, logger
- middleware/: cors, errorHandler
- schemas/: zod schemas for inputs
- services/: business logic (session/conversation/chat)
- controllers/: HTTP orchestration
- routes/: route definitions
- app.ts / server.ts / index.ts

Setup

1. Install deps
   npm install

2. Create .env (see keys below) or copy .env.example

   - NODE_ENV=development
   - PORT=3001
   - DATABASE_URL=...
   - OPENAI_API_KEY=...
   - CORS_ORIGIN=http://localhost:3000

3. Prisma
   npm run db:generate
   npm run db:migrate # or: npm run db:push (for dev)
   npm run seed

4. Start
   npm run dev

API Endpoints (behavior unchanged)

- GET /
  - Health/status
- POST /api/session
  - Create/find user and create conversation
  - Body: { avatarId: number, userData: { name: string, city?: string } }
- GET /api/conversations/:id
  - Returns avatar + expanded messages (or defaults)
- POST /api/conversations/:id
  - Overwrites messages array
- GET /api/chat/stream
  - Server-Sent Events stream (token/done/error/ping)
  - Query: conversationId (uuid), message (string), userData (URL-encoded JSON), lang (en|ja)

Deployment

- Build: npm run build
- Start: npm start
- Migrations: npx prisma migrate deploy
- Seed (optional): npm run seed
