import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const Home = () => {
  return (
    <div className="min-h-screen bg-white text-slate-950 flex flex-col font-sans">
      <Header />
      <main className="flex-grow">
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
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mentions-legales" element={<LegalNotice />} />
          <Route path="/politique-confidentialite" element={<PrivacyPolicy />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
