import React from 'react';

export default function DelayDocumentation() {
  return (
    <div className="space-y-6 text-sm">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Delay Node Configuration</h3>
        <p className="text-gray-300 mb-4">
          Delay nodes can pause flow execution or schedule future actions. Choose between blocking and non-blocking modes.
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-secondary p-4 rounded-lg border border-gray-600">
          <h4 className="font-medium text-foreground mb-2">🚫 Blocking Delay</h4>
          <p className="text-gray-300 mb-2">
            Traditional delay that stops the flow execution and waits for the specified time.
          </p>
          <div className="bg-gray-800 p-3 rounded text-xs text-gray-300 font-mono">
            User Message → Delay (5min) → [WAIT] → Next Node
          </div>
        </div>

        <div className="bg-secondary p-4 rounded-lg border border-gray-600">
          <h4 className="font-medium text-foreground mb-2">⚡ Non-blocking Delay</h4>
          <p className="text-gray-300 mb-2">
            Schedules future actions in the background while the flow continues immediately.
          </p>
          <div className="bg-gray-800 p-3 rounded text-xs text-gray-300 font-mono">
            User Message → Delay (5min) → Next Node (immediate)<br />
            {"                ↓"}<br />
            {"    [Background Task] → Action (after 5min)"}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-foreground">Timing Modes</h4>
        
        <div className="space-y-3">
          <div className="bg-blue-900/30 p-3 rounded border border-blue-700">
            <h5 className="font-medium text-blue-300 mb-1">Fixed Delay</h5>
            <p className="text-gray-300 text-xs">
              Simple delay for a fixed amount of time. Good for standard follow-ups.
            </p>
          </div>

          <div className="bg-purple-900/30 p-3 rounded border border-purple-700">
            <h5 className="font-medium text-purple-300 mb-1">Reset on User Message</h5>
            <p className="text-gray-300 text-xs mb-2">
              Delay timer resets every time the user sends a message. Perfect for inactivity reminders.
            </p>
            <div className="bg-gray-800 p-2 rounded text-xs text-gray-300 font-mono">
              {"User message → Delay 5min"}<br />
              {"User message again → Delay resets to 5min"}<br />
              {"(After 5min of silence) → Action"}
            </div>
          </div>

          <div className="bg-green-900/30 p-3 rounded border border-green-700">
            <h5 className="font-medium text-green-300 mb-1">Absolute Date/Time</h5>
            <p className="text-gray-300 text-xs mb-2">
              Execute at a specific date and time. Great for appointment reminders.
            </p>
            <div className="bg-gray-800 p-2 rounded text-xs text-gray-300 font-mono">
              {"Execute at: {{context.appointment_datetime}}"}<br />
              {"or: 2024-12-25T10:00:00"}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-foreground">Template Variables</h4>
        <p className="text-gray-300 text-xs mb-3">
          Use context variables in your delay configuration:
        </p>
        
        <div className="bg-gray-800 p-3 rounded space-y-2">
          <div className="text-xs">
            <span className="text-blue-300">{`{{context.appointment_datetime}}`}</span>
            <span className="text-gray-300"> - Appointment date and time</span>
          </div>
          <div className="text-xs">
            <span className="text-blue-300">{`{{context.user_timezone}}`}</span>
            <span className="text-gray-300"> - User&apos;s timezone</span>
          </div>
          <div className="text-xs">
            <span className="text-blue-300">{`{{contact.name}}`}</span>
            <span className="text-gray-300"> - Contact name</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-foreground">Use Cases</h4>
        
        <div className="space-y-3 text-xs">
          <div className="bg-gray-800 p-3 rounded">
            <h5 className="text-foreground mb-1">📅 Appointment Reminder</h5>
            <p className="text-gray-300 mb-2">Send reminder 1 hour before appointment</p>
            <div className="text-blue-300 font-mono">
              Timing: Absolute Date<br />
              Execute at: {`{{context.appointment_datetime_minus_1h}}`}
            </div>
          </div>

          <div className="bg-gray-800 p-3 rounded">
            <h5 className="text-foreground mb-1">💬 Inactivity Follow-up</h5>
            <p className="text-gray-300 mb-2">Ask if user needs help after 30min of silence</p>
            <div className="text-blue-300 font-mono">
              Timing: Reset on User Message<br />
              Delay: 30 minutes<br />
              Reset on response: Yes
            </div>
          </div>

          <div className="bg-gray-800 p-3 rounded">
            <h5 className="text-foreground mb-1">🔄 Follow-up Sequence</h5>
            <p className="text-gray-300 mb-2">Multiple follow-ups at different intervals</p>
            <div className="text-blue-300 font-mono">
              Delay 1 day → Message → Delay 3 days → Message → End
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-900/30 border border-yellow-700 p-4 rounded">
        <h4 className="font-medium text-yellow-300 mb-2">⚠️ Important Notes</h4>
        <ul className="space-y-1 text-xs text-gray-300">
          <li>• Non-blocking delays continue the flow immediately</li>
          <li>• Template variables are resolved when the delay is scheduled</li>
          <li>• Absolute dates should be in ISO format or use template variables</li>
          <li>• Dynamic delays reset their timer on each user message</li>
          <li>• Scheduled actions execute by continuing the flow from the next node</li>
        </ul>
      </div>
    </div>
  );
}
