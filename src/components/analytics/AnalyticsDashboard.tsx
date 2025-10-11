"use client";

import PaymentMetricsCards from "./PaymentMetricsCards";
import PaymentHistoryTable from "./PaymentHistoryTable";

export default function AnalyticsDashboard() {
  return (
    <div className="space-y-4">
      <PaymentMetricsCards />
      <PaymentHistoryTable />
    </div>
  );
}


