import React from 'react';
import { AgentStatus, AgentType } from '../../types/banking';
import { Bot, ShieldAlert, BadgePercent, Headphones, Sparkles } from 'lucide-react';

interface AgentAvatarProps {
  agentType: AgentType;
  status: AgentStatus;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatusLabel?: boolean;
}

export const AgentAvatar: React.FC<AgentAvatarProps> = ({
  agentType,
  status,
  size = 'md',
  showStatusLabel = false
}) => {
  const getAgentConfig = () => {
    switch (agentType) {
      case 'FRAUD_AGENT':
        return {
          name: 'Nito Fraud Agent',
          subtitle: 'Unidad de Prevención de Fraude',
          icon: ShieldAlert,
          bgGradient: 'from-amber-600 to-amber-900',
          borderColor: 'border-amber-400',
          glowColor: 'shadow-glow-gold',
          textColor: 'text-amber-400',
          tagBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30'
        };
      case 'LOANS_AGENT':
        return {
          name: 'Nito Loans Agent',
          subtitle: 'Especialista en Créditos',
          icon: BadgePercent,
          bgGradient: 'from-emerald-600 to-teal-900',
          borderColor: 'border-emerald-400',
          glowColor: 'shadow-glow-emerald',
          textColor: 'text-emerald-400',
          tagBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
        };
      case 'CUSTOMER_SERVICE_AGENT':
        return {
          name: 'Nito Handoff Bridge',
          subtitle: 'Derivación a Asesor Certificado',
          icon: Headphones,
          bgGradient: 'from-purple-600 to-indigo-900',
          borderColor: 'border-purple-400',
          glowColor: 'shadow-purple-500/30',
          textColor: 'text-purple-400',
          tagBg: 'bg-purple-500/10 text-purple-300 border-purple-500/30'
        };
      case 'BANKING_ASSISTANT':
      default:
        return {
          name: 'Nito Banking Assistant',
          subtitle: 'Agente Financiero Inteligente',
          icon: Sparkles,
          bgGradient: 'from-blue-600 via-brand-teal to-blue-900',
          borderColor: 'border-cyan-400',
          glowColor: 'shadow-glow-teal',
          textColor: 'text-cyan-400',
          tagBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
        };
    }
  };

  const config = getAgentConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-11 h-11 text-base',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl',
  }[size];

  const iconSizes = {
    sm: 14,
    md: 20,
    lg: 28,
    xl: 42,
  }[size];

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div
          className={`${sizeClasses} rounded-2xl bg-gradient-to-br ${config.bgGradient} p-0.5 border ${config.borderColor} flex items-center justify-center text-white shadow-lg ${config.glowColor} transition-all duration-300 relative overflow-hidden`}
        >
          {status === 'SPEAKING' && (
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          )}
          {status === 'THINKING' && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          )}
          <Icon size={iconSizes} className="relative z-10 drop-shadow" />
        </div>

        {/* Live Status indicator dot */}
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0A1128] transition-colors ${
            status === 'SPEAKING'
              ? 'bg-emerald-400 animate-ping'
              : status === 'LISTENING'
              ? 'bg-amber-400 animate-bounce'
              : status === 'THINKING'
              ? 'bg-cyan-400 animate-pulse'
              : 'bg-emerald-500'
          }`}
        />
      </div>

      {showStatusLabel && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white tracking-tight">{config.name}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${config.tagBg}`}>
              {agentType === 'FRAUD_AGENT' ? 'Antifraude' : agentType === 'LOANS_AGENT' ? 'Créditos' : agentType === 'CUSTOMER_SERVICE_AGENT' ? 'Asesor' : 'General'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>{config.subtitle}</span>
            <span className="text-slate-600">•</span>
            <span className={`text-[11px] font-medium ${
              status === 'SPEAKING' ? 'text-emerald-400' :
              status === 'LISTENING' ? 'text-amber-400 font-semibold' :
              status === 'THINKING' ? 'text-cyan-400' : 'text-slate-400'
            }`}>
              {status === 'SPEAKING' ? 'Hablando...' :
               status === 'LISTENING' ? 'Escuchando...' :
               status === 'THINKING' ? 'Procesando...' : 'En línea'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
