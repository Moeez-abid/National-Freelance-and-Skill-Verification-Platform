import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface MatchScoreBadgeProps {
  score: number;
  matchedCount: number;
  totalRequired: number;
  size?: number;
}

export function MatchScoreBadge({
  score,
  matchedCount,
  totalRequired,
  size = 48,
}: MatchScoreBadgeProps) {
  let color = "hsl(var(--destructive))";
  let trailColor = "hsl(var(--destructive) / 0.18)";

  if (score >= 90) {
    color = "hsl(var(--primary))";
    trailColor = "hsl(var(--primary) / 0.18)";
  } else if (score >= 70) {
    color = "hsl(35 92% 55%)";
    trailColor = "hsl(35 92% 55% / 0.18)";
  } else if (score >= 40) {
    color = "hsl(var(--muted-foreground))";
    trailColor = "hsl(var(--muted) / 0.5)";
  }

  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const dashOffset = circumference - (clamped / 100) * circumference;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col items-center gap-1 cursor-help group">
            <div
              className="relative transition-transform group-hover:scale-105"
              style={{ width: size, height: size }}
            >
              <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="-rotate-90"
              >
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={trailColor}
                  strokeWidth={stroke}
                />
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={color}
                  strokeWidth={stroke}
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  style={{
                    transition: "stroke-dashoffset 1s ease-out",
                  }}
                />
              </svg>
              <div
                className="absolute inset-0 flex items-center justify-center font-semibold"
                style={{ color, fontSize: size * 0.28 }}
              >
                {score}%
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              Match <Info className="w-3 h-3" />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="font-medium text-sm">Match Score: {score}%</p>
          <p className="text-xs text-muted-foreground mt-1">
            You have {matchedCount} out of {totalRequired} required skills.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
