import { Brain, Users, Code, Palette, BarChart3 } from "lucide-react";

// Types
export interface Skill {
  id: string;
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  category: string;
  popularity?: number;
  demand?: "Low" | "Medium" | "High";
  validated?: boolean;
}

export interface SkillCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  subcategories?: string[];
}

export interface SkillSuggestion {
  name: string;
  category: string;
  popularity: number;
  relatedSkills: string[];
}

// Mock data for skills categories
export const skillCategories: SkillCategory[] = [
  {
    id: "technical",
    name: "Technical Skills",
    icon: Code,
    color: "bg-blue-500",
    subcategories: [
      "Programming Languages",
      "Frameworks",
      "Databases",
      "Tools & Platforms",
    ],
  },
  {
    id: "design",
    name: "Design & Creative",
    icon: Palette,
    color: "bg-purple-500",
    subcategories: [
      "UI/UX Design",
      "Graphic Design",
      "Video Production",
      "Photography",
    ],
  },
  {
    id: "business",
    name: "Business & Management",
    icon: BarChart3,
    color: "bg-green-500",
    subcategories: ["Project Management", "Strategy", "Finance", "Marketing"],
  },
  {
    id: "communication",
    name: "Communication",
    icon: Users,
    color: "bg-orange-500",
    subcategories: ["Public Speaking", "Writing", "Languages", "Negotiation"],
  },
  {
    id: "analytical",
    name: "Analytical",
    icon: Brain,
    color: "bg-indigo-500",
    subcategories: [
      "Data Analysis",
      "Research",
      "Problem Solving",
      "Critical Thinking",
    ],
  },
];

// Popular skills database
export const popularSkills: SkillSuggestion[] = [
  {
    name: "React",
    category: "technical",
    popularity: 95,
    relatedSkills: ["JavaScript", "TypeScript", "Next.js"],
  },
  {
    name: "JavaScript",
    category: "technical",
    popularity: 98,
    relatedSkills: ["React", "Node.js", "TypeScript"],
  },
  {
    name: "Python",
    category: "technical",
    popularity: 92,
    relatedSkills: ["Data Analysis", "Machine Learning", "Django"],
  },
  {
    name: "UI/UX Design",
    category: "design",
    popularity: 88,
    relatedSkills: ["Figma", "Adobe XD", "Prototyping"],
  },
  {
    name: "Project Management",
    category: "business",
    popularity: 85,
    relatedSkills: ["Agile", "Scrum", "Leadership"],
  },
  {
    name: "Data Analysis",
    category: "analytical",
    popularity: 90,
    relatedSkills: ["SQL", "Excel", "Python"],
  },
  {
    name: "TypeScript",
    category: "technical",
    popularity: 78,
    relatedSkills: ["JavaScript", "React", "Angular"],
  },
  {
    name: "Figma",
    category: "design",
    popularity: 82,
    relatedSkills: ["UI/UX Design", "Prototyping", "Design Systems"],
  },
  {
    name: "Machine Learning",
    category: "analytical",
    popularity: 75,
    relatedSkills: ["Python", "Data Analysis", "Statistics"],
  },
  {
    name: "Leadership",
    category: "business",
    popularity: 87,
    relatedSkills: ["Team Management", "Communication", "Strategy"],
  },
];
