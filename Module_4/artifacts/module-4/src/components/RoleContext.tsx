import { useState, createContext, useContext, ReactNode, useEffect } from "react";

export type Role = "Freelancer" | "Client";

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
  activeFreelancerId: string;
  setActiveFreelancerId: (id: string) => void;
  isAuthenticated: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("Freelancer");
  const [activeFreelancerId, setActiveFreelancerId] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("m3_token");
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role) {
          setRole(payload.role.toLowerCase() === "client" ? "Client" : "Freelancer");
        } else if (payload.user?.role) {
          setRole(payload.user.role.toLowerCase() === "client" ? "Client" : "Freelancer");
        }
        
        const uuid = payload.uuid || payload.id || payload.user?.uuid;
        if (uuid) {
          setActiveFreelancerId(uuid);
          setIsAuthenticated(true);
        }
      }
    } catch (err) {
      console.error("Failed to parse token", err);
    }
  }, []);

  return (
    <RoleContext.Provider value={{ role, setRole, activeFreelancerId, setActiveFreelancerId, isAuthenticated }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}