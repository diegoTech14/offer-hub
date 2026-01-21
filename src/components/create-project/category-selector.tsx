import { VALIDATION_LIMITS } from "@/constants/magic-numbers";
import { skillCategories } from "@/data/skills-categories";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCategories } from "@/hooks/use-categories";

interface CategorySelectorProps {
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  addedSkills?: string[];
}

export function CategorySelector({
  selectedCategories,
  onCategoriesChange,
  addedSkills = [],
}: CategorySelectorProps) {
  const {
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
    handleRemoveCategory,
  } = useCategories({ selectedCategories, onCategoriesChange, addedSkills });

  return (
    <div className="space-y-4">
      {/* Category Search */}
      <div className="space-y-2">
        <label
          htmlFor="categorySearch"
          className="text-sm font-medium text-gray-700"
        >
          Project Category
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            ref={inputRef}
            id="categorySearch"
            type="text"
            placeholder={`Search and add up to ${VALIDATION_LIMITS.MAX_JOB_TYPES_SELECTION} categories`}
            value={categorySearch}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className="w-full pl-10 rounded-lg border border-gray-300"
          />

          {/* Suggestions Dropdown */}
          {showSuggestions && filteredCategories.length > 0 && (
            <div className="absolute z-30 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              <>
                {/* Show section header when no search */}
                {!categorySearch.trim() && (
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-xs font-medium text-gray-600">
                        {addedSkills.length > 0 &&
                        filteredCategories.some(
                          (cat) => (cat as any).isSuggested
                        )
                          ? "Suggested for you"
                          : "All Categories"}
                      </span>
                    </div>
                  </div>
                )}

                {filteredCategories.map((category) => {
                  const isSelected = selectedCategories.includes(category.id);
                  const isDisabled =
                    selectedCategories.length >=
                      VALIDATION_LIMITS.MAX_JOB_TYPES_SELECTION && !isSelected;
                  const isSuggested = (category as any).isSuggested;

                  return (
                    <button
                      key={category.id}
                      onMouseDown={(e) =>
                        handleSuggestionMouseDown(category.id, e)
                      }
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
                            <div className="font-medium">{category.name}</div>
                            {isSuggested && (
                              <span className="text-xs text-blue-600 font-medium">
                                Suggested
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {isSuggested
                              ? "Based on your selected skills"
                              : category.subcategories && (
                                  <>
                                    {category.subcategories
                                      .slice(0, 3)
                                      .join(", ")}
                                    {category.subcategories.length > 3 && "..."}
                                  </>
                                )}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="ml-2 flex-shrink-0">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✓ Already Added
                            </span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </>
            </div>
          )}
        </div>
      </div>

      {/* Selected Categories */}
      {selectedCategories.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Selected Categories
          </label>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((categoryId) => {
              const category = skillCategories.find(
                (cat) => cat.id === categoryId
              );
              if (!category) return null;

              return (
                <div
                  key={categoryId}
                  className="flex items-center gap-2 bg-gray-800 text-white px-3 py-1 rounded-full text-sm"
                >
                  <span>{category.name}</span>
                  <button
                    onClick={() => handleRemoveCategory(categoryId)}
                    className="hover:text-red-300 transition-colors text-sm font-medium"
                  >
                    -
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
