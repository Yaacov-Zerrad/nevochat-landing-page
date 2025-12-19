import React from 'react';
import { NodeProps } from 'reactflow';
import BaseNode from './BaseNode';

export default function WebhookNode(props: NodeProps) {
  const { data } = props;

  const icon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
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
        <div className="text-xs text-muted-foreground">Webhook</div>
        <div className="text-sm text-foreground bg-secondary p-2 rounded">
          {data.config?.method || 'POST'} {data.config?.url || 'No URL set'}
        </div>
      </div>
    </BaseNode>
  );
}
