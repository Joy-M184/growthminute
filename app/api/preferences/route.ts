import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { userPreferences } from "@/db/schema";
import { getChatGPTUser } from "../../chatgpt-auth";

const choices = new Set(["growth", "cash", "both"]);

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Please sign in." }, { status: 401 });
  const [preference] = await getDb().select().from(userPreferences).where(eq(userPreferences.ownerId, user.id)).limit(1);
  return Response.json({ preference: preference?.productAccess ?? null });
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Please sign in." }, { status: 401 });
  const { productAccess } = await request.json() as { productAccess?: string };
  if (!productAccess || !choices.has(productAccess)) return Response.json({ error: "Choose a valid product." }, { status: 400 });
  await getDb().insert(userPreferences).values({ ownerId: user.id, productAccess }).onConflictDoUpdate({
    target: userPreferences.ownerId,
    set: { productAccess, updatedAt: new Date().toISOString() },
  });
  return Response.json({ preference: productAccess });
}
