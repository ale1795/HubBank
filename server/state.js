// In-memory persistent state for the mock banking core
export const state = {
  customer: {
    customer_id: "CUS-001",
    first_name: "Guillermo",
    last_name: "Calderón",
    email: "guillermo.calderon@visionario.bank",
    phone_masked: "+503 7***-**89",
    birth_date_masked: "14/**/1988",
    authenticated: true,
    segment: "PREMIUM_EXECUTIVE",
    identity_verified: false,
    identity_verification_status: "Not Started"
  },
  accounts: [
    {
      account_id: "ACC-001",
      account_number_masked: "**** **** **** 8920",
      type: "Corriente",
      balance: 4285.42,
      available_balance: 4285.42,
      currency: "USD",
      status: "ACTIVE"
    },
    {
      account_id: "ACC-002",
      account_number_masked: "**** **** **** 3314",
      type: "Ahorro",
      balance: 7820.00,
      available_balance: 7820.00,
      currency: "USD",
      status: "ACTIVE"
    }
  ],
  transactions: [
    {
      id: "TX-001",
      date: "2026-09-05",
      time: "14:22",
      merchant: "Super Selectos",
      category: "Supermercado",
      type: "PURCHASE",
      type_label: "Compra",
      amount: 42.80,
      currency: "USD",
      status: "COMPLETED",
      card_last4: "4821"
    },
    {
      id: "TX-002",
      date: "2026-09-04",
      time: "21:10",
      merchant: "Netflix",
      category: "Entretenimiento",
      type: "SUBSCRIPTION",
      type_label: "Suscripción",
      amount: 12.99,
      currency: "USD",
      status: "COMPLETED",
      card_last4: "4821"
    },
    {
      id: "TX-003",
      date: "2026-09-04",
      time: "18:42",
      merchant: "ATM Centro",
      category: "Cajero Automático",
      type: "ATM_WITHDRAWAL",
      type_label: "Retiro",
      amount: 300.00,
      currency: "USD",
      status: "COMPLETED",
      card_last4: "4821"
    },
    {
      id: "TX-004",
      date: "2026-09-03",
      time: "08:15",
      merchant: "Gasolinera UNO",
      category: "Combustible",
      type: "PURCHASE",
      type_label: "Compra",
      amount: 35.50,
      currency: "USD",
      status: "COMPLETED",
      card_last4: "4821"
    }
  ],
  cards: [
    {
      card_id: "CARD-001",
      card_holder: "GUILLERMO CALDERON",
      card_type: "CREDIT",
      card_name: "Visionario Black Infinite",
      last4: "4821",
      expiry: "09/29",
      limit: 5000.00,
      available_limit: 1250.00,
      current_balance: 3750.00,
      status: "ACTIVE",
      brand: "MASTERCARD"
    },
    {
      card_id: "CARD-002",
      card_holder: "GUILLERMO CALDERON",
      card_type: "DEBIT",
      card_name: "Visionario Platinum Debit",
      last4: "9012",
      expiry: "11/28",
      status: "ACTIVE",
      brand: "MASTERCARD"
    }
  ],
  loans: [
    {
      loan_id: "LOAN-001",
      product: "Préstamo Personal",
      original_amount: 12000.00,
      outstanding_balance: 8450.00,
      next_payment: 245.00,
      next_payment_date: "2026-09-15",
      interest_rate: 8.50,
      total_installments: 60,
      paid_installments: 22,
      currency: "USD",
      status: "CURRENT"
    }
  ],
  cases: [],
  // Didit verification sessions, keyed by session_id — vendor_data links a
  // session back to state.customer.customer_id (or a pending onboarding applicant).
  diditSessions: {},
  processedWebhookEventIds: new Set(),
  auditLogs: [
    {
      id: "AUD-001",
      timestamp: new Date().toISOString(),
      time_formatted: "17:30:10",
      customer_id: "CUS-001",
      conversation_id: "CONV-INIT",
      agent_id: "NITO-BANKING",
      agent_title: "Nito Banking Assistant",
      intent: "SESSION_INITIALIZED",
      action: "START_SESSION",
      result: "SUCCESS",
      details: "Sesión segura inicializada para Guillermo Calderón."
    }
  ]
};

export function logAudit(entry) {
  const now = new Date();
  const timeFormatted = now.toTimeString().split(' ')[0];
  const auditEntry = {
    id: `AUD-${String(state.auditLogs.length + 1).padStart(3, '0')}`,
    timestamp: now.toISOString(),
    time_formatted: timeFormatted,
    customer_id: entry.customer_id || "CUS-001",
    conversation_id: entry.conversation_id || "CONV-LIVE",
    agent_id: entry.agent_id || "NITO-BANKING",
    agent_title: entry.agent_title || "Nito Banking Assistant",
    intent: entry.intent || "TOOL_EXECUTION",
    action: entry.action || "ACTION",
    tool_called: entry.tool_called,
    tool_params: entry.tool_params,
    result: entry.result || "SUCCESS",
    details: entry.details || ""
  };
  state.auditLogs.unshift(auditEntry);
  return auditEntry;
}
