import React from "react";
import "../css/LoggedInHomepage.css";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

function LoggedInHomepage() {
  const { user, isSignedIn } = useUser();
  const navigate = useNavigate();
  return (
    <div>
      <div className="LoggedInHomepage-container">
        <div className="title-box">
          <h1>Hæ {user.firstName}!</h1>
          <h3>
            Hér getur þú skoðað sérpöntunarverðlista eða skoðað stöðu sendinga á
            leið til Epli.
          </h3>
        </div>
      </div>
      <div className="button-container">
        <p className="under-title">Hvað vilt þú gera?</p>
        <div className="content-container">
          <button
            className="content-selection"
            onClick={() => navigate("/stada-sendinga")}
          >
            Skoða stöðu sendinga!
          </button>
          <button
            className="content-selection"
            onClick={() => navigate("/cto")}
          >
            Skoða sérpöntunarverðlista
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoggedInHomepage;
