import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { userPreferences } from "@/db/schema";
import { chatGPTSignInPath, getChatGPTUser } from "../chatgpt-auth";
import ProductChoice from "./product-choice";

export const dynamic = "force-dynamic";

export default async function WelcomePage({ searchParams }: { searchParams?: Promise<{ selected?: string }> }) {
  const user = await getChatGPTUser();
  const selected = (await searchParams)?.selected;
  const selectedChoice = selected === "growth" || selected === "cash" || selected === "both" ? selected : null;
  let savedChoice: "growth" | "cash" | "both" | null = null;
  if (user) {
    const [preference] = await getDb().select().from(userPreferences).where(eq(userPreferences.ownerId, user.id)).limit(1);
    const value = preference?.productAccess;
    savedChoice = value === "growth" || value === "cash" || value === "both" ? value : null;
  }
  return <ProductChoice
    initialChoice={selectedChoice ?? savedChoice}
    name={user ? (user.fullName?.split(" ")[0] ?? user.email.split("@")[0]) : null}
    signedIn={Boolean(user)}
    signInPaths={{ growth: chatGPTSignInPath("/welcome?selected=growth"), cash: chatGPTSignInPath("/welcome?selected=cash"), both: chatGPTSignInPath("/welcome?selected=both") }}
  />;
}
