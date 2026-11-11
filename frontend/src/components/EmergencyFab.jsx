import React, { useState, useEffect } from 'react';
import { Phone, MessageSquare } from 'lucide-react';
import { INTERPRETER } from '@/constants/testIds';
import { PHONE_DISPLAY, PHONE_HREF, WHATSAPP_HREF } from '@/constants/contact';
import { WhatsAppIcon } from '@/components/WhatsAppIcon';

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

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      inert={!isVisible}
      className={`fixed bottom-4 left-4 right-4 z-50 flex gap-2 transition-all duration-300 md:hidden ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'
      }`}
    >
      {/* Phone Emergency FAB */}
      <a
        href={PHONE_HREF}
        data-testid={INTERPRETER.mobileEmergencyFab}
        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3.5 px-4 rounded-lg shadow-2xl flex items-center justify-center gap-2 font-bold text-base transition-colors duration-200"
      >
        <Phone className="h-5 w-5 animate-bounce" />
        <span>Urgence : {PHONE_DISPLAY}</span>
      </a>

      {/* WhatsApp Quick FAB */}
      <a
        href={WHATSAPP_HREF}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 rounded-lg shadow-2xl flex items-center justify-center transition-colors duration-200"
        data-testid={`${INTERPRETER.mobileEmergencyFab}-whatsapp`}
        aria-label="Contacter sur WhatsApp"
      >
        <WhatsAppIcon />
      </a>
    </div>
  );
};
