import { AuditEvent, BankAccount, BankCard, BankLoan, BankTransaction, CustomerProfile, FraudCase, HumanHandoffPayload } from '../types/banking';

const API_BASE = '/api';

export const apiClient = {
  async getProfile(): Promise<CustomerProfile> {
    const res = await fetch(`${API_BASE}/customer/profile`);
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  },

  async getAccounts(): Promise<{ accounts: BankAccount[] }> {
    const res = await fetch(`${API_BASE}/accounts`);
    if (!res.ok) throw new Error('Failed to fetch accounts');
    return res.json();
  },

  async getTransactions(customerId?: string): Promise<{ transactions: BankTransaction[] }> {
    const query = customerId ? `?customer_id=${customerId}` : '';
    const res = await fetch(`${API_BASE}/transactions${query}`);
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
  },

  async verifyTransaction(txId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/transactions/${txId}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to verify transaction');
    return res.json();
  },

  async reportFraud(data: { customer_id: string; transaction_id: string; reason: string }): Promise<{ case_id: string; status: string; department: string; estimated_resolution: string; details?: FraudCase }> {
    const res = await fetch(`${API_BASE}/fraud/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to report fraud');
    return res.json();
  },

  async blockCard(cardId: string): Promise<{ card_id: string; last4: string; status: string; message: string }> {
    const res = await fetch(`${API_BASE}/cards/${cardId}/block`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Failed to block card');
    return res.json();
  },

  async unblockCard(cardId: string): Promise<{ card_id: string; status: string }> {
    const res = await fetch(`${API_BASE}/cards/${cardId}/unblock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Failed to unblock card');
    return res.json();
  },

  async validateTransfer(data: { destination_account: string; amount: number }): Promise<{ valid: boolean; source_account: any; destination_account: any; amount: number; message: string }> {
    const res = await fetch(`${API_BASE}/transfer/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to validate transfer');
    return res.json();
  },

  async executeTransfer(data: { destination_account: string; amount: number }): Promise<{ status: string; reference: string; amount: number; source: { account_id: string; type: string; balance: number }; destination: { account_id: string; type: string; balance: number }; message: string }> {
    const res = await fetch(`${API_BASE}/transfer/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to execute transfer');
    return res.json();
  },

  async getLoans(): Promise<{ loans: BankLoan[]; outstanding_balance: number; next_payment: number; next_payment_date: string; interest_rate: number; product: string }> {
    const res = await fetch(`${API_BASE}/loans`);
    if (!res.ok) throw new Error('Failed to fetch loans');
    return res.json();
  },

  async requestHandoff(payload: Partial<HumanHandoffPayload>): Promise<{ status: string; queue: string; reference: string; summary_received: string }> {
    const res = await fetch(`${API_BASE}/handoff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to submit handoff');
    return res.json();
  },

  async recordAuditEvent(event: Partial<AuditEvent>): Promise<{ status: string; audit_id: string }> {
    const res = await fetch(`${API_BASE}/audit/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    });
    if (!res.ok) throw new Error('Failed to record audit event');
    return res.json();
  },

  async getAuditLogs(): Promise<{ logs: AuditEvent[] }> {
    const res = await fetch(`${API_BASE}/audit/logs`);
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  async getCases(): Promise<{ cases: FraudCase[] }> {
    const res = await fetch(`${API_BASE}/cases`);
    if (!res.ok) throw new Error('Failed to fetch cases');
    return res.json();
  },

  async resetDemo(): Promise<void> {
    await fetch(`${API_BASE}/reset`, { method: 'POST' });
  }
};
