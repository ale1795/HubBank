// Identity verification (KYC) via Didit. The session is created server-side
// (the API key never reaches the browser) — this module only opens the
// hosted verification flow the backend hands back and reports how it ended.
import { DiditSdk } from '@didit-protocol/sdk-web';

const API_BASE = '/api';

export interface DiditSession {
  url: string;
  session_id: string;
}

export async function createDiditSession(
  vendorData: string,
  metadata?: Record<string, string>
): Promise<DiditSession> {
  const res = await fetch(`${API_BASE}/verify/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vendor_data: vendorData, callback: window.location.href, metadata })
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

// The account + mock card the backend provisions once Didit approves an
// onboarding applicant. See server/state.js#createOnboardedApplicant — the
// card is NOT tokenized, there's no real card processor behind this demo.
export interface OnboardedApplicant {
  customer_id: string;
  first_name: string;
  last_name: string;
  email: string;
  account: { account_id: string; name: string; account_number_masked: string };
  card: { card_id: string; last4: string; expiry: string; brand: string; card_name: string };
}

export async function getOnboardedApplicant(email: string): Promise<OnboardedApplicant | null> {
  const res = await fetch(`${API_BASE}/onboarding/applicant/${encodeURIComponent(email.toLowerCase())}`);
  if (!res.ok) return null;
  return res.json();
}

export type DiditFlowOutcome = 'completed' | 'cancelled' | 'failed';

// Opens the Didit-hosted flow for the given session URL and resolves once the
// end user finishes, cancels, or the flow errors out.
//
// Pass `embeddedContainerId` (the id of an element already in the DOM) to
// render the flow inline inside your own layout instead of a floating modal —
// the page never navigates away either way, but embedded mode reads as part
// of the page rather than a popup on top of it. Omit it for the modal.
//
// IMPORTANT: per Didit's own guidance, this "completed" outcome is NOT proof of
// approval — it only means the user finished the hosted flow. The verified
// webhook is the sole source of truth for the actual decision (Approved /
// Declined / In Review), and it can only reach a backend with a public HTTPS
// URL (Didit's SSRF guard refuses localhost). Callers running against a local
// dev server should treat "completed" as a soft, non-authoritative signal.
export function startDiditVerification(url: string, embeddedContainerId?: string): Promise<DiditFlowOutcome> {
  return new Promise((resolve) => {
    DiditSdk.shared.onComplete = (result) => resolve(result.type);
    DiditSdk.shared
      .startVerification({
        url,
        configuration: embeddedContainerId
          ? { embedded: true, embeddedContainerId, showCloseButton: false }
          : undefined
      })
      .catch(() => resolve('failed'));
  });
}
