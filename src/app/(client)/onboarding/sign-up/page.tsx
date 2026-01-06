"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRegister } from "@/hooks/auth/use-register";
import { useOAuth } from "@/hooks/auth/use-oauth";
import { AnimatedWaves } from "@/components/auth/AnimatedWaves";

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-5 w-5"
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
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CircleIcon() {
  return (
    <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" strokeWidth={2} />
    </svg>
  );
}

interface PasswordCriteria {
  isLengthValid: boolean;
  hasUpperLower: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export default function SignUpPage() {
  const { registerWithEmail, isLoading, error, errorDetails, clearError } = useRegister();
  const { initiateOAuth, isLoading: isOAuthLoading, loadingProvider } = useOAuth();

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isDisabled = isLoading || isOAuthLoading;

  // Password strength criteria
  const criteria: PasswordCriteria = useMemo(
    () => ({
      isLengthValid: formData.password.length >= 8,
      hasUpperLower: /[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password),
      hasNumber: /\d/.test(formData.password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
    }),
    [formData.password]
  );

  const passwordsMatch = formData.password === formData.confirmPassword && formData.password.length > 0;
  const allCriteriaMet =
    criteria.isLengthValid &&
    criteria.hasUpperLower &&
    criteria.hasNumber &&
    criteria.hasSpecialChar;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValidationError(null);
    clearError();
  };

  const validateForm = (): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      setValidationError("Email is required");
      return false;
    }
    if (!emailRegex.test(formData.email)) {
      setValidationError("Please enter a valid email");
      return false;
    }
    if (!formData.username.trim()) {
      setValidationError("Username is required");
      return false;
    }
    if (formData.username.length < 3) {
      setValidationError("Username must be at least 3 characters");
      return false;
    }
    if (!formData.password) {
      setValidationError("Password is required");
      return false;
    }
    if (!allCriteriaMet) {
      setValidationError("Password does not meet all requirements");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setValidationError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    await registerWithEmail({
      email: formData.email,
      username: formData.username,
      password: formData.password,
    });
  };

  const handleGoogleSignUp = () => initiateOAuth("google");
  const handleGithubSignUp = () => initiateOAuth("github");

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 relative flex items-center justify-center p-4 overflow-hidden">
      {/* Animated waves background */}
      <AnimatedWaves />

      {/* Logo - Top Left */}
      <motion.div
        className="absolute top-6 left-6 z-20"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/OFFER-HUB-light.png"
            alt="OfferHub"
            width={32}
            height={32}
            className="object-contain"
            priority
          />
          <span className="text-lg font-semibold text-gray-900">OFFER-HUB</span>
        </Link>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Create an account</h1>
              <p className="text-gray-500">Join OfferHub and start your journey</p>
            </div>

            {/* OAuth Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <motion.button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={isDisabled}
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loadingProvider === "google" ? <LoadingSpinner /> : <GoogleIcon />}
                <span className="text-gray-700 font-medium text-sm">Google</span>
              </motion.button>

              <motion.button
                type="button"
                onClick={handleGithubSignUp}
                disabled={isDisabled}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loadingProvider === "github" ? <LoadingSpinner /> : <GithubIcon />}
                <span className="font-medium text-sm">GitHub</span>
              </motion.button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white text-gray-400 text-sm">or</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={isDisabled}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#149A9B]/20 focus:border-[#149A9B] outline-none disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 placeholder-gray-400 transition-all"
                  placeholder="you@example.com"
                />
              </div>

              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  disabled={isDisabled}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#149A9B]/20 focus:border-[#149A9B] outline-none disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 placeholder-gray-400 transition-all"
                  placeholder="Choose a username"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    disabled={isDisabled}
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#149A9B]/20 focus:border-[#149A9B] outline-none disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 placeholder-gray-400 transition-all"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Password strength criteria */}
                {formData.password.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3 space-y-2"
                  >
                    <p className="text-xs font-medium text-gray-600">Password requirements:</p>
                    <ul className="space-y-1">
                      <li className={`flex items-center gap-2 text-xs ${criteria.isLengthValid ? "text-green-600" : "text-gray-500"}`}>
                        {criteria.isLengthValid ? <CheckIcon /> : <CircleIcon />}
                        At least 8 characters
                      </li>
                      <li className={`flex items-center gap-2 text-xs ${criteria.hasUpperLower ? "text-green-600" : "text-gray-500"}`}>
                        {criteria.hasUpperLower ? <CheckIcon /> : <CircleIcon />}
                        Uppercase and lowercase letters
                      </li>
                      <li className={`flex items-center gap-2 text-xs ${criteria.hasNumber ? "text-green-600" : "text-gray-500"}`}>
                        {criteria.hasNumber ? <CheckIcon /> : <CircleIcon />}
                        At least one number
                      </li>
                      <li className={`flex items-center gap-2 text-xs ${criteria.hasSpecialChar ? "text-green-600" : "text-gray-500"}`}>
                        {criteria.hasSpecialChar ? <CheckIcon /> : <CircleIcon />}
                        At least one special character
                      </li>
                    </ul>
                  </motion.div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    disabled={isDisabled}
                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-[#149A9B]/20 focus:border-[#149A9B] outline-none disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 placeholder-gray-400 transition-all ${
                      formData.confirmPassword && !passwordsMatch
                        ? "border-red-300"
                        : formData.confirmPassword && passwordsMatch
                        ? "border-green-300"
                        : "border-gray-200"
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {formData.confirmPassword && !passwordsMatch && (
                  <p className="mt-1.5 text-xs text-red-500">Passwords do not match</p>
                )}
                {formData.confirmPassword && passwordsMatch && (
                  <p className="mt-1.5 text-xs text-green-500 flex items-center gap-1">
                    <CheckIcon /> Passwords match
                  </p>
                )}
              </div>

              {/* Error message */}
              {(validationError || error) && (
                <motion.div
                  className="p-4 bg-red-50 border border-red-100 rounded-lg"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {validationError ? (
                    <p className="text-sm text-red-600">{validationError}</p>
                  ) : (
                    <div className="flex gap-3">
                      <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        {errorDetails?.title && (
                          <p className="text-sm font-medium text-red-700">{errorDetails.title}</p>
                        )}
                        <p className="text-sm text-red-600">{error}</p>
                        {errorDetails?.action === 'sign-in' && (
                          <Link
                            href="/onboarding/sign-in"
                            className="text-sm text-[#149A9B] hover:underline mt-1 inline-block"
                          >
                            Sign in to your account
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isDisabled || !allCriteriaMet || !passwordsMatch}
                className="w-full bg-[#149A9B] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#0d7377] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                whileHover={{ scale: allCriteriaMet && passwordsMatch ? 1.01 : 1 }}
                whileTap={{ scale: allCriteriaMet && passwordsMatch ? 0.99 : 1 }}
              >
                {isLoading && <LoadingSpinner />}
                Create account
              </motion.button>
            </form>

            {/* Sign In Link */}
            <p className="mt-6 text-center text-gray-600">
              Already have an account?{" "}
              <Link href="/onboarding/sign-in" className="text-[#149A9B] font-semibold hover:text-[#0d7377] transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
