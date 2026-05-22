import Groq from "groq-sdk";
import { Book, Ticket, TicketCategory, TicketPriority, TicketResponse } from "@/lib/db/schema";

const CATEGORIES: TicketCategory[] = [
  "royalty_payments",
  "isbn_metadata",
  "printing_quality",
  "distribution_availability",
  "book_status_production",
  "general_inquiry",
];
const PRIORITIES: TicketPriority[] = ["critical", "high", "medium", "low"];

function getGroqClient() {
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "your_groq_api_key_here") {
    return null;
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

export async function classifyTicket(
  subject: string,
  description: string,
): Promise<{ category: TicketCategory; priority: TicketPriority } | null> {
  const groq = getGroqClient();
  if (!groq) {
    return null;
  }

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content: `You classify support tickets for BookLeaf Publishing, a self-publishing company operating in India and the US.
Valid categories: royalty_payments, isbn_metadata, printing_quality, distribution_availability, book_status_production, general_inquiry.
Priority guidance: critical = financial issues or ISBN errors; high = quality issues or distribution down; medium = production updates or overdue royalties; low = general questions or bio updates.
Return ONLY valid JSON like { "category": "...", "priority": "..." }.`,
        },
        {
          role: "user",
          content: `Subject: ${subject}\nDescription: ${description}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as { category?: string; priority?: string };
    if (
      CATEGORIES.includes(parsed.category as TicketCategory) &&
      PRIORITIES.includes(parsed.priority as TicketPriority)
    ) {
      return {
        category: parsed.category as TicketCategory,
        priority: parsed.priority as TicketPriority,
      };
    }
  } catch (error) {
    console.error("Groq classification failed", error);
  }

  return null;
}

type DraftAuthor = {
  name: string;
  email: string;
  city: string;
};

function compactBook(book: Book | null) {
  if (!book) {
    return "General account-level ticket. No specific book selected.";
  }

  return JSON.stringify({
    title: book.title,
    isbn: book.isbn,
    genre: book.genre,
    status: book.status,
    publicationDate: book.publicationDate,
    mrp: book.mrp,
    royaltyPerCopy: book.authorRoyaltyPerCopy,
    totalCopiesSold: book.totalCopiesSold,
    totalRoyaltyEarned: book.totalRoyaltyEarned,
    royaltyPaid: book.royaltyPaid,
    royaltyPending: book.royaltyPending,
    lastRoyaltyPayoutDate: book.lastRoyaltyPayoutDate,
    printPartner: book.printPartner,
    availableOn: book.availableOn,
  });
}

export async function draftResponse(
  ticket: Ticket,
  author: DraftAuthor,
  book: Book | null,
  ticketResponses: TicketResponse[],
): Promise<string | null> {
  const groq = getGroqClient();
  if (!groq) {
    return null;
  }

  const lastResponses = ticketResponses.slice(-3).map((response) => ({
    sender: response.author,
    internal: response.isInternalNote,
    content: response.content,
    createdAt: response.createdAt,
  }));

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.35,
      messages: [
        {
          role: "system",
          content: `BOOKLEAF KNOWLEDGE BASE:

Company: BookLeaf Publishing is a self-publishing company operating in India and the US.
Packages: Standard Free (no upfront cost) and Bestseller Breakthrough (premium, paid).
Services: cover design, typesetting, ISBN assignment, printing, distribution, royalty management.
Printing: In-house facility in Delhi. Partners: Repro India, Epitome Books.

ROYALTY POLICY:
- 80/20 split: 80% net profit to author, 20% to BookLeaf
- Net profit = MRP minus printing cost, platform commission, shipping charges
- Royalties calculated quarterly, paid within 45 days of quarter end
- Minimum payout threshold: INR 1,000 (rolls over if below)
- Payouts via bank transfer to linked account
- Authors can view detailed royalty breakdown in dashboard

ISBN POLICY:
- Every book gets a unique ISBN under BookLeaf's publisher imprint
- For own-imprint ISBN, author must obtain independently
- ISBN errors are high-priority, escalated to production team immediately

PRINTING & QUALITY:
- Standard turnaround: 5-7 business days
- Quality issues: free reprint after verification (author shares photos)

DISTRIBUTION:
- Platforms: Amazon India, Flipkart, Amazon US, Amazon UK, BookLeaf Store
- New listings live in 7-10 business days after publication
- Unavailable listing = stock sync issue, fixed in 24-48 hours

PRODUCTION STAGES:
Manuscript Received -> Editing -> Cover Design -> Typesetting -> Proofreading -> ISBN Assignment -> Printing -> Distribution Setup -> Published & Live
Delays common at Cover Design (waiting author approval) and Proofreading.

COMMUNICATION TONE:
- Always empathetic and professional
- Acknowledge concern before jumping to solutions
- Be specific: include actual numbers, dates, statuses
- Own BookLeaf's mistakes directly with no corporate deflection
- If escalation needed, give clear 48-hour timeline
- Always end with a clear next step`,
        },
        {
          role: "user",
          content: `Author: ${author.name} (${author.email}, ${author.city})
Book data relevant to ticket: ${compactBook(book)}
Ticket subject: ${ticket.subject}
Ticket description: ${ticket.description}
Previous responses: ${JSON.stringify(lastResponses)}

Draft a response as a BookLeaf support representative. Be empathetic, specific, and professional. Use actual data from the author's account. End with a clear next step.`,
        },
      ],
    });

    return completion.choices[0]?.message?.content?.trim() ?? null;
  } catch (error) {
    console.error("Groq draft failed", error);
    return null;
  }
}
