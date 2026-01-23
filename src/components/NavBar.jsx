import React, { useEffect, useState } from "react";
import "../css/NavBar.css";
import { useNavigate } from "react-router-dom";
import { FaUser, FaTruck, FaLaptop } from "react-icons/fa6";

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

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const iconSize = windowWidth < 768 ? 20 : 28;
  const logoSize = windowWidth < 768 ? 30 : 55;

  return (
    <nav className="navbar">
      {/* Left */}
      <div className="navbar-left">
        <img
          src={logo}
          alt="Epli logo"
          className="navbar-logo"
          style={{ width: logoSize }}
          draggable="false"
          onClick={() => navigate("/")}
        />
      </div>

      {/* Center */}
      <div className="navbar-center">
        <ul className="navbar-links">
          <li
            className="nav-link-button"
            onClick={() => navigate("/stada-sendinga")}
          >
            <FaTruck size={iconSize} />
            <span>Staða sendinga</span>
          </li>

          <li className="nav-link-button" onClick={() => navigate("/cto")}>
            <FaLaptop size={iconSize} />
            <span>Sérpöntunarverðlisti</span>
          </li>
        </ul>
      </div>

      {/* Right */}
      <div className="navbar-right">
        <SignedIn>
          <UserButton userProfileMode="modal" />
        </SignedIn>

        <SignedOut>
          <SignInButton mode="modal">
            <FaUser size={iconSize} className="login-icon" />
          </SignInButton>
        </SignedOut>
      </div>
    </nav>
  );
}

export default NavBar;
