📋 PLAN D'ACTION DÉTAILLÉ - SYSTÈME WEBSOCKET TEMPS RÉEL
🎯 OBJECTIFS
WebSocket temps réel avec Django Channels pour:

Mise à jour en temps réel des conversations
Réception instantanée des nouveaux messages
Changements de statut en direct
Synchronisation multi-onglets/appareils
Filtres avancés pour les conversations (bien au-delà du statut)

Architecture stable et scalable:

Multi-instance support avec Redis
Connexion persistante (même en background comme WhatsApp)
Gestion automatique des reconnexions
Performance optimisée
📝 PHASE 1: INFRASTRUCTURE BACKEND (Django Channels)
1.1 Installation de Django Channels + Redis
Fichiers à modifier/créer:

✅ base.txt - Ajouter:
1.2 Configuration Django Channels
Fichiers:

✅ base.py - Ajouter:

INSTALLED_APPS: 'daphne' (en premier), 'channels'
Configuration ASGI_APPLICATION
CHANNEL_LAYERS avec Redis backend
✅ asgi.py - Remplacer par une config Channels complète:

ProtocolTypeRouter
AuthMiddlewareStack
URLRouter pour WebSocket
1.3 Création du système WebSocket
Nouveaux fichiers à créer:

✅ infinity_chat_backend/cw/consumers.py

ConversationConsumer - Consumer principal WebSocket
Gestion des connexions/déconnexions
Authentification JWT/Token
Groupes par account_id pour broadcast ciblé
Heartbeat/ping-pong pour keep-alive
✅ infinity_chat_backend/cw/routing.py

Routes WebSocket
Pattern: /ws/conversations/<account_id>/
1.4 Signaux Django pour événements temps réel
Fichier à créer:

✅ infinity_chat_backend/cw/signals.py
Signal post_save sur Messages → broadcast nouveau message
Signal post_save sur Conversations → broadcast mise à jour
Envoi via Channels layers vers les WebSocket clients
📝 PHASE 2: FILTRES AVANCÉS (Backend)
2.1 Amélioration des filtres de conversations
Fichier: views.py

Ajouter ces filtres dans ConversationViewSet.get_queryset():

Filtres existants améliorés:

✅ Status (0=open, 1=resolved, 2=pending, 3=closed)
✅ Priority (0=low, 1=medium, 2=high, 3=urgent)
✅ Assignee (par user_id)
✅ Search (contact name, content)
Nouveaux filtres à ajouter:

✅ Inbox (inbox_id) - Filtrer par boîte de réception
✅ Team (team_id) - Filtrer par équipe
✅ Unassigned (unassigned=true) - Conversations non assignées
✅ Labels/Tags (labels=tag1,tag2)
✅ Contact Type (contact_type=customer|lead|vip)
✅ Date Range (created_after, created_before)
✅ Last Activity (last_activity_after, last_activity_before)
✅ Has Unread (has_unread=true)
✅ Snoozed (is_snoozed=true)
✅ Waiting for (waiting_for=customer|agent)
✅ Multiple statuses (status=0,1) - Filtrer par plusieurs statuts
✅ Sorting (ordering=-last_activity_at,-priority)
2.2 Nouveau serializer pour les filtres
Fichier: serializers.py

✅ ConversationFilterSerializer - Validation des paramètres de filtre
📝 PHASE 3: WEBSOCKET CLIENT (Frontend Next.js)
3.1 Hook WebSocket personnalisé
Nouveau fichier: src/hooks/useWebSocket.ts

Fonctionnalités:

✅ Connexion WebSocket avec authentification (token dans URL ou headers)
✅ Auto-reconnexion exponentielle (1s, 2s, 4s, 8s...)
✅ Heartbeat/ping pour maintenir connexion
✅ Gestion des événements (onMessage, onConnect, onDisconnect)
✅ État de connexion (connecting, connected, disconnected)
✅ Buffer des messages si déconnecté
✅ Page Visibility API - Maintien connexion même en background
3.2 Hook spécifique conversations
Nouveau fichier: src/hooks/useConversationsWebSocket.ts

Fonctionnalités:

✅ Connexion au WebSocket des conversations
✅ Écoute des événements:
conversation.new - Nouvelle conversation
conversation.updated - Mise à jour (status, assignee, etc.)
message.new - Nouveau message
message.updated - Message édité/supprimé
conversation.read - Marqué comme lu
typing.start / typing.stop - Indicateur de frappe
✅ Mise à jour automatique du state React
3.3 Context Provider
Nouveau fichier: src/contexts/ConversationsContext.tsx

✅ État global des conversations
✅ État global des messages de la conversation sélectionnée
✅ Filtres actifs
✅ WebSocket intégré
✅ Fonctions: sendMessage, updateConversation, etc.
📝 PHASE 4: COMPOSANTS UI AVEC FILTRES
4.1 Barre de filtres avancés
Nouveau fichier: src/app/dashboard/accounts/[accountId]/conversations/components/ConversationFilters.tsx

Composants de filtre:

✅ Multi-select Status (checkboxes)
✅ Multi-select Priority
✅ Select Inbox
✅ Select Team
✅ Select Assignee
✅ Toggle Unassigned
✅ Date Range Picker
✅ Tags/Labels Multi-select
✅ Search bar améliorée
✅ Bouton "Clear Filters"
✅ Indicateur nombre de filtres actifs
4.2 Mise à jour des composants existants
Fichiers à modifier:

page.tsx

✅ Intégrer ConversationsContext
✅ Remplacer fetch par WebSocket
✅ Ajouter gestion des filtres avancés
✅ Ajouter composant ConversationFilters
ConversationsList.tsx

✅ Indicateur temps réel (badge "LIVE")
✅ Animation d'arrivée des nouveaux messages
✅ Badge "Nouveau" sur nouvelles conversations
✅ Indicateur de frappe ("typing...")
MessagesSection.tsx

✅ Auto-scroll sur nouveau message
✅ Indicateur d'envoi (pending, sent, delivered, read)
✅ Optimistic UI (message apparaît avant confirmation serveur)
✅ Indicateur "L'autre personne est en train d'écrire..."
📝 PHASE 5: FONCTIONNALITÉS AVANCÉES
5.1 Envoi via WebSocket
Backend: Ajouter dans ConversationConsumer

✅ Action send_message via WebSocket
✅ Action update_status via WebSocket
✅ Action mark_as_read via WebSocket
✅ Action start_typing / stop_typing
5.2 Notifications
Frontend:

✅ Notification browser (si permission)
✅ Badge nombre de conversations non lues
✅ Son de notification (optionnel)
5.3 Performance
Backend:

✅ Index sur Conversations.last_activity_at
✅ Index sur Conversations.status
✅ Index sur Messages.conversation_id, created_at
✅ Pagination côté serveur via WebSocket
Frontend:

✅ Virtual scrolling pour listes longues (react-window)
✅ Lazy loading des messages anciens
✅ Cache avec React Query
📝 PHASE 6: MULTI-INSTANCE & SCALABILITÉ
6.1 Configuration Redis
Fichiers:

✅ docker-compose.local.yml - Service Redis si pas déjà présent
✅ base.py - CHANNEL_LAYERS avec Redis
6.2 Tests de charge
Nouveau fichier: tests/test_websocket_load.py

✅ Test connexions multiples
✅ Test broadcast à grande échelle
✅ Test reconnexion
📝 PHASE 7: MONITORING & DEBUG
7.1 Logging
✅ Logger toutes les connexions/déconnexions WebSocket
✅ Logger les erreurs de broadcast
✅ Métriques: nombre de connexions actives
7.2 Admin panel
Nouveau fichier: Dashboard admin pour:

✅ Voir les connexions WebSocket actives
✅ Forcer déconnexion
✅ Statistiques temps réel
🗂️ STRUCTURE FINALE DES FICHIERS
⚡ ORDRE D'IMPLÉMENTATION RECOMMANDÉ
Sprint 1: Infrastructure (2-3 jours)
✅ Installer Django Channels + Redis
✅ Configurer ASGI + Channels
✅ Créer ConversationConsumer basique
✅ Créer routing WebSocket
✅ Tester connexion WebSocket simple
Sprint 2: Backend Events (2 jours)
✅ Créer signals.py
✅ Implémenter broadcast messages
✅ Implémenter broadcast conversations
✅ Tester events temps réel
Sprint 3: Filtres Backend (1 jour)
✅ Ajouter tous les filtres dans views.py
✅ Tester filtres via API REST
Sprint 4: Frontend WebSocket (2-3 jours)
✅ Créer useWebSocket.ts
✅ Créer useConversationsWebSocket.ts
✅ Créer ConversationsContext
✅ Intégrer dans page.tsx
Sprint 5: UI & Filtres (2 jours)
✅ Créer ConversationFilters.tsx
✅ Mettre à jour ConversationsList
✅ Mettre à jour MessagesSection
✅ Ajouter animations
Sprint 6: Features Avancées (2 jours)
✅ Envoi message via WebSocket
✅ Typing indicators
✅ Notifications
✅ Optimistic UI
Sprint 7: Tests & Optimisation (1-2 jours)
✅ Tests multi-instance
✅ Tests reconnexion
✅ Performance optimization
✅ Monitoring
🎨 EXEMPLE DE FLOW
Scénario: Nouveau message reçu
WhatsApp/Service externe → Message arrive
Backend → Sauvegarde dans DB (Messages.create())
Signal → post_save détecté sur Messages
Channels → Broadcast vers groupe conversation_<account_id>
Frontend → WebSocket reçoit événement message.new
React State → Mise à jour immédiate du state
UI → Animation + scroll + notification
🔒 SÉCURITÉ
✅ Authentification Token dans WebSocket
✅ Vérification account_id = user a accès
✅ Validation de toutes les actions WebSocket
✅ Rate limiting sur envoi de messages
✅ CORS configuré correctement
✅ AVANTAGES DE CETTE ARCHITECTURE
Temps réel véritable comme WhatsApp
Scalable avec Redis pour multi-instance
Stable avec reconnexion automatique
Performant avec optimistic UI et cache
Flexible avec nombreux filtres
Maintenable avec code bien structuré
Testable avec signaux et consumers isolés
❓ QUESTIONS AVANT DE COMMENCER ?
Voulez-vous que je :

✅ Commence immédiatement par le Sprint 1 ?
📝 Vous donne plus de détails sur une phase spécifique ?
🔧 Ajuste certaines fonctionnalités du plan ?