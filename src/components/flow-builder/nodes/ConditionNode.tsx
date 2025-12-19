import React from 'react';
import { NodeProps } from 'reactflow';
import BaseNode from './BaseNode';

export default function ConditionNode(props: NodeProps) {
  const { data } = props;

  const icon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  return (
    <BaseNode 
      {...props} 
      icon={icon} 
      color="yellow-500"
      onSetAsEntry={data.onSetAsEntry}
      isEntryNode={data.isEntryNode}
    >
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">Condition</div>
        <div className="text-sm text-foreground bg-secondary p-2 rounded max-h-20 overflow-hidden">
          {data.config?.condition || 'No condition set'}
        </div>
      </div>
    </BaseNode>
  );
}
