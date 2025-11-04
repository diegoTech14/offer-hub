/**
 * @fileoverview Table component to display all registered users
 * @author Offer Hub Team
 */

"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { maskWalletAddress, maskEmail } from "@/utils/mask-sensitive-data";
import { RegisteredUser } from "@/hooks/api-connections/use-registered-users-api";

interface RegisteredUsersTableProps {
  users: RegisteredUser[];
}

export default function RegisteredUsersTable({ users }: RegisteredUsersTableProps) {
  if (users.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">No hay usuarios registrados</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-900">
            <TableHead className="font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Nombre
            </TableHead>
            <TableHead className="font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Username
            </TableHead>
            <TableHead className="font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Email
            </TableHead>
            <TableHead className="font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Wallet
            </TableHead>
            <TableHead className="font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Tipo
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow 
              key={user.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-200 dark:border-gray-700"
            >
              <TableCell className="font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                {user.name || "N/A"}
              </TableCell>
              <TableCell className="text-gray-700 dark:text-gray-300 whitespace-nowrap">
                {user.username}
              </TableCell>
              <TableCell className="font-mono text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                {maskEmail(user.email)}
              </TableCell>
              <TableCell className="font-mono text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                {maskWalletAddress(user.wallet_address)}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.is_freelancer
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                      : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                  }`}
                >
                  {user.is_freelancer ? "Freelancer" : "Cliente"}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

