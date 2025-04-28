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
          <h1>Epli portal</h1>
          <div className="homescreen-buttons">
            <SignInButton mode="modal">
              <button className="signin-signup-buttons">Sign In</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="signin-signup-buttons">Sign up</button>
            </SignUpButton>
          </div>
        </div>
      </SignedOut>
    </>
  );
}

export default Home;
