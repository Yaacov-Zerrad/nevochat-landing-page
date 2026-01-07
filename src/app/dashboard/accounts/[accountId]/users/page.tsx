'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Account, AccountUser, AddUserToAccountRequest } from '@/types/account';
import { useTranslations } from 'next-intl';
import { accountAPI } from '@/lib/api';

export default function AccountUsersPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const accountId = params.accountId as string;
  const t = useTranslations('accountUsers');
  const [account, setAccount] = useState<Account | null>(null);
  const [users, setUsers] = useState<AccountUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchAccount = useCallback(async () => {
    try {
      const data = await accountAPI.getAccount(parseInt(accountId));
      setAccount(data);
    } catch (error) {
      console.error('Failed to fetch account:', error);
    }
  }, [accountId]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await accountAPI.getAccountUsers(parseInt(accountId));
      setUsers(data);
      setError(null);
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      setError(error.response?.data?.detail || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchAccount();
      fetchUsers();
    }
  }, [status, router, fetchAccount, fetchUsers]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsAddingUser(true);

    try {
      const requestData: AddUserToAccountRequest = {
        email: newUserEmail,
        role: newUserRole,
      };

      await accountAPI.addUserToAccount(parseInt(accountId), requestData);
      setNewUserEmail('');
      setNewUserRole(0);
      fetchUsers();
    } catch (error: any) {
      console.error('Failed to add user:', error);
      setError(error.response?.data?.detail || error.response?.data?.email?.[0] || 'Failed to add user');
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleRemoveUser = async (userId: number) => {
    if (!confirm(t('confirmRemove'))) return;

    try {
      await accountAPI.removeUserFromAccount(parseInt(accountId), userId);
      fetchUsers();
      setError(null);
    } catch (error: any) {
      console.error('Failed to remove user:', error);
      setError(error.response?.data?.detail || 'Failed to remove user');
    }
  };

  const handleUpdateRole = async (userId: number, newRole: number) => {
    try {
      await accountAPI.updateAccountUser(parseInt(accountId), userId, { role: newRole });
      fetchUsers();
      setError(null);
    } catch (error: any) {
      console.error('Failed to update role:', error);
      setError(error.response?.data?.detail || 'Failed to update role');
    }
  };

  const getRoleLabel = (role: number) => {
    switch (role) {
      case 0: return t('roleMember');
      case 1: return t('roleAdmin');
      case 2: return t('roleOwner');
      default: return t('roleMember');
    }
  };

  const getRoleBadgeClass = (role: number) => {
    switch (role) {
      case 0: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 1: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 2: return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleBackToDashboard = () => {
    router.push(`/dashboard/accounts/${accountId}`);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-primary"></div>
      </div>
    );
  }

  if (!session || !account) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass glass-border p-8 rounded-2xl border border-primary/20"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToDashboard}
                className="text-primary hover:text-primary/80 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{t('title')} - {account.name}</h1>
                <p className="text-muted-foreground">{t('subtitle')}</p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Add User Form */}
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-600 mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">{t('addUser')}</h3>
            <form onSubmit={handleAddUser} className="flex flex-col md:flex-row gap-4">
              <input
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                className="flex-1 bg-input border border-input rounded-lg px-4 py-3 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                required
              />
              <select
                value={newUserRole}
                onChange={(e) => setNewUserRole(parseInt(e.target.value))}
                className="bg-input border border-input rounded-lg px-4 py-3 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              >
                <option value={0}>{t('roleMember')}</option>
                <option value={1}>{t('roleAdmin')}</option>
                <option value={2}>{t('roleOwner')}</option>
              </select>
              <button
                type="submit"
                disabled={isAddingUser}
                className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingUser ? t('adding') : t('addButton')}
              </button>
            </form>
          </div>

          {/* Users List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">{t('usersList')} ({users.length})</h3>
            {users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t('noUsers')}
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800/30 p-4 rounded-lg border border-gray-700 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-foreground font-medium">{user.user_name}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full border ${getRoleBadgeClass(user.role)}`}>
                            {getRoleLabel(user.role)}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm">{user.user_email}</p>
                        {user.inviter_email && (
                          <p className="text-muted-foreground text-xs mt-1">
                            {t('invitedBy')}: {user.inviter_name} ({user.inviter_email})
                          </p>
                        )}
                        <p className="text-muted-foreground text-xs mt-1">
                          {t('joinedAt')}: {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={user.role}
                          onChange={(e) => handleUpdateRole(user.id, parseInt(e.target.value))}
                          className="bg-input border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                        >
                          <option value={0}>{t('roleMember')}</option>
                          <option value={1}>{t('roleAdmin')}</option>
                          <option value={2}>{t('roleOwner')}</option>
                        </select>
                        <button
                          onClick={() => handleRemoveUser(user.id)}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-colors border border-red-500/20 hover:border-red-500/40"
                        >
                          {t('remove')}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
