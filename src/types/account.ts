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
