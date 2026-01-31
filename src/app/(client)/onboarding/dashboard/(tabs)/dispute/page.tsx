"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, FileText, MessageCircle, Shield } from "lucide-react";

export default function DisputePage() {
  // Mock data - replace with real data from API
  const disputes = [
    {
      id: 1,
      projectTitle: "Website Development",
      claimant: "Client",
      status: "Under Review",
      createdAt: "Dec 5, 2025",
      priority: "High",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Disputes</h1>
          <p className="text-gray-600 mt-1">Manage and resolve project disputes</p>
        </div>
        <Badge variant="destructive" className="w-fit">
          {disputes.length} Active
        </Badge>
      </div>

      {/* Disputes List */}
      {disputes.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {disputes.map((dispute) => (
            <Card key={dispute.id} className="border-l-4 border-l-red-500">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <CardTitle className="text-lg">{dispute.projectTitle}</CardTitle>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Raised by: {dispute.claimant} • {dispute.createdAt}
                    </p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={
                      dispute.priority === "High" 
                        ? "border-red-500 text-red-600"
                        : "border-yellow-500 text-yellow-600"
                    }
                  >
                    {dispute.priority} Priority
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status Badge */}
                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 w-fit">
                  <Shield className="w-3 h-3 mr-1" />
                  {dispute.status}
                </Badge>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <FileText className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Messages
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Active Disputes
            </h3>
            <p className="text-gray-600 text-center">
              All your projects are running smoothly without any disputes.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


