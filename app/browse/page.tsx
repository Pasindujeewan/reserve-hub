"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Field, SiteHeader } from "../ui";

type Resource = { resourceId: number; name: string; description: string | null; resourceType: string; location: string; capacity: number; status: string };

export default function BrowsePage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Resource | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  useEffect(() => { fetch("/api/resources?status=AVAILABLE").then(async (response) => { const result = await response.json(); if (!response.ok || !result.success) throw new Error(result.message || "Unable to load resources"); setResources(result.data); }).catch((err: unknown) => setError(err instanceof Error ? err.message : "Unable to load resources")).finally(() => setLoading(false)); }, []);

  async function reserve(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!selected) return; setBusy(true); setError("");
    try {
      const response = await fetch("/api/reservations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resourceId: selected.resourceId, startTime: new Date(startTime).toISOString(), endTime: new Date(endTime).toISOString() }) });
      const result = await response.json(); if (!response.ok || !result.success) throw new Error(result.message || "Unable to reserve resource");
      window.location.assign("/reservations");
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to reserve resource"); }
    finally { setBusy(false); }
  }

  return <><SiteHeader /><main className="mx-auto max-w-6xl px-5 py-12"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-wider text-blue-700">Find a space</p><h1 className="mt-2 text-3xl font-bold text-slate-950">Available resources</h1><p className="mt-2 text-slate-600">Choose a resource and the time you need it.</p></div><Link href="/reservations" className="text-sm font-semibold text-blue-700 hover:underline">View my reservations →</Link></div>
    {error && <p role="alert" className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {loading ? <p className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-slate-600">Loading available resources...</p> : resources.length === 0 && !error ? <p className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-slate-600">No resources are available right now.</p> : <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{resources.map((resource) => <article key={resource.resourceId} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-semibold text-slate-950">{resource.name}</h2><p className="mt-1 text-sm text-slate-500">{resource.resourceType}</p></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">Available</span></div><p className="mt-4 text-sm text-slate-600">{resource.description || "Ready for your next reservation."}</p><p className="mt-4 text-sm text-slate-500">{resource.location} · Capacity {resource.capacity}</p><button onClick={() => { setSelected(resource); setError(""); }} className="mt-5 w-full rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">Reserve</button></article>)}</div>}
    {selected && <div className="fixed inset-0 z-10 flex items-center justify-center bg-slate-950/40 p-4" role="presentation"><section role="dialog" aria-modal="true" aria-labelledby="reserve-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"><div className="flex items-start justify-between"><div><p className="text-sm text-blue-700">New reservation</p><h2 id="reserve-title" className="mt-1 text-xl font-bold">{selected.name}</h2></div><button aria-label="Close" onClick={() => setSelected(null)} className="text-2xl leading-none text-slate-400">×</button></div><form onSubmit={reserve} className="mt-5 space-y-4">{error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}<Field label="Starts" type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required /><Field label="Ends" type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} required /><p className="text-xs text-slate-500">Sign in is required to place a reservation.</p><button disabled={busy} className="w-full rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white disabled:opacity-60">{busy ? "Submitting..." : "Confirm reservation"}</button></form></section></div>}
  </main></>;
}
