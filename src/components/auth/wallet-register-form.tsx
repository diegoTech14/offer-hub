"use client";

import React, { useState } from "react";
import { WalletRegisterFormState, RegisterFormErrors } from "@/types/auth-register.types";
import { useWallet } from "@/components/onboarding/useWallet.hook";

interface WalletRegisterFormProps {
  onSubmit: (data: WalletRegisterFormState) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function WalletRegisterForm({
  onSubmit,
  isLoading = false,
  error = null,
}: WalletRegisterFormProps) {
  const { connectWallet, isConnecting, walletAddress } = useWallet();
  const [walletConnected, setWalletConnected] = useState(false);

  const [formState, setFormState] = useState<WalletRegisterFormState>({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    name: "",
    bio: "",
    is_freelancer: false,
    wallet_address: "",
    signature: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<RegisterFormErrors>({});

  const handleConnectWallet = async (walletId: string) => {
    const result = await connectWallet(walletId);
    if (result.success && result.address) {
      setWalletConnected(true);
      setFormState((prev) => ({
        ...prev,
        wallet_address: result.address!,
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: RegisterFormErrors = {};

    // Wallet validation
    if (!formState.wallet_address) {
      errors.general = "Please connect your wallet first";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formState.email.trim()) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(formState.email)) {
      errors.email = "Invalid email format";
    }

    // Username validation
    if (!formState.username.trim()) {
      errors.username = "Username is required";
    } else if (formState.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    // Password validation
    if (!formState.password) {
      errors.password = "Password is required";
    } else if (formState.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    // Confirm password validation
    if (!formState.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formState.password !== formState.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // TODO: Sign a message with the wallet to prove ownership
    // For now, we'll set a dummy signature
    setFormState((prev) => ({ ...prev, signature: "dummy_signature" }));
    
    onSubmit({
      ...formState,
      signature: "dummy_signature", // Replace with actual signature
    });
  };

  const handleInputChange = (field: keyof WalletRegisterFormState, value: string | boolean) => {
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

  // If wallet not connected, show wallet connection options
  if (!walletConnected) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-600 text-center mb-4">
          Connect your Stellar wallet to continue
        </p>

        <button
          onClick={() => handleConnectWallet("freighter")}
          disabled={isConnecting}
          className="w-full px-4 py-4 bg-white border-2 border-orange-200 hover:border-orange-300 rounded-full transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center justify-center space-x-4">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-xl">
              🚀
            </div>
            <span className="flex-1 text-left font-semibold text-base text-orange-600">
              Freighter
            </span>
            <div className="text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleConnectWallet("lobstr")}
          disabled={isConnecting}
          className="w-full px-4 py-4 bg-white border-2 border-teal-200 hover:border-teal-300 rounded-full transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center justify-center space-x-4">
            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-xl">
              🦞
            </div>
            <span className="flex-1 text-left font-semibold text-base text-teal-600">
              LOBSTR Vault
            </span>
            <div className="text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </button>
      </div>
    );
  }

  // Once wallet is connected, show the registration form
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Connected Wallet */}
      <div>
        <label className="block text-sm font-medium text-[#344054] mb-2">
          Connected Wallet
        </label>
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm text-green-700 font-mono">
            {formState.wallet_address.slice(0, 8)}...{formState.wallet_address.slice(-6)}
          </span>
        </div>
      </div>

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

      {/* Username */}
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

      {/* Confirm Password */}
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

      {/* Optional fields */}
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

      {/* Error message */}
      {(error || formErrors.general) && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error || formErrors.general}</p>
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
        Create Account with Wallet
      </button>
    </form>
  );
}


