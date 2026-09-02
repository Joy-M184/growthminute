import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { checkIns, plans } from "../../../../db/schema";

export async function GET(_request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const db = getDb();
  const [plan] = await db.select().from(plans).where(eq(plans.adminKey, key)).limit(1);
  if (!plan) return Response.json({ error: "Dashboard not found." }, { status: 404 });
  const items = JSON.parse(plan.itemsJson) as string[];
  const rows = await db.select().from(checkIns).where(eq(checkIns.planId, plan.id)).orderBy(desc(checkIns.createdAt), desc(checkIns.id)).limit(500);
  const submissions = rows.map((row) => {
    const completed = JSON.parse(row.completedJson) as number[];
    return { id: row.id, participantName: row.participantName, completedCount: completed.length, totalCount: items.length, percentage: items.length ? Math.round(completed.length / items.length * 100) : 0, reflection: row.reflection, createdAt: row.createdAt };
  });
  const average = submissions.length ? Math.round(submissions.reduce((sum, row) => sum + row.percentage, 0) / submissions.length) : 0;
  return Response.json({ dashboard: { plan: { title: plan.title, planDate: plan.planDate, code: plan.code }, submissions, average } });
}
