import React from "react";
import "./App.css";
import { Analytics } from "@vercel/analytics/react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  UserButton,
  useUser,
} from "@clerk/clerk-react";
import NavBar from "./components/NavBar";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import FGorder from "./pages/FGorder";
import Footer from "./components/Footer";
import Cto from "./pages/Cto";
import MacbookAir from "./pages/cto-pages/MacbookAir";
import MacbookPro from "./pages/cto-pages/MacbookPro";
import MacStudio from "./pages/cto-pages/MacStudio";
import MacMini from "./pages/cto-pages/Macmini";
import MacPro from "./pages/cto-pages/MacPro";
import Imac from "./pages/cto-pages/Imac";
import MacbookProTest from "./pages/cto-pages/MacbookProTest";

function App() {
  const { user, isSignedIn } = useUser();

  return (
    <Router>
      <div className="navbar-container">
        <NavBar />
      </div>
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
        </Routes>
      </div>
      <div className="navbar-container">
        <Footer />
      </div>
      <Analytics />
    </Router>
  );
}

export default App;
