// Identity verification (KYC) via Didit. The session is created server-side
// (the API key never reaches the browser) — this module only opens the
// hosted verification flow the backend hands back and reports how it ended.
import { DiditSdk } from '@didit-protocol/sdk-web';

const API_BASE = '/api';

export interface DiditSession {
  url: string;
  session_id: string;
}

export async function createDiditSession(vendorData: string): Promise<DiditSession> {
  const res = await fetch(`${API_BASE}/verify/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vendor_data: vendorData, callback: window.location.href })
  });
  if (!res.ok) throw new Error('No se pudo crear la sesión de verificación');
  return res.json();
}

export interface DiditSessionStatus {
  session_id: string;
  status: string;
  decision?: unknown;
}

export async function getDiditSessionStatus(sessionId: string): Promise<DiditSessionStatus> {
  const res = await fetch(`${API_BASE}/verify/session/${sessionId}`);
  if (!res.ok) throw new Error('Sesión de verificación no encontrada');
  return res.json();
}

export type DiditFlowOutcome = 'completed' | 'cancelled' | 'failed';

// Opens the Didit-hosted modal for the given session URL and resolves once the
// end user finishes, cancels, or the flow errors out.
//
// IMPORTANT: per Didit's own guidance, this "completed" outcome is NOT proof of
// approval — it only means the user finished the hosted flow. The verified
// webhook is the sole source of truth for the actual decision (Approved /
// Declined / In Review), and it can only reach a backend with a public HTTPS
// URL (Didit's SSRF guard refuses localhost). Callers running against a local
// dev server should treat "completed" as a soft, non-authoritative signal.
export function startDiditVerification(url: string): Promise<DiditFlowOutcome> {
  return new Promise((resolve) => {
    DiditSdk.shared.onComplete = (result) => resolve(result.type);
    DiditSdk.shared.startVerification({ url }).catch(() => resolve('failed'));
  });
}
