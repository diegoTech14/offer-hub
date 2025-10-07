import { popularSkills } from "@/data/skills-categories";

export const fuzzyMatch = (
  input: string,
  target: string,
  threshold = 0.7
): boolean => {
  const inputLower = input.toLowerCase();
  const targetLower = target.toLowerCase();

  if (inputLower === targetLower) return true;
  if (targetLower.includes(inputLower)) return true;
  if (inputLower.includes(targetLower)) return true;

  const distance = levenshteinDistance(inputLower, targetLower);
  const similarity =
    1 - distance / Math.max(inputLower.length, targetLower.length);
  return similarity >= threshold;
};

export const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }

  return matrix[str2.length][str1.length];
};

export const validateSkillName = (
  name: string
): { valid: boolean; message?: string; suggestion?: string } => {
  if (!name || name.trim().length === 0) {
    return { valid: false, message: "Skill name cannot be empty" };
  }

  if (name.length > 50) {
    return {
      valid: false,
      message: "Skill name must be 50 characters or less",
    };
  }

  if (name.length < 2) {
    return {
      valid: false,
      message: "Skill name must be at least 2 characters",
    };
  }

  const invalidChars = /[<>{}[\]\\]/;
  if (invalidChars.test(name)) {
    return { valid: false, message: "Skill name contains invalid characters" };
  }

  // Check for similar existing skills
  const existingSkill = popularSkills.find((skill) =>
    fuzzyMatch(name, skill.name, 0.6)
  );

  if (
    existingSkill &&
    existingSkill.name.toLowerCase() !== name.toLowerCase()
  ) {
    return {
      valid: true,
      suggestion: existingSkill.name,
      message: `Did you mean "${existingSkill.name}"?`,
    };
  }

  return { valid: true };
};
