"use client";

import Link from "next/link";
import { BookMarked, Home, MessageCirclePlus, Tickets } from "lucide-react";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/SignOutButton";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/books", label: "My Books", icon: BookMarked },
  { href: "/tickets/new", label: "Submit a Query", icon: MessageCirclePlus },
  { href: "/tickets", label: "My Tickets", icon: Tickets },
];

export function AuthorNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {nav.map((item) => {
        const active = pathname === item.href || (item.href !== "/tickets/new" && pathname.startsWith(`${item.href}/`));
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
              active
                ? "bg-slate-950 text-white shadow-sm dark:bg-amber-500 dark:text-slate-950"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
      <div className="pt-2">
        <SignOutButton />
      </div>
    </nav>
  );
}
