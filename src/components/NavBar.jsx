import React, { useEffect, useState } from "react";
import "../css/NavBar.css";
import { useNavigate } from "react-router-dom";
import { FaUser, FaTruck, FaLaptop } from "react-icons/fa6";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/clerk-react";

function NavBar() {
  const logo = "/assets/thumbnail_Epli_logo_invert.png";
  const userIcon = "/assets/user_icon.png";
  const navigate = useNavigate();

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Responsive size and margin
  const logoStyle = {
    width: windowWidth < 768 ? 30 : 60,
    marginLeft: windowWidth < 768 ? 10 : 19,
  };

  return (
    <div className="navbar">
      <div className="epli-icon">
        <img
          src={logo}
          alt="Logo"
          style={logoStyle}
          draggable="false"
          onClick={() => navigate("/")}
        />
      </div>
      <SignedIn>
        <div>
          <ul className="navbar-links">
            <div
              className="nav-link-button"
              onClick={() => navigate("/stada-sendinga")}
            >
              <FaTruck size={windowWidth < 768 ? 20 : 30} />
              <li>Staða sendinga</li>
            </div>
            <div className="nav-link-button" onClick={() => navigate("/cto")}>
              <FaLaptop size={windowWidth < 768 ? 20 : 30} />
              <li>Sérpöntunarverðlisti</li>
            </div>
          </ul>
        </div>
        <div className="logo">
          <UserButton userProfileMode="modal" />
        </div>
      </SignedIn>
      <SignedOut>
        <div className="navbar-signinbutton">
          <SignInButton mode="modal">
            <FaUser
              size={windowWidth < 768 ? 20 : 30}
              className="login-icon"
              onClick
            />
          </SignInButton>
        </div>
      </SignedOut>
    </div>
  );
}

export default NavBar;
