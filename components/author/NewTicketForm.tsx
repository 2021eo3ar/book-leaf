"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

type BookOption = { id: string; title: string };

export function NewTicketForm({ books }: { books: BookOption[] }) {
  const router = useRouter();
  const [bookId, setBookId] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId: bookId || null, subject, description }),
    });
    setLoading(false);
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "Unable to submit ticket");
      return;
    }
    router.push("/tickets?created=1");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-5">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        Which book is this about?
        <Select value={bookId} onChange={(event) => setBookId(event.target.value)}>
          <option value="">General / Account Level</option>
          {books.map((book) => (
            <option key={book.id} value={book.id}>{book.title}</option>
          ))}
        </Select>
      </label>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        Subject
        <Input maxLength={100} value={subject} onChange={(event) => setSubject(event.target.value)} required />
      </label>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        Description
        <Textarea minLength={20} value={description} onChange={(event) => setDescription(event.target.value)} required />
      </label>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        Attachment <span className="text-slate-400 dark:text-slate-500">(Coming soon)</span>
        <Input type="file" disabled />
      </label>
      {error ? <p className="text-sm font-semibold text-red-600 dark:text-red-400">{error}</p> : null}
      <Button disabled={loading}>{loading ? "Submitting..." : "Submit Query"}</Button>
    </form>
  );
}
