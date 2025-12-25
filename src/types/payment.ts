export interface SubscriptionPlan {
  id: number;
  name: 'free' | 'professional' | 'enterprise';
  display_name: string;
  description: string;
  price: string;
  monthly_conversation_limit: number;
  has_customer_service: boolean;
  has_integrations: boolean;
  is_active: boolean;
}

export interface AccountSubscription {
  account: number;
  account_name: string;
  plan: number;
  plan_details: SubscriptionPlan;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  current_period_start: string | null;
  current_period_end: string | null;
  trial_end: string | null;
  monthly_conversations_used: number;
  last_reset_date: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentHistory {
  id: number;
  account: number;
  account_name: string;
  subscription: number | null;
  amount: string;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed' | 'refunded';
  payment_method: string;
  description: string;
  paid_at: string | null;
  created_at: string;
}

export interface UsageLog {
  id: number;
  account: number;
  account_name: string;
  log_type: 'chatbot_flow' | 'conversation';
  date: string;
  count: number;
  metadata: Record<string, any>;
  created_at: string;
}

export interface CreateCheckoutSessionRequest {
  plan_id: number;
  success_url: string;
  cancel_url: string;
}

export interface CreateCheckoutSessionResponse {
  session_id: string;
  url: string;
}

export interface CreatePortalSessionRequest {
  return_url: string;
}

export interface CreatePortalSessionResponse {
  url: string;
}
