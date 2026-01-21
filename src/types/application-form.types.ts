export type PricingModel = 'hourly' | 'fixed' | 'milestone';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'XLM' | 'USDT';
export type ApplicationStatus = 'draft' | 'submitted' | 'withdrawn' | 'accepted' | 'rejected';
export type ProposalTemplate = 'standard' | 'technical' | 'creative' | 'consulting' | 'custom';

export interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  duration: number; // in days
  deliverables: string[];
  dependencies?: string[]; // IDs of dependent milestones
  order: number;
}

export interface BudgetProposal {
  pricingModel: PricingModel;
  currency: Currency;
  
  // For hourly pricing
  hourlyRate?: number;
  estimatedHours?: number;
  
  // For fixed pricing
  fixedAmount?: number;
  
  // For milestone-based pricing
  milestones?: Milestone[];
  
  // Common fields
  totalAmount: number;
  breakdown?: {
    description: string;
    amount: number;
  }[];
  taxIncluded: boolean;
  notes?: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  milestoneId?: string; // Link to milestone if applicable
  type: 'milestone' | 'task' | 'review' | 'delivery';
  dependencies?: string[];
}

export interface Timeline {
  startDate: Date;
  endDate: Date;
  totalDuration: number; // in days
  events: TimelineEvent[];
  workingDaysPerWeek?: number;
  holidays?: Date[];
  bufferTime?: number; // percentage
}

export interface SkillRelevance {
  skillId: string;
  skillName: string;
  proficiencyLevel: number; // 1-5
  yearsOfExperience: number;
  relevanceScore: number; // 0-100
  projectsCompleted?: number;
  certifications?: string[];
}

export interface PortfolioAttachment {
  id: string;
  portfolioItemId: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  url?: string;
  type: 'project' | 'case-study' | 'design' | 'code-sample';
  relevanceNotes?: string;
  tags?: string[];
}

export interface AvailabilityInfo {
  hoursPerWeek: number;
  startDate: Date;
  timezone: string;
  flexibleHours: boolean;
  preferredWorkingHours?: {
    start: string; // "09:00"
    end: string;   // "17:00"
  };
  unavailableDates?: Date[];
  commitmentLevel: 'full-time' | 'part-time' | 'flexible';
}

export interface ClientQuestion {
  id: string;
  question: string;
  answer?: string;
  category?: string;
  isRequired: boolean;
  createdAt: Date;
}

export interface ProposalContent {
  introduction: string;
  approach: string;
  deliverables: string[];
  whyMe: string;
  additionalNotes?: string;
  customSections?: {
    title: string;
    content: string;
  }[];
}

export interface ApplicationFormData {
  id?: string;
  projectId: string;
  freelancerId: string;
  
  // Core content
  coverLetter: string;
  proposal: ProposalContent;
  templateType?: ProposalTemplate;
  
  // Budget and timeline
  budget: BudgetProposal;
  timeline: Timeline;
  
  // Skills and portfolio
  relevantSkills: SkillRelevance[];
  portfolioAttachments: PortfolioAttachment[];
  
  // Availability
  availability: AvailabilityInfo;
  
  // Client questions
  clientQuestions?: ClientQuestion[];
  
  // Metadata
  status: ApplicationStatus;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  lastAutoSavedAt?: Date;
  
  // Additional
  attachments?: File[];
  termsAccepted: boolean;
}

export interface ApplicationFormValidation {
  isValid: boolean;
  errors: {
    field: string;
    message: string;
  }[];
  warnings?: {
    field: string;
    message: string;
  }[];
}

export interface ProposalTemplateData {
  id: ProposalTemplate;
  name: string;
  description: string;
  icon: string;
  sections: {
    title: string;
    placeholder: string;
    required: boolean;
  }[];
  recommendedFor: string[];
}

export interface FormDraft {
  id: string;
  data: Partial<ApplicationFormData>;
  timestamp: Date;
  isAutoSaved: boolean;
}

export interface ApplicationFormState {
  formData: Partial<ApplicationFormData>;
  isDirty: boolean;
  isSubmitting: boolean;
  isSaving: boolean;
  validation: ApplicationFormValidation;
  currentStep?: number;
  totalSteps?: number;
}

export interface CurrencyConversion {
  from: Currency;
  to: Currency;
  rate: number;
  lastUpdated: Date;
}

export interface BudgetCalculation {
  subtotal: number;
  platformFee: number;
  processingFee: number;
  tax: number;
  total: number;
  freelancerReceives: number;
  clientPays: number;
}

