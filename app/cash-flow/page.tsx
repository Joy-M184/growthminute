import { requireChatGPTUser } from "../chatgpt-auth";
import CashFlowApp from "./cash-flow-app";
import { getDb } from "@/db";
import { userPreferences } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CashFlowPage() {
  const user = await requireChatGPTUser("/cash-flow");
  const [preference] = await getDb().select().from(userPreferences).where(eq(userPreferences.ownerId, user.id)).limit(1);
  if (!preference || (preference.productAccess !== "cash" && preference.productAccess !== "both")) redirect("/welcome");
  return <CashFlowApp displayName={user.fullName ?? user.email.split("@")[0]} productAccess={preference.productAccess} />;
}
