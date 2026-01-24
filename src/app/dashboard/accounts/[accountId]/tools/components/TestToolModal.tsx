'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { X, Play, CheckCircle, XCircle } from 'lucide-react';
import { accountToolAPI } from '@/lib/api';
import { useToast } from '@/hooks/useToast';

interface TestToolModalProps {
  tool: {
    id: number;
    name: string;
    description: string;
    parameters_schema: any;
  };
  accountId: string;
  onClose: () => void;
}

export default function TestToolModal({ tool, accountId, onClose }: TestToolModalProps) {
  const { data: session } = useSession();
  const { showToast } = useToast();

  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    data?: any;
    error?: string;
  } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize parameters with empty values
  useEffect(() => {
    if (tool.parameters_schema?.properties) {
      const initialParams: Record<string, any> = {};
      Object.keys(tool.parameters_schema.properties).forEach((key) => {
        const prop = tool.parameters_schema.properties[key];
        if (prop.type === 'boolean') {
          initialParams[key] = false;
        } else if (prop.type === 'number' || prop.type === 'integer') {
          initialParams[key] = 0;
        } else if (prop.type === 'array') {
          initialParams[key] = '[]';
        } else if (prop.type === 'object') {
          initialParams[key] = '{}';
        } else {
          initialParams[key] = '';
        }
      });
      setParameters(initialParams);
    }
  }, [tool.parameters_schema]);

  const handleParameterChange = (name: string, value: any, type: string) => {
    let processedValue = value;

    // Convert based on type
    if (type === 'number' || type === 'integer') {
      processedValue = value === '' ? 0 : parseFloat(value);
    } else if (type === 'boolean') {
      processedValue = value === 'true';
    }

    setParameters({ ...parameters, [name]: processedValue });

    // Clear error for this field
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const required = tool.parameters_schema?.required || [];
    const properties = tool.parameters_schema?.properties || {};

    required.forEach((paramName: string) => {
      const value = parameters[paramName];
      const prop = properties[paramName];

      if (
        value === undefined ||
        value === null ||
        value === '' ||
        (prop.type === 'array' && value === '[]') ||
        (prop.type === 'object' && value === '{}')
      ) {
        newErrors[paramName] = 'This parameter is required';
      }
    });

    // Validate JSON for arrays and objects
    Object.keys(parameters).forEach((paramName) => {
      const prop = properties[paramName];
      const value = parameters[paramName];

      if (prop.type === 'array' || prop.type === 'object') {
        if (typeof value === 'string' && value) {
          try {
            JSON.parse(value);
          } catch {
            newErrors[paramName] = 'Invalid JSON format';
          }
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTest = async () => {
    if (!validate()) return;
    if (!session?.accessToken) {
      showToast('Authentication required', 'error');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Process parameters before sending
      const processedParams: Record<string, any> = {};
      const properties = tool.parameters_schema?.properties || {};

      Object.keys(parameters).forEach((key) => {
        const prop = properties[key];
        let value = parameters[key];

        // Parse JSON strings for arrays and objects
        if (prop.type === 'array' || prop.type === 'object') {
          if (typeof value === 'string') {
            try {
              value = JSON.parse(value);
            } catch {
              // Keep as string if parsing fails (validation should catch this)
            }
          }
        }

        processedParams[key] = value;
      });

      const response = await accountToolAPI.test(session.accessToken, tool.id, processedParams);

      setResult({
        success: true,
        data: response,
      });
      showToast('Tool tested successfully', 'success');
    } catch (error: any) {
      console.error('Error testing tool:', error);
      
      // Extract error message from backend response
      let errorMessage = 'Tool execution failed';
      
      if (error.response?.data) {
        if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (typeof error.response.data === 'object') {
          // Try to extract readable error from object
          errorMessage = JSON.stringify(error.response.data, null, 2);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setResult({
        success: false,
        error: errorMessage,
      });
      showToast('Error testing tool', 'error');
    } finally {
      setLoading(false);
    }
  };

  const properties = tool.parameters_schema?.properties || {};
  const hasParameters = Object.keys(properties).length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Test Tool: {tool.name}
            </h2>
            {tool.description && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {tool.description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {hasParameters ? (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Parameters
              </h3>

              {Object.entries(properties).map(([paramName, paramSchema]: [string, any]) => {
                const isRequired = tool.parameters_schema?.required?.includes(paramName);
                const value = parameters[paramName];

                return (
                  <div key={paramName}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {paramName}
                      {isRequired && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {paramSchema.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        {paramSchema.description}
                      </p>
                    )}

                    {/* Boolean */}
                    {paramSchema.type === 'boolean' && (
                      <select
                        value={value ? 'true' : 'false'}
                        onChange={(e) =>
                          handleParameterChange(paramName, e.target.value, 'boolean')
                        }
                        className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                          errors[paramName]
                            ? 'border-red-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                    )}

                    {/* Number/Integer */}
                    {(paramSchema.type === 'number' || paramSchema.type === 'integer') && (
                      <input
                        type="number"
                        value={value}
                        onChange={(e) =>
                          handleParameterChange(paramName, e.target.value, paramSchema.type)
                        }
                        step={paramSchema.type === 'integer' ? '1' : 'any'}
                        className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                          errors[paramName]
                            ? 'border-red-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      />
                    )}

                    {/* Array */}
                    {paramSchema.type === 'array' && (
                      <textarea
                        value={value}
                        onChange={(e) =>
                          handleParameterChange(paramName, e.target.value, 'array')
                        }
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm ${
                          errors[paramName]
                            ? 'border-red-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder='["value1", "value2"]'
                      />
                    )}

                    {/* Object */}
                    {paramSchema.type === 'object' && (
                      <textarea
                        value={value}
                        onChange={(e) =>
                          handleParameterChange(paramName, e.target.value, 'object')
                        }
                        rows={4}
                        className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm ${
                          errors[paramName]
                            ? 'border-red-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder='{"key": "value"}'
                      />
                    )}

                    {/* String (default) */}
                    {paramSchema.type === 'string' && (
                      <input
                        type="text"
                        value={value}
                        onChange={(e) =>
                          handleParameterChange(paramName, e.target.value, 'string')
                        }
                        className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                          errors[paramName]
                            ? 'border-red-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      />
                    )}

                    {errors[paramName] && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors[paramName]}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
              This tool has no parameters. Click &quot;Run Test&quot; to execute it.
            </p>
          )}

          {/* Result */}
          {result && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Test Result
              </h3>

              {result.success ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">
                        Success
                      </p>
                      <pre className="text-xs text-green-700 dark:text-green-400 overflow-x-auto bg-green-100 dark:bg-green-900/40 p-3 rounded">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">
                        Error
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-400">
                        {result.error}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleTest}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
          >
            <Play className="w-4 h-4" />
            {loading ? 'Testing...' : 'Run Test'}
          </button>
        </div>
      </div>
    </div>
  );
}
