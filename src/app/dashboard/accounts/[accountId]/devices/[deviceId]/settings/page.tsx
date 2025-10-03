'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { whatsappAPI } from '@/lib/api';

export default function DeviceSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const accountId = Array.isArray(params.accountId) ? params.accountId[0] : params.accountId;
  const deviceId = Array.isArray(params.deviceId) ? params.deviceId[0] : params.deviceId;

  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchAccount = useCallback(async () => {
    if (!deviceId) return;
    try {
      const accountData = await whatsappAPI.getWhatsAppAccount(deviceId);
      setAccount(accountData);
      setDisplayName(accountData.display_name || '');
    } catch (error) {
      console.error('Erreur lors du chargement du compte:', error);
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchAccount();
    }
  }, [status, router, fetchAccount]);

  const handleSave = async (e:any) => {
    e.preventDefault();
    if (!deviceId) return;
    setSaving(true);

    try {
      await whatsappAPI.updateWhatsAppAccount(deviceId, {
        display_name: displayName
      });
      
      await fetchAccount();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deviceId) return;
    try {
      await whatsappAPI.deleteWhatsAppAccount(deviceId);
      router.push(`/dashboard/accounts/${accountId}/devices`);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleBack = () => {
    router.push(`/dashboard/accounts/${accountId}/devices`);
  };

  const formatDate = (dateString:any) => {
    return new Date(dateString).toLocaleString('fr-FR');
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
          className="max-w-2xl mx-auto bg-black/80 backdrop-blur-md p-8 rounded-2xl border border-neon-green/20"
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={handleBack}
              className="text-neon-green hover:text-neon-green/80 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">⚙️ Paramètres WhatsApp</h1>
              <p className="text-gray-400 mt-2">
                Configuration du compte {account.phone_number}
              </p>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-gray-800/50 backdrop-blur-md p-6 rounded-xl border border-gray-700/50 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">📋 Informations du compte</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Numéro de téléphone:</span>
                <p className="text-white font-medium">{account?.phone_number}</p>
              </div>
              <div>
                <span className="text-gray-400">Statut:</span>
                <p className={`font-medium ${
                  account?.is_connected ? 'text-green-400' : 'text-red-400'
                }`}>
                  {account?.is_connected ? 'Connecté' : 'Déconnecté'}
                </p>
              </div>
              <div>
                <span className="text-gray-400">Créé le:</span>
                <p className="text-white">{formatDate(account?.created_at)}</p>
              </div>
              <div>
                <span className="text-gray-400">Dernière connexion:</span>
                <p className="text-white">
                  {account?.last_connected_at ? formatDate(account?.last_connected_at) : 'Jamais'}
                </p>
              </div>
            </div>
          </div>

          {/* Settings Form */}
          <form onSubmit={handleSave} className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-md p-6 rounded-xl border border-gray-700/50">
              <h2 className="text-lg font-semibold text-white mb-4">🏷️ Paramètres généraux</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom d&apos;affichage
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Mon compte WhatsApp Business"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-neon-green focus:outline-none"
                />
                <p className="text-sm text-gray-400 mt-1">
                  Ce nom sera affiché dans le dashboard pour identifier ce compte.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 px-6 py-3 rounded-lg transition-colors border border-gray-600/20 hover:border-gray-600/40"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-neon-green/20 hover:bg-neon-green/30 text-neon-green px-6 py-3 rounded-lg transition-colors border border-neon-green/20 hover:border-neon-green/40 disabled:opacity-50"
              >
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </form>

          {/* Danger Zone */}
          <div className="mt-8 bg-red-500/10 backdrop-blur-md p-6 rounded-xl border border-red-500/20">
            <h2 className="text-lg font-semibold text-red-400 mb-4">⚠️ Zone dangereuse</h2>
            <p className="text-gray-300 text-sm mb-4">
              La suppression de ce compte WhatsApp est irréversible. Toutes les données associées 
              (messages, contacts, etc.) seront perdues définitivement.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-6 py-3 rounded-lg transition-colors border border-red-500/20 hover:border-red-500/40"
            >
              🗑️ Supprimer ce compte
            </button>
          </div>
        </motion.div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-black/90 backdrop-blur-md p-8 rounded-2xl border border-red-500/20 max-w-md mx-4"
            >
              <div className="text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold text-white mb-4">
                  Confirmer la suppression
                </h3>
                <p className="text-gray-400 mb-6">
                  Êtes-vous sûr de vouloir supprimer ce compte WhatsApp ? 
                  Cette action est irréversible.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 px-6 py-3 rounded-lg transition-colors border border-gray-600/20 hover:border-gray-600/40"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-6 py-3 rounded-lg transition-colors border border-red-500/20 hover:border-red-500/40"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
