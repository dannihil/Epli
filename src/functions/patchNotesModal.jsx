// components/PatchNotesModal.js
import React, { useEffect, useState } from "react";
import "../css/patchNotesModal.css";

const CURRENT_VERSION = "1.1.0"; // Update this on each new version deploy

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
          <li>
            Þegar smellt er á "Búa til PDF" á sérpöntunarsíðum poppar upp gluggi
            um að setja inn sölupöntunarnúmer. Ef númer er sett inn kemur það
            inn á PDF skjalið.
          </li>
        </ol>
        <p style={{ fontWeight: "bold", marginTop: "30px" }}>
          Minor uppfærslur:
        </p>
        <ol className="list-items">
          <li>Öll sérpöntunar PDF skjöl löguð til svo þau séu öll eins.</li>
        </ol>
        <button onClick={() => setShow(false)}>Close</button>
      </div>
    </div>
  );
};

export default PatchNotesModal;
