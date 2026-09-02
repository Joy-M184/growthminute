import { and, desc, eq } from "drizzle-orm";
import { getChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import { cashTransactions } from "../../../db/schema";

const MODES = new Set(["personal", "business"]);
const TYPES = new Set(["income", "expense"]);

export async function GET(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Please sign in to view your cash flow." }, { status: 401 });
  const mode = new URL(request.url).searchParams.get("mode") ?? "personal";
  if (!MODES.has(mode)) return Response.json({ error: "Invalid cash-flow mode." }, { status: 400 });
  const transactions = await getDb().select().from(cashTransactions)
    .where(and(eq(cashTransactions.ownerId, user.id), eq(cashTransactions.mode, mode)))
    .orderBy(desc(cashTransactions.transactionDate), desc(cashTransactions.id)).limit(200);
  return Response.json({ transactions });
}

export async function POST(request: Request) {
  try {
    const user = await getChatGPTUser();
    if (!user) return Response.json({ error: "Please sign in to add a transaction." }, { status: 401 });
    const payload = await request.json() as { mode?: string; type?: string; amount?: number; category?: string; note?: string; transactionDate?: string };
    if (!payload.mode || !MODES.has(payload.mode) || !payload.type || !TYPES.has(payload.type)) return Response.json({ error: "Choose a valid account and transaction type." }, { status: 400 });
    const amountPence = Math.round(Number(payload.amount) * 100);
    if (!Number.isInteger(amountPence) || amountPence <= 0 || amountPence > 99999999999) return Response.json({ error: "Enter a valid amount greater than zero." }, { status: 400 });
    const category = payload.category?.trim();
    const transactionDate = payload.transactionDate?.trim();
    if (!category || !/^\d{4}-\d{2}-\d{2}$/.test(transactionDate ?? "")) return Response.json({ error: "Add a category and valid date." }, { status: 400 });
    const [transaction] = await getDb().insert(cashTransactions).values({ ownerId: user.id, mode: payload.mode, type: payload.type, amountPence, category: category.slice(0, 80), note: payload.note?.trim().slice(0, 240) ?? "", transactionDate: transactionDate! }).returning();
    return Response.json({ transaction }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not save this transaction." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Please sign in." }, { status: 401 });
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) return Response.json({ error: "Invalid transaction." }, { status: 400 });
  await getDb().delete(cashTransactions).where(and(eq(cashTransactions.id, id), eq(cashTransactions.ownerId, user.id)));
  return Response.json({ success: true });
}
