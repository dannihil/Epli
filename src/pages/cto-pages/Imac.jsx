import React, { useState, useEffect } from "react";
import "../../css/CtoProduct.css";
import Divider from "@mui/material/Divider";
import { jsPDF } from "jspdf";
import { useUser } from "@clerk/clerk-react";

function Imac() {
  return (
    <div style={{ marginTop: "80px" }}>
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
  );
}

export default Imac;
