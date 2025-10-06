"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  CreditCard,
  FileText,
  User,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Sample pending payments data
const pendingPayments = [
  {
    id: "PMT-001",
    projectName: "Mobile App Development",
    client: "StartUp Mobile",
    amount: 2500.0,
    dueDate: "2023-06-15",
    status: "awaiting_payment",
    progress: 100,
    milestones: [
      { name: "Design Phase", amount: 750, status: "paid" },
      { name: "Development Phase", amount: 1250, status: "paid" },
      { name: "Testing & Deployment", amount: 500, status: "awaiting_payment" },
    ],
  },
  {
    id: "PMT-002",
    projectName: "E-commerce Website",
    client: "Fashion Boutique",
    amount: 1800.0,
    dueDate: "2023-06-10",
    status: "awaiting_approval",
    progress: 90,
    milestones: [
      { name: "UI/UX Design", amount: 600, status: "paid" },
      { name: "Frontend Development", amount: 700, status: "paid" },
      { name: "Backend Integration", amount: 500, status: "awaiting_approval" },
    ],
  },
  {
    id: "PMT-003",
    projectName: "Content Marketing Campaign",
    client: "Health Products Inc.",
    amount: 950.0,
    dueDate: "2023-06-05",
    status: "in_progress",
    progress: 65,
    milestones: [
      { name: "Strategy Development", amount: 300, status: "paid" },
      { name: "Content Creation", amount: 400, status: "in_progress" },
      { name: "Distribution & Analytics", amount: 250, status: "pending" },
    ],
  },
];

export default function PendingPayments() {
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "awaiting_payment":
        return (
          <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400">
            Awaiting Payment
          </Badge>
        );
      case "awaiting_approval":
        return (
          <Badge className="bg-blue-100 dark:bg-gray-600 text-blue-800 dark:text-white">Awaiting Approval</Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400">In Progress</Badge>
        );
      case "paid":
        return <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">Paid</Badge>;
      case "pending":
        return <Badge className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">Pending</Badge>;
      default:
        return <Badge className="dark:bg-gray-700 dark:text-gray-300">Unknown</Badge>;
    }
  };

  const getTotalDue = () => {
    return pendingPayments.reduce((total, payment) => {
      if (payment.status === "awaiting_payment") {
        return total + payment.amount;
      }
      return total;
    }, 0);
  };

  const getNextDueDate = () => {
    const dueDates = pendingPayments
      .filter((payment) => payment.status === "awaiting_payment")
      .map((payment) => new Date(payment.dueDate));

    if (dueDates.length === 0) return null;

    return new Date(Math.min(...dueDates.map((date) => date.getTime())));
  };

  const nextDueDate = getNextDueDate();

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={item}>
        <Alert className="bg-[#DEEFE7]/30 dark:bg-gray-800 border-[#15949C] dark:border-gray-700">
          <AlertCircle className="h-4 w-4 text-[#15949C]" />
          <AlertTitle className="text-[#002333] dark:text-white font-medium">
            Payment Summary
          </AlertTitle>
          <AlertDescription className="text-[#002333]/70 dark:text-gray-300">
            You have {pendingPayments.length} pending payments totaling $
            {getTotalDue().toFixed(2)}.
            {nextDueDate && (
              <span>
                {" "}
                The next payment is due on{" "}
                {nextDueDate.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                .
              </span>
            )}
          </AlertDescription>
        </Alert>
      </motion.div>

      <div className="grid grid-cols-1 gap-6">
        {pendingPayments.map((payment, index) => (
          <motion.div key={payment.id} variants={item}>
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="dark:text-white">{payment.projectName}</CardTitle>
                    <CardDescription className="dark:text-gray-300">
                      Project with {payment.client}
                    </CardDescription>
                  </div>
                  {getStatusBadge(payment.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="flex flex-col">
                    <span className="text-sm text-[#002333]/70 dark:text-gray-300 mb-1">
                      Amount Due
                    </span>
                    <span className="text-2xl font-bold text-[#002333] dark:text-white">
                      ${payment.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-[#002333]/70 dark:text-gray-300 mb-1">
                      Due Date
                    </span>
                    <span className="text-lg font-medium text-[#002333] dark:text-white flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-[#15949C]" />
                      {new Date(payment.dueDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-[#002333]/70 dark:text-gray-300 mb-1">
                      Project Progress
                    </span>
                    <div className="flex items-center gap-2">
                      <Progress value={payment.progress} className="h-2" />
                      <span className="text-sm font-medium dark:text-white">
                        {payment.progress}%
                      </span>
                    </div>
                  </div>
                </div>

                <Separator className="my-4 dark:bg-gray-600" />

                <div className="space-y-3">
                  <h4 className="font-medium text-[#002333] dark:text-white">Milestones</h4>
                  {payment.milestones.map((milestone, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center">
                        {milestone.status === "paid" ? (
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                        ) : milestone.status === "in_progress" ? (
                          <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                        )}
                        <span className="font-medium text-[#002333] dark:text-white">
                          {milestone.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#002333] dark:text-white">
                          ${milestone.amount.toFixed(2)}
                        </span>
                        {getStatusBadge(milestone.status)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end mt-6 gap-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="border-[#15949C] text-[#15949C] dark:bg-gray-600 dark:border-gray-600 dark:text-white dark:hover:bg-gray-500"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View Invoice
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
                      <DialogHeader>
                        <DialogTitle className="dark:text-white">Invoice Details</DialogTitle>
                        <DialogDescription className="dark:text-gray-300">
                          Invoice for {payment.projectName} with{" "}
                          {payment.client}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-[#002333]/70 dark:text-gray-400">
                              Invoice ID
                            </p>
                            <p className="font-medium dark:text-white">{payment.id}</p>
                          </div>
                          <div>
                            <p className="text-sm text-[#002333]/70 dark:text-gray-400">Date</p>
                            <p className="font-medium dark:text-white">
                              {new Date().toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        </div>

                        <Separator className="dark:bg-gray-700" />

                        <div>
                          <p className="text-sm text-[#002333]/70 dark:text-gray-400">Client</p>
                          <div className="flex items-center mt-1">
                            <User className="h-4 w-4 mr-2 text-[#15949C]" />
                            <p className="font-medium dark:text-white">{payment.client}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-[#002333]/70 dark:text-gray-400">Project</p>
                          <p className="font-medium dark:text-white">{payment.projectName}</p>
                        </div>

                        <Separator className="dark:bg-gray-700" />

                        <div>
                          <p className="font-medium mb-2 dark:text-white">Milestones</p>
                          <div className="space-y-2">
                            {payment.milestones.map((milestone, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span className="dark:text-gray-300">{milestone.name}</span>
                                <span className="dark:text-white">${milestone.amount.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Separator className="dark:bg-gray-700" />

                        <div className="flex justify-between font-bold">
                          <span className="dark:text-white">Total</span>
                          <span className="dark:text-white">${payment.amount.toFixed(2)}</span>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">Download PDF</Button>
                        <Button className="bg-[#15949C] hover:bg-[#15949C]/90">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Pay Now
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {payment.status === "awaiting_payment" && (
                    <Button className="bg-[#15949C] hover:bg-[#15949C]/90">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay Now
                    </Button>
                  )}

                  {payment.status === "awaiting_approval" && (
                    <Button className="bg-[#15949C] hover:bg-[#15949C]/90">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Work
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
