"use client";

import React, { useState } from "react";
import { RegisterFormState, RegisterFormErrors } from "@/types/auth-register.types";

interface EmailPasswordFormProps {
  onSubmit: (data: RegisterFormState) => void;
  isLoading?: boolean;
  error?: string | null;
  mode?: "register" | "login";
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

  const validateForm = (): boolean => {
    const errors: RegisterFormErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formState.email.trim()) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(formState.email)) {
      errors.email = "Invalid email format";
    }

    // Password validation
    if (!formState.password) {
      errors.password = "Password is required";
    } else if (formState.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (mode === "register") {
      // Username validation
      if (!formState.username.trim()) {
        errors.username = "Username is required";
      } else if (formState.username.length < 3) {
        errors.username = "Username must be at least 3 characters";
      }

      // Confirm password validation
      if (!formState.confirmPassword) {
        errors.confirmPassword = "Please confirm your password";
      } else if (formState.password !== formState.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
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
    // Clear error for this field
    if (formErrors[field as keyof RegisterFormErrors]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
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
          disabled={isLoading}
          className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#19213D] focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[#667085]"
          placeholder="you@example.com"
          required
        />
        {formErrors.email && (
          <p className="text-xs text-red-600 mt-1">{formErrors.email}</p>
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
            disabled={isLoading}
            className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#19213D] focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[#667085]"
            placeholder="yourusername"
            required
          />
          {formErrors.username && (
            <p className="text-xs text-red-600 mt-1">{formErrors.username}</p>
          )}
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
            disabled={isLoading}
            className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#19213D] focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[#667085]"
            placeholder="Enter your password"
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
          <p className="text-xs text-red-600 mt-1">{formErrors.password}</p>
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
              disabled={isLoading}
              className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#19213D] focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[#667085]"
              placeholder="Confirm your password"
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
            <p className="text-xs text-red-600 mt-1">{formErrors.confirmPassword}</p>
          )}
        </div>
      )}

      {/* Optional fields (only in register mode) */}
      {mode === "register" && (
        <>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#344054] mb-2">
              Name (optional)
            </label>
            <input
              type="text"
              id="name"
              value={formState.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#19213D] focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[#667085]"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-[#344054] mb-2">
              Bio (optional)
            </label>
            <textarea
              id="bio"
              value={formState.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#19213D] focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[#667085]"
              placeholder="Tell us about yourself"
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="isFreelancer"
              type="checkbox"
              checked={formState.is_freelancer}
              onChange={(e) => handleInputChange("is_freelancer", e.target.checked)}
              disabled={isLoading}
              className="h-4 w-4 text-[#149A9B] focus:ring-[#149A9B] border-gray-300 rounded"
            />
            <label htmlFor="isFreelancer" className="text-sm text-[#344054]">
              I am a freelancer
            </label>
          </div>
        </>
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


