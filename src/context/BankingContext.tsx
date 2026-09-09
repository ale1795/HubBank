import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { 
  AgentStatus, 
  AgentType, 
  AuditEvent, 
  BankAccount, 
  BankCard, 
  BankLoan, 
  BankTransaction, 
  ChatMessage, 
  CustomerProfile, 
  FraudCase,
  HumanHandoffPayload,
  ScreenTab
} from '../types/banking';
import { 
  INITIAL_ACCOUNTS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_CARDS, 
  INITIAL_CASES, 
  INITIAL_CUSTOMER, 
  INITIAL_LOANS, 
  INITIAL_TRANSACTIONS 
} from '../data/mockData';
import { analyzeBankingIntent } from '../services/intentEngine';
import { voiceEngine } from '../services/voiceEngine';
import { apiClient } from '../services/api';
import {
  startAtenaSession,
  endAtenaSession,
  sendAtenaText,
  AtenaLiveStatus
} from '../services/elevenLabsEngine';
import { createDiditSession, startDiditVerification } from '../services/diditEngine';

interface BankingContextType {
  customer: CustomerProfile;
  accounts: BankAccount[];
  transactions: BankTransaction[];
  cards: BankCard[];
  loans: BankLoan[];
  cases: FraudCase[];
  auditLogs: AuditEvent[];
  
  // Agent State
  activeAgent: AgentType;
  agentStatus: AgentStatus;
  chatMessages: ChatMessage[];
  isVoiceModalOpen: boolean;
  isDrawerOpen: boolean;
  activeView: string;
  isMuted: boolean;

  // UI driven by the live agent's tool calls (navigate to / highlight a transaction)
  navigateToTab: ScreenTab | null;
  setNavigateToTab: (tab: ScreenTab | null) => void;
  highlightedTxId: string | null;
  setHighlightedTxId: (id: string | null) => void;
  isConsultingTx: boolean;

  // ElevenLabs Config
  elevenLabsConfig: {
    apiKey: string;
    agentId: string;
    isConnected: boolean;
  };
  updateElevenLabsConfig: (config: { apiKey: string; agentId: string }) => void;

  // Actions
  setActiveView: (view: string) => void;
  setIsVoiceModalOpen: (open: boolean) => void;
  setIsDrawerOpen: (open: boolean) => void;
  toggleMute: () => void;
  sendMessage: (text: string) => Promise<void>;

  // Live ElevenLabs Conversational AI session (real voice + real tool calls)
  liveStatus: AtenaLiveStatus;
  startAtenaLive: (contextType?: string) => Promise<void>;
  stopAtenaLive: () => Promise<void>;
  sendLiveText: (text: string, contextType?: string) => Promise<void>;

  // Interactive Step Triggers
  verifyCustomerIdentity: () => Promise<void>;
  selectTransactionToDispute: (txId: string) => Promise<void>;
  confirmCardBlock: (cardId: string, shouldBlock: boolean) => Promise<void>;
  triggerHumanHandoff: (reason?: string) => Promise<void>;
  resetDemoState: () => void;
  addCustomAuditLog: (event: Partial<AuditEvent>) => void;
}

const BankingContext = createContext<BankingContextType | undefined>(undefined);

export const BankingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<CustomerProfile>(INITIAL_CUSTOMER);
  const [accounts, setAccounts] = useState<BankAccount[]>(INITIAL_ACCOUNTS);
  const [transactions, setTransactions] = useState<BankTransaction[]>(INITIAL_TRANSACTIONS);
  const [cards, setCards] = useState<BankCard[]>(INITIAL_CARDS);
  const [loans, setLoans] = useState<BankLoan[]>(INITIAL_LOANS);
  const [cases, setCases] = useState<FraudCase[]>(INITIAL_CASES);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(INITIAL_AUDIT_LOGS);

  const [activeAgent, setActiveAgent] = useState<AgentType>('BANKING_ASSISTANT');
  const [agentStatus, setAgentStatus] = useState<AgentStatus>('IDLE');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [liveStatus, setLiveStatus] = useState<AtenaLiveStatus>('disconnected');
  const [navigateToTab, setNavigateToTab] = useState<ScreenTab | null>(null);
  const [highlightedTxId, setHighlightedTxId] = useState<string | null>(null);
  const [isConsultingTx, setIsConsultingTx] = useState<boolean>(false);

  const [elevenLabsConfig, setElevenLabsConfig] = useState<{ apiKey: string; agentId: string; isConnected: boolean }>({
    apiKey: '',
    agentId: '',
    isConnected: false,
  });

  const chatMessagesRef = useRef<ChatMessage[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'ATENA',
      agent_type: 'BANKING_ASSISTANT',
      text: 'Buenas tardes, Guillermo 👋 Soy Nito, tu asistente de banca digital con IA. ¿En qué te puedo ayudar hoy?',
      timestamp: '17:30'
    }
  ]);

  useEffect(() => {
    chatMessagesRef.current = chatMessages;
  }, [chatMessages]);

  // Latest state snapshot for the live agent's client tools, whose closures
  // are captured once at session start and would otherwise see stale data.
  const liveStateRef = useRef({ customer, accounts, transactions, cards, loans, cases });
  useEffect(() => {
    liveStateRef.current = { customer, accounts, transactions, cards, loans, cases };
  });

  const activeAgentRef = useRef<AgentType>(activeAgent);
  useEffect(() => {
    activeAgentRef.current = activeAgent;
  }, [activeAgent]);

  const addAuditLog = (entry: Partial<AuditEvent>) => {
    const now = new Date();
    const timeFormatted = now.toTimeString().split(' ')[0];
    const newLog: AuditEvent = {
      id: `AUD-${String(Date.now()).slice(-4)}`,
      timestamp: now.toISOString(),
      time_formatted: timeFormatted,
      customer_id: entry.customer_id || customer.customer_id,
      conversation_id: 'CONV-LIVE-01',
      agent_id: entry.agent_id || (activeAgent === 'FRAUD_AGENT' ? 'NITO-FRAUD' : activeAgent === 'LOANS_AGENT' ? 'NITO-LOANS' : 'NITO-BANKING'),
      agent_title: entry.agent_title || (activeAgent === 'FRAUD_AGENT' ? 'Nito Fraud Agent' : activeAgent === 'LOANS_AGENT' ? 'Nito Loans Agent' : 'Nito Banking Assistant'),
      intent: entry.intent || 'GENERAL_QUERY',
      action: entry.action || 'EXECUTE',
      tool_called: entry.tool_called,
      tool_params: entry.tool_params,
      result: entry.result || 'SUCCESS',
      details: entry.details || ''
    };

    setAuditLogs(prev => [newLog, ...prev]);

    // Send to server in background if accessible
    apiClient.recordAuditEvent(newLog).catch(() => {});
  };

  const speakAndRespond = async (text: string, agent: AgentType = activeAgent) => {
    setAgentStatus('SPEAKING');
    await voiceEngine.speak(
      text,
      () => setAgentStatus('SPEAKING'),
      () => setAgentStatus('IDLE'),
      agent === 'FRAUD_AGENT' ? 'FRAUD' : agent === 'LOANS_AGENT' ? 'LOANS' : 'BANKING'
    );
  };

  const updateElevenLabsConfig = (cfg: { apiKey: string; agentId: string }) => {
    setElevenLabsConfig({
      apiKey: cfg.apiKey,
      agentId: cfg.agentId,
      isConnected: Boolean(cfg.apiKey && cfg.agentId)
    });
  };

  const toggleMute = () => {
    const next = voiceEngine.toggleMute();
    setIsMuted(next);
  };

  // ---------------------------------------------------------------------
  // Live ElevenLabs Conversational AI session. Nito runs with client-side
  // tools: the LLM decides what to call, and the browser executes the real
  // request against this same app's own Express API — no public webhook
  // needed. State updates here are deliberately narrow (status flags,
  // appended records) rather than wholesale replacements, since the mock
  // banking data on screen and the mock data in server/state.js use
  // different ids and don't share a shape.
  // ---------------------------------------------------------------------

  const pushLiveToolCallMessage = (
    agent: AgentType,
    tool: string,
    summary: string,
    status: 'success' | 'error' = 'success'
  ) => {
    setChatMessages(prev => [
      ...prev,
      {
        id: `tool-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        sender: 'ATENA',
        agent_type: agent,
        text: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        interactive_type: 'LIVE_TOOL_CALL',
        interactive_data: { tool, summary, status }
      }
    ]);
  };

  // Step-up identity check gating high-risk fraud actions (block_card, report_fraud).
  // Opens Didit's own hosted-flow modal and resolves once the user finishes it.
  // No chat bubbles here on purpose — the Didit modal is the UI for this step;
  // the caller (block_card/report_fraud) already posts a single chat message
  // if this returns false, so the customer isn't shown two notices for one step.
  //
  // Only asked once per live conversation: a customer who disputes a
  // transaction and then also blocks the card shouldn't verify twice in the
  // same call. Reset in startAtenaLive so a new conversation asks again.
  //
  // The SDK's completion event is NOT proof of approval — only the (currently
  // unreachable-from-localhost) verified webhook is authoritative — so this is a
  // soft, demo-scoped gate, not a compliance guarantee. See services/diditEngine.ts.
  const identityVerifiedRef = useRef(false);
  const requireIdentityVerification = async (): Promise<boolean> => {
    if (identityVerifiedRef.current) return true;
    try {
      const session = await createDiditSession(liveStateRef.current.customer.customer_id);
      const outcome = await startDiditVerification(session.url);
      if (outcome === 'completed') {
        identityVerifiedRef.current = true;
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const buildAtenaClientTools = () => ({
    get_customer_profile: async () => {
      try {
        const profile = await apiClient.getProfile();
        addAuditLog({
          intent: 'CUSTOMER_PROFILE_LOOKUP',
          action: 'GET_PROFILE',
          tool_called: 'get_customer_profile',
          details: 'Nito consultó el perfil del cliente en vivo.'
        });
        pushLiveToolCallMessage('BANKING_ASSISTANT', 'get_customer_profile', `Cliente verificado: ${profile.first_name} ${profile.last_name}`);
        return JSON.stringify(profile);
      } catch {
        pushLiveToolCallMessage('BANKING_ASSISTANT', 'get_customer_profile', 'No se pudo consultar el perfil', 'error');
        return 'ERROR: no se pudo obtener el perfil del cliente';
      }
    },

    get_accounts: async () => {
      try {
        const { accounts: accs } = await apiClient.getAccounts();
        addAuditLog({
          intent: 'BALANCE_QUERY',
          action: 'GET_ACCOUNTS',
          tool_called: 'get_accounts',
          details: `Nito consultó ${accs.length} cuentas en vivo.`
        });
        pushLiveToolCallMessage('BANKING_ASSISTANT', 'get_accounts', `${accs.length} cuentas consultadas`);
        return JSON.stringify(accs);
      } catch {
        pushLiveToolCallMessage('BANKING_ASSISTANT', 'get_accounts', 'No se pudieron consultar las cuentas', 'error');
        return 'ERROR: no se pudieron obtener las cuentas';
      }
    },

    get_transactions: async () => {
      try {
        const { transactions: txs } = await apiClient.getTransactions();
        addAuditLog({
          intent: 'TRANSACTION_QUERY',
          action: 'GET_TRANSACTIONS',
          tool_called: 'get_transactions',
          details: `Nito consultó ${txs.length} movimientos en vivo.`
        });
        pushLiveToolCallMessage('BANKING_ASSISTANT', 'get_transactions', `${txs.length} movimientos recientes`);
        return JSON.stringify(txs);
      } catch {
        pushLiveToolCallMessage('BANKING_ASSISTANT', 'get_transactions', 'No se pudieron consultar los movimientos', 'error');
        return 'ERROR: no se pudieron obtener los movimientos';
      }
    },

    verify_transaction: async (params: { query?: string }) => {
      setActiveAgent('FRAUD_AGENT');
      setIsConsultingTx(true);
      try {
        const query = (params?.query || '300').toString();
        const tx = await apiClient.verifyTransaction(query);
        addAuditLog({
          agent_id: 'NITO-FRAUD',
          agent_title: 'Nito Fraud Agent',
          intent: 'UNRECOGNIZED_TRANSACTION',
          action: 'VERIFY_TRANSACTION',
          tool_called: 'verify_transaction',
          tool_params: params,
          details: `Transacción verificada en vivo: ${tx.merchant} por $${Math.abs(Number(tx.amount)).toFixed(2)}`
        });
        pushLiveToolCallMessage('FRAUD_AGENT', 'verify_transaction', `${tx.merchant} · $${Math.abs(Number(tx.amount)).toFixed(2)}`);
        setHighlightedTxId(tx.transaction_id || null);
        setNavigateToTab('home');
        return JSON.stringify(tx);
      } catch {
        pushLiveToolCallMessage('FRAUD_AGENT', 'verify_transaction', 'Transacción no encontrada', 'error');
        return 'ERROR: no se encontró la transacción mencionada';
      } finally {
        setIsConsultingTx(false);
      }
    },

    report_fraud: async (params: { transaction_id?: string; reason?: string; confirmed?: boolean }) => {
      setActiveAgent('FRAUD_AGENT');
      if (!params?.confirmed) {
        pushLiveToolCallMessage('FRAUD_AGENT', 'report_fraud', 'Bloqueado: falta confirmación explícita del cliente', 'error');
        return 'ERROR: no se puede radicar el reclamo sin confirmación explícita del cliente. Pide primero que confirme.';
      }
      const identityOk = await requireIdentityVerification();
      if (!identityOk) {
        pushLiveToolCallMessage('FRAUD_AGENT', 'report_fraud', 'Bloqueado: verificación de identidad no completada', 'error');
        return 'ERROR: no se pudo verificar la identidad del cliente. No se radicó el reclamo.';
      }
      try {
        const custId = liveStateRef.current.customer.customer_id;
        const result = await apiClient.reportFraud({
          customer_id: custId,
          transaction_id: params?.transaction_id || 'TX-006',
          reason: params?.reason || 'UNRECOGNIZED_TRANSACTION'
        });

        const flaggedTx =
          liveStateRef.current.transactions.find(
            t => t.merchant.toLowerCase().includes('atm') || Math.abs(t.amount) === 300
          ) || liveStateRef.current.transactions[0];

        setTransactions(prev =>
          prev.map(t => (t.id === flaggedTx.id ? { ...t, status: 'DISPUTED', dispute_case_id: result.case_id } : t))
        );

        const newCase: FraudCase = {
          case_id: result.case_id,
          customer_id: custId,
          transaction_id: flaggedTx.id,
          merchant: flaggedTx.merchant,
          amount: Math.abs(flaggedTx.amount),
          card_last4: flaggedTx.card_last4,
          reason: params?.reason || 'Transacción no reconocida',
          status: 'INVESTIGATION',
          department: result.department || 'Unidad de Prevención de Fraude',
          estimated_resolution: result.estimated_resolution || '24-48 horas',
          created_at: new Date().toISOString(),
          channel: 'Banca Digital — Nito AI',
          assigned_agent: 'Nito Fraud Agent',
          card_blocked: false
        };
        setCases(prev => [newCase, ...prev]);

        addAuditLog({
          agent_id: 'NITO-FRAUD',
          agent_title: 'Nito Fraud Agent',
          intent: 'FRAUD_REPORT',
          action: 'CREATE_CASE',
          tool_called: 'report_fraud',
          tool_params: params,
          details: `Caso generado en vivo: ${result.case_id}`
        });
        pushLiveToolCallMessage('FRAUD_AGENT', 'report_fraud', `Caso ${result.case_id} creado`);
        setHighlightedTxId(flaggedTx.id);
        setNavigateToTab('home');
        return JSON.stringify(result);
      } catch {
        pushLiveToolCallMessage('FRAUD_AGENT', 'report_fraud', 'No se pudo crear el caso', 'error');
        return 'ERROR: no se pudo registrar el reclamo';
      }
    },

    block_card: async (params: { card_id?: string; confirmed?: boolean }) => {
      setActiveAgent('FRAUD_AGENT');
      if (!params?.confirmed) {
        pushLiveToolCallMessage('FRAUD_AGENT', 'block_card', 'Bloqueado: falta confirmación explícita del cliente', 'error');
        return 'ERROR: no se puede bloquear la tarjeta sin confirmación explícita del cliente. Pide primero que confirme.';
      }
      const identityOk = await requireIdentityVerification();
      if (!identityOk) {
        pushLiveToolCallMessage('FRAUD_AGENT', 'block_card', 'Bloqueado: verificación de identidad no completada', 'error');
        return 'ERROR: no se pudo verificar la identidad del cliente. No se bloqueó la tarjeta.';
      }
      try {
        const targetCard =
          liveStateRef.current.cards.find(c => c.card_id === params?.card_id || c.last4 === params?.card_id) ||
          liveStateRef.current.cards.find(c => c.card_type === 'DEBIT') ||
          liveStateRef.current.cards[0];
        const result = await apiClient.blockCard(targetCard.card_id);
        setCards(prev => prev.map(c => (c.card_id === targetCard.card_id ? { ...c, status: 'BLOCKED' } : c)));
        addAuditLog({
          agent_id: 'NITO-FRAUD',
          agent_title: 'Nito Fraud Agent',
          intent: 'CARD_BLOCK',
          action: 'BLOCK_CARD',
          tool_called: 'block_card',
          tool_params: { card_id: targetCard.card_id },
          result: 'WARNING',
          details: `Tarjeta terminada en ${targetCard.last4} bloqueada en vivo por Nito.`
        });
        pushLiveToolCallMessage('FRAUD_AGENT', 'block_card', `Tarjeta ****${targetCard.last4} bloqueada`);
        setNavigateToTab('cards');
        return JSON.stringify({ ...result, last4: targetCard.last4 });
      } catch {
        pushLiveToolCallMessage('FRAUD_AGENT', 'block_card', 'No se pudo bloquear la tarjeta', 'error');
        return 'ERROR: no se pudo bloquear la tarjeta';
      }
    },

    get_loans: async () => {
      setActiveAgent('LOANS_AGENT');
      try {
        const data = await apiClient.getLoans();
        addAuditLog({
          agent_id: 'NITO-LOANS',
          agent_title: 'Nito Loans Agent',
          intent: 'LOAN_QUERY',
          action: 'GET_LOANS',
          tool_called: 'get_loans',
          details: 'Nito consultó el préstamo en vivo.'
        });
        pushLiveToolCallMessage('LOANS_AGENT', 'get_loans', `Saldo pendiente $${Number(data.outstanding_balance).toFixed(2)}`);
        return JSON.stringify(data);
      } catch {
        pushLiveToolCallMessage('LOANS_AGENT', 'get_loans', 'No se pudo consultar el préstamo', 'error');
        return 'ERROR: no se pudo consultar el préstamo';
      }
    },

    validate_transfer: async (params: { destination_account?: string; amount?: number }) => {
      try {
        const result = await apiClient.validateTransfer({
          destination_account: params?.destination_account || '',
          amount: Number(params?.amount) || 0
        });
        pushLiveToolCallMessage('BANKING_ASSISTANT', 'validate_transfer', result.message);
        return JSON.stringify(result);
      } catch {
        pushLiveToolCallMessage('BANKING_ASSISTANT', 'validate_transfer', 'No se pudo validar la transferencia', 'error');
        return 'ERROR: no se pudo validar la transferencia';
      }
    },

    execute_transfer: async (params: { destination_account?: string; amount?: number; confirmed?: boolean }) => {
      if (!params?.confirmed) {
        pushLiveToolCallMessage('BANKING_ASSISTANT', 'execute_transfer', 'Bloqueado: falta confirmación explícita del cliente', 'error');
        return 'ERROR: no se puede ejecutar la transferencia sin confirmación explícita del cliente. Pide primero que confirme el monto y la cuenta destino.';
      }
      try {
        const destinationLabel = params?.destination_account || '';
        const amount = Number(params?.amount) || 0;
        const result = await apiClient.executeTransfer({ destination_account: destinationLabel, amount });

        const toSavings = destinationLabel.toLowerCase().includes('ahorro');
        setAccounts(prev =>
          prev.map(a => {
            const isChecking = a.type.toLowerCase().includes('cheque');
            const isSavings = a.type.toLowerCase().includes('ahorro');
            if (isChecking) return { ...a, balance: a.balance - amount, available_balance: a.available_balance - amount };
            if (isSavings && toSavings) return { ...a, balance: a.balance + amount, available_balance: a.available_balance + amount };
            return a;
          })
        );

        addAuditLog({
          intent: 'TRANSFER',
          action: 'EXECUTE_TRANSFER',
          tool_called: 'execute_transfer',
          tool_params: params,
          details: `Transferencia en vivo ${result.reference} por $${amount.toFixed(2)}.`
        });
        pushLiveToolCallMessage('BANKING_ASSISTANT', 'execute_transfer', `Transferencia ${result.reference} por $${amount.toFixed(2)}`);
        return JSON.stringify(result);
      } catch {
        pushLiveToolCallMessage('BANKING_ASSISTANT', 'execute_transfer', 'No se pudo completar la transferencia', 'error');
        return 'ERROR: no se pudo completar la transferencia';
      }
    },

    human_handoff: async (params: { reason?: string; summary?: string }) => {
      setActiveAgent('CUSTOMER_SERVICE_AGENT');
      try {
        const payload = {
          customer_id: liveStateRef.current.customer.customer_id,
          reason: params?.reason || 'Solicitud del cliente',
          conversation_summary: params?.summary || 'Conversación en vivo con Nito AI'
        };
        const result = await apiClient.requestHandoff(payload);
        addAuditLog({
          agent_id: 'NITO-SUPERVISOR',
          agent_title: 'Nito Supervisor',
          intent: 'HUMAN_AGENT',
          action: 'TRANSFER_TO_HUMAN',
          tool_called: 'human_handoff',
          tool_params: payload,
          result: 'INFO',
          details: `Handoff en vivo: referencia ${result.reference}`
        });
        pushLiveToolCallMessage('CUSTOMER_SERVICE_AGENT', 'human_handoff', `Referencia ${result.reference} · cola ${result.queue}`);
        return JSON.stringify(result);
      } catch {
        pushLiveToolCallMessage('CUSTOMER_SERVICE_AGENT', 'human_handoff', 'No se pudo escalar la solicitud', 'error');
        return 'ERROR: no se pudo escalar con un asesor humano';
      }
    },

    get_case: async (params: { case_id?: string }) => {
      const found = liveStateRef.current.cases.find(c => c.case_id === params?.case_id);
      if (!found) {
        pushLiveToolCallMessage('FRAUD_AGENT', 'get_case', 'Caso no encontrado', 'error');
        return 'ERROR: no se encontró un caso con ese número.';
      }
      pushLiveToolCallMessage('FRAUD_AGENT', 'get_case', `Caso ${found.case_id} · ${found.status}`);
      return JSON.stringify(found);
    },

    audit_event: async (params: { intent?: string; action?: string; details?: string }) => {
      addAuditLog({
        intent: params?.intent || 'GENERAL_QUERY',
        action: params?.action || 'AGENT_NOTE',
        tool_called: 'audit_event',
        details: params?.details || 'Evento registrado por Nito.'
      });
      return 'REGISTRADO';
    }
  });

  const startAtenaLive = async (contextType: string = 'general') => {
    if (liveStatus === 'connected' || liveStatus === 'connecting') return;
    identityVerifiedRef.current = false;
    setLiveStatus('connecting');
    try {
      const c = liveStateRef.current.customer;
      await startAtenaSession({
        clientTools: buildAtenaClientTools(),
        dynamicVariables: {
          customer_name: c.first_name,
          customer_id: c.customer_id,
          context_type: contextType,
          conversation_id: `CONV-${Date.now()}`
        },
        onModeChange: (mode) => setAgentStatus(mode === 'speaking' ? 'SPEAKING' : 'LISTENING'),
        onStatusChange: (status) => {
          if (status === 'connected') {
            setLiveStatus('connected');
            setAgentStatus('IDLE');
          } else if (status === 'connecting') {
            setLiveStatus('connecting');
          } else {
            setLiveStatus('disconnected');
            setAgentStatus('IDLE');
          }
        },
        onUserMessage: (text) => {
          setChatMessages(prev => [
            ...prev,
            {
              id: `usr-${Date.now()}`,
              sender: 'USER',
              text,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        },
        onAgentMessage: (text) => {
          setChatMessages(prev => [
            ...prev,
            {
              id: `msg-${Date.now()}`,
              sender: 'ATENA',
              agent_type: activeAgentRef.current,
              text,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        },
        onError: (message) => {
          console.error('Nito live session error:', message);
          setAgentStatus('ERROR');
        }
      });
    } catch (e) {
      console.error('Failed to start Nito live session', e);
      setLiveStatus('disconnected');
      setAgentStatus('IDLE');
    }
  };

  const stopAtenaLive = async () => {
    await endAtenaSession();
    setLiveStatus('disconnected');
    setAgentStatus('IDLE');
  };

  const sendLiveText = async (text: string, contextType: string = 'general') => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (liveStatus !== 'connected') {
      await startAtenaLive(contextType);
    }
    // The SDK doesn't echo back typed input as a transcript event (only
    // spoken audio produces one), so show it ourselves.
    setChatMessages(prev => [
      ...prev,
      {
        id: `usr-${Date.now()}`,
        sender: 'USER',
        text: trimmed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    sendAtenaText(trimmed);
  };

  // Process User message & execute multi-agent workflow
  const sendMessage = async (rawText: string) => {
    if (!rawText.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'USER',
      text: rawText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setAgentStatus('THINKING');

    const analysis = analyzeBankingIntent(rawText);

    addAuditLog({
      intent: analysis.intent,
      action: 'INTENT_CLASSIFICATION',
      tool_called: 'intent_engine.analyze',
      details: `Intención detectada: ${analysis.intent} (Confianza: ${(analysis.confidence * 100).toFixed(0)}%)`
    });

    // Handle Guardrails (e.g. asking for personal investment/debt payoff advice)
    if (analysis.isGuardrailTriggered) {
      setTimeout(async () => {
        const responseText = "Puedo mostrarte tu saldo, cuotas y condiciones actuales, pero para recomendarte una estrategia de pago personalizada o asesoría de inversión necesito derivarte con un asesor financiero certificado.";
        const atenaMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          sender: 'ATENA',
          agent_type: 'CUSTOMER_SERVICE_AGENT',
          text: responseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          interactive_type: 'HUMAN_HANDOFF_CARD',
          interactive_data: {
            reason: 'Asesoría de Estrategia Financiera',
            policyRef: 'POL-FIN-ADVICE-04'
          }
        };
        setActiveAgent('CUSTOMER_SERVICE_AGENT');
        setChatMessages(prev => [...prev, atenaMsg]);
        await speakAndRespond(responseText, 'CUSTOMER_SERVICE_AGENT');
      }, 700);
      return;
    }

    // Handle Unrecognized Transaction / Fraud Report workflow
    if (analysis.intent === 'UNRECOGNIZED_TRANSACTION' || analysis.intent === 'FRAUD_REPORT') {
      setTimeout(async () => {
        if (!customer.authenticated) {
          const authPromptText = "Claro, Guillermo. Te ayudo a revisarla. Primero voy a verificar tu identidad para proteger tu cuenta y asegurar la consulta.";
          const atenaMsg: ChatMessage = {
            id: `msg-${Date.now()}`,
            sender: 'ATENA',
            agent_type: 'BANKING_ASSISTANT',
            text: authPromptText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            interactive_type: 'AUTH_CHALLENGE',
            interactive_data: {
              customer_name: `${customer.first_name} ${customer.last_name}`,
              birth_date: customer.birth_date_masked,
              card_last4: '4821',
              status: 'IN_PROGRESS'
            }
          };
          setChatMessages(prev => [...prev, atenaMsg]);
          await speakAndRespond(authPromptText, 'BANKING_ASSISTANT');
        } else {
          // Already authenticated, directly show transaction list
          const txText = "Consultando tus transacciones recientes. ¿Cuál de estos movimientos no reconoces?";
          const atenaMsg: ChatMessage = {
            id: `msg-${Date.now()}`,
            sender: 'ATENA',
            agent_type: 'BANKING_ASSISTANT',
            text: txText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            interactive_type: 'TRANSACTION_PICKER',
            interactive_data: { transactions }
          };
          setChatMessages(prev => [...prev, atenaMsg]);
          await speakAndRespond(txText, 'BANKING_ASSISTANT');
        }
      }, 800);
      return;
    }

    // Handle Loan Query
    if (analysis.intent === 'LOAN_QUERY') {
      setTimeout(async () => {
        setActiveAgent('LOANS_AGENT');
        addAuditLog({
          agent_id: 'NITO-LOANS',
          agent_title: 'Nito Loans Agent',
          intent: 'LOAN_QUERY',
          action: 'GET_LOANS',
          tool_called: 'get_loans',
          details: 'Consulta de préstamo ejecutada mediante tool get_loans'
        });

        const currentLoan = loans[0];
        const loanResponseText = `Claro, Guillermo. He consultado la información de tu ${currentLoan.product}. Tienes un saldo pendiente de $${currentLoan.outstanding_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} con una próxima cuota de $${currentLoan.next_payment.toFixed(2)} pagadera el ${currentLoan.next_payment_date} a una tasa del ${currentLoan.interest_rate}%.`;

        const atenaMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          sender: 'ATENA',
          agent_type: 'LOANS_AGENT',
          text: loanResponseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          interactive_type: 'LOAN_CARD',
          interactive_data: { loan: currentLoan }
        };

        setChatMessages(prev => [...prev, atenaMsg]);
        await speakAndRespond(loanResponseText, 'LOANS_AGENT');
      }, 700);
      return;
    }

    // Handle Balance Query
    if (analysis.intent === 'BALANCE_QUERY') {
      setTimeout(async () => {
        addAuditLog({
          intent: 'BALANCE_QUERY',
          action: 'GET_ACCOUNTS',
          tool_called: 'get_accounts',
          details: 'Consulta de saldos de cuentas corrientes y de ahorro.'
        });

        const checking = accounts.find(a => a.type === 'Corriente');
        const savings = accounts.find(a => a.type === 'Ahorro');
        const balText = `Tu saldo disponible en Cuenta Corriente es de $${checking?.balance.toFixed(2)} y en tu Cuenta de Ahorro tienes $${savings?.balance.toFixed(2)}.`;

        const atenaMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          sender: 'ATENA',
          agent_type: 'BANKING_ASSISTANT',
          text: balText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages(prev => [...prev, atenaMsg]);
        await speakAndRespond(balText, 'BANKING_ASSISTANT');
      }, 600);
      return;
    }

    // Handle Human Agent Request
    if (analysis.intent === 'HUMAN_AGENT') {
      setTimeout(async () => {
        await triggerHumanHandoff('Solicitud directa del cliente');
      }, 600);
      return;
    }

    // Fallback response
    setTimeout(async () => {
      const fallback = "Entendido, Guillermo. Puedo ayudarte a consultar tus saldos, revisar transacciones, reportar cargos no reconocidos o consultar el estado de tu préstamo.";
      const atenaMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'ATENA',
        agent_type: 'BANKING_ASSISTANT',
        text: fallback,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, atenaMsg]);
      await speakAndRespond(fallback, 'BANKING_ASSISTANT');
    }, 600);
  };

  // Step: Identity verification
  const verifyCustomerIdentity = async () => {
    setCustomer(prev => ({ ...prev, authenticated: true }));
    addAuditLog({
      intent: 'AUTHENTICATION',
      action: 'VERIFY_IDENTITY',
      tool_called: 'get_customer_profile',
      result: 'SUCCESS',
      details: 'Cliente autenticado mediante verificación multifactor conversacional (OTP validado).'
    });

    const verifiedText = "Perfecto, Guillermo. Tu identidad ha sido verificada. Voy a consultar tus últimos movimientos.";
    const verifiedMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'ATENA',
      agent_type: 'BANKING_ASSISTANT',
      text: verifiedText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages(prev => [...prev, verifiedMsg]);
    await speakAndRespond(verifiedText, 'BANKING_ASSISTANT');

    // Automatically prompt transactions list
    setTimeout(async () => {
      addAuditLog({
        intent: 'TRANSACTION_QUERY',
        action: 'GET_TRANSACTIONS',
        tool_called: 'get_transactions',
        tool_params: { customer_id: customer.customer_id },
        details: 'Lista de últimas transacciones obtenida para selección del cliente.'
      });

      const listPrompt = "Veo las siguientes transacciones recientes. ¿Cuál de estas transacciones no reconoces?";
      const pickerMsg: ChatMessage = {
        id: `msg-tx-${Date.now()}`,
        sender: 'ATENA',
        agent_type: 'BANKING_ASSISTANT',
        text: listPrompt,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        interactive_type: 'TRANSACTION_PICKER',
        interactive_data: { transactions }
      };

      setChatMessages(prev => [...prev, pickerMsg]);
      await speakAndRespond(listPrompt, 'BANKING_ASSISTANT');
    }, 1200);
  };

  // Step: Transaction selected for fraud
  const selectTransactionToDispute = async (txId: string) => {
    const selectedTx = transactions.find(t => t.id === txId) || transactions[2]; // Default ATM $300
    
    // Switch to Nito Fraud Agent!
    setActiveAgent('FRAUD_AGENT');

    addAuditLog({
      agent_id: 'NITO-FRAUD',
      agent_title: 'Nito Fraud Agent',
      intent: 'MULTI_AGENT_HANDOVER',
      action: 'SWITCH_AGENT',
      details: 'Transición a Nito Fraud Agent: Protocolo de investigación antifraude activado.'
    });

    addAuditLog({
      agent_id: 'NITO-FRAUD',
      agent_title: 'Nito Fraud Agent',
      intent: 'UNRECOGNIZED_TRANSACTION',
      action: 'VERIFY_TRANSACTION',
      tool_called: 'verify_transaction',
      tool_params: { transaction_id: selectedTx.id },
      details: `Transacción verificada: ${selectedTx.merchant} por $${selectedTx.amount.toFixed(2)} el ${selectedTx.date}`
    });

    const introFraudText = `Entiendo, Guillermo. Soy Nito Fraud Agent. Vamos a reportar la transacción de $${selectedTx.amount.toFixed(2)} en ${selectedTx.merchant}.`;
    const fraudIntroMsg: ChatMessage = {
      id: `msg-fraud-${Date.now()}`,
      sender: 'ATENA',
      agent_type: 'FRAUD_AGENT',
      text: introFraudText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      interactive_type: 'FRAUD_INVESTIGATION_TIMELINE',
      interactive_data: {
        transaction: selectedTx,
        step: 4
      }
    };

    setChatMessages(prev => [...prev, fraudIntroMsg]);
    await speakAndRespond(introFraudText, 'FRAUD_AGENT');

    // Prompt for card blocking
    setTimeout(async () => {
      const blockPromptText = `Por seguridad, ¿quieres que bloquee temporalmente la tarjeta terminada en ${selectedTx.card_last4}?`;
      const blockMsg: ChatMessage = {
        id: `msg-block-${Date.now()}`,
        sender: 'ATENA',
        agent_type: 'FRAUD_AGENT',
        text: blockPromptText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        interactive_type: 'CARD_BLOCK_PROMPT',
        interactive_data: {
          card_last4: selectedTx.card_last4,
          card_id: 'CARD-001',
          transaction: selectedTx
        }
      };

      setChatMessages(prev => [...prev, blockMsg]);
      await speakAndRespond(blockPromptText, 'FRAUD_AGENT');
    }, 1500);
  };

  // Step: Confirm card block & generate case
  const confirmCardBlock = async (cardId: string, shouldBlock: boolean) => {
    let caseId = `FRA-20260905-${String(Math.floor(100 + Math.random() * 900))}`;

    if (shouldBlock) {
      // Block the card in state
      setCards(prev => prev.map(c => c.card_id === cardId || c.last4 === '4821' ? { ...c, status: 'BLOCKED' } : c));
      
      addAuditLog({
        agent_id: 'NITO-FRAUD',
        agent_title: 'Nito Fraud Agent',
        intent: 'CARD_BLOCK',
        action: 'BLOCK_CARD',
        tool_called: 'block_card',
        tool_params: { card_id: cardId },
        result: 'WARNING',
        details: 'Tarjeta terminada en 4821 bloqueada temporalmente por protección preventiva.'
      });
    }

    // Mark transaction as disputed
    setTransactions(prev => prev.map(t => t.amount === 300 || t.id === 'TX-003' ? { ...t, status: 'DISPUTED', dispute_case_id: caseId } : t));

    // Create fraud case
    const newCase: FraudCase = {
      case_id: caseId,
      customer_id: customer.customer_id,
      transaction_id: 'TX-003',
      merchant: 'ATM Centro',
      amount: 300.00,
      card_last4: '4821',
      reason: 'Transacción no reconocida',
      status: 'INVESTIGATION',
      department: 'Unidad de Prevención de Fraude',
      estimated_resolution: '24-48 horas',
      created_at: new Date().toISOString(),
      channel: 'Banca Digital — Nito AI',
      assigned_agent: 'Nito Fraud Agent',
      card_blocked: shouldBlock
    };

    setCases(prev => [newCase, ...prev]);

    addAuditLog({
      agent_id: 'NITO-FRAUD',
      agent_title: 'Nito Fraud Agent',
      intent: 'FRAUD_REPORT',
      action: 'CREATE_CASE',
      tool_called: 'report_fraud',
      tool_params: { customer_id: customer.customer_id, transaction_id: 'TX-003' },
      result: 'SUCCESS',
      details: `Caso generado: ${caseId}. Asignado a Unidad de Prevención de Fraude.`
    });

    const resolutionText = shouldBlock 
      ? `Listo, Guillermo. Tu tarjeta terminada en 4821 ha sido bloqueada temporalmente para proteger tu cuenta y he registrado el caso ${caseId}. El reporte fue enviado a nuestra Unidad de Prevención de Fraude con resolución estimada de 24 a 48 horas.`
      : `Listo, Guillermo. He registrado el caso ${caseId} sin bloquear tu tarjeta. Fue enviado a nuestra Unidad de Prevención de Fraude.`;

    const caseBadgeMsg: ChatMessage = {
      id: `msg-case-${Date.now()}`,
      sender: 'ATENA',
      agent_type: 'FRAUD_AGENT',
      text: resolutionText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      interactive_type: 'CASE_BADGE',
      interactive_data: { case: newCase }
    };

    setChatMessages(prev => [...prev, caseBadgeMsg]);
    await speakAndRespond(resolutionText, 'FRAUD_AGENT');
  };

  // Step: Human handoff
  const triggerHumanHandoff = async (reason: string = 'Solicitud de Asesoría Especializada') => {
    setActiveAgent('CUSTOMER_SERVICE_AGENT');
    const refCode = `HANDOFF-${Math.floor(1000 + Math.random() * 9000)}`;

    const handoffData: HumanHandoffPayload = {
      customer_id: customer.customer_id,
      customer_name: `${customer.first_name} ${customer.last_name}`,
      reason: reason,
      conversation_summary: 'Cliente reportó transacción no reconocida de $300 (ATM Centro), tarjeta ****4821 bloqueada temporalmente, caso FRA-20260905-00421 creado. Consulta adicional sobre préstamo personal.',
      case_id: cases.length > 0 ? cases[0].case_id : 'FRA-20260905-00421',
      card_last4: '4821',
      card_status: 'BLOQUEADA',
      timestamp: new Date().toISOString(),
      queue: 'Asesoría Financiera VIP & Prevención',
      reference: refCode
    };

    addAuditLog({
      agent_id: 'NITO-SUPERVISOR',
      agent_title: 'Nito Supervisor',
      intent: 'HUMAN_AGENT',
      action: 'TRANSFER_TO_HUMAN',
      tool_called: 'human_handoff',
      tool_params: handoffData,
      result: 'INFO',
      details: `Handoff exitoso con ticket ${refCode}. Contexto íntegro transferido a la bandeja del asesor.`
    });

    const handoffText = "Voy a conectarte con uno de nuestros asesores financieros. Le compartiré todo el contexto de esta conversación para que no tengas que repetir la información.";
    const handoffMsg: ChatMessage = {
      id: `msg-handoff-${Date.now()}`,
      sender: 'ATENA',
      agent_type: 'CUSTOMER_SERVICE_AGENT',
      text: handoffText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      interactive_type: 'HUMAN_HANDOFF_CARD',
      interactive_data: handoffData
    };

    setChatMessages(prev => [...prev, handoffMsg]);
    await speakAndRespond(handoffText, 'CUSTOMER_SERVICE_AGENT');
  };

  // Reset demo
  const resetDemoState = () => {
    endAtenaSession().catch(() => {});
    setLiveStatus('disconnected');
    setCustomer(INITIAL_CUSTOMER);
    setAccounts(INITIAL_ACCOUNTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setCards(INITIAL_CARDS);
    setLoans(INITIAL_LOANS);
    setCases(INITIAL_CASES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setActiveAgent('BANKING_ASSISTANT');
    setAgentStatus('IDLE');
    setChatMessages([
      {
        id: 'msg-welcome',
        sender: 'ATENA',
        agent_type: 'BANKING_ASSISTANT',
        text: 'Buenas tardes, Guillermo 👋 Soy Nito, tu asistente de banca digital con IA. ¿En qué te puedo ayudar hoy?',
        timestamp: '17:30'
      }
    ]);
    apiClient.resetDemo().catch(() => {});
  };

  return (
    <BankingContext.Provider
      value={{
        customer,
        accounts,
        transactions,
        cards,
        loans,
        cases,
        auditLogs,
        activeAgent,
        agentStatus,
        chatMessages,
        isVoiceModalOpen,
        isDrawerOpen,
        activeView,
        isMuted,
        navigateToTab,
        setNavigateToTab,
        highlightedTxId,
        setHighlightedTxId,
        isConsultingTx,
        elevenLabsConfig,
        updateElevenLabsConfig,
        setActiveView,
        setIsVoiceModalOpen,
        setIsDrawerOpen,
        toggleMute,
        sendMessage,
        liveStatus,
        startAtenaLive,
        stopAtenaLive,
        sendLiveText,
        verifyCustomerIdentity,
        selectTransactionToDispute,
        confirmCardBlock,
        triggerHumanHandoff,
        resetDemoState,
        addCustomAuditLog: addAuditLog
      }}
    >
      {children}
    </BankingContext.Provider>
  );
};

export const useBanking = () => {
  const context = useContext(BankingContext);
  if (!context) {
    throw new Error('useBanking must be used within a BankingProvider');
  }
  return context;
};
