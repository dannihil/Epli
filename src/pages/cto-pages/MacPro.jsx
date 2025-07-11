import { SignedIn } from "@clerk/clerk-react";
import React from "react";

function MacPro() {
  return (
    <SignedIn>
      <div style={{ marginTop: "100px" }}>
        <div>
          <h1>Síða í vinnslu!</h1>
          <p>Væntanleg á næstunni.</p>
          <button
            onClick={() => window.history.back()}
            className="content-selection"
            style={{ marginTop: "40px", width: "150px", height: "40px" }}
          >
            Til baka
          </button>
        </div>
      </div>
    </SignedIn>
  );
}

export default MacPro;
