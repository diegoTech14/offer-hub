/**
 * @fileoverview Page to display all registered users in the system
 * @author Offer Hub Team
 */

"use client";

import { useRegisteredUsersApi } from "@/hooks/api-connections/use-registered-users-api";
import RegisteredUsersTable from "@/components/registered-users/registered-users-table";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function RegisteredUsersPage() {
  const { users, loading, error, refetch } = useRegisteredUsersApi();

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Cargando usuarios...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="text-red-500 dark:text-red-400 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error al cargar usuarios</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button onClick={refetch} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Usuarios Registrados</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Total de usuarios: <span className="font-semibold">{users.length}</span>
            </p>
          </div>
          <Button onClick={refetch} variant="outline" size="sm" className="shrink-0">
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
        </div>

        <RegisteredUsersTable users={users} />
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <Header />
      <main className="flex-1 bg-gray-50 dark:bg-gray-800">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
}

