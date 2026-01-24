"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TalentPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main find-workers page
    router.push("/find-workers");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirecting to Find Workers...</p>
    </div>
  );
}
