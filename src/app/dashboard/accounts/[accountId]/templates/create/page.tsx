'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Plus, X, Eye } from 'lucide-react'
import { twilioTemplatesAPI } from '@/lib/api'
import WhatsAppPreview from '@/components/WhatsAppPreview'

interface TemplateVariable {
  key: string
  value: string
}

interface QuickReplyButton {
  text: string
}

interface ListItem {
  id: string
  title: string
  description?: string
}

interface CallToActionButton {
  type: 'url' | 'phone'
  text: string
  url?: string
  phone_number?: string
}

export default function CreateTemplatePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const accountId = params.accountId as string
  const templateType = searchParams.get('type') || 'text'
  const messagingServiceSid = searchParams.get('service') || ''

  const [formData, setFormData] = useState({
    friendly_name: '',
    language: 'en',
    category: 'MARKETING',
    template_data: {}
  })

  const [textTemplateData, setTextTemplateData] = useState({
    body: '',
    variables: [] as TemplateVariable[]
  })

  const [mediaTemplateData, setMediaTemplateData] = useState({
    header_type: 'image',
    header_url: '',
    body: '',
    footer: '',
    variables: [] as TemplateVariable[]
  })

  const [quickReplyData, setQuickReplyData] = useState({
    body: '',
    buttons: [{ text: '' }] as QuickReplyButton[],
    variables: [] as TemplateVariable[]
  })

  const [listPickerData, setListPickerData] = useState({
    header: '',
    body: '',
    footer: '',
    button_text: '',
    sections: [{
      title: '',
      items: [{ id: '', title: '', description: '' }] as ListItem[]
    }],
    variables: [] as TemplateVariable[]
  })

  const [callToActionData, setCallToActionData] = useState({
    body: '',
    buttons: [{ type: 'url', text: '', url: '' }] as CallToActionButton[],
    variables: [] as TemplateVariable[]
  })

  const [authenticationData, setAuthenticationData] = useState({
    body: '',
    code_length: 6,
    add_security_recommendation: true,
    variables: [] as TemplateVariable[]
  })

  const [locationData, setLocationData] = useState({
    body: '',
    variables: [] as TemplateVariable[]
  })

  const [loading, setLoading] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [validationResult, setValidationResult] = useState<{is_valid: boolean, message?: string} | null>(null)

  // Refs for textareas to handle cursor position
  const textBodyRef = useRef<HTMLTextAreaElement>(null)
  const mediaBodyRef = useRef<HTMLTextAreaElement>(null)
  const quickReplyBodyRef = useRef<HTMLTextAreaElement>(null)
  const listBodyRef = useRef<HTMLTextAreaElement>(null)
  const ctaBodyRef = useRef<HTMLTextAreaElement>(null)
  const authBodyRef = useRef<HTMLTextAreaElement>(null)
  const locationBodyRef = useRef<HTMLTextAreaElement>(null)

  // Get current template data for preview
  const getCurrentTemplateData = () => {
    switch (templateType) {
      case 'text':
        return textTemplateData
      case 'media':
        return mediaTemplateData
      case 'quick-reply':
        return quickReplyData
      case 'list-picker':
        return listPickerData
      case 'call-to-action':
        return callToActionData
      case 'authentication':
        return authenticationData
      case 'location':
        return locationData
      default:
        return {}
    }
  }

  // Get variables for preview
  const getPreviewVariables = () => {
    const currentData = getCurrentTemplateData()
    const variables: Record<string, string> = {}
    
    if (currentData.variables) {
      currentData.variables.forEach((variable: TemplateVariable, index: number) => {
        if (variable.key && variable.value) {
          variables[variable.key] = variable.value
        } else {
          // Use placeholder values for empty variables
          variables[(index + 1).toString()] = `Exemple ${index + 1}`
        }
      })
    }

    // Add some default variables for preview
    if (templateType === 'authentication') {
      variables['1'] = '123456'
    }

    return variables
  }

  const validateTemplate = async () => {
    try {
      let templateBody = ''
      let variables: Record<string, string> = {}

      switch (templateType) {
        case 'text':
          templateBody = textTemplateData.body
          textTemplateData.variables.forEach(v => {
            if (v.key && v.value) variables[v.key] = v.value
          })
          break
        case 'media':
          templateBody = mediaTemplateData.body
          mediaTemplateData.variables.forEach(v => {
            if (v.key && v.value) variables[v.key] = v.value
          })
          break
        // Add other cases as needed
      }

      if (templateBody) {
        const result = await twilioTemplatesAPI.validateTemplateVariables({
          template_body: templateBody,
          variables
        })
        setValidationResult(result)
      }
    } catch (error) {
      console.error('Validation failed:', error)
      setValidationResult({ is_valid: false, message: 'Erreur de validation' })
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
  }, [status, router])

  const addVariable = (setData: any, currentData: any) => {
    const variableName = prompt('Entrez le nom de la variable:')
    if (!variableName || variableName.trim() === '') return // User cancelled or entered empty name
    
    const cleanVariableName = variableName.trim()
    
    setData({
      ...currentData,
      variables: [...currentData.variables, { key: cleanVariableName, value: '' }]
    })
  }

  const removeVariable = (setData: any, currentData: any, index: number) => {
    setData({
      ...currentData,
      variables: currentData.variables.filter((_: any, i: number) => i !== index)
    })
  }

  const updateVariable = (setData: any, currentData: any, index: number, field: 'key' | 'value', value: string) => {
    const newVariables = [...currentData.variables]
    newVariables[index][field] = value
    setData({
      ...currentData,
      variables: newVariables
    })
  }

  // Function to insert variable at cursor position in textarea
  const insertVariableAtCursor = (textareaRef: React.RefObject<HTMLTextAreaElement>, variableNumber: number, setData: any, currentData: any, bodyField: string = 'body') => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const startPos = textarea.selectionStart
    const endPos = textarea.selectionEnd
    const text = currentData[bodyField]
    const variable = `{{${variableNumber}}}`
    
    const newText = text.substring(0, startPos) + variable + text.substring(endPos)
    
    setData({
      ...currentData,
      [bodyField]: newText
    })

    // Set cursor position after the inserted variable
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(startPos + variable.length, startPos + variable.length)
    }, 0)
  }

  // Function to add variable and insert it at cursor
  const addVariableAndInsert = (setData: any, currentData: any, textareaRef: React.RefObject<HTMLTextAreaElement>, bodyField: string = 'body') => {
    const variableName = prompt('Entrez le nom de la variable:')
    if (!variableName || variableName.trim() === '') return // User cancelled or entered empty name
    
    const cleanVariableName = variableName.trim()
    const variableKey = `{{${cleanVariableName}}}`
    
    // Add variable to the list
    setData({
      ...currentData,
      variables: [...currentData.variables, { key: cleanVariableName, value: '' }]
    })

    // Insert variable in textarea at cursor position
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const startPos = textarea.selectionStart
    const endPos = textarea.selectionEnd
    const text = currentData[bodyField]
    
    const newText = text.substring(0, startPos) + variableKey + text.substring(endPos)
    
    setData({
      ...currentData,
      [bodyField]: newText
    })

    // Set cursor position after the inserted variable
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(startPos + variableKey.length, startPos + variableKey.length)
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let templateData = {}

      switch (templateType) {
        case 'text':
          // Remove variables from template data since they're extracted from body
          const { variables: textVars, ...textData } = textTemplateData
          templateData = textData
          break
        case 'media':
          const { variables: mediaVars, ...mediaData } = mediaTemplateData
          templateData = mediaData
          break
        case 'quick-reply':
          const { variables: quickVars, ...quickData } = quickReplyData
          templateData = quickData
          break
        case 'list-picker':
          const { variables: listVars, ...listData } = listPickerData
          templateData = listData
          break
        case 'call-to-action':
          const { variables: ctaVars, ...ctaData } = callToActionData
          templateData = ctaData
          break
        case 'authentication':
          const { variables: authVars, ...authData } = authenticationData
          templateData = authData
          break
        case 'location':
          const { variables: locationVars, ...locationData2 } = locationData
          templateData = locationData2
          break
      }

      const payload = {
        messaging_service_sid: messagingServiceSid,
        template_type: templateType as any,
        friendly_name: formData.friendly_name,
        language: formData.language,
        category: formData.category as any,
        template_data: templateData
      }

      await twilioTemplatesAPI.createTemplate(payload)
      router.push(`/dashboard/accounts/${accountId}/templates`)
    } catch (error) {
      console.error('Failed to create template:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderTemplateForm = () => {
    switch (templateType) {
      case 'text':
        return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-300">
                  Corps du message
                </label>
                <button
                  type="button"
                  onClick={() => addVariableAndInsert(setTextTemplateData, textTemplateData, textBodyRef)}
                  className="bg-neon-green/20 hover:bg-neon-green/30 text-neon-green px-3 py-1 rounded text-sm transition-colors"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  Ajouter variable
                </button>
              </div>
              <textarea
                ref={textBodyRef}
                value={textTemplateData.body}
                onChange={(e) => setTextTemplateData({ ...textTemplateData, body: e.target.value })}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-green/50 h-32"
                placeholder="Entrez le corps de votre message..."
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                Cliquez sur "Ajouter variable" pour insérer {'{'}{'{'}{'{'}1{'}'}{'}'}  à la position du curseur
              </p>
            </div>
          </div>
        )

      case 'media':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Type d'en-tête
              </label>
              <select
                value={mediaTemplateData.header_type}
                onChange={(e) => setMediaTemplateData({ ...mediaTemplateData, header_type: e.target.value })}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-green/50"
              >
                <option value="image">Image</option>
                <option value="video">Vidéo</option>
                <option value="document">Document</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                URL du média
              </label>
              <input
                type="url"
                value={mediaTemplateData.header_url}
                onChange={(e) => setMediaTemplateData({ ...mediaTemplateData, header_url: e.target.value })}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-green/50"
                placeholder="https://example.com/media.jpg"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-300">
                  Corps du message
                </label>
                <button
                  type="button"
                  onClick={() => addVariableAndInsert(setMediaTemplateData, mediaTemplateData, mediaBodyRef)}
                  className="bg-neon-green/20 hover:bg-neon-green/30 text-neon-green px-3 py-1 rounded text-sm transition-colors"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  Ajouter variable
                </button>
              </div>
              <textarea
                ref={mediaBodyRef}
                value={mediaTemplateData.body}
                onChange={(e) => setMediaTemplateData({ ...mediaTemplateData, body: e.target.value })}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-green/50 h-32"
                placeholder="Entrez le corps de votre message..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Pied de page (optionnel)
              </label>
              <input
                type="text"
                value={mediaTemplateData.footer}
                onChange={(e) => setMediaTemplateData({ ...mediaTemplateData, footer: e.target.value })}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-green/50"
                placeholder="Pied de page..."
              />
            </div>

            {/* Variables for preview */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-300">
                  Variables (valeurs pour prévisualisation)
                </label>
                <button
                  type="button"
                  onClick={() => addVariable(setMediaTemplateData, mediaTemplateData)}
                  className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-1 rounded text-sm transition-colors"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  Ajouter valeur
                </button>
              </div>
              {mediaTemplateData.variables.map((variable, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={variable.key}
                    onChange={(e) => updateVariable(setMediaTemplateData, mediaTemplateData, index, 'key', e.target.value)}
                    className="flex-1 bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-green/50"
                    placeholder="Clé (ex: 1)"
                  />
                  <input
                    type="text"
                    value={variable.value}
                    onChange={(e) => updateVariable(setMediaTemplateData, mediaTemplateData, index, 'value', e.target.value)}
                    className="flex-1 bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-green/50"
                    placeholder="Valeur (ex: John)"
                  />
                  <button
                    type="button"
                    onClick={() => removeVariable(setMediaTemplateData, mediaTemplateData, index)}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )

      case 'quick-reply':
        return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-300">
                  Corps du message
                </label>
                <button
                  type="button"
                  onClick={() => addVariableAndInsert(setQuickReplyData, quickReplyData, quickReplyBodyRef)}
                  className="bg-neon-green/20 hover:bg-neon-green/30 text-neon-green px-3 py-1 rounded text-sm transition-colors"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  Ajouter variable
                </button>
              </div>
              <textarea
                ref={quickReplyBodyRef}
                value={quickReplyData.body}
                onChange={(e) => setQuickReplyData({ ...quickReplyData, body: e.target.value })}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-green/50 h-32"
                placeholder="Entrez le corps de votre message..."
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-300">
                  Boutons de réponse rapide
                </label>
                <button
                  type="button"
                  onClick={() => setQuickReplyData({
                    ...quickReplyData,
                    buttons: [...quickReplyData.buttons, { text: '' }]
                  })}
                  className="bg-neon-green/20 hover:bg-neon-green/30 text-neon-green px-3 py-1 rounded text-sm transition-colors"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  Ajouter
                </button>
              </div>
              {quickReplyData.buttons.map((button, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={button.text}
                    onChange={(e) => {
                      const newButtons = [...quickReplyData.buttons]
                      newButtons[index].text = e.target.value
                      setQuickReplyData({ ...quickReplyData, buttons: newButtons })
                    }}
                    className="flex-1 bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-green/50"
                    placeholder="Texte du bouton"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setQuickReplyData({
                      ...quickReplyData,
                      buttons: quickReplyData.buttons.filter((_, i) => i !== index)
                    })}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Variables for preview */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-300">
                  Variables (valeurs pour prévisualisation)
                </label>
                <button
                  type="button"
                  onClick={() => addVariable(setQuickReplyData, quickReplyData)}
                  className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-1 rounded text-sm transition-colors"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  Ajouter valeur
                </button>
              </div>
              {quickReplyData.variables.map((variable, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={variable.key}
                    onChange={(e) => updateVariable(setQuickReplyData, quickReplyData, index, 'key', e.target.value)}
                    className="flex-1 bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-green/50"
                    placeholder="Clé (ex: nom)"
                  />
                  <input
                    type="text"
                    value={variable.value}
                    onChange={(e) => updateVariable(setQuickReplyData, quickReplyData, index, 'value', e.target.value)}
                    className="flex-1 bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-green/50"
                    placeholder="Valeur (ex: John)"
                  />
                  <button
                    type="button"
                    onClick={() => removeVariable(setQuickReplyData, quickReplyData, index)}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )

      case 'list-picker':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                En-tête
              </label>
              <input
                type="text"
                value={listPickerData.header}
                onChange={(e) => setListPickerData({ ...listPickerData, header: e.target.value })}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-green/50"
                placeholder="Titre de la liste"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Corps du message
              </label>
              <textarea
                value={listPickerData.body}
                onChange={(e) => setListPickerData({ ...listPickerData, body: e.target.value })}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-green/50 h-32"
                placeholder="Description de la liste"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Texte du bouton
              </label>
              <input
                type="text"
                value={listPickerData.button_text}
                onChange={(e) => setListPickerData({ ...listPickerData, button_text: e.target.value })}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-green/50"
                placeholder="Voir les options"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Pied de page (optionnel)
              </label>
              <input
                type="text"
                value={listPickerData.footer}
                onChange={(e) => setListPickerData({ ...listPickerData, footer: e.target.value })}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-green/50"
                placeholder="Pied de page..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-300">
                  Sections et éléments
                </label>
              </div>
              {listPickerData.sections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="border border-gray-700 rounded-lg p-4 mb-4">
                  <div className="mb-3">
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => {
                        const newSections = [...listPickerData.sections]
                        newSections[sectionIndex].title = e.target.value
                        setListPickerData({ ...listPickerData, sections: newSections })
                      }}
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-green/50"
                      placeholder="Titre de la section"
                      required
                    />
                  </div>
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={item.id}
                        onChange={(e) => {
                          const newSections = [...listPickerData.sections]
                          newSections[sectionIndex].items[itemIndex].id = e.target.value
                          setListPickerData({ ...listPickerData, sections: newSections })
                        }}
                        className="w-24 bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-green/50"
                        placeholder="ID"
                        required
                      />
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => {
                          const newSections = [...listPickerData.sections]
                          newSections[sectionIndex].items[itemIndex].title = e.target.value
                          setListPickerData({ ...listPickerData, sections: newSections })
                        }}
                        className="flex-1 bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-green/50"
                        placeholder="Titre de l'élément"
                        required
                      />
                      <input
                        type="text"
                        value={item.description || ''}
                        onChange={(e) => {
                          const newSections = [...listPickerData.sections]
                          newSections[sectionIndex].items[itemIndex].description = e.target.value
                          setListPickerData({ ...listPickerData, sections: newSections })
                        }}
                        className="flex-1 bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-green/50"
                        placeholder="Description (optionnel)"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newSections = [...listPickerData.sections]
                          newSections[sectionIndex].items = newSections[sectionIndex].items.filter((_, i) => i !== itemIndex)
                          setListPickerData({ ...listPickerData, sections: newSections })
                        }}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const newSections = [...listPickerData.sections]
                      newSections[sectionIndex].items.push({ id: '', title: '', description: '' })
                      setListPickerData({ ...listPickerData, sections: newSections })
                    }}
                    className="bg-neon-green/20 hover:bg-neon-green/30 text-neon-green px-3 py-1 rounded text-sm transition-colors"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Ajouter un élément
                  </button>
                </div>
              ))}
            </div>
          </div>
        )

      case 'call-to-action':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Corps du message
              </label>
              <textarea
                value={callToActionData.body}
                onChange={(e) => setCallToActionData({ ...callToActionData, body: e.target.value })}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-green/50 h-32"
                placeholder="Entrez le corps de votre message..."
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-300">
                  Boutons d'action
                </label>
                <button
                  type="button"
                  onClick={() => setCallToActionData({
                    ...callToActionData,
                    buttons: [...callToActionData.buttons, { type: 'url', text: '', url: '' }]
                  })}
                  className="bg-neon-green/20 hover:bg-neon-green/30 text-neon-green px-3 py-1 rounded text-sm transition-colors"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  Ajouter
                </button>
              </div>
              {callToActionData.buttons.map((button, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <select
                    value={button.type}
                    onChange={(e) => {
                      const newButtons = [...callToActionData.buttons]
                      newButtons[index].type = e.target.value as 'url' | 'phone'
                      if (e.target.value === 'url') {
                        delete newButtons[index].phone_number
                        newButtons[index].url = ''
                      } else {
                        delete newButtons[index].url
                        newButtons[index].phone_number = ''
                      }
                      setCallToActionData({ ...callToActionData, buttons: newButtons })
                    }}
                    className="w-32 bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-green/50"
                  >
                    <option value="url">URL</option>
                    <option value="phone">Téléphone</option>
                  </select>
                  <input
                    type="text"
                    value={button.text}
                    onChange={(e) => {
                      const newButtons = [...callToActionData.buttons]
                      newButtons[index].text = e.target.value
                      setCallToActionData({ ...callToActionData, buttons: newButtons })
                    }}
                    className="flex-1 bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-green/50"
                    placeholder="Texte du bouton"
                    required
                  />
                  <input
                    type={button.type === 'phone' ? 'tel' : 'url'}
                    value={button.type === 'phone' ? button.phone_number || '' : button.url || ''}
                    onChange={(e) => {
                      const newButtons = [...callToActionData.buttons]
                      if (button.type === 'phone') {
                        newButtons[index].phone_number = e.target.value
                      } else {
                        newButtons[index].url = e.target.value
                      }
                      setCallToActionData({ ...callToActionData, buttons: newButtons })
                    }}
                    className="flex-1 bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-green/50"
                    placeholder={button.type === 'phone' ? '+33123456789' : 'https://example.com'}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setCallToActionData({
                      ...callToActionData,
                      buttons: callToActionData.buttons.filter((_, i) => i !== index)
                    })}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )

      case 'authentication':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Corps du message
              </label>
              <textarea
                value={authenticationData.body}
                onChange={(e) => setAuthenticationData({ ...authenticationData, body: e.target.value })}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-green/50 h-32"
                placeholder="Votre code de vérification est {'{'}1{'}'}"
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                Utilisez {'{'}1{'}'} pour le code de vérification
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Longueur du code
              </label>
              <select
                value={authenticationData.code_length}
                onChange={(e) => setAuthenticationData({ ...authenticationData, code_length: parseInt(e.target.value) })}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-green/50"
              >
                <option value={4}>4 chiffres</option>
                <option value={6}>6 chiffres</option>
                <option value={8}>8 chiffres</option>
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="security_recommendation"
                checked={authenticationData.add_security_recommendation}
                onChange={(e) => setAuthenticationData({ ...authenticationData, add_security_recommendation: e.target.checked })}
                className="w-4 h-4 text-neon-green bg-gray-800 border-gray-600 rounded focus:ring-neon-green focus:ring-2"
              />
              <label htmlFor="security_recommendation" className="text-sm text-gray-300">
                Ajouter une recommandation de sécurité
              </label>
            </div>
          </div>
        )

      case 'location':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Corps du message
              </label>
              <textarea
                value={locationData.body}
                onChange={(e) => setLocationData({ ...locationData, body: e.target.value })}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-green/50 h-32"
                placeholder="Partagez votre localisation pour un service optimal"
                required
              />
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-blue-400 text-sm">
                ℹ️ Les templates de localisation permettent aux utilisateurs de partager leur position géographique
              </p>
            </div>
          </div>
        )

      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-400">Ce type de template n'est pas encore implémenté</p>
          </div>
        )
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neon-green"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const getTemplateTypeTitle = () => {
    const types = {
      'text': 'Template Texte',
      'media': 'Template Média',
      'quick-reply': 'Réponses Rapides',
      'list-picker': 'Liste de Choix',
      'call-to-action': 'Appel à l\'Action',
      'location': 'Localisation',
      'authentication': 'Authentification'
    }
    return types[templateType as keyof typeof types] || 'Template'
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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push(`/dashboard/accounts/${accountId}/templates`)}
                className="p-2 rounded-lg bg-neon-green/10 hover:bg-neon-green/20 text-neon-green transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white">Créer {getTemplateTypeTitle()}</h1>
                <p className="text-gray-400">Configurez votre nouveau template WhatsApp</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="bg-neon-green/20 hover:bg-neon-green/30 text-neon-green px-4 py-2 rounded-lg transition-colors"
              >
                <Eye className="w-5 h-5 inline mr-2" />
                {previewMode ? 'Éditer' : 'Prévisualiser'}
              </button>
              <button
                onClick={validateTemplate}
                className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg transition-colors"
              >
                Valider le template
              </button>
            </div>
          </div>

          {/* Main Content - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Form */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Validation Result */}
                {validationResult && (
                  <div className={`p-4 rounded-lg border ${
                    validationResult.is_valid 
                      ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                      : 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}>
                    <p className="font-medium">
                      {validationResult.is_valid ? '✅ Template valide' : '❌ Template invalide'}
                    </p>
                    {validationResult.message && (
                      <p className="text-sm mt-1">{validationResult.message}</p>
                    )}
                  </div>
                )}

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Nom du template
                    </label>
                    <input
                      type="text"
                      value={formData.friendly_name}
                      onChange={(e) => setFormData({ ...formData, friendly_name: e.target.value })}
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-green/50"
                      placeholder="Nom unique du template"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Langue
                    </label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-green/50"
                    >
                      <option value="en">Anglais</option>
                      <option value="fr">Français</option>
                      <option value="es">Espagnol</option>
                      <option value="de">Allemand</option>
                      <option value="it">Italien</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Catégorie
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-green/50"
                    >
                      <option value="MARKETING">Marketing</option>
                      <option value="UTILITY">Utilitaire</option>
                      <option value="AUTHENTICATION">Authentification</option>
                    </select>
                  </div>
                </div>

                {/* Template Specific Form */}
                {renderTemplateForm()}

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-neon-green/20 hover:bg-neon-green/30 text-neon-green px-6 py-3 rounded-lg transition-colors border border-neon-green/20 hover:border-neon-green/40 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-neon-green inline mr-2"></div>
                    ) : (
                      <Save className="w-5 h-5 inline mr-2" />
                    )}
                    {loading ? 'Création...' : 'Créer le template'}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column - Preview */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Aperçu WhatsApp</h2>
                <WhatsAppPreview
                  templateType={templateType as any}
                  templateData={getCurrentTemplateData()}
                  variables={getPreviewVariables()}
                  className="sticky top-4"
                />
              </div>

              {/* Variables Display */}
              <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                <h3 className="text-lg font-medium text-white mb-3">Variables de prévisualisation</h3>
                <div className="space-y-2">
                  {Object.entries(getPreviewVariables()).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between text-sm">
                      <code className="text-neon-green">{'{'}{'{'}{key}{'}'}{'{'}:'}</code>
                      <span className="text-gray-300">{value}</span>
                    </div>
                  ))}
                  {Object.keys(getPreviewVariables()).length === 0 && (
                    <p className="text-gray-500 text-sm">Aucune variable définie</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
