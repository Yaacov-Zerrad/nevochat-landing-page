'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ReactFlow, {
  Node,
  Edge,
  Connection,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  ReactFlowProvider,
  NodeTypes,
  EdgeTypes,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { flowAPI } from '@/lib/api';
import { ChatbotFlow } from '@/types/flow';
import { useAccount } from '@/contexts/AccountContext';

// Import custom nodes
import MessageNode from '@/components/flow-builder/nodes/MessageNode';
import AINode from '@/components/flow-builder/nodes/AINode';
import FunctionNode from '@/components/flow-builder/nodes/FunctionNode';
import ConditionNode from '@/components/flow-builder/nodes/ConditionNode';
import InputNode from '@/components/flow-builder/nodes/InputNode';
import WebhookNode from '@/components/flow-builder/nodes/WebhookNode';
import DelayNode from '@/components/flow-builder/nodes/DelayNode';
import EndNode from '@/components/flow-builder/nodes/EndNode';
import TemplateNode from '@/components/flow-builder/nodes/TemplateNode';

// Import custom edges
import CustomEdge from '@/components/flow-builder/edges/CustomEdge';

// Import sidebar and toolbar
import NodeSidebar from '@/components/flow-builder/NodeSidebar';
import FlowToolbar from '@/components/flow-builder/FlowToolbar';
import NodePropertiesPanel from '@/components/flow-builder/NodePropertiesPanel';
import EdgePropertiesPanel from '@/components/flow-builder/EdgePropertiesPanel';

const nodeTypes: NodeTypes = {
  message: MessageNode,
  ai: AINode,
  function: FunctionNode,
  condition: ConditionNode,
  input: InputNode,
  webhook: WebhookNode,
  delay: DelayNode,
  end: EndNode,
  template: TemplateNode,
};

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

function FlowBuilderContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const accountId = params.accountId as string;
  const flowId = searchParams.get('flowId');
  const { fetchAccountById } = useAccount();

  // Flow state
  const [flow, setFlow] = useState<ChatbotFlow | null>(null);
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ReactFlow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // UI state
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [showNodeSidebar, setShowNodeSidebar] = useState(true);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Node ID counter for new nodes
  const [nodeIdCounter, setNodeIdCounter] = useState(1);

  // Set entry node
  const setEntryNode = useCallback((nodeId: string) => {
    // Update flow state
    setFlow(prev => prev ? { ...prev, entry_node: nodeId } : prev);
    
    // Update all nodes to reflect the new entry node
    setNodes((nodes) => 
      nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isEntryNode: node.id === nodeId
        }
      }))
    );
  }, [setNodes]);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        id: `edge-${Date.now()}`,
        type: 'custom',
        data: {
          condition_type: 'always',
          condition_config: {},
          label: '',
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
    setShowPropertiesPanel(true);
  }, []);

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
    setShowPropertiesPanel(true);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
    setShowPropertiesPanel(false);
  }, []);

  // Load account data
  const fetchAccount = useCallback(async () => {
    try {
      const accountData = await fetchAccountById(parseInt(accountId));
      setAccount(accountData);
    } catch (error) {
      console.error('Failed to fetch account:', error);
      setError('Failed to load account');
    }
  }, [accountId, fetchAccountById]);

  // Load flow data
  const loadFlow = useCallback(async () => {
    if (!flowId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch flow details
      const flowData = await flowAPI.getFlow(parseInt(flowId));
      setFlow(flowData);

      // Fetch nodes and edges
      const [nodesData, edgesData] = await Promise.all([
        flowAPI.getFlowNodes(parseInt(flowId)),
        flowAPI.getFlowEdges(parseInt(flowId))
      ]);

      // Convert backend data to ReactFlow format
      const reactFlowNodes = nodesData.map((node: any) => ({
        id: node.node_id,
        type: node.node_type,
        position: { x: node.position_x, y: node.position_y },
        data: {
          label: node.label,
          description: node.description,
          config: node.config,
          nodeType: node.node_type,
          nodeId: node.node_id, // Add nodeId for entry node functionality
          dbId: node.id, // Store database ID for updates
          isEntryNode: flowData.entry_node === node.node_id, // Check if this is the entry node
          onSetAsEntry: (nodeId: string) => {
            setFlow(prev => prev ? { ...prev, entry_node: nodeId } : prev);
            setNodes((nodes) => 
              nodes.map((n) => ({
                ...n,
                data: {
                  ...n.data,
                  isEntryNode: n.id === nodeId
                }
              }))
            );
          },
        },
      }));

      const reactFlowEdges = edgesData.map((edge: any) => {
        // Find corresponding nodes to get their node_ids
        const sourceNode = nodesData.find((n: any) => n.id === edge.source_node);
        const targetNode = nodesData.find((n: any) => n.id === edge.target_node);
        
        return {
          id: edge.edge_id,
          source: sourceNode ? sourceNode.node_id : `node-${edge.source_node}`,
          target: targetNode ? targetNode.node_id : `node-${edge.target_node}`,
          sourceHandle: edge.source_handle,
          targetHandle: edge.target_handle,
          type: 'custom',
          data: {
            condition_type: edge.condition_type,
            condition_config: edge.condition_config,
            label: edge.label,
            style: edge.style,
            priority: edge.priority,
            dbId: edge.id, // Store database ID for updates
          },
        };
      });

      setNodes(reactFlowNodes);
      setEdges(reactFlowEdges);

      // Update node counter based on existing nodes
      const maxNodeNumber = Math.max(
        0,
        ...reactFlowNodes
          .map((node: any) => node.id.match(/node-(\d+)/)?.[1])
          .filter(Boolean)
          .map(Number)
      );
      setNodeIdCounter(maxNodeNumber + 1);

    } catch (error) {
      console.error('Failed to load flow:', error);
      setError('Failed to load flow data');
    } finally {
      setLoading(false);
    }
  }, [flowId, setNodes, setEdges]);

  // Add new node
  const addNode = useCallback((nodeType: string) => {
    const newNodeId = `node-${nodeIdCounter}`;
    const newNode: Node = {
      id: newNodeId,
      type: nodeType,
      position: { x: 100, y: 100 },
      data: {
        label: `${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} Node`,
        description: '',
        config: {},
        nodeType,
        nodeId: newNodeId, // Add nodeId for entry node functionality
        isEntryNode: false, // New nodes are not entry nodes by default
        onSetAsEntry: setEntryNode, // Pass the function to set entry node
      },
    };

    setNodes((nodes) => [...nodes, newNode]);
    setNodeIdCounter(prev => prev + 1);
  }, [nodeIdCounter, setNodes, setEntryNode]);

  // Update node data
  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((nodes) => 
      nodes.map((node) => 
        node.id === nodeId 
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      )
    );
  }, [setNodes]);

  // Update edge data
  const updateEdgeData = useCallback((edgeId: string, newData: any) => {
    setEdges((edges) => 
      edges.map((edge) => 
        edge.id === edgeId 
          ? { ...edge, data: { ...edge.data, ...newData } }
          : edge
      )
    );
  }, [setEdges]);

  // Save flow (implement actual save logic)
  const saveFlow = useCallback(async () => {
    if (!flowId || !flow) {
      setError('No flow selected to save');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Prepare flow data
      const flowData = {
        name: flow.name,
        account: parseInt(accountId),
        entry_node: flow.entry_node,
      };

      // Update the flow
      await flowAPI.updateFlow(parseInt(flowId), flowData);

      // Get existing nodes to determine which ones to delete
      const existingNodes = await flowAPI.getFlowNodes(parseInt(flowId));
      const currentNodeDbIds = nodes.map(node => node.data?.dbId).filter(Boolean);
      
      // Delete nodes that no longer exist
      for (const existingNode of existingNodes) {
        if (!currentNodeDbIds.includes(existingNode.id)) {
          await flowAPI.deleteFlowNode(parseInt(flowId), existingNode.id);
        }
      }

      // Save/update nodes
      for (const node of nodes) {
        const nodeData = {
          node_id: node.id,
          node_type: node.type,
          position_x: node.position.x,
          position_y: node.position.y,
          config: node.data.config || {},
          label: node.data.label,
          description: node.data.description || '',
        };

        if (node.data.dbId) {
          // Update existing node
          await flowAPI.updateFlowNode(parseInt(flowId), node.data.dbId, nodeData);
        } else {
          // Create new node
          const createdNode = await flowAPI.createFlowNode(parseInt(flowId), nodeData);
          // Update local state with database ID
          setNodes(currentNodes => 
            currentNodes.map(n => 
              n.id === node.id 
                ? { ...n, data: { ...n.data, dbId: createdNode.id } }
                : n
            )
          );
        }
      }

      // Get existing edges to determine which ones to delete
      const existingEdges = await flowAPI.getFlowEdges(parseInt(flowId));
      const currentEdgeIds = edges.map(edge => edge.data?.dbId).filter(Boolean);
      
      // Delete edges that no longer exist
      for (const existingEdge of existingEdges) {
        if (!currentEdgeIds.includes(existingEdge.id)) {
          await flowAPI.deleteFlowEdge(parseInt(flowId), existingEdge.id);
        }
      }

      // Save/update edges
      for (const edge of edges) {
        // Find source and target node database IDs
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        
        if (!sourceNode?.data.dbId || !targetNode?.data.dbId) {
          console.warn('Cannot save edge - source or target node not found in database');
          continue;
        }

        const edgeData = {
          edge_id: edge.id,
          source_node: sourceNode.data.dbId,
          target_node: targetNode.data.dbId,
          source_handle: edge.sourceHandle || '',
          target_handle: edge.targetHandle || '',
          condition_type: edge.data?.condition_type || 'always',
          condition_config: edge.data?.condition_config || {},
          label: edge.data?.label || '',
          style: edge.data?.style || {},
          priority: edge.data?.priority || 0,
        };

        if (edge.data?.dbId) {
          // Update existing edge
          await flowAPI.updateFlowEdge(parseInt(flowId), edge.data.dbId, edgeData);
        } else {
          // Create new edge
          const createdEdge = await flowAPI.createFlowEdge(parseInt(flowId), edgeData);
          // Update local state with database ID
          setEdges(currentEdges => 
            currentEdges.map(e => 
              e.id === edge.id 
                ? { ...e, data: { ...e.data, dbId: createdEdge.id } }
                : e
            )
          );
        }
      }

      setSuccessMessage('Flow saved successfully!');
      console.log('Flow saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (error) {
      console.error('Failed to save flow:', error);
      setError('Failed to save flow. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [flowId, flow, nodes, edges, setNodes, setEdges, accountId]);

  // Delete selected node
  const deleteSelectedNode = useCallback(() => {
    if (!selectedNode) return;

    setNodes((nodes) => nodes.filter((node) => node.id !== selectedNode.id));
    setEdges((edges) => edges.filter((edge) => 
      edge.source !== selectedNode.id && edge.target !== selectedNode.id
    ));
    setSelectedNode(null);
    setShowPropertiesPanel(false);
  }, [selectedNode, setNodes, setEdges]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchAccount();
      if (flowId) {
        loadFlow();
      } else {
        setLoading(false);
      }
    }
  }, [status, router, fetchAccount, loadFlow, flowId]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neon-green"></div>
      </div>
    );
  }

  if (!session || !account) {
    return null;
  }

  if (!flowId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">No Flow Selected</h2>
          <p className="text-gray-400 mb-6">Please select a flow to edit</p>
          <button
            onClick={() => router.push(`/dashboard/accounts/${accountId}/flows`)}
            className="bg-neon-green/20 hover:bg-neon-green/30 text-neon-green px-6 py-3 rounded-lg transition-colors border border-neon-green/20 hover:border-neon-green/40"
          >
            Back to Flows
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-md border-b border-neon-green/20">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push(`/dashboard/accounts/${accountId}/flows`)}
            className="text-neon-green hover:text-neon-green/80 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">
              {flow?.name || 'Flow Builder'} - {account?.name}
            </h1>
            <p className="text-gray-400 text-sm">
              {flow?.description || 'Design your conversation flow'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowNodeSidebar(!showNodeSidebar)}
            className={`p-2 rounded-lg transition-colors ${
              showNodeSidebar
                ? 'bg-neon-green/20 text-neon-green'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title="Toggle Node Sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <button
            onClick={saveFlow}
            disabled={saving}
            className="bg-neon-green/20 hover:bg-neon-green/30 text-neon-green px-4 py-2 rounded-lg transition-colors border border-neon-green/20 hover:border-neon-green/40 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/20 border-b border-red-500/40 text-red-400">
          {error}
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="p-4 bg-green-500/20 border-b border-green-500/40 text-green-400">
          {successMessage}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Node Sidebar */}
        {showNodeSidebar && (
          <div className="w-64 bg-black/50 backdrop-blur-md border-r border-neon-green/20">
            <NodeSidebar onAddNode={addNode} />
          </div>
        )}

        {/* Flow Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            attributionPosition="bottom-left"
          >
            <Background variant={BackgroundVariant.Dots} color="#10b981" />
            <Controls className="bg-black/50 border-neon-green/20" />
            <MiniMap 
              className="bg-black/50 border border-neon-green/20" 
              nodeColor="#10b981"
              maskColor="rgba(0, 0, 0, 0.8)"
            />
            <Panel position="top-right">
              <FlowToolbar 
                onSave={saveFlow}
                onDeleteNode={deleteSelectedNode}
                selectedNode={selectedNode}
                saving={saving}
              />
            </Panel>
          </ReactFlow>
        </div>

        {/* Properties Panel */}
        {showPropertiesPanel && (selectedNode || selectedEdge) && (
          <div className="w-80 bg-black/50 backdrop-blur-md border-l border-neon-green/20">
            {selectedNode && (
              <NodePropertiesPanel 
                node={selectedNode}
                onUpdateNode={updateNodeData}
                onClose={() => setShowPropertiesPanel(false)}
                accountId={parseInt(accountId)}
              />
            )}
            {selectedEdge && (
              <EdgePropertiesPanel 
                edge={selectedEdge}
                onUpdateEdge={updateEdgeData}
                onClose={() => setShowPropertiesPanel(false)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FlowBuilderPage() {
  return (
    <ReactFlowProvider>
      <FlowBuilderContent />
    </ReactFlowProvider>
  );
}
