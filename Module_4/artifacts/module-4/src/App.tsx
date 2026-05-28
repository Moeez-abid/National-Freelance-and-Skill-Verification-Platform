import { Switch, Route, Router as WouterRouter } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { RoleProvider, useRole } from "./components/RoleContext";
import { Navbar } from "./components/Navbar";

// Pages
import FreelancerDashboard from "./pages/FreelancerDashboard";
import TopMatches from "./pages/TopMatches";
import FreelancerProfile from "./pages/FreelancerProfile";
import ProjectDetail from "./pages/ProjectDetail";

function RootRoute() {
  const { role } = useRole();
  return role === "Freelancer" ? <FreelancerDashboard /> : <TopMatches />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={RootRoute} />
      <Route path="/freelancer/:id" component={FreelancerProfile} />
      <Route path="/project/:id" component={ProjectDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      <main>
        <Router />
      </main>
    </div>
  );
}

function App() {
  return (
    <RoleProvider>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppContent />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </RoleProvider>
  );
}

export default App;
