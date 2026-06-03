import { Panel } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

export function FeatureShell({
  title,
  description,
  toolbar,
  children,
  contentClassName,
}: {
  title: string;
  description: string;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
  contentClassName?: string;
}) {
  return (
    <Panel className="flex h-full w-full flex-col overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-border/80 pb-4">
        <div>
          <h2 className="font-display text-[1.55rem] font-semibold text-foreground">{title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted">{description}</p>
        </div>
        {toolbar}
      </div>
      <div className={cn("mt-4 min-h-0 flex-1 overflow-hidden", contentClassName)}>{children}</div>
    </Panel>
  );
}