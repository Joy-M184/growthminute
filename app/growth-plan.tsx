"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BarChart3, Check, Copy, Flower2, Link2, Loader2, Plus, Sparkles, Trash2, Users, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

type Plan = { id: number; code: string; title: string; planDate: string; items: string[] };
type Dashboard = { plan: { title: string; planDate: string; code: string }; average: number; submissions: Array<{ id: number; participantName: string; completedCount: number; totalCount: number; percentage: number; reflection: string; createdAt: string }> };

const SAMPLE_ITEMS = [
  "Empowerment Hour at 6:00 a.m.",
  "Kingdom Prayers",
  "Read Ephesians 2",
  "Meditate on Philippians 4:6",
  "Listen to Authority of God’s Word",
];

function today() {
  return new Intl.DateTimeFormat("en-CA").format(new Date());
}

function extractTasks(source: string) {
  const ignored = /^(name:|https?:\/\/|kindly share|happy new month|submit your growth plan|have an awesome day|for daily inspiration)/i;
  const emojiOnly = /^[\p{Emoji_Presentation}\p{Extended_Pictographic}\s_*.-]+$/u;
  const candidates = source.split(/\r?\n/)
    .map((line) => line.trim().replace(/^[-•–—]\s*/, "").replace(/\*/g, ""))
    .filter((line) => line.length > 2 && !ignored.test(line) && !emojiOnly.test(line));
  const tasks = candidates.filter((line) => /^(empowerment|kingdom|bible|meditation|listen|book reading|redeem|join|prayer|read|watch|exercise|journal|reflect)/i.test(line));
  return [...new Set(tasks)].slice(0, 20);
}

export default function GrowthPlanApp() {
  const [tab, setTab] = useState("check-in");
  const [source, setSource] = useState("");
  const [title, setTitle] = useState("Today’s Growth Plan");
  const [planDate, setPlanDate] = useState(today());
  const [draftItems, setDraftItems] = useState<string[]>([]);
  const [publishedUrl, setPublishedUrl] = useState("");
  const [dashboardUrl, setDashboardUrl] = useState("");
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [name, setName] = useState("");
  const [checked, setChecked] = useState<number[]>([]);
  const [reflection, setReflection] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("plan");
    if (!code) return;
    setLoadingPlan(true);
    fetch(`/api/plans/${encodeURIComponent(code)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("This plan could not be found.");
        return response.json();
      })
      .then(({ plan: loadedPlan }) => { setPlan(loadedPlan); setTab("check-in"); })
      .catch((error) => toast.error(error.message))
      .finally(() => setLoadingPlan(false));
  }, []);

  useEffect(() => {
    const key = new URLSearchParams(window.location.search).get("manage");
    if (!key) return;
    setLoadingDashboard(true);
    fetch(`/api/manage/${encodeURIComponent(key)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "This dashboard could not be opened.");
        return data;
      })
      .then(({ dashboard: loadedDashboard }) => { setDashboard(loadedDashboard); setTab("responses"); })
      .catch((error) => toast.error(error.message))
      .finally(() => setLoadingDashboard(false));
  }, []);

  const items = plan?.items ?? SAMPLE_ITEMS;
  const progress = items.length ? Math.round((checked.length / items.length) * 100) : 0;
  const completedLabel = useMemo(() => `${checked.length} of ${items.length} complete`, [checked.length, items.length]);

  function makeChecklist() {
    const tasks = extractTasks(source);
    if (!tasks.length) return toast.error("Add a few activities, one per line, then try again.");
    setDraftItems(tasks);
    toast.success(`${tasks.length} activities found. You can edit them below.`);
  }

  async function publishPlan() {
    const cleanItems = draftItems.map((item) => item.trim()).filter(Boolean);
    if (!cleanItems.length) return toast.error("Add at least one activity.");
    setPublishing(true);
    try {
      const response = await fetch("/api/plans", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ title, planDate, sourceText: source, items: cleanItems }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not publish this plan.");
      setPublishedUrl(`${window.location.origin}/growth-plan?plan=${data.plan.code}`);
      setDashboardUrl(`${window.location.origin}/growth-plan?manage=${data.plan.adminKey}`);
      toast.success("Your checklist is ready to share.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not publish this plan.");
    } finally { setPublishing(false); }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(publishedUrl);
    toast.success("Link copied.");
  }

  async function submitCheckIn() {
    if (!name.trim()) return toast.error("Please add your name.");
    if (!plan) return void toast("This is a sample. Open a shared plan link to submit your check-in.");
    setSubmitting(true);
    try {
      const response = await fetch(`/api/plans/${plan.code}/check-ins`, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ participantName: name, completed: checked, reflection }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not submit your check-in.");
      setSubmitted(true);
      toast.success("Check-in submitted. Well done!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit your check-in.");
    } finally { setSubmitting(false); }
  }

  return (
    <main className="app-shell">
      <Toaster position="top-center" richColors />
      <div className="top-glow" aria-hidden="true" />
      <header className="site-header">
        <Link className="brand" href="/" aria-label="GrowthMinute home"><span className="brand-mark"><Flower2 size={21} /></span><span>GrowthMinute</span></Link>
        <nav className="header-actions" aria-label="GrowthMinute tools"><a href="/welcome"><WalletCards size={17} /> Choose products</a><span className="speed-note">Grow in 60 seconds</span></nav>
      </header>

      <section className="workspace">
        <div className="intro">
          <span className="eyebrow"><Sparkles size={15} /> Simple daily accountability</span>
          <h1>Stay intentional, even on your busiest days.</h1>
          <p>Tick what you’ve done, share one thought, and get on with your day.</p>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="mode-switch three"><TabsTrigger value="check-in">Check-in</TabsTrigger><TabsTrigger value="create">Create</TabsTrigger><TabsTrigger value="responses">Responses</TabsTrigger></TabsList>

          <TabsContent value="check-in" className="mt-5">
            <section className="card checkin-card">
              {loadingPlan ? <div className="loading"><Loader2 className="animate-spin" /> Loading your plan…</div> : submitted ? (
                <div className="success-state">
                  <span className="success-icon"><Check size={30} /></span><p className="kicker">Check-in complete</p>
                  <h2>You showed up today, {name.trim()}.</h2><p>{progress}% complete. Progress matters more than perfection.</p>
                  <Button onClick={() => { setSubmitted(false); setChecked([]); setReflection(""); }} variant="outline">Start another check-in</Button>
                </div>
              ) : <>
                <div className="card-heading">
                  <div><p className="kicker">{plan ? new Date(`${plan.planDate}T12:00:00`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }) : "Sample plan"}</p><h2>{plan?.title ?? "Today’s Growth Plan"}</h2></div>
                  <div className="progress-badge"><strong>{progress}%</strong><span>{completedLabel}</span></div>
                </div>
                <div className="progress-track" aria-label={`${progress}% complete`}><span style={{ width: `${progress}%` }} /></div>
                <label className="field-label" htmlFor="participant-name">Your name</label>
                <Input id="participant-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Joy Michael" autoComplete="name" />
                <div className="task-list" aria-label="Growth activities">
                  {items.map((item, index) => {
                    const isChecked = checked.includes(index);
                    return <label key={`${item}-${index}`} className={`task ${isChecked ? "task-done" : ""}`}><Checkbox checked={isChecked} onCheckedChange={(value) => setChecked((current) => value ? [...current, index] : current.filter((entry) => entry !== index))} /><span>{item}</span></label>;
                  })}
                </div>
                <label className="field-label" htmlFor="reflection">One thought from today <span>(optional)</span></label>
                <Textarea id="reflection" value={reflection} onChange={(e) => setReflection(e.target.value)} placeholder="What stood out to you?" rows={3} />
                <Button className="primary-action" onClick={plan ? submitCheckIn : () => setTab("create")} disabled={submitting}>{submitting && <Loader2 className="animate-spin" />} {plan ? "Submit my check-in" : "Create a real plan"}</Button>
                {!plan && <p className="sample-note">This is a preview. Create a plan to generate a working link for your group.</p>}
              </>}
            </section>
          </TabsContent>

          <TabsContent value="create" className="mt-5">
            <section className="card creator-card">
              <div className="card-heading simple"><div><p className="kicker">For organisers</p><h2>Paste it. Check it. Share it.</h2></div></div>
              {!draftItems.length ? <>
                <label className="field-label" htmlFor="plan-text">Paste your itinerary or activity list</label>
                <Textarea id="plan-text" className="paste-box" value={source} onChange={(e) => setSource(e.target.value)} placeholder={"- Morning prayer at 6am\n- Read Ephesians 2\n- Listen to today’s podcast\n- Join Teams Connect by 8pm"} rows={11} />
                <Button className="primary-action" onClick={makeChecklist}><Sparkles /> Turn into a checklist</Button>
                <p className="sample-note">GrowthMinute finds the activities automatically. Nothing needs to be formatted perfectly.</p>
              </> : publishedUrl ? (
                <div className="share-state"><span className="success-icon"><Link2 size={28} /></span><p className="kicker">Ready to share</p><h2>Your daily plan is live.</h2><p>Send this link to your group. They can open it, tick their activities and submit.</p>
                  <div className="share-link"><span>{publishedUrl}</span><Button size="icon" onClick={copyLink} aria-label="Copy link"><Copy /></Button></div>
                  <div className="share-actions"><Button variant="outline" onClick={() => window.location.href = dashboardUrl}><BarChart3 /> View responses</Button><Button variant="ghost" onClick={() => { setPublishedUrl(""); setDashboardUrl(""); setDraftItems([]); setSource(""); }}>Create another plan</Button></div>
                </div>
              ) : <>
                <div className="two-fields"><div><label className="field-label" htmlFor="plan-title">Plan title</label><Input id="plan-title" value={title} onChange={(e) => setTitle(e.target.value)} /></div><div><label className="field-label" htmlFor="plan-date">Date</label><Input id="plan-date" type="date" value={planDate} onChange={(e) => setPlanDate(e.target.value)} /></div></div>
                <div className="editor-heading"><span>{draftItems.length} activities</span><Button variant="ghost" size="sm" onClick={() => setDraftItems([...draftItems, ""])}><Plus /> Add activity</Button></div>
                <div className="editor-list">{draftItems.map((item, index) => <div className="editor-row" key={index}><span>{index + 1}</span><Input value={item} onChange={(e) => setDraftItems(draftItems.map((current, itemIndex) => itemIndex === index ? e.target.value : current))} aria-label={`Activity ${index + 1}`} /><Button variant="ghost" size="icon" onClick={() => setDraftItems(draftItems.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Remove activity ${index + 1}`}><Trash2 /></Button></div>)}</div>
                <Button className="primary-action" onClick={publishPlan} disabled={publishing}>{publishing && <Loader2 className="animate-spin" />} Publish & get share link</Button>
                <Button variant="ghost" className="back-button" onClick={() => setDraftItems([])}>Back to pasted text</Button>
              </>}
            </section>
          </TabsContent>

          <TabsContent value="responses" className="mt-5">
            <section className="card dashboard-card">
              {loadingDashboard ? <div className="loading"><Loader2 className="animate-spin" /> Loading responses…</div> : dashboard ? <>
                <div className="card-heading"><div><p className="kicker">Organiser dashboard</p><h2>{dashboard.plan.title}</h2></div><div className="date-chip">{new Date(`${dashboard.plan.planDate}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</div></div>
                <div className="summary-grid"><div><span><Users size={18} /> Submissions</span><strong>{dashboard.submissions.length}</strong></div><div><span><BarChart3 size={18} /> Average progress</span><strong>{dashboard.average}%</strong></div></div>
                {dashboard.submissions.length ? <div className="table-wrap"><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Completed</TableHead><TableHead>Progress</TableHead><TableHead>Reflection</TableHead></TableRow></TableHeader><TableBody>{dashboard.submissions.map((entry) => <TableRow key={entry.id}><TableCell className="font-semibold">{entry.participantName}</TableCell><TableCell>{entry.completedCount}/{entry.totalCount}</TableCell><TableCell><span className="mini-progress">{entry.percentage}%</span></TableCell><TableCell className="reflection-cell">{entry.reflection || "—"}</TableCell></TableRow>)}</TableBody></Table></div> : <div className="empty-responses"><Users size={30} /><h3>No submissions yet</h3><p>Share the participant link. New check-ins will appear here.</p></div>}
              </> : <div className="empty-responses"><BarChart3 size={32} /><h2>Open your organiser link</h2><p>Your private response link is created whenever you publish a plan. Keep it safe—it gives access to participant responses.</p><Button onClick={() => setTab("create")}>Create a plan</Button></div>}
            </section>
          </TabsContent>
        </Tabs>
      </section>
      <footer>Made for real life, not perfect routines.</footer>
    </main>
  );
}
