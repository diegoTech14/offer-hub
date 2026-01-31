"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { paymentHistoryMock } from "@/__mocks__/payment-history-mock";
import { History } from "lucide-react";

export default function PaymentHistoryTable() {
  return (
    <Card className="border-gray-200 bg-gradient-to-br from-white to-gray-50/30">
      <CardHeader className="pb-3 p-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#149A9B]/10">
            <History className="w-4 h-4 text-[#149A9B]" />
          </div>
          <CardTitle className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Payment History
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0 p-4">
        <div className="space-y-2">
          {paymentHistoryMock.map((row) => (
            <div 
              key={row.id} 
              className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-100 hover:border-[#149A9B]/30 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#149A9B] to-[#0D7475] flex items-center justify-center text-white font-semibold text-xs">
                  {row.freelancer.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{row.freelancer}</div>
                  <div className="text-xs text-gray-500">{row.note}</div>
                </div>
              </div>
              <div className="text-[#149A9B] font-bold text-sm">${row.amount}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


