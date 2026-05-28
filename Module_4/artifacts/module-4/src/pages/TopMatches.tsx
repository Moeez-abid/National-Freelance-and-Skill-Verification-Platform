import { useState } from "react";
import { useData } from "../hooks/useData";
import { rankFreelancersForProject } from "../lib/matching";
import { FreelancerCard } from "../components/FreelancerCard";
import { EmptyState } from "../components/EmptyState";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Users, Filter } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function TopMatches() {
  const { freelancers, projects, loading } = useData();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [hideOverBudget, setHideOverBudget] = useState(false);

  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];
  
  // Set initial selected project once data loads
  if (!selectedProjectId && projects.length > 0) {
    setSelectedProjectId(projects[0].id);
  }

  if (loading) {
    return <div className="p-12 text-center">Loading talent data...</div>;
  }
  
  const rankedFreelancers = selectedProject 
    ? rankFreelancersForProject(selectedProject, freelancers)
    : [];

  const filteredFreelancers = hideOverBudget
    ? rankedFreelancers.filter(f => f.budgetAlignment !== "over")
    : rankedFreelancers;

  return (
    <div className="min-h-[100dvh] bg-background pb-20">
      <div className="bg-primary/5 border-b border-primary/10 py-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-4 flex items-center gap-2">
                Find Talent <Users className="w-6 h-6 text-primary" />
              </h1>
              <div className="max-w-md">
                <label className="text-sm font-medium text-muted-foreground block mb-2">
                  Select a project to view top matches:
                </label>
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger className="bg-background h-12 text-base">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
            
            {selectedProject && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="md:w-[350px]">
                <Card className="bg-background/60 backdrop-blur border-primary/20">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">Project Requirements</h3>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {selectedProject.requiredSkills.map(s => (
                        <span key={s} className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs">{s}</span>
                      ))}
                    </div>
                    <div className="text-sm font-medium">Max Budget: <span className="text-primary">${selectedProject.maxHourlyBudget}/hr</span></div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Top Matched Candidates</h2>
          <div className="flex items-center space-x-2 bg-muted/50 px-3 py-1.5 rounded-md">
            <Checkbox 
              id="budget-filter-client" 
              checked={hideOverBudget} 
              onCheckedChange={(c) => setHideOverBudget(c as boolean)} 
            />
            <Label htmlFor="budget-filter-client" className="text-sm font-medium cursor-pointer flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Strict budget match
            </Label>
          </div>
        </div>

        {filteredFreelancers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFreelancers.map(freelancer => (
              <FreelancerCard 
                key={freelancer.id} 
                freelancer={freelancer} 
                projectBudget={selectedProject?.maxHourlyBudget || 0} 
              />
            ))}
          </div>
        ) : (
          <EmptyState 
            title="No candidates found"
            description="There are no freelancers matching these strict criteria. Try unchecking the strict budget filter."
          />
        )}
      </div>
    </div>
  );
}