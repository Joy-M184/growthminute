import { redirect } from "next/navigation";
import { getGrowthMinuteUserId } from "./growthminute-user";

export const dynamic = "force-dynamic";

export default async function Home() {
  redirect((await getGrowthMinuteUserId()) ? "/welcome" : "/login");
}
