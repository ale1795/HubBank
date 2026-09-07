export type AgentType = 
  | 'BANKING_ASSISTANT' 
  | 'FRAUD_AGENT' 
  | 'LOANS_AGENT' 
  | 'CUSTOMER_SERVICE_AGENT';

export type AgentStatus = 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'ERROR';

export type ScreenTab = 'splash' | 'login' | 'onboarding' | 'home' | 'accounts' | 'transfers' | 'cards' | 'more';

export type IntentType =
  | 'BALANCE_QUERY'
  | 'TRANSACTION_QUERY'
  | 'UNRECOGNIZED_TRANSACTION'
  | 'CARD_BLOCK'
  | 'CARD_ACTIVATION'
  | 'TRANSFER'
  | 'LOAN_QUERY'
  | 'LOAN_PAYMENT'
  | 'FRAUD_REPORT'
  | 'HUMAN_AGENT'
  | 'UNKNOWN';

export interface CustomerProfile {
  customer_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_masked: string;
  birth_date_masked: string;
  client_since: string;
  segment: string;
  last_access: string;
  authenticated: boolean;
}

export interface BankAccount {
  account_id: string;
  name: string;
  account_number_masked: string;
  type: string;
  currency: 'USD';
  balance: number;
  available_balance: number;
  expiry_date?: string;
  limit?: number;
  status: 'ACTIVE' | 'FROZEN';
}

export interface BankTransaction {
  id: string;
  date: string;
  time: string;
  merchant: string;
  detail: string;
  category: string;
  type: 'TRANSFER_IN' | 'PURCHASE' | 'BILL_PAYMENT' | 'ATM_WITHDRAWAL' | 'TRANSFER_OUT';
  type_label?: string;
  amount: number;
  currency: 'USD';
  status: 'COMPLETED' | 'PENDING' | 'DISPUTED';
  card_last4: string;
  location?: string;
  dispute_case_id?: string;
}

export interface BankCard {
  card_id: string;
  card_holder: string;
  card_type: 'DEBIT' | 'CREDIT';
  card_name: string;
  last4: string;
  expiry: string;
  brand: 'VISA' | 'MASTERCARD';
  monthly_spent: number;
  spent_percentage: number;
  limit_available: number;
  available_limit?: number;
  total_limit: number;
  status: 'ACTIVE' | 'BLOCKED' | 'BLOCKING';
}

export interface BankLoan {
  loan_id: string;
  product: string;
  original_amount: number;
  outstanding_balance: number;
  next_payment: number;
  next_payment_date: string;
  interest_rate: number;
  total_installments: number;
  paid_installments: number;
  currency: 'USD';
}

export interface FraudCase {
  case_id: string;
  customer_id: string;
  transaction_id: string;
  merchant: string;
  amount: number;
  card_last4: string;
  reason?: string;
  channel?: string;
  assigned_agent?: string;
  card_blocked?: boolean;
  status: 'En investigación' | 'Resuelto' | 'INVESTIGATION';
  department: string;
  estimated_resolution: string;
  created_at: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  time_formatted: string;
  customer_id?: string;
  conversation_id?: string;
  agent_id?: string;
  agent_title?: string;
  intent: string;
  action: string;
  tool_called?: string;
  tool_params?: any;
  result?: 'SUCCESS' | 'INFO' | 'WARNING' | 'ERROR';
  details: string;
}

export interface HumanHandoffPayload {
  customer_id: string;
  customer_name: string;
  reason: string;
  conversation_summary: string;
  case_id?: string;
  card_last4?: string;
  card_status?: string;
  timestamp: string;
  queue: string;
  reference: string;
}

export interface ChatMessage {
  id: string;
  sender: 'USER' | 'ATENA' | 'SYSTEM';
  agent_type?: AgentType;
  text: string;
  timestamp: string;
  interactive_type?: 
    | 'AUTH_CHALLENGE' 
    | 'TRANSACTION_PICKER' 
    | 'FRAUD_INVESTIGATION_TIMELINE'
    | 'CARD_BLOCK_PROMPT' 
    | 'CASE_BADGE' 
    | 'TRANSFER_PREVIEW'
    | 'LOAN_CARD'
    | 'HUMAN_HANDOFF_CARD'
    | 'LIVE_TOOL_CALL';
  interactive_data?: any;
}
