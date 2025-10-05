import { PublicRoute } from "@/components/auth/public-route";
import WalletConnectPage from "../../components/onboarding/ConnectWalletPage";
import HeaderNavigation from "@/components/ui/header-navigation";

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