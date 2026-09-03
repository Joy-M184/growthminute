import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { userPreferences } from "@/db/schema";
import { getGrowthMinuteUserId } from "../growthminute-user";
import ProductChoice from "./product-choice";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function WelcomePage({ searchParams }: { searchParams?: Promise<{ selected?: string }> }) {
  const userId = await getGrowthMinuteUserId();
  if (!userId) redirect("/login");
  const selected = (await searchParams)?.selected;
  const selectedChoice = selected === "growth" || selected === "cash" || selected === "both" ? selected : null;
  let savedChoice: "growth" | "cash" | "both" | null = null;
  const [preference] = await getDb().select().from(userPreferences).where(eq(userPreferences.ownerId, userId)).limit(1);
  const value = preference?.productAccess;
  savedChoice = value === "growth" || value === "cash" || value === "both" ? value : null;
  return <ProductChoice
    initialChoice={selectedChoice ?? savedChoice}
  />;
}
