'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { whatsappAPI } from '@/lib/api';

export default function WhatsAppConnectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const accountId = Array.isArray(params.accountId) ? params.accountId[0] : params.accountId;
  const existingAccountId = searchParams.get('account_id');

  const [phoneNumber, setPhoneNumber] = useState('');
  const [connectionType, setConnectionType] = useState<'qrcode' | 'pairing'>('qrcode');
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [pairingCode, setPairingCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState('form'); // form, connecting, qr, pairing, success

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
  }, [status, router]);

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    if (!accountId) return;
    setLoading(true);
    setError('');
    setStep('connecting');

    try {
      const cleanPhoneNumber = phoneNumber.replace(/[^\d]/g, '');
      
      if (!cleanPhoneNumber) {
        setError('Veuillez entrer un numéro de téléphone valide');
        setStep('form');
        return;
      }

      const response = await whatsappAPI.connectWhatsApp(accountId, {
        phone_number: cleanPhoneNumber,
        account_id: existingAccountId || undefined,
        type: connectionType
      });

      if (response.success) {
        if (connectionType === 'qrcode' && response.qr_code_base64) {
          setQrCode(response.qr_code_base64);
          setStep('qr');
        } else if (connectionType === 'pairing' && response.pairing_code) {
          setPairingCode(response.pairing_code);
          setStep('pairing');
        }
      } else {
        setError(response.error || 'Erreur lors de la connexion');
        setStep('form');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setError('Erreur lors de la connexion. Veuillez réessayer.');
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push(`/dashboard/accounts/${accountId}/whatsapp`);
  };

  const handleSuccess = () => {
    setSuccess(true);
    setStep('success');
    setTimeout(() => {
      router.push(`/dashboard/accounts/${accountId}/whatsapp`);
    }, 3000);
  };

  if (status === 'loading') {
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
          className="max-w-2xl mx-auto bg-black/80 backdrop-blur-md p-8 rounded-2xl border border-neon-green/20"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">📱</div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Connecter WhatsApp Business
            </h1>
            <p className="text-gray-400">
              {existingAccountId ? 'Reconnectez votre compte' : 'Connectez un nouveau compte'} WhatsApp Business
            </p>
          </div>

          {step === 'form' && (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Numéro de téléphone
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+33123456789"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-neon-green focus:outline-none"
                  required
                />
                <p className="text-sm text-gray-400 mt-1">
                  Incluez le code pays (ex: +33 pour la France)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Méthode de connexion
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    onClick={() => setConnectionType('qrcode')}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      connectionType === 'qrcode'
                        ? 'border-neon-green bg-neon-green/10'
                        : 'border-gray-600 bg-gray-800/30 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">📷</div>
                      <h3 className="font-medium text-white">QR Code</h3>
                      <p className="text-sm text-gray-400 mt-1">
                        Scannez avec votre téléphone
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => setConnectionType('pairing')}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      connectionType === 'pairing'
                        ? 'border-neon-green bg-neon-green/10'
                        : 'border-gray-600 bg-gray-800/30 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">🔢</div>
                      <h3 className="font-medium text-white">Code d&apos;appairage</h3>
                      <p className="text-sm text-gray-400 mt-1">
                        Entrez le code sur votre téléphone
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 px-6 py-3 rounded-lg transition-colors border border-gray-600/20 hover:border-gray-600/40"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-neon-green/20 hover:bg-neon-green/30 text-neon-green px-6 py-3 rounded-lg transition-colors border border-neon-green/20 hover:border-neon-green/40 disabled:opacity-50"
                >
                  {loading ? 'Connexion...' : 'Connecter'}
                </button>
              </div>
            </motion.form>
          )}

          {step === 'connecting' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-neon-green mx-auto mb-4"></div>
              <h3 className="text-xl font-medium text-white mb-2">Connexion en cours...</h3>
              <p className="text-gray-400">
                Préparation de la connexion à WhatsApp Business
              </p>
            </motion.div>
          )}

          {step === 'qr' && qrCode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <h3 className="text-xl font-medium text-white mb-6">
                Scannez le QR Code
              </h3>
              <div className="bg-white p-4 rounded-lg inline-block mb-6">
                <Image src={qrCode} alt="QR Code WhatsApp" width={256} height={256} className="w-64 h-64" />
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-400 mb-2">Instructions:</h4>
                <ol className="text-sm text-gray-300 space-y-1 text-left">
                  <li>1. Ouvrez WhatsApp sur votre téléphone</li>
                  <li>2. Allez dans Paramètres → Appareils liés</li>
                  <li>3. Touchez &quot;Lier un appareil&quot;</li>
                  <li>4. Scannez ce QR code</li>
                </ol>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleBack}
                  className="flex-1 bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 px-6 py-3 rounded-lg transition-colors border border-gray-600/20 hover:border-gray-600/40"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSuccess}
                  className="flex-1 bg-neon-green/20 hover:bg-neon-green/30 text-neon-green px-6 py-3 rounded-lg transition-colors border border-neon-green/20 hover:border-neon-green/40"
                >
                  J&apos;ai scanné le code
                </button>
              </div>
            </motion.div>
          )}

          {step === 'pairing' && pairingCode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <h3 className="text-xl font-medium text-white mb-6">
                Code d&apos;appairage
              </h3>
              <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-8 mb-6">
                <div className="text-4xl font-mono text-neon-green mb-4 tracking-wider">
                  {pairingCode}
                </div>
                <p className="text-gray-400">
                  Entrez ce code sur votre téléphone
                </p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-400 mb-2">Instructions:</h4>
                <ol className="text-sm text-gray-300 space-y-1 text-left">
                  <li>1. Ouvrez WhatsApp sur votre téléphone</li>
                  <li>2. Allez dans Paramètres → Appareils liés</li>
                  <li>3. Touchez &quot;Lier un appareil&quot;</li>
                  <li>4. Sélectionnez &quot;Lier avec le numéro de téléphone à la place&quot;</li>
                  <li>5. Entrez le code ci-dessus</li>
                </ol>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleBack}
                  className="flex-1 bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 px-6 py-3 rounded-lg transition-colors border border-gray-600/20 hover:border-gray-600/40"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSuccess}
                  className="flex-1 bg-neon-green/20 hover:bg-neon-green/30 text-neon-green px-6 py-3 rounded-lg transition-colors border border-neon-green/20 hover:border-neon-green/40"
                >
                  J&apos;ai entré le code
                </button>
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Connexion réussie !
              </h3>
              <p className="text-gray-400 mb-6">
                Votre compte WhatsApp Business a été connecté avec succès.
              </p>
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <p className="text-green-400 text-sm">
                  Redirection vers le dashboard...
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
