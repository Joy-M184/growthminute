import { eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { checkIns, plans } from "../../../../../db/schema";

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const payload = await request.json() as { participantName?: string; completed?: unknown; reflection?: string };
    const participantName = payload.participantName?.trim() ?? "";
    if (!participantName) return Response.json({ error: "Please add your name." }, { status: 400 });
    const db = getDb();
    const [plan] = await db.select({ id: plans.id }).from(plans).where(eq(plans.code, code)).limit(1);
    if (!plan) return Response.json({ error: "Plan not found." }, { status: 404 });
    const completed = Array.isArray(payload.completed) ? payload.completed.filter((value): value is number => Number.isInteger(value) && value >= 0) : [];
    const [checkIn] = await db.insert(checkIns).values({ planId: plan.id, participantName: participantName.slice(0, 100), completedJson: JSON.stringify(completed), reflection: payload.reflection?.trim().slice(0, 2000) ?? "" }).returning({ id: checkIns.id });
    return Response.json({ checkIn }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not submit the check-in." }, { status: 500 });
  }
}
