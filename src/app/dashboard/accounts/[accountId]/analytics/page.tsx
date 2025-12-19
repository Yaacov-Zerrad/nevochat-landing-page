'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Account } from '@/types/account';

export default function AccountAnalyticsPage() {
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
                <h1 className="text-3xl font-bold text-foreground mb-2">Analytics - {account.name}</h1>
                <p className="text-muted-foreground">Voir les statistiques et analyses</p>
              </div>
            </div>
          </div>

          {/* Placeholder Content */}
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Analytics à venir</h3>
            <p className="text-muted-foreground mb-6">Cette section affichera bientôt les statistiques détaillées de votre compte.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
