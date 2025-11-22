'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAccount } from '@/contexts/AccountContext'

interface CreateAccountModalDetailedProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (account: any) => void
}

interface FormData {
  name: string
  business_sector: string
  business_sector_other: string
  objectives: string[]
  objectives_other: string
  tone: string
  language_level: string
  target_audience: string[]
  age_range: string
  offtopic_behavior: string
  response_length: string
  main_products_services: string
  keywords: string
  words_to_avoid: string
  languages: string[]
  languages_other: string
  timezone: string
  personality_traits: string[]
  use_emojis: string
  urgent_requests_handling: string
  unknown_answer_handling: string
  needed_features: string[]
  info_to_collect: string[]
  specific_rules: string
  info_presentation_format: string
}

const initialFormData: FormData = {
  name: '',
  business_sector: '',
  business_sector_other: '',
  objectives: [],
  objectives_other: '',
  tone: '',
  language_level: '',
  target_audience: [],
  age_range: '',
  offtopic_behavior: '',
  response_length: '',
  main_products_services: '',
  keywords: '',
  words_to_avoid: '',
  languages: [],
  languages_other: '',
  timezone: '',
  personality_traits: [],
  use_emojis: '',
  urgent_requests_handling: '',
  unknown_answer_handling: '',
  needed_features: [],
  info_to_collect: [],
  specific_rules: '',
  info_presentation_format: '',
}

export default function CreateAccountModalDetailed({ isOpen, onClose, onSuccess }: CreateAccountModalDetailedProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { createAccount, error } = useAccount()

  const totalSteps = 5

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCheckboxChange = (field: keyof FormData, value: string) => {
    const currentValues = formData[field] as string[]
    if (currentValues.includes(value)) {
      handleInputChange(field, currentValues.filter(v => v !== value))
    } else {
      handleInputChange(field, [...currentValues, value])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      const newAccount = await createAccount(formData.name.trim(), formData)
      
      if (newAccount) {
        setFormData(initialFormData)
        setCurrentStep(1)
        onSuccess?.(newAccount)
        onClose()
      }
    } catch (err) {
      console.error('Error creating account:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData(initialFormData)
      setCurrentStep(1)
      onClose()
    }
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neon-green mb-4">Informations de base</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nom du compte *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nom de votre entreprise"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Secteur d'activité *
              </label>
              <select
                value={formData.business_sector}
                onChange={(e) => handleInputChange('business_sector', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green"
                required
              >
                <option value="">Sélectionnez un secteur</option>
                <option value="e-commerce">E-commerce</option>
                <option value="services">Services</option>
                <option value="sante">Santé</option>
                <option value="finance">Finance</option>
                <option value="education">Éducation</option>
                <option value="technologie">Technologie</option>
                <option value="immobilier">Immobilier</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            {formData.business_sector === 'autre' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Précisez votre secteur
                </label>
                <input
                  type="text"
                  value={formData.business_sector_other}
                  onChange={(e) => handleInputChange('business_sector_other', e.target.value)}
                  placeholder="Votre secteur d'activité"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Objectifs principaux (sélection multiple) *
              </label>
              <div className="space-y-2">
                {['Support client', 'Génération de leads', 'Ventes', 'Information produit', 'Prise de rendez-vous', 'Autre'].map(obj => (
                  <label key={obj} className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.objectives.includes(obj)}
                      onChange={() => handleCheckboxChange('objectives', obj)}
                      className="w-4 h-4 text-neon-green bg-gray-800 border-gray-600 rounded focus:ring-neon-green"
                    />
                    <span>{obj}</span>
                  </label>
                ))}
              </div>
            </div>

            {formData.objectives.includes('Autre') && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Précisez vos objectifs
                </label>
                <textarea
                  value={formData.objectives_other}
                  onChange={(e) => handleInputChange('objectives_other', e.target.value)}
                  placeholder="Décrivez vos objectifs spécifiques"
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green"
                />
              </div>
            )}
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neon-green mb-4">Ton et Communication</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ton de communication préféré *
              </label>
              <select
                value={formData.tone}
                onChange={(e) => handleInputChange('tone', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green"
                required
              >
                <option value="">Sélectionnez un ton</option>
                <option value="formel">Formel et professionnel</option>
                <option value="amical">Amical et décontracté</option>
                <option value="enthousiaste">Enthousiaste</option>
                <option value="neutre">Neutre et informatif</option>
                <option value="empathique">Empathique</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Niveau de langage souhaité *
              </label>
              <select
                value={formData.language_level}
                onChange={(e) => handleInputChange('language_level', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green"
                required
              >
                <option value="">Sélectionnez un niveau</option>
                <option value="simple">Simple et accessible</option>
                <option value="technique">Technique et spécialisé</option>
                <option value="mixte">Mixte selon le contexte</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Longueur de réponse préférée *
              </label>
              <select
                value={formData.response_length}
                onChange={(e) => handleInputChange('response_length', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green"
                required
              >
                <option value="">Sélectionnez une longueur</option>
                <option value="courte">Courte et concise</option>
                <option value="moyenne">Moyenne avec détails</option>
                <option value="longue">Longue et exhaustive</option>
                <option value="adaptative">Adaptative</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                L'assistant doit-il utiliser des emojis ? *
              </label>
              <div className="space-y-2">
                {[
                  { value: 'frequemment', label: 'Oui, fréquemment' },
                  { value: 'moderement', label: 'Oui, modérément' },
                  { value: 'jamais', label: 'Non, jamais' }
                ].map(option => (
                  <label key={option.value} className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                    <input
                      type="radio"
                      name="use_emojis"
                      value={option.value}
                      checked={formData.use_emojis === option.value}
                      onChange={(e) => handleInputChange('use_emojis', e.target.value)}
                      className="w-4 h-4 text-neon-green bg-gray-800 border-gray-600 focus:ring-neon-green"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neon-green mb-4">Audience et Clients</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Clients principaux (sélection multiple) *
              </label>
              <div className="space-y-2">
                {['Particuliers (B2C)', 'Entreprises (B2B)', 'Les deux'].map(audience => (
                  <label key={audience} className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.target_audience.includes(audience)}
                      onChange={() => handleCheckboxChange('target_audience', audience)}
                      className="w-4 h-4 text-neon-green bg-gray-800 border-gray-600 rounded focus:ring-neon-green"
                    />
                    <span>{audience}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tranche d'âge principale *
              </label>
              <select
                value={formData.age_range}
                onChange={(e) => handleInputChange('age_range', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green"
                required
              >
                <option value="">Sélectionnez une tranche d'âge</option>
                <option value="18-25">18-25 ans</option>
                <option value="26-35">26-35 ans</option>
                <option value="36-50">36-50 ans</option>
                <option value="51+">51+ ans</option>
                <option value="tout-age">Tout âge</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Langues de communication (sélection multiple) *
              </label>
              <div className="space-y-2">
                {['Français', 'Anglais', 'Espagnol', 'Arabe', 'Hébreu', 'Autre'].map(lang => (
                  <label key={lang} className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.languages.includes(lang)}
                      onChange={() => handleCheckboxChange('languages', lang)}
                      className="w-4 h-4 text-neon-green bg-gray-800 border-gray-600 rounded focus:ring-neon-green"
                    />
                    <span>{lang}</span>
                  </label>
                ))}
              </div>
            </div>

            {formData.languages.includes('Autre') && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Précisez les langues
                </label>
                <input
                  type="text"
                  value={formData.languages_other}
                  onChange={(e) => handleInputChange('languages_other', e.target.value)}
                  placeholder="Autres langues"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Fuseau horaire des clients *
              </label>
              <select
                value={formData.timezone}
                onChange={(e) => handleInputChange('timezone', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green"
                required
              >
                <option value="">Sélectionnez un fuseau horaire</option>
                <option value="UTC+1">UTC+1 (Europe)</option>
                <option value="UTC-5">UTC-5 (EST)</option>
                <option value="UTC+2">UTC+2 (Israël)</option>
                <option value="autre">Autre</option>
              </select>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neon-green mb-4">Contenu et Personnalité</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Produits/Services principaux à promouvoir
              </label>
              <textarea
                value={formData.main_products_services}
                onChange={(e) => handleInputChange('main_products_services', e.target.value)}
                placeholder="Listez vos produits ou services clés"
                rows={3}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mots-clés ou termes spécifiques à utiliser
              </label>
              <textarea
                value={formData.keywords}
                onChange={(e) => handleInputChange('keywords', e.target.value)}
                placeholder="Termes techniques, jargon métier, expressions favorites"
                rows={2}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mots ou sujets à éviter absolument
              </label>
              <textarea
                value={formData.words_to_avoid}
                onChange={(e) => handleInputChange('words_to_avoid', e.target.value)}
                placeholder="Sujets sensibles, termes concurrents, etc."
                rows={2}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Traits de personnalité souhaités (sélection multiple)
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {['Patient', 'Proactif', 'Humoristique', 'Direct', 'Rassurant', 'Créatif'].map(trait => (
                  <label key={trait} className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.personality_traits.includes(trait)}
                      onChange={() => handleCheckboxChange('personality_traits', trait)}
                      className="w-4 h-4 text-neon-green bg-gray-800 border-gray-600 rounded focus:ring-neon-green"
                    />
                    <span>{trait}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Réaction face à une demande hors sujet
              </label>
              <textarea
                value={formData.offtopic_behavior}
                onChange={(e) => handleInputChange('offtopic_behavior', e.target.value)}
                placeholder="Ex: Rediriger poliment vers les sujets appropriés"
                rows={2}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green"
              />
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neon-green mb-4">Fonctionnalités et Règles</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Gestion des demandes urgentes
              </label>
              <textarea
                value={formData.urgent_requests_handling}
                onChange={(e) => handleInputChange('urgent_requests_handling', e.target.value)}
                placeholder="Ex: Escalader vers un humain, proposer un callback immédiat"
                rows={2}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Action si l'assistant ne sait pas répondre *
              </label>
              <select
                value={formData.unknown_answer_handling}
                onChange={(e) => handleInputChange('unknown_answer_handling', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green"
                required
              >
                <option value="">Sélectionnez une action</option>
                <option value="avouer">Avouer et proposer alternatives</option>
                <option value="rediriger">Rediriger vers support</option>
                <option value="callback">Prendre les coordonnées pour rappel</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Fonctionnalités spécifiques nécessaires (sélection multiple)
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {['Prise de RDV', 'Devis automatique', 'Suivi de commande', 'FAQ dynamique', 'Collecte de feedback'].map(feature => (
                  <label key={feature} className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.needed_features.includes(feature)}
                      onChange={() => handleCheckboxChange('needed_features', feature)}
                      className="w-4 h-4 text-neon-green bg-gray-800 border-gray-600 rounded focus:ring-neon-green"
                    />
                    <span>{feature}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Informations à collecter systématiquement (sélection multiple)
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {['Nom', 'Email', 'Téléphone', 'Entreprise', 'Budget', 'Deadline'].map(info => (
                  <label key={info} className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.info_to_collect.includes(info)}
                      onChange={() => handleCheckboxChange('info_to_collect', info)}
                      className="w-4 h-4 text-neon-green bg-gray-800 border-gray-600 rounded focus:ring-neon-green"
                    />
                    <span>{info}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Format de présentation des informations *
              </label>
              <select
                value={formData.info_presentation_format}
                onChange={(e) => handleInputChange('info_presentation_format', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green"
                required
              >
                <option value="">Sélectionnez un format</option>
                <option value="listes">Listes à puces</option>
                <option value="paragraphes">Paragraphes</option>
                <option value="tableaux">Tableaux</option>
                <option value="mixte">Mixte</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Limitations ou règles spécifiques
              </label>
              <textarea
                value={formData.specific_rules}
                onChange={(e) => handleInputChange('specific_rules', e.target.value)}
                placeholder="Ex: Ne jamais donner de prix sans qualification, toujours demander le budget, etc."
                rows={3}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green"
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-3xl bg-black/90 backdrop-blur-md border border-neon-green/20 rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Créer un nouveau compte</h2>
                <p className="text-sm text-gray-400 mt-1">Étape {currentStep} sur {totalSteps}</p>
              </div>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-neon-green to-emerald-400 transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Step content */}
              <div className="mb-6 min-h-[400px]">
                {renderStepContent()}
              </div>

              {/* Navigation buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-700">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={isSubmitting}
                    className="px-4 py-3 bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 rounded-lg transition-colors disabled:opacity-50"
                  >
                    ← Précédent
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-4 py-3 bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 rounded-lg transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>

                <div className="flex-1" />

                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-neon-green/20 hover:bg-neon-green/30 text-neon-green border border-neon-green/20 hover:border-neon-green/40 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Suivant →
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.name.trim()}
                    className="px-6 py-3 bg-neon-green/20 hover:bg-neon-green/30 text-neon-green border border-neon-green/20 hover:border-neon-green/40 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-neon-green mr-2"></div>
                        Création en cours...
                      </>
                    ) : (
                      'Créer le compte'
                    )}
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
