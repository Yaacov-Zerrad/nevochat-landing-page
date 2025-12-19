'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Account } from '@/types/account';

export default function AccountSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const accountId = params.accountId as string;
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAccount = useCallback(async () => {
    try {
      const mockAccount: Account = {
        id: parseInt(accountId),
        name: accountId === '1' ? 'Mon Entreprise' : 'Projet Client A',
        status: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setAccount(mockAccount);
    } catch (error) {
      console.error('Failed to fetch account:', error);
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
    }
  }, [status, router, fetchAccount]);

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
                <h1 className="text-3xl font-bold text-foreground mb-2">Paramètres - {account.name}</h1>
                <p className="text-muted-foreground">Configuration du compte</p>
              </div>
            </div>
          </div>

          {/* Settings Form */}
          <div className="space-y-8">
            {/* Account Information */}
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-600">
              <h3 className="text-lg font-semibold text-foreground mb-4">Informations du compte</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom du compte
                  </label>
                  <input
                    type="text"
                    value={account.name}
                    className="w-full bg-input border border-input rounded-lg px-4 py-3 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Statut
                  </label>
                  <div className={`inline-flex px-3 py-2 text-sm rounded-full ${
                    account.status === 1 ? 'bg-primary/20 text-primary' :
                    account.status === 0 ? 'bg-gray-500/20 text-muted-foreground' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {account.status}
                  </div>
                </div>
               
              </div>
            </div>

            {/* API Settings */}
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-600">
              <h3 className="text-lg font-semibold text-foreground mb-4">Paramètres API</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Clé API
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="password"
                      value="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="flex-1 bg-input border border-input rounded-lg px-4 py-3 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                      readOnly
                    />
                    <button className="bg-primary/20 hover:bg-primary/30 text-primary px-4 py-3 rounded-lg transition-colors border border-primary/20 hover:border-primary/40">
                      Régénérer
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-900/20 p-6 rounded-xl border border-red-500/20">
              <h3 className="text-lg font-semibold text-red-400 mb-4">Zone dangereuse</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-foreground font-medium">Supprimer le compte</h4>
                    <p className="text-muted-foreground text-sm">Cette action est irréversible</p>
                  </div>
                  <button className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-colors border border-red-500/20 hover:border-red-500/40">
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
