import React from 'react';
import { NodeProps } from 'reactflow';
import BaseNode from './BaseNode';

export default function AINode(props: NodeProps) {
  const { data } = props;

  const icon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );

  return (
    <BaseNode 
      {...props} 
      icon={icon} 
      color="purple-500"
      onSetAsEntry={data.onSetAsEntry}
      isEntryNode={data.isEntryNode}
    >
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">AI Response</div>
        <div className="text-sm text-foreground bg-secondary p-2 rounded max-h-20 overflow-hidden">
          {data.config?.prompt?.slice(0, 200) || 'No prompt configured'}
        </div>
      </div>
    </BaseNode>
  );
}
