"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  Upload,
  Calendar,
  AlertCircle,
  FileUp,
  Info,
  ExternalLink,
  CheckCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample tax documents
const taxDocuments = [
  {
    id: "TAX-2023-001",
    name: "Annual Income Statement",
    year: 2023,
    type: "income",
    status: "available",
    date: "2023-01-15",
    description: "Annual summary of all income received through the platform",
  },
  {
    id: "TAX-2023-002",
    name: "Quarterly Tax Summary Q1",
    year: 2023,
    type: "quarterly",
    status: "available",
    date: "2023-04-05",
    description: "Summary of income and platform fees for Q1 2023",
  },
  {
    id: "TAX-2023-003",
    name: "Quarterly Tax Summary Q2",
    year: 2023,
    type: "quarterly",
    status: "available",
    date: "2023-07-05",
    description: "Summary of income and platform fees for Q2 2023",
  },
  {
    id: "TAX-2023-004",
    name: "Quarterly Tax Summary Q3",
    year: 2023,
    type: "quarterly",
    status: "pending",
    date: "2023-10-05",
    description: "Summary of income and platform fees for Q3 2023",
  },
  {
    id: "TAX-2023-005",
    name: "Quarterly Tax Summary Q4",
    year: 2023,
    type: "quarterly",
    status: "upcoming",
    date: "2024-01-05",
    description: "Summary of income and platform fees for Q4 2023",
  },
];

// Sample uploaded documents
const uploadedDocuments = [
  {
    id: "UP-2023-001",
    name: "W-9 Form",
    date: "2023-01-10",
    status: "verified",
  },
  {
    id: "UP-2023-002",
    name: "Business License",
    date: "2023-02-15",
    status: "verified",
  },
];

export default function TaxDocuments() {
  const [activeTab, setActiveTab] = useState("documents");

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
      case "available":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Available</Badge>;
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Processing</Badge>
        );
      case "upcoming":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-gray-600 dark:text-white">Upcoming</Badge>;
      case "verified":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Verified</Badge>;
      default:
        return <Badge className="dark:bg-gray-700 dark:text-gray-300">Unknown</Badge>;
    }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={item}>
        <Alert className="bg-[#DEEFE7]/30 dark:bg-gray-800 border-[#15949C] dark:border-gray-700">
          <Info className="h-4 w-4 text-[#15949C]" />
          <AlertTitle className="text-[#002333] dark:text-white font-medium">
            Tax Information
          </AlertTitle>
          <AlertDescription className="text-[#002333]/70 dark:text-gray-300">
            Your tax documents are generated quarterly and annually. Make sure
            your tax information is up to date for accurate reporting.
          </AlertDescription>
        </Alert>
      </motion.div>

      <motion.div variants={item}>
        <Tabs
          defaultValue={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 dark:bg-gray-800">
            <TabsTrigger value="documents" className="dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white dark:text-white">Tax Documents</TabsTrigger>
            <TabsTrigger value="uploads" className="dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white dark:text-white">Uploaded Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="dark:bg-gray-900 dark:border-gray-700 shadow-lg">
                <CardHeader className="pb-2 dark:border-gray-700">
                  <CardTitle className="text-lg dark:text-white">Annual Documents</CardTitle>
                  <CardDescription className="dark:text-gray-300">Yearly tax summaries</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {taxDocuments
                      .filter((doc) => doc.type === "income")
                      .map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-[#002333] dark:text-white">
                              {doc.name}
                            </p>
                            <p className="text-xs text-[#002333]/70 dark:text-gray-400">
                              <Calendar className="h-3 w-3 inline mr-1" />
                              {new Date(doc.date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(doc.status)}
                            {doc.status === "available" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-[#15949C] dark:text-white dark:hover:bg-gray-600"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 dark:bg-gray-900 dark:border-gray-700 shadow-lg">
                <CardHeader className="pb-2 dark:border-gray-700">
                  <CardTitle className="text-lg dark:text-white">Quarterly Documents</CardTitle>
                  <CardDescription className="dark:text-gray-300">Quarterly tax summaries</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {taxDocuments
                      .filter((doc) => doc.type === "quarterly")
                      .map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-[#002333] dark:text-white">
                              {doc.name}
                            </p>
                            <p className="text-xs text-[#002333]/70 dark:text-gray-400">
                              {doc.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(doc.status)}
                            {doc.status === "available" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-[#15949C] dark:text-white dark:hover:bg-gray-600"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="dark:bg-gray-900 dark:border-gray-700 shadow-lg">
              <CardHeader className="dark:border-gray-700">
                <CardTitle className="dark:text-white">Tax Information</CardTitle>
                <CardDescription className="dark:text-gray-300">Your tax profile and settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-[#002333]/70 dark:text-gray-300 mb-2">
                      Tax Profile
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-[#002333]/70 dark:text-gray-400">Tax Form</span>
                          <span className="font-medium text-[#002333] dark:text-white">
                            W-9
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#002333]/70 dark:text-gray-400">Tax ID Type</span>
                          <span className="font-medium text-[#002333] dark:text-white">
                            SSN
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#002333]/70 dark:text-gray-400">
                            Tax Classification
                          </span>
                          <span className="font-medium text-[#002333] dark:text-white">
                            Individual/Sole Proprietor
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#002333]/70 dark:text-gray-400">
                            Last Updated
                          </span>
                          <span className="font-medium text-[#002333] dark:text-white">
                            Jan 10, 2023
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-[#002333]/70 dark:text-gray-300 mb-2">
                      Tax Settings
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-[#002333]/70 dark:text-gray-400">
                            Automatic Tax Document Generation
                          </span>
                          <span className="font-medium text-green-600 dark:text-green-400 flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Enabled
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#002333]/70 dark:text-gray-400">
                            Email Notifications
                          </span>
                          <span className="font-medium text-green-600 dark:text-green-400 flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Enabled
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#002333]/70 dark:text-gray-400">
                            Document Format
                          </span>
                          <span className="font-medium text-[#002333] dark:text-white">
                            PDF
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="dark:bg-gray-600" />

                <div>
                  <h3 className="text-sm font-medium text-[#002333]/70 dark:text-gray-300 mb-2">
                    Tax Resources
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="dark:bg-gray-800 dark:border-gray-700">
                      <CardHeader className="pb-2 dark:border-gray-700">
                        <CardTitle className="text-sm dark:text-white">
                          Tax Guidelines
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs text-[#002333]/70 dark:text-gray-400">
                        Learn about freelancer tax obligations and best
                        practices
                      </CardContent>
                      <CardFooter>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-[#15949C] dark:text-white dark:hover:bg-gray-700"
                        >
                          <ExternalLink className="h-3 w-3 mr-2" />
                          View Guide
                        </Button>
                      </CardFooter>
                    </Card>

                    <Card className="dark:bg-gray-800 dark:border-gray-700">
                      <CardHeader className="pb-2 dark:border-gray-700">
                        <CardTitle className="text-sm dark:text-white">
                          Tax Calculator
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs text-[#002333]/70 dark:text-gray-400">
                        Estimate your tax liability based on your earnings
                      </CardContent>
                      <CardFooter>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-[#15949C] dark:text-white dark:hover:bg-gray-700"
                        >
                          <ExternalLink className="h-3 w-3 mr-2" />
                          Use Calculator
                        </Button>
                      </CardFooter>
                    </Card>

                    <Card className="dark:bg-gray-800 dark:border-gray-700">
                      <CardHeader className="pb-2 dark:border-gray-700">
                        <CardTitle className="text-sm dark:text-white">Tax Support</CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs text-[#002333]/70 dark:text-gray-400">
                        Get help with tax-related questions from our support
                        team
                      </CardContent>
                      <CardFooter>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-[#15949C] dark:text-white dark:hover:bg-gray-700"
                        >
                          <ExternalLink className="h-3 w-3 mr-2" />
                          Contact Support
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="uploads" className="space-y-6 mt-6">
            <Card className="dark:bg-gray-900 dark:border-gray-700 shadow-lg">
              <CardHeader className="dark:border-gray-700">
                <CardTitle className="dark:text-white">Uploaded Documents</CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Tax and business documents you've uploaded
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {uploadedDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-[#15949C]/10 dark:bg-gray-600 rounded flex items-center justify-center mr-3">
                          <FileText className="h-5 w-5 text-[#15949C]" />
                        </div>
                        <div>
                          <p className="font-medium text-[#002333] dark:text-white">
                            {doc.name}
                          </p>
                          <p className="text-xs text-[#002333]/70 dark:text-gray-400">
                            Uploaded on{" "}
                            {new Date(doc.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(doc.status)}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-[#15949C] dark:text-white dark:hover:bg-gray-600"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg p-8 text-center">
                  <FileUp className="h-8 w-8 text-[#15949C] mx-auto mb-2" />
                  <p className="text-[#002333] dark:text-white font-medium">
                    Upload a new document
                  </p>
                  <p className="text-sm text-[#002333]/70 dark:text-gray-400 mb-4">
                    Accepted formats: PDF, JPG, PNG (max 10MB)
                  </p>
                  <Button className="bg-[#15949C] hover:bg-[#15949C]/90">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </div>

                <Separator className="dark:bg-gray-600" />

                <div>
                  <h3 className="font-medium text-[#002333] dark:text-white mb-4">
                    Required Documents
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                        <span className="text-[#002333] dark:text-white">W-9 Form</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Completed
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                        <span className="text-[#002333] dark:text-white">Business License</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Completed
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-amber-600 mr-3" />
                        <span className="text-[#002333] dark:text-white">Proof of Address</span>
                      </div>
                      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                        Required
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
