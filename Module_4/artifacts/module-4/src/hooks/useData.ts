import { useState, useEffect } from "react";
import type { Freelancer } from "../data/freelancers";
import type { Project } from "../data/projects";

export function useData() {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fRes, pRes] = await Promise.all([
          fetch("/api/freelancers"),
          fetch("/api/projects")
        ]);
        if (fRes.ok && pRes.ok) {
          setFreelancers(await fRes.json());
          setProjects(await pRes.json());
        }
      } catch (err) {
        console.error("Failed to fetch API data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { freelancers, projects, loading };
}
