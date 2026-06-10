import { Panel } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

export function FeatureShell({
  toolbar,
  children,
  contentClassName,
}: {
  title?: string;
  description?: string;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
  contentClassName?: string;
}) {
  return (
    <Panel className="flex h-full w-full flex-col overflow-hidden">
      {toolbar ? <div className="border-b border-border/80 pb-4">{toolbar}</div> : null}
      <div className={cn(toolbar ? "mt-4 min-h-0 flex-1 overflow-hidden" : "min-h-0 flex-1 overflow-hidden", contentClassName)}>{children}</div>
    </Panel>
  );
}