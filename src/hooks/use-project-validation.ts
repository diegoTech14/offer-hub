// Comprehensive Project Validation Logic
import { 
  CreateProjectDTO, 
  UpdateProjectDTO, 
  ProjectValidationResult, 
  ProjectValidationError,
  ProjectStatus,
  ProjectDraft
} from '@/types/project.types';

export interface ValidationRule {
  field: string;
  validator: (value: any, data: any) => boolean;
  message: string;
  code: string;
  severity: 'error' | 'warning';
}

export interface ValidationConfig {
  strictMode: boolean;
  validateOnChange: boolean;
  validateOnBlur: boolean;
  customRules: ValidationRule[];
  skipFields: string[];
}

export class ProjectValidator {
  private config: ValidationConfig;
  private customRules: Map<string, ValidationRule[]>;

  constructor(config: Partial<ValidationConfig> = {}) {
    this.config = {
      strictMode: false,
      validateOnChange: true,
      validateOnBlur: true,
      customRules: [],
      skipFields: [],
      ...config
    };
    
    this.customRules = new Map();
    this.setupCustomRules();
  }

  // Main validation methods
  validateProject(project: CreateProjectDTO | UpdateProjectDTO): ProjectValidationResult {
    const errors: ProjectValidationError[] = [];
    const warnings: ProjectValidationError[] = [];

    // Skip validation for deleted projects
    if ('status' in project && project.status === 'deleted') {
      return { isValid: true, errors: [], warnings: [] };
    }

    // Validate required fields
    this.validateRequiredFields(project, errors);
    
    // Validate field formats
    this.validateFieldFormats(project, errors, warnings);
    
    // Validate business rules
    this.validateBusinessRules(project, errors, warnings);
    
    // Validate custom rules
    this.validateCustomRules(project, errors, warnings);
    
    // Validate dependencies
    this.validateDependencies(project, errors, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  validateDraft(draft: ProjectDraft): ProjectValidationResult {
    // Convert draft to CreateProjectDTO for validation
    const project: CreateProjectDTO = {
      client_id: draft.client_id,
      title: draft.title,
      description: draft.description,
      category: draft.category,
      budget: draft.budgetAmount,
      subcategory: draft.subcategory,
      skills: draft.skills,
      experienceLevel: draft.experienceLevel as any,
      projectType: draft.projectType,
      visibility: draft.visibility,
      budgetType: draft.budgetType,
      duration: draft.duration,
      attachments: draft.attachments,
      milestones: draft.milestones,
      tags: draft.tags,
      location: draft.location,
      deadline: draft.deadline,
      requirements: draft.requirements
    };

    return this.validateProject(project);
  }

  validateField(field: string, value: any, project: any): ProjectValidationError[] {
    const errors: ProjectValidationError[] = [];
    
    // Skip if field is in skip list
    if (this.config.skipFields.includes(field)) {
      return errors;
    }

    // Validate based on field type
    switch (field) {
      case 'title':
        errors.push(...this.validateTitle(value));
        break;
      case 'description':
        errors.push(...this.validateDescription(value));
        break;
      case 'budget':
        errors.push(...this.validateBudget(value));
        break;
      case 'category':
        errors.push(...this.validateCategory(value));
        break;
      case 'deadline':
        errors.push(...this.validateDeadline(value, project));
        break;
      case 'skills':
        errors.push(...this.validateSkills(value));
        break;
      case 'milestones':
        errors.push(...this.validateMilestones(value));
        break;
      case 'attachments':
        errors.push(...this.validateAttachments(value));
        break;
      case 'location':
        errors.push(...this.validateLocation(value));
        break;
      case 'requirements':
        errors.push(...this.validateRequirements(value));
        break;
      default:
        // Validate custom fields
        errors.push(...this.validateCustomField(field, value, project));
    }

    return errors;
  }

  // Required field validation
  private validateRequiredFields(project: any, errors: ProjectValidationError[]): void {
    const requiredFields = [
      'client_id',
      'title',
      'description',
      'category',
      'budget'
    ];

    requiredFields.forEach(field => {
      if (!project[field] || (typeof project[field] === 'string' && project[field].trim() === '')) {
        errors.push({
          field,
          message: `${this.getFieldDisplayName(field)} is required`,
          code: 'REQUIRED_FIELD',
          value: project[field]
        });
      }
    });
  }

  // Field format validation
  private validateFieldFormats(project: any, errors: ProjectValidationError[], warnings: ProjectValidationError[]): void {
    // Title validation
    if (project.title) {
      errors.push(...this.validateTitle(project.title));
    }

    // Description validation
    if (project.description) {
      errors.push(...this.validateDescription(project.description));
    }

    // Budget validation
    if (project.budget !== undefined) {
      errors.push(...this.validateBudget(project.budget));
    }

    // Category validation
    if (project.category) {
      errors.push(...this.validateCategory(project.category));
    }

    // Skills validation
    if (project.skills) {
      errors.push(...this.validateSkills(project.skills));
    }

    // Milestones validation
    if (project.milestones) {
      errors.push(...this.validateMilestones(project.milestones));
    }

    // Attachments validation
    if (project.attachments) {
      errors.push(...this.validateAttachments(project.attachments));
    }

    // Location validation
    if (project.location) {
      errors.push(...this.validateLocation(project.location));
    }

    // Requirements validation
    if (project.requirements) {
      errors.push(...this.validateRequirements(project.requirements));
    }

    // Deadline validation
    if (project.deadline) {
      errors.push(...this.validateDeadline(project.deadline, project));
    }
  }

  // Business rules validation
  private validateBusinessRules(project: any, errors: ProjectValidationError[], warnings: ProjectValidationError[]): void {
    // Budget vs project type validation
    if (project.budgetType === 'hourly' && project.budget > 1000) {
      warnings.push({
        field: 'budget',
        message: 'Hourly rate above $1000/hour is unusual. Please verify this is correct.',
        code: 'HIGH_HOURLY_RATE',
        value: project.budget
      });
    }

    // Fixed budget validation
    if (project.budgetType === 'fixed' && project.budget < 50) {
      warnings.push({
        field: 'budget',
        message: 'Fixed budget below $50 is very low. Consider if this is appropriate.',
        code: 'LOW_FIXED_BUDGET',
        value: project.budget
      });
    }

    // Duration vs project type validation
    if (project.projectType === 'on-time' && !project.deadline) {
      errors.push({
        field: 'deadline',
        message: 'Deadline is required for one-time projects',
        code: 'MISSING_DEADLINE',
        value: project.deadline
      });
    }

    // Skills vs experience level validation
    if (project.skills && project.skills.length > 10) {
      warnings.push({
        field: 'skills',
        message: 'More than 10 skills may make the project too broad. Consider focusing on core requirements.',
        code: 'TOO_MANY_SKILLS',
        value: project.skills
      });
    }

    // Milestone validation
    if (project.milestones && project.milestones.length > 0) {
      const totalMilestoneAmount = project.milestones.reduce((sum: number, milestone: any) => sum + milestone.amount, 0);
      if (Math.abs(totalMilestoneAmount - project.budget) > 0.01) {
        errors.push({
          field: 'milestones',
          message: 'Total milestone amounts must equal the project budget',
          code: 'MILESTONE_BUDGET_MISMATCH',
          value: project.milestones
        });
      }
    }
  }

  // Custom rules validation
  private validateCustomRules(project: any, errors: ProjectValidationError[], warnings: ProjectValidationError[]): void {
    this.config.customRules.forEach(rule => {
      const value = this.getNestedValue(project, rule.field);
      if (!rule.validator(value, project)) {
        const error: ProjectValidationError = {
          field: rule.field,
          message: rule.message,
          code: rule.code,
          value
        };

        if (rule.severity === 'error') {
          errors.push(error);
        } else {
          warnings.push(error);
        }
      }
    });
  }

  // Dependencies validation
  private validateDependencies(project: any, errors: ProjectValidationError[], warnings: ProjectValidationError[]): void {
    // If project has milestones, budget type should be fixed
    if (project.milestones && project.milestones.length > 0 && project.budgetType === 'hourly') {
      errors.push({
        field: 'budgetType',
        message: 'Milestones are only supported for fixed budget projects',
        code: 'MILESTONE_BUDGET_TYPE_MISMATCH',
        value: project.budgetType
      });
    }

    // If project is ongoing, it should have a duration
    if (project.projectType === 'ongoing' && !project.duration) {
      warnings.push({
        field: 'duration',
        message: 'Duration is recommended for ongoing projects',
        code: 'MISSING_DURATION',
        value: project.duration
      });
    }

    // If project is public, it should have proper description
    if (project.visibility === 'public' && project.description && project.description.length < 100) {
      warnings.push({
        field: 'description',
        message: 'Public projects should have detailed descriptions (at least 100 characters)',
        code: 'SHORT_PUBLIC_DESCRIPTION',
        value: project.description
      });
    }
  }

  // Individual field validators
  private validateTitle(title: string): ProjectValidationError[] {
    const errors: ProjectValidationError[] = [];

    if (!title || title.trim().length === 0) {
      errors.push({
        field: 'title',
        message: 'Project title is required',
        code: 'REQUIRED_TITLE',
        value: title
      });
    } else if (title.length < 10) {
      errors.push({
        field: 'title',
        message: 'Project title should be at least 10 characters long',
        code: 'TITLE_TOO_SHORT',
        value: title
      });
    } else if (title.length > 200) {
      errors.push({
        field: 'title',
        message: 'Project title should not exceed 200 characters',
        code: 'TITLE_TOO_LONG',
        value: title
      });
    }

    // Check for spam patterns
    if (this.containsSpamPatterns(title)) {
      errors.push({
        field: 'title',
        message: 'Project title contains inappropriate content',
        code: 'SPAM_TITLE',
        value: title
      });
    }

    return errors;
  }

  private validateDescription(description: string): ProjectValidationError[] {
    const errors: ProjectValidationError[] = [];

    if (!description || description.trim().length === 0) {
      errors.push({
        field: 'description',
        message: 'Project description is required',
        code: 'REQUIRED_DESCRIPTION',
        value: description
      });
    } else if (description.length < 50) {
      errors.push({
        field: 'description',
        message: 'Project description should be at least 50 characters long',
        code: 'DESCRIPTION_TOO_SHORT',
        value: description
      });
    } else if (description.length > 5000) {
      errors.push({
        field: 'description',
        message: 'Project description should not exceed 5000 characters',
        code: 'DESCRIPTION_TOO_LONG',
        value: description
      });
    }

    // Check for spam patterns
    if (this.containsSpamPatterns(description)) {
      errors.push({
        field: 'description',
        message: 'Project description contains inappropriate content',
        code: 'SPAM_DESCRIPTION',
        value: description
      });
    }

    return errors;
  }

  private validateBudget(budget: number): ProjectValidationError[] {
    const errors: ProjectValidationError[] = [];

    if (budget === undefined || budget === null) {
      errors.push({
        field: 'budget',
        message: 'Project budget is required',
        code: 'REQUIRED_BUDGET',
        value: budget
      });
    } else if (typeof budget !== 'number' || isNaN(budget)) {
      errors.push({
        field: 'budget',
        message: 'Project budget must be a valid number',
        code: 'INVALID_BUDGET_TYPE',
        value: budget
      });
    } else if (budget <= 0) {
      errors.push({
        field: 'budget',
        message: 'Project budget must be greater than 0',
        code: 'INVALID_BUDGET_VALUE',
        value: budget
      });
    } else if (budget > 1000000) {
      errors.push({
        field: 'budget',
        message: 'Project budget cannot exceed $1,000,000',
        code: 'BUDGET_TOO_HIGH',
        value: budget
      });
    }

    return errors;
  }

  private validateCategory(category: string): ProjectValidationError[] {
    const errors: ProjectValidationError[] = [];

    if (!category || category.trim().length === 0) {
      errors.push({
        field: 'category',
        message: 'Project category is required',
        code: 'REQUIRED_CATEGORY',
        value: category
      });
    } else if (category.length > 100) {
      errors.push({
        field: 'category',
        message: 'Project category should not exceed 100 characters',
        code: 'CATEGORY_TOO_LONG',
        value: category
      });
    }

    return errors;
  }

  private validateSkills(skills: string[]): ProjectValidationError[] {
    const errors: ProjectValidationError[] = [];

    if (!Array.isArray(skills)) {
      errors.push({
        field: 'skills',
        message: 'Skills must be an array',
        code: 'INVALID_SKILLS_TYPE',
        value: skills
      });
      return errors;
    }

    if (skills.length === 0) {
      errors.push({
        field: 'skills',
        message: 'At least one skill is required',
        code: 'REQUIRED_SKILLS',
        value: skills
      });
    } else if (skills.length > 20) {
      errors.push({
        field: 'skills',
        message: 'Cannot have more than 20 skills',
        code: 'TOO_MANY_SKILLS',
        value: skills
      });
    }

    skills.forEach((skill, index) => {
      if (!skill || skill.trim().length === 0) {
        errors.push({
          field: `skills[${index}]`,
          message: 'Skill cannot be empty',
          code: 'EMPTY_SKILL',
          value: skill
        });
      } else if (skill.length > 50) {
        errors.push({
          field: `skills[${index}]`,
          message: 'Skill should not exceed 50 characters',
          code: 'SKILL_TOO_LONG',
          value: skill
        });
      }
    });

    return errors;
  }

  private validateMilestones(milestones: any[]): ProjectValidationError[] {
    const errors: ProjectValidationError[] = [];

    if (!Array.isArray(milestones)) {
      errors.push({
        field: 'milestones',
        message: 'Milestones must be an array',
        code: 'INVALID_MILESTONES_TYPE',
        value: milestones
      });
      return errors;
    }

    if (milestones.length > 10) {
      errors.push({
        field: 'milestones',
        message: 'Cannot have more than 10 milestones',
        code: 'TOO_MANY_MILESTONES',
        value: milestones
      });
    }

    milestones.forEach((milestone, index) => {
      if (!milestone.title || milestone.title.trim().length === 0) {
        errors.push({
          field: `milestones[${index}].title`,
          message: 'Milestone title is required',
          code: 'REQUIRED_MILESTONE_TITLE',
          value: milestone.title
        });
      }

      if (milestone.amount === undefined || milestone.amount <= 0) {
        errors.push({
          field: `milestones[${index}].amount`,
          message: 'Milestone amount must be greater than 0',
          code: 'INVALID_MILESTONE_AMOUNT',
          value: milestone.amount
        });
      }

      if (milestone.dueDate && !this.isValidDate(milestone.dueDate)) {
        errors.push({
          field: `milestones[${index}].dueDate`,
          message: 'Milestone due date must be a valid date',
          code: 'INVALID_MILESTONE_DATE',
          value: milestone.dueDate
        });
      }
    });

    return errors;
  }

  private validateAttachments(attachments: any[]): ProjectValidationError[] {
    const errors: ProjectValidationError[] = [];

    if (!Array.isArray(attachments)) {
      errors.push({
        field: 'attachments',
        message: 'Attachments must be an array',
        code: 'INVALID_ATTACHMENTS_TYPE',
        value: attachments
      });
      return errors;
    }

    if (attachments.length > 20) {
      errors.push({
        field: 'attachments',
        message: 'Cannot have more than 20 attachments',
        code: 'TOO_MANY_ATTACHMENTS',
        value: attachments
      });
    }

    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    attachments.forEach((attachment, index) => {
      if (attachment.size > maxFileSize) {
        errors.push({
          field: `attachments[${index}].size`,
          message: 'File size cannot exceed 10MB',
          code: 'FILE_TOO_LARGE',
          value: attachment.size
        });
      }

      if (!allowedTypes.includes(attachment.type)) {
        errors.push({
          field: `attachments[${index}].type`,
          message: 'File type not allowed',
          code: 'INVALID_FILE_TYPE',
          value: attachment.type
        });
      }
    });

    return errors;
  }

  private validateLocation(location: any): ProjectValidationError[] {
    const errors: ProjectValidationError[] = [];

    if (!location || typeof location !== 'object') {
      return errors;
    }

    if (location.country && location.country.length > 100) {
      errors.push({
        field: 'location.country',
        message: 'Country name should not exceed 100 characters',
        code: 'COUNTRY_TOO_LONG',
        value: location.country
      });
    }

    if (location.state && location.state.length > 100) {
      errors.push({
        field: 'location.state',
        message: 'State name should not exceed 100 characters',
        code: 'STATE_TOO_LONG',
        value: location.state
      });
    }

    if (location.city && location.city.length > 100) {
      errors.push({
        field: 'location.city',
        message: 'City name should not exceed 100 characters',
        code: 'CITY_TOO_LONG',
        value: location.city
      });
    }

    return errors;
  }

  private validateRequirements(requirements: any[]): ProjectValidationError[] {
    const errors: ProjectValidationError[] = [];

    if (!Array.isArray(requirements)) {
      errors.push({
        field: 'requirements',
        message: 'Requirements must be an array',
        code: 'INVALID_REQUIREMENTS_TYPE',
        value: requirements
      });
      return errors;
    }

    if (requirements.length > 50) {
      errors.push({
        field: 'requirements',
        message: 'Cannot have more than 50 requirements',
        code: 'TOO_MANY_REQUIREMENTS',
        value: requirements
      });
    }

    requirements.forEach((requirement, index) => {
      if (!requirement.title || requirement.title.trim().length === 0) {
        errors.push({
          field: `requirements[${index}].title`,
          message: 'Requirement title is required',
          code: 'REQUIRED_REQUIREMENT_TITLE',
          value: requirement.title
        });
      }

      if (!['mandatory', 'preferred', 'optional'].includes(requirement.type)) {
        errors.push({
          field: `requirements[${index}].type`,
          message: 'Requirement type must be mandatory, preferred, or optional',
          code: 'INVALID_REQUIREMENT_TYPE',
          value: requirement.type
        });
      }
    });

    return errors;
  }

  private validateDeadline(deadline: string, project: any): ProjectValidationError[] {
    const errors: ProjectValidationError[] = [];

    if (!deadline) {
      return errors;
    }

    if (!this.isValidDate(deadline)) {
      errors.push({
        field: 'deadline',
        message: 'Deadline must be a valid date',
        code: 'INVALID_DEADLINE_FORMAT',
        value: deadline
      });
      return errors;
    }

    const deadlineDate = new Date(deadline);
    const now = new Date();
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(now.getFullYear() + 1);

    if (deadlineDate <= now) {
      errors.push({
        field: 'deadline',
        message: 'Deadline must be in the future',
        code: 'DEADLINE_IN_PAST',
        value: deadline
      });
    }

    if (deadlineDate > oneYearFromNow) {
      errors.push({
        field: 'deadline',
        message: 'Deadline cannot be more than one year in the future',
        code: 'DEADLINE_TOO_FAR',
        value: deadline
      });
    }

    return errors;
  }

  private validateCustomField(field: string, value: any, project: any): ProjectValidationError[] {
    const errors: ProjectValidationError[] = [];
    const rules = this.customRules.get(field) || [];

    rules.forEach(rule => {
      if (!rule.validator(value, project)) {
        errors.push({
          field,
          message: rule.message,
          code: rule.code,
          value
        });
      }
    });

    return errors;
  }

  // Utility methods
  private setupCustomRules(): void {
    // Add any default custom rules here
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private getFieldDisplayName(field: string): string {
    const displayNames: Record<string, string> = {
      client_id: 'Client ID',
      title: 'Project Title',
      description: 'Project Description',
      category: 'Project Category',
      budget: 'Project Budget',
      subcategory: 'Subcategory',
      skills: 'Skills',
      experienceLevel: 'Experience Level',
      projectType: 'Project Type',
      visibility: 'Visibility',
      budgetType: 'Budget Type',
      duration: 'Duration',
      deadline: 'Deadline',
      location: 'Location',
      requirements: 'Requirements',
      milestones: 'Milestones',
      attachments: 'Attachments'
    };

    return displayNames[field] || field;
  }

  private containsSpamPatterns(text: string): boolean {
    const spamPatterns = [
      /(?:click here|visit now|buy now|free money|make money|work from home)/i,
      /(?:www\.|http:\/\/|https:\/\/)/i,
      /(?:!!!|!!!|!!!)/,
      /(?:[A-Z]{10,})/,
      /(?:[0-9]{10,})/
    ];

    return spamPatterns.some(pattern => pattern.test(text));
  }

  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  // Configuration methods
  addCustomRule(rule: ValidationRule): void {
    this.config.customRules.push(rule);
  }

  removeCustomRule(code: string): void {
    this.config.customRules = this.config.customRules.filter(rule => rule.code !== code);
  }

  updateConfig(newConfig: Partial<ValidationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): ValidationConfig {
    return { ...this.config };
  }
}

// Hook for using project validation
export function useProjectValidation(config?: Partial<ValidationConfig>) {
  const validator = new ProjectValidator(config);

  const validateProject = (project: CreateProjectDTO | UpdateProjectDTO): ProjectValidationResult => {
    return validator.validateProject(project);
  };

  const validateDraft = (draft: ProjectDraft): ProjectValidationResult => {
    return validator.validateDraft(draft);
  };

  const validateField = (field: string, value: any, project: any): ProjectValidationError[] => {
    return validator.validateField(field, value, project);
  };

  const addCustomRule = (rule: ValidationRule): void => {
    validator.addCustomRule(rule);
  };

  const removeCustomRule = (code: string): void => {
    validator.removeCustomRule(code);
  };

  const updateConfig = (newConfig: Partial<ValidationConfig>): void => {
    validator.updateConfig(newConfig);
  };

  return {
    validateProject,
    validateDraft,
    validateField,
    addCustomRule,
    removeCustomRule,
    updateConfig,
    config: validator.getConfig()
  };
}

// Export singleton instance
export const projectValidator = new ProjectValidator();
