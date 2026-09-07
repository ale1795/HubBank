import React, { useState } from 'react';
import { VisionarioLogo } from '../common/VisionarioLogo';
import { User, Lock, Eye, EyeOff, Fingerprint, MapPin, HelpCircle, Shield, PhoneCall, ArrowRight } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onCreateAccount: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onCreateAccount }) => {
  const [username, setUsername] = useState('guillermo.calderon');
  const [password, setPassword] = useState('••••••••••');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess();
  };

  return (
    <div className="relative w-full min-h-[780px] bg-white text-slate-800 flex flex-col justify-between overflow-hidden rounded-3xl shadow-2xl max-w-md mx-auto">
      {/* Top Status + Logo — same teal band as the in-app header */}
      <div className="bg-[#425E5A] pt-4 pb-6 px-6">
        <div className="text-xs text-white/80 font-semibold">
          <span>9:41</span>
        </div>

        <div className="mt-4 flex justify-center">
          <VisionarioLogo variant="light" size="lg" />
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 flex-1 flex flex-col items-center">
        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-base font-bold text-slate-900">Bienvenido de nuevo</h2>
          <p className="text-xs text-slate-500 mt-0.5">Ingresa tus credenciales para continuar</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-3.5 max-w-xs text-xs">
          <div>
            <label className="text-slate-600 font-medium block mb-1">Usuario</label>
            <div className="relative flex items-center">
              <User size={15} className="absolute left-3 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#425E5A] focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-600 font-medium block mb-1">Contraseña</label>
            <div className="relative flex items-center">
              <Lock size={15} className="absolute left-3 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#425E5A] focus:bg-white transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="text-right">
            <a href="#recuperar" onClick={(e) => e.preventDefault()} className="text-[11px] text-slate-500 hover:text-[#425E5A]">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {/* Primary Iniciar Sesión Button */}
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-[#425E5A] hover:bg-[#2E423F] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 mt-2"
          >
            <span>Iniciar sesión</span>
            <ArrowRight size={14} />
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-3">
            <span className="h-[1px] flex-1 bg-slate-200" />
            <span className="text-[11px] text-slate-400">o</span>
            <span className="h-[1px] flex-1 bg-slate-200" />
          </div>

          {/* Biometrics */}
          <button
            type="button"
            onClick={onLoginSuccess}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:border-[#425E5A] bg-white text-slate-700 font-medium text-xs flex items-center justify-center gap-2 transition-all hover:bg-slate-50"
          >
            <Fingerprint size={16} className="text-[#425E5A]" />
            <span>Iniciar sesión con biometría</span>
          </button>
        </form>

        {/* Quick Help Icons */}
        <div className="grid grid-cols-4 gap-4 w-full max-w-xs mt-6 text-center text-[10px] text-slate-600">
          <div className="flex flex-col items-center gap-1 cursor-pointer hover:text-[#425E5A]">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
              <MapPin size={14} />
            </div>
            <span>Ubícanos</span>
          </div>

          <div className="flex flex-col items-center gap-1 cursor-pointer hover:text-[#425E5A]">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
              <HelpCircle size={14} />
            </div>
            <span>Ayuda</span>
          </div>

          <div className="flex flex-col items-center gap-1 cursor-pointer hover:text-[#425E5A]">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
              <Shield size={14} />
            </div>
            <span>Seguridad</span>
          </div>

          <div className="flex flex-col items-center gap-1 cursor-pointer hover:text-[#425E5A]">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
              <PhoneCall size={14} />
            </div>
            <span>Contáctanos</span>
          </div>
        </div>

        <button
          onClick={onCreateAccount}
          className="mt-6 text-[11px] text-slate-500 hover:text-[#425E5A]"
        >
          ¿No tienes cuenta? Ábrela aquí
        </button>
      </div>
    </div>
  );
};
