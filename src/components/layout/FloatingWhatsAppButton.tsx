import React from 'react';

export const FloatingWhatsAppButton: React.FC = () => {
  const phone = '6281312139893';
  const message = 'halo saya perlu informasi/bantuan tentang ....';
  const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Bantuan Admin WhatsApp"
      title="Hubungi Bantuan Admin via WhatsApp (+62 813-1213-9893)"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-full bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 border-2 border-white/80"
    >
      {/* WhatsApp SVG Logo */}
      <svg
        viewBox="0 0 32 32"
        className="w-5 h-5 sm:w-6 sm:h-6 fill-current shrink-0"
        aria-hidden="true"
      >
        <path d="M16.002 2.667C8.636 2.667 2.667 8.636 2.667 16c0 2.352.615 4.648 1.784 6.67L2.667 29.333l6.831-1.747A13.27 13.27 0 0 0 16.002 29.333C23.364 29.333 29.333 23.364 29.333 16c0-7.364-5.969-13.333-13.331-13.333zm0 24.444a11.06 11.06 0 0 1-5.644-1.547l-.405-.24-4.053 1.036 1.081-3.951-.264-.42a11.06 11.06 0 0 1-1.696-5.989c0-6.12 4.979-11.1 11.1-11.1 6.12 0 11.1 4.98 11.1 11.1 0 6.121-4.98 11.111-11.219 11.111zm6.086-8.32c-.333-.167-1.973-.973-2.279-1.084-.306-.111-.528-.167-.751.167-.222.333-.862 1.084-1.056 1.307-.195.222-.389.25-.722.083-.333-.167-1.407-.519-2.681-1.654-.991-.884-1.66-1.976-1.855-2.31-.195-.333-.021-.513.146-.68.15-.149.333-.389.5-.583.167-.195.222-.333.333-.556.111-.222.056-.417-.028-.583-.083-.167-.751-1.807-1.029-2.474-.271-.651-.546-.563-.751-.573-.194-.01-.417-.012-.639-.012-.222 0-.583.083-.889.417-.306.333-1.167 1.14-1.167 2.78 0 1.64 1.195 3.225 1.362 3.448.167.222 2.352 3.591 5.698 5.036.796.344 1.417.549 1.901.703.799.254 1.526.218 2.101.132.641-.096 1.973-.806 2.251-1.585.278-.778.278-1.446.195-1.585-.084-.139-.306-.222-.639-.389z" />
      </svg>
      <span className="tracking-tight">Bantuan</span>
    </a>
  );
};
