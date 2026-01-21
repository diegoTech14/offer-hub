"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AnimatedWaves } from "./AnimatedWaves";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

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
    <svg className="w-3 h-3 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
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
    <svg className="w-3 h-3 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" strokeWidth={2} />
    </svg>
  );
}

function SuccessIcon() {
  return (
    <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

interface PasswordCriteria {
  isLengthValid: boolean;
  hasUpperLower: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const criteria: PasswordCriteria = useMemo(
    () => ({
      isLengthValid: password.length >= 8,
      hasUpperLower: /[a-z]/.test(password) && /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }),
    [password]
  );

  const passwordsMatch = password === confirmPassword && password.length > 0;
  const allCriteriaMet =
    criteria.isLengthValid &&
    criteria.hasUpperLower &&
    criteria.hasNumber &&
    criteria.hasSpecialChar;
  const isFormValid = allCriteriaMet && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Invalid or missing reset token. Please request a new password reset link.");
      return;
    }

    if (!isFormValid) {
      setError("Please ensure your password meets all requirements");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // No token provided
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 relative flex items-center justify-center p-4 overflow-hidden">
        <AnimatedWaves />

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

        <div className="relative z-10 w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-3">Invalid Reset Link</h1>
              <p className="text-gray-500 mb-6">
                This password reset link is invalid or has expired. Please request a new one.
              </p>

              <Link
                href="/onboarding/forgot-password"
                className="inline-flex items-center justify-center w-full bg-[#149A9B] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#0d7377] transition-all"
              >
                Request new link
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 relative flex items-center justify-center p-4 overflow-hidden">
        <AnimatedWaves />

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

        <div className="relative z-10 w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="flex justify-center mb-6"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <SuccessIcon />
                </div>
              </motion.div>

              <h1 className="text-2xl font-bold text-gray-900 mb-3">Password Reset Successful</h1>
              <p className="text-gray-500 mb-6">
                Your password has been successfully updated. You can now sign in with your new password.
              </p>

              <motion.button
                onClick={() => router.push("/onboarding/sign-in")}
                className="inline-flex items-center justify-center w-full bg-[#149A9B] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#0d7377] transition-all"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                Sign in to your account
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 relative flex items-center justify-center p-4 overflow-hidden">
      <AnimatedWaves />

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

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset your password</h1>
              <p className="text-gray-500">Create a new secure password for your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* New Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  New password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                    disabled={isLoading}
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#149A9B]/20 focus:border-[#149A9B] outline-none disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 placeholder-gray-400 transition-all"
                    placeholder="Enter new password"
                    autoComplete="new-password"
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
                {password.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-2"
                  >
                    <ul className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                      <li className={`flex items-center gap-1 text-[10px] ${criteria.isLengthValid ? "text-green-600" : "text-gray-400"}`}>
                        {criteria.isLengthValid ? <CheckIcon /> : <CircleIcon />}
                        8+ characters
                      </li>
                      <li className={`flex items-center gap-1 text-[10px] ${criteria.hasUpperLower ? "text-green-600" : "text-gray-400"}`}>
                        {criteria.hasUpperLower ? <CheckIcon /> : <CircleIcon />}
                        Upper & lowercase
                      </li>
                      <li className={`flex items-center gap-1 text-[10px] ${criteria.hasNumber ? "text-green-600" : "text-gray-400"}`}>
                        {criteria.hasNumber ? <CheckIcon /> : <CircleIcon />}
                        One number
                      </li>
                      <li className={`flex items-center gap-1 text-[10px] ${criteria.hasSpecialChar ? "text-green-600" : "text-gray-400"}`}>
                        {criteria.hasSpecialChar ? <CheckIcon /> : <CircleIcon />}
                        One special char
                      </li>
                    </ul>
                  </motion.div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm new password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError(null);
                    }}
                    disabled={isLoading}
                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-[#149A9B]/20 focus:border-[#149A9B] outline-none disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 placeholder-gray-400 transition-all ${
                      confirmPassword && !passwordsMatch
                        ? "border-red-300"
                        : confirmPassword && passwordsMatch
                        ? "border-green-300"
                        : "border-gray-200"
                    }`}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
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
                {confirmPassword && !passwordsMatch && (
                  <p className="mt-1.5 text-xs text-red-500">Passwords do not match</p>
                )}
                {confirmPassword && passwordsMatch && (
                  <p className="mt-1.5 text-xs text-green-500 flex items-center gap-1">
                    <CheckIcon /> Passwords match
                  </p>
                )}
              </div>

              {error && (
                <motion.div
                  className="p-4 bg-red-50 border border-red-100 rounded-lg"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-sm text-red-600">{error}</p>
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={isLoading || !isFormValid}
                className="w-full bg-[#149A9B] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#0d7377] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                whileHover={{ scale: isFormValid ? 1.01 : 1 }}
                whileTap={{ scale: isFormValid ? 0.99 : 1 }}
              >
                {isLoading && <LoadingSpinner />}
                Reset password
              </motion.button>
            </form>

            <p className="mt-6 text-center text-gray-600">
              Remember your password?{" "}
              <Link
                href="/onboarding/sign-in"
                className="text-[#149A9B] font-semibold hover:text-[#0d7377] transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
