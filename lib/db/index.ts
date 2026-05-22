import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const databaseUrl =
  process.env.DATABASE_URL === "your_neon_postgres_connection_string"
    ? "postgres://placeholder:placeholder@localhost:5432/placeholder"
    : process.env.DATABASE_URL;
const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema });
