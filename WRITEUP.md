# BookLeaf Portal Write-Up

I prioritized the core ticket workflow and Groq integration first because they define the product: authors submit queries, admins triage them, and AI helps with classification and draft responses. The database schema, auth roles, permission checks, and seed data were built around that flow so the demo data works immediately after `db:push` and `db:seed`.

Key trade-offs were made for scope and deployability. SSE is used instead of WebSockets because ticket updates are simple server-to-client notifications. The SSE registry is in memory, which is fine for a single local or demo instance but should become Redis pub/sub in production. File attachments are represented in the UI only, keeping the first version focused on support conversations rather than storage.

For production, I would add Redis-backed real-time fanout, S3 or Vercel Blob attachments, email notifications for author/admin responses, rate limiting around AI and ticket creation, audit logs for admin changes, and more complete automated tests. I would also cache slower read-heavy account data such as royalty summaries while keeping ticket mutations strongly consistent.
