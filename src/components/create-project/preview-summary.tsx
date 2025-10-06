"use client";

import React, { useState } from 'react';
import { ProjectData } from './project-preview';

interface PreviewSummaryProps {
  projectData: ProjectData;
  onEdit: (field: string, value: any) => void;
  editingField: string | null;
  setEditingField: (field: string | null) => void;
  readOnly: boolean;
}

const PreviewSummary: React.FC<PreviewSummaryProps> = ({
  projectData,
  onEdit,
  editingField,
  setEditingField,
  readOnly
}) => {
  const [tempValue, setTempValue] = useState<string>('');

  const handleStartEdit = (field: string, currentValue: string) => {
    if (readOnly) return;
    setEditingField(field);
    setTempValue(currentValue);
  };

  const handleSaveEdit = (field: string) => {
    onEdit(field, tempValue);
    setEditingField(null);
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setTempValue('');
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'web-development': '💻',
      'mobile-development': '📱',
      'design': '🎨',
      'marketing': '📢',
      'writing': '✍️',
      'data-science': '📊',
      'consulting': '💼',
      'other': '🔧'
    };
    return icons[category.toLowerCase()] || '📁';
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {editingField === 'title' ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="w-full text-2xl font-bold border-2 border-blue-500 rounded px-3 py-2 focus:outline-none"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveEdit('title')}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="group">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  {projectData.title}
                  {!readOnly && (
                    <button
                      onClick={() => handleStartEdit('title', projectData.title)}
                      className="opacity-0 group-hover:opacity-100 text-blue-500 hover:text-blue-600 transition-opacity"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}
                </h2>
              </div>
            )}
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadge(projectData.status)}`}>
            {projectData.status.charAt(0).toUpperCase() + projectData.status.slice(1)}
          </span>
        </div>

        {/* Description */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          {editingField === 'description' ? (
            <div className="space-y-2">
              <textarea
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                rows={6}
                className="w-full border-2 border-blue-500 rounded px-3 py-2 focus:outline-none"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleSaveEdit('description')}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="group relative">
              <p className="text-gray-600 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                {projectData.description}
              </p>
              {!readOnly && (
                <button
                  onClick={() => handleStartEdit('description', projectData.description)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-blue-500 hover:text-blue-600 transition-opacity"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Category and Skills */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>🏷️</span>
          <span>Category & Skills</span>
        </h3>

        <div className="space-y-4">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg w-fit">
              <span className="text-2xl">{getCategoryIcon(projectData.category)}</span>
              <span className="font-medium text-blue-900">
                {projectData.category.split('-').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </span>
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Skills ({projectData.skills.length})
            </label>
            <div className="flex flex-wrap gap-2">
              {projectData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-900 rounded-lg text-sm font-medium border border-purple-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Project Overview Stats */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>📊</span>
          <span>Project Overview</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700 mb-1">Total Budget</p>
            <p className="text-2xl font-bold text-blue-900">
              {projectData.budget.currency} {projectData.budget.amount.toLocaleString()}
            </p>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
            <p className="text-sm text-green-700 mb-1">Milestones</p>
            <p className="text-2xl font-bold text-green-900">
              {projectData.timeline.milestones.length}
            </p>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-700 mb-1">Duration</p>
            <p className="text-2xl font-bold text-purple-900">
              {Math.ceil(
                (new Date(projectData.timeline.endDate).getTime() - 
                 new Date(projectData.timeline.startDate).getTime()) / 
                (1000 * 60 * 60 * 24)
              )} days
            </p>
          </div>

          <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-700 mb-1">Attachments</p>
            <p className="text-2xl font-bold text-orange-900">
              {projectData.attachments?.length || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Attachments */}
      {projectData.attachments && projectData.attachments.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>📎</span>
            <span>Attachments</span>
          </h3>

          <div className="space-y-2">
            {projectData.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{attachment.name}</p>
                    <p className="text-sm text-gray-500">
                      {(attachment.size / 1024).toFixed(2)} KB • {attachment.type}
                    </p>
                  </div>
                </div>
                <button className="text-blue-500 hover:text-blue-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewSummary;