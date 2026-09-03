import GrowthPlanApp from "../growth-plan";
import { redirect } from "next/navigation";
import { getGrowthMinuteUserId } from "../growthminute-user";

export const dynamic = "force-dynamic";

export default async function GrowthPlanPage({ searchParams }: { searchParams?: Promise<{ plan?: string; manage?: string }> }) {
  const { plan, manage } = (await searchParams) ?? {};
  if (!plan && !manage && !(await getGrowthMinuteUserId())) redirect("/login");
  return <GrowthPlanApp />;
}
