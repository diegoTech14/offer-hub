"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardMessagesPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main messages page
    router.push("/messages");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirecting to messages...</p>
    </div>
  );
}


