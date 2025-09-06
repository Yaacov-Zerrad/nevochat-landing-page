import React from 'react';
import { NodeProps } from 'reactflow';
import BaseNode from './BaseNode';

export default function InputNode(props: NodeProps) {
  const { data } = props;

  const icon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  );

  return (
    <BaseNode 
      {...props} 
      icon={icon} 
      color="indigo-500"
      onSetAsEntry={data.onSetAsEntry}
      isEntryNode={data.isEntryNode}
    >
      <div className="space-y-2">
        <div className="text-xs text-gray-400">User Input</div>
        <div className="text-sm text-white bg-gray-700 p-2 rounded">
          {data.config?.input_type || 'text'} input
        </div>
      </div>
    </BaseNode>
  );
}
