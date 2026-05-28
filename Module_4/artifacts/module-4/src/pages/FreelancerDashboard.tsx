import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Sparkles, TrendingUp, GraduationCap } from "lucide-react";
import { useRole } from "../components/RoleContext";
import { useData } from "../hooks/useData";
import {
  recommendProjectsForFreelancer,
  getTrendingSkills,
} from "../lib/matching";
import { ProjectCard } from "../components/ProjectCard";
import { EmptyState } from "../components/EmptyState";
import { LearnSkillDialog } from "../components/LearnSkillDialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function FreelancerDashboard() {
  const { activeFreelancerId, setActiveFreelancerId } = useRole();
  const { freelancers, projects, loading } = useData();
  const activeFreelancer = freelancers.find((f) => f.id === activeFreelancerId) || freelancers[0];
  const [hideOverBudget, setHideOverBudget] = useState(false);
  const [learningSkill, setLearningSkill] = useState<string | null>(null);

  if (loading) {
    return <div className="p-12 text-center">Loading dashboard...</div>;
  }

  if (!activeFreelancer) return null;

  const rankedProjects = recommendProjectsForFreelancer(
    activeFreelancer,
    projects,
  );
  const filteredProjects = hideOverBudget
    ? rankedProjects.filter((p) => p.budgetAlignment !== "over")
    : rankedProjects;

  const strongMatches = rankedProjects.filter((p) => p.matchScore >= 70).length;
  const trendingSkills = getTrendingSkills(projects, activeFreelancer.skills);

  return (
    <div className="min-h-[100dvh] bg-background pb-20">
      {/* Hero Section */}
      <div className="bg-primary/5 border-b border-primary/10 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
                Your Dashboard
                <Sparkles className="w-6 h-6 text-primary" />
              </h1>
              <p className="text-muted-foreground max-w-2xl text-lg">
                We've analyzed {projects.length} available projects against your{" "}
                {activeFreelancer.skills.length} verified skills.
              </p>
            </div>

            <div className="bg-background border rounded-lg p-4 shadow-sm min-w-[200px]">
              <div className="text-sm text-muted-foreground mb-1">
                Strong Matches
              </div>
              <div className="text-3xl font-bold text-primary">
                {strongMatches}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main grid: jobs + trending side by side on large screens */}
      <div className="container mx-auto px-4 max-w-6xl mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recommended jobs */}
        <section className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">
              Recommended for {activeFreelancer.name}
            </h2>
            <div className="flex items-center space-x-2 bg-muted/50 px-3 py-1.5 rounded-md">
              <Checkbox
                id="budget-filter"
                checked={hideOverBudget}
                onCheckedChange={(c) => setHideOverBudget(c as boolean)}
              />
              <Label
                htmlFor="budget-filter"
                className="text-sm font-medium cursor-pointer"
              >
                Hide jobs below my rate
              </Label>
            </div>
          </div>

          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  freelancerRate={activeFreelancer.hourlyRate}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No projects found"
              description="There are no projects that match your current filters."
            />
          )}
        </section>

        {/* Trending skills sidebar */}
        <aside className="lg:col-span-1">
          <div className="lg:sticky lg:top-20">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 rounded-md bg-primary/10 text-primary">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Trending Skills</h2>
                <p className="text-xs text-muted-foreground">
                  Most-requested skills in active projects
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {trendingSkills.map((ts, index) => (
                <motion.div
                  key={ts.skill}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-4 hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs bg-muted text-muted-foreground shrink-0">
                          #{index + 1}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-foreground truncate">
                            {ts.skill}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {ts.count}{" "}
                            {ts.count === 1 ? "project" : "projects"}
                          </p>
                          <div className="mt-2">
                            {ts.missingForFreelancer ? (
                              <Badge
                                variant="secondary"
                                className="bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-500/20 dark:text-amber-400 text-[10px] px-1.5 py-0"
                              >
                                Opportunity
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 text-[10px] px-1.5 py-0"
                              >
                                You have this
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {ts.missingForFreelancer && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2 shrink-0"
                          onClick={() => setLearningSkill(ts.skill)}
                        >
                          <GraduationCap className="w-3.5 h-3.5 mr-1" />
                          Learn
                        </Button>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <LearnSkillDialog
        skill={learningSkill}
        isOpen={learningSkill !== null}
        onClose={() => setLearningSkill(null)}
      />
    </div>
  );
}
