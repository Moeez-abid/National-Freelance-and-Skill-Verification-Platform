import { useRoute } from "wouter";
import { useData } from "../hooks/useData";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Briefcase, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function FreelancerProfile() {
  const [, params] = useRoute("/freelancer/:id");
  const { freelancers, loading } = useData();
  const freelancer = freelancers.find(f => f.id === params?.id);

  if (loading) {
    return <div className="p-12 text-center text-xl font-medium">Loading profile...</div>;
  }

  if (!freelancer) {
    return <div className="p-12 text-center text-xl font-medium">Freelancer not found</div>;
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Cover Banner */}
      <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/5 w-full"></div>
      
      <div className="container mx-auto px-4 max-w-4xl -mt-16">
        <div className="bg-card border rounded-xl shadow-sm p-6 sm:p-8 flex flex-col md:flex-row gap-8 items-start relative z-10">
          
          <Avatar className="w-32 h-32 border-4 border-background shadow-md">
            <AvatarFallback className="text-4xl" style={{ backgroundColor: freelancer.avatarColor, color: "white" }}>
              {freelancer.initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">{freelancer.name}</h1>
              <p className="text-xl text-primary font-medium">{freelancer.title}</p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {freelancer.location}</span>
              <span className="flex items-center gap-1.5"><Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {freelancer.rating} Rating</span>
              <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {freelancer.completedProjects} Jobs Completed</span>
              <span className="font-semibold text-foreground px-2 py-1 bg-muted rounded-md">${freelancer.hourlyRate} / hr</span>
            </div>

            <p className="text-muted-foreground text-base leading-relaxed">
              {freelancer.bio}
            </p>

            <div className="pt-2">
              <h3 className="text-sm font-semibold mb-2">Verified Skills</h3>
              <div className="flex flex-wrap gap-2">
                {freelancer.skills.map(s => (
                  <Badge key={s} variant="secondary" className="px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="pt-4 flex gap-4">
              <Button>
                Invite to Project
              </Button>
              <Button variant="outline">
                <Mail className="w-4 h-4 mr-2" /> Message
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">Work History</h3>
              <div className="text-center p-8 text-muted-foreground border border-dashed rounded-lg">
                Employment history from Module 3 will appear here.
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">Certifications</h3>
              <div className="text-center p-8 text-muted-foreground border border-dashed rounded-lg">
                Certificates from Module 2 will appear here.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}