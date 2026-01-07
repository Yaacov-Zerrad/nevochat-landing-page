'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { format, subDays } from 'date-fns';
import { Account } from '@/types/account';
import {
  analyticsAPI,
  AnalyticsMetrics,
  ConversationMetrics,
  ContactMetrics,
  FlowMetrics,
} from '@/lib/api';
import { MetricCard } from '@/components/analytics/MetricCard';
import { DateRangeSelector, DateRange } from '@/components/analytics/DateRangeSelector';
import { MetricChart } from '@/components/analytics/MetricChart';

type MetricType = 'conversations' | 'contacts' | 'flows';

export default function AccountAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const accountId = params.accountId as string;
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('conversations');
  const [dateRange, setDateRange] = useState<DateRange>({
    start_date: format(subDays(new Date(), 29), 'yyyy-MM-dd'),
    end_date: format(new Date(), 'yyyy-MM-dd'),
    label: 'Last 30 days',
  });
  const [conversationMetrics, setConversationMetrics] = useState<ConversationMetrics | null>(null);
  const [contactMetrics, setContactMetrics] = useState<ContactMetrics | null>(null);
  const [flowMetrics, setFlowMetrics] = useState<FlowMetrics | null>(null);

  const fetchAccount = useCallback(async () => {
    try {
      const mockAccount: Account = {
        id: parseInt(accountId),
        name: accountId === '1' ? 'Mon Entreprise' : 'Projet Client A',
        status: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setAccount(mockAccount);
    } catch (error) {
      console.error('Failed to fetch account:', error);
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  const fetchMetrics = useCallback(async () => {
    if (!accountId) return;

    setMetricsLoading(true);
    try {
      // Fetch all metrics in parallel
      const [conversations, contacts, flows] = await Promise.all([
        analyticsAPI.getMetrics(parseInt(accountId), {
          metric: 'conversations',
          start_date: dateRange.start_date,
          end_date: dateRange.end_date,
          granularity: 'day',
        }) as Promise<ConversationMetrics>,
        analyticsAPI.getMetrics(parseInt(accountId), {
          metric: 'contacts',
          start_date: dateRange.start_date,
          end_date: dateRange.end_date,
          granularity: 'day',
        }) as Promise<ContactMetrics>,
        analyticsAPI.getMetrics(parseInt(accountId), {
          metric: 'flows',
          start_date: dateRange.start_date,
          end_date: dateRange.end_date,
          granularity: 'day',
        }) as Promise<FlowMetrics>,
      ]);

      setConversationMetrics(conversations);
      setContactMetrics(contacts);
      setFlowMetrics(flows);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setMetricsLoading(false);
    }
  }, [accountId, dateRange]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchAccount();
    }
  }, [status, router, fetchAccount]);

  useEffect(() => {
    if (status === 'authenticated' && accountId) {
      fetchMetrics();
    }
  }, [status, accountId, dateRange, fetchMetrics]);

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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass glass-border p-8 rounded-2xl shadow-2xl mb-8"
        >
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToDashboard}
              className="text-primary hover:text-primary/80 transition-colors p-2 rounded-lg hover:bg-secondary/20"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-600 bg-clip-text text-transparent mb-2">Analytics Dashboard</h1>
              <p className="text-muted-foreground">{account.name}</p>
            </div>
          </div>
        </motion.div>

        {/* Date Range Selector */}
        <div className="mb-6">
          <DateRangeSelector value={dateRange} onChange={setDateRange} />
        </div>

        {/* Metric Type Selector */}
        <div className="mb-6">
          <div className="glass glass-border p-4 rounded-xl">
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedMetric('conversations')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  selectedMetric === 'conversations'
                    ? 'bg-primary text-white'
                    : 'bg-secondary/50 text-foreground hover:bg-secondary'
                }`}
              >
                💬 Conversations
              </button>
              <button
                onClick={() => setSelectedMetric('contacts')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  selectedMetric === 'contacts'
                    ? 'bg-primary text-white'
                    : 'bg-secondary/50 text-foreground hover:bg-secondary'
                }`}
              >
                👥 Contacts
              </button>
              <button
                onClick={() => setSelectedMetric('flows')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  selectedMetric === 'flows'
                    ? 'bg-primary text-white'
                    : 'bg-secondary/50 text-foreground hover:bg-secondary'
                }`}
              >
                🔄 Flows
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {metricsLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
          </div>
        )}

        {/* Conversations Metrics */}
        {!metricsLoading && selectedMetric === 'conversations' && conversationMetrics && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Conversations"
                value={conversationMetrics.summary.total_conversations}
                icon="💬"
                color="blue"
              />
              <MetricCard
                title="Active Conversations"
                value={conversationMetrics.summary.active_conversations}
                icon="🟢"
                color="green"
              />
              <MetricCard
                title="Resolved Conversations"
                value={conversationMetrics.summary.resolved_conversations}
                icon="✅"
                color="purple"
              />
              <MetricCard
                title="AI vs Human"
                value={`${conversationMetrics.summary.ai_conversations} / ${conversationMetrics.summary.human_conversations}`}
                icon="🤖"
                subtitle="AI / Human"
                color="orange"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MetricChart
                title="Conversations Over Time"
                data={conversationMetrics.time_series}
                type="area"
                dataKeys={[
                  { key: 'total', label: 'Total', color: '#3B82F6' },
                  { key: 'active', label: 'Active', color: '#10B981' },
                  { key: 'resolved', label: 'Resolved', color: '#8B5CF6' },
                ]}
                height={350}
              />
              <MetricChart
                title="Conversation Status Breakdown"
                data={conversationMetrics.time_series}
                type="bar"
                dataKeys={[
                  { key: 'active', label: 'Active', color: '#10B981' },
                  { key: 'resolved', label: 'Resolved', color: '#8B5CF6' },
                  { key: 'pending', label: 'Pending', color: '#F59E0B' },
                  { key: 'closed', label: 'Closed', color: '#EF4444' },
                ]}
                height={350}
              />
            </div>

            <MetricChart
              title="AI vs Human Mode"
              data={conversationMetrics.time_series}
              type="line"
              dataKeys={[
                { key: 'ai_mode', label: 'AI Mode', color: '#3B82F6' },
                { key: 'human_mode', label: 'Human Mode', color: '#10B981' },
              ]}
              height={300}
            />
          </div>
        )}

        {/* Contacts Metrics */}
        {!metricsLoading && selectedMetric === 'contacts' && contactMetrics && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Contacts"
                value={contactMetrics.summary.total_contacts}
                icon="👥"
                color="green"
              />
              <MetricCard
                title="New Contacts"
                value={contactMetrics.summary.new_contacts}
                icon="✨"
                subtitle={`In ${dateRange.label.toLowerCase()}`}
                color="blue"
              />
              <MetricCard
                title="Active Contacts"
                value={contactMetrics.summary.active_contacts}
                icon="🟢"
                subtitle="Last 30 days"
                color="purple"
              />
              <MetricCard
                title="Blocked Contacts"
                value={contactMetrics.summary.blocked_contacts}
                icon="🚫"
                color="red"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MetricChart
                title="New Contacts Over Time"
                data={contactMetrics.time_series}
                type="area"
                dataKeys={[{ key: 'total', label: 'New Contacts', color: '#10B981' }]}
                height={350}
              />
              <MetricChart
                title="Contact Mode Distribution"
                data={contactMetrics.time_series}
                type="bar"
                dataKeys={[
                  { key: 'ai_mode', label: 'AI Mode', color: '#3B82F6' },
                  { key: 'human_mode', label: 'Human Mode', color: '#10B981' },
                ]}
                height={350}
              />
            </div>
          </div>
        )}

        {/* Flow Metrics */}
        {!metricsLoading && selectedMetric === 'flows' && flowMetrics && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Flows"
                value={flowMetrics.summary.total_flows}
                icon="🔄"
                color="purple"
              />
              <MetricCard
                title="Total Executions"
                value={flowMetrics.summary.total_executions}
                icon="▶️"
                subtitle={`In ${dateRange.label.toLowerCase()}`}
                color="blue"
              />
              <MetricCard
                title="Completed"
                value={flowMetrics.summary.completed_executions}
                icon="✅"
                color="green"
              />
              <MetricCard
                title="Failed"
                value={flowMetrics.summary.failed_executions}
                icon="❌"
                color="red"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MetricChart
                title="Flow Executions Over Time"
                data={flowMetrics.time_series}
                type="area"
                dataKeys={[
                  { key: 'total', label: 'Total', color: '#8B5CF6' },
                  { key: 'completed', label: 'Completed', color: '#10B981' },
                  { key: 'failed', label: 'Failed', color: '#EF4444' },
                ]}
                height={350}
              />
              <MetricChart
                title="Execution Status Breakdown"
                data={flowMetrics.time_series}
                type="bar"
                dataKeys={[
                  { key: 'running', label: 'Running', color: '#3B82F6' },
                  { key: 'completed', label: 'Completed', color: '#10B981' },
                  { key: 'failed', label: 'Failed', color: '#EF4444' },
                  { key: 'stopped', label: 'Stopped', color: '#F59E0B' },
                ]}
                height={350}
              />
            </div>

            {/* Top Flows Table */}
            {flowMetrics.executions_by_flow.length > 0 && (
              <div className="glass glass-border p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-foreground mb-4">Top 10 Flows by Executions</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Flow Name</th>
                        <th className="text-center py-3 px-4 text-muted-foreground font-medium">Total</th>
                        <th className="text-center py-3 px-4 text-muted-foreground font-medium">Completed</th>
                        <th className="text-center py-3 px-4 text-muted-foreground font-medium">Failed</th>
                        <th className="text-center py-3 px-4 text-muted-foreground font-medium">Running</th>
                      </tr>
                    </thead>
                    <tbody>
                      {flowMetrics.executions_by_flow.map((flow) => (
                        <tr key={flow.flow_id} className="border-b border-border/50 hover:bg-secondary/20">
                          <td className="py-3 px-4 text-foreground">{flow.flow_name}</td>
                          <td className="text-center py-3 px-4 text-primary font-semibold">{flow.total}</td>
                          <td className="text-center py-3 px-4 text-green-500">{flow.completed}</td>
                          <td className="text-center py-3 px-4 text-red-500">{flow.failed}</td>
                          <td className="text-center py-3 px-4 text-orange-500">{flow.running}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
