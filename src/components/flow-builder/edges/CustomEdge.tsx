import React from 'react';
import {
  EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
} from 'reactflow';

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  selected,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edgeStyle = {
    ...style,
    stroke: selected ? 'hsl(199, 89%, 48%)' : '#6b7280',
    strokeWidth: selected ? 3 : 2,
  };

  const getConditionLabel = () => {
    const conditionType = data?.condition_type || 'always';
    const label = data?.label;
    
    if (label) {
      return label;
    }
    
    switch (conditionType) {
      case 'always':
        return '';
      case 'condition':
        return 'IF';
      case 'keyword':
        const keywords = data?.condition_config?.keywords || [];
        return keywords.length > 0 ? `"${keywords.join(', ')}"` : 'KEYWORD';
      case 'intent':
        return data?.condition_config?.intent || 'INTENT';
      case 'user_input':
        return data?.condition_config?.expected_input || 'INPUT';
      case 'wait_user_reply':
        return 'WAIT USER REPLY';
      default:
        return conditionType.toUpperCase();
    }
  };

  const displayLabel = getConditionLabel();

  return (
    <>
      <BaseEdge path={edgePath} style={edgeStyle} />
      {displayLabel && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 12,
              pointerEvents: 'all',
            }}
            className={`
              px-2 py-1 rounded text-xs cursor-pointer
              ${selected 
                ? 'bg-neon-green text-black font-medium' 
                : 'bg-secondary text-gray-300 hover:bg-gray-600'
              }
              border border-gray-600 transition-colors
            `}
          >
            {displayLabel}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
