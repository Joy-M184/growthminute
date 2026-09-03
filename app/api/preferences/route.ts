import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { userPreferences } from "@/db/schema";
import { getGrowthMinuteUserId } from "../../growthminute-user";

const choices = new Set(["growth", "cash", "both"]);

export async function GET() {
  const userId = await getGrowthMinuteUserId();
  if (!userId) return Response.json({ preference: null });
  const [preference] = await getDb().select().from(userPreferences).where(eq(userPreferences.ownerId, userId)).limit(1);
  return Response.json({ preference: preference?.productAccess ?? null });
}

export async function POST(request: Request) {
  const userId = await getGrowthMinuteUserId();
  if (!userId) return Response.json({ error: "Please sign in to continue." }, { status: 401 });
  const { productAccess } = await request.json() as { productAccess?: string };
  if (!productAccess || !choices.has(productAccess)) return Response.json({ error: "Choose a valid product." }, { status: 400 });
  await getDb().insert(userPreferences).values({ ownerId: userId, productAccess }).onConflictDoUpdate({
    target: userPreferences.ownerId,
    set: { productAccess, updatedAt: new Date().toISOString() },
  });
  return Response.json({ preference: productAccess });
}
