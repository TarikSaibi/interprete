import React, { useState, useEffect } from 'react';
import { Phone, MessageSquare } from 'lucide-react';
import { INTERPRETER } from '@/constants/testIds';

export const EmergencyFab = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show FAB only after scrolling down a bit
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 150) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      className={`fixed bottom-4 left-4 right-4 z-50 flex gap-2 transition-all duration-300 md:hidden ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'
      }`}
    >
      {/* Phone Emergency FAB */}
      <a
        href="tel:+33612345678"
        data-testid={INTERPRETER.mobileEmergencyFab}
        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3.5 px-4 rounded-lg shadow-2xl flex items-center justify-center gap-2 font-bold text-base transition-colors duration-200"
      >
        <Phone className="h-5 w-5 animate-bounce" />
        <span>Urgence : 06 12 34 56 78</span>
      </a>

      {/* WhatsApp Quick FAB */}
      <a
        href="https://wa.me/33612345678"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 rounded-lg shadow-2xl flex items-center justify-center transition-colors duration-200"
        data-testid={`${INTERPRETER.mobileEmergencyFab}-whatsapp`}
        aria-label="WhatsApp Emergency"
      >
        <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.731-1.456L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.528 2.019 14.074 1 11.996 1c-5.441 0-9.864 4.37-9.868 9.8-.001 1.77.473 3.5 1.372 5.015L2.516 21.57l6.13-1.603z" />
        </svg>
      </a>
    </div>
  );
};
