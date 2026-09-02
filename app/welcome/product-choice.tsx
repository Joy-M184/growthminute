"use client";

import { useState } from "react";
import { Check, Flower2, Loader2, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

type Choice = "growth" | "cash" | "both";

const products = [
  { value: "growth" as const, title: "Growth Plan only", description: "Create daily plans, check in and view group responses.", icon: Flower2 },
  { value: "cash" as const, title: "Cash Flow only", description: "Track money in, money out and receive helpful suggestions.", icon: WalletCards },
  { value: "both" as const, title: "Both products", description: "Use Growth Plan and Cash Flow from one GrowthMinute account.", icon: Check },
];

export default function ProductChoice({ initialChoice, name, signedIn, signInPaths }: { initialChoice: Choice | null; name: string | null; signedIn: boolean; signInPaths: Record<Choice, string> }) {
  const [choice, setChoice] = useState<Choice | null>(initialChoice);
  const [saving, setSaving] = useState(false);

  async function continueToProduct() {
    if (!choice) return toast.error("Please choose how you want to use GrowthMinute.");
    setSaving(true);
    try {
      const response = await fetch("/api/preferences", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ productAccess: choice }) });
      if (!response.ok) throw new Error("Your choice could not be saved.");
      window.location.assign(choice === "cash" ? "/cash-flow" : choice === "growth" ? "/growth-plan" : "/products");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Please try again."); setSaving(false); }
  }

  return <main className="choice-shell">
    <Toaster position="top-center" richColors />
    <header className="choice-brand"><span className="brand-mark"><Flower2 size={21} /></span><span>GrowthMinute</span></header>
    <section className="choice-card">
      <p className="kicker">{name ? `Welcome, ${name}` : "Welcome to GrowthMinute"}</p>
      <h1>What would you like to use?</h1>
      <p className="choice-intro">Choose one product or keep both. You can change this later.</p>
      <div className="product-options" role="radiogroup" aria-label="Choose your GrowthMinute products">
        {products.map(({ value, title, description, icon: Icon }) => <button key={value} type="button" role="radio" aria-checked={choice === value} className={choice === value ? "selected" : ""} onClick={() => setChoice(value)}>
          <span className="product-icon"><Icon /></span><span><strong>{title}</strong><small>{description}</small></span><span className="choice-tick"><Check /></span>
        </button>)}
      </div>
      {signedIn ? <Button className="primary-action" onClick={continueToProduct} disabled={!choice || saving}>{saving && <Loader2 className="animate-spin" />} Continue</Button> : choice ? <a className="choice-continue" href={signInPaths[choice]} target="_top">Continue</a> : <button className="choice-continue disabled" type="button" disabled>Continue</button>}
      <p className="choice-note">Each product works independently under the GrowthMinute brand.</p>
    </section>
  </main>;
}
