import { useState, createContext, useContext, ReactNode } from "react";

export type Role = "Freelancer" | "Client";

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
  activeFreelancerId: string;
  setActiveFreelancerId: (id: string) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("Freelancer");
  const [activeFreelancerId, setActiveFreelancerId] = useState<string>("");

  return (
    <RoleContext.Provider value={{ role, setRole, activeFreelancerId, setActiveFreelancerId }}>
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