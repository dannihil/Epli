// components/PatchNotesModal.js
import React, { useEffect, useState } from "react";
import "../css/patchNotesModal.css";

const CURRENT_VERSION = "1.0.0"; // Update this on each new version deploy

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
    <div className="modal-overlay">
      <div className="modal">
        <h2>Breytingar í útgáfu {CURRENT_VERSION}</h2>
        <p style={{ fontWeight: "bold", marginTop: "10px" }}>
          Major uppfærslur:
        </p>
        <ol className="list-items">
          <li>Patch notes popup þegar ný útgáfa hefur verið gefin út.</li>
          <li>
            Hægt að raða eftir "ascending" eða "descending" í stöðu sendinga með
            því að smella á hausinn í dálkunum. 3-click sort toggle (ascending →
            descending → reset)
          </li>
        </ol>
        <p style={{ fontWeight: "bold", marginTop: "30px" }}>
          Minor uppfærslur:
        </p>
        <ol className="list-items">
          <li>Ethernet selection bætt við í PDF skjali fyrir Mac mini</li>
          <li>Gögn uppfærð í stöðu sendinga.</li>
        </ol>
        <button onClick={() => setShow(false)}>Close</button>
      </div>
    </div>
  );
};

export default PatchNotesModal;
