"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownRight, ArrowLeft, ArrowUpRight, BriefcaseBusiness, CircleAlert, Flower2, Lightbulb, Loader2, PiggyBank, Plus, ReceiptText, Settings2, Trash2, TrendingUp, UserRound, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

type Mode = "personal" | "business";
type Kind = "income" | "expense";
type Transaction = { id: number; mode: Mode; type: Kind; amountPence: number; category: string; note: string; transactionDate: string };
type Suggestion = { title: string; detail: string; tone: "good" | "watch" | "action"; icon: typeof Lightbulb };

const categories: Record<Mode, Record<Kind, string[]>> = {
  personal: { income: ["Salary", "Side income", "Gift", "Refund", "Other income"], expense: ["Housing", "Food", "Transport", "Bills", "Family", "Health", "Shopping", "Other expense"] },
  business: { income: ["Sales", "Services", "Invoice paid", "Investment", "Other income"], expense: ["Stock", "Software", "Marketing", "Travel", "Suppliers", "Tax", "Payroll", "Other expense"] },
};

function money(pence: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(pence / 100);
}

function isoToday() { return new Date().toISOString().slice(0, 10); }

export default function CashFlowApp({ displayName, productAccess }: { displayName: string; productAccess: string }) {
  const [mode, setMode] = useState<Mode>("personal");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [kind, setKind] = useState<Kind>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(categories.personal.expense[0]);
  const [date, setDate] = useState(isoToday());
  const [note, setNote] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/cash-flow?mode=${mode}`)
      .then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error); return data; })
      .then((data) => setTransactions(data.transactions))
      .catch((error) => toast.error(error.message ?? "Could not load your cash flow."))
      .finally(() => setLoading(false));
  }, [mode]);

  const summary = useMemo(() => transactions.reduce((total, item) => {
    if (item.type === "income") total.income += item.amountPence; else total.expense += item.amountPence;
    return total;
  }, { income: 0, expense: 0 }), [transactions]);

  const expenseBars = useMemo(() => {
    const grouped = new Map<string, number>();
    transactions.filter((item) => item.type === "expense").forEach((item) => grouped.set(item.category, (grouped.get(item.category) ?? 0) + item.amountPence));
    const rows = [...grouped.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
    const max = Math.max(...rows.map(([, value]) => value), 1);
    return rows.map(([label, value]) => ({ label, value, width: Math.max(8, Math.round(value / max * 100)) }));
  }, [transactions]);

  const suggestions = useMemo<Suggestion[]>(() => {
    if (!transactions.length) return [{
      title: "Start with what happened today",
      detail: "Add your latest income and expense. Your suggestions will become more personal as you record more activity.",
      tone: "action",
      icon: Lightbulb,
    }];

    const balance = summary.income - summary.expense;
    const savingRate = summary.income > 0 ? Math.round((balance / summary.income) * 100) : 0;
    const topExpense = expenseBars[0];
    const insights: Suggestion[] = [];

    if (summary.income === 0) {
      insights.push({ title: "Add your income", detail: "You have recorded spending but no money in yet. Add your income to see your true available balance.", tone: "action", icon: TrendingUp });
    } else if (balance < 0) {
      insights.push({ title: "Spending is above income", detail: `You are ${money(Math.abs(balance))} over your recorded income. Review non-essential spending before adding another expense.`, tone: "watch", icon: CircleAlert });
    } else if (savingRate >= 20) {
      insights.push({ title: "You are keeping a healthy share", detail: `You have kept ${savingRate}% of your recorded income. Consider moving part of the balance into a separate savings pot.`, tone: "good", icon: PiggyBank });
    } else {
      insights.push({ title: "Protect a little of what is left", detail: `You have ${money(balance)} remaining. Set aside a small amount before planning your next expense.`, tone: "action", icon: PiggyBank });
    }

    if (topExpense && summary.expense > 0) {
      const share = Math.round((topExpense.value / summary.expense) * 100);
      if (share >= 35) insights.push({ title: `Review ${topExpense.label}`, detail: `${topExpense.label} makes up ${share}% of your recorded spending. Check whether any part can be reduced next time.`, tone: "watch", icon: CircleAlert });
      else insights.push({ title: "Your spending is spread out", detail: `${topExpense.label} is currently your largest category at ${share}% of expenses. Keep recording to spot a clearer pattern.`, tone: "good", icon: TrendingUp });
    }

    insights.push(mode === "business"
      ? { title: "Keep tax money separate", detail: "Consider moving part of each business payment into a separate tax pot so it is not mistaken for spendable cash.", tone: "action", icon: PiggyBank }
      : { title: "Build your safety buffer", detail: "Use part of any monthly surplus to build an emergency fund, even if you start with a small amount.", tone: "action", icon: PiggyBank });

    return insights.slice(0, 3);
  }, [expenseBars, mode, summary.expense, summary.income, transactions.length]);

  function chooseMode(next: Mode) { setMode(next); setCategory(categories[next][kind][0]); }
  function chooseKind(next: Kind) { setKind(next); setCategory(categories[mode][next][0]); }

  async function addTransaction(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/cash-flow", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ mode, type: kind, amount: Number(amount), category, note, transactionDate: date }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setTransactions((current) => [data.transaction, ...current]);
      setAmount(""); setNote(""); setOpen(false);
      toast.success(`${kind === "income" ? "Income" : "Expense"} added.`);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save this transaction."); }
    finally { setSaving(false); }
  }

  async function removeTransaction(id: number) {
    const response = await fetch(`/api/cash-flow?id=${id}`, { method: "DELETE" });
    if (response.ok) { setTransactions((current) => current.filter((item) => item.id !== id)); toast.success("Transaction removed."); }
    else toast.error("Could not remove this transaction.");
  }

  return <main className="cash-shell">
    <Toaster position="top-center" richColors />
    <header className="cash-header">
      <Link className="brand" href="/"><span className="brand-mark"><Flower2 size={21} /></span><span>GrowthMinute</span></Link>
      {productAccess === "both" ? <Link className="back-link" href="/products"><ArrowLeft size={17} /> My products</Link> : <Link className="back-link" href="/welcome"><Settings2 size={17} /> Product settings</Link>}
    </header>

    <section className="cash-workspace">
      <div className="cash-welcome"><div><p className="kicker">Cash Flow</p><h1>Good day, {displayName}.</h1><p>See what came in, what went out, and what is left.</p></div>
        <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button className="add-money"><Plus /> Add transaction</Button></DialogTrigger>
          <DialogContent className="cash-dialog"><DialogHeader><DialogTitle>Add a transaction</DialogTitle><DialogDescription>Record money in or money out in a few seconds.</DialogDescription></DialogHeader>
            <form onSubmit={addTransaction}>
              <div className="kind-switch"><button type="button" className={kind === "income" ? "active" : ""} onClick={() => chooseKind("income")}><ArrowDownRight /> Money in</button><button type="button" className={kind === "expense" ? "active expense" : ""} onClick={() => chooseKind("expense")}><ArrowUpRight /> Money out</button></div>
              <label className="field-label" htmlFor="cash-amount">Amount</label><div className="money-input"><span>£</span><Input id="cash-amount" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required /></div>
              <label className="field-label">Category</label><Select value={category} onValueChange={(value) => setCategory(value ?? categories[mode][kind][0])}><SelectTrigger className="cash-select"><SelectValue /></SelectTrigger><SelectContent>{categories[mode][kind].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>
              <div className="cash-form-grid"><div><label className="field-label" htmlFor="cash-date">Date</label><Input id="cash-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required /></div><div><label className="field-label" htmlFor="cash-note">Note <span>(optional)</span></label><Input id="cash-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="What was it for?" /></div></div>
              <Button className="primary-action" type="submit" disabled={saving}>{saving && <Loader2 className="animate-spin" />} Save transaction</Button>
            </form>
          </DialogContent></Dialog>
      </div>

      <div className="account-switch" role="group" aria-label="Cash-flow account"><button className={mode === "personal" ? "active" : ""} onClick={() => chooseMode("personal")}><UserRound /> Personal</button><button className={mode === "business" ? "active" : ""} onClick={() => chooseMode("business")}><BriefcaseBusiness /> Business</button></div>

      <section className="balance-card"><span>Available balance</span><strong>{money(summary.income - summary.expense)}</strong><div><span><ArrowDownRight /> Money in <b>{money(summary.income)}</b></span><span><ArrowUpRight /> Money out <b>{money(summary.expense)}</b></span></div></section>

      <div className="cash-grid">
        <section className="cash-panel"><div className="panel-heading"><div><p className="kicker">Overview</p><h2>Where your money went</h2></div><WalletCards /></div>
          {loading ? <div className="cash-loading"><Loader2 className="animate-spin" /> Loading…</div> : expenseBars.length ? <div className="expense-bars">{expenseBars.map((row) => <div key={row.label}><div><span>{row.label}</span><b>{money(row.value)}</b></div><i><span style={{ width: `${row.width}%` }} /></i></div>)}</div> : <div className="cash-empty compact"><WalletCards /><p>Add an expense to see your spending breakdown.</p></div>}
        </section>
        <section className="cash-panel recent-panel"><div className="panel-heading"><div><p className="kicker">Recent</p><h2>Transactions</h2></div><ReceiptText /></div>
          {loading ? <div className="cash-loading"><Loader2 className="animate-spin" /> Loading…</div> : transactions.length ? <div className="transaction-list">{transactions.slice(0, 8).map((item) => <div className="transaction" key={item.id}><span className={`transaction-icon ${item.type}`}>{item.type === "income" ? <ArrowDownRight /> : <ArrowUpRight />}</span><div><strong>{item.category}</strong><small>{new Date(`${item.transactionDate}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}{item.note ? ` · ${item.note}` : ""}</small></div><b className={item.type}>{item.type === "income" ? "+" : "−"}{money(item.amountPence)}</b><AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" aria-label={`Remove ${item.category}`}><Trash2 /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Remove this transaction?</AlertDialogTitle><AlertDialogDescription>This will permanently remove {item.category} for {money(item.amountPence)}.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Keep it</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={() => removeTransaction(item.id)}>Remove</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div>)}</div> : <div className="cash-empty"><ReceiptText /><h3>No transactions yet</h3><p>Tap “Add transaction” to record your first money movement.</p></div>}
        </section>
      </div>
      <section className="suggestions-panel" aria-labelledby="suggestions-title">
        <div className="suggestions-heading"><div><p className="kicker">Suggestions</p><h2 id="suggestions-title">Your next smart moves</h2></div><Lightbulb aria-hidden="true" /></div>
        <div className="suggestions-list">
          {suggestions.map((suggestion) => {
            const Icon = suggestion.icon;
            return <article className={`suggestion ${suggestion.tone}`} key={suggestion.title}>
              <span className="suggestion-icon"><Icon aria-hidden="true" /></span>
              <div><h3>{suggestion.title}</h3><p>{suggestion.detail}</p></div>
            </article>;
          })}
        </div>
        <p className="suggestions-note">Suggestions are based only on the entries shown here and are general guidance, not financial advice.</p>
      </section>
      <p className="privacy-note">Your cash-flow entries are private to your signed-in account.</p>
    </section>
  </main>;
}
