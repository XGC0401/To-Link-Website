import { cn } from "@/lib/utils";

export function StatusPill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "accent" | "success" | "warning" | "danger";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        tone === "neutral" && "bg-panel text-muted",
        tone === "accent" && "bg-accent-soft text-accent-strong",
        tone === "success" && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
        tone === "warning" && "bg-amber-500/15 text-amber-700 dark:text-amber-300",
        tone === "danger" && "bg-rose-500/15 text-rose-700 dark:text-rose-300",
      )}
    >
      {children}
    </span>
  );
}