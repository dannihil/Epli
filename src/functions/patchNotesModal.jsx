import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import "../css/patchNotesModal.css";
import { FiCheck } from "react-icons/fi";

const CURRENT_VERSION = "2.3.0";

const majorUpdates = [
  "Útskýringar og reiknivél fyrir nýtt bónuskerfi komið í loftið.",
];

const PatchNotesModal = () => {
  const { user, isLoaded } = useUser();
  const [show, setShow] = useState(false);

  // Tracked on the Clerk user (not localStorage) so this is scoped to the
  // person and the version, not the browser — a cleared/incognito browser
  // or a shared in-store iPad shouldn't make this reappear on every sign in.
  const lastSeenVersion = user?.unsafeMetadata?.lastSeenPatchVersion;

  useEffect(() => {
    if (!isLoaded || !user) return;
    if (lastSeenVersion === CURRENT_VERSION) return;

    setShow(true);
    user
      .update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          lastSeenPatchVersion: CURRENT_VERSION,
        },
      })
      .catch((err) => {
        console.error("Ekki tókst að vista útgáfu patch notes.", err);
      });
  }, [isLoaded, user, lastSeenVersion]);

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
