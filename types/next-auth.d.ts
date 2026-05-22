import { DefaultSession } from "next-auth";
import { UserRole } from "@/lib/db/schema";

declare module "next-auth" {
  interface Session {
    user: {
      userId: string;
      role: UserRole;
      authorId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    authorId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
    authorId: string | null;
    userId: string;
  }
}
