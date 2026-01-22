import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { VALIDATION_LIMITS } from "@/constants/magic-numbers";
import { useSkills } from "@/hooks/use-skills";
import { ProjectContext, getRelevanceLevel } from "@/utils/skills-relevance";

interface SkillsAutocompleteProps {
  addedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
  selectedCategories?: string[];
  projectContext?: ProjectContext;
}

export function SkillsAutocomplete({
  addedSkills,
  onSkillsChange,
  selectedCategories = [],
  projectContext,
}: SkillsAutocompleteProps) {
  const {
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
    handleAcceptSuggestion,
    handleDismissValidation,
    handleForceAddSkill,
  } = useSkills({
    addedSkills,
    onSkillsChange,
    selectedCategories,
    projectContext,
  });

  return (
    <div className="space-y-2">
      <label
        htmlFor="skillSearch"
        className="text-sm font-medium text-gray-700"
      >
        Skill required for project
      </label>
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
        <Input
          ref={inputRef}
          id="skillSearch"
          type="text"
          placeholder={`Search and add up to ${VALIDATION_LIMITS.MAX_SKILLS_PER_PROJECT} skills`}
          value={skillSearch}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className="w-full pl-10 rounded-lg border border-gray-300"
        />

        {/* Suggestions Dropdown */}
        {showSuggestions && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredSkills.length > 0 ? (
              <>
                {/* Show section header for suggestions when no search */}
                {!skillSearch.trim() &&
                  (addedSkills.length > 0 || projectContext) && (
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-xs font-medium text-gray-600">
                          Suggested for you
                        </span>
                      </div>
                    </div>
                  )}

                {filteredSkills.map((skill) => {
                  const isSelected = addedSkills.includes(skill.name);
                  const isDisabled =
                    addedSkills.length >=
                      VALIDATION_LIMITS.MAX_SKILLS_PER_PROJECT && !isSelected;
                  const isSuggested = skill.category === "Suggested";

                  // Get relevance information if available
                  const relevanceInfo =
                    (skill as any).relevanceScore !== undefined
                      ? getRelevanceLevel((skill as any).relevanceScore)
                      : null;

                  return (
                    <button
                      key={skill.name}
                      onClick={(e) => handleSuggestionClick(skill.name, e)}
                      disabled={isDisabled || isSelected}
                      className={`
                        w-full px-4 py-2 text-left transition-colors relative
                        ${
                          isSelected
                            ? "bg-green-50 text-green-700 cursor-default"
                            : isDisabled
                            ? "text-gray-400 cursor-not-allowed hover:bg-gray-50"
                            : "text-gray-700 hover:bg-gray-50"
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-medium">{skill.name}</div>
                            {relevanceInfo && (
                              <span
                                className={`text-xs font-medium ${relevanceInfo.color}`}
                              >
                                {relevanceInfo.label}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {isSuggested
                              ? selectedCategories.length > 0
                                ? "Based on your selected skills and categories"
                                : "Based on your selected skills"
                              : (skill as any).relevanceReason
                              ? (skill as any).relevanceReason
                              : `${skill.category} • Popularity: ${skill.popularity}%`}
                          </div>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex items-center gap-2">
                          {relevanceInfo && (
                            <div className="text-xs text-gray-400">
                              {(skill as any).relevanceScore}%
                            </div>
                          )}
                          {isSelected && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✓ Already Added
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </>
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                {addedSkills.length >= VALIDATION_LIMITS.MAX_SKILLS_PER_PROJECT
                  ? `You've reached the maximum of ${VALIDATION_LIMITS.MAX_SKILLS_PER_PROJECT} skills`
                  : skillSearch.trim()
                  ? "No matching skills found"
                  : addedSkills.length === 0
                  ? "Start typing to search for skills or select categories for suggestions"
                  : "No more suggestions available. Try searching for specific skills."}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Validation Messages */}
      {validationError && (
        <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 text-red-500 flex-shrink-0">
              <svg
                className="w-full h-full"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs text-red-700">{validationError}</p>
            </div>
            <button
              onClick={handleDismissValidation}
              className="text-red-400 hover:text-red-600 text-xs px-2 py-1 rounded hover:bg-red-100 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {validationSuggestion && (
        <div className="mt-1 p-2 bg-amber-50 border border-amber-200 rounded-md">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 text-amber-600 flex-shrink-0">
              <svg
                className="w-full h-full"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs text-amber-800">{validationSuggestion}</p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={handleAcceptSuggestion}
                className="text-xs bg-amber-600 text-white px-2 py-1 rounded hover:bg-amber-700 transition-colors"
              >
                Use
              </button>
              <button
                onClick={handleForceAddSkill}
                className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700 transition-colors"
              >
                Add anyway
              </button>
              <button
                onClick={handleDismissValidation}
                className="text-xs text-amber-600 hover:text-amber-800 px-2 py-1 rounded hover:bg-amber-100 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
