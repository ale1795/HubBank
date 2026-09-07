import express from 'express';
import cors from 'cors';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { state, logAudit } from './state.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Always 3001 — vite.config.ts proxies /api here by a hardcoded target, and an
// inherited PORT env var (e.g. injected by dev tooling for the frontend's own
// port) must never redirect this companion server onto a different one.
const PORT = 3001;
const EXPECTED_API_KEY = process.env.NITO_API_KEY || 'visionario_nito_sec_99482';

// --- Didit identity verification (KYC) ---
const DIDIT_API_BASE = 'https://verification.didit.me';
const DIDIT_API_KEY = process.env.DIDIT_API_KEY;
const DIDIT_WEBHOOK_SECRET = process.env.DIDIT_WEBHOOK_SECRET;
// Per-session config, not a secret — the "Free KYC" workflow.
const DIDIT_WORKFLOW_ID = 'eff51b8f-c404-485c-b61b-279b7bd1b22f';

app.use(cors());
// The webhook route needs its untouched raw body for signature verification —
// skip the global JSON parser there; it gets its own express.raw() below.
app.use((req, res, next) => {
  if (req.path === '/api/webhooks/didit') return next();
  express.json()(req, res, next);
});

// Serve static frontend assets from dist folder (local only — see the
// process.env.VERCEL guard near the bottom of this file for why).
if (!process.env.VERCEL) {
  app.use(express.static(path.join(__dirname, '../dist')));
}

// Middleware for authentication (supports optional Bearer token validation for ElevenLabs)
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '').trim();
    if (token && token !== EXPECTED_API_KEY && token !== 'demo-token') {
      // In strict mode, we can enforce, but for seamless demo we accept demo token or valid key
      console.warn(`[Security] Received custom token: ${token.slice(0, 8)}...`);
    }
  }
  next();
};

app.use(authMiddleware);

// Logging middleware
app.use((req, res, next) => {
  console.log(`[API ${req.method}] ${req.url}`);
  next();
});

// 1. Customer Profile
app.get('/api/customer/profile', (req, res) => {
  logAudit({
    customer_id: state.customer.customer_id,
    agent_id: 'NITO-BANKING',
    intent: 'CUSTOMER_PROFILE_LOOKUP',
    action: 'GET_PROFILE',
    tool_called: 'get_customer_profile',
    result: 'SUCCESS',
    details: 'Perfil de cliente consultado exitosamente.'
  });
  res.json({
    customer_id: state.customer.customer_id,
    first_name: state.customer.first_name,
    last_name: state.customer.last_name,
    email: state.customer.email,
    authenticated: state.customer.authenticated,
    segment: state.customer.segment
  });
});

// 2. Accounts
app.get('/api/accounts', (req, res) => {
  logAudit({
    customer_id: state.customer.customer_id,
    agent_id: 'NITO-BANKING',
    intent: 'BALANCE_QUERY',
    action: 'GET_ACCOUNTS',
    tool_called: 'get_accounts',
    result: 'SUCCESS',
    details: `Consultadas ${state.accounts.length} cuentas bancarias.`
  });
  res.json({
    accounts: state.accounts
  });
});

// 3. Transactions
app.get('/api/transactions', (req, res) => {
  const { customer_id } = req.query;
  logAudit({
    customer_id: customer_id || state.customer.customer_id,
    agent_id: 'NITO-BANKING',
    intent: 'TRANSACTION_QUERY',
    action: 'GET_TRANSACTIONS',
    tool_called: 'get_transactions',
    tool_params: { customer_id },
    result: 'SUCCESS',
    details: `Retornadas ${state.transactions.length} transacciones recientes.`
  });
  res.json({
    transactions: state.transactions
  });
});

// 4. Verify Transaction
app.post('/api/transactions/:id/verify', (req, res) => {
  const { id } = req.params;
  const tx = state.transactions.find(t => t.id === id || t.amount === 300 || t.merchant.toLowerCase().includes(id.toLowerCase()));
  
  if (!tx) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  logAudit({
    customer_id: state.customer.customer_id,
    agent_id: 'NITO-BANKING',
    intent: 'UNRECOGNIZED_TRANSACTION',
    action: 'VERIFY_TRANSACTION',
    tool_called: 'verify_transaction',
    tool_params: { transaction_id: id },
    result: 'SUCCESS',
    details: `Transacción verificada: ${tx.merchant} - $${tx.amount} (${tx.date})`
  });

  res.json({
    transaction_id: tx.id,
    merchant: tx.merchant,
    amount: tx.amount,
    date: tx.date,
    time: tx.time,
    type: tx.type,
    card_last4: tx.card_last4,
    status: tx.status
  });
});

// 5. Report Fraud
app.post('/api/fraud/report', (req, res) => {
  const { customer_id, transaction_id, reason } = req.body;
  const caseNumber = `FRA-20260905-${String(Math.floor(100 + Math.random() * 900))}`;
  
  // Find transaction and mark as disputed/flagged
  const tx = state.transactions.find(t => t.id === transaction_id || t.amount === 300);
  if (tx) {
    tx.status = 'DISPUTED';
    tx.dispute_case_id = caseNumber;
  }

  const newCase = {
    case_id: caseNumber,
    customer_id: customer_id || 'CUS-001',
    transaction_id: transaction_id || (tx ? tx.id : 'TX-003'),
    merchant: tx ? tx.merchant : 'ATM Centro',
    amount: tx ? tx.amount : 300.00,
    card_last4: tx ? tx.card_last4 : '4821',
    reason: reason || 'UNRECOGNIZED_TRANSACTION',
    status: 'INVESTIGATION',
    department: 'FRAUD_PREVENTION',
    estimated_resolution: '24-48 hours',
    created_at: new Date().toISOString(),
    channel: 'Banca Digital — Nito AI',
    assigned_agent: 'Nito Fraud Agent',
    card_blocked: true
  };

  state.cases.unshift(newCase);

  logAudit({
    customer_id: customer_id || 'CUS-001',
    agent_id: 'NITO-FRAUD',
    agent_title: 'Nito Fraud Agent',
    intent: 'FRAUD_REPORT',
    action: 'CREATE_CASE',
    tool_called: 'report_fraud',
    tool_params: req.body,
    result: 'SUCCESS',
    details: `Caso de fraude creado exitosamente: ${caseNumber} por $${newCase.amount}`
  });

  res.json({
    case_id: newCase.case_id,
    status: newCase.status,
    department: newCase.department,
    estimated_resolution: newCase.estimated_resolution,
    details: newCase
  });
});

// 6. Block Card
app.post('/api/cards/:id/block', (req, res) => {
  const { id } = req.params;
  const card = state.cards.find(c => c.card_id === id || c.last4 === id || c.last4 === '4821');
  
  if (!card) {
    return res.status(404).json({ error: 'Card not found' });
  }

  card.status = 'BLOCKED';

  logAudit({
    customer_id: state.customer.customer_id,
    agent_id: 'NITO-FRAUD',
    agent_title: 'Nito Fraud Agent',
    intent: 'CARD_BLOCK',
    action: 'BLOCK_CARD_TEMPORARY',
    tool_called: 'block_card',
    tool_params: { card_id: id },
    result: 'WARNING',
    details: `Tarjeta terminada en ${card.last4} BLOQUEADA preventivamente por reporte de fraude.`
  });

  res.json({
    card_id: card.card_id,
    last4: card.last4,
    status: card.status,
    message: 'Tu tarjeta ha sido bloqueada temporalmente para proteger tu cuenta.'
  });
});

// Unblock Card (helper for demo convenience)
app.post('/api/cards/:id/unblock', (req, res) => {
  const { id } = req.params;
  const card = state.cards.find(c => c.card_id === id || c.last4 === id || c.last4 === '4821');
  if (card) {
    card.status = 'ACTIVE';
  }
  res.json({ card_id: id, status: 'ACTIVE' });
});

// 6b. Validate Transfer
app.post('/api/transfer/validate', (req, res) => {
  const { destination_account, amount } = req.body;
  const source = state.accounts.find(a => a.type === 'Corriente');
  const destination = String(destination_account || '').toLowerCase().includes('ahorro')
    ? state.accounts.find(a => a.type === 'Ahorro')
    : state.accounts.find(a => a.type !== 'Corriente') || state.accounts[1];

  const numericAmount = Number(amount) || 0;
  const valid = !!source && !!destination && source.available_balance >= numericAmount && numericAmount > 0;

  logAudit({
    customer_id: state.customer.customer_id,
    agent_id: 'NITO-BANKING',
    intent: 'TRANSFER',
    action: 'VALIDATE_TRANSFER',
    tool_called: 'validate_transfer',
    tool_params: req.body,
    result: valid ? 'SUCCESS' : 'WARNING',
    details: valid
      ? `Transferencia validada: $${numericAmount.toFixed(2)} de ${source.type} a ${destination.type}.`
      : 'Fondos insuficientes o cuenta destino no encontrada.'
  });

  res.json({
    valid,
    source_account: source ? { account_id: source.account_id, type: source.type, available_balance: source.available_balance } : null,
    destination_account: destination ? { account_id: destination.account_id, type: destination.type } : null,
    amount: numericAmount,
    message: valid ? 'Fondos suficientes. Transferencia lista para confirmar.' : 'No es posible realizar la transferencia con los datos proporcionados.'
  });
});

// 6c. Execute Transfer
app.post('/api/transfer/execute', (req, res) => {
  const { destination_account, amount } = req.body;
  const source = state.accounts.find(a => a.type === 'Corriente');
  const destination = String(destination_account || '').toLowerCase().includes('ahorro')
    ? state.accounts.find(a => a.type === 'Ahorro')
    : state.accounts.find(a => a.type !== 'Corriente') || state.accounts[1];

  const numericAmount = Number(amount) || 0;

  if (!source || !destination || numericAmount <= 0 || source.available_balance < numericAmount) {
    logAudit({
      customer_id: state.customer.customer_id,
      agent_id: 'NITO-BANKING',
      intent: 'TRANSFER',
      action: 'EXECUTE_TRANSFER',
      tool_called: 'execute_transfer',
      tool_params: req.body,
      result: 'ERROR',
      details: 'Transferencia rechazada: fondos insuficientes o cuenta inválida.'
    });
    return res.status(400).json({ status: 'REJECTED', message: 'Fondos insuficientes o cuenta destino inválida.' });
  }

  source.balance -= numericAmount;
  source.available_balance -= numericAmount;
  destination.balance += numericAmount;
  destination.available_balance += numericAmount;

  const reference = `TRF-${Math.floor(1000000 + Math.random() * 8999999)}`;

  logAudit({
    customer_id: state.customer.customer_id,
    agent_id: 'NITO-BANKING',
    intent: 'TRANSFER',
    action: 'EXECUTE_TRANSFER',
    tool_called: 'execute_transfer',
    tool_params: req.body,
    result: 'SUCCESS',
    details: `Transferencia ${reference} completada: $${numericAmount.toFixed(2)} de ${source.type} a ${destination.type}.`
  });

  res.json({
    status: 'COMPLETED',
    reference,
    amount: numericAmount,
    source: { account_id: source.account_id, type: source.type, balance: source.balance },
    destination: { account_id: destination.account_id, type: destination.type, balance: destination.balance },
    message: 'Transferencia realizada con éxito.'
  });
});

// 7. Get Loans
app.get('/api/loans', (req, res) => {
  logAudit({
    customer_id: state.customer.customer_id,
    agent_id: 'NITO-LOANS',
    agent_title: 'Nito Loans Agent',
    intent: 'LOAN_QUERY',
    action: 'GET_LOANS',
    tool_called: 'get_loans',
    result: 'SUCCESS',
    details: 'Información de préstamos activos consultada.'
  });

  res.json({
    loan_id: state.loans[0].loan_id,
    product: state.loans[0].product,
    outstanding_balance: state.loans[0].outstanding_balance,
    next_payment: state.loans[0].next_payment,
    next_payment_date: state.loans[0].next_payment_date,
    interest_rate: state.loans[0].interest_rate,
    currency: state.loans[0].currency,
    loans: state.loans
  });
});

// 8. Human Handoff
app.post('/api/handoff', (req, res) => {
  const { customer_id, reason, conversation_summary, case_id } = req.body;
  const ref = `HANDOFF-${Math.floor(1000 + Math.random() * 9000)}`;

  logAudit({
    customer_id: customer_id || 'CUS-001',
    agent_id: 'NITO-BANKING',
    intent: 'HUMAN_AGENT',
    action: 'TRANSFER_TO_HUMAN',
    tool_called: 'human_handoff',
    tool_params: req.body,
    result: 'INFO',
    details: `Transferencia a asesor humano iniciada con referencia ${ref}. Contexto enviado.`
  });

  res.json({
    status: 'TRANSFERRED',
    queue: 'CUSTOMER_SERVICE',
    reference: ref,
    summary_received: conversation_summary || 'Sesión bancaria asistida',
    timestamp: new Date().toISOString()
  });
});

// 9. Audit Event
app.post('/api/audit/event', (req, res) => {
  const entry = logAudit(req.body);
  res.json({ status: 'RECORDED', audit_id: entry.id });
});

// 10. Audit Logs List
app.get('/api/audit/logs', (req, res) => {
  res.json({
    logs: state.auditLogs
  });
});

// 11. Cases List
app.get('/api/cases', (req, res) => {
  res.json({
    cases: state.cases
  });
});

// 12. Full State for Frontend Sync
app.get('/api/state', (req, res) => {
  res.json(state);
});

// 13. State Reset for repeatable demos
app.post('/api/reset', (req, res) => {
  state.cards[0].status = 'ACTIVE';
  state.transactions[2].status = 'COMPLETED';
  state.cases = [];
  state.customer.authenticated = false;
  logAudit({
    action: 'RESET_DEMO_STATE',
    details: 'Estado de demostración restablecido a valores iniciales.'
  });
  res.json({ status: 'RESET_SUCCESS' });
});

// 14. Create a Didit verification session (server-side only — the API key never reaches the browser)
app.post('/api/verify/session', async (req, res) => {
  if (!DIDIT_API_KEY) {
    return res.status(500).json({ error: 'DIDIT_API_KEY is not configured on the server' });
  }

  const { vendor_data, callback } = req.body || {};
  const vendorData = vendor_data || state.customer.customer_id;

  try {
    const diditRes = await fetch(`${DIDIT_API_BASE}/v3/session/`, {
      method: 'POST',
      headers: {
        'x-api-key': DIDIT_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        workflow_id: DIDIT_WORKFLOW_ID,
        vendor_data: vendorData,
        callback: callback || 'http://localhost:5173/'
      })
    });

    if (!diditRes.ok) {
      const detail = await diditRes.text();
      console.error('[Didit] session create failed:', diditRes.status, detail);
      return res.status(502).json({ error: 'session_create_failed', detail });
    }

    const session = await diditRes.json();
    state.diditSessions[session.session_id] = {
      session_id: session.session_id,
      vendor_data: vendorData,
      status: session.status || 'Not Started',
      created_at: new Date().toISOString()
    };

    logAudit({
      customer_id: vendorData,
      agent_id: 'NITO-SECURITY',
      agent_title: 'Nito Identity Verification',
      intent: 'IDENTITY_VERIFICATION',
      action: 'CREATE_SESSION',
      tool_called: 'didit_create_session',
      tool_params: { vendor_data: vendorData },
      result: 'SUCCESS',
      details: `Sesión de verificación Didit creada: ${session.session_id}`
    });

    res.json({ url: session.url, session_id: session.session_id });
  } catch (err) {
    console.error('[Didit] session create error:', err);
    res.status(502).json({ error: 'session_create_failed', detail: String(err) });
  }
});

// 15. Read back the current (locally tracked) status of a verification session —
// lets the frontend poll for the webhook-confirmed decision as a fallback to the
// SDK's own (non-authoritative) onComplete event.
app.get('/api/verify/session/:id', (req, res) => {
  const session = state.diditSessions[req.params.id];
  if (!session) return res.status(404).json({ error: 'session not found' });
  res.json(session);
});

// 16. Didit webhook — verifies X-Signature-V2 (HMAC-SHA256) before trusting anything.
// NOTE: Didit's SSRF guard refuses to deliver to localhost/private IPs, so this route
// only receives real traffic once the app is deployed behind a public HTTPS URL and a
// webhook destination pointing at it is registered in the Didit console.
function shortenFloats(v) {
  if (Array.isArray(v)) return v.map(shortenFloats);
  if (v && typeof v === 'object') {
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, shortenFloats(x)]));
  }
  if (typeof v === 'number' && !Number.isInteger(v) && v % 1 === 0) return Math.trunc(v);
  return v;
}

function sortKeys(v) {
  if (Array.isArray(v)) return v.map(sortKeys);
  if (v && typeof v === 'object') {
    return Object.keys(v).sort().reduce((acc, k) => {
      acc[k] = sortKeys(v[k]);
      return acc;
    }, {});
  }
  return v;
}

// IMPORTANT (per Didit's own guidance): HMAC the raw body exactly as received,
// never a re-`JSON.stringify`-ed copy of an already-parsed `req.body` — a body
// parser can reorder/reformat values in ways that silently break the hash.
// express.raw() hands us the untouched bytes; we only JSON.parse them
// ourselves, after the signature has checked out, purely to dispatch on
// webhook_type/status.
app.post('/api/webhooks/didit', express.raw({ type: '*/*', limit: '2mb' }), (req, res) => {
  const sig = req.headers['x-signature-v2'] || '';
  const ts = Number(req.headers['x-timestamp']);
  const rawBody = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : String(req.body || '');

  if (!DIDIT_WEBHOOK_SECRET) {
    console.warn('[Didit] webhook received but DIDIT_WEBHOOK_SECRET is not configured — rejecting.');
    return res.status(401).send('webhook not configured');
  }

  // 1. Freshness — reject anything older/newer than 300s (replay protection).
  if (!ts || Math.abs(Date.now() / 1000 - ts) > 300) {
    return res.status(401).send('stale');
  }

  let parsed;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    console.error('[Didit] webhook body is not valid JSON:', rawBody.slice(0, 500));
    return res.status(400).send('invalid json');
  }

  // 2/3. Recompute X-Signature-V2 over the canonical form (shortenFloats -> sortKeys
  // -> JSON.stringify, unescaped Unicode) and compare in constant time.
  const canonical = JSON.stringify(sortKeys(shortenFloats(parsed)));
  const expected = crypto.createHmac('sha256', DIDIT_WEBHOOK_SECRET).update(canonical, 'utf8').digest('hex');

  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    console.error('[Didit] webhook signature mismatch. Raw body for debugging:', rawBody.slice(0, 2000));
    return res.status(401).send('bad signature');
  }

  // 4. Return 2xx immediately after this point no matter what happens below —
  // Didit only retries on 5xx/404, and downstream bookkeeping here is all
  // synchronous/in-memory so there's nothing to await.
  const event = parsed;

  // NOTE: state.processedWebhookEventIds and state.diditSessions are plain
  // in-memory objects. That's fine for a single long-lived local process, but
  // on Vercel each serverless invocation may land on a cold instance with none
  // of this history — idempotency and "identity_verified" here are therefore
  // best-effort in that deployment, not durable. A real deployment needs a
  // database (Vercel KV/Postgres/etc.) behind this for that guarantee.
  if (state.processedWebhookEventIds.has(event.event_id)) {
    return res.status(200).send('ok');
  }
  state.processedWebhookEventIds.add(event.event_id);

  const sessionKey = event.session_id || event.business_session_id;
  if (sessionKey) {
    const existing = state.diditSessions[sessionKey] || { vendor_data: event.vendor_data };
    state.diditSessions[sessionKey] = {
      ...existing,
      session_id: sessionKey,
      session_kind: event.session_kind,
      status: event.status,
      decision: event.decision,
      resubmit_info: event.resubmit_info,
      updated_at: new Date().toISOString()
    };
  }

  // KYC Expired ships as "Kyc Expired" per Didit's docs, but has also been
  // observed as "KYC Expired" — compare case-insensitively for this one status
  // rather than risk silently missing it.
  const isKycExpired = typeof event.status === 'string' && event.status.toLowerCase() === 'kyc expired';

  switch (event.webhook_type) {
    case 'status.updated':
    case 'data.updated':
    case 'user.status.updated':
    case 'user.data.updated':
      if (event.vendor_data === state.customer.customer_id) {
        state.customer.identity_verification_status = event.status;
        if (event.status === 'Approved') state.customer.identity_verified = true;
        if (event.status === 'Declined' || isKycExpired) state.customer.identity_verified = false;
      }
      break;
    case 'business.status.updated':
    case 'business.data.updated':
    case 'activity.created':
    case 'transaction.created':
    case 'transaction.status.updated':
      // Not modeled by this mock banking core yet — logged below via the audit
      // trail so the event is still visible (e.g. in /api/audit/logs).
      break;
    default:
      console.warn('[Didit] unrecognized webhook_type:', event.webhook_type);
  }

  logAudit({
    customer_id: event.vendor_data,
    agent_id: 'NITO-SECURITY',
    agent_title: 'Nito Identity Verification',
    intent: 'IDENTITY_VERIFICATION',
    action: 'WEBHOOK_EVENT',
    tool_called: 'didit_webhook',
    tool_params: { webhook_type: event.webhook_type, session_id: sessionKey },
    result: event.status === 'Approved' ? 'SUCCESS' : event.status === 'Declined' ? 'ERROR' : 'INFO',
    details: `${event.webhook_type || 'evento'} · ${sessionKey || event.vendor_data} → ${event.status || 'n/a'}`
  });

  res.status(200).send('ok');
});

// On Vercel this file only runs as the /api/* serverless function (see
// api/index.js) — the dist/ build is served separately by Vercel's static
// hosting, and nothing here should try to bind a port or read dist/ from
// whatever filesystem the function happens to run in.
if (!process.env.VERCEL) {
  // SPA Fallback (local "npm run start" / "npm run server" only)
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });

  app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🏦 AI Banking Hub All-in-One Server Running`);
    console.log(`🚀 App URL: http://localhost:${PORT}`);
    console.log(`🔐 ElevenLabs Tools Endpoint Base: http://localhost:${PORT}/api`);
    console.log(`=========================================`);
  });
} else {
  // Unmatched /api/* route on Vercel — fail as JSON, not a missing-file crash.
  app.use((req, res) => res.status(404).json({ error: 'not_found' }));
}

export default app;
