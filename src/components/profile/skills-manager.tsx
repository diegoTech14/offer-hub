"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Skill } from "@/data/skills-categories";
import { popularSkills } from "@/data/skills-categories";
import { skillCategories } from "@/data/skills-categories";
import { SkillsAutocomplete } from "./skills-autocomplete";
import { SkillTag } from "./skill-tag";
import {
  Search,
  Plus,
  Award,
  BarChart3,
  Lightbulb,
  Zap,
  Target,
  Star,
  AlertTriangle,
  CheckCircle,
  Undo2,
} from "lucide-react";

export const SkillsManager: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([
    {
      id: "1",
      name: "React",
      level: "Advanced",
      category: "technical",
      popularity: 95,
      demand: "High",
      validated: true,
    },
    {
      id: "2",
      name: "UI/UX Design",
      level: "Intermediate",
      category: "design",
      popularity: 88,
      demand: "High",
      validated: true,
    },
    {
      id: "3",
      name: "Project Management",
      level: "Advanced",
      category: "business",
      popularity: 85,
      demand: "Medium",
      validated: true,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [sortBy, setSortBy] = useState<
    "name" | "level" | "category" | "popularity"
  >("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [recentlyRemoved, setRecentlyRemoved] = useState<Skill | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // Drag and drop functionality
  const handleDragStart = (e: React.DragEvent, skillId: string) => {
    setDraggedItem(skillId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();

    if (!draggedItem) return;

    const draggedIndex = skills.findIndex((skill) => skill.id === draggedItem);
    const targetIndex = skills.findIndex((skill) => skill.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newSkills = [...skills];
    const [draggedSkill] = newSkills.splice(draggedIndex, 1);
    newSkills.splice(targetIndex, 0, draggedSkill);

    setSkills(newSkills);
    setDraggedItem(null);
  };

  const addSkill = useCallback(
    (skillData: Omit<Skill, "id">) => {
      const isDuplicate = skills.some(
        (skill) => skill.name.toLowerCase() === skillData.name.toLowerCase()
      );

      if (isDuplicate) {
        alert("This skill already exists in your profile!");
        return;
      }

      const newSkill: Skill = {
        ...skillData,
        id: Date.now().toString(),
      };

      setSkills((prev) => [...prev, newSkill]);
    },
    [skills]
  );

  const removeSkill = useCallback(
    (id: string) => {
      const skillToRemove = skills.find((skill) => skill.id === id);
      if (skillToRemove) {
        setSkills((prev) => prev.filter((skill) => skill.id !== id));
        setRecentlyRemoved(skillToRemove);

        // Auto-clear undo after 5 seconds
        setTimeout(() => setRecentlyRemoved(null), 5000);
      }
    },
    [skills]
  );

  const undoRemoval = useCallback(() => {
    if (recentlyRemoved) {
      setSkills((prev) => [...prev, recentlyRemoved]);
      setRecentlyRemoved(null);
    }
  }, [recentlyRemoved]);

  const updateSkillLevel = useCallback((id: string, level: Skill["level"]) => {
    setSkills((prev) =>
      prev.map((skill) => (skill.id === id ? { ...skill, level } : skill))
    );
  }, []);

  // Filter and sort skills
  const filteredAndSortedSkills = useMemo(() => {
    const filtered = skills.filter((skill) => {
      const matchesSearch = skill.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        !selectedCategory || skill.category === selectedCategory;
      const matchesLevel = !selectedLevel || skill.level === selectedLevel;
      return matchesSearch && matchesCategory && matchesLevel;
    });

    return filtered.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      if (sortBy === "popularity") {
        aValue = a.popularity || 0;
        bValue = b.popularity || 0;
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      const comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [skills, searchTerm, selectedCategory, selectedLevel, sortBy, sortOrder]);

  // Related skills suggestions
  const getRelatedSkills = useMemo(() => {
    const userSkillNames = skills.map((skill) => skill.name.toLowerCase());
    const suggestions = new Set<string>();

    skills.forEach((skill) => {
      const popularSkill = popularSkills.find(
        (p) => p.name.toLowerCase() === skill.name.toLowerCase()
      );

      if (popularSkill) {
        popularSkill.relatedSkills.forEach((related) => {
          if (!userSkillNames.includes(related.toLowerCase())) {
            suggestions.add(related);
          }
        });
      }
    });

    return Array.from(suggestions).slice(0, 5);
  }, [skills]);

  // Analytics data
  const analytics = useMemo(() => {
    const totalSkills = skills.length;
    const byLevel = skills.reduce((acc, skill) => {
      acc[skill.level] = (acc[skill.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byCategory = skills.reduce((acc, skill) => {
      const category = skillCategories.find((cat) => cat.id === skill.category);
      const categoryName = category?.name || "Other";
      acc[categoryName] = (acc[categoryName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgPopularity =
      skills.reduce((sum, skill) => sum + (skill.popularity || 0), 0) /
      totalSkills;

    return { totalSkills, byLevel, byCategory, avgPopularity };
  }, [skills]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Skills Management
          </h1>
          <p className="text-gray-600 mt-2">
            Showcase your professional capabilities with detailed categorization
            and skill levels
          </p>
        </div>
        <button
          onClick={() => setShowAnalytics(!showAnalytics)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <BarChart3 className="w-4 h-4" />
          Analytics
        </button>
      </div>

      {/* Analytics Panel */}
      {showAnalytics && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Skills Analytics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-indigo-600">
                {analytics.totalSkills}
              </div>
              <div className="text-sm text-gray-600">Total Skills</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-green-600">
                {analytics.byLevel.Advanced || 0}
              </div>
              <div className="text-sm text-gray-600">Advanced Skills</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-blue-600">
                {Object.keys(analytics.byCategory).length}
              </div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(analytics.avgPopularity)}%
              </div>
              <div className="text-sm text-gray-600">Avg Popularity</div>
            </div>
          </div>
        </div>
      )}

      {/* Undo Banner */}
      {recentlyRemoved && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-800">
              Removed skill: <strong>{recentlyRemoved.name}</strong>
            </span>
          </div>
          <button
            onClick={undoRemoval}
            className="flex items-center gap-2 px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
          >
            <Undo2 className="w-4 h-4" />
            Undo
          </button>
        </div>
      )}

      {/* Add Skills Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Add New Skills
        </h2>
        <SkillsAutocomplete onAddSkill={addSkill} existingSkills={skills} />
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search your skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split("-");
                setSortBy(field as any);
                setSortOrder(order as any);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="level-asc">Level: Beginner First</option>
              <option value="level-desc">Level: Advanced First</option>
              <option value="category-asc">Category A-Z</option>
              <option value="popularity-desc">Popularity: High-Low</option>
            </select>
          </div>
        </div>

        {/* Skills Display */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Your Skills ({filteredAndSortedSkills.length})
            </h3>
            <div className="text-sm text-gray-600">
              Drag to reorder • Click level to change
            </div>
          </div>

          {filteredAndSortedSkills.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Lightbulb className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No skills found
              </h3>
              <p className="text-gray-600">
                {searchTerm || selectedCategory || selectedLevel
                  ? "Try adjusting your filters or search term"
                  : "Start by adding your first skill above"}
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {filteredAndSortedSkills.map((skill) => (
                <div
                  key={skill.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, skill.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, skill.id)}
                  className={draggedItem === skill.id ? "opacity-50" : ""}
                >
                  <SkillTag
                    skill={skill}
                    onRemove={removeSkill}
                    onLevelChange={updateSkillLevel}
                    isDragging={draggedItem === skill.id}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        {skills.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="text-md font-semibold text-gray-900 mb-4">
              Skills by Category
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {skillCategories.map((category) => {
                const categorySkills = skills.filter(
                  (skill) => skill.category === category.id
                );
                const IconComponent = category.icon;

                return (
                  <div key={category.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-8 h-8 rounded-lg ${category.color} bg-opacity-20 flex items-center justify-center`}
                      >
                        <IconComponent
                          className={`w-4 h-4 ${category.color.replace(
                            "bg-",
                            "text-"
                          )}`}
                        />
                      </div>
                      <span className="font-medium text-gray-900">
                        {category.name}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {categorySkills.length}
                    </div>
                    <div className="text-sm text-gray-600">
                      {
                        categorySkills.filter((s) => s.level === "Advanced")
                          .length
                      }{" "}
                      Advanced
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Related Skills Suggestions */}
      {getRelatedSkills.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Suggested Skills
            </h3>
            <span className="text-sm text-gray-600">
              Based on your current skills
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {getRelatedSkills.map((skillName, index) => {
              const suggestion = popularSkills.find(
                (s) => s.name === skillName
              );
              const category = skillCategories.find(
                (cat) => cat.id === suggestion?.category
              );

              return (
                <button
                  key={index}
                  onClick={() =>
                    addSkill({
                      name: skillName,
                      level: "Beginner",
                      category: suggestion?.category || "technical",
                      popularity: suggestion?.popularity,
                      demand: suggestion
                        ? suggestion.popularity > 85
                          ? "High"
                          : suggestion.popularity > 70
                          ? "Medium"
                          : "Low"
                        : undefined,
                      validated: !!suggestion,
                    })
                  }
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-blue-200 rounded-full hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  {category && (
                    <category.icon className="w-4 h-4 text-gray-500" />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {skillName}
                  </span>
                  <Plus className="w-3 h-3 text-blue-600" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Skill Level Definitions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Skill Level Definitions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-600" />
              <span className="font-semibold text-gray-900">Beginner</span>
            </div>
            <p className="text-sm text-gray-600">
              Basic understanding and limited practical experience. Can perform
              simple tasks with guidance.
            </p>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
              <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-900">Intermediate</span>
            </div>
            <p className="text-sm text-gray-600">
              Good working knowledge with moderate experience. Can work
              independently on most tasks.
            </p>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-gray-900">Advanced</span>
            </div>
            <p className="text-sm text-gray-600">
              Expert-level proficiency with extensive experience. Can mentor
              others and handle complex challenges.
            </p>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="bg-gray-50 rounded-xl p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {skills.length}
            </div>
            <div className="text-sm text-gray-600">Total Skills</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {skills.filter((s) => s.level === "Advanced").length}
            </div>
            <div className="text-sm text-gray-600">Advanced</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {new Set(skills.map((s) => s.category)).size}
            </div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {skills.filter((s) => s.validated).length}
            </div>
            <div className="text-sm text-gray-600">Validated</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsManager;
