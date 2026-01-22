/**
 * Application Form Hook
 * Manages form state, validation, auto-save, and submission logic
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ApplicationFormData,
  ApplicationFormState,
  ApplicationFormValidation,
  BudgetProposal,
  Timeline,
  FormDraft,
  ApplicationStatus,
  BudgetCalculation,
  Currency,
  CurrencyConversion,
} from '@/types/application-form.types';

interface UseApplicationFormOptions {
  projectId: string;
  freelancerId: string;
  autoSaveInterval?: number; // milliseconds
  enableAutoSave?: boolean;
  onSubmit?: (data: ApplicationFormData) => Promise<void>;
  onSave?: (data: Partial<ApplicationFormData>) => Promise<void>;
  initialData?: Partial<ApplicationFormData>;
}

const AUTOSAVE_INTERVAL = 30000; // 30 seconds
const PLATFORM_FEE_PERCENTAGE = 10; // 10% platform fee
const PROCESSING_FEE_PERCENTAGE = 2.9; // 2.9% processing fee

export function useApplicationForm(options: UseApplicationFormOptions) {
  const {
    projectId,
    freelancerId,
    autoSaveInterval = AUTOSAVE_INTERVAL,
    enableAutoSave = true,
    onSubmit,
    onSave,
    initialData,
  } = options;

  // Form state
  const [formState, setFormState] = useState<ApplicationFormState>({
    formData: {
      projectId,
      freelancerId,
      status: 'draft' as ApplicationStatus,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      termsAccepted: false,
      relevantSkills: [],
      portfolioAttachments: [],
      ...initialData,
    },
    isDirty: false,
    isSubmitting: false,
    isSaving: false,
    validation: {
      isValid: false,
      errors: [],
    },
  });

  // Drafts history
  const [drafts, setDrafts] = useState<FormDraft[]>([]);
  const autoSaveTimerRef = useRef<NodeJS.Timeout>();
  const lastSaveRef = useRef<Date>(new Date());

  // Currency exchange rates (mock - should come from API)
  const [currencyRates] = useState<CurrencyConversion[]>([
    { from: 'USD', to: 'EUR', rate: 0.92, lastUpdated: new Date() },
    { from: 'USD', to: 'GBP', rate: 0.79, lastUpdated: new Date() },
    { from: 'EUR', to: 'USD', rate: 1.09, lastUpdated: new Date() },
  ]);

  // Update form data
  const updateFormData = useCallback(
    <K extends keyof ApplicationFormData>(
      field: K,
      value: ApplicationFormData[K]
    ) => {
      setFormState((prev) => ({
        ...prev,
        formData: {
          ...prev.formData,
          [field]: value,
          updatedAt: new Date(),
        },
        isDirty: true,
      }));
    },
    []
  );

  // Update nested form data
  const updateNestedData = useCallback(
    (path: string, value: any) => {
      setFormState((prev) => {
        const newFormData = { ...prev.formData };
        const keys = path.split('.');
        let current: any = newFormData;

        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }

        current[keys[keys.length - 1]] = value;

        return {
          ...prev,
          formData: {
            ...newFormData,
            updatedAt: new Date(),
          },
          isDirty: true,
        };
      });
    },
    []
  );

  // Validate form
  const validateForm = useCallback((): ApplicationFormValidation => {
    const errors: { field: string; message: string }[] = [];
    const warnings: { field: string; message: string }[] = [];
    const { formData } = formState;

    // Cover letter validation
    if (!formData.coverLetter || formData.coverLetter.trim().length < 50) {
      errors.push({
        field: 'coverLetter',
        message: 'Cover letter must be at least 50 characters',
      });
    }

    // Proposal validation
    if (!formData.proposal?.introduction) {
      errors.push({
        field: 'proposal.introduction',
        message: 'Proposal introduction is required',
      });
    }

    if (!formData.proposal?.approach) {
      errors.push({
        field: 'proposal.approach',
        message: 'Project approach is required',
      });
    }

    // Budget validation
    if (!formData.budget) {
      errors.push({
        field: 'budget',
        message: 'Budget proposal is required',
      });
    } else {
      const { budget } = formData;
      
      if (budget.pricingModel === 'hourly') {
        if (!budget.hourlyRate || budget.hourlyRate <= 0) {
          errors.push({
            field: 'budget.hourlyRate',
            message: 'Valid hourly rate is required',
          });
        }
        if (!budget.estimatedHours || budget.estimatedHours <= 0) {
          errors.push({
            field: 'budget.estimatedHours',
            message: 'Estimated hours is required',
          });
        }
      } else if (budget.pricingModel === 'fixed') {
        if (!budget.fixedAmount || budget.fixedAmount <= 0) {
          errors.push({
            field: 'budget.fixedAmount',
            message: 'Valid fixed amount is required',
          });
        }
      } else if (budget.pricingModel === 'milestone') {
        if (!budget.milestones || budget.milestones.length === 0) {
          errors.push({
            field: 'budget.milestones',
            message: 'At least one milestone is required',
          });
        }
      }

      if (budget.totalAmount <= 0) {
        errors.push({
          field: 'budget.totalAmount',
          message: 'Total amount must be greater than 0',
        });
      }
    }

    // Timeline validation
    if (!formData.timeline) {
      errors.push({
        field: 'timeline',
        message: 'Project timeline is required',
      });
    } else {
      if (!formData.timeline.startDate) {
        errors.push({
          field: 'timeline.startDate',
          message: 'Start date is required',
        });
      }
      if (!formData.timeline.endDate) {
        errors.push({
          field: 'timeline.endDate',
          message: 'End date is required',
          });
      }
      if (
        formData.timeline.startDate &&
        formData.timeline.endDate &&
        formData.timeline.endDate <= formData.timeline.startDate
      ) {
        errors.push({
          field: 'timeline.endDate',
          message: 'End date must be after start date',
        });
      }
    }

    // Availability validation
    if (!formData.availability) {
      errors.push({
        field: 'availability',
        message: 'Availability information is required',
      });
    } else {
      if (!formData.availability.hoursPerWeek || formData.availability.hoursPerWeek <= 0) {
        errors.push({
          field: 'availability.hoursPerWeek',
          message: 'Hours per week is required',
        });
      }
      if (formData.availability.hoursPerWeek > 168) {
        errors.push({
          field: 'availability.hoursPerWeek',
          message: 'Hours per week cannot exceed 168',
        });
      }
    }

    // Skills validation
    if (!formData.relevantSkills || formData.relevantSkills.length === 0) {
      warnings.push({
        field: 'relevantSkills',
        message: 'Adding relevant skills strengthens your application',
      });
    }

    // Portfolio validation
    if (!formData.portfolioAttachments || formData.portfolioAttachments.length === 0) {
      warnings.push({
        field: 'portfolioAttachments',
        message: 'Portfolio items help showcase your work',
      });
    }

    // Terms acceptance
    if (!formData.termsAccepted) {
      errors.push({
        field: 'termsAccepted',
        message: 'You must accept the terms and conditions',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }, [formState]);

  // Calculate budget with fees
  const calculateBudget = useCallback(
    (budget: BudgetProposal): BudgetCalculation => {
      const subtotal = budget.totalAmount;
      const platformFee = subtotal * (PLATFORM_FEE_PERCENTAGE / 100);
      const processingFee = subtotal * (PROCESSING_FEE_PERCENTAGE / 100);
      const tax = budget.taxIncluded ? 0 : subtotal * 0.1; // 10% tax if not included
      const total = subtotal + platformFee + processingFee + tax;
      const freelancerReceives = subtotal - platformFee;

      return {
        subtotal,
        platformFee,
        processingFee,
        tax,
        total,
        freelancerReceives,
        clientPays: total,
      };
    },
    []
  );

  // Convert currency
  const convertCurrency = useCallback(
    (amount: number, from: Currency, to: Currency): number => {
      if (from === to) return amount;

      const conversion = currencyRates.find(
        (rate) => rate.from === from && rate.to === to
      );

      if (conversion) {
        return amount * conversion.rate;
      }

      // If direct conversion not found, try reverse
      const reverseConversion = currencyRates.find(
        (rate) => rate.from === to && rate.to === from
      );

      if (reverseConversion) {
        return amount / reverseConversion.rate;
      }

      // Default: return same amount if conversion not available
      return amount;
    },
    [currencyRates]
  );

  // Auto-save function
  const autoSave = useCallback(async () => {
    if (!enableAutoSave || !formState.isDirty) return;

    setFormState((prev) => ({ ...prev, isSaving: true }));

    try {
      const draft: FormDraft = {
        id: `draft-${Date.now()}`,
        data: formState.formData,
        timestamp: new Date(),
        isAutoSaved: true,
      };

      // Save to localStorage as backup
      localStorage.setItem(
        `application-draft-${projectId}`,
        JSON.stringify(draft)
      );

      // Call external save function if provided
      if (onSave) {
        await onSave(formState.formData);
      }

      setDrafts((prev) => [draft, ...prev.slice(0, 9)]); // Keep last 10 drafts
      lastSaveRef.current = new Date();

      setFormState((prev) => ({
        ...prev,
        formData: {
          ...prev.formData,
          lastAutoSavedAt: new Date(),
        },
        isDirty: false,
        isSaving: false,
      }));
    } catch (error) {
      console.error('Auto-save failed:', error);
      setFormState((prev) => ({ ...prev, isSaving: false }));
    }
  }, [enableAutoSave, formState.isDirty, formState.formData, onSave, projectId]);

  // Manual save
  const saveAsDraft = useCallback(async () => {
    await autoSave();
  }, [autoSave]);

  // Load draft
  const loadDraft = useCallback((draft: FormDraft) => {
    setFormState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        ...draft.data,
      },
      isDirty: false,
    }));
  }, []);

  // Recover from localStorage
  const recoverDraft = useCallback(() => {
    try {
      const saved = localStorage.getItem(`application-draft-${projectId}`);
      if (saved) {
        const draft: FormDraft = JSON.parse(saved);
        loadDraft(draft);
        return true;
      }
    } catch (error) {
      console.error('Failed to recover draft:', error);
    }
    return false;
  }, [projectId, loadDraft]);

  // Submit application
  const submitApplication = useCallback(async () => {
    const validation = validateForm();
    
    setFormState((prev) => ({
      ...prev,
      validation,
    }));

    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    setFormState((prev) => ({ ...prev, isSubmitting: true }));

    try {
      const submissionData: ApplicationFormData = {
        ...formState.formData,
        status: 'submitted' as ApplicationStatus,
        submittedAt: new Date(),
        updatedAt: new Date(),
      } as ApplicationFormData;

      if (onSubmit) {
        await onSubmit(submissionData);
      }

      // Clear draft from localStorage
      localStorage.removeItem(`application-draft-${projectId}`);

      setFormState((prev) => ({
        ...prev,
        formData: submissionData,
        isDirty: false,
        isSubmitting: false,
      }));

      return {
        success: true,
        data: submissionData,
      };
    } catch (error) {
      setFormState((prev) => ({ ...prev, isSubmitting: false }));
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Submission failed',
      };
    }
  }, [formState.formData, onSubmit, projectId, validateForm]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormState({
      formData: {
        projectId,
        freelancerId,
        status: 'draft' as ApplicationStatus,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        termsAccepted: false,
        relevantSkills: [],
        portfolioAttachments: [],
      },
      isDirty: false,
      isSubmitting: false,
      isSaving: false,
      validation: {
        isValid: false,
        errors: [],
      },
    });
  }, [projectId, freelancerId]);

  // Auto-save effect
  useEffect(() => {
    if (enableAutoSave && formState.isDirty) {
      autoSaveTimerRef.current = setTimeout(() => {
        autoSave();
      }, autoSaveInterval);

      return () => {
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current);
        }
      };
    }
  }, [enableAutoSave, formState.isDirty, autoSave, autoSaveInterval]);

  // Load initial draft on mount
  useEffect(() => {
    if (!initialData) {
      recoverDraft();
    }
  }, [initialData, recoverDraft]);

  return {
    formData: formState.formData,
    isDirty: formState.isDirty,
    isSubmitting: formState.isSubmitting,
    isSaving: formState.isSaving,
    validation: formState.validation,
    drafts,
    lastSaved: lastSaveRef.current,

    // Actions
    updateFormData,
    updateNestedData,
    validateForm,
    calculateBudget,
    convertCurrency,
    saveAsDraft,
    loadDraft,
    recoverDraft,
    submitApplication,
    resetForm,
  };
}

