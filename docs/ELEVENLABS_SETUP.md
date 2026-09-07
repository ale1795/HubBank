# Guía de Configuración Oficial: ElevenLabs Conversational AI

Esta guía explica paso a paso cómo conectar **Nito Banking Assistant** con **ElevenLabs Conversational AI / ElevenAgents** y enlazar las herramientas bancarias del backend de **Banco Visionario**.

---

## 1. Crear el Agente en ElevenLabs
1. Ingresa a la plataforma de [ElevenLabs](https://elevenlabs.io) y selecciona la sección **Conversational AI / ElevenAgents**.
2. Haz clic en **Create Agent** y selecciona **Blank Template**.
3. Asigna el nombre: `Nito - Banco Visionario`.

---

## 2. Configurar Voz y Modelo Conversacional
1. **Model**: Selecciona `Claude 3.5 Sonnet` o `GPT-4o-mini` (optimizado para baja latencia en diálogo).
2. **Language**: `Spanish (es)`.
3. **Voice**: Selecciona una voz profesional, cálida y ejecutiva (ej. `Paulina` o `Monica`).
4. **First Message**:
   ```text
   Hola, Juan. Buenas tardes. ¿En qué puedo ayudarte hoy?
   ```

---

## 3. Configurar el System Prompt
Copia íntegramente el prompt del archivo [`/docs/ELEVENLABS_AGENT_PROMPT.md`](file:///c:/Users/guillermoc/project/HubBank/docs/ELEVENLABS_AGENT_PROMPT.md) y pégalo en el campo **System Prompt**.

---

## 4. Configurar las Tools (Webhooks)
En la pestaña **Tools**, agrega cada uno de los siguientes endpoints REST (detallados en [`/docs/ELEVENLABS_TOOLS.md`](file:///c:/Users/guillermoc/project/HubBank/docs/ELEVENLABS_TOOLS.md)):

* `get_customer_profile` (`GET /api/customer/profile`)
* `get_accounts` (`GET /api/accounts`)
* `get_transactions` (`GET /api/transactions`)
* `get_loans` (`GET /api/loans`)
* `verify_transaction` (`POST /api/transactions/{transaction_id}/verify`)
* `report_fraud` (`POST /api/fraud/report`)
* `block_card` (`POST /api/cards/{card_id}/block`)
* `validate_transfer` (`POST /api/transfer/validate`)
* `execute_transfer` (`POST /api/transfer/execute`)
* `human_handoff` (`POST /api/handoff`)
* `audit_event` (`POST /api/audit/event`)

Configura en los Headers:
```http
Authorization: Bearer visionario_atena_sec_99482
Content-Type: application/json
```

---

## 5. Variables de Entorno en el Backend
En el servidor FastAPI / Node, configura:
```env
ELEVENLABS_API_KEY=tu_api_key_aqui
ELEVENLABS_AGENT_ID=agent_xxxxxxxxxxxxxx
ATENA_API_KEY=visionario_atena_sec_99482
```

> **Nota de Seguridad**: Nunca expongas tu `ELEVENLABS_API_KEY` en el código del cliente React.

---

## 6. Probar la Conversación
Inicia la conversación por voz diciendo:
> *"Tengo una transacción que no reconozco."*

Nito guiará la autenticación, identificará el retiro de $300 en ATM Centro, radicará el caso de reclamo `FRA-20260905-00421` y bloqueará la tarjeta terminada en 4829 tras tu confirmación explícita.
