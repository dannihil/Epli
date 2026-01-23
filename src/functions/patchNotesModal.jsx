// components/PatchNotesModal.js
import React, { useEffect, useState } from "react";
import "../css/patchNotesModal.css";

const CURRENT_VERSION = "1.2.0"; // Update this on each new version deploy

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
    <div
      className="modal-overlay"
      onClick={() => setShow(false)} // Close on clicking overlay
    >
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <h2>Breytingar í útgáfu {CURRENT_VERSION}</h2>
        <p style={{ fontWeight: "bold", marginTop: "10px" }}>
          Major uppfærslur:
        </p>
        <ol className="list-items">
          <p>
            Sérpöntunarverð fyrir eftirfarandi tölvur eru orðin rétt miðað við
            verðlækkun 02.12.2025:
          </p>
          <li>Mac mini</li>
          <li>iMac</li>
          <li>Mac Studio</li>
          <p style={{ marginTop: 10, fontWeight: 600 }}>
            Verið að vinna í verðum fyrir MacBook Air og MacBook Pro
          </p>
        </ol>
        <p style={{ fontWeight: "bold", marginTop: "30px" }}>
          Minor uppfærslur:
        </p>
        <ol className="list-items">
          <li>Nú sést hvenær gögn voru uppfærð fyrir sendingarsíðu.</li>
        </ol>
        <button onClick={() => setShow(false)}>Close</button>
      </div>
    </div>
  );
};

export default PatchNotesModal;
