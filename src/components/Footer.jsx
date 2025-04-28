import React from "react";
import "../css/Footer.css";
import { FaEnvelope, FaPhone } from "react-icons/fa6";

function Footer() {
  return (
    <div className="footer">
      <div style={{ display: "flex", alignItems: "center" }}>
        <p>
          Ef þú rekst á einhverjar villur eða rangar upplýsingar vinsamlegast
          hafðu samband við:
        </p>
        <FaEnvelope style={{ marginLeft: 10, marginRight: 3 }} />
        <p>daniel@epli.is</p>
        <FaPhone style={{ marginLeft: 10, marginRight: 3 }} />
        <p>858 7174</p>
      </div>
      <span
        onClick={() => window.open("https://www.epli.is", "_blank")}
        className="footer-link"
        style={{ cursor: "pointer" }}
      >
        Smelltu hér til þess að fara á epli.is
      </span>
    </div>
  );
}

export default Footer;
