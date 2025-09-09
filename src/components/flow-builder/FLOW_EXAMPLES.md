# Exemples de flows avec les nouveaux nodes Delay

## Flow 1: Service Client avec Rappels Intelligents

```
[User Input: "Besoin d'aide"] 
    ↓
[Message: "Merci, nous vous répondons sous 5 min"]
    ↓
[Delay: 5min non-bloquant, reset sur message]  ← Si user répond, timer reset
    ↓                                          ↘
[Continue: Résoudre conversation]               [Message: "Êtes-vous toujours là?"]
                                                   ↓
                                               [Delay: 10min non-bloquant]
                                                   ↓
                                               [Transfert vers agent]
```

## Flow 2: Booking avec Rappels RDV

```
[User: "Je veux un RDV"]
    ↓
[AI: Collecte infos + Booking]  → [Context: appointment_datetime]
    ↓
[Message: "RDV confirmé pour {{context.appointment_datetime}}"]
    ↓
[Delay: Absolut {{context.appointment_datetime_minus_24h}}] → [Message: "RDV demain"]
    ↓                                                            ↓
[End conversation]                                           [Delay: Absolute {{context.appointment_datetime_minus_1h}}]
                                                                ↓
                                                           [Message: "RDV dans 1h"]
                                                                ↓
                                                           [Delay: Absolute {{context.appointment_datetime_plus_1h}}]
                                                                ↓
                                                           [Message: "Comment s'est passé votre RDV?"]
```

## Flow 3: Lead Nurturing

```
[User: "Informations produit"]
    ↓
[Message: "Voici nos produits..."]
    ↓
[Delay: 1 jour non-bloquant] → [Message: "Avez-vous des questions?"]
    ↓                              ↓
[End]                          [Delay: 3 jours non-bloquant]
                                   ↓
                               [Message: "Offre spéciale -20%"]
                                   ↓
                               [Delay: 1 semaine non-bloquant]
                                   ↓
                               [Message: "Dernière chance!"]
```

## Configuration Examples:

### 1. Rappel RDV 24h avant
```json
{
  "blocking": false,
  "timing_mode": "absolute_date",
  "execute_at": "{{context.appointment_datetime_minus_24h}}",
  "timezone": "Europe/Paris",
  "scheduled_action": {
    "type": "message",
    "content": "Rappel: RDV demain à {{context.appointment_time}}"
  }
}
```

### 2. Check inactivité 30min
```json
{
  "seconds": 1800,
  "blocking": false,
  "timing_mode": "delay_from_last_message",
  "reset_on_user_response": true,
  "scheduled_action": {
    "type": "message",
    "content": "Êtes-vous toujours là? Besoin d'aide?"
  }
}
```

### 3. Follow-up sequence
```json
{
  "seconds": 86400,
  "blocking": false,
  "timing_mode": "fixed_delay",
  "scheduled_action": {
    "type": "continue_flow"
  }
}
```

Ces configurations permettent de créer des flows sophistiqués avec des interactions naturelles et des rappels intelligents.
