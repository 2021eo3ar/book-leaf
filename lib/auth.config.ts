import type { NextAuthConfig } from "next-auth";
import { UserRole } from "@/lib/db/schema";

export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.userId = user.id ?? "";
        token.role = user.role;
        token.authorId = user.authorId;
      }
      return token;
    },
    session({ session, token }) {
      session.user.userId = String(token.userId);
      session.user.role = token.role as UserRole;
      session.user.authorId = typeof token.authorId === "string" ? token.authorId : null;
      return session;
    },
  },
} satisfies NextAuthConfig;
