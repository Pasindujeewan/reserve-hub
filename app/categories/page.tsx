"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Category = { categoryId: number; categoryName: string; description: string | null };

const predefinedCategories = [
  { categoryName: "Meeting Rooms", description: "Rooms for meetings and collaboration." },
  { categoryName: "Vehicles", description: "Shared cars and other transport." },
  { categoryName: "Electronics", description: "Laptops, projectors, and other devices." },
  { categoryName: "Office Equipment", description: "Shared office tools and equipment." },
  { categoryName: "Event Spaces", description: "Spaces for events and group activities." },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState("");
  const [customName, setCustomName] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadCategories = useCallback(async () => {
    setError("");
    try {
      const response = await fetch("/api/categories");
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Could not load categories");
      setCategories(result.data as Category[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadCategories(); }, [loadCategories]);

  async function addCategory(category: (typeof predefinedCategories)[number]) {
    setAdding(category.categoryName);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(category),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Could not add category");
      setCategories((current) => [...current, result.data as Category].sort((a, b) => a.categoryName.localeCompare(b.categoryName)));
      setMessage(`${category.categoryName} added. You can now select it when creating a resource.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add category");
    } finally {
      setAdding("");
    }
  }

  async function addCustomCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const categoryName = customName.trim();
    if (!categoryName) return;
    if (existingNames.has(categoryName.toLowerCase())) {
      setError("A category with that name already exists.");
      return;
    }

    setAdding("custom");
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryName,
          description: customDescription.trim(),
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not add category");
      }
      setCategories((current) =>
        [...current, result.data as Category].sort((a, b) =>
          a.categoryName.localeCompare(b.categoryName),
        ),
      );
      setCustomName("");
      setCustomDescription("");
      setMessage(`${categoryName} added. You can now select it when creating a resource.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add category");
    } finally {
      setAdding("");
    }
  }

  const existingNames = new Set(categories.map((category) => category.categoryName.toLowerCase()));

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <Link href="/resources" className="text-sm font-medium text-blue-700 hover:underline">← Back to resources</Link>
        <header className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">Resource setup</p>
          <h1 className="mt-2 text-3xl font-bold">Categories</h1>
          <p className="mt-2 text-slate-600">Add a category here, then select it in the resource form.</p>
        </header>

        {error && <p role="alert" className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {message && <p role="status" className="mt-6 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</p>}

        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Add a new category</h2>
          <p className="mt-1 text-sm text-slate-500">Create a category of your own for your resources.</p>
          <form onSubmit={addCustomCategory} className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Category name
              <input value={customName} onChange={(event) => setCustomName(event.target.value)} maxLength={100} required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="For example, Sports Equipment" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Description <span className="font-normal text-slate-400">(optional)</span>
              <input value={customDescription} onChange={(event) => setCustomDescription(event.target.value)} maxLength={500} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="What belongs in this category?" />
            </label>
            <div className="sm:col-span-2">
              <button type="submit" disabled={adding !== "" || loading} className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50">
                {adding === "custom" ? "Adding..." : "Add category"}
              </button>
            </div>
          </form>
        </section>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Existing categories</h2>
          {loading ? <p className="mt-4 text-sm text-slate-500">Loading categories...</p> : categories.length ? (
            <ul className="mt-4 divide-y divide-slate-100">
              {categories.map((category) => <li key={category.categoryId} className="py-3"><p className="font-medium">{category.categoryName}</p>{category.description && <p className="mt-1 text-sm text-slate-500">{category.description}</p>}</li>)}
            </ul>
          ) : <p className="mt-4 text-sm text-slate-500">No categories added yet.</p>}
        </section>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Predefined categories</h2>
          <p className="mt-1 text-sm text-slate-500">Choose the categories you need. They will be saved to your database.</p>
          <ul className="mt-4 divide-y divide-slate-100">
            {predefinedCategories.map((category) => {
              const exists = existingNames.has(category.categoryName.toLowerCase());
              return <li key={category.categoryName} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><p className="font-medium">{category.categoryName}</p><p className="mt-1 text-sm text-slate-500">{category.description}</p></div><button type="button" disabled={exists || loading || adding !== ""} onClick={() => void addCategory(category)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">{exists ? "Added" : adding === category.categoryName ? "Adding..." : "Add category"}</button></li>;
            })}
          </ul>
        </section>
      </div>
    </main>
  );
}
