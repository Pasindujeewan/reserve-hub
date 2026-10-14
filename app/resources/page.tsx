"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

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
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  const inputClass =
    "mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 text-gray-900 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-800 hover:underline"
        >
          <span aria-hidden="true">←</span> Back to home
        </Link>
        <header>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-blue-600">
                RESOURCE MANAGEMENT
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">Resources</h1>
              <p className="mt-2 text-sm text-gray-500">
                Create, manage, and monitor your resources.
              </p>
            </div>
            <a href="/categories" className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Manage categories
            </a>
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

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">
            {editingId !== null ? "Edit resource" : "Create resource"}
          </h2>

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
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold">All resources</h2>
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

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Resource</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Capacity</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-gray-500"
                    >
                      Loading resources...
                    </td>
                  </tr>
                ) : resources.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-gray-500"
                    >
                      No resources found.
                    </td>
                  </tr>
                ) : (
                  resources.map((resource) => (
                    <tr key={resource.resourceId} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <p className="font-medium">{resource.name}</p>
                        <p className="mt-1 text-xs text-gray-500">
                          ID: {resource.resourceId}
                        </p>
                      </td>
                      <td className="px-4 py-4">{resource.resourceType}</td>
                      <td className="px-4 py-4">{resource.location}</td>
                      <td className="px-4 py-4">{resource.capacity}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            resource.status === "AVAILABLE"
                              ? "bg-green-100 text-green-700"
                              : resource.status === "MAINTENANCE"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {resource.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => editResource(resource)}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            Edit
                          </button>

                          {resource.status !== "INACTIVE" && (
                            <button
                              type="button"
                              onClick={() =>
                                deactivateResource(resource.resourceId)
                              }
                              className="font-medium text-red-600 hover:underline"
                            >
                              Deactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
