import { popularSkills, skillCategories } from "@/data/skills-categories";

export interface SkillRelevance {
  name: string;
  category: string;
  popularity: number;
  relatedSkills: string[];
  relevanceScore: number;
  relevanceReason?: string;
}

export interface ProjectContext {
  jobTitle: string;
  jobDescription: string;
  selectedCategories: string[];
}

// -------------------------------------------------------------------------------------
// Dynamic Category Keyword Index
// -------------------------------------------------------------------------------------
// Instead of hard-coding keywords, build a lightweight keyword index from the
// existing category and skills data. This lets us match generic project terms like
// "designer" → Design & Creative, or "database" → Database, without maintaining
// long static lists.

// Very small, generic suffix stripping to normalize simple variants:
// designer → design, designs → design, designed → design, designing → design
function normalizeToken(token: string): string {
  let t = token.toLowerCase();
  // remove punctuation
  t = t.replace(/[^a-z0-9+.#]/g, " ").trim();
  // quick stemming for common English suffixes
  const stemRules = [
    [/ings?$/i, ""],
    [/ers?$/i, ""],
    [/ed$/i, ""],
    [/s$/i, ""],
  ];
  for (const [re, rep] of stemRules) t = t.replace(re as RegExp, rep as string);
  return t.trim();
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+.#]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map(normalizeToken)
    .filter(Boolean);
}

// Build keywords for each category from:
// - category name
// - subcategories
// - skill names that belong to that category (acts as implicit keywords)
function buildCategoryKeywordIndex(): Record<string, Set<string>> {
  const idx: Record<string, Set<string>> = {};

  for (const cat of skillCategories) {
    const key = cat.name; // use display name as identifier consistently with skills.category
    const set = (idx[key] = new Set<string>());
    // category name tokens
    tokenize(cat.name).forEach((t) => set.add(t));
    // subcategories tokens
    (cat.subcategories || []).forEach((sub) =>
      tokenize(sub).forEach((t) => set.add(t))
    );
  }

  // include skill names as lightweight signals for their categories
  for (const skill of popularSkills) {
    const set = idx[skill.category];
    if (!set) continue;
    tokenize(skill.name).forEach((t) => set.add(t));
  }

  return idx;
}

const CATEGORY_KEYWORDS_INDEX = buildCategoryKeywordIndex();

// Resolve a potentially mismatched/variant category label to a canonical
// category key present in CATEGORY_KEYWORDS_INDEX using lenient matching.
function normalizeCategoryLabel(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function resolveCategoryKey(rawCategory: string): string | null {
  const inputNorm = normalizeCategoryLabel(rawCategory);
  // Exact normalized match
  for (const key of Object.keys(CATEGORY_KEYWORDS_INDEX)) {
    const keyNorm = normalizeCategoryLabel(key);
    if (keyNorm === inputNorm) return key;
  }
  // Includes either way (handles things like "design/creative" vs "design & creative")
  for (const key of Object.keys(CATEGORY_KEYWORDS_INDEX)) {
    const keyNorm = normalizeCategoryLabel(key);
    if (keyNorm.includes(inputNorm) || inputNorm.includes(keyNorm)) return key;
  }
  // Token overlap fallback - choose the category with the highest overlap
  const inputTokens = new Set(tokenize(rawCategory));
  let bestKey: string | null = null;
  let bestScore = 0;
  for (const key of Object.keys(CATEGORY_KEYWORDS_INDEX)) {
    const keyTokens = new Set(tokenize(key));
    let overlap = 0;
    for (const t of inputTokens) if (keyTokens.has(t)) overlap++;
    if (overlap > bestScore) {
      bestScore = overlap;
      bestKey = key;
    }
  }
  return bestKey;
}

// Calculate relevance score for a skill based on project context
export function calculateSkillRelevance(
  skill: (typeof popularSkills)[0],
  context: ProjectContext
): SkillRelevance {
  let relevanceScore = 0;
  const reasons: string[] = [];

  const jobTitleLower = context.jobTitle.toLowerCase();
  const jobDescLower = context.jobDescription.toLowerCase();
  const combinedText = `${jobTitleLower} ${jobDescLower}`;

  // Base score from popularity (0-30)
  relevanceScore += skill.popularity * 0.3;

  // Check if skill name appears in job title (high relevance)
  if (jobTitleLower.includes(skill.name.toLowerCase())) {
    relevanceScore += 50;
    reasons.push("Mentioned in job title");
  }

  // Check if skill name appears in job description
  if (jobDescLower.includes(skill.name.toLowerCase())) {
    relevanceScore += 40;
    reasons.push("Mentioned in job description");
  }

  // Check category-based keywords from dynamic index only
  // Resolve category key leniently to support label variants
  const resolvedKey = resolveCategoryKey(skill.category) || skill.category;
  const dynamicKeywords = Array.from(
    CATEGORY_KEYWORDS_INDEX[resolvedKey]?.values() || []
  );
  const categoryMatches = dynamicKeywords.filter((keyword) =>
    combinedText.includes(keyword.toLowerCase())
  );

  if (categoryMatches.length > 0) {
    relevanceScore += Math.min(categoryMatches.length * 6, 20);
    reasons.push(`Category keywords: ${categoryMatches.join(", ")}`);
  }

  // Check if skill category matches selected categories
  if (context.selectedCategories.includes(skill.category)) {
    relevanceScore += 15;
    reasons.push("Matches selected category");
  }

  // Check related skills
  const relatedMatches = skill.relatedSkills.filter((relatedSkill) =>
    combinedText.includes(relatedSkill.toLowerCase())
  );

  if (relatedMatches.length > 0) {
    relevanceScore += Math.min(relatedMatches.length * 4, 12);
    reasons.push(`Related skills mentioned: ${relatedMatches.join(", ")}`);
  }

  // Normalize score to 0-100
  relevanceScore = Math.min(Math.max(relevanceScore, 0), 100);

  return {
    ...skill,
    relevanceScore: Math.round(relevanceScore),
    relevanceReason: reasons.length > 0 ? reasons.join("; ") : undefined,
  };
}

// Get skills sorted by relevance
export function getSkillsByRelevance(
  skills: typeof popularSkills,
  context: ProjectContext,
  limit = 10
): SkillRelevance[] {
  return skills
    .map((skill) => calculateSkillRelevance(skill, context))
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit);
}

// Get relevance level for display
export function getRelevanceLevel(score: number): {
  level: "high" | "medium" | "low";
  color: string;
  label: string;
} {
  if (score >= 70) {
    return { level: "high", color: "text-green-600", label: "Highly Relevant" };
  } else if (score >= 40) {
    return {
      level: "medium",
      color: "text-yellow-600",
      label: "Moderately Relevant",
    };
  } else {
    return { level: "low", color: "text-gray-500", label: "Low Relevance" };
  }
}
