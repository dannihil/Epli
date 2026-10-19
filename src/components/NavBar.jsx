import React, { useEffect, useState } from "react";
import "../css/NavBar.css";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaUser,
  FaTruck,
  FaLaptop,
  FaDollarSign,
  FaTags,
  FaCoins,
  FaBars,
  FaXmark,
} from "react-icons/fa6";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/clerk-react";

function NavBar() {
  const logo = "/assets/epli_portal_logo_light.png";
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoaded: userLoaded } = useUser();
  const role = user?.publicMetadata?.role;
  const canEditPricing = userLoaded && (role === "admin" || role === "editor");

  const [windowWidth, setWindowWidth] = useState(
    document.documentElement.clientWidth
  );
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = document.documentElement.clientWidth;
      setWindowWidth(width);
      if (width >= 900) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const iconSize = windowWidth < 900 ? 20 : 28;
  const logoSize = windowWidth < 900 ? 30 : 55;
  const isMobile = windowWidth < 900;

  function navTo(path) {
    setMenuOpen(false);
    navigate(path);
  }

  return (
    <>
      <nav className="navbar">
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

        {/* SIGNED IN */}
        <SignedIn>
          {!isMobile && (
            <div className="navbar-center">
              <ul className="navbar-links">
                <li
                  className={`nav-link-button ${location.pathname.startsWith("/stada-sendinga") ? "active" : ""}`}
                  onClick={() => navTo("/stada-sendinga")}
                >
                  <FaTruck size={iconSize} />
                  <span>Staða sendinga</span>
                </li>
                <li
                  className={`nav-link-button ${location.pathname.startsWith("/cto") ? "active" : ""}`}
                  onClick={() => navTo("/cto")}
                >
                  <FaLaptop size={iconSize} />
                  <span>Sérpöntunarverðlisti</span>
                </li>
                <li
                  className={`nav-link-button ${location.pathname.startsWith("/solutorg") ? "active" : ""}`}
                  onClick={() => navTo("/solutorg")}
                >
                  <FaDollarSign size={iconSize} />
                  <span>Sölutorg</span>
                </li>
                <li
                  className={`nav-link-button ${location.pathname.startsWith("/soluthoknun") ? "active" : ""}`}
                  onClick={() => navTo("/soluthoknun")}
                >
                  <FaCoins size={iconSize} />
                  <span>Söluþóknun</span>
                </li>
                {canEditPricing && (
                  <li
                    className={`nav-link-button ${location.pathname.startsWith("/verdlistar") ? "active" : ""}`}
                    onClick={() => navTo("/verdlistar")}
                  >
                    <FaTags size={iconSize} />
                    <span>Verðlistar</span>
                  </li>
                )}
              </ul>
            </div>
          )}

          <div className="navbar-right">
            <UserButton
              userProfileMode="modal"
              appearance={{
                elements: {
                  userButtonPopoverFooter: { display: "none" },
                  modalBackdrop: {
                    background: "rgba(20, 20, 20, 0.55)",
                    backdropFilter: "blur(4px)",
                    WebkitBackdropFilter: "blur(4px)",
                  },
                },
              }}
            />
            {isMobile && (
              <button
                className="hamburger-button"
                onClick={() => setMenuOpen((o) => !o)}
              >
                {menuOpen ? <FaXmark size={22} /> : <FaBars size={22} />}
              </button>
            )}
          </div>
        </SignedIn>

        {/* SIGNED OUT */}
        <SignedOut>
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
          <div
            className="mobile-menu-backdrop"
            onClick={() => setMenuOpen(false)}
          />
          <div className="mobile-menu">
            <ul>
              <li
                className={`mobile-menu-item ${location.pathname.startsWith("/stada-sendinga") ? "mobile-menu-item-active" : ""}`}
                onClick={() => navTo("/stada-sendinga")}
              >
                <FaTruck size={20} />
                <span>Staða sendinga</span>
              </li>
              <li
                className={`mobile-menu-item ${location.pathname.startsWith("/cto") ? "mobile-menu-item-active" : ""}`}
                onClick={() => navTo("/cto")}
              >
                <FaLaptop size={20} />
                <span>Sérpöntunarverðlisti</span>
              </li>
              <li
                className={`mobile-menu-item ${location.pathname.startsWith("/solutorg") ? "mobile-menu-item-active" : ""}`}
                onClick={() => navTo("/solutorg")}
              >
                <FaDollarSign size={20} />
                <span>Sölutorg</span>
              </li>
              <li
                className={`mobile-menu-item ${location.pathname.startsWith("/soluthoknun") ? "mobile-menu-item-active" : ""}`}
                onClick={() => navTo("/soluthoknun")}
              >
                <FaCoins size={20} />
                <span>Söluþóknun</span>
              </li>
              {canEditPricing && (
                <li
                  className={`mobile-menu-item ${location.pathname.startsWith("/verdlistar") ? "mobile-menu-item-active" : ""}`}
                  onClick={() => navTo("/verdlistar")}
                >
                  <FaTags size={20} />
                  <span>Verðlistar</span>
                </li>
              )}
            </ul>
          </div>
        </>
      )}
    </>
  );
}

export default NavBar;
