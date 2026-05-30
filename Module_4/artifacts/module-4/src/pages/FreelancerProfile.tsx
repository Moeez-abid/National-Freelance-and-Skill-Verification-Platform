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

  const handleMessage = () => {
    const m1Token = localStorage.getItem("m3_token") || localStorage.getItem("token") || sessionStorage.getItem("m3_auth_token");
    let currentUserId = null;
    if (m1Token) {
      try {
        const payload = JSON.parse(atob(m1Token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        currentUserId = payload.userId || payload.id;
      } catch (e) { console.error("Could not parse token"); }
    }
    const partnerId = freelancer.user_id || freelancer.id;
    if (currentUserId && partnerId) {
      window.open(`http://localhost:5006/?userId=${currentUserId}&chatWith=${partnerId}${m1Token ? `&token=${m1Token}` : ''}`, "_blank");
    } else {
      alert("Could not determine user IDs for messaging.");
    }
  };

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
              <Button variant="outline" onClick={handleMessage}>
                <Mail className="w-4 h-4 mr-2" /> Message
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">Work History</h3>
              {freelancer.workHistory && freelancer.workHistory.length > 0 ? (
                <div className="space-y-4">
                  {freelancer.workHistory.map((wh: any, i: number) => (
                    <div key={i} className="border-b last:border-0 pb-4 last:pb-0">
                      <h4 className="font-semibold text-foreground">{wh.job_title}</h4>
                      <div className="text-sm text-primary mb-1">{wh.company_name}</div>
                      <div className="text-xs text-muted-foreground mb-2">
                        {new Date(wh.start_date).toLocaleDateString()} - {wh.is_current ? "Present" : (wh.end_date ? new Date(wh.end_date).toLocaleDateString() : "")}
                      </div>
                      {wh.description && <p className="text-sm text-muted-foreground">{wh.description}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground border border-dashed rounded-lg">
                  No work history available.
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">Badges</h3>
              {freelancer.badges && freelancer.badges.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {freelancer.badges.map((b: any, i: number) => (
                    <div key={i} className="flex flex-col items-center text-center p-3 border rounded-lg bg-muted/30">
                      {b.badge_icon_url ? (
                        <img src={b.badge_icon_url} alt={b.badge_name} className="w-12 h-12 mb-2 object-contain" />
                      ) : (
                        <div className="w-12 h-12 mb-2 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                          <Star className="w-6 h-6" />
                        </div>
                      )}
                      <span className="text-xs font-medium text-foreground line-clamp-2" title={b.badge_description || b.badge_name}>{b.badge_name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground border border-dashed rounded-lg">
                  No badges earned yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}