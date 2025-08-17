import "../css/Footer.css";

export default function Footer({ openModal }) {
  return (
    <div className="footer">
      <p className="footer-modal" onClick={openModal}>
        Sérðu einhverja villu? Smelltu hér til að senda inn tilkynningu!
      </p>
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
