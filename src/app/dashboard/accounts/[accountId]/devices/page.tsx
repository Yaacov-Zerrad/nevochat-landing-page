'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { whatsappAPI } from '@/lib/api';

export default function DevicesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const accountId = Array.isArray(params.accountId) ? params.accountId[0] : params.accountId;
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingAccountId, setConnectingAccountId] = useState<any>(null);

  const fetchAccounts = useCallback(async () => {
    if (!accountId) return;
    try {
      const response = await whatsappAPI.getWhatsAppAccounts(accountId);
      setAccounts(response.results || response);
    } catch (error) {
      console.error('Erreur lors du chargement des comptes WhatsApp:', error);
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
      fetchAccounts();
    }
  }, [status, router, fetchAccounts]);

  const getStatusColor = (status:any) => {
    switch (status) {
      case 'connected':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'connecting':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'disconnected':
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
      case 'error':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getStatusText = (status:any) => {
    switch (status) {
      case 'connected':
        return 'Connecté';
      case 'connecting':
        return 'Connexion...';
      case 'disconnected':
        return 'Déconnecté';
      case 'qr_required':
        return 'QR Code requis';
      case 'pairing_code':
        return 'Code d\'appairage requis';
      case 'error':
        return 'Erreur';
      case 'banned':
        return 'Banni';
      case 'timeout':
        return 'Timeout';
      default:
        return status;
    }
  };

  const handleDisconnect = async (whatsappAccountId:any) => {
    if (!accountId) return;
    try {
      setConnectingAccountId(whatsappAccountId);
      await whatsappAPI.disconnectWhatsApp(accountId, whatsappAccountId);
      await fetchAccounts();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setConnectingAccountId(null);
    }
  };

  const handleConnect = () => {
    router.push(`/dashboard/accounts/${accountId}/devices/connect`);
  };

  const handleReconnect = (whatsappAccountId:any) => {
    router.push(`/dashboard/accounts/${accountId}/devices/connect?account_id=${whatsappAccountId}`);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neon-green"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const connectedAccounts = accounts?.filter(account => account.is_connected).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/80 backdrop-blur-md p-8 rounded-2xl border border-neon-green/20"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                📱 Mes Appareils
              </h1>
              <p className="text-gray-400">
                Gérez vos appareils WhatsApp connectés et automatisez vos conversations
              </p>
            </div>
            <button
              onClick={handleConnect}
              className="bg-neon-green/20 hover:bg-neon-green/30 text-neon-green px-6 py-3 rounded-lg transition-colors border border-neon-green/20 hover:border-neon-green/40 flex items-center gap-2"
            >
              <span>➕</span>
              Nouvel appareil
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-green-500/10 backdrop-blur-md p-6 rounded-xl border border-green-500/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Comptes connectés</p>
                  <p className="text-2xl font-bold text-white">{connectedAccounts}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📶</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-blue-500/10 backdrop-blur-md p-6 rounded-xl border border-blue-500/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total comptes</p>
                  <p className="text-2xl font-bold text-white">{accounts?.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📱</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-purple-500/10 backdrop-blur-md p-6 rounded-xl border border-purple-500/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Messages envoyés</p>
                  <p className="text-2xl font-bold text-white">0</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">💬</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-orange-500/10 backdrop-blur-md p-6 rounded-xl border border-orange-500/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Contacts</p>
                  <p className="text-2xl font-bold text-white">0</p>
                </div>
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Accounts List */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Vos appareils connectés</h2>
            
            {accounts?.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gray-800/50 backdrop-blur-md p-12 rounded-xl border border-gray-700/50 text-center"
              >
                <div className="text-6xl mb-4">📱</div>
                <h3 className="text-lg font-medium text-white mb-2">
                  Aucun appareil connecté
                </h3>
                <p className="text-gray-400 mb-6">
                  Connectez votre premier appareil WhatsApp pour commencer à automatiser vos conversations.
                </p>
                <button
                  onClick={handleConnect}
                  className="bg-neon-green/20 hover:bg-neon-green/30 text-neon-green px-6 py-3 rounded-lg transition-colors border border-neon-green/20 hover:border-neon-green/40"
                >
                  Connecter un appareil
                </button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {accounts?.map((account, index) => (
                  <motion.div
                    key={account.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * (index + 1) }}
                    className="bg-gray-800/50 backdrop-blur-md p-6 rounded-xl border border-gray-700/50"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">📱</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-white">
                            {account.display_name || account.phone_number}
                          </h3>
                          <p className="text-gray-400 text-sm">{account.phone_number}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(account.status)}`}>
                        {getStatusText(account.status)}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {account.last_seen && (
                        <div className="text-sm text-gray-400">
                          <strong>Dernière connexion:</strong>{' '}
                          {new Date(account.last_seen).toLocaleString('fr-FR')}
                        </div>
                      )}
                      
                      {account.last_disconnect_reason && (
                        <div className="text-sm text-gray-400">
                          <strong>Raison de déconnexion:</strong> {account.last_disconnect_reason}
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-4">
                        {account.is_connected ? (
                          <>
                            <button
                              onClick={() => router.push(`/dashboard/accounts/${accountId}/devices/${account.id}/messages`)}
                              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg transition-colors border border-blue-500/20 hover:border-blue-500/40 text-sm flex items-center gap-2"
                            >
                              <span>💬</span>
                              Messages
                            </button>
                            <button
                              onClick={() => router.push(`/dashboard/accounts/${accountId}/devices/${account.id}/contacts`)}
                              className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 px-4 py-2 rounded-lg transition-colors border border-orange-500/20 hover:border-orange-500/40 text-sm flex items-center gap-2"
                            >
                              <span>👥</span>
                              Contacts
                            </button>
                            <button
                              onClick={() => handleDisconnect(account.id)}
                              disabled={connectingAccountId === account.id}
                              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-colors border border-red-500/20 hover:border-red-500/40 text-sm flex items-center gap-2 disabled:opacity-50"
                            >
                              <span>🔌</span>
                              {connectingAccountId === account.id ? 'Déconnexion...' : 'Déconnecter'}
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleReconnect(account.id)}
                              className="bg-neon-green/20 hover:bg-neon-green/30 text-neon-green px-4 py-2 rounded-lg transition-colors border border-neon-green/20 hover:border-neon-green/40 text-sm flex items-center gap-2"
                            >
                              <span>📶</span>
                              Reconnecter
                            </button>
                            <button
                              onClick={() => router.push(`/dashboard/accounts/${accountId}/devices/${account.id}/settings`)}
                              className="bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 px-4 py-2 rounded-lg transition-colors border border-gray-500/20 hover:border-gray-500/40 text-sm flex items-center gap-2"
                            >
                              <span>⚙️</span>
                              Paramètres
                            </button>
                          </>
                        )}
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
