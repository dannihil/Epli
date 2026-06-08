import React, { useEffect, useState } from "react";
import "../css/NavBar.css";
import { useNavigate } from "react-router-dom";
import { FaUser, FaTruck, FaLaptop, FaDollarSign, FaBars, FaXmark } from "react-icons/fa6";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";

function NavBar() {
  const logo = "/assets/thumbnail_Epli_logo_invert.png";
  const navigate = useNavigate();

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const iconSize = windowWidth < 768 ? 20 : 28;
  const logoSize = windowWidth < 768 ? 30 : 55;
  const isMobile = windowWidth < 768;

  function navTo(path) {
    setMenuOpen(false);
    navigate(path);
  }

  return (
    <>
    <nav className="navbar">
      {/* SIGNED IN */}
      <SignedIn>
        <div className="navbar-left">
          <img
            src={logo}
            alt="Epli logo"
            className="navbar-logo"
            style={{ width: logoSize }}
            draggable="false"
            onClick={() => navTo("/")}
          />
        </div>

        {!isMobile && (
          <div className="navbar-center">
            <ul className="navbar-links">
              <li className="nav-link-button" onClick={() => navTo("/stada-sendinga")}>
                <FaTruck size={iconSize} />
                <span>Staða sendinga</span>
              </li>
              <li className="nav-link-button" onClick={() => navTo("/cto")}>
                <FaLaptop size={iconSize} />
                <span>Sérpöntunarverðlisti</span>
              </li>
              <li className="nav-link-button" onClick={() => navTo("/solutorg")}>
                <FaDollarSign size={iconSize} />
                <span>Sölutorg</span>
              </li>
            </ul>
          </div>
        )}

        <div className="navbar-right">
          <UserButton userProfileMode="modal" />
          {isMobile && (
            <button className="hamburger-button" onClick={() => setMenuOpen((o) => !o)}>
              {menuOpen ? <FaXmark size={22} /> : <FaBars size={22} />}
            </button>
          )}
        </div>
      </SignedIn>

      {/* SIGNED OUT */}
      <SignedOut>
        <div className="navbar-left">
          <img
            src={logo}
            alt="Epli logo"
            className="navbar-logo"
            style={{ width: logoSize }}
            draggable="false"
            onClick={() => navTo("/")}
          />
        </div>

        <div className="navbar-right">
          <SignInButton mode="modal">
            <FaUser size={iconSize} className="login-icon" />
          </SignInButton>
        </div>
      </SignedOut>
    </nav>

    {/* Mobile dropdown menu */}
    {menuOpen && (
      <>
        <div className="mobile-menu-backdrop" onClick={() => setMenuOpen(false)} />
        <div className="mobile-menu">
          <ul>
            <li className="mobile-menu-item" onClick={() => navTo("/stada-sendinga")}>
              <FaTruck size={20} />
              <span>Staða sendinga</span>
            </li>
            <li className="mobile-menu-item" onClick={() => navTo("/cto")}>
              <FaLaptop size={20} />
              <span>Sérpöntunarverðlisti</span>
            </li>
            <li className="mobile-menu-item" onClick={() => navTo("/solutorg")}>
              <FaDollarSign size={20} />
              <span>Sölutorg</span>
            </li>
          </ul>
        </div>
      </>
    )}
    </>
  );
}

export default NavBar;
