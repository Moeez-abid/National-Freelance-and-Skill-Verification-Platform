export interface Freelancer {
  id: string;
  name: string;
  title: string;
  avatarColor: string;
  initials: string;
  skills: string[];
  hourlyRate: number;
  rating: number;
  completedProjects: number;
  location: string;
  bio: string;
  workHistory?: any[];
  badges?: any[];
  user_id?: string | number;
}

export const freelancers: Freelancer[] = [
  {
    id: "f1",
    name: "Alex Rivera",
    title: "Senior Full-Stack Engineer",
    avatarColor: "#3b82f6",
    initials: "AR",
    skills: ["React", "Node.js", "TypeScript", "AWS", "PostgreSQL"],
    hourlyRate: 85,
    rating: 4.9,
    completedProjects: 42,
    location: "Austin, TX",
    bio: "Building robust, scalable web applications with a focus on clean code and performance. 8+ years of experience."
  },
  {
    id: "f2",
    name: "Samira Jones",
    title: "UI/UX Designer",
    avatarColor: "#ec4899",
    initials: "SJ",
    skills: ["Figma", "Adobe XD", "Tailwind"],
    hourlyRate: 65,
    rating: 4.8,
    completedProjects: 28,
    location: "London, UK",
    bio: "Crafting beautiful and intuitive digital experiences. Specializing in mobile apps and SaaS dashboards."
  },
  {
    id: "f3",
    name: "David Chen",
    title: "DevOps & Cloud Architect",
    avatarColor: "#10b981",
    initials: "DC",
    skills: ["AWS", "Docker", "Kubernetes", "Go"],
    hourlyRate: 110,
    rating: 5.0,
    completedProjects: 56,
    location: "Toronto, UK",
    bio: "Helping startups scale their infrastructure efficiently and securely. Kubernetes expert."
  },
  {
    id: "f4",
    name: "Elena Rodriguez",
    title: "Mobile App Developer",
    avatarColor: "#8b5cf6",
    initials: "ER",
    skills: ["Flutter", "Swift", "Kotlin", "React"],
    hourlyRate: 75,
    rating: 4.7,
    completedProjects: 19,
    location: "Madrid, ES",
    bio: "Passionate about creating fluid, cross-platform mobile experiences that feel native."
  },
  {
    id: "f5",
    name: "Michael Chang",
    title: "Backend Python Engineer",
    avatarColor: "#f59e0b",
    initials: "MC",
    skills: ["Python", "Django", "PostgreSQL", "Docker", "Redis"],
    hourlyRate: 80,
    rating: 4.6,
    completedProjects: 34,
    location: "Berlin, DE",
    bio: "Data-driven backend engineer. I love designing APIs and optimizing database queries."
  },
  {
    id: "f6",
    name: "Priya Patel",
    title: "Data Scientist",
    avatarColor: "#14b8a6",
    initials: "PP",
    skills: ["Python", "TensorFlow", "Pandas", "SQL"],
    hourlyRate: 95,
    rating: 4.9,
    completedProjects: 22,
    location: "San Francisco, CA",
    bio: "Transforming raw data into actionable insights through predictive modeling and ML."
  }
];