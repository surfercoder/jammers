import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
  accepted: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  declined: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20",
  cancelled: "bg-muted text-muted-foreground",
  completed: "bg-primary/15 text-primary border-primary/20",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={cn("border", STYLES[status])}>
      {STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
