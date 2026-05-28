import { Freelancer } from "../data/freelancers";
import { Project } from "../data/projects";

export interface MatchResult {
  percentage: number;
  matched: string[];
  missing: string[];
}

export type BudgetAlignment = "within" | "slightly_over" | "over";

export function calculateMatchScore(freelancerSkills: string[], requiredSkills: string[]): MatchResult {
  if (!requiredSkills || requiredSkills.length === 0) {
    return { percentage: 100, matched: [], missing: [] };
  }

  const normalizedFreelancerSkills = freelancerSkills.map(s => s.toLowerCase());
  const matched: string[] = [];
  const missing: string[] = [];

  requiredSkills.forEach(reqSkill => {
    if (normalizedFreelancerSkills.includes(reqSkill.toLowerCase())) {
      matched.push(reqSkill);
    } else {
      missing.push(reqSkill);
    }
  });

  const percentage = Math.round((matched.length / requiredSkills.length) * 100);
  return { percentage, matched, missing };
}

export function isBudgetAligned(hourlyRate: number, maxBudget: number): BudgetAlignment {
  if (hourlyRate <= maxBudget) return "within";
  if (hourlyRate <= maxBudget * 1.1) return "slightly_over";
  return "over";
}

export interface RankedFreelancer extends Freelancer {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  budgetAlignment: BudgetAlignment;
  effectiveScore: number;
}

export function rankFreelancersForProject(project: Project, freelancers: Freelancer[]): RankedFreelancer[] {
  return freelancers.map(freelancer => {
    const match = calculateMatchScore(freelancer.skills, project.requiredSkills);
    const alignment = isBudgetAligned(freelancer.hourlyRate, project.maxHourlyBudget);
    
    let effectiveScore = match.percentage;
    if (alignment === "over") effectiveScore -= 30;
    else if (alignment === "slightly_over") effectiveScore -= 10;

    return {
      ...freelancer,
      matchScore: match.percentage,
      matchedSkills: match.matched,
      missingSkills: match.missing,
      budgetAlignment: alignment,
      effectiveScore
    };
  }).sort((a, b) => b.effectiveScore - a.effectiveScore);
}

export interface RankedProject extends Project {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  budgetAlignment: BudgetAlignment;
}

export function recommendProjectsForFreelancer(freelancer: Freelancer, projects: Project[]): RankedProject[] {
  return projects.map(project => {
    const match = calculateMatchScore(freelancer.skills, project.requiredSkills);
    const alignment = isBudgetAligned(freelancer.hourlyRate, project.maxHourlyBudget);
    return {
      ...project,
      matchScore: match.percentage,
      matchedSkills: match.matched,
      missingSkills: match.missing,
      budgetAlignment: alignment
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}

export interface TrendingSkill {
  skill: string;
  count: number;
  missingForFreelancer: boolean;
}

export function getTrendingSkills(projects: Project[], freelancerSkills: string[] = []): TrendingSkill[] {
  const skillCounts: Record<string, number> = {};
  
  projects.forEach(p => {
    p.requiredSkills.forEach(s => {
      skillCounts[s] = (skillCounts[s] || 0) + 1;
    });
  });

  const normalizedFreelancerSkills = freelancerSkills.map(s => s.toLowerCase());

  return Object.entries(skillCounts)
    .map(([skill, count]) => ({
      skill,
      count,
      missingForFreelancer: !normalizedFreelancerSkills.includes(skill.toLowerCase())
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}