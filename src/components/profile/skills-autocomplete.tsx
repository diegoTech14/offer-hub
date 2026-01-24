"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Search, Plus, AlertTriangle, CheckCircle } from "lucide-react";
import { skillCategories, popularSkills } from "@/data/skills-categories";
import type { Skill, SkillSuggestion } from "@/data/skills-categories";
import { validateSkillName } from "@/utils/skill-validation";

export const SkillsAutocomplete: React.FC<{
  onAddSkill: (skill: Omit<Skill, "id">) => void;
  existingSkills: Skill[];
}> = ({ onAddSkill, existingSkills }) => {
  const [input, setInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [suggestions, setSuggestions] = useState<SkillSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLevel, setSelectedLevel] =
    useState<Skill["level"]>("Beginner");
  const [validation, setValidation] = useState<{
    valid: boolean;
    message?: string;
    suggestion?: string;
  }>({ valid: true });

  const filteredSuggestions = useMemo(() => {
    if (!input) return [];

    return popularSkills
      .filter((skill) => {
        const matchesInput = skill.name
          .toLowerCase()
          .includes(input.toLowerCase());
        const matchesCategory =
          !selectedCategory || skill.category === selectedCategory;
        const notExists = !existingSkills.some(
          (existing) => existing.name.toLowerCase() === skill.name.toLowerCase()
        );
        return matchesInput && matchesCategory && notExists;
      })
      .slice(0, 5);
  }, [input, selectedCategory, existingSkills]);

  useEffect(() => {
    if (input) {
      const validationResult = validateSkillName(input);
      setValidation(validationResult);
      setSuggestions(filteredSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setValidation({ valid: true });
    }
  }, [input, filteredSuggestions]);

  const handleAddSkill = (skillName: string, category?: string) => {
    const skillCategory = category || selectedCategory || "technical";
    const suggestion = popularSkills.find((s) => s.name === skillName);

    const newSkill: Omit<Skill, "id"> = {
      name: skillName,
      level: selectedLevel,
      category: skillCategory,
      popularity: suggestion?.popularity,
      demand: suggestion
        ? suggestion.popularity > 85
          ? "High"
          : suggestion.popularity > 70
          ? "Medium"
          : "Low"
        : undefined,
      validated: !!suggestion,
    };

    onAddSkill(newSkill);
    setInput("");
    setShowSuggestions(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && input.trim() && validation.valid) {
      e.preventDefault();
      handleAddSkill(input.trim());
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Add a skill..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validation.valid ? "border-gray-300" : "border-red-300"
              }`}
            />
            {!validation.valid && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
            )}
          </div>

          {(!validation.valid || validation.suggestion) && (
            <div className="mt-1 text-sm">
              {!validation.valid && (
                <span className="text-red-600">{validation.message}</span>
              )}
              {validation.suggestion && (
                <button
                  onClick={() => setInput(validation.suggestion!)}
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  {validation.message}
                </button>
              )}
            </div>
          )}
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {skillCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value as Skill["level"])}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>

        <button
          onClick={() =>
            input.trim() && validation.valid && handleAddSkill(input.trim())
          }
          disabled={!input.trim() || !validation.valid}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Skill
        </button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
          <div className="p-2 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-700">
              Popular Skills
            </span>
          </div>
          {suggestions.map((suggestion, index) => {
            const category = skillCategories.find(
              (cat) => cat.id === suggestion.category
            );
            return (
              <button
                key={index}
                onClick={() =>
                  handleAddSkill(suggestion.name, suggestion.category)
                }
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 text-left"
              >
                <div className="flex items-center gap-3">
                  {category && (
                    <category.icon className="w-4 h-4 text-gray-500" />
                  )}
                  <div>
                    <div className="font-medium text-gray-900">
                      {suggestion.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {category?.name}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`px-2 py-1 rounded-full text-xs ${
                      suggestion.popularity > 85
                        ? "bg-green-100 text-green-700"
                        : suggestion.popularity > 70
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {suggestion.popularity}% popular
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
