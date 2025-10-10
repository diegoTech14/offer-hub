
"use client"

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useServiceRequestsApi } from '@/hooks/api-connections/use-service-requests-api';
import { VALIDATION_LIMITS } from '@/constants/magic-numbers';
import { X, Send, CheckCircle, AlertCircle, Loader2, Briefcase } from 'lucide-react';

interface ServiceRequestModalProps {
  open: boolean;
  onClose: () => void;
  serviceId: string;
}

const ServiceRequestModal: React.FC<ServiceRequestModalProps> = ({ open, onClose, serviceId }) => {
  const user = { id: '080471dc-96d0-48b9-bee6-f8450f92c7fe' };
  const { createServiceRequest, loading, error } = useServiceRequestsApi();
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    if (!message.trim()) return;
    try {
      await createServiceRequest({
        service_id: serviceId,
        client_id: user.id,
        message: message.trim(),
      });
      setSuccess(true);
      setMessage('');
    } catch {}
  };

  // Reset modal state when closed
  React.useEffect(() => {
    if (!open) {
      setMessage("");
      setSuccess(false);
    }
  }, [open]);

  if (!open) return null;

  const charCount = message.length;
  const maxChars = 500;
  const minChars = VALIDATION_LIMITS.MIN_MESSAGE_LENGTH;
  const isValid = charCount >= minChars && charCount <= maxChars;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg transform transition-all animate-in zoom-in-95 duration-200 relative z-[10000]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#15949C] to-[#117a81] rounded-lg">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#002333] dark:text-white">
                Request Service
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Send a message to the freelancer
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="flex flex-col items-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-[#002333] dark:text-white mb-2">
                Request Sent Successfully!
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
                The freelancer will review your message and get back to you soon.
              </p>
              <button
                type="button"
                className="
                  bg-gradient-to-r from-[#15949C] to-[#117a81]
                  hover:from-[#117a81] hover:to-[#0d5f65]
                  text-white font-semibold
                  px-6 py-3 rounded-lg
                  shadow-lg hover:shadow-xl
                  transition-all duration-200
                  hover:scale-105
                "
                onClick={onClose}
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#002333] dark:text-white mb-2">
                  Your Message
                </label>
                <textarea
                  className="
                    w-full border-2 border-gray-200 dark:border-gray-600
                    dark:bg-gray-700 dark:text-white
                    rounded-lg p-4
                    focus:border-[#15949C] focus:ring-2 focus:ring-[#15949C]/20
                    outline-none
                    transition-all duration-200
                    min-h-[150px]
                    resize-none
                  "
                  placeholder="Hi! I'm interested in your services. Please tell me more about..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={maxChars}
                  required
                />
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs ${isValid ? 'text-gray-500 dark:text-gray-400' : 'text-red-500'}`}>
                    {charCount < minChars ? `Minimum ${minChars} characters` : `${charCount}/${maxChars}`}
                  </span>
                  {isValid && (
                    <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Valid message
                    </span>
                  )}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error.message || 'Error sending request. Please try again.'}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  className="
                    flex-1 px-6 py-3 rounded-lg
                    border-2 border-gray-200 dark:border-gray-600
                    text-[#002333] dark:text-white font-medium
                    hover:bg-gray-50 dark:hover:bg-gray-700
                    transition-colors duration-200
                  "
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !isValid}
                  className="
                    flex-1 px-6 py-3 rounded-lg
                    bg-gradient-to-r from-[#15949C] to-[#117a81]
                    hover:from-[#117a81] hover:to-[#0d5f65]
                    text-white font-semibold
                    shadow-lg hover:shadow-xl
                    transition-all duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center justify-center gap-2
                    hover:scale-[1.02]
                  "
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Request
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null;
};

export default ServiceRequestModal;
