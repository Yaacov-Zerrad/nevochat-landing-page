import axios from 'axios';
import { getSession } from 'next-auth/react';
import { ChatbotFlow, FlowTemplate, FlowExecution } from '@/types/flow';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
api.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.accessToken) {

    config.headers.Authorization = `Token ${session.accessToken}`;
  }
  return config;
});

export interface APIResponse<T> {
  data: T;
  message?: string;
}

export interface ListResponse<T> {
  results: T[];
  count: number;
  next?: string;
  previous?: string;
}

// Flow API endpoints
export const flowAPI = {
  // Flows
  async getFlows(params?: { page?: number; search?: string; account?: number }): Promise<ListResponse<ChatbotFlow>> {
    const response = await api.get('/api/flow-builder/flows/', { params });
    return response.data;
  },

  async getFlow(id: number): Promise<ChatbotFlow> {
    const response = await api.get(`/api/flow-builder/flows/${id}/`);
    return response.data;
  },

  async createFlow(flow: Partial<ChatbotFlow>): Promise<ChatbotFlow> {
    const response = await api.post('/api/flow-builder/flows/', flow);
    return response.data;
  },

  async updateFlow(id: number, flow: Partial<ChatbotFlow>): Promise<ChatbotFlow> {
    const response = await api.put(`/api/flow-builder/flows/${id}/`, flow);
    return response.data;
  },

  async deleteFlow(id: number): Promise<void> {
    await api.delete(`/api/flow-builder/flows/${id}/`);
  },

  async duplicateFlow(id: number): Promise<ChatbotFlow> {
    const response = await api.post(`/api/flow-builder/flows/${id}/duplicate/`);
    return response.data;
  },

  async exportFlow(id: number): Promise<any> {
    const response = await api.post(`/api/flow-builder/flows/${id}/export/`);
    return response.data;
  },

  async importFlow(flowData: any): Promise<ChatbotFlow> {
    const response = await api.post('/api/flow-builder/flows/import_flow/', flowData);
    return response.data;
  },

  async activateFlow(id: number): Promise<void> {
    await api.post(`/api/flow-builder/flows/${id}/activate/`);
  },

  async deactivateFlow(id: number): Promise<void> {
    await api.post(`/api/flow-builder/flows/${id}/deactivate/`);
  },

  // Flow Nodes
  async getFlowNodes(flowId: number): Promise<any[]> {
    const response = await api.get(`/api/flow-builder/flows/${flowId}/nodes/`);
    return response.data;
  },

  async createFlowNode(flowId: number, node: any): Promise<any> {
    const response = await api.post(`/api/flow-builder/flows/${flowId}/nodes/`, node);
    return response.data;
  },

  async updateFlowNode(flowId: number, nodeId: number, node: any): Promise<any> {
    const response = await api.put(`/api/flow-builder/flows/${flowId}/nodes/${nodeId}/`, node);
    return response.data;
  },

  async deleteFlowNode(flowId: number, nodeId: number): Promise<void> {
    await api.delete(`/api/flow-builder/flows/${flowId}/nodes/${nodeId}/`);
  },

  // Flow Edges
  async getFlowEdges(flowId: number): Promise<any[]> {
    const response = await api.get(`/api/flow-builder/flows/${flowId}/edges/`);
    return response.data;
  },

  async createFlowEdge(flowId: number, edge: any): Promise<any> {
    const response = await api.post(`/api/flow-builder/flows/${flowId}/edges/`, edge);
    return response.data;
  },

  async updateFlowEdge(flowId: number, edgeId: number, edge: any): Promise<any> {
    const response = await api.put(`/api/flow-builder/flows/${flowId}/edges/${edgeId}/`, edge);
    return response.data;
  },

  async deleteFlowEdge(flowId: number, edgeId: number): Promise<void> {
    await api.delete(`/api/flow-builder/flows/${flowId}/edges/${edgeId}/`);
  },
};

// Templates API endpoints
export const templatesAPI = {
  async getTemplates(params?: { category?: string; search?: string }): Promise<ListResponse<FlowTemplate>> {
    const response = await api.get('/api/flow-builder/templates/', { params });
    return response.data;
  },

  async getTemplate(id: number): Promise<FlowTemplate> {
    const response = await api.get(`/api/flow-builder/templates/${id}/`);
    return response.data;
  },

  async createTemplate(template: Partial<FlowTemplate>): Promise<FlowTemplate> {
    const response = await api.post('/api/flow-builder/templates/', template);
    return response.data;
  },

  async updateTemplate(id: number, template: Partial<FlowTemplate>): Promise<FlowTemplate> {
    const response = await api.put(`/api/flow-builder/templates/${id}/`, template);
    return response.data;
  },

  async deleteTemplate(id: number): Promise<void> {
    await api.delete(`/api/flow-builder/templates/${id}/`);
  },

  async useTemplate(id: number): Promise<ChatbotFlow> {
    const response = await api.post(`/api/flow-builder/templates/${id}/use_template/`);
    return response.data;
  },
};

// Executions API endpoints
export const executionsAPI = {
  async getExecutions(params?: { flow?: number; status?: string }): Promise<ListResponse<FlowExecution>> {
    const response = await api.get('/api/flow-builder/executions/', { params });
    return response.data;
  },

  async getExecution(id: number): Promise<FlowExecution> {
    const response = await api.get(`/api/flow-builder/executions/${id}/`);
    return response.data;
  },

  async executeFlow(flowId: number, sessionId: string, userInput?: string, initialContext?: any): Promise<any> {
    const response = await api.post('/api/flow-builder/execute/', {
      flow_id: flowId,
      session_id: sessionId,
      user_input: userInput,
      initial_context: initialContext,
    });
    return response.data;
  },
};

// Auth API endpoints
export const authAPI = {
  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    const response = await api.post('/api/auth/login/', { email, password });
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/api/auth/logout/');
    localStorage.removeItem('auth_token');
  },

  async getCurrentUser(): Promise<any> {
    const response = await api.get('/api/users/me/');
    return response.data;
  },

  async updateProfile(data: { name?: string; email?: string }): Promise<any> {
    const response = await api.patch('/api/users/me/', data);
    return response.data;
  },

  async changePassword(data: { old_password: string; new_password: string }): Promise<any> {
    const response = await api.post('/api/auth/change-password/', data);
    return response.data;
  },
};

// User API endpoints
export const userAPI = {
  async getProfile(): Promise<any> {
    const response = await api.get('/api/users/me/');
    return response.data;
  },

  async updateProfile(data: { name?: string; email?: string }): Promise<any> {
    const response = await api.patch('/api/users/me/', data);
    return response.data;
  },
};

// Chatbot API endpoints
export const chatbotAPI = {
  async sendMessage(data: { message: string; conversation_id?: string }): Promise<any> {
    const response = await api.post('/api/chatbot/send-message/', data);
    return response.data;
  },

  async getConversations(): Promise<ListResponse<any>> {
    const response = await api.get('/api/chatbot/conversations/');
    return response.data;
  },

  async getConversation(id: string): Promise<any> {
    const response = await api.get(`/api/chatbot/conversations/${id}/`);
    return response.data;
  },

  async createConversation(data: { name?: string }): Promise<any> {
    const response = await api.post('/api/chatbot/conversations/', data);
    return response.data;
  },

  async deleteConversation(id: string): Promise<void> {
    await api.delete(`/api/chatbot/conversations/${id}/`);
  },

  async getMessages(conversationId: string): Promise<ListResponse<any>> {
    const response = await api.get(`/api/chatbot/conversations/${conversationId}/messages/`);
    return response.data;
  },
};

// WhatsApp Baileys API endpoints
export const whatsappAPI = {
  // WhatsApp Accounts
  async getWhatsAppAccounts(accountId?: string): Promise<ListResponse<any>> {
    const params = accountId ? { account: accountId } : {};
    const response = await api.get('/api/whatsapp/accounts/', { params });
    return response.data;
  },

  async getWhatsAppAccount(id: string): Promise<any> {
    const response = await api.get(`/api/whatsapp/accounts/${id}/`);
    return response.data;
  },

  async createWhatsAppAccount(data: { phone_number: string; display_name?: string; account: string }): Promise<any> {
    const response = await api.post('/api/whatsapp/accounts/', data);
    return response.data;
  },

  async updateWhatsAppAccount(id: string, data: { display_name?: string }): Promise<any> {
    const response = await api.put(`/api/whatsapp/accounts/${id}/`, data);
    return response.data;
  },

  async deleteWhatsAppAccount(id: string): Promise<void> {
    await api.delete(`/api/whatsapp/accounts/${id}/`);
  },

  // Connection Management
  async connectWhatsApp(accountId: string, data: {
    phone_number: string;
    account_id?: string;
    type?: 'qrcode' | 'pairing';
  }): Promise<{
    success: boolean;
    account_id: string;
    phone_number: string;
    type: 'qrcode' | 'pairing';
    qr_code_base64?: string;
    qr_code_data?: string;
    pairing_code?: string;
    expires_in?: number;
    error?: string;
  }> {
    const requestData = {
      ...data,
      account: accountId,
      type: data.type || 'qrcode'
    };
    const response = await api.post('/api/whatsapp/accounts/connect/', requestData);
    return response.data;
  },

  async disconnectWhatsApp(accountId: string, whatsappAccountId: string): Promise<{ message: string; status: string }> {
    const response = await api.post(`/api/whatsapp/accounts/${whatsappAccountId}/disconnect/`, { account: accountId });
    return response.data;
  },

  async getConnectionStatus(accountId: string): Promise<{
    status: string;
    is_connected: boolean;
    last_connected_at?: string;
    last_disconnect_reason?: string;
  }> {
    const response = await api.get(`/api/whatsapp/accounts/${accountId}/status/`);
    return response.data;
  },

  // Messaging
  async sendMessage(accountId: string, data: {
    to_number: string;
    message: string;
    message_type?: 'text' | 'image' | 'audio' | 'video' | 'document';
  }): Promise<{
    message: string;
    message_id: string;
    status: string;
  }> {
    const response = await api.post(`/api/whatsapp/accounts/${accountId}/send_message/`, data);
    return response.data;
  },

  // Messages
  async getMessages(params?: {
    account?: string;
    direction?: 'incoming' | 'outgoing';
    page?: number;
  }): Promise<ListResponse<any>> {
    const response = await api.get('/api/whatsapp/messages/', { params });
    return response.data;
  },

  async getMessage(id: string): Promise<any> {
    const response = await api.get(`/api/whatsapp/messages/${id}/`);
    return response.data;
  },

  // Contacts
  async getContacts(params?: {
    account?: string;
    page?: number;
  }): Promise<ListResponse<any>> {
    const response = await api.get('/api/whatsapp/contacts/', { params });
    return response.data;
  },

  async getContact(id: string): Promise<any> {
    const response = await api.get(`/api/whatsapp/contacts/${id}/`);
    return response.data;
  },
};

// Twilio Templates API endpoints
export const twilioTemplatesAPI = {
  // Get all messaging service SIDs for an account
  async getMessagingServices(accountId: number): Promise<{
    account_id: number;
    messaging_services: Array<{
      messaging_service_sid: string;
      phone_number: string;
      account_sid: string;
      id: number;
    }>;
    count: number;
  }> {
    const response = await api.get(`/api/services/twilio/messaging-services/account/${accountId}/`);
    return response.data;
  },

  // Get all templates for a messaging service
  async getTemplates(messagingServiceSid: string): Promise<{
    messaging_service_sid: string;
    templates: Array<{
      sid: string;
      friendly_name: string;
      language: string;
      status: string;
      category: string;
      body: string;
      content_types: string[];
    }>;
    count: number;
  }> {
    const response = await api.get(`/api/services/twilio/templates/${messagingServiceSid}/`);
    return response.data;
  },

  // Get a specific template by name
  async getTemplateByName(messagingServiceSid: string, friendlyName: string): Promise<any> {
    const response = await api.get(`/api/services/twilio/templates/${messagingServiceSid}/${friendlyName}/`);
    return response.data;
  },

  // Create a new template
  async createTemplate(data: {
    messaging_service_sid: string;
    template_type: 'text' | 'media' | 'quick-reply' | 'list-picker' | 'call-to-action' | 'authentication' | 'location';
    friendly_name: string;
    language?: string;
    category?: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
    template_data: any;
  }): Promise<any> {
    const response = await api.post('/api/services/twilio/templates/create/', data);
    return response.data;
  },

  // Delete a template
  async deleteTemplate(messagingServiceSid: string, templateSid: string): Promise<void> {
    await api.delete(`/api/services/twilio/templates/${messagingServiceSid}/delete/${templateSid}/`);
  },

  // Validate template variables
  async validateTemplateVariables(data: {
    template_body: string;
    variables: Record<string, string>;
  }): Promise<{
    template_body: string;
    variables: Record<string, string>;
    is_valid: boolean;
  }> {
    const response = await api.post('/api/services/twilio/templates/validate/', data);
    return response.data;
  },
};

export default api;
