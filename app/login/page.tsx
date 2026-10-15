"use client";

import Link from "next/link";
import { useState } from "react";
import { Field, SiteHeader } from "../ui";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to sign in");
      const next = new URLSearchParams(window.location.search).get("next");
      window.location.assign(next?.startsWith("/") && !next.startsWith("//") ? next : "/resources");
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to sign in"); }
    finally { setBusy(false); }
  }

  return <><SiteHeader /><main className="mx-auto w-full max-w-md px-5 py-16"><p className="text-sm font-semibold uppercase tracking-wider text-blue-700">Welcome back</p><h1 className="mt-2 text-3xl font-bold text-slate-950">Sign in to ReserveHub</h1><p className="mt-2 text-slate-600">Manage your resource bookings in one place.</p><form onSubmit={submit} className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">{error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}<Field label="Email address" name="email" type="email" autoComplete="email" required /><Field label="Password" name="password" type="password" autoComplete="current-password" required /><button disabled={busy} className="w-full rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60">{busy ? "Signing in..." : "Sign in"}</button><p className="text-center text-sm text-slate-600">New here? <Link href="/register" className="font-semibold text-blue-700">Create an account</Link></p></form></main></>;
}
