import React from 'react';

export default function ConditionsDocumentation() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Advanced Conditions System</h2>
        <p className="text-gray-300">
          The Advanced Conditions System allows you to create complex validation rules for both Flow Nodes 
          and Flow Edges using multiple condition types with logical operators.
        </p>
      </div>

      {/* Basic Structure */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Basic Structure</h3>
        <div className="bg-gray-900 rounded p-4 overflow-x-auto">
          <pre className="text-sm text-gray-300">
{`{
  "conditions": {
    "operator": "AND",  // "AND" or "OR"
    "rules": [
      {
        "id": "rule_1",
        "type": "condition_type",
        "operator": "comparison_operator",
        "value": "expected_value",
        // ... other type-specific fields
      }
    ]
  }
}`}
          </pre>
        </div>
      </div>

      {/* Condition Types */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Condition Types</h3>
        <div className="space-y-6">
          {/* Contact Conditions */}
          <div>
            <h4 className="text-lg font-medium text-neon-green mb-2">Contact Conditions</h4>
            <p className="text-gray-400 mb-3">Evaluate conditions on contact data from the conversation context.</p>
            <div className="bg-gray-900 rounded p-3 overflow-x-auto">
              <pre className="text-sm text-gray-300">
{`{
  "id": "contact_check",
  "type": "contact",
  "field": "phone_number",
  "operator": "starts_with",
  "value": "972",
  "case_sensitive": false
}`}
              </pre>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              <strong>Available fields:</strong> name, email, phone_number, blocked, location, country_code, etc.
            </p>
          </div>

          {/* Context Variable Conditions */}
          <div>
            <h4 className="text-lg font-medium text-neon-green mb-2">Context Variable Conditions</h4>
            <p className="text-gray-400 mb-3">Evaluate conditions on any variable in the execution context using dot notation.</p>
            <div className="bg-gray-900 rounded p-3 overflow-x-auto">
              <pre className="text-sm text-gray-300">
{`{
  "id": "age_check",
  "type": "context_variable",
  "variable_path": "user.age",
  "operator": "greater_than",
  "value": 18
}`}
              </pre>
            </div>
          </div>

          {/* User Input Conditions */}
          <div>
            <h4 className="text-lg font-medium text-neon-green mb-2">User Input Conditions</h4>
            <p className="text-gray-400 mb-3">Evaluate conditions on the last user message.</p>
            <div className="bg-gray-900 rounded p-3 overflow-x-auto">
              <pre className="text-sm text-gray-300">
{`{
  "id": "input_contains",
  "type": "user_input",
  "operator": "contains",
  "value": "yes",
  "case_sensitive": false
}`}
              </pre>
            </div>
          </div>

          {/* Time Conditions */}
          <div>
            <h4 className="text-lg font-medium text-neon-green mb-2">Time Conditions</h4>
            <p className="text-gray-400 mb-3">Evaluate time-based conditions with timezone support.</p>
            <div className="bg-gray-900 rounded p-3 overflow-x-auto">
              <pre className="text-sm text-gray-300">
{`{
  "id": "business_hours",
  "type": "time_condition",
  "operator": "between",
  "start_time": "09:00",
  "end_time": "17:00",
  "timezone": "Europe/Paris"
}`}
              </pre>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              <strong>Operators:</strong> between, after, before
            </p>
          </div>

          {/* Regex Conditions */}
          <div>
            <h4 className="text-lg font-medium text-neon-green mb-2">Regex Conditions</h4>
            <p className="text-gray-400 mb-3">Pattern matching using regular expressions.</p>
            <div className="bg-gray-900 rounded p-3 overflow-x-auto">
              <pre className="text-sm text-gray-300">
{`{
  "id": "phone_pattern",
  "type": "regex",
  "pattern": "^[0-9]{10}$",
  "target": "last_user_message"
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Operators */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Comparison Operators</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            'equals', 'not_equals', 'contains', 'not_contains', 
            'starts_with', 'ends_with', 'greater_than', 'less_than',
            'greater_equal', 'less_equal', 'is_empty', 'not_empty',
            'in_list', 'not_in_list', 'matches_regex'
          ].map((operator) => (
            <div key={operator} className="bg-gray-700 rounded p-2 text-center">
              <code className="text-neon-green text-sm">{operator}</code>
            </div>
          ))}
        </div>
      </div>

      {/* Usage Examples */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Usage Examples</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-medium text-neon-green mb-2">Flow Node Configuration</h4>
            <div className="bg-gray-900 rounded p-4 overflow-x-auto">
              <pre className="text-sm text-gray-300">
{`{
  "conditions": {
    "operator": "AND",
    "rules": [
      {
        "id": "rule_1",
        "type": "contact",
        "field": "blocked",
        "operator": "equals",
        "value": false
      },
      {
        "id": "rule_2",
        "type": "user_input",
        "operator": "contains",
        "value": "help",
        "case_sensitive": false
      }
    ]
  },
  "branches": [
    {
      "name": "all_conditions_met",
      "conditions_met": true,
      "next_node": "help_node"
    },
    {
      "name": "conditions_failed",
      "conditions_met": false,
      "next_node": "fallback_node"
    }
  ]
}`}
              </pre>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium text-neon-green mb-2">Flow Edge Configuration</h4>
            <div className="bg-gray-900 rounded p-4 overflow-x-auto">
              <pre className="text-sm text-gray-300">
{`{
  "condition_type": "condition",
  "condition_config": {
    "conditions": {
      "operator": "OR",
      "rules": [
        {
          "id": "positive_response",
          "type": "user_input",
          "operator": "contains",
          "value": "yes",
          "case_sensitive": false
        },
        {
          "id": "confirmation_intent",
          "type": "intent",
          "intent_name": "confirm",
          "confidence_threshold": 0.7
        }
      ]
    }
  }
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Tips */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Performance Considerations</h3>
        <div className="space-y-2 text-gray-300">
          <p>• <strong>Short-circuit evaluation:</strong> AND conditions stop at the first false, OR conditions stop at the first true</p>
          <p>• <strong>Context access:</strong> Use specific paths instead of broad searches</p>
          <p>• <strong>Regex patterns:</strong> Keep patterns simple and efficient</p>
          <p>• <strong>Time conditions:</strong> Cache timezone calculations when possible</p>
        </div>
      </div>

      {/* Error Handling */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Error Handling</h3>
        <div className="space-y-2 text-gray-300">
          <p>• Invalid regex patterns return <code className="bg-gray-700 px-1 rounded">false</code></p>
          <p>• Missing context variables return <code className="bg-gray-700 px-1 rounded">null</code> and are handled gracefully</p>
          <p>• Type conversion errors in numeric comparisons return <code className="bg-gray-700 px-1 rounded">false</code></p>
          <p>• Invalid time formats return <code className="bg-gray-700 px-1 rounded">false</code></p>
        </div>
      </div>
    </div>
  );
}
