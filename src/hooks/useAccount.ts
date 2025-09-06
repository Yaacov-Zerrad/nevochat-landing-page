import { useState, useCallback } from 'react';
import api from '@/lib/api';

export interface Account {
  id: number;
  name: string;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const useAccount = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccountById = useCallback(async (accountId: number): Promise<Account> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/api/accounts/${accountId}/`);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch account';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAccounts = useCallback(async (): Promise<Account[]> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/api/accounts/');
      return response.data.results || response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch accounts';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAccount = useCallback(async (accountId: number, data: Partial<Account>): Promise<Account> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.patch(`/api/accounts/${accountId}/`, data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update account';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    fetchAccountById,
    fetchAccounts,
    updateAccount,
    loading,
    error,
  };
};
