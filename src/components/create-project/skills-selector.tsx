import { VALIDATION_LIMITS } from "@/constants/magic-numbers";
import { SkillsAutocomplete } from "./skills-autocomplete";
import { useSkills } from "@/hooks/use-skills";
import { ProjectContext } from "@/utils/skills-relevance";

interface SkillsSelectorProps {
  addedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
  selectedCategories?: string[];
  projectContext?: ProjectContext;
}

export function SkillsSelector({
  addedSkills,
  onSkillsChange,
  selectedCategories = [],
  projectContext,
}: SkillsSelectorProps) {
  const { handleRemoveSkill } = useSkills({
    addedSkills,
    onSkillsChange,
    selectedCategories,
    projectContext,
  });

  return (
    <div className="space-y-4">
      {/* Skills Autocomplete */}
      <SkillsAutocomplete
        addedSkills={addedSkills}
        onSkillsChange={onSkillsChange}
        selectedCategories={selectedCategories}
        projectContext={projectContext}
      />

      {/* Added Skills */}
      {addedSkills.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Added skill
          </label>
          <div className="flex flex-wrap gap-2">
            {addedSkills.map((skill, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-gray-800 text-white px-3 py-1 rounded-full text-sm"
              >
                <span>{skill}</span>
                <button
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-red-300 transition-colors text-sm font-medium"
                >
                  -
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
