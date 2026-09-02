import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { plans } from "../../../../db/schema";

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const [plan] = await getDb().select().from(plans).where(eq(plans.code, code)).limit(1);
  if (!plan) return Response.json({ error: "Plan not found." }, { status: 404 });
  return Response.json({ plan: { id: plan.id, code: plan.code, title: plan.title, planDate: plan.planDate, items: JSON.parse(plan.itemsJson) } });
}
