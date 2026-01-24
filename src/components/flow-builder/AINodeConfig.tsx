import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { accountToolAPI, AccountTool } from '@/lib/api';

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: string;
  onSave: (prompt: string) => void;
}

interface AINodeConfigProps {
  config: any;
  updateConfig: (key: string, value: any) => void;
}

function PromptModal({ isOpen, onClose, prompt, onSave }: PromptModalProps) {
  const [localPrompt, setLocalPrompt] = useState(prompt);

  // Function to detect if text contains Hebrew characters
  const hasHebrew = (text: string) => {
    const hebrewRegex = /[\u0590-\u05FF]/;
    return hebrewRegex.test(text);
  };

  // Function to get text direction based on content
  const getTextDirection = (text: string) => {
    const lines = text.split('\n');
    const currentLine = text.substring(0, text.lastIndexOf('\n') + 1).split('\n').length - 1;
    return hasHebrew(lines[currentLine] || '') ? 'rtl' : 'ltr';
  };

  const handleSave = () => {
    onSave(localPrompt);
    onClose();
  };

  const handleCancel = () => {
    setLocalPrompt(prompt); // Reset to original value
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 9999 }}>
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Edit AI Prompt</h3>
          <button
            onClick={handleCancel}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            AI Prompt
          </label>
          <textarea
            value={localPrompt}
            onChange={(e) => setLocalPrompt(e.target.value)}
            rows={12}
            dir="auto"
            style={{ unicodeBidi: 'plaintext' }}
            className="w-full bg-secondary border border-gray-600 rounded-lg px-3 py-2 text-foreground focus:border-neon-green focus:outline-none resize-none"
            placeholder="Enter your AI prompt here..."
          />
          <div className="mt-2 text-xs text-muted-foreground">
            Character count: {localPrompt.length}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-foreground rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20 hover:border-neon-green/40 rounded-lg transition-colors"
          >
            Save Prompt
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function AINodeConfig({ config, updateConfig }: AINodeConfigProps) {
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [availableTools, setAvailableTools] = useState<AccountTool[]>([]);
  const [loadingTools, setLoadingTools] = useState(false);
  const { data: session } = useSession();
  const params = useParams();
  const accountId = params?.accountId as string;

  // Load available tools for this account
  useEffect(() => {
    const loadTools = async () => {
      if (!session?.accessToken || !accountId) return;

      setLoadingTools(true);
      try {
        const tools = await accountToolAPI.list(session.accessToken, {
          account: parseInt(accountId),
          is_enabled: true,
        });
        setAvailableTools(tools);
      } catch (error) {
        console.error('Error loading tools:', error);
      } finally {
        setLoadingTools(false);
      }
    };

    loadTools();
  }, [session, accountId]);

  const handlePromptSave = (newPrompt: string) => {
    updateConfig('prompt', newPrompt);
  };

  const handleToolToggle = (toolName: string) => {
    const currentTools = config.enabled_tools || [];
    const isSelected = currentTools.includes(toolName);

    if (isSelected) {
      // Remove tool
      updateConfig(
        'enabled_tools',
        currentTools.filter((name: string) => name !== toolName)
      );
    } else {
      // Add tool
      updateConfig('enabled_tools', [...currentTools, toolName]);
    }
  };

  const getPromptPreview = (prompt: string) => {
    if (!prompt) return 'Click to add AI prompt...';
    if (prompt.length <= 100) return prompt;
    return prompt.substring(0, 100) + '...';
  };

  return (
    <div className="space-y-4">
      {/* Prompt Section */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          AI Prompt
        </label>
        <div
          onClick={() => setIsPromptModalOpen(true)}
          className="w-full bg-secondary border border-gray-600 rounded-lg px-3 py-3 text-foreground hover:border-neon-green cursor-pointer transition-colors min-h-[80px] flex items-start"
        >
          <div className="flex-1">
            <div className={`${config.prompt ? 'text-foreground' : 'text-muted-foreground'}`}>
              {getPromptPreview(config.prompt || '')}
            </div>
            {config.prompt && (
              <div className="text-xs text-muted-foreground mt-2">
                {config.prompt.length} characters - Click to edit
              </div>
            )}
          </div>
          <div className="ml-2 text-muted-foreground">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Model Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Model
        </label>
        <select
          value={config.model || 'gpt-4o-mini'}
          onChange={(e) => updateConfig('model', e.target.value)}
          className="w-full bg-secondary border border-gray-600 rounded-lg px-3 py-2 text-foreground focus:border-neon-green focus:outline-none"
        >
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          <option value="gpt-4o-mini">GPT-4o Mini</option>
          <option value="gpt-4o">GPT-4o</option>
          <option value="gpt-4.1-mini">GPT-4.1 Mini</option>
          <option value="gpt-4.1">GPT-4.1</option>
          <option value="gpt-4">GPT-4</option>
          <option value="claude-3">Claude 3</option>
        </select>
      </div>

      {/* Temperature */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Temperature
        </label>
        <select
          value={config.temperature || '0.7'}
          onChange={(e) => updateConfig('temperature', e.target.value)}
          className="w-full bg-secondary border border-gray-600 rounded-lg px-3 py-2 text-foreground focus:border-neon-green focus:outline-none"
        >
          <option value="0.1">0.1</option>
          <option value="0.2">0.2</option>
          <option value="0.3">0.3</option>
          <option value="0.4">0.4</option>
          <option value="0.5">0.5</option>
          <option value="0.7">0.7</option>
          <option value="1.0">1.0</option>
        </select>
      </div>

      {/* Tools Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Available Tools
        </label>
        <div className="text-xs text-gray-400 mb-2">
          Select which tools the AI can use in this node
        </div>

        {loadingTools ? (
          <div className="text-sm text-gray-400 py-4 text-center">
            Loading tools...
          </div>
        ) : availableTools.length === 0 ? (
          <div className="bg-secondary border border-gray-600 rounded-lg px-3 py-3 text-sm text-gray-400">
            No tools available.{' '}
            <a
              href={`/dashboard/accounts/${accountId}/tools`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Create tools
            </a>
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto bg-secondary border border-gray-600 rounded-lg p-3">
            {availableTools.map((tool) => {
              const isSelected = (config.enabled_tools || []).includes(tool.name);
              
              return (
                <label
                  key={tool.id}
                  className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-primary/10 border border-primary/30'
                      : 'bg-gray-700 hover:bg-gray-600 border border-transparent'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToolToggle(tool.name)}
                    className="mt-1 rounded border-gray-500 text-primary focus:ring-primary focus:ring-offset-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground text-sm">
                        {tool.name}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          tool.tool_type === 'http'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-purple-500/20 text-purple-400'
                        }`}
                      >
                        {tool.tool_type.toUpperCase()}
                      </span>
                    </div>
                    {tool.description && (
                      <p className="text-xs text-gray-400 mt-1">
                        {tool.description}
                      </p>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        )}

        {availableTools.length > 0 && (
          <div className="mt-2 text-xs text-gray-400">
            {(config.enabled_tools || []).length} tool(s) selected
          </div>
        )}
      </div>

      {/* Prompt Modal */}
      <PromptModal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        prompt={config.prompt || ''}
        onSave={handlePromptSave}
      />
    </div>
  );
}
