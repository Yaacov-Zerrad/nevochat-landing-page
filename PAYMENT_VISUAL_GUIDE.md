# 🎨 Payment System - Visual Guide

## 📱 Subscription Page Layout

```
┌────────────────────────────────────────────────────────────────┐
│  💳 Abonnement & Facturation                                   │
│  Gérez votre abonnement et consultez votre historique         │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  Professional Plan                            [Actif]          │
│  Advanced features for growing businesses     [Gérer...]       │
│  $100/mois                                                     │
│                                                                │
│  ┌──────────────────────────┐  ┌──────────────────────────┐  │
│  │ Flows Chatbot            │  │ Conversations            │  │
│  │ 15 / 30                  │  │ 8 / 30                   │  │
│  │ ████████░░░░ 50%         │  │ ████░░░░░░░░ 27%         │  │
│  │ Renouvellement quotidien │  │ Renouvellement quotidien │  │
│  └──────────────────────────┘  └──────────────────────────┘  │
│                                                                │
│  ✓ Service Client     ✓ Intégrations                          │
└────────────────────────────────────────────────────────────────┘

Plans Disponibles

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ Free Plan        │  │ [Populaire]      │  │ Enterprise       │
│                  │  │ Professional     │  │                  │
│ Gratuit          │  │ $100/mois        │  │ Contactez-nous   │
│                  │  │                  │  │                  │
│ ✓ 5 flows/jour   │  │ ✓ 30 flows/jour  │  │ ✓ Unlimited      │
│ ✓ 5 convs/jour   │  │ ✓ 30 convs/jour  │  │ ✓ Unlimited      │
│ ✗ Service Client │  │ ✓ Service Client │  │ ✓ Service Client │
│ ✗ Intégrations   │  │ ✗ Intégrations   │  │ ✓ Intégrations   │
│                  │  │                  │  │                  │
│ [Actuel]         │  │ [Mettre à niv.]  │  │ [Contactez-nous] │
└──────────────────┘  └──────────────────┘  └──────────────────┘

Historique des Paiements

┌────────────────────────────────────────────────────────────────┐
│ Date       │ Description            │ Montant │ Statut  │ Méth.│
│────────────┼────────────────────────┼─────────┼─────────┼──────│
│ 26/10/2025 │ Payment for Pro Plan   │ $100    │ Réussi  │ card │
│ 26/09/2025 │ Payment for Pro Plan   │ $100    │ Réussi  │ card │
│ 26/08/2025 │ Payment for Pro Plan   │ $100    │ Réussi  │ card │
└────────────────────────────────────────────────────────────────┘
```

## 🎨 Color Scheme

### Primary Colors
- **Neon Green**: `#00FF9D` - Primary accent
- **Dark BG**: `from-gray-900 via-green-900 to-emerald-900`
- **Card BG**: `bg-black/40` with backdrop blur
- **Borders**: `border-neon-green/20`

### Status Colors
- **Active/Success**: Green (`bg-green-500/20 text-green-400`)
- **Warning**: Yellow (`bg-yellow-500/20 text-yellow-400`)
- **Error/Critical**: Red (`bg-red-500/20 text-red-400`)
- **Info**: Blue (`bg-blue-500/20 text-blue-400`)

### Usage Bar Colors
- **< 70%**: Neon Green (`bg-neon-green`)
- **70-90%**: Yellow (`bg-yellow-500`)
- **> 90%**: Red (`bg-red-500`)

## 🔄 User Interactions

### 1. Plan Upgrade Flow
```
User clicks "Mettre à niveau" 
      ↓
Button shows loading spinner
      ↓
API creates Stripe checkout session
      ↓
User redirected to Stripe (secure payment page)
      ↓
User completes payment
      ↓
Stripe redirects back with success
      ↓
Page reloads, shows updated subscription
```

### 2. Manage Subscription Flow
```
User clicks "Gérer l'abonnement"
      ↓
API creates portal session
      ↓
User redirected to Stripe Customer Portal
      ↓
User can: Cancel, Update Card, View Invoices
      ↓
User clicks "Return to app"
      ↓
Back to subscription page
```

## 📊 Component States

### Loading State
```tsx
<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neon-green"></div>
```

### Error State
```tsx
<div className="bg-red-500/20 border border-red-500/40 rounded-lg p-4">
  <p className="text-red-400">{error}</p>
</div>
```

### Empty State (No Payments)
- Payment history section hidden
- Only shown when payments exist

### Processing State
```tsx
<button disabled className="opacity-50 cursor-wait">
  <div className="animate-spin h-4 w-4 border-b-2"></div>
  Traitement...
</button>
```

## 🎭 Animations

All animations use **Framer Motion**:

### Page Elements
```tsx
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.1 }}
```

### Plan Cards (Staggered)
```tsx
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.3 + index * 0.1 }}
```

### Hover Effects
```tsx
whileHover={{ scale: 1.02 }}
```

## 📱 Responsive Breakpoints

### Mobile (< 768px)
- Single column layout
- Stacked usage cards
- Full-width buttons
- Horizontal scroll for table

### Tablet (768px - 1024px)
- 2-column plan grid
- Side-by-side usage cards

### Desktop (> 1024px)
- 3-column plan grid
- Max-width container (7xl)
- Full table width

## 🎯 Key Features

### ✅ Usage Progress Bars
- Real-time percentage calculation
- Color-coded warnings
- Smooth transitions
- Daily reset indicator

### ✅ Plan Cards
- Popular badge for Professional
- Feature comparison
- Disabled state for Enterprise (contact sales)
- Current plan filtered out

### ✅ Payment History
- Sortable by date
- Status badges
- Auto-formats dates (fr-FR)
- Responsive table

### ✅ Error Handling
- Network errors
- Stripe errors
- Missing data
- Loading states

## 🔐 Security Features

- ✅ Authentication required
- ✅ Token-based API calls
- ✅ No card data in frontend
- ✅ Stripe handles PCI compliance
- ✅ Webhook verification (backend)
- ✅ HTTPS only in production

## 🌍 Localization Ready

Current: **French** (hardcoded)

To add Hebrew:
```tsx
// Add to i18n/he.json
{
  "subscription": {
    "title": "מנוי וחיוב",
    "manage": "נהל מנוי",
    "upgrade": "שדרג",
    // ...
  }
}

// Use in component
const { t } = useTranslation()
<h1>{t('subscription.title')}</h1>
```

---

**Design Philosophy**: 
- Dark, modern, tech-focused
- Neon green accent for energy
- Glass-morphism for depth
- Smooth animations for polish
- Clear information hierarchy
