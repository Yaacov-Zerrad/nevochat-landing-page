export interface FlowNode {
  id: number;
  node_id: string;
  node_type: 'message' | 'ai' | 'function' | 'condition' | 'input' | 'webhook' | 'delay' | 'end' | 'template';
  position_x: number;
  position_y: number;
  config: Record<string, any>;
  label: string;
  description?: string;
  is_entry_node?: boolean;
  created_at: string;
  updated_at: string;
}

export interface FlowEdge {
  id: number;
  edge_id: string;
  source_node: number;
  target_node: number;
  source_handle?: string;
  target_handle?: string;
  condition_type: 'always' | 'condition' | 'intent' | 'keyword' | 'user_input';
  condition_config: Record<string, any>;
  label?: string;
  style: Record<string, any>;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface ChatbotFlow {
  id: number;
  name: string;
  description?: string;
  account: number;
  captains?: number[];
  captains_count?: number;
  nodes_count?: number;
  created_by: number;
  flow_data: Record<string, any>;
  entry_node?: string | null;
  is_active: boolean;
  version: number;
  nodes?: FlowNode[];
  edges?: FlowEdge[];
  created_at: string;
  updated_at: string;
}

export interface FlowExecution {
  id: number;
  flow: number;
  session_id: string;
  user_id?: string;
  status: 'running' | 'completed' | 'failed' | 'stopped';
  current_node?: number;
  context_data: Record<string, any>;
  execution_log: any[];
  error_message?: string;
  started_at: string;
  completed_at?: string;
  updated_at: string;
}

export interface FlowTemplate {
  id: number;
  name: string;
  description: string;
  category: 'customer_service' | 'lead_generation' | 'faq' | 'booking' | 'survey' | 'support' | 'sales' | 'onboarding' | 'custom';
  template_data: Record<string, any>;
  is_public: boolean;
  created_by: number;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateFlowData {
  name: string;
  description?: string;
  account: number;
  captains?: number[];
  flow_data?: Record<string, any>;
  is_active?: boolean;
  version?: number;
}

export interface UpdateFlowData extends Partial<CreateFlowData> {
  id: number;
}
