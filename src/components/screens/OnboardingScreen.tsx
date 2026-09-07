import React, { useEffect, useRef, useState } from 'react';
import { VisionarioLogo } from '../common/VisionarioLogo';
import {
  createDiditSession,
  startDiditVerification,
  getDiditSessionStatus,
  getOnboardedApplicant,
  OnboardedApplicant
} from '../../services/diditEngine';
import { User, Mail, ArrowRight, ShieldCheck, Loader2, CheckCircle2, XCircle, CreditCard, Wallet } from 'lucide-react';

interface OnboardingScreenProps {
  onBackToLogin: () => void;
}

type VerificationState = 'idle' | 'verifying' | 'completed' | 'declined' | 'error';

const DIDIT_EMBED_CONTAINER_ID = 'didit-embed-container';

// On mobile, opening the system camera for the selfie/ID-photo step commonly
// suspends (and on return, reloads) the browser tab — a plain full-page
// reload that wipes all in-memory React state. Without this, the user comes
// back from the camera to a blank onboarding form. Persisting the in-progress
// session here lets the app resume the SAME Didit session (not a new one)
// instead of losing the customer's progress.
const STORAGE_KEY = 'hubbank_onboarding_progress';

interface StoredProgress {
  firstName: string;
  lastName: string;
  email: string;
  sessionId: string;
  sessionUrl: string;
  verification: VerificationState;
}

function loadProgress(): StoredProgress | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveProgress(progress: StoredProgress) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // sessionStorage unavailable (private mode, etc.) — resume just won't work
  }
}

function clearProgress() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onBackToLogin }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [verification, setVerification] = useState<VerificationState>('idle');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionUrl, setSessionUrl] = useState<string | null>(null);
  const [applicant, setApplicant] = useState<OnboardedApplicant | null>(null);
  const startedRef = useRef(false);

  const canVerify = firstName.trim() && lastName.trim() && email.trim();

  // Restore an in-progress verification after a tab reload (see STORAGE_KEY
  // comment above). Runs once on mount, before the effect below picks it up.
  useEffect(() => {
    const saved = loadProgress();
    if (!saved) return;
    setFirstName(saved.firstName);
    setLastName(saved.lastName);
    setEmail(saved.email);
    setSessionId(saved.sessionId);
    setSessionUrl(saved.sessionUrl);
    setVerification(saved.verification);
    if (saved.verification === 'completed') {
      getOnboardedApplicant(saved.email).then(setApplicant);
    }
  }, []);

  // Rendering the container div is what kicks off the actual verification —
  // the SDK needs that element already mounted before it can embed into it.
  useEffect(() => {
    if (verification !== 'verifying' || startedRef.current) return;
    startedRef.current = true;

    (async () => {
      const normalizedEmail = email.trim().toLowerCase();
      // Reuse a session restored from sessionStorage instead of creating a
      // new one, so resuming after a tab reload continues the same flow.
      let activeSessionId = sessionId;
      let activeSessionUrl = sessionUrl;
      try {
        // A prospective applicant has no customer_id yet — the email is the
        // vendor_data Didit (and our own backend) will link the session to.
        // Name goes as metadata: Didit echoes it back on the webhook, which is
        // the only place the backend can read it to provision the account.
        if (!activeSessionId || !activeSessionUrl) {
          const session = await createDiditSession(normalizedEmail, {
            first_name: firstName.trim(),
            last_name: lastName.trim()
          });
          activeSessionId = session.session_id;
          activeSessionUrl = session.url;
          setSessionId(activeSessionId);
          setSessionUrl(activeSessionUrl);
        }

        saveProgress({
          firstName, lastName, email: normalizedEmail,
          sessionId: activeSessionId, sessionUrl: activeSessionUrl,
          verification: 'verifying'
        });

        const outcome = await startDiditVerification(activeSessionUrl, DIDIT_EMBED_CONTAINER_ID);

        if (outcome !== 'completed') {
          if (outcome === 'cancelled') {
            clearProgress();
            setVerification('idle');
          } else {
            saveProgress({
              firstName, lastName, email: normalizedEmail,
              sessionId: activeSessionId, sessionUrl: activeSessionUrl,
              verification: 'error'
            });
            setVerification('error');
          }
          return;
        }

        // The SDK's "completed" only means the user finished the hosted flow —
        // the real decision (and the account/card the backend provisions on
        // approval) arrives later via the webhook-only backend. Poll briefly
        // for it; if it hasn't landed yet (expected on localhost, since Didit
        // can't deliver webhooks there), fall back to a pending state.
        for (let attempt = 0; attempt < 3; attempt++) {
          const status = await getDiditSessionStatus(activeSessionId).catch(() => null);
          if (status?.status === 'Approved') {
            const approvedApplicant = await getOnboardedApplicant(normalizedEmail);
            setApplicant(approvedApplicant);
            saveProgress({
              firstName, lastName, email: normalizedEmail,
              sessionId: activeSessionId, sessionUrl: activeSessionUrl,
              verification: 'completed'
            });
            setVerification('completed');
            return;
          }
          if (status?.status === 'Declined') {
            saveProgress({
              firstName, lastName, email: normalizedEmail,
              sessionId: activeSessionId, sessionUrl: activeSessionUrl,
              verification: 'declined'
            });
            setVerification('declined');
            return;
          }
          await new Promise(r => setTimeout(r, 1000));
        }
        // Webhook hasn't landed yet (expected on localhost, since Didit can't
        // deliver webhooks there) — show a pending "completed" state anyway;
        // getOnboardedApplicant simply returns null until the webhook arrives.
        saveProgress({
          firstName, lastName, email: normalizedEmail,
          sessionId: activeSessionId, sessionUrl: activeSessionUrl,
          verification: 'completed'
        });
        setVerification('completed');
      } catch {
        saveProgress({
          firstName, lastName, email: normalizedEmail,
          sessionId: activeSessionId || '', sessionUrl: activeSessionUrl || '',
          verification: 'error'
        });
        setVerification('error');
      }
    })();
  }, [verification, email, firstName, lastName, sessionId, sessionUrl]);

  const handleVerify = () => {
    if (!canVerify) return;
    clearProgress();
    setSessionId(null);
    setSessionUrl(null);
    startedRef.current = false;
    setVerification('verifying');
  };

  return (
    <div className="relative w-full min-h-[780px] bg-white text-slate-800 flex flex-col overflow-hidden rounded-3xl shadow-2xl max-w-md mx-auto">
      <div className="bg-[#425E5A] pt-4 pb-6 px-6">
        <div className="text-xs text-white/80 font-semibold">
          <span>9:41</span>
        </div>
        <div className="mt-4 flex justify-center">
          <VisionarioLogo variant="light" size="lg" />
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col items-center">
        <div className="text-center mb-6">
          <h2 className="text-base font-bold text-slate-900">Abre tu cuenta</h2>
          <p className="text-xs text-slate-500 mt-0.5">Verifica tu identidad para empezar</p>
        </div>

        {verification === 'idle' && (
          <form
            onSubmit={(e) => { e.preventDefault(); handleVerify(); }}
            className="w-full space-y-3.5 max-w-xs text-xs"
          >
            <div>
              <label className="text-slate-600 font-medium block mb-1">Nombre</label>
              <div className="relative flex items-center">
                <User size={15} className="absolute left-3 text-slate-400" />
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#425E5A] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-600 font-medium block mb-1">Apellido</label>
              <div className="relative flex items-center">
                <User size={15} className="absolute left-3 text-slate-400" />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Tu apellido"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#425E5A] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-600 font-medium block mb-1">Correo</label>
              <div className="relative flex items-center">
                <Mail size={15} className="absolute left-3 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tucorreo@ejemplo.com"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#425E5A] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!canVerify}
              className="w-full py-3 px-4 rounded-xl bg-[#425E5A] hover:bg-[#2E423F] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 mt-2"
            >
              <ShieldCheck size={14} />
              <span>Verificar identidad</span>
              <ArrowRight size={14} />
            </button>
          </form>
        )}

        {verification === 'verifying' && (
          <div className="w-full max-w-xs text-xs">
            {!sessionId && (
              <div className="w-full py-3 px-4 rounded-xl bg-slate-100 text-slate-500 font-medium flex items-center justify-center gap-2 mb-3">
                <Loader2 size={14} className="animate-spin" />
                <span>Preparando tu verificación...</span>
              </div>
            )}
            {/* Didit renders its hosted flow inline into this element (embedded
                mode) instead of a floating modal — stays part of the page. */}
            <div id={DIDIT_EMBED_CONTAINER_ID} className="w-full h-[420px] rounded-2xl overflow-hidden border border-slate-200" />
          </div>
        )}

        {verification === 'completed' && (
          <div className="w-full max-w-xs space-y-3">
            <div className="py-3 px-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium text-xs flex items-center justify-center gap-2 text-center">
              <CheckCircle2 size={14} className="shrink-0" />
              <span>
                {applicant
                  ? '¡Identidad verificada! Tu cuenta ya está lista.'
                  : 'Verificación enviada. Te avisaremos cuando esté lista.'}
              </span>
            </div>

            {applicant && (
              <div className="rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden text-xs">
                <div className="p-3 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#425E5A]/10 text-[#425E5A] flex items-center justify-center shrink-0">
                    <Wallet size={15} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{applicant.account.name}</p>
                    <p className="text-slate-400 font-mono">{applicant.account.account_number_masked}</p>
                  </div>
                </div>
                <div className="p-3 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#425E5A]/10 text-[#425E5A] flex items-center justify-center shrink-0">
                    <CreditCard size={15} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{applicant.card.card_name}</p>
                    <p className="text-slate-400 font-mono">**** {applicant.card.last4} · vence {applicant.card.expiry}</p>
                  </div>
                </div>
              </div>
            )}

            {applicant && (
              <p className="text-center text-[10px] text-slate-400">
                Tarjeta simulada — no está tokenizada con un procesador real.
              </p>
            )}
          </div>
        )}

        {verification === 'declined' && (
          <div className="w-full max-w-xs py-3 px-4 rounded-xl bg-red-50 border border-red-200 text-red-700 font-medium text-xs flex items-center justify-center gap-2">
            <XCircle size={14} />
            <span>No pudimos verificar tu identidad.</span>
          </div>
        )}

        {verification === 'error' && (
          <div className="w-full max-w-xs space-y-3">
            <div className="py-3 px-4 rounded-xl bg-red-50 border border-red-200 text-red-700 font-medium text-xs flex items-center justify-center gap-2">
              <XCircle size={14} />
              <span>No se pudo iniciar la verificación. Intenta de nuevo.</span>
            </div>
            <button
              onClick={() => {
                clearProgress();
                setSessionId(null);
                setSessionUrl(null);
                setVerification('idle');
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:border-[#425E5A] text-slate-700 font-medium text-xs"
            >
              Reintentar
            </button>
          </div>
        )}

        {sessionId && verification !== 'idle' && (
          <p className="mt-3 text-center text-[10px] text-slate-400 font-mono">Sesión {sessionId}</p>
        )}

        <button
          onClick={() => { clearProgress(); onBackToLogin(); }}
          className="mt-6 text-[11px] text-slate-500 hover:text-[#425E5A]"
        >
          ¿Ya tienes cuenta? Inicia sesión
        </button>
      </div>
    </div>
  );
};
