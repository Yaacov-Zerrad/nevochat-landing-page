'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { X, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { accountToolAPI, toolTemplateAPI } from '@/lib/api';
import { useToast } from '@/hooks/useToast';

interface ToolTemplate {
  id: number;
  name: string;
  description: string;
  tool_type: 'http' | 'python';
  variables_schema: Array<{
    name: string;
    type: string;
    item_type?: string;
    description: string;
    required: boolean;
    default?: any;
  }>;
  requirements: Array<{
    type: string;
    provider: string;
    description: string;
  }>;
  parameters_schema?: {
    type: string;
    properties: Record<string, {
      type: string;
      description: string;
    }>;
    required?: string[];
  };
}

interface CreateToolModalProps {
  template?: ToolTemplate;
  existingTool?: {
    id: number;
    name: string;
    description: string;
    variables: Record<string, any>;
    tool_type: 'http' | 'python';
    parameters_schema?: {
      type: string;
      properties: Record<string, {
        type: string;
        description: string;
      }>;
      required?: string[];
    };
  };
  accountId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateToolModal({
  template,
  existingTool,
  accountId,
  onClose,
  onSuccess,
}: CreateToolModalProps) {
  const { data: session } = useSession();
  const { showToast } = useToast();

  const isEditMode = !!existingTool;
  
  // Convert snake_case to Camel Case for display
  const snakeToCamelCase = (str: string): string => {
    return str
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };
  
  // Denormalize tool name for display (replace underscores with spaces)
  const denormalizeToolName = (name: string): string => {
    return name.replace(/_/g, ' ');
  };

  const [name, setName] = useState(
    existingTool?.name ? denormalizeToolName(existingTool.name) : (template ? template.tool_type !== 'python' ? `${denormalizeToolName(template.name)} (My Instance)` : `${template.name}` : '')
  );
  const [description, setDescription] = useState(
    existingTool?.description || template?.description || ''
  );
  const [variables, setVariables] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Normalize tool name to match OpenAI pattern: ^[a-zA-Z0-9_-]+$
  const normalizeToolName = (name: string): string => {
    return name
      .trim()
      .replace(/\s+/g, '_')  // Replace spaces with underscores
      .replace(/[^a-zA-Z0-9_-]/g, '_')  // Replace invalid chars with underscores
      .replace(/_+/g, '_')  // Collapse multiple underscores
      .replace(/^_+|_+$/g, '');  // Remove leading/trailing underscores
  };

  // Create dynamic schema for edit mode
  const getVariablesSchema = () => {
    if (isEditMode && existingTool) {
      // In edit mode, create schema from existing variables
      return Object.keys(existingTool.variables || {}).map((key) => {
        const value = existingTool.variables[key];
        let type = 'string';
        let item_type = undefined;
        
        if (Array.isArray(value)) {
          type = 'array';
          item_type = 'string';
        } else if (typeof value === 'number') {
          type = 'number';
        } else if (typeof value === 'boolean') {
          type = 'boolean';
        } else if (typeof value === 'object' && value !== null) {
          type = 'object';
        }
        
        return {
          name: key,
          type,
          item_type,
          description: '',
          required: false,
        };
      });
    } else if (template) {
      // In create mode, use template schema
      return template.variables_schema || [];
    }
    return [];
  };

  // Initialize variables with defaults
  useEffect(() => {
    if (existingTool) {
      // Edit mode: use existing tool variables
      setVariables(existingTool.variables || {});
    } else if (template) {
      // Create mode: use template defaults
      const initialVars: Record<string, any> = {};
      template.variables_schema?.forEach((varDef) => {
        if (varDef.default !== undefined) {
          initialVars[varDef.name] = varDef.default;
        } else if (varDef.type === 'array') {
          initialVars[varDef.name] = [];
        } else if (varDef.type === 'object') {
          initialVars[varDef.name] = {};
        } else {
          initialVars[varDef.name] = '';
        }
      });
      setVariables(initialVars);
    }
  }, [template, existingTool]);

  const handleVariableChange = (varName: string, value: any, varType: string) => {
    setVariables((prev) => {
      const newVars = { ...prev };
      
      // Type conversion
      if (varType === 'number' || varType === 'integer') {
        newVars[varName] = value ? parseFloat(value) : null;
      } else if (varType === 'boolean') {
        newVars[varName] = value === 'true';
      } else {
        // For arrays and other types, store as-is
        newVars[varName] = value;
      }
      
      return newVars;
    });

    // Clear error for this field
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[varName];
      return newErrors;
    });
  };

  const handleArrayItemAdd = (varName: string) => {
    setVariables((prev) => ({
      ...prev,
      [varName]: [...(prev[varName] || []), ''],
    }));
  };

  const handleArrayItemRemove = (varName: string, index: number) => {
    setVariables((prev) => ({
      ...prev,
      [varName]: (prev[varName] || []).filter((_: any, i: number) => i !== index),
    }));
  };

  const handleArrayItemChange = (varName: string, index: number, value: string) => {
    setVariables((prev) => {
      const newArray = [...(prev[varName] || [])];
      newArray[index] = value;
      return {
        ...prev,
        [varName]: newArray,
      };
    });
  };



  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Validate name
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Validate required variables (only in create mode with template)
    if (!isEditMode && template) {
      template.variables_schema?.forEach((varDef) => {
        if (varDef.required) {
          const value = variables[varDef.name];
          if (value === undefined || value === null || value === '') {
            newErrors[varDef.name] = `${varDef.name} is required`;
          }
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    // Filter out empty non-required variables
    const filteredVariables: Record<string, any> = {};
    
    if (isEditMode || !template) {
      // Edit mode: keep all variables
      Object.keys(variables).forEach((key) => {
        const value = variables[key];
        if (value !== undefined && value !== null && value !== '') {
          filteredVariables[key] = value;
        }
      });
    } else {
      // Create mode: filter based on template schema
      template.variables_schema?.forEach((varDef) => {
        const value = variables[varDef.name];
        
        // Include if required OR if has a non-empty value
        if (varDef.required || (value !== undefined && value !== null && value !== '')) {
          filteredVariables[varDef.name] = value;
        }
      });
    }

    setLoading(true);
    try {
      if (!session?.accessToken) {
        showToast('Session expired. Please log in again.', 'error');
        return;
      }

      if (isEditMode && existingTool) {
        // Update existing tool
        await accountToolAPI.update(session.accessToken, existingTool.id, {
          name: normalizeToolName(name),
          description: description.trim(),
          tool_type: existingTool.tool_type,
          variables: filteredVariables,
        });
        showToast('Tool updated successfully', 'success');
      } else if (template) {
        // Create new tool
        await accountToolAPI.create(session.accessToken, {
          account: parseInt(accountId),
          template: template.id,
          name: normalizeToolName(name),
          description: description.trim(),
          tool_type: template.tool_type,
          variables: filteredVariables,
        });

        // Increment template usage count
        await toolTemplateAPI.useTemplate(template.id);
        showToast('Tool created successfully', 'success');
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error creating tool:', error);
      
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
          showToast(backendErrors || 'Error creating tool', 'error');
        }
      } else {
        showToast(error.message || 'Error creating tool', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isEditMode ? 'Edit Tool' : 'Create Tool from Template'}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {isEditMode ? existingTool?.name : template?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Requirements Warning */}
        {!isEditMode && template?.requirements?.length > 0 && (
          <div className="mx-6 mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-900 dark:text-amber-400 mb-1">
                  Requirements
                </h4>
                <ul className="space-y-1 text-sm text-amber-800 dark:text-amber-300">
                  {template.requirements.map((req, idx) => (
                    <li key={idx}>• {req.description}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tool Name *
              </label>
              <input
                type="text"
                disabled={template?.tool_type === 'python' || existingTool?.tool_type === 'python'}
                value={
                  (template?.tool_type === 'python' || existingTool?.tool_type === 'python')
                    ? snakeToCamelCase(name)
                    : name
                }
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.name
                    ? 'border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="My awesome tool"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="What does this tool do?"
              />
            </div>

            {/* Variables */}
            {getVariablesSchema().length > 0 && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Configuration Variables
                </h3>

                {getVariablesSchema().map((varDef) => (
                  <div key={varDef.name} className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {varDef.name}
                      {varDef.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      {varDef.description}
                    </p>

                    {varDef.type === 'boolean' ? (
                      <select
                        value={variables[varDef.name]?.toString() || 'false'}
                        onChange={(e) =>
                          handleVariableChange(varDef.name, e.target.value, varDef.type)
                        }
                        className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                          errors[varDef.name]
                            ? 'border-red-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        <option value="false">False</option>
                        <option value="true">True</option>
                      </select>
                    ) : varDef.type === 'array' ? (
                      <div className="space-y-2">
                        {(variables[varDef.name] || []).map((item: string, index: number) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={item}
                              onChange={(e) =>
                                handleArrayItemChange(varDef.name, index, e.target.value)
                              }
                              className={`flex-1 px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                                errors[varDef.name]
                                  ? 'border-red-500'
                                  : 'border-gray-300 dark:border-gray-600'
                              }`}
                              placeholder={
                                varDef.item_type === 'string'
                                  ? 'Enter value...'
                                  : 'Enter number...'
                              }
                            />
                            <button
                              type="button"
                              onClick={() => handleArrayItemRemove(varDef.name, index)}
                              className="px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => handleArrayItemAdd(varDef.name)}
                          className="w-full px-3 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Item</span>
                        </button>
                      </div>
                    ) : varDef.type === 'number' || varDef.type === 'integer' ? (
                      <input
                        type="number"
                        value={variables[varDef.name] || ''}
                        onChange={(e) =>
                          handleVariableChange(varDef.name, e.target.value, varDef.type)
                        }
                        className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                          errors[varDef.name]
                            ? 'border-red-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder={varDef.default?.toString() || ''}
                      />
                    ) : (
                      <textarea
                        value={variables[varDef.name] || ''}
                        onChange={(e) =>
                          handleVariableChange(varDef.name, e.target.value, varDef.type)
                        }
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                          errors[varDef.name]
                            ? 'border-red-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder={varDef.default?.toString() || ''}
                      />
                    )}

                    {errors[varDef.name] && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors[varDef.name]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* AI Parameters Info */}
            {((isEditMode && existingTool?.parameters_schema) || (!isEditMode && template?.parameters_schema)) && 
              Object.keys((isEditMode ? existingTool?.parameters_schema?.properties : template?.parameters_schema?.properties) || {}).length > 0 && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  AI Parameters
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  These parameters will be requested by the AI from the user during conversation:
                </p>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <ul className="space-y-2">
                    {Object.entries((isEditMode ? existingTool?.parameters_schema?.properties : template?.parameters_schema?.properties) || {}).map(([paramName, paramSchema]: [string, any]) => {
                      const schema = isEditMode ? existingTool?.parameters_schema : template?.parameters_schema;
                      const isRequired = schema?.required?.includes(paramName);
                      return (
                        <li key={paramName} className="text-sm">
                          <span className="font-medium text-blue-900 dark:text-blue-300">
                            {paramName}
                            {isRequired && <span className="text-red-500 ml-1">*</span>}
                          </span>
                          <span className="text-blue-700 dark:text-blue-400 ml-2">
                            ({paramSchema.type})
                          </span>
                          {paramSchema.description && (
                            <p className="text-blue-600 dark:text-blue-400 ml-4 mt-1">
                              {paramSchema.description}
                            </p>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            )}
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
            {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Tool' : 'Create Tool')}
          </button>
        </div>
      </div>
    </div>
  );
}
