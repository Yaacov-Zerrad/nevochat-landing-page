import React, { useState, useEffect, useCallback } from 'react';
import { Node } from 'reactflow';
import { twilioTemplatesAPI, flowAPI } from '@/lib/api';
import AdvancedConditionsBuilder, { ConditionsConfig } from './AdvancedConditionsBuilder';
import ConditionsDocumentation from './ConditionsDocumentation';
import DelayDocumentation from './DelayDocumentation';
import DelayPresets from './DelayPresets';

interface Branch {
  name: string;
  conditions_met: boolean;
  next_node: string;
  message?: string;
}

interface NodePropertiesPanelProps {
  node: Node;
  onUpdateNode: (nodeId: string, newData: any) => void;
  onClose: () => void;
  accountId?: number;
  availableNodes?: { id: string; label: string; type: string }[];
  flowId?: number;
}

export default function NodePropertiesPanel({ node, onUpdateNode, onClose, accountId, availableNodes = [], flowId }: NodePropertiesPanelProps) {
  const [label, setLabel] = useState(node.data.label || '');
  const [description, setDescription] = useState(node.data.description || '');
  const [config, setConfig] = useState(node.data.config || {});
  const [activeTab, setActiveTab] = useState<'config' | 'docs'>('config');
  const [advancedConditions, setAdvancedConditions] = useState<ConditionsConfig>({
    operator: 'AND',
    rules: []
  });
  const [branches, setBranches] = useState<Branch[]>(config.branches || [
    { name: 'success', conditions_met: true, next_node: '' },
    { name: 'failure', conditions_met: false, next_node: '' }
  ]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setLabel(node.data.label || '');
    setDescription(node.data.description || '');
    setConfig(node.data.config || {});
    setSaveError(null);
    
    // Reset active tab when switching nodes
    setActiveTab('config');
    
    // Load advanced conditions and branches for condition nodes
    if (node.type === 'condition') {
      if (node.data.config?.conditions) {
        setAdvancedConditions(node.data.config.conditions);
      } else {
        setAdvancedConditions({ operator: 'AND', rules: [] });
      }
      
      if (node.data.config?.branches) {
        setBranches(node.data.config.branches);
      } else {
        setBranches([
          { name: 'success', conditions_met: true, next_node: '' },
          { name: 'failure', conditions_met: false, next_node: '' }
        ]);
      }
    }
  }, [node]);

  const handleSave = async () => {
    if (!flowId) {
      console.warn('Cannot save node - missing flowId');
      return;
    }

    try {
      setSaving(true);
      setSaveError(null);

      let finalConfig = { ...config };
      
      // For condition nodes, include advanced conditions and branches
      if (node.type === 'condition') {
        finalConfig = {
          ...config,
          conditions: advancedConditions,
          branches: branches,
          default_branch: branches.find(b => !b.conditions_met)?.name || 'failure'
        };
      }
      
      // For delay nodes, ensure all configuration is properly preserved
      if (node.type === 'delay') {
        finalConfig = {
          seconds: config.seconds || 1,
          blocking: config.blocking !== undefined ? config.blocking : true,
          timing_mode: config.timing_mode || 'fixed_delay',
          reset_on_user_response: config.reset_on_user_response !== undefined ? config.reset_on_user_response : true,
          cancel_on_user_response: config.cancel_on_user_response || false,
          scheduled_action: config.scheduled_action || null,
          execute_at: config.execute_at || null,
          timezone: config.timezone || 'UTC',
          ...config // Spread any additional config properties
        };
      }

      const nodeData = {
        label,
        description,
        config: finalConfig,
      };

      // Save to backend if node has a database ID
      if (node.data.dbId) {
        const backendNodeData = {
          node_id: node.id,
          node_type: node.type,
          position_x: node.position.x,
          position_y: node.position.y,
          config: finalConfig,
          label: label,
          description: description || '',
        };

        // Update node in backend
        const updatedNode = await flowAPI.updateFlowNode(flowId, node.data.dbId, backendNodeData);
        
        // Update local node data with backend response, preserving existing data
        const updatedNodeData = {
          ...node.data, // Preserve all existing data including functions
          ...nodeData, // Apply the new data
          dbId: updatedNode.id, // Ensure dbId is set
        };

        onUpdateNode(node.id, updatedNodeData);
        
        console.log('Node saved successfully to backend', { nodeId: node.id, dbId: updatedNode.id });
      } else {
        // This is a new node that needs to be created
        // Generate a unique node_id by adding timestamp to avoid conflicts
        const uniqueNodeId = `${node.id}-${Date.now()}`;
        
        const backendNodeData = {
          node_id: uniqueNodeId,
          node_type: node.type,
          position_x: node.position.x,
          position_y: node.position.y,
          config: finalConfig,
          label: label,
          description: description || '',
        };

        // Create node in backend
        const createdNode = await flowAPI.createFlowNode(flowId, backendNodeData);
        
        // Update local node data with backend response, preserving existing data
        const updatedNodeData = {
          ...node.data, // Preserve all existing data including functions
          ...nodeData, // Apply the new data
          dbId: createdNode.id, // Set the new dbId from backend
        };

        onUpdateNode(node.id, updatedNodeData);
        
        console.log('Node created successfully in backend', { nodeId: node.id, dbId: createdNode.id });
      }

      onClose();
    } catch (error) {
      console.error('Failed to save node:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save node');
    } finally {
      setSaving(false);
    }
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
          <div className="space-y-6">
            {/* Advanced Conditions Builder */}
            <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
              <AdvancedConditionsBuilder
                conditions={advancedConditions}
                onChange={setAdvancedConditions}
              />
            </div>

            {/* Branches Configuration */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-white">Flow Branches</h4>
              <div className="space-y-3">
                {branches.map((branch, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-3 border border-gray-600">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">
                          Branch Name
                        </label>
                        <input
                          type="text"
                          value={branch.name}
                          onChange={(e) => {
                            const newBranches = [...branches];
                            newBranches[index] = { ...branch, name: e.target.value };
                            setBranches(newBranches);
                          }}
                          className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-white focus:border-neon-green focus:outline-none"
                          placeholder="Branch name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">
                          When Conditions
                        </label>
                        <select
                          value={branch.conditions_met.toString()}
                          onChange={(e) => {
                            const newBranches = [...branches];
                            newBranches[index] = { ...branch, conditions_met: e.target.value === 'true' };
                            setBranches(newBranches);
                          }}
                          className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-white focus:border-neon-green focus:outline-none"
                        >
                          <option value="true">Are Met</option>
                          <option value="false">Are Not Met</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">
                          Next Node
                        </label>
                        <select
                          value={branch.next_node}
                          onChange={(e) => {
                            const newBranches = [...branches];
                            newBranches[index] = { ...branch, next_node: e.target.value };
                            setBranches(newBranches);
                          }}
                          className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-white focus:border-neon-green focus:outline-none"
                        >
                          <option value="">Select next node...</option>
                          {availableNodes.map((availableNode) => (
                            <option key={availableNode.id} value={availableNode.id}>
                              {availableNode.label} ({availableNode.type})
                            </option>
                          ))}
                        </select>
                        {/* Fallback input for manual entry */}
                        <input
                          type="text"
                          value={branch.next_node}
                          onChange={(e) => {
                            const newBranches = [...branches];
                            newBranches[index] = { ...branch, next_node: e.target.value };
                            setBranches(newBranches);
                          }}
                          className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-white focus:border-neon-green focus:outline-none mt-1"
                          placeholder="Or enter node ID manually"
                        />
                      </div>
                    </div>
                    <div className="mt-2">
                      <label className="block text-xs font-medium text-gray-400 mb-1">
                        Optional Message
                      </label>
                      <input
                        type="text"
                        value={branch.message || ''}
                        onChange={(e) => {
                          const newBranches = [...branches];
                          newBranches[index] = { ...branch, message: e.target.value };
                          setBranches(newBranches);
                        }}
                        className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-white focus:border-neon-green focus:outline-none"
                        placeholder="Optional message to display"
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setBranches([...branches, { name: `branch_${branches.length + 1}`, conditions_met: true, next_node: '' }])}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-gray-300 hover:text-white rounded text-sm transition-colors"
                >
                  + Add Branch
                </button>
                {branches.length > 2 && (
                  <button
                    onClick={() => setBranches(branches.slice(0, -1))}
                    className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-sm transition-colors"
                  >
                    Remove Last
                  </button>
                )}
              </div>
            </div>

            {/* Help Text */}
            <div className="text-xs text-gray-400 bg-gray-700 rounded p-3 border border-gray-600">
              <strong>How it works:</strong> The advanced conditions above will be evaluated. 
              Based on whether they pass or fail, the flow will follow the corresponding branch to the next node.
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
          <div className="space-y-6">
            {/* Quick Presets */}
            <div className="border-b border-gray-600 pb-6">
              <DelayPresets onApplyPreset={(presetConfig) => {
                setConfig({ ...config, ...presetConfig });
              }} />
            </div>

            {/* Basic Configuration */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Delay Duration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Hours</label>
                    <input
                      type="number"
                      value={Math.floor((config.seconds || config.delay_seconds || 1) / 3600)}
                      onChange={(e) => {
                        const hours = parseInt(e.target.value) || 0;
                        const currentSeconds = config.seconds || config.delay_seconds || 1;
                        const mins = Math.floor((currentSeconds % 3600) / 60);
                        const secs = currentSeconds % 60;
                        updateConfig('seconds', hours * 3600 + mins * 60 + secs);
                      }}
                      min="0"
                      max="23"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-neon-green focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Minutes</label>
                    <input
                      type="number"
                      value={Math.floor(((config.seconds || config.delay_seconds || 1) % 3600) / 60)}
                      onChange={(e) => {
                        const mins = parseInt(e.target.value) || 0;
                        const currentSeconds = config.seconds || config.delay_seconds || 1;
                        const hours = Math.floor(currentSeconds / 3600);
                        const secs = currentSeconds % 60;
                        updateConfig('seconds', hours * 3600 + mins * 60 + secs);
                      }}
                      min="0"
                      max="59"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-neon-green focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Seconds</label>
                    <input
                      type="number"
                      value={(config.seconds || config.delay_seconds || 1) % 60}
                      onChange={(e) => {
                        const secs = parseInt(e.target.value) || 0;
                        const currentSeconds = config.seconds || config.delay_seconds || 1;
                        const hours = Math.floor(currentSeconds / 3600);
                        const mins = Math.floor((currentSeconds % 3600) / 60);
                        updateConfig('seconds', hours * 3600 + mins * 60 + secs);
                      }}
                      min="0"
                      max="59"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-neon-green focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Blocking Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Delay Type
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="blocking"
                      checked={config.blocking !== false}
                      onChange={() => updateConfig('blocking', true)}
                      className="text-neon-green focus:ring-neon-green focus:ring-offset-gray-800"
                    />
                    <div>
                      <span className="text-white">Blocking Delay</span>
                      <p className="text-xs text-gray-400">Flow stops and waits for the delay</p>
                    </div>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="blocking"
                      checked={config.blocking === false}
                      onChange={() => updateConfig('blocking', false)}
                      className="text-neon-green focus:ring-neon-green focus:ring-offset-gray-800"
                    />
                    <div>
                      <span className="text-white">Non-blocking Delay</span>
                      <p className="text-xs text-gray-400">Flow continues, delay runs in background</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Advanced Configuration for Non-blocking */}
            {config.blocking === false && (
              <div className="border-t border-gray-600 pt-6 space-y-4">
                <h4 className="text-sm font-medium text-white flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Advanced Timing
                </h4>

                {/* Timing Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Timing Mode
                  </label>
                  <select
                    value={config.timing_mode || 'fixed_delay'}
                    onChange={(e) => updateConfig('timing_mode', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-neon-green focus:outline-none"
                  >
                    <option value="fixed_delay">Fixed Delay</option>
                    <option value="delay_from_last_message">Reset on User Message</option>
                    <option value="absolute_date">Absolute Date/Time</option>
                  </select>
                </div>

                {/* Absolute Date Configuration */}
                {config.timing_mode === 'absolute_date' && (
                  <div className="space-y-4 bg-gray-700 p-4 rounded-lg border border-gray-600">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Execute At
                      </label>
                      <input
                        type="text"
                        value={config.execute_at || ''}
                        onChange={(e) => updateConfig('execute_at', e.target.value)}
                        className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white focus:border-neon-green focus:outline-none font-mono text-sm"
                        placeholder="{{context.appointment_datetime}} or 2024-12-25T10:00:00"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Use template variables like {`{{context.appointment_datetime}}`} or ISO date format
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Timezone
                      </label>
                      <select
                        value={config.timezone || 'UTC'}
                        onChange={(e) => updateConfig('timezone', e.target.value)}
                        className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white focus:border-neon-green focus:outline-none"
                      >
                        <option value="UTC">UTC</option>
                        <option value="Europe/Paris">Europe/Paris</option>
                        <option value="America/New_York">America/New_York</option>
                        <option value="America/Los_Angeles">America/Los_Angeles</option>
                        <option value="Asia/Tokyo">Asia/Tokyo</option>
                        <option value="Australia/Sydney">Australia/Sydney</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Dynamic Delay Configuration */}
                {config.timing_mode === 'delay_from_last_message' && (
                  <div className="space-y-4 bg-gray-700 p-4 rounded-lg border border-gray-600">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={config.reset_on_user_response !== false}
                          onChange={(e) => updateConfig('reset_on_user_response', e.target.checked)}
                          className="text-neon-green focus:ring-neon-green focus:ring-offset-gray-800"
                        />
                        <div>
                          <span className="text-white">Reset on User Response</span>
                          <p className="text-xs text-gray-400">Restart delay timer when user sends a message</p>
                        </div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={config.cancel_on_user_response === true}
                          onChange={(e) => updateConfig('cancel_on_user_response', e.target.checked)}
                          className="text-neon-green focus:ring-neon-green focus:ring-offset-gray-800"
                        />
                        <div>
                          <span className="text-white">Cancel on User Response</span>
                          <p className="text-xs text-gray-400">Cancel delay entirely if user responds</p>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {/* Scheduled Action */}
                <div className="space-y-4">
                  <h5 className="text-sm font-medium text-gray-300">Scheduled Action (Optional)</h5>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Action Type
                    </label>
                    <select
                      value={config.scheduled_action?.type || 'continue_flow'}
                      onChange={(e) => updateConfig('scheduled_action', { 
                        ...config.scheduled_action, 
                        type: e.target.value 
                      })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-neon-green focus:outline-none"
                    >
                      <option value="continue_flow">Continue Flow</option>
                      <option value="message">Send Message</option>
                      <option value="restart_flow">Restart from Node</option>
                    </select>
                  </div>

                  {config.scheduled_action?.type === 'message' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Message Content
                      </label>
                      <textarea
                        value={config.scheduled_action?.content || ''}
                        onChange={(e) => updateConfig('scheduled_action', { 
                          ...config.scheduled_action, 
                          content: e.target.value 
                        })}
                        rows={3}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-neon-green focus:outline-none resize-none"
                        placeholder="Message to send after delay..."
                      />
                    </div>
                  )}

                  {config.scheduled_action?.type === 'restart_flow' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Restart from Node
                      </label>
                      <select
                        value={config.scheduled_action?.restart_from_node || ''}
                        onChange={(e) => updateConfig('scheduled_action', { 
                          ...config.scheduled_action, 
                          restart_from_node: e.target.value 
                        })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-neon-green focus:outline-none"
                      >
                        <option value="">Select node...</option>
                        {availableNodes.map(node => (
                          <option key={node.id} value={node.id}>
                            {node.label} ({node.type})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}
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
          {/* Error Message */}
          {saveError && (
            <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-red-400 text-sm">
              {saveError}
            </div>
          )}

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
          {(node.type === 'condition' || node.type === 'delay') ? (
            <div>
              {/* Tab Navigation for Condition and Delay Nodes */}
              <div className="flex space-x-1 mb-4">
                <button
                  onClick={() => setActiveTab('config')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'config'
                      ? 'bg-neon-green/20 text-neon-green border border-neon-green/20'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Configuration
                </button>
                <button
                  onClick={() => setActiveTab('docs')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'docs'
                      ? 'bg-neon-green/20 text-neon-green border border-neon-green/20'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Documentation
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'config' ? (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-3">
                    {node.type === 'condition' ? 'Condition' : 'Delay'} Configuration
                  </h4>
                  {renderConfigFields()}
                </div>
              ) : (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-3">
                    {node.type === 'condition' ? 'Advanced Conditions' : 'Delay'} Documentation
                  </h4>
                  <div className="bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto">
                    {node.type === 'condition' ? (
                      <ConditionsDocumentation />
                    ) : (
                      <DelayDocumentation />
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3">
                {node.type ? node.type.charAt(0).toUpperCase() + node.type.slice(1) : 'Node'} Configuration
              </h4>
              {renderConfigFields()}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-600">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-neon-green/20 hover:bg-neon-green/30 text-neon-green px-4 py-2 rounded-lg transition-colors border border-neon-green/20 hover:border-neon-green/40 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Apply Changes'}
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
