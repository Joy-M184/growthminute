import { Flower2 } from "lucide-react";
import { redirect } from "next/navigation";
import { getGrowthMinuteUserId } from "../growthminute-user";
import AuthForm from "./auth-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getGrowthMinuteUserId()) redirect("/welcome");

  return <main className="choice-shell auth-shell">
    <header className="choice-brand"><span className="brand-mark"><Flower2 size={21} /></span><span>GrowthMinute</span></header>
    <section className="choice-card auth-card">
      <p className="kicker">One minute. Real momentum.</p>
      <h1>Welcome to GrowthMinute</h1>
      <p className="choice-intro">Create your account or sign in directly with your email. No ChatGPT account required.</p>
      <AuthForm />
    </section>
  </main>;
}
