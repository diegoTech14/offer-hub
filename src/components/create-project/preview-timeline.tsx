"use client";

import React, { useMemo } from 'react';

interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  amount: number;
  dependencies?: string[];
}

interface Timeline {
  startDate: string;
  endDate: string;
  milestones: Milestone[];
}

interface PreviewTimelineProps {
  timeline: Timeline;
  onEdit: (field: string, value: any) => void;
  readOnly: boolean;
}

const PreviewTimeline: React.FC<PreviewTimelineProps> = ({
  timeline,
  onEdit,
  readOnly
}) => {
  const { startDate, endDate, milestones } = timeline;

  const timelineStats = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    const sortedMilestones = [...milestones].sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );

    return {
      totalDays,
      totalMilestones: milestones.length,
      sortedMilestones,
      averageDaysBetweenMilestones: totalDays / (milestones.length || 1)
    };
  }, [startDate, endDate, milestones]);

  const getMilestonePosition = (date: string) => {
    const milestoneDate = new Date(date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = milestoneDate.getTime() - start.getTime();
    
    return Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
  };

  const getDependencyLines = (milestone: Milestone) => {
    if (!milestone.dependencies || milestone.dependencies.length === 0) {
      return [];
    }

    return milestone.dependencies.map(depId => {
      const dependentMilestone = milestones.find(m => m.id === depId);
      return dependentMilestone ? dependentMilestone.title : null;
    }).filter(Boolean);
  };

  const getStatusColor = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) return 'bg-red-500';
    if (daysUntilDue <= 7) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      {/* Timeline Overview */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <span>📅</span>
          <span>Timeline Overview</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Start Date</p>
            <p className="text-lg font-semibold text-blue-600">
              {new Date(startDate).toLocaleDateString()}
            </p>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">End Date</p>
            <p className="text-lg font-semibold text-purple-600">
              {new Date(endDate).toLocaleDateString()}
            </p>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Duration</p>
            <p className="text-lg font-semibold text-green-600">
              {timelineStats.totalDays} days
            </p>
          </div>

          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Milestones</p>
            <p className="text-lg font-semibold text-orange-600">
              {timelineStats.totalMilestones}
            </p>
          </div>
        </div>
      </div>

      {/* Visual Timeline */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <span>📊</span>
          <span>Visual Timeline</span>
        </h2>

        <div className="relative pt-8 pb-4">
          {/* Timeline Bar */}
          <div className="relative h-2 bg-gray-200 rounded-full">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
            
            {/* Milestone Markers */}
            {timelineStats.sortedMilestones.map((milestone, idx) => {
              const position = getMilestonePosition(milestone.dueDate);
              
              return (
                <div
                  key={milestone.id}
                  className="absolute transform -translate-x-1/2"
                  style={{ left: `${position}%`, top: '-20px' }}
                >
                  <div className="flex flex-col items-center">
                    <div className={`w-4 h-4 rounded-full border-2 border-white ${getStatusColor(milestone.dueDate)}`} />
                    <div className="mt-6 w-32 text-center">
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {milestone.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(milestone.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Start and End Labels */}
          <div className="flex justify-between mt-20 text-xs text-gray-600">
            <span>Start</span>
            <span>End</span>
          </div>
        </div>
      </div>

      {/* Milestone Details */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <span>🎯</span>
          <span>Milestone Details</span>
        </h2>

        <div className="space-y-4">
          {timelineStats.sortedMilestones.map((milestone, idx) => {
            const dependencies = getDependencyLines(milestone);
            const daysFromStart = Math.ceil(
              (new Date(milestone.dueDate).getTime() - new Date(startDate).getTime()) / 
              (1000 * 60 * 60 * 24)
            );

            return (
              <div
                key={milestone.id}
                className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold text-sm">
                        {idx + 1}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {milestone.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full text-white ${getStatusColor(milestone.dueDate)}`}>
                        Day {daysFromStart}
                      </span>
                    </div>

                    <p className="text-gray-600 ml-11 mb-3">
                      {milestone.description}
                    </p>

                    <div className="ml-11 flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">📅 Due:</span>
                        <span className="font-medium text-gray-900">
                          {new Date(milestone.dueDate).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">💰 Amount:</span>
                        <span className="font-medium text-gray-900">
                          ${milestone.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {dependencies.length > 0 && (
                      <div className="ml-11 mt-3 p-3 bg-amber-50 border border-amber-200 rounded">
                        <p className="text-xs font-medium text-amber-800 mb-1">
                          Dependencies:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {dependencies.map((dep, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded"
                            >
                              {dep}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gantt Chart View */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <span>📈</span>
          <span>Gantt Chart View</span>
        </h2>

        <div className="space-y-3">
          {timelineStats.sortedMilestones.map((milestone, idx) => {
            const position = getMilestonePosition(milestone.dueDate);
            const width = 8; // Fixed width for milestones

            return (
              <div key={milestone.id} className="flex items-center gap-4">
                <div className="w-40 flex-shrink-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {milestone.title}
                  </p>
                </div>
                
                <div className="flex-1 relative h-8 bg-gray-100 rounded">
                  <div
                    className="absolute h-full bg-blue-500 rounded flex items-center justify-center transition-all duration-300"
                    style={{
                      left: `${position}%`,
                      width: `${width}%`,
                      transform: 'translateX(-50%)'
                    }}
                  >
                    <span className="text-xs text-white font-medium px-2">
                      Day {Math.ceil((new Date(milestone.dueDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline Statistics */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <span>📊</span>
          <span>Timeline Statistics</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Average Days Between Milestones</p>
            <p className="text-2xl font-bold text-gray-900">
              {timelineStats.averageDaysBetweenMilestones.toFixed(0)} days
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Milestones with Dependencies</p>
            <p className="text-2xl font-bold text-gray-900">
              {milestones.filter(m => m.dependencies && m.dependencies.length > 0).length}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Total Project Weeks</p>
            <p className="text-2xl font-bold text-gray-900">
              {Math.ceil(timelineStats.totalDays / 7)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewTimeline;