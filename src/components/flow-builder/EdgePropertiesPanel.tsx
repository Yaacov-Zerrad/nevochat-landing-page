import React, { useState, useEffect } from 'react';
import { Edge } from 'reactflow';

interface EdgePropertiesPanelProps {
  edge: Edge | null;
  onUpdateEdge: (edgeId: string, newData: any) => void;
  onClose: () => void;
}

const CONDITION_TYPES = [
  { value: 'always', label: 'Always' },
  { value: 'condition', label: 'Conditional' },
  { value: 'intent', label: 'Intent Match' },
  { value: 'keyword', label: 'Keyword Match' },
  { value: 'user_input', label: 'User Input' },
];

export default function EdgePropertiesPanel({ edge, onUpdateEdge, onClose }: EdgePropertiesPanelProps) {
  const [conditionType, setConditionType] = useState(edge?.data?.condition_type || 'always');
  const [label, setLabel] = useState(edge?.data?.label || '');
  const [priority, setPriority] = useState(edge?.data?.priority || 0);
  const [conditionConfig, setConditionConfig] = useState(edge?.data?.condition_config || {});

  useEffect(() => {
    if (edge) {
      setConditionType(edge.data?.condition_type || 'always');
      setLabel(edge.data?.label || '');
      setPriority(edge.data?.priority || 0);
      setConditionConfig(edge.data?.condition_config || {});
    }
  }, [edge]);

  if (!edge) {
    return null;
  }

  const handleSave = () => {
    onUpdateEdge(edge.id, {
      condition_type: conditionType,
      label: label,
      priority: priority,
      condition_config: conditionConfig,
    });
  };

  const handleConditionConfigChange = (key: string, value: any) => {
    setConditionConfig((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  const renderConditionConfig = () => {
    switch (conditionType) {
      case 'condition':
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">
              Expression
            </label>
            <textarea
              value={conditionConfig.expression || ''}
              onChange={(e) => handleConditionConfigChange('expression', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:border-neon-green focus:outline-none"
              placeholder="e.g., user_input === 'yes'"
              rows={3}
            />
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
          </div>
        );
      
      case 'intent':
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">
              Intent
            </label>
            <input
              type="text"
              value={conditionConfig.intent || ''}
              onChange={(e) => handleConditionConfigChange('intent', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:border-neon-green focus:outline-none"
              placeholder="e.g., greeting, support"
            />
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
              placeholder="e.g., yes"
            />
          </div>
        );
      
      default:
        return null;
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
        {renderConditionConfig()}

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
