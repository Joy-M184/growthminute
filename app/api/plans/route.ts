import { randomUUID } from "node:crypto";
import { getDb } from "../../../db";
import { plans } from "../../../db/schema";

export async function POST(request: Request) {
  try {
    const payload = await request.json() as { title?: string; planDate?: string; sourceText?: string; items?: unknown };
    const title = payload.title?.trim() || "Today’s Growth Plan";
    const planDate = payload.planDate?.trim() || new Date().toISOString().slice(0, 10);
    const items = Array.isArray(payload.items) ? payload.items.filter((item): item is string => typeof item === "string" && item.trim().length > 0).map((item) => item.trim()).slice(0, 30) : [];
    if (!items.length) return Response.json({ error: "Add at least one activity." }, { status: 400 });
    const code = randomUUID().replaceAll("-", "").slice(0, 10);
    const adminKey = randomUUID().replaceAll("-", "");
    const [plan] = await getDb().insert(plans).values({ code, adminKey, title: title.slice(0, 120), planDate, sourceText: payload.sourceText?.slice(0, 15000) ?? "", itemsJson: JSON.stringify(items) }).returning();
    return Response.json({ plan: { ...plan, items } }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not create the plan." }, { status: 500 });
  }
}
