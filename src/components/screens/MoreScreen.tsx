import React from 'react';
import { useBanking } from '../../context/BankingContext';
import { 
  FileText, 
  FileCheck, 
  MessageSquare, 
  HelpCircle, 
  Lock, 
  User, 
  Bell, 
  Settings, 
  MapPin, 
  Calculator, 
  PhoneCall, 
  Share2, 
  BookOpen, 
  ShieldCheck, 
  LogOut,
  ChevronRight
} from 'lucide-react';

interface MoreScreenProps {
  onLogout: () => void;
}

export const MoreScreen: React.FC<MoreScreenProps> = ({ onLogout }) => {
  const { customer, setIsDrawerOpen, sendMessage } = useBanking();

  return (
    <div className="space-y-4 pb-32 text-slate-800 animate-in fade-in duration-200 max-w-md mx-auto">
      {/* Profile Card (Page 8 of PDF) */}
      <div className="bg-[#425E5A] text-white rounded-3xl p-5 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-[#2E423F] border-2 border-[#C1BA73] text-[#C1BA73] text-sm font-bold flex items-center justify-center shadow-inner">
            {customer.first_name[0]}{customer.last_name[0]}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              {customer.first_name} {customer.last_name}
            </h3>
            <span className="text-[10px] text-white/70 block">
              Cliente desde {customer.client_since}
            </span>
            <span className="inline-block mt-1 text-[9px] px-2 py-0.5 rounded-full bg-[#C1BA73] text-[#425E5A] font-bold">
              {customer.segment}
            </span>
          </div>
        </div>

        <div className="text-right flex items-center gap-2">
          <div>
            <span className="text-[9px] text-white/60 block">Último acceso</span>
            <span className="text-[10px] text-white/90 font-medium">{customer.last_access}</span>
          </div>
          <ChevronRight size={18} className="text-[#C1BA73]" />
        </div>
      </div>

      {/* 1. Consultas y Solicitudes */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
        <span className="text-[11px] font-bold text-slate-400 block px-1">Consultas y solicitudes</span>
        <div className="grid grid-cols-4 gap-2 text-center text-[10px] text-slate-700 font-medium">
          <div className="flex flex-col items-center gap-1.5 p-1 cursor-pointer hover:text-[#425E5A]">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#425E5A]">
              <FileText size={17} />
            </div>
            <span>Estados de cuenta</span>
          </div>

          <div className="flex flex-col items-center gap-1.5 p-1 cursor-pointer hover:text-[#425E5A]">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#425E5A]">
              <FileCheck size={17} />
            </div>
            <span>Solicitudes y trámites</span>
          </div>

          <div className="flex flex-col items-center gap-1.5 p-1 cursor-pointer hover:text-[#425E5A]">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#425E5A]">
              <MessageSquare size={17} />
            </div>
            <span>Mensajería segura</span>
          </div>

          <div className="flex flex-col items-center gap-1.5 p-1 cursor-pointer hover:text-[#425E5A]">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#425E5A]">
              <HelpCircle size={17} />
            </div>
            <span>Preguntas frecuentes</span>
          </div>
        </div>
      </div>

      {/* 2. Gestión Personal */}
      <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 space-y-1">
        <span className="text-[11px] font-bold text-slate-400 block px-2 pt-1 pb-2">Gestión personal</span>
        
        <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer text-xs">
          <div className="flex items-center gap-3">
            <Lock size={16} className="text-[#425E5A]" />
            <div>
              <span className="font-semibold text-slate-800 block">Seguridad</span>
              <span className="text-[10px] text-slate-400">Contraseñas, dispositivos y acceso</span>
            </div>
          </div>
          <ChevronRight size={14} className="text-slate-400" />
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer text-xs">
          <div className="flex items-center gap-3">
            <User size={16} className="text-[#425E5A]" />
            <div>
              <span className="font-semibold text-slate-800 block">Perfil</span>
              <span className="text-[10px] text-slate-400">Información personal y preferencias</span>
            </div>
          </div>
          <ChevronRight size={14} className="text-slate-400" />
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer text-xs">
          <div className="flex items-center gap-3">
            <Bell size={16} className="text-[#425E5A]" />
            <div>
              <span className="font-semibold text-slate-800 block">Alertas y notificaciones</span>
              <span className="text-[10px] text-slate-400">Administra tus alertas</span>
            </div>
          </div>
          <ChevronRight size={14} className="text-slate-400" />
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer text-xs">
          <div className="flex items-center gap-3">
            <Settings size={16} className="text-[#425E5A]" />
            <div>
              <span className="font-semibold text-slate-800 block">Configuración</span>
              <span className="text-[10px] text-slate-400">Idioma, apariencia y más</span>
            </div>
          </div>
          <ChevronRight size={14} className="text-slate-400" />
        </div>
      </div>

      {/* 3. Herramientas y Servicios */}
      <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 space-y-1">
        <span className="text-[11px] font-bold text-slate-400 block px-2 pt-1 pb-2">Herramientas y servicios</span>

        <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer text-xs">
          <div className="flex items-center gap-3">
            <MapPin size={16} className="text-[#425E5A]" />
            <div>
              <span className="font-semibold text-slate-800 block">Ubícanos</span>
              <span className="text-[10px] text-slate-400">Sucursales, cajeros y corresponsales</span>
            </div>
          </div>
          <ChevronRight size={14} className="text-slate-400" />
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer text-xs">
          <div className="flex items-center gap-3">
            <Calculator size={16} className="text-[#425E5A]" />
            <div>
              <span className="font-semibold text-slate-800 block">Calculadoras y simuladores</span>
              <span className="text-[10px] text-slate-400">Herramientas financieras</span>
            </div>
          </div>
          <ChevronRight size={14} className="text-slate-400" />
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer text-xs">
          <div className="flex items-center gap-3">
            <PhoneCall size={16} className="text-[#425E5A]" />
            <div>
              <span className="font-semibold text-slate-800 block">Contáctanos</span>
              <span className="text-[10px] text-slate-400">Estamos para ayudarte</span>
            </div>
          </div>
          <ChevronRight size={14} className="text-slate-400" />
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer text-xs">
          <div className="flex items-center gap-3">
            <Share2 size={16} className="text-[#425E5A]" />
            <div>
              <span className="font-semibold text-slate-800 block">Comparte la app</span>
              <span className="text-[10px] text-slate-400">Invita a más personas</span>
            </div>
          </div>
          <ChevronRight size={14} className="text-slate-400" />
        </div>
      </div>

      {/* 4. Información Legal */}
      <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 space-y-1">
        <span className="text-[11px] font-bold text-slate-400 block px-2 pt-1 pb-2">Información legal</span>

        <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer text-xs">
          <div className="flex items-center gap-3">
            <BookOpen size={16} className="text-[#425E5A]" />
            <span className="font-semibold text-slate-800">Términos y condiciones</span>
          </div>
          <ChevronRight size={14} className="text-slate-400" />
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer text-xs">
          <div className="flex items-center gap-3">
            <ShieldCheck size={16} className="text-[#425E5A]" />
            <span className="font-semibold text-slate-800">Políticas de privacidad</span>
          </div>
          <ChevronRight size={14} className="text-slate-400" />
        </div>
      </div>

      {/* Cerrar Sesión */}
      <button
        onClick={onLogout}
        className="w-full py-3 rounded-2xl bg-white hover:bg-red-50 text-red-600 font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 transition-colors shadow-sm"
      >
        <LogOut size={16} />
        <span>Cerrar sesión</span>
      </button>
    </div>
  );
};
