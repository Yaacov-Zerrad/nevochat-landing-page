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
        description: accountId === '1' ? 'Compte principal de mon entreprise' : 'Compte pour le client A',
        status: 'active',
        role: 'owner',
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neon-green"></div>
      </div>
    );
  }

  if (!session || !account) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/80 backdrop-blur-md p-8 rounded-2xl border border-neon-green/20"
        >
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToDashboard}
                className="text-neon-green hover:text-neon-green/80 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Paramètres - {account.name}</h1>
                <p className="text-gray-400">Configuration du compte</p>
              </div>
            </div>
          </div>

          {/* Settings Form */}
          <div className="space-y-8">
            {/* Account Information */}
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-600">
              <h3 className="text-lg font-semibold text-white mb-4">Informations du compte</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom du compte
                  </label>
                  <input
                    type="text"
                    value={account.name}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-neon-green focus:outline-none"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Statut
                  </label>
                  <div className={`inline-flex px-3 py-2 text-sm rounded-full ${
                    account.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    account.status === 'inactive' ? 'bg-gray-500/20 text-gray-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {account.status}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={account.description}
                    rows={3}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-neon-green focus:outline-none"
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* API Settings */}
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-600">
              <h3 className="text-lg font-semibold text-white mb-4">Paramètres API</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Clé API
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="password"
                      value="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-neon-green focus:outline-none"
                      readOnly
                    />
                    <button className="bg-neon-green/20 hover:bg-neon-green/30 text-neon-green px-4 py-3 rounded-lg transition-colors border border-neon-green/20 hover:border-neon-green/40">
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
                    <h4 className="text-white font-medium">Supprimer le compte</h4>
                    <p className="text-gray-400 text-sm">Cette action est irréversible</p>
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
