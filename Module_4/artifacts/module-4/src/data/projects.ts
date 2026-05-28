export interface Project {
  id: string;
  title: string;
  description: string;
  clientName: string;
  requiredSkills: string[];
  maxHourlyBudget: number;
  durationWeeks: number;
  postedAt: string;
}

export const projects: Project[] = [
  {
    id: "p1",
    title: "Build a FinTech Dashboard",
    description: "We are looking for an experienced full-stack developer to build a modern, high-performance financial dashboard. Must be comfortable with real-time data and complex state management.",
    clientName: "Nexus Finance",
    requiredSkills: ["React", "TypeScript", "Tailwind", "Node.js"],
    maxHourlyBudget: 90,
    durationWeeks: 12,
    postedAt: "2023-10-25T10:00:00Z"
  },
  {
    id: "p2",
    title: "E-Commerce App Redesign",
    description: "Seeking a talented UI/UX designer to completely overhaul our mobile app experience. We want a clean, minimalist design that improves conversion rates.",
    clientName: "ShopSwift",
    requiredSkills: ["Figma", "Adobe XD"],
    maxHourlyBudget: 70,
    durationWeeks: 6,
    postedAt: "2023-10-26T14:30:00Z"
  },
  {
    id: "p3",
    title: "Migrate to Kubernetes",
    description: "Need a DevOps expert to help us migrate our legacy monolith to a microservices architecture on AWS EKS.",
    clientName: "HealthTech Solutions",
    requiredSkills: ["AWS", "Docker", "Kubernetes", "Go"],
    maxHourlyBudget: 120,
    durationWeeks: 8,
    postedAt: "2023-10-24T09:15:00Z"
  },
  {
    id: "p4",
    title: "Cross-Platform Delivery App",
    description: "Looking for a mobile developer to build a cross-platform food delivery app from scratch. Needs to handle real-time geolocation.",
    clientName: "FreshBite",
    requiredSkills: ["Flutter", "Node.js", "MongoDB"],
    maxHourlyBudget: 65,
    durationWeeks: 16,
    postedAt: "2023-10-27T11:45:00Z"
  },
  {
    id: "p5",
    title: "AI Recommendation Engine",
    description: "We need a data scientist to build a personalized recommendation model for our media streaming platform.",
    clientName: "StreamVibe",
    requiredSkills: ["Python", "TensorFlow", "Pandas", "PostgreSQL"],
    maxHourlyBudget: 100,
    durationWeeks: 10,
    postedAt: "2023-10-22T08:00:00Z"
  },
  {
    id: "p6",
    title: "Enterprise SaaS Backend",
    description: "Developing a complex enterprise CRM. Need a solid backend architect to build secure, scalable APIs.",
    clientName: "Acme Corp",
    requiredSkills: ["Python", "Django", "PostgreSQL", "AWS"],
    maxHourlyBudget: 85,
    durationWeeks: 24,
    postedAt: "2023-10-28T16:20:00Z"
  },
  {
    id: "p7",
    title: "Web3 NFT Marketplace",
    description: "Looking for a smart contract developer to build the backend for a new NFT platform.",
    clientName: "BlockArt",
    requiredSkills: ["Solidity", "React", "TypeScript", "Node.js"],
    maxHourlyBudget: 150,
    durationWeeks: 14,
    postedAt: "2023-10-29T10:30:00Z"
  }
];