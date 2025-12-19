import React from 'react';
import { NodeProps } from 'reactflow';
import BaseNode from './BaseNode';

export default function UpdateContactNode(props: NodeProps) {
  const { data } = props;

  const icon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

  const getUpdateSummary = () => {
    const config = data.config || {};
    const updates = [];
    
    if (config.name) updates.push(`Name: ${config.name}`);
    if (config.last_name) updates.push(`Last Name: ${config.last_name}`);
    if (config.email) updates.push(`Email: ${config.email}`);
    if (config.phone_number) updates.push(`Phone: ${config.phone_number}`);
    if (config.location) updates.push(`Location: ${config.location}`);
    if (config.country_code) updates.push(`Country: ${config.country_code}`);
    if (config.identifier) updates.push(`ID: ${config.identifier}`);
    
    const additionalAttrsCount = config.additional_attributes ? Object.keys(config.additional_attributes).length : 0;
    const customAttrsCount = config.custom_attributes ? Object.keys(config.custom_attributes).length : 0;
    
    if (additionalAttrsCount > 0) updates.push(`+${additionalAttrsCount} additional attrs`);
    if (customAttrsCount > 0) updates.push(`+${customAttrsCount} custom attrs`);
    
    return updates.length > 0 ? updates.slice(0, 3).join(', ') + (updates.length > 3 ? '...' : '') : 'No updates configured';
  };

  return (
    <BaseNode 
      {...props} 
      icon={icon} 
      color="teal-500"
      onSetAsEntry={data.onSetAsEntry}
      isEntryNode={data.isEntryNode}
    >
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">Update Contact</div>
        <div className="text-sm text-foreground bg-secondary p-2 rounded max-h-20 overflow-hidden">
          {getUpdateSummary()}
        </div>
      </div>
    </BaseNode>
  );
}