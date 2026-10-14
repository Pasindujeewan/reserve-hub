import Link from "next/link";
import { SiteHeader } from "./ui";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <SiteHeader />

      {/* Hero */}
      <section className="bg-slate-50">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              RESOURCE RESERVATION SYSTEM
            </p>

            <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl">
              Manage your shared resources in one place.
            </h1>

            <p className="mt-6 max-w-lg leading-7 text-slate-600">
              Check resource availability, make reservations, and keep track of
              your bookings without scheduling conflicts.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/browse"
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Browse resources
              </Link>

              <Link
                href="/register"
                className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-semibold hover:bg-slate-100"
              >
                Create account
              </Link>
            </div>
          </div>

          {/* Simple visual */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-bold">What you can do</h2>

            <div className="mt-6 space-y-5">
              <div className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-700">
                  1
                </span>
                <div>
                  <h3 className="font-semibold">View resources</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    See available resources and their details.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-700">
                  2
                </span>
                <div>
                  <h3 className="font-semibold">Check availability</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Choose a suitable date and time.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-700">
                  3
                </span>
                <div>
                  <h3 className="font-semibold">Manage reservations</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    View and manage your bookings in one place.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main features */}
      <section className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-3xl font-bold">Simple resource booking</h2>

        <p className="mt-3 max-w-2xl leading-7 text-slate-600">
          Reserve Hub helps keep resource information and reservations
          organized, so users can check availability before booking.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold">Resource Details</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              View resource names, locations, types, and capacities.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold">Availability</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Check whether a resource is available for your chosen time.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold">Reservations</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Review your booking details and cancel when needed.
            </p>
          </div>

          <Link href="/resources" className="rounded-xl border border-slate-200 p-6 transition hover:border-blue-300 hover:bg-blue-50">
            <h3 className="text-lg font-bold">Resource management</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">Manage the resource list and availability.</p>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-bold">
            Reserve<span className="text-blue-600">Hub</span>
          </p>

          <p className="text-sm text-slate-500">
            Resource reservation and management.
          </p>

          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Reserve Hub
          </p>
        </div>
      </footer>
    </main>
  );
}
