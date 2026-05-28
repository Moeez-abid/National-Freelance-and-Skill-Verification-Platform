import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

interface SkillChipProps {
  skill: string;
  variant: "matched" | "missing" | "neutral";
  onLearnClick?: () => void;
}

export function SkillChip({ skill, variant, onLearnClick }: SkillChipProps) {
  if (variant === "matched") {
    return (
      <Badge variant="default" className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 flex items-center gap-1">
        <Check className="w-3 h-3" /> {skill}
      </Badge>
    );
  }

  if (variant === "missing") {
    return (
      <Badge variant="outline" className="border-destructive text-destructive border-dashed flex items-center gap-1">
        <X className="w-3 h-3" /> {skill}
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="font-normal">
      {skill}
    </Badge>
  );
}