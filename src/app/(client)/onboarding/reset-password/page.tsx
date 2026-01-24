"use client";

import { Suspense } from "react";
import { ResetPasswordPage } from "@/components/auth/ResetPasswordPage";

function ResetPasswordContent() {
  return <ResetPasswordPage />;
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#149A9B]"></div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
