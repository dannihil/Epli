import React from "react";
import LoggedInHomepage from "./LoggedInHomepage";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
} from "@clerk/clerk-react";
import { FiPackage, FiMonitor, FiShoppingBag } from "react-icons/fi";
import "../css/Home.css";

const features = [
  {
    icon: <FiPackage size={30} />,
    title: "Staða sendinga",
    desc: "Fylgstu með stöðu á Apple sendingum — magn, sendingar og áætlaðar afhendingardagsetningar.",
  },
  {
    icon: <FiMonitor size={30} />,
    title: "CTO verðlistar",
    desc: "Settu saman Mac eftir þörfum viðskiptavinar og sjáðu verð samstundis.",
  },
  {
    icon: <FiShoppingBag size={30} />,
    title: "Sölutorg",
    desc: "Sjáðu upplýsingar um vörur á Sölutorgi",
  },
];

function Home() {
  return (
    <>
      <SignedIn>
        <div className="homescreen-container">
          <LoggedInHomepage />
        </div>
      </SignedIn>
      <SignedOut>
        <div className="home-logged-out">
          <div className="home-hero">
            <img
              src="/assets/epli_portal_logo.png"
              alt="Epli Portal"
              className="home-hero-logo"
              draggable={false}
            />
            <p className="home-hero-tagline">Innri gátt Epli</p>
            <div className="home-hero-buttons">
              <SignInButton mode="modal">
                <button className="home-signin-button">Innskráning</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="home-signup-button">Nýskráning</button>
              </SignUpButton>
            </div>
          </div>

          <div className="home-features">
            {features.map((f) => (
              <div key={f.title} className="home-feature-card">
                <div className="home-feature-icon">{f.icon}</div>
                <h3 className="home-feature-title">{f.title}</h3>
                <p className="home-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </SignedOut>
    </>
  );
}

export default Home;
