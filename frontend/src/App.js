import "@/App.css";
import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Availability } from "@/components/Availability";
import { Services } from "@/components/Services";
import { Languages } from "@/components/Languages";
import { ProfessionalStatus } from "@/components/ProfessionalStatus";
import { InterventionZone } from "@/components/InterventionZone";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { EmergencyFab } from "@/components/EmergencyFab";
import { LegalNotice } from "@/components/LegalNotice";
import { PrivacyPolicy } from "@/components/PrivacyPolicy";
import { CACalculator } from "@/components/CACalculator";
import { AdminPage } from "@/components/admin/AdminPage";
import { SetPasswordPage } from "@/components/missions/SetPasswordPage";
import { authLinkType } from "@/lib/supabase";

const SET_PASSWORD_PATH = "/definir-mot-de-passe";

// Arrivée depuis un email d'invitation / de réinitialisation : envoie vers le choix du mot de passe
const AuthLinkRedirect = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  useEffect(() => {
    if (authLinkType && pathname !== SET_PASSWORD_PATH) navigate(SET_PASSWORD_PATH, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
};

// Navigation entre pages : repart en haut (sauf ancre #section)
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
};

const Home = () => {
  return (
    <div className="min-h-screen bg-white text-slate-950 flex flex-col font-sans">
      <a href="#contenu" className="skip-link">Aller au contenu</a>
      <Header />
      <main id="contenu" tabIndex={-1} className="flex-grow focus:outline-none">
        <Hero />
        <Availability />
        <Services />
        <Languages />
        <ProfessionalStatus />
        <InterventionZone />
        <Contact />
      </main>
      <Footer />
      <EmergencyFab />
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthLinkRedirect />
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mentions-legales" element={<LegalNotice />} />
          <Route path="/politique-confidentialite" element={<PrivacyPolicy />} />
          <Route path="/calculateur-ca" element={<CACalculator />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path={SET_PASSWORD_PATH} element={<SetPasswordPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
