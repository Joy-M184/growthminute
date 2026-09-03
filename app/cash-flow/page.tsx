import { getGrowthMinuteUserId } from "../growthminute-user";
import CashFlowApp from "./cash-flow-app";
import { getDb } from "@/db";
import { userPreferences } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CashFlowPage() {
  const userId = await getGrowthMinuteUserId();
  if (!userId) redirect("/login");
  const [preference] = await getDb().select().from(userPreferences).where(eq(userPreferences.ownerId, userId)).limit(1);
  if (!preference || (preference.productAccess !== "cash" && preference.productAccess !== "both")) redirect("/welcome");
  return <CashFlowApp displayName="there" productAccess={preference.productAccess} />;
}
