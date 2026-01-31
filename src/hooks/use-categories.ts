import { useState, useCallback, useRef, useMemo } from "react";
import { VALIDATION_LIMITS } from "@/constants/magic-numbers";
import { skillCategories, popularSkills } from "@/data/skills-categories";

interface UseCategoriesProps {
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  addedSkills?: string[];
}

export function useCategories({
  selectedCategories,
  onCategoriesChange,
  addedSkills = [],
}: UseCategoriesProps) {
  const [categorySearch, setCategorySearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddCategory = useCallback(
    (categoryId: string) => {
      if (
        !selectedCategories.includes(categoryId) &&
        selectedCategories.length < VALIDATION_LIMITS.MAX_JOB_TYPES_SELECTION
      ) {
        onCategoriesChange([...selectedCategories, categoryId]);
        setCategorySearch("");
        setShowSuggestions(false);
        // Remove focus from input after adding category
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.blur();
          }
        }, 10);
      }
    },
    [selectedCategories, onCategoriesChange]
  );

  const handleRemoveCategory = useCallback(
    (categoryToRemove: string) => {
      onCategoriesChange(
        selectedCategories.filter((category) => category !== categoryToRemove)
      );
    },
    [selectedCategories, onCategoriesChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        // Find category by name if searching
        const foundCategory = skillCategories.find((cat) =>
          cat.name.toLowerCase().includes(categorySearch.toLowerCase())
        );
        if (foundCategory) {
          handleAddCategory(foundCategory.id);
        }
      }
    },
    [categorySearch, handleAddCategory]
  );

  // Get suggested categories based on selected skills
  const getSuggestedCategories = useCallback(() => {
    if (addedSkills.length === 0) return [];

    const categoryScores = new Map<string, number>();

    // Count how many skills belong to each category
    addedSkills.forEach((skillName) => {
      const skillData = popularSkills.find(
        (skill) => skill.name.toLowerCase() === skillName.toLowerCase()
      );

      if (skillData) {
        const currentScore = categoryScores.get(skillData.category) || 0;
        categoryScores.set(skillData.category, currentScore + 1);
      }
    });

    // Convert to array and sort by score (highest first)
    return Array.from(categoryScores.entries())
      .filter(
        ([categoryId, score]) =>
          score > 0 && !selectedCategories.includes(categoryId)
      )
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3) // Show top 3 suggested categories
      .map(([categoryId]) => categoryId);
  }, [addedSkills, selectedCategories]);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    // If there's a search term, return search results
    if (categorySearch.trim()) {
      return skillCategories.filter(
        (category) =>
          category.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
          category.subcategories?.some((sub) =>
            sub.toLowerCase().includes(categorySearch.toLowerCase())
          )
      );
    }

    // If no search term, show all available categories
    // with suggested ones marked and prioritized
    const suggestedCategoryIds = getSuggestedCategories();
    const allCategories = skillCategories.map((category) => ({
      ...category,
      isSuggested: suggestedCategoryIds.includes(category.id),
      suggestionOrder: suggestedCategoryIds.indexOf(category.id),
    }));

    // Sort: suggested categories first, then others
    return allCategories.sort((a, b) => {
      if (a.isSuggested && !b.isSuggested) return -1;
      if (!a.isSuggested && b.isSuggested) return 1;
      if (a.isSuggested && b.isSuggested) {
        return a.suggestionOrder - b.suggestionOrder;
      }
      return 0;
    });
  }, [categorySearch, getSuggestedCategories]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setCategorySearch(value);
      setShowSuggestions(true);
    },
    []
  );

  const handleInputFocus = useCallback(() => {
    setShowSuggestions(true);
  }, []);

  const handleInputBlur = useCallback(() => {
    setTimeout(() => setShowSuggestions(false), 150);
  }, []);

  const handleSuggestionClick = useCallback(
    (categoryId: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleAddCategory(categoryId);
    },
    [handleAddCategory]
  );

  const handleSuggestionMouseDown = useCallback(
    (categoryId: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleAddCategory(categoryId);
    },
    [handleAddCategory]
  );

  return {
    categorySearch,
    showSuggestions,
    filteredCategories,
    inputRef,
    handleSearchChange,
    handleInputFocus,
    handleInputBlur,
    handleKeyDown,
    handleSuggestionClick,
    handleSuggestionMouseDown,
    handleAddCategory,
    handleRemoveCategory,
  };
}
