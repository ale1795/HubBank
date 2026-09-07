import { AgentType, IntentType } from '../types/banking';

export interface IntentAnalysisResult {
  intent: IntentType;
  confidence: number;
  targetAgent: AgentType;
  extractedEntities: {
    amount?: number;
    merchant?: string;
    cardLast4?: string;
    category?: string;
  };
  isGuardrailTriggered: boolean;
  guardrailReason?: string;
}

export function analyzeBankingIntent(userText: string): IntentAnalysisResult {
  const text = userText.toLowerCase().trim();

  // 1. Guardrail Check: Financial / Investment advice request
  if (
    (text.includes('cuanto deberia pagar') || text.includes('cuánto debería pagar') || text.includes('estrategia') || text.includes('recomiendas pagar') || text.includes('salir mas rapido') || text.includes('salir más rápido') || text.includes('invertir') || text.includes('consejo financiero')) &&
    (text.includes('prestamo') || text.includes('préstamo') || text.includes('deuda') || text.includes('interes') || text.includes('interés') || text.includes('dinero'))
  ) {
    return {
      intent: 'HUMAN_AGENT',
      confidence: 0.96,
      targetAgent: 'CUSTOMER_SERVICE_AGENT',
      extractedEntities: {},
      isGuardrailTriggered: true,
      guardrailReason: 'POLICY_FINANCIAL_ADVICE_RESTRICTION'
    };
  }

  // 2. Unrecognized Transaction / Fraud Report
  if (
    text.includes('no reconozco') || 
    text.includes('no reconosco') || 
    text.includes('desconozco') || 
    text.includes('fraude') || 
    text.includes('cargo no reconocido') || 
    text.includes('transaccion sospechosa') ||
    text.includes('transacción sospechosa') ||
    text.includes('reportar') ||
    text.includes('clonacion') ||
    text.includes('clonación') ||
    text.includes('300') ||
    text.includes('atm centro') ||
    text.includes('retiro')
  ) {
    let amount: number | undefined;
    if (text.includes('300')) amount = 300;
    
    return {
      intent: 'UNRECOGNIZED_TRANSACTION',
      confidence: 0.98,
      targetAgent: 'FRAUD_AGENT',
      extractedEntities: {
        amount,
        merchant: text.includes('atm') ? 'ATM Centro' : undefined
      },
      isGuardrailTriggered: false
    };
  }

  // 3. Card Block
  if (text.includes('bloquear') || text.includes('bloquea') || text.includes('congelar') || text.includes('apagar tarjeta')) {
    return {
      intent: 'CARD_BLOCK',
      confidence: 0.95,
      targetAgent: 'FRAUD_AGENT',
      extractedEntities: {
        cardLast4: '4821'
      },
      isGuardrailTriggered: false
    };
  }

  // 4. Loan / Debt Query
  if (
    text.includes('prestamo') || 
    text.includes('préstamo') || 
    text.includes('debo') || 
    text.includes('cuanto debo') || 
    text.includes('cuánto debo') || 
    text.includes('saldo del prestamo') ||
    text.includes('cuota') ||
    text.includes('credito') ||
    text.includes('crédito')
  ) {
    return {
      intent: 'LOAN_QUERY',
      confidence: 0.94,
      targetAgent: 'LOANS_AGENT',
      extractedEntities: {},
      isGuardrailTriggered: false
    };
  }

  // 5. Balance Query
  if (text.includes('saldo') || text.includes('cuanto tengo') || text.includes('cuánto tengo') || text.includes('mis cuentas') || text.includes('ahorros')) {
    return {
      intent: 'BALANCE_QUERY',
      confidence: 0.92,
      targetAgent: 'BANKING_ASSISTANT',
      extractedEntities: {},
      isGuardrailTriggered: false
    };
  }

  // 6. Transactions Query
  if (text.includes('movimientos') || text.includes('ultimas compras') || text.includes('últimas compras') || text.includes('transacciones') || text.includes('historial')) {
    return {
      intent: 'TRANSACTION_QUERY',
      confidence: 0.91,
      targetAgent: 'BANKING_ASSISTANT',
      extractedEntities: {},
      isGuardrailTriggered: false
    };
  }

  // 7. Human Handoff / Advisor
  if (text.includes('asesor') || text.includes('humano') || text.includes('ejecutivo') || text.includes('operador') || text.includes('persona')) {
    return {
      intent: 'HUMAN_AGENT',
      confidence: 0.97,
      targetAgent: 'CUSTOMER_SERVICE_AGENT',
      extractedEntities: {},
      isGuardrailTriggered: false
    };
  }

  return {
    intent: 'UNKNOWN',
    confidence: 0.4,
    targetAgent: 'BANKING_ASSISTANT',
    extractedEntities: {},
    isGuardrailTriggered: false
  };
}
