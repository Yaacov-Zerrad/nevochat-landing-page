'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Account, User } from '@/types/account';
import { authAPI } from '@/lib/api';

interface AccountContextType {
  currentAccount: Account | null;
  userAccounts: Account[];
  loading: boolean;
  error: string | null;
  
  // Actions
  setCurrentAccount: (account: Account) => void;
  fetchUserAccounts: () => Promise<void>;
  fetchAccountById: (accountId: number) => Promise<Account | null>;
  clearAccount: () => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

interface AccountProviderProps {
  children: ReactNode;
}

export function AccountProvider({ children }: AccountProviderProps) {
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const [userAccounts, setUserAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userData: User = await authAPI.getCurrentUser();
      setUserAccounts(userData.accounts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch accounts');
      console.error('Error fetching user accounts:', err);
      setUserAccounts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAccountById = useCallback(async (accountId: number): Promise<Account | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const userData: User = await authAPI.getCurrentUser();
      const account = userData.accounts?.find(acc => acc.id === accountId);
      
      return account || null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch account');
      console.error('Error fetching account:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearAccount = useCallback(() => {
    setCurrentAccount(null);
    setUserAccounts([]);
    setError(null);
  }, []);

  const value: AccountContextType = {
    currentAccount,
    userAccounts,
    loading,
    error,
    setCurrentAccount,
    fetchUserAccounts,
    fetchAccountById,
    clearAccount,
  };

  return (
    <AccountContext.Provider value={value}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
}

// Hook to get the current account ID from URL params
export function useCurrentAccountId(): string | null {
  // This would be implemented based on your routing structure
  // For now, we'll return null and handle it in the components
  return null;
}
