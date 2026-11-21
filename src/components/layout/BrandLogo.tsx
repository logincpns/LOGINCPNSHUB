import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  theme?: 'light' | 'dark';
  showSubtitle?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  theme = 'light',
  showSubtitle = false,
  className = ''
}) => {
  const iconBoxSize =
    size === 'sm'
      ? 'w-8 h-8 rounded-[9px]'
      : size === 'lg'
      ? 'w-11 h-11 rounded-xl'
      : 'w-9 h-9 sm:w-10 sm:h-10 rounded-[10px]';

  const titleSize =
    size === 'sm'
      ? 'text-base sm:text-lg'
      : size === 'lg'
      ? 'text-xl sm:text-2xl'
      : 'text-base sm:text-lg md:text-xl';

  return (
    <div className={`inline-flex items-center gap-2 sm:gap-2.5 shrink-0 ${className}`}>
      {/* Emblem cropped cleanly from the official LOGINCPNS logo asset */}
      <div
        className={`${iconBoxSize} overflow-hidden shrink-0 flex items-start justify-center shadow-2xs ${
          theme === 'dark' ? 'bg-white/10 ring-1 ring-white/20' : ''
        }`}
      >
        <img
          src="/assets/aistudio/image_171e0b3e.png"
          alt="Logo LOGIN CPNS"
          className="w-[136%] max-w-none -mt-[3%] select-none pointer-events-none"
        />
      </div>

      {/* Matching Brand Wordmark */}
      <div className="flex flex-col leading-none">
        <span
          className={`font-extrabold tracking-tight whitespace-nowrap ${titleSize} ${
            theme === 'dark' ? 'text-white' : 'text-[#122649]'
          }`}
        >
          LOGIN
          <span className={theme === 'dark' ? 'text-sky-400' : 'text-[#2896d3]'}>
            CPNS
          </span>
        </span>
        {showSubtitle && (
          <span
            className={`text-[9px] font-extrabold tracking-[0.16em] uppercase mt-0.5 whitespace-nowrap ${
              theme === 'dark' ? 'text-sky-200' : 'text-[#122649]'
            }`}
          >
            BIMBEL SKD
          </span>
        )}
      </div>
    </div>
  );
};
