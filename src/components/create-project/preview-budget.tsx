"use client";

import React, { useMemo } from 'react';

interface Budget {
  amount: number;
  currency: string;
  taxRate: number;
  platformFee: number;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  amount: number;
  dependencies?: string[];
}

interface PreviewBudgetProps {
  budget: Budget;
  milestones: Milestone[];
  onEdit: (field: string, value: any) => void;
  readOnly: boolean;
}

const PreviewBudget: React.FC<PreviewBudgetProps> = ({
  budget,
  milestones,
  onEdit,
  readOnly
}) => {
  const calculations = useMemo(() => {
    const subtotal = budget.amount;
    const tax = subtotal * (budget.taxRate / 100);
    const platformFeeAmount = subtotal * (budget.platformFee / 100);
    const total = subtotal + tax + platformFeeAmount;
    
    const milestonesTotal = milestones.reduce((sum, m) => sum + m.amount, 0);
    const allocated = (milestonesTotal / subtotal) * 100;
    const remaining = subtotal - milestonesTotal;

    return {
      subtotal,
      tax,
      platformFeeAmount,
      total,
      milestonesTotal,
      allocated,
      remaining
    };
  }, [budget, milestones]);

  const formatCurrency = (amount: number) => {
    return `${budget.currency} ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage > 100) return 'bg-red-500';
    if (percentage > 90) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      {/* Budget Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <span>💰</span>
          <span>Budget Summary</span>
        </h2>

        <div className="space-y-4">
          {/* Budget Breakdown */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Project Budget</span>
                <span className="text-xl font-semibold text-gray-900">
                  {formatCurrency(calculations.subtotal)}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Tax ({budget.taxRate}%)</span>
                <span className="font-medium text-gray-700">
                  {formatCurrency(calculations.tax)}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Platform Fee ({budget.platformFee}%)</span>
                <span className="font-medium text-gray-700">
                  {formatCurrency(calculations.platformFeeAmount)}
                </span>
              </div>

              <div className="border-t-2 border-blue-300 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total Cost</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(calculations.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Budget Allocation Progress */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Budget Allocation</span>
                <span className="text-sm font-semibold text-gray-900">
                  {calculations.allocated.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(calculations.allocated)}`}
                  style={{ width: `${Math.min(calculations.allocated, 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Allocated to Milestones</p>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(calculations.milestonesTotal)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Remaining</p>
                <p className={`text-lg font-bold ${calculations.remaining >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {formatCurrency(calculations.remaining)}
                </p>
              </div>
            </div>

            {calculations.remaining < 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  ⚠️ Warning: Milestone allocations exceed total budget by {formatCurrency(Math.abs(calculations.remaining))}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Milestone Budget Breakdown */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <span>📊</span>
          <span>Milestone Budget Breakdown</span>
        </h2>

        <div className="space-y-3">
          {milestones.map((milestone, index) => {
            const percentage = (milestone.amount / calculations.subtotal) * 100;
            
            return (
              <div
                key={milestone.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold text-sm flex-shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {milestone.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Due: {new Date(milestone.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(milestone.amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {percentage.toFixed(1)}% of budget
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {milestones.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p>No milestones defined yet</p>
          </div>
        )}
      </div>

      {/* Budget Distribution Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <span>📈</span>
          <span>Budget Distribution</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pie Chart Representation */}
          <div className="col-span-1 md:col-span-2">
            <div className="space-y-2">
              {milestones.map((milestone, index) => {
                const percentage = (milestone.amount / calculations.subtotal) * 100;
                const colors = [
                  'bg-blue-500',
                  'bg-purple-500',
                  'bg-green-500',
                  'bg-yellow-500',
                  'bg-red-500',
                  'bg-indigo-500',
                  'bg-pink-500',
                  'bg-teal-500'
                ];
                const color = colors[index % colors.length];

                return (
                  <div key={milestone.id} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-3 h-3 rounded-full ${color}`} />
                        <span className="text-sm font-medium text-gray-700">
                          {milestone.title}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${color}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-16 text-right">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                );
              })}

              {calculations.remaining > 0 && (
                <div className="flex items-center gap-3 border-t pt-2 mt-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full bg-gray-300" />
                      <span className="text-sm font-medium text-gray-700">
                        Unallocated
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gray-300"
                        style={{ width: `${(calculations.remaining / calculations.subtotal) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-16 text-right">
                    {((calculations.remaining / calculations.subtotal) * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700 mb-1">Average per Milestone</p>
              <p className="text-xl font-bold text-blue-900">
                {formatCurrency(milestones.length > 0 ? calculations.milestonesTotal / milestones.length : 0)}
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs text-green-700 mb-1">Largest Milestone</p>
              <p className="text-xl font-bold text-green-900">
                {formatCurrency(milestones.length > 0 ? Math.max(...milestones.map(m => m.amount)) : 0)}
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-xs text-purple-700 mb-1">Smallest Milestone</p>
              <p className="text-xl font-bold text-purple-900">
                {formatCurrency(milestones.length > 0 ? Math.min(...milestones.map(m => m.amount)) : 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Breakdown Details */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <span>🧾</span>
          <span>Detailed Cost Breakdown</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Project Budget</td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(calculations.subtotal)}</td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">100%</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-700">Tax ({budget.taxRate}%)</td>
                <td className="px-4 py-3 text-sm text-gray-700 text-right">{formatCurrency(calculations.tax)}</td>
                <td className="px-4 py-3 text-sm text-gray-700 text-right">{budget.taxRate}%</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-700">Platform Fee ({budget.platformFee}%)</td>
                <td className="px-4 py-3 text-sm text-gray-700 text-right">{formatCurrency(calculations.platformFeeAmount)}</td>
                <td className="px-4 py-3 text-sm text-gray-700 text-right">{budget.platformFee}%</td>
              </tr>
              <tr className="bg-blue-50 border-t-2 border-blue-200">
                <td className="px-4 py-3 text-base font-bold text-gray-900">Total Cost</td>
                <td className="px-4 py-3 text-base font-bold text-blue-600 text-right">{formatCurrency(calculations.total)}</td>
                <td className="px-4 py-3 text-base font-bold text-gray-900 text-right">
                  {((calculations.total / calculations.subtotal) * 100).toFixed(1)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PreviewBudget;