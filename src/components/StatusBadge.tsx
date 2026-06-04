import { cn } from "@/lib/utils";
import { statusLabel, statusColor } from "@/lib/format";

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide",
        statusColor[status] || "bg-muted text-muted-foreground",
        className
      )}
    >
      {statusLabel[status] || status}
    </span>
  );
}
