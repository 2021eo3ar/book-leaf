# BookLeaf Author Support & Communication Portal

## Project Overview
BookLeaf Portal is a full-stack Next.js app for author support. Authors can view book and royalty data, submit support tickets, and track conversations. Admins can triage tickets, edit status/category/priority, add internal notes, and generate AI-assisted response drafts with Groq.

## Tech Stack
- Next.js App Router: server components, route handlers, and colocated portal routes.
- Tailwind CSS: responsive, utility-first UI styling.
- PostgreSQL on Neon: serverless Postgres for Vercel-friendly deployment.
- Drizzle ORM: typed schema and queries with lightweight migrations.
- NextAuth v5: credentials auth with JWT sessions.
- Groq: `llama-3.3-70b-versatile` for classification and response drafting.
- SSE: simple real-time updates without WebSocket infrastructure.

## Getting Started
1. Install dependencies: `npm install`
2. Fill `.env.local` with real values.
3. Push the schema: `npm run db:push`
4. Seed demo data: `npm run db:seed`
5. Start locally: `npm run dev`
6. Open `http://localhost:3000`

## Environment Variables
- `DATABASE_URL`: Neon Postgres connection string.
- `NEXTAUTH_SECRET`: random secret used to sign auth tokens.
- `NEXTAUTH_URL`: local or production app URL.
- `GROQ_API_KEY`: Groq API key for AI classification and drafting.

## Database Setup
The Drizzle schema lives in `lib/db/schema.ts`. Use `npm run db:generate` for migration files, `npm run db:migrate` to run generated migrations, or `npm run db:push` for direct schema sync. The seed script is idempotent through `onConflictDoNothing()`.

## Test Credentials
| Role | Email | Password |
|---|---|---|
| Admin | admin@bookleaf.com | admin123 |
| Author | priya.sharma@email.com | author123 |
| Author | rohit.kapoor@email.com | author123 |
| Author | sneha.kulkarni@email.com | author123 |
| Author | diya.chatterjee@email.com | author123 |

All 10 author accounts use `author123`.

## Architecture Decisions
The App Router keeps portal pages and API handlers in one Next.js deployment. Drizzle + Neon gives type-safe Postgres access without a persistent server. SSE was chosen over WebSockets because the product only needs one-way ticket update notifications, making it simpler and cheaper at this scale.

## AI Integration
`lib/groq.ts` contains two Groq functions. Classification uses a strict JSON prompt with the six allowed categories and four priority levels. Drafting injects the BookLeaf knowledge base plus only the relevant book and last three responses to control token use. Groq failures return `null`; ticket creation never depends on AI availability.

## API Documentation
- `GET /api/books`: authenticated; authors get own books, admins get all.
- `GET /api/tickets`: authenticated; authors get own tickets, admins get all. Supports `status`, `category`, `priority`.
- `POST /api/tickets`: author only; body `{ bookId, subject, description }`; creates ticket and triggers async AI classification.
- `GET /api/tickets/:id`: authenticated; returns ticket with responses. Internal notes hidden from authors.
- `PATCH /api/tickets/:id`: admin only; body `{ category, priority, assignedTo }`.
- `PATCH /api/tickets/:id/status`: admin only; body `{ status }`.
- `POST /api/tickets/:id/respond`: authenticated; body `{ content, isInternalNote }`. Authors cannot create internal notes.
- `POST /api/ai/classify`: authenticated; body `{ subject, description }`; returns `{ category, priority }` or null fields.
- `POST /api/ai/draft`: admin only; body `{ ticketId }`; returns `{ draft }`.
- `GET /api/sse`: authenticated SSE stream for ticket events.
- `GET/POST /api/auth/[...nextauth]`: NextAuth handlers.

## Known Limitations & Future Improvements
- SSE clients are stored in memory; use Redis pub/sub for multi-instance production.
- Attachments are UI-only; add S3 or Vercel Blob uploads.
- No email notifications yet; add transactional email for new responses.
- Add rate limiting to AI endpoints and ticket creation.
- Add audit logs for admin field changes.
- Add automated tests for API permissions and ticket workflows.

## Deployment Checklist
1. Add all environment variables to Vercel.
2. Run `npm run db:push` against production Neon.
3. Run `npm run db:seed`.
4. Set `NEXTAUTH_URL` to the production Vercel URL.
5. Test admin and author portal logins.
