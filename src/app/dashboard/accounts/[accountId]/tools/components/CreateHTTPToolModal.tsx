'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { X, Plus, Trash2 } from 'lucide-react';
import { accountToolAPI } from '@/lib/api';
import { useToast } from '@/hooks/useToast';

interface CreateHTTPToolModalProps {
  accountId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateHTTPToolModal({
  accountId,
  onClose,
  onSuccess,
}: CreateHTTPToolModalProps) {
  const { data: session } = useSession();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState<Array<{ key: string; value: string }>>([
    { key: 'Content-Type', value: 'application/json' },
  ]);
  const [body, setBody] = useState('');
  const [parameters, setParameters] = useState<Array<{
    name: string;
    type: string;
    description: string;
    required: boolean;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Denormalize tool name for display (replace underscores with spaces)
  const denormalizeToolName = (name: string): string => {
    return name.replace(/_/g, ' ');
  };

  // Normalize tool name to match OpenAI pattern: ^[a-zA-Z0-9_-]+$
  const normalizeToolName = (name: string): string => {
    return name
      .trim()
      .replace(/\s+/g, '_')  // Replace spaces with underscores
      .replace(/[^a-zA-Z0-9_-]/g, '_')  // Replace invalid chars with underscores
      .replace(/_+/g, '_')  // Collapse multiple underscores
      .replace(/^_+|_+$/g, '');  // Remove leading/trailing underscores
  };

  const handleAddHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const handleRemoveHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const handleUpdateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const handleAddParameter = () => {
    setParameters([
      ...parameters,
      { name: '', type: 'string', description: '', required: true },
    ]);
  };

  const handleRemoveParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  const handleUpdateParameter = (
    index: number,
    field: keyof typeof parameters[0],
    value: any
  ) => {
    const newParams = [...parameters];
    (newParams[index] as any)[field] = value;
    setParameters(newParams);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!url.trim()) {
      newErrors.url = 'URL is required';
    } else {
      try {
        new URL(url);
      } catch {
        newErrors.url = 'Invalid URL format';
      }
    }

    if ((method === 'POST' || method === 'PUT' || method === 'PATCH') && body) {
      try {
        JSON.parse(body);
      } catch {
        newErrors.body = 'Invalid JSON format';
      }
    }

    parameters.forEach((param, idx) => {
      if (!param.name.trim()) {
        newErrors[`param_${idx}_name`] = 'Parameter name is required';
      }
      if (!param.description.trim()) {
        newErrors[`param_${idx}_description`] = 'Parameter description is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      // Build headers object
      const headersObj: Record<string, string> = {};
      headers.forEach((h) => {
        if (h.key && h.value) {
          headersObj[h.key] = h.value;
        }
      });

      // Build parameters schema
      const parametersSchema = {
        type: 'object',
        properties: parameters.reduce((acc, param) => {
          acc[param.name] = {
            type: param.type,
            description: param.description,
          };
          return acc;
        }, {} as Record<string, any>),
        required: parameters.filter((p) => p.required).map((p) => p.name),
      };

      // Build config
      const config = {
        url,
        method,
        headers: headersObj,
        ...(body && (method === 'POST' || method === 'PUT' || method === 'PATCH')
          ? { body: JSON.parse(body) }
          : {}),
      };

      if (!accountId) {
        throw new Error('Account ID is required');
      }

      await accountToolAPI.create(session!.accessToken, {
        account: parseInt(accountId),
        name: normalizeToolName(name),
        description: description.trim(),
        tool_type: 'http',
        config,
        parameters_schema: parametersSchema,
      });

      showToast('HTTP Tool created successfully', 'success');
      onSuccess();
    } catch (error: any) {
      console.error('Error creating HTTP tool:', error);
      
      // Display validation errors from backend
      if (error.response?.data) {
        const backendErrors = error.response.data;
        if (typeof backendErrors === 'object') {
          // Map backend errors to form fields
          const newErrors: Record<string, string> = {};
          Object.entries(backendErrors).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              newErrors[field] = messages.join(', ');
            } else if (typeof messages === 'string') {
              newErrors[field] = messages;
            }
          });
          setErrors(newErrors);
          showToast('Please fix the validation errors', 'error');
        } else {
          showToast(backendErrors || 'Error creating HTTP tool', 'error');
        }
      } else {
        showToast(error.message || 'Error creating HTTP tool', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Create Custom HTTP Tool
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Configure a custom HTTP API endpoint as a tool
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Basic Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tool Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="check_inventory"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Check inventory levels in the warehouse"
                />
              </div>
            </div>

            {/* Context Variables Info */}
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <h4 className="font-medium text-purple-900 dark:text-purple-300 mb-2 flex items-center gap-2">
                <span>💡</span>
                Available Context Variables
              </h4>
              <p className="text-sm text-purple-800 dark:text-purple-300 mb-2">
                These variables are automatically injected by the system and can be used in your URL, headers, or body:
              </p>
              <ul className="space-y-1 text-sm text-purple-700 dark:text-purple-400">
                <li className="font-mono">
                  <code className="bg-purple-100 dark:bg-purple-900/40 px-2 py-0.5 rounded">
                    {'{'}conversation_id{'}'}
                  </code> - Current conversation ID
                </li>
                <li className="font-mono">
                  <code className="bg-purple-100 dark:bg-purple-900/40 px-2 py-0.5 rounded">
                    {'{'}user_id{'}'}
                  </code> - User identifier
                </li>
                <li className="font-mono">
                  <code className="bg-purple-100 dark:bg-purple-900/40 px-2 py-0.5 rounded">
                    {'{'}account_id{'}'}
                  </code> - Account identifier
                </li>
              </ul>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                Example: <code className="bg-purple-100 dark:bg-purple-900/40 px-1 py-0.5 rounded">
                  https://api.example.com/conversations/{'{'}conversation_id{'}'}/handover
                </code>
              </p>
            </div>

            {/* HTTP Configuration */}
            <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                HTTP Configuration
              </h3>

              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Method *
                  </label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="PATCH">PATCH</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>

                <div className="col-span-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    URL *
                  </label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm ${
                      errors.url ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="https://api.example.com/inventory/${product_id}"
                  />
                  {errors.url && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.url}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Use ${'{variable_name}'} for dynamic values
                  </p>
                </div>
              </div>

              {/* Headers */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Headers
                  </label>
                  <button
                    type="button"
                    onClick={handleAddHeader}
                    className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <Plus className="w-4 h-4" />
                    Add Header
                  </button>
                </div>

                {headers.map((header, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={header.key}
                      onChange={(e) => handleUpdateHeader(idx, 'key', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Header name"
                    />
                    <input
                      type="text"
                      value={header.value}
                      onChange={(e) => handleUpdateHeader(idx, 'value', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Header value (use ${variable})"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveHeader(idx)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Body (POST/PUT/PATCH only) */}
              {(method === 'POST' || method === 'PUT' || method === 'PATCH') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Request Body (JSON)
                  </label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={6}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm ${
                      errors.body ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder={`{\n  "product_id": "\${product_id}",\n  "quantity": "\${quantity}"\n}`}
                  />
                  {errors.body && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.body}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Optional. Use ${'{variable_name}'} for dynamic values
                  </p>
                </div>
              )}
            </div>

            {/* Parameters */}
            <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Parameters (AI will provide these)
                </h3>
                <button
                  type="button"
                  onClick={handleAddParameter}
                  className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <Plus className="w-4 h-4" />
                  Add Parameter
                </button>
              </div>

              {parameters.map((param, idx) => (
                <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Parameter Name *
                      </label>
                      <input
                        type="text"
                        value={param.name}
                        onChange={(e) =>
                          handleUpdateParameter(idx, 'name', e.target.value)
                        }
                        className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                          errors[`param_${idx}_name`]
                            ? 'border-red-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder="product_id"
                      />
                      {errors[`param_${idx}_name`] && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors[`param_${idx}_name`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Type
                      </label>
                      <select
                        value={param.type}
                        onChange={(e) =>
                          handleUpdateParameter(idx, 'type', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="integer">Integer</option>
                        <option value="boolean">Boolean</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description *
                    </label>
                    <input
                      type="text"
                      value={param.description}
                      onChange={(e) =>
                        handleUpdateParameter(idx, 'description', e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        errors[`param_${idx}_description`]
                          ? 'border-red-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="The ID of the product to check"
                    />
                    {errors[`param_${idx}_description`] && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors[`param_${idx}_description`]}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={param.required}
                        onChange={(e) =>
                          handleUpdateParameter(idx, 'required', e.target.checked)
                        }
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                      Required parameter
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveParameter(idx)}
                      className="text-sm text-red-600 dark:text-red-400 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              {parameters.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No parameters defined. The tool will work without parameters.
                </p>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
          >
            {loading ? 'Creating...' : 'Create HTTP Tool'}
          </button>
        </div>
      </div>
    </div>
  );
}
