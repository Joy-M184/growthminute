"use client";

import { useEffect } from "react";
import { Flower2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="choice-shell">
      <header className="choice-brand">
        <span className="brand-mark"><Flower2 size={21} /></span>
        <span>GrowthMinute</span>
      </header>
      <section className="choice-card" style={{ textAlign: "center" }}>
        <p className="kicker">Something went wrong</p>
        <h1>That didn’t work as expected.</h1>
        <p className="choice-intro">Please try again. If this keeps happening, come back in a few minutes.</p>
        <Button className="primary-action" onClick={() => reset()} style={{ maxWidth: 260, margin: "22px auto 0" }}>
          <RotateCcw /> Try again
        </Button>
      </section>
    </main>
  );
}
