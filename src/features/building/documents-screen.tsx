"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { FeatureShell } from "@/components/ui/feature-shell";
import { documents } from "@/lib/demo-data";

export function DocumentsScreen() {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");

  const filtered = useMemo(
    () =>
      [...documents]
        .filter((document) => document.title.toLowerCase().includes(query.toLowerCase()))
        .sort((left, right) =>
          sortBy === "latest"
            ? right.updatedAt.localeCompare(left.updatedAt)
            : left.updatedAt.localeCompare(right.updatedAt),
        ),
    [query, sortBy],
  );

  return (
    <FeatureShell
      description="Building regulations, policies, and operational notices are organized here for quick search and lightweight review."
      title="Documents"
      toolbar={
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px]">
          <label className="app-input flex items-center gap-3 rounded-full px-4 py-3 text-sm">
            <Search className="h-4 w-4 text-muted" />
            <input
              className="w-full bg-transparent outline-none"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search documents"
              value={query}
            />
          </label>
          <select
            className="app-input rounded-full px-4 py-3 text-sm"
            onChange={(event) => setSortBy(event.target.value)}
            value={sortBy}
          >
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      }
    >
      <div className="grid h-full gap-4 overflow-y-auto pr-1 xl:grid-cols-2">
        {filtered.map((document) => (
          <article key={document.id} className="rounded-[28px] border border-border bg-panel-strong p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">{document.category}</p>
            <h3 className="mt-2 text-xl font-semibold text-foreground">{document.title}</h3>
            <p className="mt-3 text-sm leading-7 text-muted">{document.summary}</p>
            <p className="mt-4 text-xs text-muted">Updated: {document.updatedAt}</p>
          </article>
        ))}
      </div>
    </FeatureShell>
  );
}