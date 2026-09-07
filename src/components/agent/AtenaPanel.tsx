import React, { useState, useRef, useEffect } from 'react';
import { useBanking } from '../../context/BankingContext';
import { 
  Sparkles, 
  Mic, 
  MicOff, 
  Send, 
  X, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Lock, 
  AlertTriangle, 
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  FileText
} from 'lucide-react';
import nitoAvatar from '../../assets/nito_avatar.png';
import { useDragScroll } from '../../hooks/useDragScroll';

interface AtenaPanelProps {
  isMainScrolling?: boolean;
}

export const AtenaPanel: React.FC<AtenaPanelProps> = ({ isMainScrolling = false }) => {
  const {
    agentStatus,
    chatMessages,
    isDrawerOpen,
    setIsDrawerOpen,
    isMuted,
    toggleMute,
    liveStatus,
    startAtenaLive,
    stopAtenaLive,
    sendLiveText,
    confirmCardBlock,
    selectTransactionToDispute,
    verifyCustomerIdentity,
    resetDemoState,
    cases,
    cards
  } = useBanking();

  const [inputVal, setInputVal] = useState('');
  const suggestionChips = useDragScroll<HTMLDivElement>();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, agentStatus]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim()) return;
    const txt = inputVal;
    setInputVal('');
    sendLiveText(txt);
  };

  const handleMicToggle = () => {
    if (liveStatus === 'disconnected') {
      startAtenaLive();
    } else {
      stopAtenaLive();
    }
  };

  const isCardBlocked = cards[0]?.status === 'BLOCKED';

  return (
    <>
      {/* 1. Discrete Floating Button (Prompt Section 4: ◉ Nito) */}
      {!isDrawerOpen && (
        <div
          className={`absolute bottom-20 right-4 z-40 transition-all duration-200 ${
            isMainScrolling ? 'opacity-40 scale-90' : 'opacity-100 scale-100'
          }`}
        >
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex flex-col items-center justify-center group active:scale-95 transition-all"
            title="Hablar con Nito"
          >
            <div className="w-14 h-14 rounded-full bg-[#425E5A] border-2 border-[#C1BA73] shadow-xl flex items-center justify-center relative hover:scale-105 transition-transform p-2.5">
              <img src={nitoAvatar} alt="" className="w-full h-full object-contain" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-white animate-pulse" />
            </div>
            <span className="mt-1 text-[10px] font-bold text-[#425E5A] bg-white/95 px-2 py-0.5 rounded-full shadow-md border border-slate-200">
              Nito
            </span>
          </button>
        </div>
      )}

      {/* 2. Elegant Conversation Panel / Modal (Matching PDF aesthetic) */}
      {isDrawerOpen && (
        <div className="absolute inset-0 z-50 w-full bg-slate-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="bg-[#425E5A] text-white p-4 flex items-center justify-between border-b border-[#2E423F]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#2E423F] border border-[#C1BA73]/50 flex items-center justify-center p-1.5">
                <img src={nitoAvatar} alt="" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                  Nito
                  <span className="text-[9px] px-2 py-0.2 rounded-full bg-[#C1BA73] text-[#425E5A] font-bold">
                    IA
                  </span>
                </h3>
                <p className="text-[11px] text-[#C1BA73]">Tu asistente bancario</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleMute}
                className="p-2 text-white/70 hover:text-white rounded-lg"
                title={isMuted ? 'Activar voz' : 'Silenciar voz'}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 text-white/70 hover:text-white rounded-lg"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Voice State Banner */}
          <div className="bg-[#2E423F] text-white px-4 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                agentStatus === 'SPEAKING' ? 'bg-emerald-400 animate-ping' :
                agentStatus === 'LISTENING' ? 'bg-amber-400 animate-bounce' :
                agentStatus === 'THINKING' ? 'bg-cyan-400 animate-pulse' : 'bg-emerald-500'
              }`} />
              <span className="text-[11px] font-medium text-white/90">
                {agentStatus === 'SPEAKING' ? 'Nito está hablando...' :
                 agentStatus === 'LISTENING' ? 'Estoy escuchando...' :
                 agentStatus === 'THINKING' ? 'Procesando tu solicitud...' : 'Nito en línea'}
              </span>
            </div>

            <span className={`text-[10px] font-mono font-semibold flex items-center gap-1 ${
              liveStatus === 'connected' ? 'text-emerald-400' : liveStatus === 'connecting' ? 'text-amber-300' : 'text-[#C1BA73]'
            }`}>
              {liveStatus === 'connected' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
              {liveStatus === 'connected' ? 'En vivo · ElevenLabs' : liveStatus === 'connecting' ? 'Conectando...' : 'ElevenLabs Voice'}
            </span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3.5 text-xs">
            {chatMessages.map((msg) => {
              const isUser = msg.sender === 'USER';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-slate-400 mb-1 px-1">
                    {isUser ? 'Tú (Guillermo)' : 'Nito'} • {msg.timestamp}
                  </span>

                  <div
                    className={`p-3.5 rounded-2xl max-w-[88%] leading-relaxed shadow-sm ${
                      isUser
                        ? 'bg-[#425E5A] text-white rounded-tr-none font-medium'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>

                  {/* Interactive Widgets */}
                  {!isUser && msg.interactive_type === 'AUTH_CHALLENGE' && (
                    <div className="w-full mt-2 bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-[#425E5A] font-bold pb-2 border-b border-slate-100">
                        <ShieldCheck size={16} />
                        <span>Verificación de Identidad</span>
                      </div>
                      <div className="space-y-1 text-[11px] text-slate-600">
                        <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                          <CheckCircle2 size={13} /> Cliente identificado: Guillermo Calderón
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                          <CheckCircle2 size={13} /> Tarjeta terminada en 4829
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                          <CheckCircle2 size={13} /> Código OTP validado: 749210 ✓
                        </div>
                      </div>
                    </div>
                  )}

                  {!isUser && msg.interactive_type === 'TRANSACTION_PICKER' && (
                    <div className="w-full mt-2 bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm space-y-2 text-xs">
                      <span className="font-bold text-slate-800 block mb-1">
                        Transacción identificada para reporte:
                      </span>
                      <div
                        onClick={() => selectTransactionToDispute('TX-006')}
                        className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-between cursor-pointer hover:bg-amber-100 transition-colors"
                      >
                        <div>
                          <span className="font-bold text-slate-900 block">ATM Centro (Retiro)</span>
                          <span className="text-[10px] text-slate-500">04/09/2026 - 18:42 • ****4829</span>
                        </div>
                        <span className="font-mono font-bold text-amber-700">-$300.00</span>
                      </div>
                    </div>
                  )}

                  {!isUser && msg.interactive_type === 'CARD_BLOCK_PROMPT' && (
                    <div className="w-full mt-2 bg-white rounded-2xl p-3.5 border border-amber-300 shadow-sm space-y-3 text-xs">
                      <div className="flex items-center gap-2 text-amber-800 font-bold">
                        <AlertTriangle size={16} />
                        <span>Bloqueo Preventivo de Tarjeta</span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        ¿Deseas bloquear temporalmente tu tarjeta terminada en <strong>4829</strong>?
                      </p>
                      {!isCardBlocked ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => confirmCardBlock('CARD-4829', true)}
                            className="flex-1 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1"
                          >
                            <Lock size={12} />
                            Sí, bloquear tarjeta
                          </button>
                          <button
                            onClick={() => confirmCardBlock('CARD-4829', false)}
                            className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs border border-slate-200"
                          >
                            No bloquear
                          </button>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 font-bold text-center">
                          🔒 TARJETA BLOQUEADA TEMPORALMENTE
                        </div>
                      )}
                    </div>
                  )}

                  {!isUser && msg.interactive_type === 'CASE_BADGE' && (
                    <div className="w-full mt-2 bg-white rounded-2xl p-4 border border-[#C1BA73] shadow-md space-y-2 text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-[#C1BA73] font-mono">
                          RECLAMO GENERADO
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                          En investigación
                        </span>
                      </div>
                      <div className="space-y-1 text-[11px] text-slate-700">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Caso:</span>
                          <span className="font-mono font-bold text-slate-900">FRA-20260905-00421</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Transacción:</span>
                          <span className="font-medium text-slate-900">ATM Centro (Retiro)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Monto:</span>
                          <span className="font-mono font-bold text-amber-700">$300.00 USD</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Estado:</span>
                          <span className="text-amber-700 font-semibold">🟡 En investigación (24-48h)</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {!isUser && msg.interactive_type === 'HUMAN_HANDOFF_CARD' && (
                    <div className="w-full mt-2 bg-white rounded-2xl p-4 border border-purple-200 shadow-md space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-purple-800 font-bold pb-2 border-b border-slate-100">
                        <FileText size={16} />
                        <span>Transferencia a Asesor Certificado</span>
                      </div>
                      <div className="space-y-1 text-[11px] text-slate-600">
                        <p>Se ha enviado tu contexto al asesor:</p>
                        <p>✓ Cliente autenticado: Guillermo Calderón</p>
                        <p>✓ Caso de fraude: FRA-20260905-00421 ($300 ATM)</p>
                        <p>✓ Tarjeta ****4829: Bloqueada</p>
                        <p>✓ Consulta de préstamo pendiente</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-purple-50 text-purple-800 font-semibold text-center mt-2">
                        Conectando con Asesor Senior...
                      </div>
                    </div>
                  )}

                  {!isUser && msg.interactive_type === 'LIVE_TOOL_CALL' && (
                    <div className={`w-full mt-1 rounded-xl px-3 py-2 border flex items-center gap-2 text-[11px] font-mono ${
                      msg.interactive_data.status === 'error'
                        ? 'bg-red-50 border-red-200 text-red-700'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    }`}>
                      <span>{msg.interactive_data.status === 'error' ? '⚠️' : '🔧'}</span>
                      <span className="font-bold">{msg.interactive_data.tool}</span>
                      <span className="text-slate-400">·</span>
                      <span className="truncate">{msg.interactive_data.summary}</span>
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Voice Chips */}
          <div className="px-3 py-2 bg-slate-100/80 border-t border-slate-200">
            <div
              ref={suggestionChips.ref}
              {...suggestionChips.handlers}
              className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none cursor-grab active:cursor-grabbing select-none"
            >
              <button
                onClick={() => sendLiveText('Tengo una transacción que no reconozco.', 'fraud_alert')}
                className="text-[11px] whitespace-nowrap bg-white hover:bg-slate-50 text-slate-700 px-2.5 py-1 rounded-full border border-slate-300 shadow-sm shrink-0"
              >
                🚨 Transacción no reconocida
              </button>
              <button
                onClick={() => sendLiveText('¿Cuánto tengo en ahorros?')}
                className="text-[11px] whitespace-nowrap bg-white hover:bg-slate-50 text-slate-700 px-2.5 py-1 rounded-full border border-slate-300 shadow-sm shrink-0"
              >
                💰 Consultar saldo
              </button>
              <button
                onClick={() => sendLiveText('¿Cuánto debo de mi préstamo?', 'loan')}
                className="text-[11px] whitespace-nowrap bg-white hover:bg-slate-50 text-slate-700 px-2.5 py-1 rounded-full border border-slate-300 shadow-sm shrink-0"
              >
                💳 Mi préstamo
              </button>
            </div>
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <button
              type="button"
              onClick={handleMicToggle}
              className={`p-2.5 rounded-full transition-all shadow-sm ${
                liveStatus !== 'disconnected'
                  ? `bg-red-500 text-white ${agentStatus === 'LISTENING' ? 'animate-pulse' : ''}`
                  : 'bg-[#425E5A] text-[#C1BA73] hover:bg-[#2E423F]'
              }`}
              title={liveStatus === 'disconnected' ? 'Hablar con Nito (voz en vivo)' : 'Terminar sesión de voz'}
            >
              {liveStatus === 'disconnected' ? <Mic size={16} /> : <MicOff size={16} />}
            </button>

            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={liveStatus === 'connected' ? 'Escribe a Nito...' : 'Habla o escribe para conectar con Nito...'}
              className="flex-1 bg-slate-100 border border-slate-200 rounded-full px-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#425E5A] focus:bg-white"
            />

            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="p-2.5 rounded-full bg-[#425E5A] hover:bg-[#2E423F] disabled:opacity-40 text-white transition-all shadow-sm"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
