"use client";

import { useState, useEffect, createContext, useContext } from "react";

type Role = "client" | "freelancer" | "admin";

interface RoleContextType {
    role: Role;
    setRole: (role: Role) => void;
    isFreelancer: boolean;
    isClient: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
    const [role, setRoleState] = useState<Role>("client");

    useEffect(() => {
        const savedRole = localStorage.getItem("userRole") as Role;
        if (savedRole) {
            setRoleState(savedRole);
        }
    }, []);

    const setRole = (newRole: Role) => {
        setRoleState(newRole);
        localStorage.setItem("userRole", newRole);
    };

    const isFreelancer = role === "freelancer";
    const isClient = role === "client";

    return (
        <RoleContext.Provider value={{ role, setRole, isFreelancer, isClient }}>
            {children}
        </RoleContext.Provider>
    );
}

export function useRole() {
    const context = useContext(RoleContext);
    if (context === undefined) {
        throw new Error("useRole must be used within a RoleProvider");
    }
    return context;
}
