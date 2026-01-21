"use client";

import { useRole } from "@/lib/contexts/RoleContext";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode, useState } from "react";

interface RoleGuardProps {
    children: ReactNode;
    allowedRole: "client" | "freelancer";
    redirectTo?: string;
}

export function RoleGuard({
    children,
    allowedRole,
    redirectTo = "/onboarding/dashboard"
}: RoleGuardProps) {
    const { role } = useRole();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        // If the user's current role doesn't match the allowed role, redirect them
        if (mounted && role !== allowedRole) {
            router.push(redirectTo);
        }
    }, [role, allowedRole, router, redirectTo, mounted]);

    // Avoid rendering during hydration if role logic is client-side only
    if (!mounted || role !== allowedRole) {
        return null;
    }

    return <>{children}</>;
}
