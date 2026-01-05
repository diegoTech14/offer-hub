"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { useRegister } from "@/hooks/auth/use-register";
import { useOAuth } from "@/hooks/auth/use-oauth";
import { LoginWithEmailPayload } from "@/types/auth-register.types";
import Link from "next/link";

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

export function SignInPage() {
  const { loginWithEmail, isLoading, error, clearError } = useRegister();
  const { initiateOAuth, isLoading: isOAuthLoading, loadingProvider } = useOAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isDisabled = isLoading || isOAuthLoading;

  const validateForm = (): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setValidationError("Email is required");
      return false;
    } else if (!emailRegex.test(email)) {
      setValidationError("Invalid email format");
      return false;
    }

    if (!password) {
      setValidationError("Password is required");
      return false;
    } else if (password.length < 8) {
      setValidationError("Password must be at least 8 characters");
      return false;
    }

    setValidationError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) return;

    const payload: LoginWithEmailPayload = {
      email,
      password,
    };

    await loginWithEmail(payload);
  };

  const handleGoogleSignIn = () => {
    initiateOAuth("google");
  };

  const handleGithubSignIn = () => {
    initiateOAuth("github");
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
    <div className="min-h-screen bg-muted flex flex-col">
      <AuthHeader />
      <div className="flex flex-col items-center justify-start flex-1 px-4 pt-8 pb-8">
        <Card className="w-full max-w-md p-8 shadow-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Welcome back
            </h1>
            <p className="text-sm text-gray-500">
              Sign in to your account
            </p>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              type="button"
              variant="outline"
              className="w-full py-6 text-base font-medium border-gray-300 hover:bg-gray-50 transition-colors"
              onClick={handleGoogleSignIn}
              disabled={isDisabled}
            >
              {loadingProvider === "google" ? (
                <LoadingSpinner />
              ) : (
                <GoogleIcon />
              )}
              <span className="ml-3">Continue with Google</span>
            </Button>

            <Button
              type="button"
              className="w-full py-6 text-base font-medium bg-[#24292e] hover:bg-[#1b1f23] text-white transition-colors"
              onClick={handleGithubSignIn}
              disabled={isDisabled}
            >
              {loadingProvider === "github" ? (
                <LoadingSpinner />
              ) : (
                <GithubIcon />
              )}
              <span className="ml-3">Continue with GitHub</span>
            </Button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-sm text-gray-500">
              or
            </span>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#344054] mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setValidationError(null);
                }}
                disabled={isDisabled}
                className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#19213D] focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[#667085]"
                placeholder="you@example.com"
                required
              />
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
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setValidationError(null);
                  }}
                  disabled={isDisabled}
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#19213D] focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[#667085]"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isDisabled}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                href="/onboarding/password"
                className="text-sm text-[#149A9B] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Error message */}
            {(validationError || error) && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{validationError || error}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isDisabled}
              className="w-full bg-[#002333] text-white py-3 px-4 rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#19213D] focus:ring-offset-2 flex items-center justify-center gap-2"
            >
              {isLoading && <LoadingSpinner />}
              Sign In
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/onboarding/sign-up" className="text-[#149A9B] font-medium hover:underline">
              Sign up
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
