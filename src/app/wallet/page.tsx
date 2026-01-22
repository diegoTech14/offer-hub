"use client";

import dynamic from "next/dynamic";
import { PublicRoute } from "@/components/auth/public-route";
import HeaderNavigation from "@/components/ui/header-navigation";

// Dynamically import WalletConnectPage with SSR disabled
const WalletConnectPage = dynamic(
   () => import("../../components/onboarding/ConnectWalletPage"),
   { ssr: false }
);

export default function WalletPage() {
   return (
      <PublicRoute>
         <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <HeaderNavigation />
            <WalletConnectPage />
         </div>
      </PublicRoute>
   );
}