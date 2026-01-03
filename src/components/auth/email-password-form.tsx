"use client";

import React, { useState, useMemo } from "react";
import { RegisterFormState, RegisterFormErrors } from "@/types/auth-register.types";
import { isValidEmail, isStrongPassword } from "@/utils/validation-rules";

interface EmailPasswordFormProps {
  onSubmit: (data: RegisterFormState) => void;
  isLoading?: boolean;
  error?: string | null;
  mode?: "register" | "login";
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;

function getPasswordStrength(password: string): PasswordStrength {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  };

  const score = Object.values(requirements).filter(Boolean).length;

  let label: string;
  let color: string;

  if (score <= 2) {
    label = "Weak";
    color = "bg-red-500";
  } else if (score <= 3) {
    label = "Fair";
    color = "bg-yellow-500";
  } else if (score <= 4) {
    label = "Good";
    color = "bg-blue-500";
  } else {
    label = "Strong";
    color = "bg-green-500";
  }

  return { score, label, color, requirements };
}

export function EmailPasswordForm({
  onSubmit,
  isLoading = false,
  error = null,
  mode = "register",
}: EmailPasswordFormProps) {
  const [formState, setFormState] = useState<RegisterFormState>({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    name: "",
    bio: "",
    is_freelancer: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<RegisterFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const passwordStrength = useMemo(
    () => getPasswordStrength(formState.password),
    [formState.password]
  );

  const validateField = (field: keyof RegisterFormState, value: string): string | undefined => {
    switch (field) {
      case "email":
        if (!value.trim()) return "Email is required";
        if (!isValidEmail(value)) return "Please enter a valid email address";
        return undefined;

      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        if (mode === "register" && !isStrongPassword(value)) {
          return "Password must include uppercase, lowercase, number, and special character";
        }
        return undefined;

      case "confirmPassword":
        if (mode === "register") {
          if (!value) return "Please confirm your password";
          if (value !== formState.password) return "Passwords do not match";
        }
        return undefined;

      case "username":
        if (mode === "register") {
          if (!value.trim()) return "Username is required";
          if (value.length < 3) return "Username must be at least 3 characters";
          if (value.length > 20) return "Username must be no more than 20 characters";
          if (!usernameRegex.test(value)) {
            return "Username can only contain letters, numbers, underscores, and hyphens";
          }
        }
        return undefined;

      default:
        return undefined;
    }
  };

  const validateForm = (): boolean => {
    const errors: RegisterFormErrors = {};

    const emailError = validateField("email", formState.email);
    if (emailError) errors.email = emailError;

    const passwordError = validateField("password", formState.password);
    if (passwordError) errors.password = passwordError;

    if (mode === "register") {
      const usernameError = validateField("username", formState.username);
      if (usernameError) errors.username = usernameError;

      const confirmPasswordError = validateField("confirmPassword", formState.confirmPassword);
      if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSubmit(formState);
  };

  const handleInputChange = (field: keyof RegisterFormState, value: string | boolean) => {
    setFormState((prev) => ({ ...prev, [field]: value }));

    // Real-time validation for touched fields
    if (touched[field] && typeof value === "string") {
      const error = validateField(field, value);
      setFormErrors((prev) => ({ ...prev, [field]: error }));

      // Also validate confirmPassword when password changes
      if (field === "password" && touched.confirmPassword) {
        const confirmError = formState.confirmPassword !== value ? "Passwords do not match" : undefined;
        setFormErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
      }
    }
  };

  const handleBlur = (field: keyof RegisterFormState) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const value = formState[field];
    if (typeof value === "string") {
      const error = validateField(field, value);
      setFormErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const EyeIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const EyeOffIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[#344054] mb-2">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={formState.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          onBlur={() => handleBlur("email")}
          disabled={isLoading}
          className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-[#19213D] focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[#667085] ${
            formErrors.email ? "border-red-300" : "border-gray-200"
          }`}
          placeholder="you@example.com"
          aria-invalid={!!formErrors.email}
          aria-describedby={formErrors.email ? "email-error" : undefined}
          required
        />
        {formErrors.email && (
          <p id="email-error" className="text-xs text-red-600 mt-1">{formErrors.email}</p>
        )}
      </div>

      {/* Username (only in register mode) */}
      {mode === "register" && (
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-[#344054] mb-2">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={formState.username}
            onChange={(e) => handleInputChange("username", e.target.value)}
            onBlur={() => handleBlur("username")}
            disabled={isLoading}
            className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-[#19213D] focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[#667085] ${
              formErrors.username ? "border-red-300" : "border-gray-200"
            }`}
            placeholder="yourusername"
            aria-invalid={!!formErrors.username}
            aria-describedby={formErrors.username ? "username-error" : undefined}
            required
          />
          {formErrors.username && (
            <p id="username-error" className="text-xs text-red-600 mt-1">{formErrors.username}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            3-20 characters, letters, numbers, underscores, and hyphens only
          </p>
        </div>
      )}

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-[#344054] mb-2">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={formState.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            onBlur={() => handleBlur("password")}
            disabled={isLoading}
            className={`w-full px-4 py-3 pr-12 border rounded-md focus:ring-2 focus:ring-[#19213D] focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[#667085] ${
              formErrors.password ? "border-red-300" : "border-gray-200"
            }`}
            placeholder="Enter your password"
            aria-invalid={!!formErrors.password}
            aria-describedby={formErrors.password ? "password-error" : "password-requirements"}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
        {formErrors.password && (
          <p id="password-error" className="text-xs text-red-600 mt-1">{formErrors.password}</p>
        )}

        {/* Password strength indicator (only in register mode) */}
        {mode === "register" && formState.password && (
          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                  style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                />
              </div>
              <span className={`text-xs font-medium ${
                passwordStrength.score <= 2 ? "text-red-600" :
                passwordStrength.score <= 3 ? "text-yellow-600" :
                passwordStrength.score <= 4 ? "text-blue-600" : "text-green-600"
              }`}>
                {passwordStrength.label}
              </span>
            </div>
            <ul id="password-requirements" className="text-xs text-gray-500 space-y-1">
              <li className={passwordStrength.requirements.minLength ? "text-green-600" : ""}>
                {passwordStrength.requirements.minLength ? "✓" : "○"} At least 8 characters
              </li>
              <li className={passwordStrength.requirements.hasUppercase ? "text-green-600" : ""}>
                {passwordStrength.requirements.hasUppercase ? "✓" : "○"} One uppercase letter
              </li>
              <li className={passwordStrength.requirements.hasLowercase ? "text-green-600" : ""}>
                {passwordStrength.requirements.hasLowercase ? "✓" : "○"} One lowercase letter
              </li>
              <li className={passwordStrength.requirements.hasNumber ? "text-green-600" : ""}>
                {passwordStrength.requirements.hasNumber ? "✓" : "○"} One number
              </li>
              <li className={passwordStrength.requirements.hasSpecial ? "text-green-600" : ""}>
                {passwordStrength.requirements.hasSpecial ? "✓" : "○"} One special character
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Confirm Password (only in register mode) */}
      {mode === "register" && (
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#344054] mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              value={formState.confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              onBlur={() => handleBlur("confirmPassword")}
              disabled={isLoading}
              className={`w-full px-4 py-3 pr-12 border rounded-md focus:ring-2 focus:ring-[#19213D] focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[#667085] ${
                formErrors.confirmPassword ? "border-red-300" : "border-gray-200"
              }`}
              placeholder="Confirm your password"
              aria-invalid={!!formErrors.confirmPassword}
              aria-describedby={formErrors.confirmPassword ? "confirm-password-error" : undefined}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {formErrors.confirmPassword && (
            <p id="confirm-password-error" className="text-xs text-red-600 mt-1">{formErrors.confirmPassword}</p>
          )}
        </div>
      )}


      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#149A9B] text-white py-3 px-4 rounded-full font-medium hover:bg-teal-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#149A9B] focus:ring-offset-2 flex items-center justify-center gap-2"
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {mode === "register" ? "Create Account" : "Sign In"}
      </button>
    </form>
  );
}


