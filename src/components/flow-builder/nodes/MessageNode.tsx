import React from 'react';
import { NodeProps } from 'reactflow';
import BaseNode from './BaseNode';

export default function MessageNode(props: NodeProps) {
  const { data } = props;

  const icon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.98L3 21l1.98-5.874A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
    </svg>
  );

  return (
    <BaseNode 
      {...props} 
      icon={icon} 
      color="blue-500"
      onSetAsEntry={data.onSetAsEntry}
      isEntryNode={data.isEntryNode}
    >
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">Message</div>
        <div className="text-sm text-foreground bg-secondary p-2 rounded max-h-20 overflow-hidden">
          {data.config?.message || 'No message configured'}
        </div>
      </div>
    </BaseNode>
  );
}
