import React from 'react';
import { VisionarioLogo } from '../common/VisionarioLogo';
import { ArrowRight } from 'lucide-react';

interface SplashScreenProps {
  onEnter: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onEnter }) => {
  return (
    <div className="relative min-h-[750px] bg-[#425E5A] text-white flex flex-col justify-between p-8 overflow-hidden rounded-3xl shadow-2xl max-w-md mx-auto">
      {/* Top Status */}
      <div className="flex justify-between text-xs text-white/70 font-semibold">
        <span>9:41</span>
        <span>Banco Visionario</span>
      </div>

      {/* Center Branding */}
      <div className="flex-1 flex flex-col items-center justify-center text-center my-12 relative z-10">
        <VisionarioLogo variant="gold" size="xl" showSubtitle={true} />

        <p className="text-xs text-[#C1BA73] tracking-wider uppercase font-medium mt-4">
          Tu visión, nuestro compromiso.
        </p>

        <button
          onClick={onEnter}
          className="mt-12 px-6 py-3 rounded-full bg-[#C1BA73] hover:bg-[#D6CE94] text-[#425E5A] font-bold text-xs tracking-wider uppercase transition-all shadow-lg flex items-center gap-2 active:scale-95"
        >
          <span>Ingresar a la Banca</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Organic Golden Curves Watermark (matching PDF page 2) */}
      <div className="absolute -bottom-10 -right-10 w-80 h-80 rounded-full border-[18px] border-[#C1BA73]/20 pointer-events-none" />
      <div className="absolute -bottom-24 -left-12 w-96 h-96 rounded-full border-[22px] border-[#C1BA73]/15 pointer-events-none" />
      
      <div className="text-center text-[10px] text-white/40 z-10">
        Propuesta preliminar — Banco Visionario
      </div>
    </div>
  );
};
