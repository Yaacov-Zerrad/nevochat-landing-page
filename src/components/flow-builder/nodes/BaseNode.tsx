import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface BaseNodeProps extends NodeProps {
  icon: React.ReactNode;
  color: string;
  children?: React.ReactNode;
  onSetAsEntry?: (nodeId: string) => void;
  isEntryNode?: boolean;
}

export default function BaseNode({ data, selected, icon, color, children, onSetAsEntry, isEntryNode }: BaseNodeProps) {
  const borderClass = selected ? `border-neon-green shadow-neon-green/50` : 'border-gray-600';
  const headerClass = `bg-neon-green/20`;
  const iconClass = 'text-neon-green';
  
  const handleSetAsEntry = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSetAsEntry && data.nodeId) {
      onSetAsEntry(data.nodeId);
    }
  };

  return (
    <div
      className={`
        min-w-[200px] bg-gray-800 border-2 rounded-lg shadow-lg relative
        ${borderClass}
        ${isEntryNode ? 'ring-2 ring-yellow-400' : ''}
        transition-all duration-200
      `}
    >
      {/* Entry Node Indicator */}
      {isEntryNode && (
        <div className="absolute -top-2 -left-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded-full font-bold">
          START
        </div>
      )}

      {/* Entry Node Button */}
      {!isEntryNode && (
        <button
          onClick={handleSetAsEntry}
          className="absolute -top-2 -right-2 bg-gray-600 hover:bg-yellow-400 hover:text-black text-white text-xs px-2 py-1 rounded-full transition-colors"
          title="Set as entry node"
        >
          SET START
        </button>
      )}

      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-gray-400 border-2 border-gray-600"
      />

      {/* Node Header */}
      <div className={`flex items-center space-x-2 p-3 ${headerClass} border-b border-gray-600`}>
        <div className={iconClass}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-white font-medium text-sm">{data.label}</h3>
          {data.description && (
            <p className="text-gray-400 text-xs">{data.description}</p>
          )}
        </div>
      </div>

      {/* Node Content */}
      {children && (
        <div className="p-3">
          {children}
        </div>
      )}

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-gray-400 border-2 border-gray-600"
      />
    </div>
  );
}
