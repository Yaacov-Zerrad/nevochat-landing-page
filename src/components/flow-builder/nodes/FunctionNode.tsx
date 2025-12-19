import React from 'react';
import { NodeProps } from 'reactflow';
import BaseNode from './BaseNode';

export default function FunctionNode(props: NodeProps) {
  const { data } = props;

  const icon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
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
        <div className="text-xs text-muted-foreground">Function</div>
        <div className="text-sm text-foreground bg-secondary p-2 rounded">
          {data.config?.function_name || 'No function selected'}
        </div>
      </div>
    </BaseNode>
  );
}
