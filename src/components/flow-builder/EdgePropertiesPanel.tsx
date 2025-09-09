import React, { useState, useEffect } from 'react';
import { Edge } from 'reactflow';
import AdvancedConditionsBuilder, { ConditionsConfig } from './AdvancedConditionsBuilder';
import ConditionsDocumentation from './ConditionsDocumentation';

interface EdgePropertiesPanelProps {
  edge: Edge | null;
  onUpdateEdge: (edgeId: string, newData: any) => void;
  onClose: () => void;
}

const CONDITION_TYPES = [
  { value: 'always', label: 'Always' },
  { value: 'condition', label: 'Advanced Conditions' },
  { value: 'intent', label: 'Intent Match' },
  { value: 'keyword', label: 'Keyword Match' },
  { value: 'user_input', label: 'User Input' },
];

export default function EdgePropertiesPanel({ edge, onUpdateEdge, onClose }: EdgePropertiesPanelProps) {
  const [conditionType, setConditionType] = useState(edge?.data?.condition_type || 'always');
  const [label, setLabel] = useState(edge?.data?.label || '');
  const [priority, setPriority] = useState(edge?.data?.priority || 0);
  const [conditionConfig, setConditionConfig] = useState(edge?.data?.condition_config || {});
  const [activeTab, setActiveTab] = useState<'config' | 'docs'>('config');
  const [advancedConditions, setAdvancedConditions] = useState<ConditionsConfig>({
    operator: 'AND',
    rules: []
  });

  useEffect(() => {
    if (edge) {
      setConditionType(edge.data?.condition_type || 'always');
      setLabel(edge.data?.label || '');
      setPriority(edge.data?.priority || 0);
      setConditionConfig(edge.data?.condition_config || {});
      
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

  const handleSave = () => {
    let finalConditionConfig = { ...conditionConfig };
    
    // If using advanced conditions, include them in the config
    if (conditionType === 'condition') {
      finalConditionConfig = {
        ...conditionConfig,
        conditions: advancedConditions
      };
    }

    onUpdateEdge(edge.id, {
      condition_type: conditionType,
      label: label,
      priority: priority,
      condition_config: finalConditionConfig,
    });
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
            <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
              <AdvancedConditionsBuilder
                conditions={advancedConditions}
                onChange={handleAdvancedConditionsChange}
              />
            </div>
            <div className="text-xs text-gray-400 bg-gray-700 rounded p-2 border border-gray-600">
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
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:border-neon-green focus:outline-none"
              placeholder="e.g., yes, ok, sure"
            />
            <div className="text-xs text-gray-400">
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
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:border-neon-green focus:outline-none"
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
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:border-neon-green focus:outline-none"
              />
            </div>
            <div className="text-xs text-gray-400">
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
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:border-neon-green focus:outline-none"
              placeholder="Leave empty to accept any user input"
            />
            <div className="text-xs text-gray-400">
              The edge will be taken if the user provides any input (or specific input if specified).
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-sm text-gray-400 bg-gray-700 rounded p-3 border border-gray-600">
            This edge will always be taken when the flow reaches this point.
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-600">
        <h3 className="text-lg font-semibold text-white">Edge Properties</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Edge Label */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Label
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:border-neon-green focus:outline-none"
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
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-neon-green focus:outline-none"
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
                    ? 'bg-neon-green/20 text-neon-green border border-neon-green/20'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Configuration
              </button>
              <button
                onClick={() => setActiveTab('docs')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  activeTab === 'docs'
                    ? 'bg-neon-green/20 text-neon-green border border-neon-green/20'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
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
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:border-neon-green focus:outline-none"
            placeholder="0"
          />
          <p className="text-xs text-gray-400">Higher priority edges are evaluated first</p>
        </div>
      </div>

      <div className="p-4 border-t border-gray-600">
        <button
          onClick={handleSave}
          className="w-full bg-neon-green/20 hover:bg-neon-green/30 text-neon-green px-4 py-2 rounded-lg transition-colors border border-neon-green/20 hover:border-neon-green/40"
        >
          Update Edge
        </button>
      </div>
    </div>
  );
}
