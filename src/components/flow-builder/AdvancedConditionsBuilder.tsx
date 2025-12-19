import React, { useState, useEffect } from 'react';

export interface ConditionRule {
  id: string;
  type: string;
  operator: string;
  value: any;
  field?: string;
  variable_path?: string;
  case_sensitive?: boolean;
  intent_name?: string;
  confidence_threshold?: number;
  pattern?: string;
  target?: string;
  node_id?: string;
  visited?: boolean;
  start_time?: string;
  end_time?: string;
  timezone?: string;
  // Function call specific fields
  function_name?: string;
}

export interface ConditionsConfig {
  operator: 'AND' | 'OR';
  rules: ConditionRule[];
}

interface AdvancedConditionsBuilderProps {
  conditions: ConditionsConfig;
  onChange: (conditions: ConditionsConfig) => void;
  className?: string;
}

const CONDITION_TYPES = [
  { value: 'contact', label: 'Contact Data', description: 'Evaluate contact information' },
  { value: 'context_variable', label: 'Context Variable', description: 'Check variables in execution context' },
  { value: 'user_input', label: 'User Input', description: 'Analyze user message content' },
  { value: 'intent', label: 'Intent', description: 'Check detected user intent' },
  { value: 'time_condition', label: 'Time Condition', description: 'Time-based conditions' },
  { value: 'regex', label: 'Regex Pattern', description: 'Pattern matching with regex' },
  { value: 'previous_node', label: 'Previous Node', description: 'Check visited nodes' },
  { value: 'conversation', label: 'Conversation', description: 'Conversation metadata' },
  { value: 'function_call', label: 'Function Call', description: 'Check if specific functions were called' },
];

const OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Not Contains' },
  { value: 'starts_with', label: 'Starts With' },
  { value: 'ends_with', label: 'Ends With' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'greater_equal', label: 'Greater or Equal' },
  { value: 'less_equal', label: 'Less or Equal' },
  { value: 'is_empty', label: 'Is Empty' },
  { value: 'not_empty', label: 'Not Empty' },
  { value: 'in_list', label: 'In List' },
  { value: 'not_in_list', label: 'Not In List' },
  { value: 'matches_regex', label: 'Matches Regex' },
];

const CONTACT_FIELDS = [
  { value: 'name', label: 'Name' },
  { value: 'email', label: 'Email' },
  { value: 'phone_number', label: 'Phone Number' },
  { value: 'middle_name', label: 'Middle Name' },
  { value: 'last_name', label: 'Last Name' },
  { value: 'identifier', label: 'Identifier' },
  { value: 'blocked', label: 'Blocked Status' },
  { value: 'country_code', label: 'Country Code' },
  { value: 'location', label: 'Location' },
  { value: 'contact_type', label: 'Contact Type' },
  { value: 'last_activity_at', label: 'Last Activity At' },
  { value: 'created_at', label: 'Created At' },
  { value: 'updated_at', label: 'Updated At' },
  { value: 'additional_attributes', label: 'Additional Attributes (JSON)' },
  { value: 'custom_attributes', label: 'Custom Attributes (JSON)' },
];

const TIME_OPERATORS = [
  { value: 'between', label: 'Between' },
  { value: 'after', label: 'After' },
  { value: 'before', label: 'Before' },
];

const CONVERSATION_FIELDS = [
  { value: 'message_count', label: 'Message Count' },
  { value: 'duration_minutes', label: 'Duration (minutes)' },
  { value: 'status', label: 'Status' },
];

const FUNCTION_CALL_OPERATORS = [
  { value: 'called', label: 'Was Called', description: 'True if the function was called' },
  { value: 'not_called', label: 'Not Called', description: 'True if the function was not called' },
];

export default function AdvancedConditionsBuilder({ 
  conditions, 
  onChange, 
  className = '' 
}: AdvancedConditionsBuilderProps) {
  const [localConditions, setLocalConditions] = useState<ConditionsConfig>(conditions);

  useEffect(() => {
    setLocalConditions(conditions);
  }, [conditions]);

  const updateConditions = (newConditions: ConditionsConfig) => {
    setLocalConditions(newConditions);
    onChange(newConditions);
  };

  const addRule = () => {
    const newRule: ConditionRule = {
      id: `rule_${Date.now()}`,
      type: 'contact',
      operator: 'equals',
      value: '',
    };
    
    updateConditions({
      ...localConditions,
      rules: [...localConditions.rules, newRule],
    });
  };

  const removeRule = (ruleId: string) => {
    updateConditions({
      ...localConditions,
      rules: localConditions.rules.filter(rule => rule.id !== ruleId),
    });
  };

  const updateRule = (ruleId: string, updates: Partial<ConditionRule>) => {
    updateConditions({
      ...localConditions,
      rules: localConditions.rules.map(rule => 
        rule.id === ruleId ? { ...rule, ...updates } : rule
      ),
    });
  };

  const renderRuleFields = (rule: ConditionRule) => {
    switch (rule.type) {
      case 'contact':
        return (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Field</label>
                <select
                  value={rule.field || ''}
                  onChange={(e) => updateRule(rule.id, { field: e.target.value })}
                  className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-foreground focus:border-neon-green focus:outline-none"
                >
                  <option value="">Select field</option>
                  {CONTACT_FIELDS.map(field => (
                    <option key={field.value} value={field.value}>{field.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Operator</label>
                <select
                  value={rule.operator}
                  onChange={(e) => updateRule(rule.id, { operator: e.target.value })}
                  className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-foreground focus:border-neon-green focus:outline-none"
                >
                  {OPERATORS.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </select>
              </div>
            </div>
            {['additional_attributes', 'custom_attributes'].includes(rule.field || '') && (
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Custom Field Path</label>
                <input
                  type="text"
                  value={rule.variable_path || ''}
                  onChange={(e) => updateRule(rule.id, { 
                    variable_path: e.target.value
                  })}
                  className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-foreground focus:border-neon-green focus:outline-none"
                  placeholder="e.g., additional_attributes.source, custom_attributes.category"
                />
                <div className="bg-gray-800 p-2 rounded text-xs text-muted-foreground mt-1">
                  <strong>JSON Field:</strong> Access nested values using dot notation.
                  <br />
                  <strong>Examples:</strong> additional_attributes.source, custom_attributes.category, custom_attributes.tags.0
                </div>
              </div>
            )}
            {!['is_empty', 'not_empty'].includes(rule.operator) && (
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Value</label>
                <input
                  type="text"
                  value={rule.value || ''}
                  onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                  className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-foreground focus:border-neon-green focus:outline-none"
                  placeholder="Expected value"
                />
              </div>
            )}
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={rule.case_sensitive !== false}
                  onChange={(e) => updateRule(rule.id, { case_sensitive: e.target.checked })}
                  className="rounded"
                />
                <span className="text-xs text-muted-foreground">Case sensitive</span>
              </label>
            </div>
          </>
        );

      case 'context_variable':
        return (
          <>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Variable Path</label>
              <input
                type="text"
                value={rule.variable_path || ''}
                onChange={(e) => updateRule(rule.id, { variable_path: e.target.value })}
                className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-foreground focus:border-neon-green focus:outline-none"
                placeholder="e.g., user.age, preferences.language"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Operator</label>
                <select
                  value={rule.operator}
                  onChange={(e) => updateRule(rule.id, { operator: e.target.value })}
                  className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-foreground focus:border-neon-green focus:outline-none"
                >
                  {OPERATORS.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Value</label>
                <input
                  type="text"
                  value={rule.value || ''}
                  onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                  className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-foreground focus:border-neon-green focus:outline-none"
                  placeholder="Expected value"
                />
              </div>
            </div>
          </>
        );

      case 'user_input':
        return (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Operator</label>
                <select
                  value={rule.operator}
                  onChange={(e) => updateRule(rule.id, { operator: e.target.value })}
                  className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-foreground focus:border-neon-green focus:outline-none"
                >
                  {OPERATORS.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Value</label>
                <input
                  type="text"
                  value={rule.value || ''}
                  onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                  className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-foreground focus:border-neon-green focus:outline-none"
                  placeholder="Text to match"
                />
              </div>
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={rule.case_sensitive !== false}
                  onChange={(e) => updateRule(rule.id, { case_sensitive: e.target.checked })}
                  className="rounded"
                />
                <span className="text-xs text-muted-foreground">Case sensitive</span>
              </label>
            </div>
          </>
        );

      case 'intent':
        return (
          <>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Intent Name</label>
              <input
                type="text"
                value={rule.intent_name || ''}
                onChange={(e) => updateRule(rule.id, { intent_name: e.target.value })}
                className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-foreground focus:border-neon-green focus:outline-none"
                placeholder="e.g., confirm_booking, support_request"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Confidence Threshold</label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={rule.confidence_threshold || 0.8}
                onChange={(e) => updateRule(rule.id, { confidence_threshold: parseFloat(e.target.value) })}
                className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-foreground focus:border-neon-green focus:outline-none"
              />
            </div>
          </>
        );

      case 'time_condition':
        return (
          <>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Time Operator</label>
              <select
                value={rule.operator}
                onChange={(e) => updateRule(rule.id, { operator: e.target.value })}
                className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-foreground focus:border-neon-green focus:outline-none"
              >
                {TIME_OPERATORS.map(op => (
                  <option key={op.value} value={op.value}>{op.label}</option>
                ))}
              </select>
            </div>
            {rule.operator === 'between' ? (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Start Time</label>
                  <input
                    type="time"
                    value={rule.start_time || ''}
                    onChange={(e) => updateRule(rule.id, { start_time: e.target.value })}
                    className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-foreground focus:border-neon-green focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">End Time</label>
                  <input
                    type="time"
                    value={rule.end_time || ''}
                    onChange={(e) => updateRule(rule.id, { end_time: e.target.value })}
                    className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-foreground focus:border-neon-green focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Time</label>
                <input
                  type="time"
                  value={rule.value || ''}
                  onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                  className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-foreground focus:border-neon-green focus:outline-none"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Timezone</label>
              <input
                type="text"
                value={rule.timezone || 'UTC'}
                onChange={(e) => updateRule(rule.id, { timezone: e.target.value })}
                className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-foreground focus:border-neon-green focus:outline-none"
                placeholder="e.g., UTC, Europe/Paris"
              />
            </div>
          </>
        );

      case 'regex':
        return (
          <>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Regex Pattern</label>
              <input
                type="text"
                value={rule.pattern || ''}
                onChange={(e) => updateRule(rule.id, { pattern: e.target.value })}
                className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-foreground focus:border-neon-green focus:outline-none"
                placeholder="e.g., ^[0-9]{10}$"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Target</label>
              <select
                value={rule.target || 'last_user_message'}
                onChange={(e) => updateRule(rule.id, { target: e.target.value })}
                className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-foreground focus:border-neon-green focus:outline-none"
              >
                <option value="last_user_message">Last User Message</option>
              </select>
            </div>
          </>
        );

      case 'previous_node':
        return (
          <>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Node ID</label>
              <input
                type="text"
                value={rule.node_id || ''}
                onChange={(e) => updateRule(rule.id, { node_id: e.target.value })}
                className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-foreground focus:border-neon-green focus:outline-none"
                placeholder="e.g., welcome_message"
              />
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={rule.visited !== false}
                  onChange={(e) => updateRule(rule.id, { visited: e.target.checked })}
                  className="rounded"
                />
                <span className="text-xs text-muted-foreground">Must have been visited</span>
              </label>
            </div>
          </>
        );

      case 'conversation':
        return (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Field</label>
                <select
                  value={rule.field || ''}
                  onChange={(e) => updateRule(rule.id, { field: e.target.value })}
                  className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-foreground focus:border-neon-green focus:outline-none"
                >
                  <option value="">Select field</option>
                  {CONVERSATION_FIELDS.map(field => (
                    <option key={field.value} value={field.value}>{field.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Operator</label>
                <select
                  value={rule.operator}
                  onChange={(e) => updateRule(rule.id, { operator: e.target.value })}
                  className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-foreground focus:border-neon-green focus:outline-none"
                >
                  {OPERATORS.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Value</label>
              <input
                type={rule.field === 'message_count' || rule.field === 'duration_minutes' ? 'number' : 'text'}
                value={rule.value || ''}
                onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-foreground focus:border-neon-green focus:outline-none"
                placeholder="Expected value"
              />
            </div>
          </>
        );

      case 'function_call':
        return (
          <>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Operator</label>
              <select
                value={rule.operator}
                onChange={(e) => updateRule(rule.id, { operator: e.target.value })}
                className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-foreground focus:border-neon-green focus:outline-none"
              >
                {FUNCTION_CALL_OPERATORS.map(op => (
                  <option key={op.value} value={op.value} title={op.description}>{op.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Function Name</label>
              <input
                type="text"
                value={rule.function_name || ''}
                onChange={(e) => updateRule(rule.id, { function_name: e.target.value })}
                className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-foreground focus:border-neon-green focus:outline-none"
                placeholder="e.g., send_email, get_calendar, schedule_meeting"
              />
              <p className="text-xs text-gray-500 mt-1">Name of the function to check</p>
            </div>
            <div className="bg-gray-800 p-2 rounded text-xs text-muted-foreground">
              <strong>How it works:</strong> Checks if the specified function has been called during the conversation flow. 
              Function calls are automatically tracked when AI nodes execute MCP tools. The calls are stored with order and timing information.
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">Advanced Conditions</h4>
        <div className="flex items-center space-x-2">
          <label className="text-xs text-muted-foreground">Logic:</label>
          <select
            value={localConditions.operator}
            onChange={(e) => updateConditions({ ...localConditions, operator: e.target.value as 'AND' | 'OR' })}
            className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-xs text-foreground focus:border-neon-green focus:outline-none"
          >
            <option value="AND">AND (All must be true)</option>
            <option value="OR">OR (Any can be true)</option>
          </select>
        </div>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {localConditions.rules.map((rule, index) => (
          <div key={rule.id} className="bg-secondary rounded-lg p-3 space-y-3 border border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-primary">Rule {index + 1}</span>
                <select
                  value={rule.type}
                  onChange={(e) => updateRule(rule.id, { type: e.target.value })}
                  className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-xs text-foreground focus:border-neon-green focus:outline-none"
                >
                  {CONDITION_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => removeRule(rule.id)}
                className="text-red-400 hover:text-red-300 text-sm"
                title="Remove rule"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-2">
              {renderRuleFields(rule)}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addRule}
        className="w-full bg-secondary hover:bg-gray-600 text-gray-300 hover:text-foreground px-3 py-2 rounded-lg transition-colors border border-gray-600 hover:border-gray-500 text-sm"
      >
        + Add Condition Rule
      </button>
    </div>
  );
}
