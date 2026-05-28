import { RankedProject } from "../lib/matching";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MatchScoreBadge } from "./MatchScoreBadge";
import { SkillChip } from "./SkillChip";
import { BudgetIndicator } from "./BudgetIndicator";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, ArrowRight, Lightbulb } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { LearnSkillDialog } from "./LearnSkillDialog";
import { motion } from "framer-motion";

interface ProjectCardProps {
  project: RankedProject;
  freelancerRate: number;
}

export function ProjectCard({ project, freelancerRate }: ProjectCardProps) {
  const [learningSkill, setLearningSkill] = useState<string | null>(null);

  const isHighMatch = project.matchScore >= 70;
  const hasMissingSkills = project.missingSkills.length > 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        whileHover={{ y: -4 }}
      >
        <Card className="h-full flex flex-col hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div className="space-y-1 pr-4">
              <CardTitle className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">
                <Link href={`/project/${project.id}`}>{project.title}</Link>
              </CardTitle>
              <div className="text-sm text-muted-foreground flex items-center gap-4">
                <span className="font-medium text-foreground">{project.clientName}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {project.durationWeeks} weeks</span>
              </div>
            </div>
            <MatchScoreBadge 
              score={project.matchScore} 
              matchedCount={project.matchedSkills.length} 
              totalRequired={project.requiredSkills.length} 
            />
          </CardHeader>
          <CardContent className="flex-1 pb-4">
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {project.description}
            </p>
            
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {project.matchedSkills.map(s => (
                  <SkillChip key={s} skill={s} variant="matched" />
                ))}
                {project.missingSkills.map(s => (
                  <SkillChip key={s} skill={s} variant="missing" />
                ))}
              </div>

              <BudgetIndicator 
                alignment={project.budgetAlignment} 
                rate={freelancerRate} 
                budget={project.maxHourlyBudget} 
              />
            </div>
          </CardContent>

          {isHighMatch && hasMissingSkills && (
            <div className="mx-6 mb-4 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-400">
                <Lightbulb className="w-4 h-4 shrink-0" />
                <span>You're a strong match! Learn <strong>{project.missingSkills[0]}</strong> to hit 100%.</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs bg-white dark:bg-background shrink-0"
                onClick={() => setLearningSkill(project.missingSkills[0])}
              >
                Learn {project.missingSkills[0]}
              </Button>
            </div>
          )}

          <CardFooter className="pt-0">
            <Button asChild className="w-full group" variant="secondary">
              <Link href={`/project/${project.id}`}>
                View Project Details
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      <LearnSkillDialog 
        skill={learningSkill} 
        isOpen={learningSkill !== null} 
        onClose={() => setLearningSkill(null)} 
      />
    </>
  );
}