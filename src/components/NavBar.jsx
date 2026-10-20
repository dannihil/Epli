import React, { useEffect, useRef, useState } from "react";
import "../css/NavBar.css";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaUser,
  FaTruck,
  FaChevronDown,
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
  const isAdmin = userLoaded && role === "admin";

  // "/stada-sendinga-upprunalegt" byrjar líka á "/stada-sendinga"
  const onShipments =
    location.pathname === "/stada-sendinga" ||
    location.pathname.startsWith("/stada-sendinga/");
  const onOriginalShipments = location.pathname.startsWith(
    "/stada-sendinga-upprunalegt",
  );

  const [windowWidth, setWindowWidth] = useState(
    document.documentElement.clientWidth
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [shipmentsOpen, setShipmentsOpen] = useState(false);
  const shipmentsRef = useRef(null);

  // Með Verðlistar (editor/admin) eru 5 hlekkir, sem þurfa meira pláss áður
  // en skipt er yfir í hamborgaravalmynd
  const crowded = canEditPricing;
  const mobileBreakpoint = crowded ? 1200 : 900;

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(document.documentElement.clientWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (windowWidth >= mobileBreakpoint) setMenuOpen(false);
  }, [windowWidth, mobileBreakpoint]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setShipmentsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  // Loka fellivalmynd þegar smellt er utan hennar
  useEffect(() => {
    if (!shipmentsOpen) return;
    const handleClick = (e) => {
      if (!shipmentsRef.current?.contains(e.target)) setShipmentsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [shipmentsOpen]);

  const isMobile = windowWidth < mobileBreakpoint;
  const iconSize = isMobile ? 20 : crowded ? 22 : 28;
  const logoSize = windowWidth < 900 ? 30 : 55;

  function navTo(path) {
    setMenuOpen(false);
    setShipmentsOpen(false);
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
              <ul
                className={`navbar-links ${crowded ? "navbar-links-crowded" : ""}`}
              >
                {isAdmin ? (
                  <li className="nav-dropdown" ref={shipmentsRef}>
                    <button
                      type="button"
                      className={`nav-link-button ${onShipments || onOriginalShipments ? "active" : ""}`}
                      aria-haspopup="menu"
                      aria-expanded={shipmentsOpen}
                      onClick={() => setShipmentsOpen((o) => !o)}
                    >
                      <FaTruck size={iconSize} />
                      <span>Staða sendinga</span>
                      <FaChevronDown
                        size={11}
                        className={`nav-dropdown-chevron ${shipmentsOpen ? "is-open" : ""}`}
                      />
                    </button>
                    {shipmentsOpen && (
                      <ul className="nav-dropdown-menu" role="menu">
                        <li
                          role="menuitem"
                          className={onShipments ? "active" : ""}
                          onClick={() => navTo("/stada-sendinga")}
                        >
                          Verslanir
                        </li>
                        <li
                          role="menuitem"
                          className={onOriginalShipments ? "active" : ""}
                          onClick={() => navTo("/stada-sendinga-upprunalegt")}
                        >
                          Admin
                        </li>
                      </ul>
                    )}
                  </li>
                ) : (
                  <li
                    className={`nav-link-button ${onShipments ? "active" : ""}`}
                    onClick={() => navTo("/stada-sendinga")}
                  >
                    <FaTruck size={iconSize} />
                    <span>Staða sendinga</span>
                  </li>
                )}
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
              {isAdmin ? (
                <>
                  <li className="mobile-menu-item mobile-menu-group">
                    <FaTruck size={20} />
                    <span>Staða sendinga</span>
                  </li>
                  <li
                    className={`mobile-menu-item mobile-menu-subitem ${onShipments ? "mobile-menu-item-active" : ""}`}
                    onClick={() => navTo("/stada-sendinga")}
                  >
                    <span>Verslanir</span>
                  </li>
                  <li
                    className={`mobile-menu-item mobile-menu-subitem ${onOriginalShipments ? "mobile-menu-item-active" : ""}`}
                    onClick={() => navTo("/stada-sendinga-upprunalegt")}
                  >
                    <span>Admin</span>
                  </li>
                </>
              ) : (
                <li
                  className={`mobile-menu-item ${onShipments ? "mobile-menu-item-active" : ""}`}
                  onClick={() => navTo("/stada-sendinga")}
                >
                  <FaTruck size={20} />
                  <span>Staða sendinga</span>
                </li>
              )}
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
