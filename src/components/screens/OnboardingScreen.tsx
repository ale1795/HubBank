import React, { useState } from 'react';
import { VisionarioLogo } from '../common/VisionarioLogo';
import { createDiditSession, startDiditVerification, getDiditSessionStatus } from '../../services/diditEngine';
import { User, Mail, ArrowRight, ShieldCheck, Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface OnboardingScreenProps {
  onBackToLogin: () => void;
}

type VerificationState = 'idle' | 'verifying' | 'completed' | 'declined' | 'error';

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onBackToLogin }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [verification, setVerification] = useState<VerificationState>('idle');
  const [sessionId, setSessionId] = useState<string | null>(null);

  const canVerify = firstName.trim() && lastName.trim() && email.trim();

  const handleVerify = async () => {
    if (!canVerify) return;
    setVerification('verifying');
    try {
      // A prospective applicant has no customer_id yet — the email is the
      // vendor_data Didit (and our own backend) will link the session to.
      const session = await createDiditSession(email.trim().toLowerCase());
      setSessionId(session.session_id);
      const outcome = await startDiditVerification(session.url);

      if (outcome !== 'completed') {
        setVerification(outcome === 'cancelled' ? 'idle' : 'error');
        return;
      }

      // The SDK's "completed" only means the user finished the hosted flow —
      // the real decision arrives later via the (webhook-only) backend. Poll
      // briefly for it; if it hasn't landed yet (expected on localhost, since
      // Didit can't deliver webhooks there), fall back to a pending state.
      for (let attempt = 0; attempt < 3; attempt++) {
        const status = await getDiditSessionStatus(session.session_id).catch(() => null);
        if (status?.status === 'Approved') {
          setVerification('completed');
          return;
        }
        if (status?.status === 'Declined') {
          setVerification('declined');
          return;
        }
        await new Promise(r => setTimeout(r, 1000));
      }
      setVerification('completed');
    } catch {
      setVerification('error');
    }
  };

  return (
    <div className="relative min-h-[780px] bg-white text-slate-800 flex flex-col overflow-hidden rounded-3xl shadow-2xl max-w-md mx-auto">
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
                disabled={verification === 'verifying'}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#425E5A] focus:bg-white transition-colors disabled:opacity-60"
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
                disabled={verification === 'verifying'}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#425E5A] focus:bg-white transition-colors disabled:opacity-60"
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
                disabled={verification === 'verifying'}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#425E5A] focus:bg-white transition-colors disabled:opacity-60"
              />
            </div>
          </div>

          {verification === 'idle' && (
            <button
              type="submit"
              disabled={!canVerify}
              className="w-full py-3 px-4 rounded-xl bg-[#425E5A] hover:bg-[#2E423F] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 mt-2"
            >
              <ShieldCheck size={14} />
              <span>Verificar identidad</span>
              <ArrowRight size={14} />
            </button>
          )}

          {verification === 'verifying' && (
            <div className="w-full py-3 px-4 rounded-xl bg-slate-100 text-slate-500 font-medium text-xs flex items-center justify-center gap-2 mt-2">
              <Loader2 size={14} className="animate-spin" />
              <span>Verificando tu identidad...</span>
            </div>
          )}

          {verification === 'completed' && (
            <div className="w-full py-3 px-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium text-xs flex items-center justify-center gap-2 mt-2">
              <CheckCircle2 size={14} />
              <span>Verificación enviada. Te avisaremos cuando esté lista.</span>
            </div>
          )}

          {verification === 'declined' && (
            <div className="w-full py-3 px-4 rounded-xl bg-red-50 border border-red-200 text-red-700 font-medium text-xs flex items-center justify-center gap-2 mt-2">
              <XCircle size={14} />
              <span>No pudimos verificar tu identidad.</span>
            </div>
          )}

          {verification === 'error' && (
            <div className="w-full py-3 px-4 rounded-xl bg-red-50 border border-red-200 text-red-700 font-medium text-xs flex items-center justify-center gap-2 mt-2">
              <XCircle size={14} />
              <span>No se pudo iniciar la verificación. Intenta de nuevo.</span>
            </div>
          )}

          {sessionId && (
            <p className="text-center text-[10px] text-slate-400 font-mono">Sesión {sessionId}</p>
          )}
        </form>

        <button
          onClick={onBackToLogin}
          className="mt-6 text-[11px] text-slate-500 hover:text-[#425E5A]"
        >
          ¿Ya tienes cuenta? Inicia sesión
        </button>
      </div>
    </div>
  );
};
