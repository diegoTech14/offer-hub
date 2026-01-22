// Main Components
export { ApplicationForm } from './application-form';
export { ProposalTemplates, getTemplateData, getTemplatePlaceholder } from './proposal-templates';
export { ProposalEditor } from './proposal-editor';
export { BudgetProposal as BudgetProposalComponent } from './budget-proposal';
export { TimelinePlanner } from './timeline-planner';

// Hook
export { useApplicationForm } from '@/hooks/use-application-form';

// Types
export type {
  ApplicationFormData,
  ApplicationFormState,
  ApplicationFormValidation,
  ProposalContent,
  ProposalTemplate,
  ProposalTemplateData,
  BudgetProposal,
  BudgetCalculation,
  Timeline,
  TimelineEvent,
  Milestone,
  SkillRelevance,
  PortfolioAttachment,
  AvailabilityInfo,
  ClientQuestion,
  FormDraft,
  PricingModel,
  Currency,
  ApplicationStatus,
  CurrencyConversion,
} from '@/types/application-form.types';


