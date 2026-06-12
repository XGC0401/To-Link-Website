import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function FeatureToolbar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-[26px] border border-border bg-panel-strong px-4 py-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ToolbarSearch({
  onChange,
  placeholder,
  value,
}: {
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <label className="app-input flex min-w-[14rem] flex-1 items-center gap-3 rounded-full px-4 py-3">
      <Search className="h-4 w-4 text-muted" />
      <input
        className="w-full bg-transparent text-sm outline-none"
        id="toolbar-search"
        name="toolbar-search"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}

export function ToolbarSelect({
  onChange,
  options,
  value,
}: {
  onChange: (value: string) => void;
  options: string[];
  value: string;
}) {
  return (
    <select
      className="app-input rounded-full px-4 py-3 text-sm"
      id="toolbar-select"
      name="toolbar-select"
      onChange={(event) => onChange(event.target.value)}
      value={value}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

export function ToolbarSwitch({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-3 rounded-full border px-4 py-3 text-sm font-medium transition",
        checked
          ? "border-accent bg-accent text-white"
          : "border-border bg-panel text-foreground hover:border-accent/40 hover:text-accent",
      )}
      onClick={() => onChange(!checked)}
      type="button"
    >
      <span
        className={cn(
          "relative h-5 w-10 rounded-full transition",
          checked ? "bg-white/30" : "bg-border",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-white transition",
            checked ? "left-[1.25rem]" : "left-0.5",
          )}
        />
      </span>
      {label}
    </button>
  );
}

export function ToolbarPrimaryButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/30 transition hover:bg-accent-strong"
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}