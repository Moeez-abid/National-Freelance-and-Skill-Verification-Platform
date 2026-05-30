import { BudgetAlignment } from "../lib/matching";
import { DollarSign, AlertCircle, CheckCircle2 } from "lucide-react";

interface BudgetIndicatorProps {
  alignment: BudgetAlignment;
  rate: number;
  budget: number;
}

export function BudgetIndicator({ alignment, rate, budget }: BudgetIndicatorProps) {
  if (alignment === "within") {
    return (
      <div className="flex items-center gap-1.5 text-sm text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md dark:bg-emerald-500/10 dark:text-emerald-400">
        <CheckCircle2 className="w-4 h-4" />
        <span className="font-medium">${rate}/hr</span>
        <span className="text-emerald-600/70 dark:text-emerald-400/70 text-xs">(within ${budget} budget)</span>
      </div>
    );
  }

  if (alignment === "slightly_over") {
    return (
      <div className="flex items-center gap-1.5 text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded-md dark:bg-amber-500/10 dark:text-amber-400">
        <AlertCircle className="w-4 h-4" />
        <span className="font-medium">${rate}/hr</span>
        <span className="text-amber-600/70 dark:text-amber-400/70 text-xs">(10% over ${budget} budget)</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-sm text-destructive bg-destructive/10 px-2 py-1 rounded-md">
      <AlertCircle className="w-4 h-4" />
      <span className="font-medium">${rate}/hr</span>
      <span className="text-destructive/70 text-xs">(over ${budget} budget)</span>
    </div>
  );
}