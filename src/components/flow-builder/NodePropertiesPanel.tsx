import React, { useState, useEffect, useCallback } from 'react';
import { Node } from 'reactflow';
import { twilioTemplatesAPI } from '@/lib/api';

interface NodePropertiesPanelProps {
  node: Node;
  onUpdateNode: (nodeId: string, newData: any) => void;
  onClose: () => void;
  accountId?: number;
}

export default function NodePropertiesPanel({ node, onUpdateNode, onClose, accountId }: NodePropertiesPanelProps) {
  const [label, setLabel] = useState(node.data.label || '');
  const [description, setDescription] = useState(node.data.description || '');
  const [config, setConfig] = useState(node.data.config || {});

  useEffect(() => {
    setLabel(node.data.label || '');
    setDescription(node.data.description || '');
    setConfig(node.data.config || {});
  }, [node]);

  const handleSave = () => {
    onUpdateNode(node.id, {
      label,
      description,
      config,
    });
    // Close the panel after saving
    onClose();
  };

  const updateConfig = (key: string, value: any) => {
    setConfig((prevConfig: any) => {
      const newConfig = { ...prevConfig, [key]: value };
      return newConfig;
    });
  };

  const renderConfigFields = () => {
    switch (node.type) {
      case 'message':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Message
              </label>
              <textarea
                value={config.message || ''}
                onChange={(e) => updateConfig('message', e.target.value)}
                rows={4}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-neon-green focus:outline-none resize-none"
                placeholder="Enter your message..."
              />
            </div>
          </div>
        );

      case 'ai':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                AI Prompt
              </label>
              <textarea
                value={config.prompt || ''}
                onChange={(e) => updateConfig('prompt', e.target.value)}
                rows={4}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-neon-green focus:outline-none resize-none"
                placeholder="Enter AI prompt..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Model
              </label>
              <select
                value={config.model || 'gpt-3.5-turbo'}
                onChange={(e) => updateConfig('model', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-neon-green focus:outline-none"
              >
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="gpt-4">GPT-4</option>
                <option value="claude-3">Claude 3</option>
              </select>
            </div>
          </div>
        );

      case 'input':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Prompt Message
              </label>
              <textarea
                value={config.prompt || ''}
                onChange={(e) => updateConfig('prompt', e.target.value)}
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-neon-green focus:outline-none resize-none"
                placeholder="What do you want to ask the user?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Input Type
              </label>
              <select
                value={config.input_type || 'text'}
                onChange={(e) => updateConfig('input_type', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-neon-green focus:outline-none"
              >
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="number">Number</option>
                <option value="phone">Phone</option>
                <option value="date">Date</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Variable Name
              </label>
              <input
                type="text"
                value={config.input_key || ''}
                onChange={(e) => updateConfig('input_key', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-neon-green focus:outline-none"
                placeholder="Variable name to store input"
              />
            </div>
          </div>
        );

      case 'condition':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Condition Expression
              </label>
              <textarea
                value={config.condition || ''}
                onChange={(e) => updateConfig('condition', e.target.value)}
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-neon-green focus:outline-none resize-none"
                placeholder="e.g. user_input == 'yes'"
              />
            </div>
          </div>
        );

      case 'function':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Function Name
              </label>
              <input
                type="text"
                value={config.function_name || ''}
                onChange={(e) => updateConfig('function_name', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-neon-green focus:outline-none"
                placeholder="Function to execute"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Parameters (JSON)
              </label>
              <textarea
                value={JSON.stringify(config.parameters || {}, null, 2)}
                onChange={(e) => {
                  try {
                    const params = JSON.parse(e.target.value);
                    updateConfig('parameters', params);
                  } catch (err) {
                    // Invalid JSON, ignore
                  }
                }}
                rows={4}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-neon-green focus:outline-none resize-none font-mono text-xs"
                placeholder='{"param1": "value1"}'
              />
            </div>
          </div>
        );

      case 'webhook':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                URL
              </label>
              <input
                type="url"
                value={config.url || ''}
                onChange={(e) => updateConfig('url', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-neon-green focus:outline-none"
                placeholder="https://api.example.com/webhook"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Method
              </label>
              <select
                value={config.method || 'POST'}
                onChange={(e) => updateConfig('method', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-neon-green focus:outline-none"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Headers (JSON)
              </label>
              <textarea
                value={JSON.stringify(config.headers || {}, null, 2)}
                onChange={(e) => {
                  try {
                    const headers = JSON.parse(e.target.value);
                    updateConfig('headers', headers);
                  } catch (err) {
                    // Invalid JSON, ignore
                  }
                }}
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-neon-green focus:outline-none resize-none font-mono text-xs"
                placeholder='{"Content-Type": "application/json"}'
              />
            </div>
          </div>
        );

      case 'delay':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Delay (seconds)
              </label>
              <input
                type="number"
                value={config.delay_seconds || 1}
                onChange={(e) => updateConfig('delay_seconds', parseInt(e.target.value))}
                min="1"
                max="3600"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-neon-green focus:outline-none"
              />
            </div>
          </div>
        );

      case 'template':
        return <TemplateNodeConfig config={config} updateConfig={updateConfig} accountId={accountId} />;

      case 'end':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                End Message
              </label>
              <textarea
                value={config.message || ''}
                onChange={(e) => updateConfig('message', e.target.value)}
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-neon-green focus:outline-none resize-none"
                placeholder="Flow completed message..."
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-gray-400 text-center py-4">
            No configuration available for this node type.
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-600">
        <h3 className="text-white font-semibold">Node Properties</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-6">
          {/* Basic Properties */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Node Label
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-neon-green focus:outline-none"
                placeholder="Node label"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-neon-green focus:outline-none resize-none"
                placeholder="Optional description"
              />
            </div>
          </div>

          {/* Node Type Specific Configuration */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-3">
              {node.type ? node.type.charAt(0).toUpperCase() + node.type.slice(1) : 'Node'} Configuration
            </h4>
            {renderConfigFields()}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-600">
        <button
          onClick={handleSave}
          className="w-full bg-neon-green/20 hover:bg-neon-green/30 text-neon-green px-4 py-2 rounded-lg transition-colors border border-neon-green/20 hover:border-neon-green/40"
        >
          Apply Changes
        </button>
      </div>
    </div>
  );
}

// Template Node Configuration Component
function TemplateNodeConfig({ config, updateConfig, accountId }: { 
  config: any; 
  updateConfig: (key: string, value: any) => void;
  accountId?: number;
}) {
  const [messagingServices, setMessagingServices] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [renderKey, setRenderKey] = useState(0); // Force re-render key

  // Get account ID from URL parameters
  const getAccountId = useCallback(() => {
    if (accountId) return accountId;
    // Get from URL path parameters
    const pathParts = window.location.pathname.split('/');
    const accountIndex = pathParts.indexOf('accounts');
    return accountIndex !== -1 ? parseInt(pathParts[accountIndex + 1]) : null;
  }, [accountId]);

  // Load messaging services on mount
  useEffect(() => {
    const currentAccountId = getAccountId();
    if (currentAccountId) {
      loadMessagingServices(currentAccountId);
    }
  }, [accountId, getAccountId]);

  // Initialize variables from config
  useEffect(() => {
    if (config.variables) {
      setVariables(config.variables);
    }
  }, [config.variables]);

  // Load messaging services function
  const loadMessagingServices = async (accountId: number) => {
    try {
      setLoadingServices(true);
      const response = await twilioTemplatesAPI.getMessagingServices(accountId);
      setMessagingServices(response.messaging_services || []);
    } catch (error) {
      console.error('Failed to load messaging services:', error);
      setMessagingServices([]);
    } finally {
      setLoadingServices(false);
    }
  };

  // Load templates function
  const loadTemplates = async (messagingServiceSid: string) => {
    try {
      setLoadingTemplates(true);
      const response = await twilioTemplatesAPI.getTemplates(messagingServiceSid);
      const templatesList = response.templates || [];
      setTemplates(templatesList);
      // Force re-render
      setRenderKey(prev => prev + 1);
    } catch (error) {
      console.error('Failed to load templates:', error);
      setTemplates([]);
    } finally {
      setLoadingTemplates(false);
    }
  };

  // Handle messaging service change
  const handleServiceChange = (messagingServiceSid: string) => {
    // Update config immediately
    updateConfig('messaging_service_sid', messagingServiceSid);
    updateConfig('template_name', '');
    updateConfig('template_sid', '');
    updateConfig('variables', {});
    
    // Reset local state
    setSelectedTemplate(null);
    setVariables({});
    setTemplates([]);
    
    // Load templates for selected service
    if (messagingServiceSid) {
      loadTemplates(messagingServiceSid);
    }
  };

  // Handle template change
  const handleTemplateChange = (templateName: string) => {
    const template = templates.find(t => t.friendly_name === templateName);
    
    setSelectedTemplate(template);
    
    // Extract variables from template body
    const newVariables: Record<string, string> = {};
    if (template?.body) {
      const variableMatches = template.body.match(/\{\{(\w+)\}\}/g);
      if (variableMatches) {
        variableMatches.forEach((match: string) => {
          const varName = match.replace(/[{}]/g, '');
          newVariables[varName] = variables[varName] || '';
        });
      }
    }
    
    setVariables(newVariables);
    
    // Update all config properties at once using updateConfig with all new data
    updateConfig('template_name', templateName);
    updateConfig('template_sid', template?.sid || '');
    updateConfig('variables', newVariables);
  };

  // Handle variable change
  const handleVariableChange = (varName: string, value: string) => {
    const newVariables = { ...variables, [varName]: value };
    setVariables(newVariables);
    updateConfig('variables', newVariables);
  };

  return (
    <div className="space-y-4" key={renderKey}>
      {/* Messaging Service Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Messaging Service
        </label>
        {loadingServices ? (
          <div className="text-gray-400 text-sm">Loading messaging services...</div>
        ) : messagingServices.length > 0 ? (
          <select
            value={config.messaging_service_sid || ''}
            onChange={(e) => handleServiceChange(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-neon-green focus:outline-none"
          >
            <option value="">Select a messaging service ({messagingServices.length} available)</option>
            {messagingServices.map((service) => (
              <option key={service.messaging_service_sid} value={service.messaging_service_sid}>
                Service ID: {service.messaging_service_sid.slice(-8)}... {service.phone_number ? `(${service.phone_number})` : '(No phone)'}
              </option>
            ))}
          </select>
        ) : (
          <div className="text-gray-400 text-sm">No messaging services found</div>
        )}
      </div>

      {/* Template Selection */}
      {templates.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Template ({templates.length} available)
          </label>
          {loadingTemplates ? (
            <div className="text-gray-400 text-sm">Loading templates...</div>
          ) : (
            <select
              value={config.template_name || ''}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-neon-green focus:outline-none"
            >
              <option value="">Select a template</option>
              {templates.map((template, index) => (
                <option key={`${template.sid}-${index}`} value={template.friendly_name}>
                  {template.friendly_name} ({template.status})
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Show template selector even when no service selected if templates exist */}
      {!config.messaging_service_sid && templates.length === 0 && messagingServices.length > 0 && (
        <div className="text-sm text-gray-400 bg-gray-800 p-3 rounded">
          Please select a messaging service first to load templates.
        </div>
      )}

      {/* Template Preview */}
      {selectedTemplate && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Template Preview
          </label>
          <div className="bg-gray-700 border border-gray-600 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-2">
              Category: {selectedTemplate.category} | Language: {selectedTemplate.language}
            </div>
            <div className="text-sm text-white whitespace-pre-wrap">
              {selectedTemplate.body}
            </div>
          </div>
        </div>
      )}

      {/* Template Variables */}
      {Object.keys(variables).length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Template Variables
          </label>
          <div className="space-y-3">
            {Object.entries(variables).map(([varName, value]) => (
              <div key={varName}>
                <label className="block text-xs text-gray-400 mb-1">
                  {varName}
                </label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleVariableChange(varName, e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-neon-green focus:outline-none text-sm"
                  placeholder={`Value for ${varName}`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Options */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Send Options
        </label>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.track_delivery || false}
              onChange={(e) => updateConfig('track_delivery', e.target.checked)}
              className="rounded bg-gray-700 border-gray-600 text-neon-green focus:ring-neon-green"
            />
            <span className="text-sm text-gray-300">Track delivery status</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.allow_replies || true}
              onChange={(e) => updateConfig('allow_replies', e.target.checked)}
              className="rounded bg-gray-700 border-gray-600 text-neon-green focus:ring-neon-green"
            />
            <span className="text-sm text-gray-300">Allow replies</span>
          </label>
        </div>
      </div>
    </div>
  );
}
