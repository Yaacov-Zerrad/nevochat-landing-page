import React from 'react';
import { NodeProps, Handle, Position } from 'reactflow';

export default function EndNode(props: NodeProps) {
  const { data, selected } = props;

  return (
    <div
      className={`
        min-w-[150px] bg-gray-800 border-2 rounded-lg shadow-lg
        ${selected ? 'border-red-500 shadow-red-500/50' : 'border-gray-600'}
        transition-all duration-200
      `}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-gray-400 border-2 border-gray-600"
      />

      {/* Node Content */}
      <div className="flex items-center space-x-2 p-3 bg-red-500/20 border-b border-gray-600">
        <div className="text-red-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10l2 2 4-4" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-white font-medium text-sm">{data.label}</h3>
          {data.description && (
            <p className="text-gray-400 text-xs">{data.description}</p>
          )}
        </div>
      </div>

      <div className="p-3">
        <div className="text-xs text-gray-400">End Message</div>
        <div className="text-sm text-white bg-gray-700 p-2 rounded mt-1">
          {data.config?.message || 'Flow completed'}
        </div>
      </div>
    </div>
  );
}
