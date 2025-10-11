"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { EmailPasswordForm } from "@/components/auth/email-password-form";
import { WalletRegisterForm } from "@/components/auth/wallet-register-form";
import { useRegister } from "@/hooks/auth/use-register";
import { RegisterFormState, WalletRegisterFormState } from "@/types/auth-register.types";
import Link from "next/link";

type TabType = "email" | "wallet";

export default function SignUpPage() {
  const [activeTab, setActiveTab] = useState<TabType>("email");
  const { registerWithEmail, registerWithWallet, isLoading, error, clearError } = useRegister();

  const handleEmailRegister = async (data: RegisterFormState) => {
    clearError();
    await registerWithEmail({
      email: data.email,
      password: data.password,
      username: data.username,
      name: data.name,
      bio: data.bio,
      is_freelancer: data.is_freelancer,
    });
  };

  const handleWalletRegister = async (data: WalletRegisterFormState) => {
    clearError();
    await registerWithWallet({
      wallet_address: data.wallet_address || "",
      signature: data.signature || "",
      email: data.email,
      password: data.password,
      username: data.username,
      name: data.name,
      bio: data.bio,
      is_freelancer: data.is_freelancer,
    });
  };

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      <AuthHeader />
      <div className="flex flex-col items-center justify-start flex-1 px-4 pt-8">
        <Card className="w-full max-w-md p-6 shadow-lg">
          <h1 className="text-2xl font-semibold text-center mb-2">Create Account</h1>
          <p className="text-center text-sm text-gray-500 mb-6">
            Join OfferHub and start your journey
          </p>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => {
                setActiveTab("email");
                clearError();
              }}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                activeTab === "email"
                  ? "bg-white text-[#149A9B] shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Email
            </button>
            <button
              onClick={() => {
                setActiveTab("wallet");
                clearError();
              }}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                activeTab === "wallet"
                  ? "bg-white text-[#149A9B] shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Wallet
            </button>
          </div>

          {/* Tab Content */}
          <div className="mt-4">
            {activeTab === "email" ? (
              <div>
                <p className="text-sm text-gray-600 mb-4 text-center">
                  Register with your email and we'll create a secure wallet for you
                </p>
                <EmailPasswordForm
                  onSubmit={handleEmailRegister}
                  isLoading={isLoading}
                  error={error}
                  mode="register"
                />
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-4 text-center">
                  Connect your Stellar wallet and create your account
                </p>
                <WalletRegisterForm
                  onSubmit={handleWalletRegister}
                  isLoading={isLoading}
                  error={error}
                />
              </div>
            )}
          </div>

          <Separator className="my-6" />

          {/* Sign In Link */}
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/onboarding/sign-in" className="text-[#149A9B] font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}


