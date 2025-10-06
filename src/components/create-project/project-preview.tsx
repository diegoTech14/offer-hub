import React, { useState } from 'react';
import { useProjectPreview } from '@/hooks/use-project-preview';
import PreviewSummary from './preview-summary';
import PreviewBudget from './preview-budget';
import PreviewTimeline from './preview-timeline';
import PreviewActions from './preview-actions';

export interface ProjectData {
  title: string;
  description: string;
  category: string;
  skills: string[];
  budget: {
    amount: number;
    currency: string;
    taxRate: number;
    platformFee: number;
  };
  timeline: {
    startDate: string;
    endDate: string;
    milestones: Array<{
      id: string;
      title: string;
      description: string;
      dueDate: string;
      amount: number;
      dependencies?: string[];
    }>;
  };
  attachments?: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
  }>;
  status: 'draft' | 'active' | 'completed';
}

interface ProjectPreviewProps {
  projectData: ProjectData;
  onEdit: (field: string, value: any) => void;
  onBack: () => void;
  onSubmit: () => void;
  onSaveDraft: () => void;
  readOnly?: boolean;
  mode?: 'create' | 'edit' | 'view';
}

const ProjectPreview: React.FC<ProjectPreviewProps> = ({
  projectData,
  onEdit,
  onBack,
  onSubmit,
  onSaveDraft,
  readOnly = false,
  mode = 'create'
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'budget' | 'timeline'>('overview');
  const [editingField, setEditingField] = useState<string | null>(null);
  
  const {
    validation,
    isValid,
    calculateTotalBudget,
    exportPreview,
    validateProject
  } = useProjectPreview(projectData);

  const handleFieldEdit = (field: string, value: any) => {
    onEdit(field, value);
    setEditingField(null);
  };

  const handleExport = async (format: 'pdf' | 'html') => {
    try {
      await exportPreview(projectData, format);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleSubmit = () => {
    const validationResult = validateProject();
    if (validationResult.isValid) {
      onSubmit();
    } else {
      alert(`Please fix the following errors:\n${validationResult.errors.join('\n')}`);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'budget', label: 'Budget', icon: '💰' },
    { id: 'timeline', label: 'Timeline', icon: '📅' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Project Preview</h1>
              <p className="mt-2 text-sm text-gray-600">
                Review and verify all project details before {mode === 'create' ? 'submission' : 'saving changes'}
              </p>
            </div>
            {!readOnly && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleExport('html')}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Export HTML
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Export PDF
                </button>
              </div>
            )}
          </div>

          {/* Validation Status */}
          {!isValid && !readOnly && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <span className="text-yellow-600 mr-2">⚠️</span>
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">Action Required</h3>
                  <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                    {validation.errors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <PreviewSummary
              projectData={projectData}
              onEdit={handleFieldEdit}
              editingField={editingField}
              setEditingField={setEditingField}
              readOnly={readOnly}
            />
          )}

          {activeTab === 'budget' && (
            <PreviewBudget
              budget={projectData.budget}
              milestones={projectData.timeline.milestones}
              onEdit={handleFieldEdit}
              readOnly={readOnly}
            />
          )}

          {activeTab === 'timeline' && (
            <PreviewTimeline
              timeline={projectData.timeline}
              onEdit={handleFieldEdit}
              readOnly={readOnly}
            />
          )}
        </div>

        {/* Actions */}
        <PreviewActions
          onBack={onBack}
          onSaveDraft={onSaveDraft}
          onSubmit={handleSubmit}
          isValid={isValid}
          readOnly={readOnly}
          mode={mode}
        />
      </div>
    </div>
  );
};

export default ProjectPreview;