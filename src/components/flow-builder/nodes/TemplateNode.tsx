import React from 'react';
import { NodeProps } from 'reactflow';
import BaseNode from './BaseNode';

export default function TemplateNode(props: NodeProps) {
  const { data } = props;

  const icon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  const getTemplateDisplay = () => {
    const config = data.config || {};
    const templateName = config.template_name || 'No template selected';
    const messagingServiceSid = config.messaging_service_sid;
    
    return (
      <div className="space-y-1">
        <div className="text-xs text-gray-400">Template</div>
        <div className="text-sm text-white font-medium truncate">
          {templateName}
        </div>
        {messagingServiceSid && (
          <div className="text-xs text-gray-500 truncate">
            Service: {messagingServiceSid.slice(-8)}...
          </div>
        )}
        {config.variables && Object.keys(config.variables).length > 0 && (
          <div className="text-xs text-blue-400">
            {Object.keys(config.variables).length} variable(s)
          </div>
        )}
      </div>
    );
  };

  return (
    <BaseNode 
      {...props} 
      icon={icon} 
      color="cyan-500"
      onSetAsEntry={data.onSetAsEntry}
      isEntryNode={data.isEntryNode}
    >
      <div className="space-y-2">
        {getTemplateDisplay()}
      </div>
    </BaseNode>
  );
}
