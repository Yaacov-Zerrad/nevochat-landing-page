import React from 'react';

interface DelayPresetsProps {
  onApplyPreset: (config: any) => void;
}

const presets = [
  {
    name: "Simple Delay",
    description: "5 minute blocking delay",
    config: {
      seconds: 300,
      blocking: true,
      timing_mode: "fixed_delay"
    }
  },
  {
    name: "Non-blocking Reminder",
    description: "Send reminder after 1 hour, continue flow",
    config: {
      seconds: 3600,
      blocking: false,
      timing_mode: "fixed_delay",
      scheduled_action: {
        type: "message",
        content: "Don't forget about our conversation!"
      }
    }
  },
  {
    name: "Inactivity Check",
    description: "Ask if user needs help after 30min of silence",
    config: {
      seconds: 1800,
      blocking: false,
      timing_mode: "delay_from_last_message",
      reset_on_user_response: true,
      cancel_on_user_response: false,
      scheduled_action: {
        type: "message",
        content: "Are you still there? Do you need any help?"
      }
    }
  },
  {
    name: "Appointment Reminder",
    description: "Remind user 1 hour before appointment",
    config: {
      blocking: false,
      timing_mode: "absolute_date",
      execute_at: "{{context.appointment_datetime_minus_1h}}",
      timezone: "Europe/Paris",
      scheduled_action: {
        type: "message",
        content: "Reminder: Your appointment is in 1 hour at {{context.appointment_time}}"
      }
    }
  },
  {
    name: "Follow-up Sequence",
    description: "Send follow-up after 24 hours, continue to next step",
    config: {
      seconds: 86400,
      blocking: false,
      timing_mode: "fixed_delay",
      scheduled_action: {
        type: "continue_flow"
      }
    }
  }
];

export default function DelayPresets({ onApplyPreset }: DelayPresetsProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-foreground">Quick Presets</h4>
      <div className="space-y-2">
        {presets.map((preset, index) => (
          <div 
            key={index}
            className="bg-secondary p-3 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors cursor-pointer"
            onClick={() => onApplyPreset(preset.config)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h5 className="font-medium text-foreground text-sm">{preset.name}</h5>
                <p className="text-xs text-muted-foreground mt-1">{preset.description}</p>
              </div>
              <svg className="w-4 h-4 text-muted-foreground hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
