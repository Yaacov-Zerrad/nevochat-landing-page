'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { whatsappAPI } from '@/lib/api';

export default function WhatsAppContactsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const accountId = Array.isArray(params.accountId) ? params.accountId[0] : params.accountId;
  const whatsappId = Array.isArray(params.whatsappId) ? params.whatsappId[0] : params.whatsappId;

  const [contacts, setContacts] = useState<any[]>([]);
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAccount = useCallback(async () => {
    if (!whatsappId) return;
    try {
      const accountData = await whatsappAPI.getWhatsAppAccount(whatsappId);
      setAccount(accountData);
    } catch (error) {
      console.error('Erreur lors du chargement du compte:', error);
    }
  }, [whatsappId]);

  const fetchContacts = useCallback(async () => {
    if (!whatsappId) return;
    try {
      const response = await whatsappAPI.getContacts({ account: whatsappId });
      const contactList = response.results || [];
      setContacts(contactList);
    } catch (error) {
      console.error('Erreur lors du chargement des contacts:', error);
    } finally {
      setLoading(false);
    }
  }, [whatsappId]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchAccount();
      fetchContacts();
    }
  }, [status, router, fetchAccount, fetchContacts]);

  const handleBack = () => {
    router.push(`/dashboard/accounts/${accountId}/whatsapp`);
  };

  const handleSendMessage = (phoneNumber:any) => {
    router.push(`/dashboard/accounts/${accountId}/whatsapp/${whatsappId}/messages?recipient=${phoneNumber}`);
  };

  const filteredContacts = contacts.filter((contact:any) =>
    contact.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone_number.includes(searchTerm)
  );

  const formatLastSeen = (lastSeen:any) => {
    if (!lastSeen) return 'Jamais vu';
    return new Date(lastSeen).toLocaleString('fr-FR');
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
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="text-neon-green hover:text-neon-green/80 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white">👥 Contacts WhatsApp</h1>
                {account && (
                  <p className="text-gray-400 mt-2">
                    {account.display_name || account.phone_number} - {account.phone_number}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">
                {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 Rechercher un contact..."
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-neon-green focus:outline-none"
            />
          </div>

          {/* Contacts List */}
          {filteredContacts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-white mb-2">
                {searchTerm ? 'Aucun contact trouvé' : 'Aucun contact'}
              </h3>
              <p className="text-gray-400">
                {searchTerm 
                  ? 'Essayez une autre recherche'
                  : 'Les contacts apparaîtront ici une fois que des conversations seront initiées.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContacts.map((contact, index) => (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-gray-800/50 backdrop-blur-md p-6 rounded-xl border border-gray-700/50 hover:border-neon-green/30 transition-colors"
                >
                  <div className="flex items-center gap-4 mb-4">
                    {contact.profile_picture_url ? (
                      <Image
                        src={contact.profile_picture_url}
                        alt={contact.display_name || contact.phone_number}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-2xl">👤</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-white">
                        {contact.display_name || contact.phone_number}
                      </h3>
                      <p className="text-sm text-gray-400">{contact.phone_number}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {contact.is_business && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400 border border-blue-500/20">
                        💼 Business
                      </span>
                    )}
                    {contact.is_enterprise && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400 border border-purple-500/20">
                        🏢 Enterprise
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-gray-400 mb-4">
                    <strong>Dernière activité:</strong> {formatLastSeen(contact.last_seen)}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSendMessage(contact.phone_number)}
                      className="flex-1 bg-neon-green/20 hover:bg-neon-green/30 text-neon-green px-4 py-2 rounded-lg transition-colors border border-neon-green/20 hover:border-neon-green/40 text-sm flex items-center justify-center gap-2"
                    >
                      <span>💬</span>
                      Message
                    </button>
                    <button className="bg-gray-600/20 hover:bg-gray-600/30 text-gray-400 px-4 py-2 rounded-lg transition-colors border border-gray-600/20 hover:border-gray-600/40 text-sm flex items-center justify-center">
                      <span>ℹ️</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
