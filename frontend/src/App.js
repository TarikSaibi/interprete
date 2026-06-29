import React, { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
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

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  useEffect(() => {
    const pingBackend = async () => {
      try {
        const response = await axios.get(`${API}/`);
        console.log("Backend status:", response.data.message);
      } catch (e) {
        console.warn("Backend connection skipped or offline (static mode):", e.message);
      }
    };
    pingBackend();
  }, []);

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
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
