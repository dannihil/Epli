import React, { useState, useEffect } from "react";
import "../css/LoggedInHomepage.css";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import PatchNotesModal from "../functions/patchNotesModal";

function LoggedInHomepage() {
  const { user, isSignedIn } = useUser();
  const navigate = useNavigate();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Góðan daginn" : hour < 18 ? "Góðan daginn" : "Gott kvöld";

  return (
    <div>
      <PatchNotesModal />
      <div className="LoggedInHomepage-container">
        <div className="title-box">
          <h1 style={{ fontSize: "50px" }}>
            {greeting} {user.firstName}!
          </h1>
        </div>
      </div>
      <div className="button-container">
        <div
          className="content-selection"
          onClick={() => navigate("/stada-sendinga")}
        >
          <h2>Staða sendinga</h2>
          <p>Skoðaðu stöðu á Apple sendingum</p>
        </div>

        <div className="content-selection" onClick={() => navigate("/cto")}>
          <h2>Sérpöntunarverðlisti</h2>
          <p>Sjáðu verð og útfærslur fyrir sérpantanir</p>
        </div>
      </div>
    </div>
  );
}

export default LoggedInHomepage;
