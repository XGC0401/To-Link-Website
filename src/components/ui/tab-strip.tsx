import Link from "next/link";
import { cn } from "@/lib/utils";

export function TabStrip({
  items,
}: {
  items: Array<{ href: string; active: boolean; label: string }>;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-[24px] border border-border bg-panel-strong p-2">
      {items.map((item) => (
        <Link
          key={item.href}
          className={cn(
            "rounded-full px-4 py-2.5 text-sm font-medium transition",
            item.active
              ? "bg-accent text-white shadow-lg shadow-accent/20"
              : "text-muted hover:bg-panel hover:text-foreground",
          )}
          href={item.href}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}