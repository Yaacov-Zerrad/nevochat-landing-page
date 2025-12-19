import React from 'react';
import { NodeProps } from 'reactflow';
import BaseNode from './BaseNode';

export default function DelayNode(props: NodeProps) {
  const { data } = props;

  const icon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const getDelayInfo = () => {
    const config = data.config || {};
    const blocking = config.blocking !== false; // default to true
    const timingMode = config.timing_mode || 'fixed_delay';
    const seconds = config.seconds || config.delay_seconds || 1;

    let timeDisplay = '';
    let typeDisplay = '';

    // Determine time display
    if (timingMode === 'absolute_date') {
      timeDisplay = config.execute_at || 'At specific time';
    } else {
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      
      if (hours > 0) {
        timeDisplay = `${hours}h ${mins}m`;
      } else if (mins > 0) {
        timeDisplay = `${mins}m ${secs}s`;
      } else {
        timeDisplay = `${secs}s`;
      }
    }

    // Determine type display
    if (!blocking) {
      if (timingMode === 'delay_from_last_message') {
        typeDisplay = 'Non-blocking (Resets)';
      } else if (timingMode === 'absolute_date') {
        typeDisplay = 'Non-blocking (Scheduled)';
      } else {
        typeDisplay = 'Non-blocking';
      }
    } else {
      typeDisplay = 'Blocking';
    }

    return { timeDisplay, typeDisplay };
  };

  const { timeDisplay, typeDisplay } = getDelayInfo();

  return (
    <BaseNode 
      {...props} 
      icon={icon} 
      color={data.config?.blocking !== false ? "pink-500" : "purple-500"}
      onSetAsEntry={data.onSetAsEntry}
      isEntryNode={data.isEntryNode}
    >
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">Delay</div>
        <div className="text-sm text-foreground bg-secondary p-2 rounded">
          <div className="font-medium">{timeDisplay}</div>
          <div className="text-xs text-gray-300 mt-1">{typeDisplay}</div>
        </div>
      </div>
    </BaseNode>
  );
}
