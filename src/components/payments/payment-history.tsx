"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Download,
  Calendar,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Sample payment history data
const paymentHistory = [
  {
    id: "INV-2023-001",
    date: "2023-05-15",
    description: "Website Redesign Project",
    amount: 1250.0,
    type: "income",
    status: "completed",
    client: "TechCorp Inc.",
    paymentMethod: "Credit Card",
  },
  {
    id: "INV-2023-002",
    date: "2023-05-10",
    description: "Logo Design Project",
    amount: 450.0,
    type: "income",
    status: "completed",
    client: "Creative Studios",
    paymentMethod: "PayPal",
  },
  {
    id: "FEE-2023-001",
    date: "2023-05-05",
    description: "Platform Fee",
    amount: 85.0,
    type: "expense",
    status: "completed",
    client: "Offer Hub",
    paymentMethod: "Automatic Deduction",
  },
  {
    id: "INV-2023-003",
    date: "2023-05-01",
    description: "Mobile App Development",
    amount: 2500.0,
    type: "income",
    status: "pending",
    client: "StartUp Mobile",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "INV-2023-004",
    date: "2023-04-28",
    description: "Content Writing",
    amount: 350.0,
    type: "income",
    status: "completed",
    client: "Blog Media",
    paymentMethod: "Credit Card",
  },
  {
    id: "INV-2023-005",
    date: "2023-04-20",
    description: "SEO Optimization",
    amount: 750.0,
    type: "income",
    status: "completed",
    client: "Digital Marketing Co.",
    paymentMethod: "PayPal",
  },
  {
    id: "FEE-2023-002",
    date: "2023-04-15",
    description: "Platform Fee",
    amount: 55.0,
    type: "expense",
    status: "completed",
    client: "Offer Hub",
    paymentMethod: "Automatic Deduction",
  },
  {
    id: "INV-2023-006",
    date: "2023-04-10",
    description: "UI/UX Design",
    amount: 1800.0,
    type: "income",
    status: "completed",
    client: "Tech Innovations",
    paymentMethod: "Bank Transfer",
  },
];

export default function PaymentHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  // Filter payments based on search term and filters
  const filteredPayments = paymentHistory.filter((payment) => {
    const matchesSearch =
      payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || payment.status === statusFilter;
    const matchesType = typeFilter === "all" || payment.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={item}>
        <Card className="dark:bg-gray-900 dark:border-gray-700 shadow-lg">
          <CardHeader className="dark:border-gray-700">
            <CardTitle className="dark:text-white text-xl">Payment History</CardTitle>
            <CardDescription className="dark:text-gray-300">
              View and manage all your past transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                <Input
                  placeholder="Search transactions..."
                  className="pl-10 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                    <SelectItem value="all" className="dark:text-white dark:hover:bg-gray-700">All Statuses</SelectItem>
                    <SelectItem value="completed" className="dark:text-white dark:hover:bg-gray-700">Completed</SelectItem>
                    <SelectItem value="pending" className="dark:text-white dark:hover:bg-gray-700">Pending</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[140px] dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                    <SelectItem value="all" className="dark:text-white dark:hover:bg-gray-700">All Types</SelectItem>
                    <SelectItem value="income" className="dark:text-white dark:hover:bg-gray-700">Income</SelectItem>
                    <SelectItem value="expense" className="dark:text-white dark:hover:bg-gray-700">Expense</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="icon" className="h-10 w-10 dark:border-gray-600 dark:text-white dark:hover:bg-gray-800">
                  <Calendar className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  className="hidden md:flex items-center dark:border-gray-600 dark:text-white dark:hover:bg-gray-800"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>

                <Button className="bg-[#15949C] hover:bg-[#15949C]/90 hidden md:flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-lg">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                    <th className="text-left py-3 px-4 text-[#002333]/70 dark:text-gray-300 font-medium">
                      Transaction
                    </th>
                    <th className="text-left py-3 px-4 text-[#002333]/70 dark:text-gray-300 font-medium">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 text-[#002333]/70 dark:text-gray-300 font-medium">
                      Client
                    </th>
                    <th className="text-left py-3 px-4 text-[#002333]/70 dark:text-gray-300 font-medium">
                      Payment Method
                    </th>
                    <th className="text-left py-3 px-4 text-[#002333]/70 dark:text-gray-300 font-medium">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 text-[#002333]/70 dark:text-gray-300 font-medium">
                      Status
                    </th>
                    <th className="text-right py-3 px-4 text-[#002333]/70 dark:text-gray-300 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment, index) => (
                    <motion.tr
                      key={payment.id}
                      variants={item}
                      className="border-b border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div
                            className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
                              payment.type === "income"
                                ? "bg-green-100 dark:bg-green-900/30"
                                : "bg-red-100 dark:bg-red-900/30"
                            }`}
                          >
                            {payment.type === "income" ? (
                              <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-[#002333] dark:text-gray-300">
                              {payment.description}
                            </p>
                            <p className="text-xs text-[#002333]/70 dark:text-gray-400">
                              {payment.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-[#002333] dark:text-gray-300">
                        {new Date(payment.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="py-4 px-4 text-[#002333] dark:text-gray-300">
                        {payment.client}
                      </td>
                      <td className="py-4 px-4 text-[#002333] dark:text-gray-300">
                        {payment.paymentMethod}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`font-medium ${
                            payment.type === "income"
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {payment.type === "income" ? "+" : "-"}$
                          {payment.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          className={`${
                            payment.status === "completed"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                              : "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400"
                          }`}
                        >
                          {payment.status === "completed"
                            ? "Completed"
                            : "Pending"}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-[#15949C] dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </td>
                    </motion.tr>
                  ))}

                  {filteredPayments.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-8 text-center text-[#002333]/70 dark:text-gray-400"
                      >
                        No transactions found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6">
              <Pagination>
                <PaginationContent className="dark:text-white">
                  <PaginationItem>
                    <PaginationPrevious href="#" className="dark:text-white dark:hover:bg-gray-800" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                      1
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" className="dark:text-white dark:hover:bg-gray-800">2</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" className="dark:text-white dark:hover:bg-gray-800">3</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationEllipsis className="dark:text-gray-400" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" className="dark:text-white dark:hover:bg-gray-800" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
