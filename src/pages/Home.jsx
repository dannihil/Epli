import React from "react";
import LoggedInHomepage from "./LoggedInHomepage";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/clerk-react";
import "../css/Home.css";

function Home() {
  return (
    <>
      <SignedIn>
        <div className="homescreen-container">
          <LoggedInHomepage />
        </div>
      </SignedIn>
      <SignedOut>
        <div className="homescreen-container">
          <img
            src="../assets/epli_portal_logo.png"
            alt="Epli Portal"
            style={{ width: 250 }}
            draggable={false}
          />
          <div className="homescreen-buttons">
            <SignInButton mode="modal">
              <button className="signin-signup-buttons">Innskráning</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="signin-signup-buttons">Nýskráning</button>
            </SignUpButton>
          </div>
        </div>
      </SignedOut>
    </>
  );
}

export default Home;
