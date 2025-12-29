import React from 'react';
import { NodeProps } from 'reactflow';
import BaseNode from './BaseNode';

export default function NotifyAgentsNode(props: NodeProps) {
  const { data } = props;

  const icon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );

  return (
    <BaseNode 
      {...props} 
      icon={icon} 
      color="orange-500"
      onSetAsEntry={data.onSetAsEntry}
      isEntryNode={data.isEntryNode}
    >
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">Notify Agents</div>
        <div className="text-sm text-foreground bg-secondary p-2 rounded max-h-20 overflow-hidden">
          {data.config?.message || 'No message configured'}
        </div>
      </div>
    </BaseNode>
  );
}
