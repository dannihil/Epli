import React, { useEffect, useState } from "react";
import "../css/patchNotesModal.css";
import { FiCheck } from "react-icons/fi";

const CURRENT_VERSION = "2.2.0";

const majorUpdates = [
  "Öll sérpöntunarverð eru komin rétt inn miðað við nýja verðskrá á Mac flokknum, miklar hækkanir áttu sér stað og hafa sérpöntunarverðin fylgt því.",
  "Talsverðar útlitsbreytingar á vef.",
];

const PatchNotesModal = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const lastSeenVersion = localStorage.getItem("app_version");
    if (lastSeenVersion !== CURRENT_VERSION) {
      setShow(true);
      localStorage.setItem("app_version", CURRENT_VERSION);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="patchnotes-overlay" onClick={() => setShow(false)}>
      <div className="patchnotes-modal" onClick={(e) => e.stopPropagation()}>
        <div className="patchnotes-header">
          <span className="patchnotes-version">v{CURRENT_VERSION}</span>
          <h2 className="patchnotes-title">Hvað er nýtt?</h2>
          <p className="patchnotes-subtitle">
            Hér eru helstu breytingar í þessari útgáfu.
          </p>
        </div>

        <div className="patchnotes-items">
          {majorUpdates.map((text, i) => (
            <div key={i} className="patchnotes-item">
              <div className="patchnotes-check">
                <FiCheck size={14} strokeWidth={3} />
              </div>
              <p>{text}</p>
            </div>
          ))}
        </div>

        <button className="patchnotes-close" onClick={() => setShow(false)}>
          Loka
        </button>
      </div>
    </div>
  );
};

export default PatchNotesModal;
