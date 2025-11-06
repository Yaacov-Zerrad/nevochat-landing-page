# ChatbotPlayground Component

Un composant réutilisable pour tester le chatbot dans l'application.

## Caractéristiques

- 🎮 **Test interactif** : Interface de chat complète pour tester le bot
- 🔄 **Réponses multiples** : Gère automatiquement plusieurs réponses du bot
- ⚙️ **Configuration flexible** : Modifier le numéro de téléphone et le nom du contact
- 🎨 **Design cohérent** : S'intègre parfaitement avec le design de l'application
- 📱 **Responsive** : Adapté pour différentes tailles d'écran
- 🔌 **Réutilisable** : Peut être utilisé n'importe où dans l'application

## Utilisation

### Utilisation basique

```tsx
import ChatbotPlayground from '@/components/ChatbotPlayground';

function MyPage() {
  return (
    <div>
      {/* Votre contenu */}
      <ChatbotPlayground />
    </div>
  );
}
```

### Avec un flow spécifique

```tsx
import ChatbotPlayground from '@/components/ChatbotPlayground';

function FlowBuilderPage() {
  const flowId = '123';
  
  return (
    <div>
      {/* Votre contenu */}
      <ChatbotPlayground flowId={flowId} />
    </div>
  );
}
```

## Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `flowId` | `string \| undefined` | `undefined` | ID du flow à tester (optionnel) |

## Fonctionnalités

### 1. Génération automatique des identifiants
- Génère automatiquement un numéro de téléphone et un nom de contact
- Les valeurs par défaut sont générées au premier chargement

### 2. Configuration personnalisable
- Cliquez sur l'icône ⚙️ pour ouvrir les paramètres
- Modifiez le numéro de téléphone et le nom du contact
- La conversation est réinitialisée lors du changement des paramètres

### 3. Gestion des messages
- Envoi de messages texte
- Réception de réponses multiples du bot
- Affichage de l'horodatage des messages
- Indicateur de chargement pendant l'envoi

### 4. Effacer la conversation
- Cliquez sur l'icône 🗑️ pour effacer tous les messages
- Permet de recommencer une nouvelle conversation

## API

Le composant utilise l'endpoint `/api/chatbot/messages/web` pour communiquer avec le backend.

### Requête

```json
{
  "sender": "+972545564449",
  "contact_name": "Test User",
  "body": "Hello",
  "account_id": 1,
  "flow_id": "123" // optionnel
}
```

### Réponse

```json
{
  "detail": "Web message received.",
  "messages": [
    "Bonjour! Comment puis-je vous aider?",
    "Voici les options disponibles..."
  ]
}
```

## Détection automatique du compte

Le composant détecte automatiquement l'`accountId` à partir de l'URL :
- Utilise `useParams()` pour récupérer le paramètre `accountId` de l'URL
- Fonctionne dans n'importe quelle page sous `/dashboard/accounts/[accountId]/*`

## Styling

Le composant utilise les classes Tailwind CSS cohérentes avec le reste de l'application :
- `neon-green` pour les accents
- `gray-900`, `gray-800` pour les arrière-plans
- Animations et transitions fluides
- Design glassmorphism avec `backdrop-blur`

## Exemples d'utilisation

### Dans une page de dashboard

```tsx
// src/app/dashboard/accounts/[accountId]/page.tsx
import ChatbotPlayground from '@/components/ChatbotPlayground';

export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1>Dashboard</h1>
      {/* Autre contenu */}
      <ChatbotPlayground />
    </div>
  );
}
```

### Dans une page de test

```tsx
// src/app/dashboard/accounts/[accountId]/test/page.tsx
import ChatbotPlayground from '@/components/ChatbotPlayground';

export default function TestPage() {
  return (
    <div>
      <ChatbotPlayground />
    </div>
  );
}
```

## Notes

- Le composant est positionné en `fixed bottom-6 right-6` par défaut
- Il apparaît comme un bouton flottant qui s'ouvre en modal
- Les messages sont automatiquement scrollés vers le bas
- Les erreurs sont affichées comme des messages du bot en rouge
