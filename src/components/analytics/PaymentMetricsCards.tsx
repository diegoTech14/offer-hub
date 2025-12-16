"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requestedPaymentsCards } from "@/__mocks__/analytics-mock-data";
import { DollarSign, TrendingUp, TrendingDown, Activity } from "lucide-react";

const iconMap = {
  0: DollarSign,
  1: TrendingUp,
  2: TrendingDown,
  3: Activity,
};

export default function PaymentMetricsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {requestedPaymentsCards.map((m, idx) => {
        const Icon = iconMap[idx as keyof typeof iconMap] || DollarSign;
        const isSecondary = m.variant === 'secondary';
        
        return (
          <Card
            key={idx}
            className="relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-gray-200 bg-white"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                {m.label}
              </CardTitle>
              <div className={`p-3 rounded-xl shadow-md ${
                isSecondary 
                  ? 'bg-gradient-to-br from-[#149A9B] to-[#0D7475] text-white' 
                  : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                ${m.amount}
              </div>
              <p className="text-xs text-gray-500 font-medium">
                {isSecondary ? 'This period' : 'Total'}
              </p>
            </CardContent>
            
            {/* Decorative gradient */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 ${
              isSecondary 
                ? 'bg-gradient-to-r from-[#149A9B] to-[#0D7475]' 
                : 'bg-gradient-to-r from-blue-500 to-blue-600'
            }`} />
          </Card>
        );
      })}
    </div>
  );
}


