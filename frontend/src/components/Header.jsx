import React, { useState } from 'react';
import { Phone, Menu, X, Scale } from 'lucide-react';
import { INTERPRETER } from '@/constants/testIds';

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Disponibilité', href: '#disponibilite', id: INTERPRETER.navAvailability },
    { name: 'Services', href: '#services', id: INTERPRETER.navServices },
    { name: 'Langues', href: '#langues', id: INTERPRETER.navLanguages },
    { name: 'Statut', href: '#statut', id: INTERPRETER.navStatus },
    { name: 'Zones', href: '#zones', id: INTERPRETER.navZone },
    { name: 'Contact', href: '#contact', id: INTERPRETER.navContact },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-slate-200 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Identity */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0A192F] text-white rounded-sm">
              <Scale className="h-6 w-6" />
            </div>
            <div>
              <div 
                className="font-headings font-bold text-lg sm:text-xl text-[#0A192F]" 
                data-testid={INTERPRETER.professionalName}
              >
                Marc LAURENT
              </div>
              <div 
                className="text-xs text-slate-500 font-medium tracking-wide hidden sm:block"
                data-testid={INTERPRETER.professionalTitle}
              >
                Interprète-Traducteur Judiciaire Assermenté
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                data-testid={link.id}
                className="text-sm font-medium text-slate-600 hover:text-[#1E3A8A] transition-colors duration-200"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Phone Call CTA */}
          <div className="hidden sm:flex items-center">
            <a
              href="tel:+33612345678"
              data-testid={INTERPRETER.headerPhoneCta}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A192F] hover:bg-[#1E3A8A] text-white font-semibold text-sm transition-all duration-200 rounded-sm shadow-sm hover:shadow"
            >
              <Phone className="h-4 w-4" />
              <span>06 12 34 56 78</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <a
              href="tel:+33612345678"
              className="flex sm:hidden items-center justify-center p-2.5 bg-[#0A192F] text-white rounded-sm"
              data-testid={`${INTERPRETER.headerPhoneCta}-mobile`}
            >
              <Phone className="h-5 w-5" />
            </a>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-slate-600 hover:text-[#0A192F] focus:outline-none"
              aria-label="Toggle Menu"
              data-testid="mobile-menu-toggle"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                data-testid={`${link.id}-mobile`}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-[#1E3A8A] hover:bg-slate-50 transition-colors duration-200"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-4 pb-2 border-t border-slate-100">
              <a
                href="tel:+33612345678"
                data-testid={`${INTERPRETER.headerPhoneCta}-mobile-list`}
                className="flex items-center justify-center gap-2 w-full py-3 bg-[#0A192F] text-white font-bold rounded-sm shadow-md"
              >
                <Phone className="h-5 w-5" />
                <span>Appeler : 06 12 34 56 78</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
