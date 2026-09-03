import Link from "next/link";
import { Flower2, Home } from "lucide-react";

export default function NotFound() {
  return (
    <main className="choice-shell">
      <header className="choice-brand">
        <span className="brand-mark"><Flower2 size={21} /></span>
        <span>GrowthMinute</span>
      </header>
      <section className="choice-card" style={{ textAlign: "center" }}>
        <p className="kicker">404</p>
        <h1>We couldn’t find that page.</h1>
        <p className="choice-intro">The link may be out of date, or the page may have moved.</p>
        <Link className="choice-continue" href="/welcome" style={{ display: "inline-flex", marginTop: 22 }}>
          <Home size={17} /> Back to GrowthMinute
        </Link>
      </section>
    </main>
  );
}
