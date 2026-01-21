import { useState, useCallback, useMemo, useRef } from "react";
import { VALIDATION_LIMITS } from "@/constants/magic-numbers";
import { popularSkills } from "@/data/skills-categories";
import { validateSkillName } from "@/utils/skill-validation";
import {
  ProjectContext,
  getSkillsByRelevance,
  getRelevanceLevel,
} from "@/utils/skills-relevance";

interface UseSkillsProps {
  addedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
  selectedCategories?: string[];
  projectContext?: ProjectContext;
}

export function useSkills({
  addedSkills,
  onSkillsChange,
  selectedCategories = [],
  projectContext,
}: UseSkillsProps) {
  const [skillSearch, setSkillSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validationSuggestion, setValidationSuggestion] = useState<
    string | null
  >(null);
  const [suggestedSkillName, setSuggestedSkillName] = useState<string | null>(
    null
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddSkill = useCallback(
    (skill: string, forceAdd = false) => {
      // Clear previous validation messages
      setValidationError(null);
      setValidationSuggestion(null);
      setSuggestedSkillName(null);

      // If forceAdd is true, we'll skip validation and add the skill directly
      if (forceAdd) {
        if (
          skill.trim() &&
          !addedSkills.includes(skill.trim()) &&
          addedSkills.length < VALIDATION_LIMITS.MAX_SKILLS_PER_PROJECT
        ) {
          onSkillsChange([...addedSkills, skill.trim()]);
          setSkillSearch("");
          setShowSuggestions(false);
          // Remove focus from input after adding skill
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.blur();
            }
          }, 10);
        }
        return;
      }

      // Validate the skill
      const validation = validateSkillName(skill);

      if (!validation.valid) {
        setValidationError(validation.message || "Invalid skill name");
        setShowSuggestions(false); // Close dropdown when showing error
        return;
      }

      // If there's a suggestion, show it but don't add the skill yet
      if (validation.suggestion) {
        setValidationSuggestion(validation.message || "");
        setSuggestedSkillName(validation.suggestion);
        setShowSuggestions(false); // Close dropdown when showing suggestion
        return;
      }

      // Add the skill if validation passes
      if (
        skill.trim() &&
        !addedSkills.includes(skill.trim()) &&
        addedSkills.length < VALIDATION_LIMITS.MAX_SKILLS_PER_PROJECT
      ) {
        onSkillsChange([...addedSkills, skill.trim()]);
        setSkillSearch("");
        setShowSuggestions(false);
        // Remove focus from input after adding skill
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.blur();
          }
        }, 10);
      }
    },
    [addedSkills, onSkillsChange]
  );

  const handleRemoveSkill = useCallback(
    (skillToRemove: string) => {
      onSkillsChange(addedSkills.filter((skill) => skill !== skillToRemove));
    },
    [addedSkills, onSkillsChange]
  );

  const handleAcceptSuggestion = useCallback(() => {
    if (suggestedSkillName) {
      setValidationError(null);
      setValidationSuggestion(null);
      setSuggestedSkillName(null);
      // Add the suggested skill directly without validation
      if (
        !addedSkills.includes(suggestedSkillName) &&
        addedSkills.length < VALIDATION_LIMITS.MAX_SKILLS_PER_PROJECT
      ) {
        onSkillsChange([...addedSkills, suggestedSkillName]);
        setSkillSearch("");
        setShowSuggestions(false);
        // Remove focus from input after adding skill
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.blur();
          }
        }, 10);
      }
    }
  }, [suggestedSkillName, addedSkills, onSkillsChange]);

  const handleDismissValidation = useCallback(() => {
    setValidationError(null);
    setValidationSuggestion(null);
    setSuggestedSkillName(null);
  }, []);

  const handleForceAddSkill = useCallback(() => {
    if (skillSearch.trim()) {
      handleAddSkill(skillSearch, true);
    }
  }, [skillSearch, handleAddSkill]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        // Always validate the exact text the user typed
        handleAddSkill(skillSearch);
      }
    },
    [skillSearch, handleAddSkill]
  );

  // Get suggested skills based on already added skills and selected categories
  const getSuggestedSkills = useCallback(() => {
    const suggestedSkills = new Set<string>();

    // First, get related skills from already added skills
    addedSkills.forEach((addedSkill) => {
      const skillData = popularSkills.find(
        (skill) => skill.name.toLowerCase() === addedSkill.toLowerCase()
      );

      if (skillData) {
        skillData.relatedSkills.forEach((relatedSkill) => {
          if (!addedSkills.includes(relatedSkill)) {
            suggestedSkills.add(relatedSkill);
          }
        });
      }
    });

    // If we have selected categories, also suggest popular skills from those categories
    if (selectedCategories.length > 0) {
      const categorySkills = popularSkills
        .filter((skill) => selectedCategories.includes(skill.category))
        .filter((skill) => !addedSkills.includes(skill.name))
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 5); // Get top 5 popular skills from selected categories

      categorySkills.forEach((skill) => {
        suggestedSkills.add(skill.name);
      });
    }

    return Array.from(suggestedSkills);
  }, [addedSkills, selectedCategories]);

  // Filter skills based on search and include suggestions
  const filteredSkills = useMemo(() => {
    // If there's a search term, return matching skills with relevance scoring
    if (skillSearch.trim()) {
      const searchResults = popularSkills.filter((skill) =>
        skill.name.toLowerCase().includes(skillSearch.toLowerCase())
      );

      // If we have project context, apply relevance scoring
      if (projectContext) {
        return getSkillsByRelevance(searchResults, projectContext, 10);
      }

      return searchResults;
    }

    // If no search term, show suggested skills with relevance scoring
    const suggestedSkills = getSuggestedSkills();
    const suggestedSkillsData = suggestedSkills
      .slice(0, 5)
      .map((skillName) => ({
        name: skillName,
        category: "Suggested",
        popularity: 0,
        relatedSkills: [],
      }));

    // If we have project context
    if (projectContext) {
      // Case 1: We do have some related/category suggestions → score those
      if (suggestedSkillsData.length > 0) {
        return getSkillsByRelevance(
          suggestedSkillsData as any,
          projectContext,
          5
        );
      }
      // Case 2: No related/category suggestions → fall back to context-only relevance
      return getSkillsByRelevance(popularSkills as any, projectContext, 5);
    }

    // No context → return plain related/category suggestions
    return suggestedSkillsData;
  }, [skillSearch, getSuggestedSkills, projectContext]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSkillSearch(value);
      setShowSuggestions(true);

      // Clear validation messages when user types
      if (validationError || validationSuggestion) {
        setValidationError(null);
        setValidationSuggestion(null);
        setSuggestedSkillName(null);
      }
    },
    [validationError, validationSuggestion]
  );

  const handleInputFocus = useCallback(() => {
    setShowSuggestions(true);
  }, []);

  const handleInputBlur = useCallback(() => {
    setTimeout(() => setShowSuggestions(false), 150);
  }, []);

  const handleSuggestionClick = useCallback(
    (skillName: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Clear validation state when selecting from dropdown
      setValidationError(null);
      setValidationSuggestion(null);
      setSuggestedSkillName(null);

      // Add the skill directly
      handleAddSkill(skillName, true);
    },
    [handleAddSkill]
  );

  return {
    skillSearch,
    showSuggestions,
    filteredSkills,
    inputRef,
    validationError,
    validationSuggestion,
    suggestedSkillName,
    handleSearchChange,
    handleInputFocus,
    handleInputBlur,
    handleKeyDown,
    handleSuggestionClick,
    handleAddSkill,
    handleRemoveSkill,
    handleAcceptSuggestion,
    handleDismissValidation,
    handleForceAddSkill,
  };
}
