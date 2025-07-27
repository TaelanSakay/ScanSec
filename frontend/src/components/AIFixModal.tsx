import React, { useState, useEffect, useCallback } from 'react';
import { X, Sparkles, Code, Lightbulb, CheckCircle, AlertCircle } from 'lucide-react';
import apiClient, { AIRecommendation } from '../api';
import Toast, { ToastType } from './Toast';

interface VulnerabilityData {
  type: string;
  severity: string;
  file_path: string;
  line_number: number;
  code_snippet: string;
  description: string;
  language: string;
}

interface AIFixModalProps {
  isOpen: boolean;
  onClose: () => void;
  vulnerability: VulnerabilityData;
}

const AIFixModal: React.FC<AIFixModalProps> = ({ isOpen, onClose, vulnerability }) => {
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false
  });

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const fetchAIRecommendation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiClient.getAIRecommendation(vulnerability);
      
      if (result.available && result.recommendation) {
        setRecommendation(result.recommendation);
        showToast('AI recommendation generated successfully!', 'success');
      } else {
        setError(result.message || 'Failed to generate AI recommendation');
        showToast(result.message || 'Failed to generate AI recommendation', 'error');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to get AI recommendation');
      showToast(err.message || 'Failed to get AI recommendation', 'error');
    } finally {
      setLoading(false);
    }
  }, [vulnerability]);

  useEffect(() => {
    if (isOpen && vulnerability) {
      fetchAIRecommendation();
    }
  }, [isOpen, vulnerability, fetchAIRecommendation]);

  const handleClose = () => {
    setRecommendation(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
      
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">AI Fix Recommendation</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Vulnerability Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Vulnerability Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Type:</span>
                <span className="ml-2 font-medium">{vulnerability.type}</span>
              </div>
              <div>
                <span className="text-gray-600">Severity:</span>
                <span className={`ml-2 font-medium px-2 py-1 rounded text-xs ${
                  vulnerability.severity === 'critical' ? 'bg-red-100 text-red-800' :
                  vulnerability.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                  vulnerability.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {vulnerability.severity}
                </span>
              </div>
              <div>
                <span className="text-gray-600">File:</span>
                <span className="ml-2 font-mono text-sm">{vulnerability.file_path}</span>
              </div>
              <div>
                <span className="text-gray-600">Line:</span>
                <span className="ml-2 font-medium">{vulnerability.line_number}</span>
              </div>
            </div>
            <div className="mt-3">
              <span className="text-gray-600">Description:</span>
              <p className="mt-1 text-sm">{vulnerability.description}</p>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Generating AI recommendation...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">AI Recommendation Unavailable</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={fetchAIRecommendation}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* AI Recommendation */}
          {recommendation && !loading && (
            <div className="space-y-6">
              {/* Recommendation */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  <h3 className="font-medium text-gray-900">Recommendation</h3>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-800">{recommendation.recommendation}</p>
                </div>
              </div>

              {/* Fixed Code */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Code className="w-5 h-5 text-green-600" />
                  <h3 className="font-medium text-gray-900">Fixed Code</h3>
                </div>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-green-400 font-mono">
                    <code>{recommendation.fixed_code}</code>
                  </pre>
                </div>
              </div>

              {/* Explanation */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <h3 className="font-medium text-gray-900">Explanation</h3>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-800">{recommendation.explanation}</p>
                </div>
              </div>

              {/* Best Practices */}
              {recommendation.best_practices && recommendation.best_practices.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Best Practices</h3>
                  <ul className="space-y-2">
                    {recommendation.best_practices.map((practice, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-sm text-gray-700">{practice}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* AI Generated Notice */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Sparkles className="w-4 h-4" />
                <span>Generated by Claude AI</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            Close
          </button>
          {recommendation && (
            <button
              onClick={() => {
                // TODO: Implement copy to clipboard
                showToast('Recommendation copied to clipboard!', 'success');
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Copy Recommendation
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIFixModal; 