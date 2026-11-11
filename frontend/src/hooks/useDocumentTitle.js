import { useEffect } from 'react';

const SITE = 'Kenza ALIM — Interprète judiciaire';

// Titre d'onglet propre à la page ; le titre précédent est restauré en quittant la page
export function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = `${title} | ${SITE}`;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
