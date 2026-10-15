"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CurrentUser = { fullName: string; email: string };

export function SiteHeader() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (response) => {
        if (!response.ok) return;
        const result = await response.json();
        if (result.success) setUser(result.data as CurrentUser);
      })
      .catch(() => setUser(null))
      .finally(() => setCheckingSession(false));
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.assign("/");
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-5 py-4">
        <Link href="/" className="shrink-0 text-xl font-bold tracking-tight text-slate-950">
          Reserve<span className="text-blue-600">Hub</span>
        </Link>
        <div className="order-3 flex w-full flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-3 text-sm font-medium text-slate-600 sm:order-none sm:w-auto sm:border-0 sm:pt-0">
          <Link href="/resources" className="transition-colors hover:text-blue-700">Browse resources</Link>
          <Link href="/reservations" className="transition-colors hover:text-blue-700">My reservations</Link>
        </div>
        <div className="ml-auto flex min-w-0 items-center gap-3 text-sm sm:ml-0">
          {user ? (
            <>
              <span className="max-w-40 truncate font-medium text-slate-700" title={user.fullName}>Hello, {user.fullName.split(" ")[0]}</span>
              <button type="button" onClick={() => void logout()} className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 font-medium text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">Sign out</button>
            </>
          ) : checkingSession ? (
            <span className="text-slate-400">Checking...</span>
          ) : (
            <Link href="/login" className="shrink-0 rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-800">Sign in</Link>
          )}
        </div>
      </nav>
    </header>
  );
}

export function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <input {...props} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
    </label>
  );
}
