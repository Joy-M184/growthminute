"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const supabase = createClient();

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) setMessage(error.message);
      else if (data.session) {
        router.push("/welcome");
        router.refresh();
      } else setMessage("Check your email to confirm your account, then return here to sign in.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else {
        router.push("/welcome");
        router.refresh();
      }
    }
    setBusy(false);
  }

  function switchMode() {
    setMode(mode === "signup" ? "signin" : "signup");
    setMessage("");
  }

  return <>
    <form className="auth-form" onSubmit={submit}>
      <label>Email address<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>
      <label>Password<input type="password" minLength={6} autoComplete={mode === "signup" ? "new-password" : "current-password"} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" /></label>
      <button className="choice-continue" type="submit" disabled={busy}>{busy ? "Please wait…" : mode === "signup" ? "Create my account" : "Sign in"}</button>
    </form>
    {message && <p className="auth-message" role="status">{message}</p>}
    <p className="auth-switch">{mode === "signup" ? "Already have an account?" : "New to GrowthMinute?"} <button type="button" onClick={switchMode}>{mode === "signup" ? "Sign in" : "Create an account"}</button></p>
  </>;
}
