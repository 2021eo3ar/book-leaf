"use client";

import Link from "next/link";
import { Inbox } from "lucide-react";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/SignOutButton";

export function AdminNav() {
  const pathname = usePathname();
  const active = pathname === "/admin" || pathname.startsWith("/admin/");

  return (
    <nav className="space-y-1">
      <Link
        href="/admin"
        aria-current={active ? "page" : undefined}
        className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
          active ? "bg-white text-slate-950" : "text-slate-300 hover:bg-white/10 hover:text-white"
        }`}
      >
        <Inbox className="h-4 w-4" />
        Ticket Queue
      </Link>
      <div className="[&_button]:text-slate-300 [&_button:hover]:bg-white/10 [&_button:hover]:text-white">
        <SignOutButton />
      </div>
    </nav>
  );
}
