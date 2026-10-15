"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "../ui";

type ResourceStatus = "AVAILABLE" | "MAINTENANCE" | "INACTIVE";

type Resource = {
  resourceId: number;
  name: string;
  description: string | null;
  resourceType: string;
  location: string;
  capacity: number;
  categoryId: number;
  status: ResourceStatus;
};

type Category = {
  categoryId: number;
  categoryName: string;
};

type ReservedPeriod = { startTime: string; endTime: string; status: string; quantity: number };

type ResourceForm = {
  name: string;
  description: string;
  resourceType: string;
  location: string;
  capacity: string;
  categoryId: string;
  status: ResourceStatus;
};

const emptyForm: ResourceForm = {
  name: "",
  description: "",
  resourceType: "",
  location: "",
  capacity: "1",
  categoryId: "",
  status: "AVAILABLE",
};

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoryError, setCategoryError] = useState("");
  const [form, setForm] = useState<ResourceForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [reservedPeriods, setReservedPeriods] = useState<ReservedPeriod[]>([]);
  const [periodsLoading, setPeriodsLoading] = useState(false);
  const [reservationError, setReservationError] = useState("");
  const [reservationBusy, setReservationBusy] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [quantity, setQuantity] = useState("1");

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch("/api/categories");
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load categories");
        }

        setCategories(result.data as Category[]);
      } catch (err) {
        setCategoryError(
          err instanceof Error ? err.message : "Failed to load categories",
        );
      } finally {
        setCategoriesLoading(false);
      }
    }

    void loadCategories();
  }, []);

  const loadResources = useCallback(async () => {
    setError("");

    try {
      const params = new URLSearchParams();

      if (search.trim()) params.set("search", search.trim());
      if (status) params.set("status", status);

      const response = await fetch(`/api/resources?${params.toString()}`);

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load resources");
      }

      setResources(result.data as Resource[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadResources();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadResources]);
  function updateField<K extends keyof ResourceForm>(
    field: K,
    value: ResourceForm[K],
  ) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setFormOpen(false);
  }

  function editResource(resource: Resource) {
    setEditingId(resource.resourceId);
    setForm({
      name: resource.name,
      description: resource.description ?? "",
      resourceType: resource.resourceType,
      location: resource.location,
      capacity: String(resource.capacity),
      categoryId: String(resource.categoryId),
      status: resource.status,
    });

    setError("");
    setMessage("");
    setFormOpen(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        ...form,
        capacity: Number(form.capacity),
        categoryId: Number(form.categoryId),
      };

      const response = await fetch(
        editingId !== null ? `/api/resources/${editingId}` : "/api/resources",
        {
          method: editingId !== null ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        const validationErrors = result.errors
          ? Object.values(result.errors).flat().join(", ")
          : "";

        throw new Error(validationErrors || result.message || "Request failed");
      }

      setMessage(
        editingId !== null
          ? "Resource updated successfully."
          : "Resource created successfully.",
      );

      resetForm();
      await loadResources();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function deactivateResource(id: number) {
    if (!window.confirm("Are you sure you want to deactivate this resource?")) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/resources/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to deactivate resource");
      }

      setMessage("Resource deactivated successfully.");
      await loadResources();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  async function showResource(resource: Resource) {
    setSelectedResource(resource);
    setReservedPeriods([]);
    setReservationError("");
    setStartTime("");
    setEndTime("");
    setQuantity("1");
    setPeriodsLoading(true);
    try {
      const response = await fetch(`/api/resources/${resource.resourceId}/availability`);
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load reserved periods");
      }
      setReservedPeriods(result.data as ReservedPeriod[]);
    } catch (err) {
      setReservationError(err instanceof Error ? err.message : "Unable to load reserved periods");
    } finally {
      setPeriodsLoading(false);
    }
  }

  async function reserveResource(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedResource) return;
    setReservationBusy(true);
    setReservationError("");
    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resourceId: selectedResource.resourceId,
          quantity: Number(quantity),
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to reserve resource");
      }
      setMessage("Reservation submitted successfully.");
      setSelectedResource(null);
      window.location.assign("/reservations");
    } catch (err) {
      setReservationError(err instanceof Error ? err.message : "Unable to reserve resource");
    } finally {
      setReservationBusy(false);
    }
  }

  function formatPeriod(value: string) {
    return new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
  }

  const requestedAvailableCapacity = (() => {
    if (!selectedResource || !startTime || !endTime) return null;
    const requestedStart = new Date(startTime).getTime();
    const requestedEnd = new Date(endTime).getTime();
    if (!Number.isFinite(requestedStart) || requestedEnd <= requestedStart) return null;

    const events = reservedPeriods
      .filter((period) => new Date(period.startTime).getTime() < requestedEnd && new Date(period.endTime).getTime() > requestedStart)
      .flatMap((period) => [
        { time: Math.max(requestedStart, new Date(period.startTime).getTime()), change: period.quantity },
        { time: Math.min(requestedEnd, new Date(period.endTime).getTime()), change: -period.quantity },
      ])
      .sort((a, b) => a.time - b.time || a.change - b.change);

    let inUse = 0;
    let peakInUse = 0;
    for (const event of events) {
      inUse += event.change;
      peakInUse = Math.max(peakInUse, inUse);
    }
    return Math.max(0, selectedResource.capacity - peakInUse);
  })();

  const inputClass =
    "mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <><SiteHeader /><main className="min-h-screen bg-gray-50 px-4 py-8 text-gray-900 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-blue-600">
                BROWSE & MANAGE RESOURCES
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">Resources</h1>
              <p className="mt-2 text-sm text-gray-500">
                Find a resource, review its details and reserved times, or manage the resource list.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/categories" className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Manage categories</Link>
              <button type="button" onClick={() => { resetForm(); setFormOpen(true); }} className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">Add resource</button>
            </div>
          </div>
        </header>

        {message && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {formOpen && <div className="fixed inset-0 z-20 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4" role="presentation"><section role="dialog" aria-modal="true" aria-labelledby="resource-form-title" className="my-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
          <div className="flex items-start justify-between gap-4"><div><h2 id="resource-form-title" className="text-lg font-semibold">
            {editingId !== null ? "Edit resource" : "Create resource"}
          </h2><p className="mt-1 text-sm text-gray-500">Enter the resource information below.</p></div><button type="button" aria-label="Close" onClick={resetForm} className="text-2xl leading-none text-gray-400 hover:text-gray-700">×</button></div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium">
                Resource name *
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  required
                  maxLength={100}
                  placeholder="Meeting Room A"
                />
              </label>

              <label className="text-sm font-medium">
                Resource type *
                <input
                  className={inputClass}
                  value={form.resourceType}
                  onChange={(e) => updateField("resourceType", e.target.value)}
                  required
                  placeholder="Meeting Room"
                />
              </label>

              <label className="text-sm font-medium">
                Location *
                <input
                  className={inputClass}
                  value={form.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  required
                  placeholder="Building A, Floor 2"
                />
              </label>

              <label className="text-sm font-medium">
                Category *
                <select
                  className={inputClass}
                  value={form.categoryId}
                  onChange={(e) => updateField("categoryId", e.target.value)}
                  required
                  disabled={categoriesLoading || categories.length === 0}
                >
                  <option value="">
                    {categoriesLoading
                      ? "Loading categories..."
                      : categories.length === 0
                        ? "No categories available"
                        : "Select a category"}
                  </option>
                  {categories.map((category) => (
                    <option
                      key={category.categoryId}
                      value={category.categoryId}
                    >
                      {category.categoryName}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium">
                Capacity *
                <input
                  className={inputClass}
                  type="number"
                  min="1"
                  step="1"
                  value={form.capacity}
                  onChange={(e) => updateField("capacity", e.target.value)}
                  required
                />
              </label>

              <label className="text-sm font-medium">
                Status
                <select
                  className={inputClass}
                  value={form.status}
                  onChange={(e) =>
                    updateField("status", e.target.value as ResourceStatus)
                  }
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </label>
            </div>

            {categoryError ? (
              <p className="text-sm text-red-600" role="alert">
                Could not load categories: {categoryError}
              </p>
            ) : categories.length === 0 && !categoriesLoading ? (
              <p className="text-sm text-amber-700" role="status">
                Add a category before creating a resource.
              </p>
            ) : null}

            <label className="block text-sm font-medium">
              Description
              <textarea
                className={inputClass}
                rows={3}
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Enter a short description"
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={
                  saving || categoriesLoading || categories.length === 0
                }
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId !== null
                    ? "Update resource"
                    : "Create resource"}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section></div>}

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold">Resources</h2>
              <p className="mt-1 text-sm text-gray-500">
                {resources.length} resource(s) found
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                placeholder="Search resources..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All statuses</option>
                <option value="AVAILABLE">Available</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          {loading ? <p className="mt-5 p-10 text-center text-gray-500">Loading resources...</p> : resources.length === 0 ? <p className="mt-5 p-10 text-center text-gray-500">No resources found.</p> : <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{resources.map((resource) => <article key={resource.resourceId} className="rounded-xl border border-gray-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-sm"><button type="button" onClick={() => void showResource(resource)} className="block w-full text-left"><div className="flex items-start justify-between gap-3"><div><h3 className="text-lg font-semibold text-gray-900">{resource.name}</h3><p className="mt-1 text-sm text-gray-500">{resource.resourceType}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${resource.status === "AVAILABLE" ? "bg-green-100 text-green-700" : resource.status === "MAINTENANCE" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>{resource.status}</span></div><p className="mt-4 line-clamp-2 text-sm text-gray-600">{resource.description || "No description provided."}</p><p className="mt-3 text-sm text-gray-500">{resource.location} · Capacity {resource.capacity}</p><span className="mt-4 inline-block text-sm font-semibold text-blue-700">View details & reserve →</span></button><div className="mt-4 flex gap-4 border-t border-gray-100 pt-3"><button type="button" onClick={() => editResource(resource)} className="text-sm font-medium text-blue-700 hover:underline">Edit</button>{resource.status !== "INACTIVE" && <button type="button" onClick={() => void deactivateResource(resource.resourceId)} className="text-sm font-medium text-red-700 hover:underline">Deactivate</button>}</div></article>)}</div>}
        </section>
      </div>
    {selectedResource && <div className="fixed inset-0 z-30 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4" role="presentation"><section role="dialog" aria-modal="true" aria-labelledby="resource-details-title" className="my-auto max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Resource details</p><h2 id="resource-details-title" className="mt-1 text-2xl font-bold">{selectedResource.name}</h2></div><button type="button" aria-label="Close" onClick={() => setSelectedResource(null)} className="text-2xl leading-none text-gray-400">×</button></div><p className="mt-4 text-gray-600">{selectedResource.description || "No description provided."}</p><dl className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-gray-50 p-4 text-sm"><div><dt className="text-gray-500">Type</dt><dd className="mt-1 font-medium">{selectedResource.resourceType}</dd></div><div><dt className="text-gray-500">Location</dt><dd className="mt-1 font-medium">{selectedResource.location}</dd></div><div><dt className="text-gray-500">Capacity</dt><dd className="mt-1 font-medium">{selectedResource.capacity}</dd></div><div><dt className="text-gray-500">Status</dt><dd className="mt-1 font-medium">{selectedResource.status}</dd></div></dl><h3 className="mt-6 font-semibold">Already reserved</h3>{periodsLoading ? <p className="mt-2 text-sm text-gray-500">Loading reserved periods...</p> : reservedPeriods.length === 0 ? <p className="mt-2 text-sm text-gray-500">No upcoming reservations.</p> : <ul className="mt-2 max-h-36 space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-3 text-sm">{reservedPeriods.map((period, index) => <li key={`${period.startTime}-${index}`} className="flex flex-wrap justify-between gap-2"><span>{formatPeriod(period.startTime)} – {formatPeriod(period.endTime)}</span><span className="text-gray-500">{period.quantity} {period.quantity === 1 ? "unit" : "units"} · {period.status}</span></li>)}</ul>}{reservationError && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{reservationError}</p>}<form onSubmit={reserveResource} className="mt-6 space-y-4 border-t border-gray-200 pt-5"><h3 className="font-semibold">Reserve this resource</h3><p className="text-sm text-gray-500">Total capacity: {selectedResource.capacity} units.</p>{requestedAvailableCapacity !== null && <p className="text-sm font-medium text-blue-700">Available for selected time: {requestedAvailableCapacity} units</p>}<div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Starts<input className={inputClass} type="datetime-local" value={startTime} onChange={(event) => setStartTime(event.target.value)} required /></label><label className="text-sm font-medium">Ends<input className={inputClass} type="datetime-local" value={endTime} onChange={(event) => setEndTime(event.target.value)} required /></label><label className="text-sm font-medium">Required capacity (units)<input className={inputClass} type="number" min="1" max={requestedAvailableCapacity ?? selectedResource.capacity} step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} required /></label></div>{requestedAvailableCapacity !== null && Number(quantity) > requestedAvailableCapacity && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">Only {requestedAvailableCapacity} {requestedAvailableCapacity === 1 ? "unit is" : "units are"} available for this time. Choose fewer units or another time.</p>}<button type="submit" disabled={reservationBusy || periodsLoading || selectedResource.status !== "AVAILABLE" || (requestedAvailableCapacity !== null && Number(quantity) > requestedAvailableCapacity)} className="w-full rounded-lg bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50">{reservationBusy ? "Checking capacity..." : selectedResource.status === "AVAILABLE" ? "Reserve units" : "Resource unavailable"}</button></form></section></div>}</main></>
  );
}
