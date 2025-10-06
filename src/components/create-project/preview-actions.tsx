import React from 'react';

interface PreviewActionsProps {
  onBack: () => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
  isValid: boolean;
  readOnly: boolean;
  mode: 'create' | 'edit' | 'view';
}

const PreviewActions: React.FC<PreviewActionsProps> = ({
  onBack,
  onSaveDraft,
  onSubmit,
  isValid,
  readOnly,
  mode
}) => {
  const getSubmitButtonText = () => {
    switch (mode) {
      case 'create':
        return 'Submit Project';
      case 'edit':
        return 'Save Changes';
      case 'view':
        return 'Close';
      default:
        return 'Submit';
    }
  };

  const getSubmitButtonIcon = () => {
    switch (mode) {
      case 'create':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'edit':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
    }
  };

  if (readOnly) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mt-6 sticky bottom-0">
        <div className="flex justify-center">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Close Preview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mt-6 sticky bottom-0">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Back Button */}
        <button
          onClick={onBack}
          className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Edit
        </button>

        {/* Right: Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {mode === 'create' && (
            <button
              onClick={onSaveDraft}
              className="w-full sm:w-auto px-6 py-3 border-2 border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save as Draft
            </button>
          )}

          <button
            onClick={onSubmit}
            disabled={!isValid}
            className={`w-full sm:w-auto px-6 py-3 rounded-lg transition-all flex items-center justify-center gap-2 font-medium ${
              isValid
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {getSubmitButtonIcon()}
            {getSubmitButtonText()}
          </button>
        </div>
      </div>

      {/* Validation Warning */}
      {!isValid && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
          <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-yellow-800">
            Please fix all validation errors before submitting the project.
          </p>
        </div>
      )}

      {/* Success Tip */}
      {isValid && mode === 'create' && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
          <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-green-800">
            All validation checks passed! Your project is ready to be submitted.
          </p>
        </div>
      )}
    </div>
  );
};

export default PreviewActions;