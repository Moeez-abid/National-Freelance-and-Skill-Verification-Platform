import { RankedFreelancer } from "../lib/matching";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MatchScoreBadge } from "./MatchScoreBadge";
import { SkillChip } from "./SkillChip";
import { BudgetIndicator } from "./BudgetIndicator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MapPin, Star, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

interface FreelancerCardProps {
  freelancer: RankedFreelancer;
  projectBudget: number;
}

export function FreelancerCard({ freelancer, projectBudget }: FreelancerCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4 }}
    >
      <Card className="h-full flex flex-col hover:shadow-md transition-all duration-300">
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div className="flex gap-4">
            <Avatar className="w-12 h-12 border-2 border-background shadow-sm">
              <AvatarFallback style={{ backgroundColor: freelancer.avatarColor, color: "white" }}>
                {freelancer.initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold">
                <Link href={`/freelancer/${freelancer.id}`} className="hover:text-primary transition-colors">
                  {freelancer.name}
                </Link>
              </CardTitle>
              <p className="text-sm font-medium text-primary">{freelancer.title}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {freelancer.rating}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {freelancer.location}</span>
              </div>
            </div>
          </div>
          <MatchScoreBadge 
            score={freelancer.matchScore} 
            matchedCount={freelancer.matchedSkills.length} 
            totalRequired={freelancer.matchedSkills.length + freelancer.missingSkills.length} 
          />
        </CardHeader>
        
        <CardContent className="flex-1 pt-2 pb-4 flex flex-col justify-between gap-4">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {freelancer.bio}
          </p>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {freelancer.matchedSkills.map(s => (
                <SkillChip key={s} skill={s} variant="matched" />
              ))}
              {freelancer.missingSkills.map(s => (
                <SkillChip key={s} skill={s} variant="missing" />
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <BudgetIndicator 
                alignment={freelancer.budgetAlignment} 
                rate={freelancer.hourlyRate} 
                budget={projectBudget} 
              />
              <Button variant="ghost" size="sm" asChild className="group h-8 px-2">
                <Link href={`/freelancer/${freelancer.id}`}>
                  Profile <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}