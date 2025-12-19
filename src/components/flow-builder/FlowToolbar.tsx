import React from 'react';
import { Node } from 'reactflow';

interface FlowToolbarProps {
  onSave: () => void;
  onDeleteNode: () => void;
  selectedNode: Node | null;
  saving: boolean;
}

export default function FlowToolbar({ onSave, onDeleteNode, selectedNode, saving }: FlowToolbarProps) {
  return (
    <div className="flex items-center space-x-2 p-2 glass glass-border rounded-lg border border-primary/20">
      {/* Save Button */}
      <button
        onClick={onSave}
        disabled={saving}
        className={`
          px-3 py-2 rounded-md text-sm font-medium transition-colors
          ${saving 
            ? 'bg-gray-600 text-muted-foreground cursor-not-allowed' 
            : 'bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20 hover:border-neon-green/40'
          }
        `}
        title="Save Flow (Ctrl+S)"
      >
        {saving ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            <span>Saving...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>Save</span>
          </div>
        )}
      </button>

      {/* Delete Node Button */}
      {selectedNode && (
        <button
          onClick={onDeleteNode}
          className="px-3 py-2 rounded-md text-sm font-medium bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20 hover:border-red-500/40 transition-colors"
          title="Delete Selected Node (Delete)"
        >
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Delete</span>
          </div>
        </button>
      )}

      {/* Zoom Controls */}
      <div className="flex items-center space-x-1 ml-4">
        <button
          className="p-2 rounded-md bg-secondary hover:bg-gray-600 text-gray-300 transition-colors"
          title="Zoom to Fit"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>

      {/* Node Info */}
      {selectedNode && (
        <div className="ml-4 px-3 py-2 bg-secondary/50 rounded-md">
          <div className="text-xs text-muted-foreground">Selected:</div>
          <div className="text-sm text-foreground font-medium">
            {selectedNode.data.label}
          </div>
        </div>
      )}
    </div>
  );
}
