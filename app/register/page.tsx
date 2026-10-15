"use client";

import Link from "next/link";
import { useState } from "react";
import { Field, SiteHeader } from "../ui";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to create account");
      window.location.assign("/resources");
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to create account"); }
    finally { setBusy(false); }
  }

  return <><SiteHeader /><main className="mx-auto w-full max-w-md px-5 py-16"><p className="text-sm font-semibold uppercase tracking-wider text-blue-700">Get started</p><h1 className="mt-2 text-3xl font-bold text-slate-950">Create your account</h1><p className="mt-2 text-slate-600">A few details and you can start booking.</p><form onSubmit={submit} className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">{error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}<Field label="Full name" name="fullName" autoComplete="name" minLength={2} maxLength={100} required /><Field label="Email address" name="email" type="email" autoComplete="email" required /><label className="block text-sm font-medium text-slate-700">Organization role<select name="role" defaultValue="USER" required className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"><option value="USER">Member</option><option value="MANAGER">Manager</option><option value="COORDINATOR">Coordinator</option><option value="STAFF">Staff</option><option value="VIEWER">Viewer</option></select></label><Field label="Password" name="password" type="password" autoComplete="new-password" minLength={8} required /><button disabled={busy} className="w-full rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60">{busy ? "Creating account..." : "Create account"}</button><p className="text-center text-sm text-slate-600">Already registered? <Link href="/login" className="font-semibold text-blue-700">Sign in</Link></p></form></main></>;
}
