import { useRoute } from "wouter";
import { useData } from "../hooks/useData";
import { rankFreelancersForProject } from "../lib/matching";
import { FreelancerCard } from "../components/FreelancerCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, DollarSign, Calendar, Users } from "lucide-react";

export default function ProjectDetail() {
  const [, params] = useRoute("/project/:id");
  const { freelancers, projects, loading } = useData();
  const project = projects.find(p => p.id === params?.id);

  if (loading) {
    return <div className="p-12 text-center text-xl font-medium">Loading project details...</div>;
  }

  if (!project) {
    return <div className="p-12 text-center text-xl font-medium">Project not found</div>;
  }

  const rankedFreelancers = rankFreelancersForProject(project, freelancers);
  const topMatches = rankedFreelancers.slice(0, 3); // Show top 3 matches inline

  return (
    <div className="min-h-[100dvh] bg-background pb-20">
      <div className="bg-primary/5 border-b border-primary/10 py-10">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
            <div className="flex-1">
              <Badge className="mb-4 bg-primary/20 text-primary hover:bg-primary/20 border-none">Active Gig</Badge>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">{project.title}</h1>
              <p className="text-lg text-muted-foreground">{project.clientName}</p>
            </div>
            
            <Card className="w-full md:w-auto min-w-[250px] shadow-sm">
              <CardContent className="p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center dark:bg-emerald-900/50 dark:text-emerald-400">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Max Budget</p>
                    <p className="font-bold">${project.maxHourlyBudget} / hr</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center dark:bg-blue-900/50 dark:text-blue-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-bold">{project.durationWeeks} weeks</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center dark:bg-purple-900/50 dark:text-purple-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Posted</p>
                    <p className="font-bold">{new Date(project.postedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-bold mb-4">Project Description</h2>
              <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-muted-foreground">
                <p>{project.description}</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {project.requiredSkills.map(s => (
                  <Badge key={s} variant="secondary" className="px-3 py-1.5 text-sm">{s}</Badge>
                ))}
              </div>
            </section>
            
            <section className="pt-6 border-t">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" /> Top Candidates
              </h2>
              <div className="grid gap-4">
                {topMatches.map(freelancer => (
                  <FreelancerCard 
                    key={freelancer.id} 
                    freelancer={freelancer} 
                    projectBudget={project.maxHourlyBudget} 
                  />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}