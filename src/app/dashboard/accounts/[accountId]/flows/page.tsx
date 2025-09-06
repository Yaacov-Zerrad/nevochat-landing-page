'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { flowAPI } from '@/lib/api';
import { ChatbotFlow } from '@/types/flow';
import { useAccount } from '@/contexts/AccountContext';

export default function AccountFlowsPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const accountId = params.accountId as string;
  const { fetchAccountById } = useAccount();
  
  const [flows, setFlows] = useState<ChatbotFlow[]>([]);
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFlowName, setNewFlowName] = useState('');
  const [newFlowDescription, setNewFlowDescription] = useState('');

  const fetchAccount = useCallback(async () => {
    try {
      const accountData = await fetchAccountById(parseInt(accountId));
      setAccount(accountData);
    } catch (error) {
      console.error('Failed to fetch account:', error);
      setError('Failed to load account');
    }
  }, [accountId, fetchAccountById]);

  const loadFlows = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading flows for account:', accountId);
      
      const response = await flowAPI.getFlows({ 
        account: parseInt(accountId),
        search: searchTerm || undefined
      });
      
      console.log('Flows response:', response);
      
      // Handle both paginated (with results) and direct array responses
      const flowsData = Array.isArray(response) ? response : (response?.results || []);
      setFlows(flowsData);
    } catch (err) {
      console.error('Error loading flows:', err);
      setError('Failed to load flows');
      setFlows([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, accountId]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchAccount();
      loadFlows();
    }
  }, [status, router, fetchAccount, loadFlows]);

  const handleCreateFlow = async () => {
    if (!newFlowName.trim()) return;

    try {
      const newFlow = await flowAPI.createFlow({
        name: newFlowName,
        description: newFlowDescription,
        flow_data: { nodes: [], edges: [] },
        account: parseInt(accountId),
      });

      setFlows([newFlow, ...(flows || [])]);
      setShowCreateModal(false);
      setNewFlowName('');
      setNewFlowDescription('');
      
      // Navigate to flow builder with the new flow
      router.push(`/dashboard/accounts/${accountId}/flow-builder?flowId=${newFlow.id}`);
    } catch (err) {
      console.error('Error creating flow:', err);
      alert('Failed to create flow');
    }
  };

  const handleEditFlow = (flowId: number) => {
    router.push(`/dashboard/accounts/${accountId}/flow-builder?flowId=${flowId}`);
  };

  const handleDuplicateFlow = async (flowId: number) => {
    try {
      const duplicatedFlow = await flowAPI.duplicateFlow(flowId);
      setFlows([duplicatedFlow, ...(flows || [])]);
    } catch (err) {
      console.error('Error duplicating flow:', err);
      alert('Failed to duplicate flow');
    }
  };

  const handleDeleteFlow = async (flowId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce flow ?')) return;

    try {
      await flowAPI.deleteFlow(flowId);
      setFlows((flows || []).filter(flow => flow.id !== flowId));
    } catch (err) {
      console.error('Error deleting flow:', err);
      alert('Failed to delete flow');
    }
  };

  const handleToggleActive = async (flowId: number, isActive: boolean) => {
    try {
      if (isActive) {
        await flowAPI.deactivateFlow(flowId);
      } else {
        await flowAPI.activateFlow(flowId);
      }
      
      setFlows((flows || []).map(flow => 
        flow.id === flowId ? { ...flow, is_active: !isActive } : flow
      ));
    } catch (err) {
      console.error('Error toggling flow status:', err);
      alert('Failed to toggle flow status');
    }
  };

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
          {/* Header */}
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
                <h1 className="text-3xl font-bold text-white mb-2">Flows - {account.name}</h1>
                <p className="text-gray-400">Gérer vos flows de conversation</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-neon-green/20 hover:bg-neon-green/30 text-neon-green px-6 py-3 rounded-lg transition-colors border border-neon-green/20 hover:border-neon-green/40"
            >
              + Créer un flow
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher un flow..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 pl-12 text-white placeholder-gray-400 focus:border-neon-green focus:outline-none"
              />
              <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/40 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {/* Flows Grid */}
          {flows.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔄</div>
              <h3 className="text-xl font-semibold text-white mb-2">Aucun flow trouvé</h3>
              <p className="text-gray-400 mb-6">Créez votre premier flow pour commencer</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-neon-green/20 hover:bg-neon-green/30 text-neon-green px-6 py-3 rounded-lg transition-colors border border-neon-green/20 hover:border-neon-green/40"
              >
                + Créer un flow
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {flows.map((flow, index) => (
                <motion.div
                  key={flow.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-xl border border-gray-600 hover:border-neon-green/40 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">{flow.name}</h3>
                      <p className="text-gray-400 text-sm">{flow.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        flow.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {flow.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => flow.id && handleEditFlow(flow.id)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title="Modifier"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => flow.id && handleDuplicateFlow(flow.id)}
                        className="text-yellow-400 hover:text-yellow-300 transition-colors"
                        title="Dupliquer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => flow.id && handleDeleteFlow(flow.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Supprimer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <button
                      onClick={() => flow.id && handleToggleActive(flow.id, flow.is_active)}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        flow.is_active
                          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      }`}
                    >
                      {flow.is_active ? 'Désactiver' : 'Activer'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Create Flow Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 p-8 rounded-2xl border border-neon-green/20 max-w-md w-full mx-4"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Créer un nouveau flow</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom du flow
                </label>
                <input
                  type="text"
                  value={newFlowName}
                  onChange={(e) => setNewFlowName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-neon-green focus:outline-none"
                  placeholder="Ex: Support Client"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description (optionnel)
                </label>
                <textarea
                  value={newFlowDescription}
                  onChange={(e) => setNewFlowDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-neon-green focus:outline-none"
                  placeholder="Description du flow..."
                />
              </div>
            </div>
            
            <div className="flex space-x-4 mt-8">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateFlow}
                disabled={!newFlowName.trim()}
                className="flex-1 bg-neon-green/20 hover:bg-neon-green/30 text-neon-green px-4 py-3 rounded-lg transition-colors border border-neon-green/20 hover:border-neon-green/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Créer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
