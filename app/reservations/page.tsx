"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { SiteHeader } from "../ui";

type Reservation = {
  reservationId: number;
  quantity: number;
  startTime: string;
  endTime: string;
  status: string;
  Resource: { name: string; location: string };
};

export default function ReservationsPage() {
  const [items, setItems] = useState<Reservation[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/reservations");
      const result = await response.json();
      if (!response.ok || !result.success)
        throw new Error(result.message || "Unable to load reservations");
      setItems(result.data);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load reservations",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [load]);

  async function cancel(id: number) {
    setError("");
    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      const result = await response.json();
      if (!response.ok || !result.success)
        throw new Error(result.message || "Unable to cancel reservation");
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to cancel reservation",
      );
    }
  }
  const date = (value: string) =>
    new Date(value).toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-12">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
          Your schedule
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-950">
              My reservations
            </h1>
            <p className="mt-2 text-slate-600">
              Check booking details or cancel an upcoming reservation.
            </p>
          </div>
          <Link
            href="/resources"
            className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Find a resource
          </Link>
        </div>
        {error && (
          <div
            role="alert"
            className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {error}{" "}
            {error.includes("Authentication") && (
              <Link href="/login" className="font-semibold underline">
                Sign in
              </Link>
            )}
          </div>
        )}
        <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {loading ? (
            <p className="p-8 text-slate-500">Loading reservations...</p>
          ) : items.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-medium text-slate-800">No reservations yet</p>
              <p className="mt-1 text-sm text-slate-500">
                Browse available resources to get started.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-200">
              {items.map((item) => (
                <li
                  key={item.reservationId}
                  className="flex flex-wrap items-center justify-between gap-4 p-5"
                >
                  <div>
                    <h2 className="font-semibold text-slate-950">
                      {item.Resource.name}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.Resource.location}
                    </p>
                    <p className="mt-2 text-sm text-slate-700">
                      {date(item.startTime)} – {date(item.endTime)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.quantity} {item.quantity === 1 ? "unit" : "units"} reserved
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {item.status}
                    </span>
                    {["PENDING", "CONFIRMED"].includes(item.status) && (
                      <button
                        onClick={() => void cancel(item.reservationId)}
                        className="text-sm font-semibold text-red-700 hover:underline"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}
