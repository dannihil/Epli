import { useEffect, useRef, useState } from "react";
import "../css/FeedbackFab.css";
import { FiMessageSquare, FiExternalLink, FiPlus } from "react-icons/fi";

export default function FeedbackFab({ onFeedbackClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [menuOpen]);

  return (
    <div className="feedback-fab-wrapper" ref={wrapperRef}>
      {menuOpen && (
        <div className="feedback-fab-menu">
          <button
            className="feedback-fab-menu-item"
            onClick={() => {
              setMenuOpen(false);
              onFeedbackClick();
            }}
          >
            <FiMessageSquare size={16} />
            Senda ábendingu
          </button>
          <button
            className="feedback-fab-menu-item"
            onClick={() => {
              setMenuOpen(false);
              window.open("https://www.epli.is", "_blank");
            }}
          >
            <FiExternalLink size={16} />
            Fara á vef epli.is
          </button>
        </div>
      )}
      <button
        className={`feedback-fab ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Aðgerðir"
        title="Aðgerðir"
      >
        {menuOpen ? <FiPlus size={24} /> : <FiMessageSquare size={24} />}
      </button>
    </div>
  );
}
