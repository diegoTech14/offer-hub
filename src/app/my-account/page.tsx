"use client"

import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import AccountSettings from "./account-settings-client"
import HeaderNavigation from "@/components/ui/header-navigation"
import { useEffect } from "react"

export default function Page() {


    // This will be handled by the auth and stored in the backend
    useEffect(() => {
        localStorage.setItem("roles", JSON.stringify(["user"]));
    }, [])



    return (
        // This page is protected and set to user access
        <ProtectedRoute roles={["user"]} >
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <HeaderNavigation />
                <AccountSettings />
            </div>
        </ProtectedRoute>
    )
}
