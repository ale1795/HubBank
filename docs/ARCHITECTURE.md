# Arquitectura: AI Banking Hub — Banco Visionario & Nito AI

Este documento describe la arquitectura modular, los flujos conversacionales, la topología multi-agente y la estrategia de integración para evolucionar el prototipo desde **MOCK APIs** hacia **ElevenLabs Conversational AI + Core Bancario / Oracle**.

---

## 1. Topología del Sistema

```mermaid
graph TD
    Client[Cliente / Navegador Web / Mobile] -->|Audio & WebRTC| ElevenLabs[ElevenLabs Conversational AI Platform]
    Client -->|HTTPS REST & UI Sync| FrontendApp[React / TypeScript Banking App]
    
    subgraph ElevenLabs Agent Layer
        ElevenLabs -->|Webhook HTTPS Tools| AtenaAPI[Nito Banking Gateway API]
        Dispatcher[Nito Banking Assistant] --> FraudAgent[Nito Fraud Agent]
        Dispatcher --> LoansAgent[Nito Loans Agent]
        Dispatcher --> HumanSupervisor[Nito Human Handoff Bridge]
    end

    subgraph Nito Banking Services
        AtenaAPI --> AuthSvc[/api/customer/profile]
        AtenaAPI --> AcctSvc[/api/accounts]
        AtenaAPI --> TxSvc[/api/transactions]
        AtenaAPI --> CardSvc[/api/cards/:id/block]
        AtenaAPI --> FraudSvc[/api/fraud/report]
        AtenaAPI --> LoanSvc[/api/loans]
        AtenaAPI --> HandoffSvc[/api/handoff]
        AtenaAPI --> AuditSvc[/api/audit/event]
    end

    subgraph Enterprise Banking Core [Fase Futura]
        AtenaAPI -.-> OracleCore[(Oracle Banking / Flexcube Core)]
        AtenaAPI -.-> CardSwitch[(Procesador de Tarjetas / Switch)]
        AtenaAPI -.-> CRM[(Salesforce / CRM Bancario)]
        AtenaAPI -.-> FraudEngine[(Motor Antifraude Enterprise)]
    end
```

---

## 2. Componentes Principales

### A. Capa de Conversación y Voz (ElevenLabs)
- **Speech-to-Text (STT)**: Transcribe la voz del cliente con latencia ultra-baja.
- **Conversational AI Engine**: Gestiona la política del diálogo, los turnos de conversación y la extracción de parámetros.
- **Tool Calling**: Invoca endpoints REST autorizados para consultar saldos, verificar transacciones o bloquear plásticos.
- **Text-to-Speech (TTS)**: Síntesis de voz con prosodia natural en español.

### B. Capa de Middleware & Nito Gateway API
- Valida los tokens Bearer (`ATENA_API_KEY`) enviados por ElevenLabs.
- Aplica **guardrails de seguridad**:
  - Requiere autenticación conversacional previa antes de exponer datos sensibles.
  - Exige confirmación explícita del cliente antes de ejecutar acciones mutables (bloqueo de tarjeta, creación de reclamo).
  - Bloquea recomendaciones financieras no autorizadas y deriva automáticamente a asesores certificados.
- Emite eventos inmutables a la bitácora de auditoría (`AI Audit Trail`).

### C. Capa de Frontend y Visualización en Vivo
- React 18 + Vite + Tailwind CSS + Lucide Icons.
- **Visualizador de Ondas de Audio**: Canvas interactivo que refleja en tiempo real los estados de `LISTENING`, `THINKING` y `SPEAKING`.
- **Componentes Embebidos en Chat**: Tarjetas interactivas que sincronizan visualmente la investigación de fraude, el estado de bloqueo de la tarjeta y los préstamos.

---

## 3. Matriz de Agentes Especializados (Multi-Agent Banking)

| Agente | Responsabilidad | Disparador de Intención | Herramientas Asignadas |
|---|---|---|---|
| **Nito Banking Assistant** | Agente principal, bienvenida, saldos y cuentas | `BALANCE_QUERY`, `TRANSACTION_QUERY`, `SESSION_INITIALIZED` | `get_customer_profile`, `get_accounts`, `get_transactions` |
| **Nito Fraud Agent** | Investigación de transacciones sospechosas, bloqueo preventivo y radicación de casos | `UNRECOGNIZED_TRANSACTION`, `FRAUD_REPORT`, `CARD_BLOCK` | `verify_transaction`, `report_fraud`, `block_card` |
| **Nito Loans Agent** | Consulta de amortizaciones, cuotas y condiciones de créditos personales | `LOAN_QUERY`, `LOAN_PAYMENT` | `get_loans` |
| **Nito Human Bridge** | Escalamiento con transferencia de contexto enriquecido a asesores humanos | `HUMAN_AGENT`, `POLICY_FINANCIAL_ADVICE_RESTRICTION` | `human_handoff`, `audit_event` |

---

## 4. Evolución de MOCK a Core Bancario Real

Para conectar la plataforma a un core bancario real (Oracle / SAP Banking / Flexcube):
1. Reemplazar los controladores en `server/index.js` por llamadas a los microservicios enterprise o colas MQ del banco.
2. Configurar autenticación mTLS / OAuth2 entre ElevenLabs y la API Gateway bancaria.
3. Vincular el Webhook de auditoría con la plataforma SIEM / Splunk corporativa.
