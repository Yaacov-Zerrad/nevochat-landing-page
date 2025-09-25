import React from 'react';

interface NodeSidebarProps {
  onAddNode: (nodeType: string) => void;
}

const nodeTypes = [
  {
    type: 'message',
    label: 'Message',
    description: 'Send a message to the user',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.98L3 21l1.98-5.874A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
      </svg>
    ),
    color: 'blue',
  },
  {
    type: 'ai',
    label: 'AI Response',
    description: 'Generate AI response',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    color: 'purple',
  },
  {
    type: 'input',
    label: 'User Input',
    description: 'Collect user input',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
    color: 'indigo',
  },
  {
    type: 'condition',
    label: 'Condition',
    description: 'Branch based on condition',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'yellow',
  },
  {
    type: 'function',
    label: 'Function',
    description: 'Execute a function',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    color: 'green',
  },
  {
    type: 'webhook',
    label: 'Webhook',
    description: 'Call external webhook',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    color: 'orange',
  },
  {
    type: 'delay',
    label: 'Delay',
    description: 'Add blocking/non-blocking delays',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'pink',
  },
  {
    type: 'template',
    label: 'Template',
    description: 'Send a Twilio template message',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    color: 'cyan',
  },
  {
    type: 'update_contact',
    label: 'Update Contact',
    description: 'Update contact information',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    color: 'teal',
  },
  {
    type: 'end',
    label: 'End Flow',
    description: 'End the conversation',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10l2 2 4-4" />
      </svg>
    ),
    color: 'red',
  },
];

export default function NodeSidebar({ onAddNode }: NodeSidebarProps) {
  const handleDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="p-4 h-full overflow-y-auto">
      <h3 className="text-white font-semibold mb-4">Add Nodes</h3>
      
      <div className="space-y-2">
        {nodeTypes.map((nodeType) => (
          <div
            key={nodeType.type}
            className={`
              flex items-center space-x-3 p-3 rounded-lg cursor-pointer
              bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600
              hover:border-${nodeType.color}-500/50 transition-all
            `}
            draggable
            onDragStart={(e) => handleDragStart(e, nodeType.type)}
            onClick={() => onAddNode(nodeType.type)}
          >
            <div className={`text-${nodeType.color}-500`}>
              {nodeType.icon}
            </div>
            <div className="flex-1">
              <div className="text-white text-sm font-medium">
                {nodeType.label}
              </div>
              <div className="text-gray-400 text-xs">
                {nodeType.description}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-4 border-t border-gray-600">
        <h4 className="text-white font-medium mb-2">Tips</h4>
        <ul className="text-gray-400 text-xs space-y-1">
          <li>• Drag nodes to canvas</li>
          <li>• Click to select and edit</li>
          <li>• Connect nodes with edges</li>
          <li>• Use Ctrl+S to save</li>
        </ul>
      </div>
    </div>
  );
}
