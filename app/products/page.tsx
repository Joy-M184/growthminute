import Link from "next/link";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Flower2, WalletCards, ArrowRight, Settings2 } from "lucide-react";
import { getDb } from "@/db";
import { userPreferences } from "@/db/schema";
import { getGrowthMinuteUserId } from "../growthminute-user";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const userId = await getGrowthMinuteUserId();
  if (!userId) redirect("/login");
  const [preference] = await getDb().select().from(userPreferences).where(eq(userPreferences.ownerId, userId)).limit(1);
  if (!preference) redirect("/welcome");
  if (preference.productAccess === "growth") redirect("/growth-plan");
  if (preference.productAccess === "cash") redirect("/cash-flow");
  return <main className="choice-shell products-shell">
    <header className="choice-brand"><span className="brand-mark"><Flower2 size={21} /></span><span>GrowthMinute</span><span className="choice-brand-actions"><Link href="/welcome"><Settings2 /> Change products</Link><form action="/auth/signout" method="post"><button type="submit">Sign out</button></form></span></header>
    <section className="products-heading"><p className="kicker">Your products</p><h1>Where would you like to begin?</h1></section>
    <section className="product-grid">
      <Link href="/growth-plan" className="product-card growth-product"><span className="product-icon"><Flower2 /></span><p className="kicker">Daily accountability</p><h2>Growth Plan</h2><p>Create a plan, complete your check-in or view your group’s progress.</p><b>Open Growth Plan <ArrowRight /></b></Link>
      <Link href="/cash-flow" className="product-card cash-product"><span className="product-icon"><WalletCards /></span><p className="kicker">Money clarity</p><h2>Cash Flow</h2><p>Record income and expenses, see your balance and get useful suggestions.</p><b>Open Cash Flow <ArrowRight /></b></Link>
    </section>
  </main>;
}
