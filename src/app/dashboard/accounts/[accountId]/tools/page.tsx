'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  Plus, 
  Search, 
  Filter, 
  Code, 
  Globe, 
  Check, 
  X, 
  Trash2, 
  Copy,
  Play,
  Settings,
  Store,
  Wrench,
  ChevronRight,
  Edit,
} from 'lucide-react';

import { accountToolAPI, toolTemplateAPI, toolCategoryAPI } from '@/lib/api';
import CreateToolModal from './components/CreateToolModal';
import CreateHTTPToolModal from './components/CreateHTTPToolModal';
import TestToolModal from './components/TestToolModal';
import { useToast } from '@/hooks/useToast';

interface ToolCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  tools_count: number;
}

interface ToolTemplate {
  id: number;
  name: string;
  slug: string;
  description: string;
  tool_type: 'http' | 'python';
  category_name: string;
  is_public: boolean;
  usage_count: number;
}

interface AccountTool {
  id: number;
  name: string;
  description: string;
  tool_type: 'http' | 'python';
  template_name: string | null;
  is_active: boolean;
  variables: Record<string, any>;
  parameters_schema?: {
    type: string;
    properties: Record<string, {
      type: string;
      description: string;
    }>;
    required?: string[];
  };
}

// Convert snake_case to Camel Case for display
const snakeToCamelCase = (str: string): string => {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Denormalize tool name for display (replace underscores with spaces)
const denormalizeToolName = (name: string): string => {
  return name.replace(/_/g, ' ');
};
export default function ToolsPage() {
  const params = useParams();
  const accountId = params?.accountId as string;
  const { data: session } = useSession();
  const { showToast } = useToast();


  // State
  const [activeTab, setActiveTab] = useState<'my-tools' | 'store'>('my-tools');
  const [categories, setCategories] = useState<ToolCategory[]>([]);
  const [templates, setTemplates] = useState<ToolTemplate[]>([]);
  const [myTools, setMyTools] = useState<AccountTool[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [toolTypeFilter, setToolTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateHTTPModal, setShowCreateHTTPModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ToolTemplate | null>(null);
  const [selectedTool, setSelectedTool] = useState<AccountTool | null>(null);
  const [toolToEdit, setToolToEdit] = useState<AccountTool | null>(null);

  // Load data
  useEffect(() => {
    if (session?.accessToken && accountId) {
      loadData();
    }
  }, [session, accountId, activeTab, selectedCategory, toolTypeFilter, loadData]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'store') {
        // Load categories and templates
        const [categoriesData, templatesData] = await Promise.all([
          toolCategoryAPI.list(),
          toolTemplateAPI.list({
            category: selectedCategory || undefined,
            tool_type: toolTypeFilter !== 'all' ? toolTypeFilter : undefined,
          }),
        ]);
        setCategories(categoriesData);
        setTemplates(templatesData);
      } else {
        // Load my tools
        const toolsData = await accountToolAPI.list(session!.accessToken, {
          account: accountId,
          tool_type: toolTypeFilter !== 'all' ? toolTypeFilter : undefined,
        });
        setMyTools(toolsData);
      }
    } catch (error) {
      console.error('Error loading tools:', error);
      showToast('Error loading tools', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedCategory, toolTypeFilter, session, accountId, showToast]);

  const handleCreateFromTemplate = (template: ToolTemplate) => {
    setSelectedTemplate(template);
    setShowCreateModal(true);
  };

  const handleCreateHTTPTool = () => {
    setShowCreateHTTPModal(true);
  };

  const handleTestTool = (tool: AccountTool) => {
    setSelectedTool(tool);
    setShowTestModal(true);
  };

  const handleDeleteTool = async (toolId: number) => {
    if (!confirm('Are you sure you want to delete this tool?')) return;

    try {
      await accountToolAPI.delete(session!.accessToken, toolId);
      showToast('Tool deleted successfully', 'success');
      loadData();
    } catch (error) {
      console.error('Error deleting tool:', error);
      showToast('Error deleting tool', 'error');
    }
  };

  const handleDuplicateTool = async (tool: AccountTool) => {
    const newName = prompt('Enter name for duplicated tool:', `${tool.name} (copy)`);
    if (!newName) return;

    try {
      await accountToolAPI.duplicate(session!.accessToken, tool.id, newName);
      showToast('Tool duplicated successfully', 'success');
      loadData();
    } catch (error) {
      console.error('Error duplicating tool:', error);
      showToast('Error duplicating tool', 'error');
    }
  };

  const handleToggleActive = async (tool: AccountTool) => {
    try {
      await accountToolAPI.update(session!.accessToken, tool.id, {
        is_active: !tool.is_active,
      });
      showToast(`Tool ${tool.is_active ? 'disabled' : 'enabled'}`, 'success');
      loadData();
    } catch (error) {
      console.error('Error updating tool:', error);
      showToast('Error updating tool', 'error');
    }
  };
  const handleEditTool = (tool: AccountTool) => {
    setToolToEdit(tool);
    setShowCreateModal(true);
  };
  // Filter templates by search
  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMyTools = myTools.filter((tool) =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Tools
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage AI tools for your chatbot flows
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCreateHTTPTool}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <Code className="w-4 h-4" />
              <span>Create HTTP Tool</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex items-center gap-4">
          <button
            onClick={() => setActiveTab('my-tools')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'my-tools'
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>My Tools</span>
            <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded-full">
              {myTools.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('store')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'store'
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Tool Store</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>

          {/* Type Filter */}
          <select
            value={toolTypeFilter}
            onChange={(e) => setToolTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Types</option>
            <option value="http">HTTP Tools</option>
            <option value="python">Python Tools</option>
          </select>
        </div>

        {/* Categories (Store only) */}
        {activeTab === 'store' && categories.length > 0 && (
          <div className="mt-3 flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === null
                  ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.slug)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === category.slug
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
                <span className="text-xs opacity-60">({category.tools_count})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400">Loading...</div>
          </div>
        ) : (
          <>
            {activeTab === 'store' ? (
              <TemplateStoreView
                templates={filteredTemplates}
                onCreateFromTemplate={handleCreateFromTemplate}
              />
            ) : (
              <MyToolsView
                tools={filteredMyTools}
                onTest={handleTestTool}
                onEdit={handleEditTool}
                onDelete={handleDeleteTool}
                onDuplicate={handleDuplicateTool}
                onToggleActive={handleToggleActive}
              />
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (selectedTemplate || toolToEdit) && (
        <CreateToolModal
          template={selectedTemplate}
          existingTool={toolToEdit}
          accountId={accountId}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedTemplate(null);
            setToolToEdit(null);
          }}
          onSuccess={() => {
            loadData();
            setShowCreateModal(false);
            setSelectedTemplate(null);
            setToolToEdit(null);
          }}
        />
      )}

      {showCreateHTTPModal && (
        <CreateHTTPToolModal
          accountId={accountId}
          onClose={() => setShowCreateHTTPModal(false)}
          onSuccess={() => {
            loadData();
            setShowCreateHTTPModal(false);
          }}
        />
      )}

      {showTestModal && selectedTool && (
        <TestToolModal
          tool={selectedTool}
          onClose={() => {
            setShowTestModal(false);
            setSelectedTool(null);
          }}
        />
      )}
    </div>
  );
}

// Template Store View
function TemplateStoreView({
  templates,
  onCreateFromTemplate,
}: {
  templates: ToolTemplate[];
  onCreateFromTemplate: (template: ToolTemplate) => void;
}) {
  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <Store className="w-12 h-12 mx-auto text-gray-400 mb-3" />
        <p className="text-gray-500 dark:text-gray-400">No templates found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template) => (
        <div
          key={template.id}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {template.tool_type === 'http' ? (
                <Globe className="w-5 h-5 text-green-500" />
              ) : (
                <Code className="w-5 h-5 text-blue-500" />
              )}
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {template.tool_type === 'python' ? snakeToCamelCase(template.name) : denormalizeToolName(template.name)}
              </h3>
            </div>
            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400">
              {template.tool_type.toUpperCase()}
            </span>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {template.description}
          </p>

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
            <span>{template.category_name}</span>
            <span>{template.usage_count} uses</span>
          </div>

          <button
            onClick={() => onCreateFromTemplate(template)}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Use Template</span>
          </button>
        </div>
      ))}
    </div>
  );
}

// My Tools View
function MyToolsView({
  tools,
  onTest,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleActive,
}: {
  tools: AccountTool[];
  onTest: (tool: AccountTool) => void;
  onEdit: (tool: AccountTool) => void;
  onDelete: (toolId: number) => void;
  onDuplicate: (tool: AccountTool) => void;
  onToggleActive: (tool: AccountTool) => void;
}) {
  if (tools.length === 0) {
    return (
      <div className="text-center py-12">
        <Wrench className="w-12 h-12 mx-auto text-gray-400 mb-3" />
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          No tools yet. Create your first tool from a template or create a custom HTTP tool.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tools.map((tool) => (
        <div
          key={tool.id}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {tool.tool_type === 'http' ? (
                  <Globe className="w-5 h-5 text-green-500" />
                ) : (
                  <Code className="w-5 h-5 text-blue-500" />
                )}
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {tool && tool?.tool_type === 'python' ? snakeToCamelCase(tool.name) : denormalizeToolName(tool.name)}
                </h3>
                {tool.template_name && (
                  <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full">
                    from {tool.template_name}
                  </span>
                )}
                <button
                  onClick={() => onToggleActive(tool)}
                  className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${
                    tool.is_active
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {tool.is_active ? 'Active' : 'Inactive'}
                </button>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {tool.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onTest(tool)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>Test</span>
            </button>

            <button
              onClick={() => onEdit(tool)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>

            <button
              onClick={() => onDuplicate(tool)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <Copy className="w-4 h-4" />
              <span>Duplicate</span>
            </button>

            <button
              onClick={() => onDelete(tool.id)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors ml-auto"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
