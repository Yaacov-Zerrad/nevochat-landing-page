import React, { useState, useEffect } from 'react';
import { Edge } from 'reactflow';
import { flowAPI } from '@/lib/api';
import AdvancedConditionsBuilder, { ConditionsConfig } from './AdvancedConditionsBuilder';
import ConditionsDocumentation from './ConditionsDocumentation';

interface EdgePropertiesPanelProps {
  edge: Edge | null;
  onUpdateEdge: (edgeId: string, newData: any) => void;
  onClose: () => void;
  onDelete?: () => void;
  flowId?: number;
  nodes?: any[]; // Pour trouver les nodes source et target
}

const CONDITION_TYPES = [
  { value: 'always', label: 'Always' },
  { value: 'condition', label: 'Advanced Conditions' },
  { value: 'intent', label: 'Intent Match' },
  { value: 'keyword', label: 'Keyword Match' },
  { value: 'user_input', label: 'User Input' },
  { value: 'wait_user_reply', label: 'Wait for User Reply' },
];

export default function EdgePropertiesPanel({ edge, onUpdateEdge, onClose, onDelete, flowId, nodes = [] }: EdgePropertiesPanelProps) {
  const [conditionType, setConditionType] = useState(edge?.data?.condition_type || 'always');
  const [label, setLabel] = useState(edge?.data?.label || '');
  const [priority, setPriority] = useState(edge?.data?.priority || 0);
  const [conditionConfig, setConditionConfig] = useState(edge?.data?.condition_config || {});
  const [activeTab, setActiveTab] = useState<'config' | 'docs'>('config');
  const [advancedConditions, setAdvancedConditions] = useState<ConditionsConfig>({
    operator: 'AND',
    rules: []
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (edge) {
      setConditionType(edge.data?.condition_type || 'always');
      setLabel(edge.data?.label || '');
      setPriority(edge.data?.priority || 0);
      setConditionConfig(edge.data?.condition_config || {});
      setSaveError(null);
      
      // Load advanced conditions if they exist
      if (edge.data?.condition_config?.conditions) {
        setAdvancedConditions(edge.data.condition_config.conditions);
      } else {
        setAdvancedConditions({ operator: 'AND', rules: [] });
      }
    }
  }, [edge]);

  if (!edge) {
    return null;
  }

  const handleSave = async () => {
    if (!edge || !flowId) {
      console.warn('Cannot save edge - missing edge or flowId');
      return;
    }

    try {
      setSaving(true);
      setSaveError(null);

      let finalConditionConfig = { ...conditionConfig };
      
      // If using advanced conditions, include them in the config
      if (conditionType === 'condition') {
        finalConditionConfig = {
          ...conditionConfig,
          conditions: advancedConditions
        };
      }

      const edgeData = {
        condition_type: conditionType,
        label: label,
        priority: priority,
        condition_config: finalConditionConfig,
      };

      // Save to backend if edge has a database ID
      if (edge.data?.dbId) {
        // Find source and target node database IDs
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        
        if (!sourceNode?.data.dbId || !targetNode?.data.dbId) {
          throw new Error('Cannot save edge - source or target node not found in database');
        }

        const backendEdgeData = {
          edge_id: edge.id,
          source_node: sourceNode.data.dbId,
          target_node: targetNode.data.dbId,
          source_handle: edge.sourceHandle || '',
          target_handle: edge.targetHandle || '',
          condition_type: conditionType,
          condition_config: finalConditionConfig,
          label: label,
          style: edge.data?.style || {},
          priority: priority,
        };

        // Update edge in backend
        const updatedEdge = await flowAPI.updateFlowEdge(flowId, edge.data.dbId, backendEdgeData);
        
        // Update local edge data with backend response, preserving existing data
        const updatedEdgeData = {
          ...edge.data, // Preserve all existing data
          ...edgeData, // Apply the new data
          dbId: updatedEdge.id, // Ensure dbId is set
        };

        onUpdateEdge(edge.id, updatedEdgeData);
        
        console.log('Edge saved successfully to backend', { edgeId: edge.id, dbId: updatedEdge.id });
      } else {
        // This is a new edge that needs to be created
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        
        if (!sourceNode?.data.dbId || !targetNode?.data.dbId) {
          // If nodes don't have database IDs, just update locally for now
          onUpdateEdge(edge.id, edgeData);
          console.log('Edge updated locally - nodes not yet saved to backend');
          onClose();
          return;
        }

        // Generate a unique edge_id by adding timestamp to avoid conflicts
        const uniqueEdgeId = `${edge.id}-${Date.now()}`;
        
        const backendEdgeData = {
          edge_id: uniqueEdgeId,
          source_node: sourceNode.data.dbId,
          target_node: targetNode.data.dbId,
          source_handle: edge.sourceHandle || '',
          target_handle: edge.targetHandle || '',
          condition_type: conditionType,
          condition_config: finalConditionConfig,
          label: label,
          style: edge.data?.style || {},
          priority: priority,
        };

        // Create edge in backend
        const createdEdge = await flowAPI.createFlowEdge(flowId, backendEdgeData);
        
        // Update local edge data with backend response, preserving existing data
        const updatedEdgeData = {
          ...edge.data, // Preserve all existing data
          ...edgeData, // Apply the new data
          dbId: createdEdge.id, // Set the new dbId from backend
        };

        onUpdateEdge(edge.id, updatedEdgeData);
        
        console.log('Edge created successfully in backend', { edgeId: edge.id, dbId: createdEdge.id });
      }

      onClose();
    } catch (error) {
      console.error('Failed to save edge:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save edge');
    } finally {
      setSaving(false);
    }
  };

  const handleConditionConfigChange = (key: string, value: any) => {
    setConditionConfig((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleAdvancedConditionsChange = (conditions: ConditionsConfig) => {
    setAdvancedConditions(conditions);
  };

  const renderConditionConfig = () => {
    switch (conditionType) {
      case 'condition':
        return (
          <div className="space-y-4">
            <div className="bg-secondary rounded-lg p-4 border border-gray-600">
              <AdvancedConditionsBuilder
                conditions={advancedConditions}
                onChange={handleAdvancedConditionsChange}
              />
            </div>
            <div className="text-xs text-muted-foreground bg-secondary rounded p-2 border border-gray-600">
              <strong>Advanced Conditions:</strong> Create complex validation rules using multiple condition types 
              with AND/OR logic. These conditions will be evaluated when the flow reaches this edge.
            </div>
          </div>
        );
      
      case 'keyword':
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">
              Keywords (comma separated)
            </label>
            <input
              type="text"
              value={conditionConfig.keywords?.join(', ') || ''}
              onChange={(e) => handleConditionConfigChange('keywords', e.target.value.split(',').map(k => k.trim()).filter(Boolean))}
              className="w-full bg-secondary border border-gray-600 rounded px-3 py-2 text-foreground placeholder-muted-foreground focus:border-neon-green focus:outline-none"
              placeholder="e.g., yes, ok, sure"
            />
            <div className="text-xs text-muted-foreground">
              The edge will be taken if the user message contains any of these keywords.
            </div>
          </div>
        );
      
      case 'intent':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Intent Name
              </label>
              <input
                type="text"
                value={conditionConfig.intent_name || ''}
                onChange={(e) => handleConditionConfigChange('intent_name', e.target.value)}
                className="w-full bg-secondary border border-gray-600 rounded px-3 py-2 text-foreground placeholder-muted-foreground focus:border-neon-green focus:outline-none"
                placeholder="e.g., greeting, support, booking"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confidence Threshold
              </label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={conditionConfig.confidence_threshold || 0.8}
                onChange={(e) => handleConditionConfigChange('confidence_threshold', parseFloat(e.target.value))}
                className="w-full bg-secondary border border-gray-600 rounded px-3 py-2 text-foreground placeholder-muted-foreground focus:border-neon-green focus:outline-none"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              The edge will be taken if the detected intent matches with sufficient confidence.
            </div>
          </div>
        );
      
      case 'user_input':
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">
              Expected Input
            </label>
            <input
              type="text"
              value={conditionConfig.expected_input || ''}
              onChange={(e) => handleConditionConfigChange('expected_input', e.target.value)}
              className="w-full bg-secondary border border-gray-600 rounded px-3 py-2 text-foreground placeholder-muted-foreground focus:border-neon-green focus:outline-none"
              placeholder="Leave empty to accept any user input"
            />
            <div className="text-xs text-muted-foreground">
              The edge will be taken if the user provides any input (or specific input if specified).
            </div>
          </div>
        );
      case 'wait_user_reply':
        return (
          <div className="text-sm text-muted-foreground bg-secondary rounded p-3 border border-gray-600">
            This edge will be taken when the bot is waiting for a user reply.
          </div>
        );
      
      default:
        return (
          <div className="text-sm text-muted-foreground bg-secondary rounded p-3 border border-gray-600">
            This edge will always be taken when the flow reaches this point.
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-600">
        <h3 className="text-lg font-semibold text-foreground">Edge Properties</h3>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Error Message */}
        {saveError && (
          <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-red-400 text-sm">
            {saveError}
          </div>
        )}

        {/* Edge Label */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Label
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full bg-secondary border border-gray-600 rounded px-3 py-2 text-foreground placeholder-muted-foreground focus:border-neon-green focus:outline-none"
            placeholder="Edge label (optional)"
          />
        </div>

        {/* Condition Type */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Condition Type
          </label>
          <select
            value={conditionType}
            onChange={(e) => setConditionType(e.target.value)}
            className="w-full bg-secondary border border-gray-600 rounded px-3 py-2 text-foreground focus:border-neon-green focus:outline-none"
          >
            {CONDITION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Condition Configuration */}
        {conditionType === 'condition' ? (
          <div>
            {/* Tab Navigation for Advanced Conditions */}
            <div className="flex space-x-1 mb-4">
              <button
                onClick={() => setActiveTab('config')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  activeTab === 'config'
                    ? 'bg-primary/20 text-primary border border-primary/20'
                    : 'bg-secondary text-gray-300 hover:bg-gray-600'
                }`}
              >
                Configuration
              </button>
              <button
                onClick={() => setActiveTab('docs')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  activeTab === 'docs'
                    ? 'bg-primary/20 text-primary border border-primary/20'
                    : 'bg-secondary text-gray-300 hover:bg-gray-600'
                }`}
              >
                Help
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'config' ? (
              renderConditionConfig()
            ) : (
              <div className="bg-gray-800 rounded-lg p-3 max-h-60 overflow-y-auto">
                <ConditionsDocumentation />
              </div>
            )}
          </div>
        ) : (
          renderConditionConfig()
        )}

        {/* Priority */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Priority
          </label>
          <input
            type="number"
            value={priority}
            onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
            className="w-full bg-secondary border border-gray-600 rounded px-3 py-2 text-foreground placeholder-muted-foreground focus:border-neon-green focus:outline-none"
            placeholder="0"
          />
          <p className="text-xs text-muted-foreground">Higher priority edges are evaluated first</p>
        </div>
      </div>

      <div className="p-4 border-t border-gray-600 space-y-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary/20 hover:bg-primary/30 text-primary px-4 py-2 rounded-lg transition-colors border border-primary/20 hover:border-neon-green/40 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Apply Changes'}
        </button>
        
        {onDelete && (
          <button
            onClick={onDelete}
            className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-colors border border-red-500/20 hover:border-red-500/40"
          >
            Delete Connection
          </button>
        )}
      </div>
    </div>
  );
}
