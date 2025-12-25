'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import DashboardLayout from '@/components/DashboardLayout'
import { paymentAPI } from '@/lib/api'

interface SubscriptionPlan {
  id: number
  name: string
  display_name: string
  description: string
  price: string
  monthly_conversation_limit: number
  has_customer_service: boolean
  has_integrations: boolean
  is_active: boolean
}

interface AccountSubscription {
  account: number
  account_name: string
  plan: number
  plan_details: SubscriptionPlan
  status: string
  current_period_start: string | null
  current_period_end: string | null
  monthly_conversations_used: number
  last_reset_date: string
  created_at: string
  updated_at: string
}

interface PaymentHistory {
  id: number
  account_name: string
  amount: string
  currency: string
  status: string
  payment_method: string
  description: string
  paid_at: string | null
  created_at: string
}

export default function SubscriptionPage() {
  const params = useParams()
  const router = useRouter()
  const accountId = params.accountId as string

  const [loading, setLoading] = useState(true)
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [currentSubscription, setCurrentSubscription] = useState<AccountSubscription | null>(null)
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([])
  const [error, setError] = useState<string | null>(null)
  const [processingPlan, setProcessingPlan] = useState<number | null>(null)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [plansResponse, subscriptionResponse, paymentsResponse] = await Promise.all([
        paymentAPI.getPlans(),
        paymentAPI.getCurrentSubscription(parseInt(accountId)).catch(() => null),
        paymentAPI.getPaymentHistory({ page: 1 }).catch(() => ({ results: [] }))
      ])

      
      // Handle both array and paginated response formats
      const plansData = Array.isArray(plansResponse) ? plansResponse : (plansResponse.results || [])
      
      setPlans(plansData)
      setCurrentSubscription(subscriptionResponse)
      setPaymentHistory(paymentsResponse.results || [])
      
    } catch (err: any) {
      console.error('Error loading subscription data:', err)
      setError(err.response?.data?.error || 'Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }, [accountId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleUpgrade = async (planId: number) => {
    try {
      setProcessingPlan(planId)
      setError(null)

      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const successUrl = `${baseUrl}/dashboard/accounts/${accountId}/subscription?success=true`
      const cancelUrl = `${baseUrl}/dashboard/accounts/${accountId}/subscription?canceled=true`

      const response = await paymentAPI.createCheckoutSession({
        plan_id: planId,
        success_url: successUrl,
        cancel_url: cancelUrl,
        account_id: parseInt(accountId)
      })

      // Redirect to Stripe Checkout
      if (response.url) {
        window.location.href = response.url
      }
    } catch (err: any) {
      console.error('Error creating checkout session:', err)
      setError(err.response?.data?.error || 'Erreur lors de la création de la session de paiement')
      setProcessingPlan(null)
    }
  }

  const handleManageSubscription = async () => {
    try {
      setError(null)

      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const returnUrl = `${baseUrl}/dashboard/accounts/${accountId}/subscription`

      const response = await paymentAPI.createPortalSession({
        return_url: returnUrl,
        account_id: parseInt(accountId)
      })

      // Redirect to Stripe Customer Portal
      if (response.url) {
        window.location.href = response.url
      }
    } catch (err: any) {
      console.error('Error creating portal session:', err)
      setError(err.response?.data?.error || 'Erreur lors de l\'accès au portail client')
    }
  }

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100)
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 70) return 'bg-yellow-500'
    return 'bg-neon-green'
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen p-8">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-primary"></div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const conversationUsagePercent = currentSubscription
    ? getUsagePercentage(
        currentSubscription.monthly_conversations_used,
        currentSubscription.plan_details.monthly_conversation_limit
      )
    : 0

  return (
    <DashboardLayout>
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">💳 Abonnement & Facturation</h1>
            <p className="text-muted-foreground">Gérez votre abonnement et consultez votre historique de paiements</p>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500/40 rounded-lg p-4"
          >
            <p className="text-red-400">{error}</p>
          </motion.div>
        )}

        {/* Current Subscription */}
        {currentSubscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-black/40 backdrop-blur-md rounded-xl border border-primary/20 p-6"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {currentSubscription.plan_details.display_name}
                </h2>
                <p className="text-muted-foreground">{currentSubscription.plan_details.description}</p>
                <p className="text-3xl font-bold text-primary mt-4">
                  {currentSubscription.plan_details.name === 'enterprise'
                    ? 'Sur devis'
                    : parseFloat(currentSubscription.plan_details.price) === 0
                    ? 'Gratuit'
                    : `$${currentSubscription.plan_details.price}/mois`}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    currentSubscription.status === 'active'
                      ? 'bg-primary/20 text-primary'
                      : currentSubscription.status === 'trialing'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {currentSubscription.status === 'active' ? 'Actif' : currentSubscription.status}
                </span>
                {currentSubscription.plan_details.name !== 'free' && (
                  <button
                    onClick={handleManageSubscription}
                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-foreground transition-colors text-sm"
                  >
                    Gérer l&apos;abonnement
                  </button>
                )}
              </div>
            </div>

            {/* Usage Statistics */}
            <div className="grid grid-cols-1 gap-6">
              {/* Conversations Usage */}
              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-foreground font-medium">Conversations</span>
                  <span className="text-muted-foreground text-sm">
                    {currentSubscription.monthly_conversations_used} / {currentSubscription.plan_details.monthly_conversation_limit}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${getUsageColor(conversationUsagePercent)}`}
                    style={{ width: `${conversationUsagePercent}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Renouvellement mensuel • {Math.floor((100 - conversationUsagePercent))}% restant
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <span className={currentSubscription.plan_details.has_customer_service ? 'text-primary' : 'text-gray-500'}>
                  {currentSubscription.plan_details.has_customer_service ? '✓' : '✗'}
                </span>
                <span className="text-foreground">Service Client</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={currentSubscription.plan_details.has_integrations ? 'text-primary' : 'text-gray-500'}>
                  {currentSubscription.plan_details.has_integrations ? '✓' : '✗'}
                </span>
                <span className="text-foreground">Intégrations</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Available Plans */}
        {currentSubscription?.plan_details.name !== 'enterprise' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-6">Plans Disponibles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans
                .filter(plan => plan.is_active && plan.name !== currentSubscription?.plan_details.name)
                .map((plan, index) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className={`bg-black/40 backdrop-blur-md rounded-xl border p-6 ${
                      plan.name === 'professional'
                        ? 'border-primary/40 ring-2 ring-neon-green/20'
                        : 'border-border'
                    }`}
                  >
                    {plan.name === 'professional' && (
                      <span className="bg-primary/20 text-primary text-xs px-3 py-1 rounded-full mb-4 inline-block">
                        Populaire
                      </span>
                    )}
                    <h3 className="text-2xl font-bold text-foreground mb-2">{plan.display_name}</h3>
                    <p className="text-muted-foreground text-sm mb-4 h-12">{plan.description}</p>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-foreground">
                        {plan.name === 'enterprise'
                          ? 'Sur devis'
                          : parseFloat(plan.price) === 0
                          ? 'Gratuit'
                          : `$${plan.price}`}
                      </span>
                      {parseFloat(plan.price) > 0 && plan.name !== 'enterprise' && (
                        <span className="text-muted-foreground text-sm">/mois</span>
                      )}
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-primary">✓</span>
                        <span className="text-foreground">{plan.monthly_conversation_limit} conversations/mois</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className={plan.has_customer_service ? 'text-primary' : 'text-gray-500'}>
                          {plan.has_customer_service ? '✓' : '✗'}
                        </span>
                        <span className="text-foreground">Service Client</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className={plan.has_integrations ? 'text-primary' : 'text-gray-500'}>
                          {plan.has_integrations ? '✓' : '✗'}
                        </span>
                        <span className="text-foreground">Intégrations</span>
                      </div>
                    </div>

                    <button
                      onClick={() => plan.name === 'enterprise' ? null : handleUpgrade(plan.id)}
                      disabled={processingPlan === plan.id || plan.name === 'enterprise'}
                      className={`w-full py-3 rounded-lg font-medium transition-all ${
                        plan.name === 'professional'
                          ? 'bg-neon-green text-black hover:bg-neon-green/90'
                          : plan.name === 'enterprise'
                          ? 'bg-white/10 text-foreground cursor-not-allowed'
                          : 'bg-white/10 hover:bg-white/20 text-foreground'
                      } ${processingPlan === plan.id ? 'opacity-50 cursor-wait' : ''}`}
                    >
                      {processingPlan === plan.id ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                          Traitement...
                        </span>
                      ) : plan.name === 'enterprise' ? (
                        'Contactez-nous'
                      ) : (
                        'Mettre à niveau'
                      )}
                    </button>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        )}

        {/* Payment History */}
        {paymentHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-6">Historique des Paiements</h2>
            <div className="bg-black/40 backdrop-blur-md rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black/40">
                    <tr>
                      <th className="text-left px-6 py-4 text-muted-foreground font-medium">Date</th>
                      <th className="text-left px-6 py-4 text-muted-foreground font-medium">Description</th>
                      <th className="text-left px-6 py-4 text-muted-foreground font-medium">Montant</th>
                      <th className="text-left px-6 py-4 text-muted-foreground font-medium">Statut</th>
                      <th className="text-left px-6 py-4 text-muted-foreground font-medium">Méthode</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.map((payment) => (
                      <tr key={payment.id} className="border-t border-white/5">
                        <td className="px-6 py-4 text-foreground">
                          {new Date(payment.created_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 text-gray-300">{payment.description}</td>
                        <td className="px-6 py-4 text-foreground font-medium">
                          {payment.amount} {payment.currency}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs ${
                              payment.status === 'succeeded'
                                ? 'bg-primary/20 text-primary'
                                : payment.status === 'pending'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {payment.status === 'succeeded' ? 'Réussi' : payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-300">{payment.payment_method}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
        </div>
      </div>
    </DashboardLayout>
  )
}
