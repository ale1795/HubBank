import { BankAccount, BankCard, BankLoan, BankTransaction, CustomerProfile, FraudCase, AuditEvent } from '../types/banking';

export const INITIAL_CUSTOMER: CustomerProfile = {
  customer_id: 'CUS-78921',
  first_name: 'Guillermo',
  last_name: 'Calderón',
  email: 'guillermo.calderon@visionario.bank',
  phone_masked: '+503 7***-**12',
  birth_date_masked: '22/**/1986',
  client_since: '2023',
  segment: 'Cliente Visionario',
  last_access: 'Hoy, 9:30 a.m.',
  authenticated: true
};

export const INITIAL_ACCOUNTS: BankAccount[] = [
  {
    account_id: 'ACC-4829',
    name: 'Cuenta Corriente',
    account_number_masked: '**** 4829',
    type: 'Cuenta de Cheques',
    currency: 'USD',
    balance: 12430.50,
    available_balance: 12430.50,
    status: 'ACTIVE'
  },
  {
    account_id: 'ACC-7712',
    name: 'Cuenta de Ahorro a la Vista',
    account_number_masked: '**** 7712',
    type: 'Cuenta de Ahorros',
    currency: 'USD',
    balance: 8162.35,
    available_balance: 8162.35,
    status: 'ACTIVE'
  },
  {
    account_id: 'ACC-1198',
    name: 'Depósito a Plazo Fijo',
    account_number_masked: '**** 1198',
    type: 'A plazo fijo',
    currency: 'USD',
    balance: 5000.00,
    available_balance: 5000.00,
    expiry_date: '12/03/2027',
    status: 'ACTIVE'
  },
  {
    account_id: 'ACC-3355',
    name: 'Tarjeta Black',
    account_number_masked: '**** 3355',
    type: 'Línea disponible',
    currency: 'USD',
    balance: 3500.00,
    limit: 5000.00,
    available_balance: 3500.00,
    status: 'ACTIVE'
  }
];

export const INITIAL_TRANSACTIONS: BankTransaction[] = [
  {
    id: 'TX-001',
    date: 'Hoy',
    time: '9:20 a.m.',
    merchant: 'Transferencia recibida',
    detail: 'De María López',
    category: 'Transferencia',
    type: 'TRANSFER_IN',
    type_label: 'Transferencia',
    amount: 2500.00,
    currency: 'USD',
    status: 'COMPLETED',
    card_last4: '4829'
  },
  {
    id: 'TX-002',
    date: 'Ayer',
    time: '6:45 p.m.',
    merchant: 'Super Selectos',
    detail: 'Tarjeta de Débito **** 4829',
    category: 'Supermercado',
    type: 'PURCHASE',
    type_label: 'Compra',
    amount: -68.45,
    currency: 'USD',
    status: 'COMPLETED',
    card_last4: '4829'
  },
  {
    id: 'TX-003',
    date: 'Ayer',
    time: '6:12 p.m.',
    merchant: 'Gasolinera UNO',
    detail: 'Tarjeta de Débito **** 4829',
    category: 'Combustible',
    type: 'PURCHASE',
    type_label: 'Compra',
    amount: -45.20,
    currency: 'USD',
    status: 'COMPLETED',
    card_last4: '4829'
  },
  {
    id: 'TX-004',
    date: 'Ayer',
    time: '1:30 p.m.',
    merchant: 'Restaurante El Mirador',
    detail: 'Tarjeta de Débito **** 4829',
    category: 'Restaurante',
    type: 'PURCHASE',
    type_label: 'Compra',
    amount: -32.80,
    currency: 'USD',
    status: 'COMPLETED',
    card_last4: '4829'
  },
  {
    id: 'TX-005',
    date: 'Ayer',
    time: '11:30 a.m.',
    merchant: 'AES El Salvador',
    detail: 'Pago de servicio',
    category: 'Servicios',
    type: 'BILL_PAYMENT',
    type_label: 'Pago de servicio',
    amount: -124.30,
    currency: 'USD',
    status: 'COMPLETED',
    card_last4: '4829'
  },
  {
    id: 'TX-006',
    date: '04/09/2026',
    time: '18:42',
    merchant: 'ATM Centro',
    detail: 'Retiro cajero automático',
    category: 'Cajero Automático',
    type: 'ATM_WITHDRAWAL',
    type_label: 'Retiro',
    amount: -300.00,
    currency: 'USD',
    status: 'COMPLETED',
    card_last4: '4829',
    location: 'ATM Red Visionario - Centro Histórico'
  },
  {
    id: 'TX-007',
    date: '02/09/2026',
    time: '10:47 p.m.',
    merchant: 'Compra en línea desconocida',
    detail: 'Tarjeta Black **** 3355',
    category: 'Comercio Electrónico',
    type: 'PURCHASE',
    type_label: 'Compra',
    amount: -189.90,
    currency: 'USD',
    status: 'COMPLETED',
    card_last4: '3355'
  },
  {
    id: 'TX-008',
    date: '02/09/2026',
    time: '3:12 a.m.',
    merchant: 'ATM Boulevard',
    detail: 'Retiro cajero automático',
    category: 'Cajero Automático',
    type: 'ATM_WITHDRAWAL',
    type_label: 'Retiro',
    amount: -150.00,
    currency: 'USD',
    status: 'COMPLETED',
    card_last4: '4829',
    location: 'ATM Red Visionario - Boulevard'
  },
  {
    id: 'TX-009',
    date: '01/09/2026',
    time: '12:05 p.m.',
    merchant: 'Farmacia San Nicolás',
    detail: 'Tarjeta de Débito **** 4829',
    category: 'Salud',
    type: 'PURCHASE',
    type_label: 'Compra',
    amount: -24.15,
    currency: 'USD',
    status: 'COMPLETED',
    card_last4: '4829'
  }
];

export const INITIAL_CARDS: BankCard[] = [
  {
    card_id: 'CARD-4829',
    card_holder: 'GUILLERMO CALDERÓN',
    card_type: 'DEBIT',
    card_name: 'Tarjeta de Débito Mastercard',
    last4: '4829',
    expiry: '09/29',
    brand: 'MASTERCARD',
    monthly_spent: 1245.75,
    spent_percentage: 62,
    limit_available: 2754.25,
    available_limit: 2754.25,
    total_limit: 4000.00,
    status: 'ACTIVE'
  },
  {
    card_id: 'CARD-3355',
    card_holder: 'GUILLERMO CALDERÓN',
    card_type: 'CREDIT',
    card_name: 'Tarjeta Black',
    last4: '3355',
    expiry: '11/28',
    brand: 'MASTERCARD',
    monthly_spent: 1500.00,
    spent_percentage: 30,
    limit_available: 3500.00,
    available_limit: 3500.00,
    total_limit: 5000.00,
    status: 'ACTIVE'
  },
  {
    card_id: 'CARD-5567',
    card_holder: 'GUILLERMO CALDERÓN',
    card_type: 'CREDIT',
    card_name: 'Tarjeta Gold',
    last4: '5567',
    expiry: '04/28',
    brand: 'MASTERCARD',
    monthly_spent: 520.00,
    spent_percentage: 21,
    limit_available: 1980.00,
    available_limit: 1980.00,
    total_limit: 2500.00,
    status: 'ACTIVE'
  }
];

export const INITIAL_LOANS: BankLoan[] = [
  {
    loan_id: 'LOAN-8840',
    product: 'Crédito Personal',
    original_amount: 12000.00,
    outstanding_balance: 8450.00,
    next_payment: 245.00,
    next_payment_date: '15/09/2026',
    interest_rate: 8.50,
    total_installments: 60,
    paid_installments: 22,
    currency: 'USD'
  }
];

export const INITIAL_CASES: FraudCase[] = [];

export const INITIAL_AUDIT_LOGS: AuditEvent[] = [
  {
    id: 'AUD-001',
    timestamp: new Date().toISOString(),
    time_formatted: '09:30:15',
    customer_id: 'CUS-78921',
    agent_id: 'NITO-BANKING',
    agent_title: 'Nito Banking Assistant',
    intent: 'SESSION_INITIALIZED',
    action: 'START_SESSION',
    result: 'SUCCESS',
    details: 'Sesión segura iniciada para Guillermo Calderón (Cliente Visionario).'
  }
];
