export interface WhatsAppAccount {
  id: string;
  phone_number: string;
  display_name: string;
  status: 'disconnected' | 'connecting' | 'connected' | 'qr_required' | 'pairing_code' | 'error' | 'banned' | 'timeout';
  last_seen?: string;
  last_disconnect_reason?: string;
  created_at: string;
  updated_at: string;
  is_connected: boolean;
}

export interface WhatsAppMessage {
  id: string;
  account: string;
  whatsapp_message_id: string;
  direction: 'incoming' | 'outgoing';
  message_type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'sticker' | 'location' | 'contact';
  from_number: string;
  to_number: string;
  content: any;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppContact {
  id: string;
  account: string;
  phone_number: string;
  display_name?: string;
  profile_picture_url?: string;
  is_business: boolean;
  is_enterprise: boolean;
  last_seen?: string;
  created_at: string;
  updated_at: string;
}

export interface ConnectionRequest {
  phone_number: string;
  account_id?: string;
  type: 'qrcode' | 'pairing';
}

export interface ConnectionResponse {
  success: boolean;
  account_id: string;
  phone_number: string;
  type: 'qrcode' | 'pairing';
  qr_code_base64?: string;
  qr_code_data?: string;
  pairing_code?: string;
  expires_in?: number;
  error?: string;
}

export interface ConnectionStatus {
  status: string;
  is_connected: boolean;
  last_seen?: string;
  last_disconnect_reason?: string;
}

export interface SendMessageRequest {
  to_number: string;
  message: string;
  message_type?: 'text' | 'image' | 'audio' | 'video' | 'document';
}

export interface SendMessageResponse {
  message: string;
  message_id: string;
  status: string;
}
