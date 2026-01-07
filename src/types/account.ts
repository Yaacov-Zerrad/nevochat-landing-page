export interface Account {
  id: number;
  name: string;
  domain?: string;
  support_email?: string;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  url: string;
  accounts: Account[];
}

export interface UserAccount {
  user_id: number;
  account_id: number;
  account: Account;
  role: 'owner' | 'admin' | 'member';
  permissions: string[];
}

export interface AccountUser {
  id: number;
  user_id: number;
  user_email: string;
  user_name: string;
  role: number; // 0=member, 1=admin, 2=owner
  inviter_email?: string;
  inviter_name?: string;
  created_at: string;
  updated_at: string;
  active_at?: string;
  availability: number;
  auto_offline: boolean;
}

export interface AddUserToAccountRequest {
  email: string;
  role?: number; // 0=member, 1=admin, 2=owner
}

export interface UpdateAccountUserRequest {
  role?: number;
  availability?: number;
  auto_offline?: boolean;
}
