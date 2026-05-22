import { Badge, statusTone } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Book } from "@/lib/db/schema";
import { rupees, shortDate } from "@/lib/format";

export function BookCard({ book }: { book: Book }) {
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-bold text-slate-950 dark:text-slate-100">{book.title}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{book.isbn}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="amber">{book.genre}</Badge>
          <Badge tone={statusTone(book.status)}>{book.status}</Badge>
          {book.royaltyPending === 0 ? <Badge tone="green">Fully Paid</Badge> : null}
        </div>
      </div>
      <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div><dt className="text-slate-500 dark:text-slate-400">Publication</dt><dd className="font-semibold text-slate-950 dark:text-slate-100">{shortDate(book.publicationDate)}</dd></div>
        <div><dt className="text-slate-500 dark:text-slate-400">MRP</dt><dd className="font-semibold text-slate-950 dark:text-slate-100">{rupees(book.mrp)}</dd></div>
        <div><dt className="text-slate-500 dark:text-slate-400">Copies sold</dt><dd className="font-semibold text-slate-950 dark:text-slate-100">{book.totalCopiesSold}</dd></div>
        <div><dt className="text-slate-500 dark:text-slate-400">Print partner</dt><dd className="font-semibold text-slate-950 dark:text-slate-100">{book.printPartner ?? "TBD"}</dd></div>
        <div><dt className="text-slate-500 dark:text-slate-400">Last payout</dt><dd className="font-semibold text-slate-950 dark:text-slate-100">{book.lastRoyaltyPayoutDate ? shortDate(book.lastRoyaltyPayoutDate) : "No payouts yet"}</dd></div>
      </dl>
      <div className="mt-5 grid gap-3 rounded-md bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-950 dark:text-slate-300 sm:grid-cols-3">
        <span>Earned: <strong>{rupees(book.totalRoyaltyEarned)}</strong></span>
        <span>Paid: <strong>{rupees(book.royaltyPaid)}</strong></span>
        <span>Pending: <strong>{rupees(book.royaltyPending)}</strong></span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {book.availableOn.length ? book.availableOn.map((item) => <Badge key={item}>{item}</Badge>) : <Badge>Not yet listed</Badge>}
      </div>
    </Card>
  );
}
