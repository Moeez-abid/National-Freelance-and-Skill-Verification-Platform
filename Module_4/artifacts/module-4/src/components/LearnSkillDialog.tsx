import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

interface LearnSkillDialogProps {
  skill: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function LearnSkillDialog({ skill, isOpen, onClose }: LearnSkillDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
            <GraduationCap className="w-6 h-6" />
          </div>
          <DialogTitle className="text-center text-xl">Learn {skill}</DialogTitle>
          <DialogDescription className="text-center pt-2">
            You're being redirected to the <strong>Learning Hub (Module 2)</strong> to find highly-rated courses and certifications for <strong className="text-foreground">{skill}</strong>.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-muted p-4 rounded-lg text-sm text-center mb-2">
          <em>(This is a stub. In the full platform, this would open Module 2 with pre-filtered course results.)</em>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button type="button" onClick={onClose} className="w-full sm:w-auto">
            Acknowledge & Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}