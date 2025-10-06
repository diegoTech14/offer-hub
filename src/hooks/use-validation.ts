import { useState, useCallback } from "react";

// Generic validation rule interface
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  message?: string;
}

// Validation result interface
export interface ValidationResult {
  valid: boolean;
  error: string | null;
}

// Hook state interface
export interface ValidationState {
  [key: string]: ValidationResult;
}

// Hook options interface
export interface UseValidationOptions {
  rules: Record<string, ValidationRule>;
  validateOnChange?: boolean;
}

/**
 * Generic validation hook for form fields
 * Provides real-time validation with customizable rules
 */
export function useValidation(options: UseValidationOptions) {
  const { rules, validateOnChange = true } = options;
  
  const [state, setState] = useState<ValidationState>({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Validate a single field
  const validateField = useCallback((field: string, value: any): ValidationResult => {
    const rule = rules[field];
    if (!rule) return { valid: true, error: null };

    // Required validation
    if (rule.required && (!value || value.toString().trim() === '')) {
      return { valid: false, error: rule.message || `${field} is required` };
    }

    // Skip other validations if field is empty and not required
    if (!rule.required && (!value || value.toString().trim() === '')) {
      return { valid: true, error: null };
    }

    // Min length validation
    if (rule.minLength && value.toString().length < rule.minLength) {
      return { 
        valid: false, 
        error: rule.message || `${field} must be at least ${rule.minLength} characters` 
      };
    }

    // Max length validation
    if (rule.maxLength && value.toString().length > rule.maxLength) {
      return { 
        valid: false, 
        error: rule.message || `${field} must be no more than ${rule.maxLength} characters` 
      };
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value.toString())) {
      return { 
        valid: false, 
        error: rule.message || `${field} format is invalid` 
      };
    }

    // Custom validation
    if (rule.custom && !rule.custom(value)) {
      return { 
        valid: false, 
        error: rule.message || `${field} is invalid` 
      };
    }

    return { valid: true, error: null };
  }, [rules]);

  // Validate all fields
  const validateForm = useCallback((values: Record<string, any>): boolean => {
    const newState: ValidationState = {};
    let allValid = true;

    Object.keys(rules).forEach(field => {
      const result = validateField(field, values[field]);
      newState[field] = result;
      if (!result.valid) allValid = false;
    });

    setState(newState);
    setIsFormValid(allValid);
    return allValid;
  }, [rules, validateField]);

  // Handle field change
  const onFieldChange = useCallback((field: string, value: any) => {
    if (!validateOnChange) return;

    const result = validateField(field, value);
    setState(prev => ({
      ...prev,
      [field]: result
    }));

    // Update form validity
    const currentState = { ...state, [field]: result };
    const allValid = Object.values(currentState).every(fieldState => fieldState.valid);
    setIsFormValid(allValid);
  }, [validateField, validateOnChange, state]);

  // Reset validation state
  const resetValidation = useCallback(() => {
    setState({});
    setIsFormValid(false);
  }, []);

  return {
    state,
    isFormValid,
    validateField,
    validateForm,
    onFieldChange,
    resetValidation
  };
}
