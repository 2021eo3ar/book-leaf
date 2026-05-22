"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@bookleaf.com");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (result?.error) {
      setLoading(false);
      setError("Invalid email or password");
      return;
    }

    setRedirecting(true);
    const session = await fetch("/api/auth/session").then((res) => res.json());
    router.push(session?.user?.role === "admin" ? "/admin" : "/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        Email
        <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
      </label>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        Password
        <div className="relative">
          <Input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type={showPassword ? "text" : "password"}
            className="pr-20"
            required
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "Hide" : "View"}
          </button>
        </div>
      </label>
      {error ? <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p> : null}
      {redirecting ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          Login successful. Redirecting to your portal...
        </div>
      ) : null}
      <Button className="w-full" disabled={loading || redirecting}>
        {redirecting ? "Redirecting..." : loading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}
