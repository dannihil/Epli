import React, { useEffect, useState } from "react";
import "./App.css";
import { Analytics } from "@vercel/analytics/react";
import { useUser } from "@clerk/clerk-react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import FooterModal from "./components/FooterModal";

import Home from "./pages/Home";
import FGorder from "./pages/FGorder";
import Cto from "./pages/Cto";
import MacbookAir from "./pages/cto-pages/MacbookAir";
import MacbookPro from "./pages/cto-pages/MacbookPro";
import MacbookProTest from "./pages/cto-pages/MacbookProTest";
import MacStudio from "./pages/cto-pages/MacStudio";
import MacMini from "./pages/cto-pages/Macmini";
import MacPro from "./pages/cto-pages/MacPro";
import Imac from "./pages/cto-pages/Imac";
import Commissions from "./pages/Commission";

function App() {
  const { user } = useUser();

  const [showFooter, setShowFooter] = useState(window.innerWidth > 1200);
  const [modalOpen, setModalOpen] = useState(false);

  // Handle responsive footer
  useEffect(() => {
    const handleResize = () => setShowFooter(window.innerWidth > 1200);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Router>
      {/* NavBar */}
      <div className="navbar-container">
        <NavBar />
      </div>

      {/* Main Content */}
      <div className="main-content-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/stada-sendinga" element={<FGorder />} />
          <Route path="/cto" element={<Cto />} />
          <Route path="/cto/macbook-air" element={<MacbookAir />} />
          <Route path="/cto/macbook-pro" element={<MacbookPro />} />
          <Route path="/cto/macbook-pro-test" element={<MacbookProTest />} />
          <Route path="/cto/imac" element={<Imac />} />
          <Route path="/cto/mac-studio" element={<MacStudio />} />
          <Route path="/cto/mac-mini" element={<MacMini />} />
          <Route path="/cto/mac-pro" element={<MacPro />} />
          <Route path="/commission" element={<Commissions />} />
        </Routes>
      </div>

      {/* Footer */}
      {showFooter && <Footer openModal={() => setModalOpen(true)} />}

      {/* Footer Modal */}
      {modalOpen && <FooterModal closeModal={() => setModalOpen(false)} />}

      <Analytics />
    </Router>
  );
}

export default App;
