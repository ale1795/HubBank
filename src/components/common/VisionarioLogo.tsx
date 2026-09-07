import React from 'react';
import logoGreen from '../../assets/logo-bancovi-green.svg';
import logoHome from '../../assets/logo-bancovi-home.svg';

interface VisionarioLogoProps {
  variant?: 'light' | 'dark' | 'gold' | 'compact';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const VisionarioLogo: React.FC<VisionarioLogoProps> = ({
  variant = 'dark',
  size = 'md',
  showSubtitle = false
}) => {
  const sizeMap = {
    sm: { logoHeight: 'h-5' },
    md: { logoHeight: 'h-6' },
    lg: { logoHeight: 'h-9' },
    xl: { logoHeight: 'h-16' },
  }[size];

  // Official vector lockup: brand-green ink for light backgrounds ('dark'
  // variant, e.g. the login screen), white wordmark + gold infinity for
  // brand-teal backgrounds (header, splash) everywhere else.
  const src = variant === 'dark' ? logoGreen : logoHome;

  return (
    <div className="flex flex-col items-center select-none">
      <img
        src={src}
        alt="Banco Visionario"
        className={`${sizeMap.logoHeight} w-auto object-contain`}
      />
      {showSubtitle && (
        <div className="flex items-center gap-2 mt-1">
          <span className="h-[1px] w-5 bg-[#C1BA73]/60" />
          <span className="text-[10px] text-[#C1BA73] font-serif">∞</span>
          <span className="h-[1px] w-5 bg-[#C1BA73]/60" />
        </div>
      )}
    </div>
  );
};
