import React from "react";
import ExcelTable from "../components/ExcelTable";
import "../css/FGorder.css";
import { SignedIn } from "@clerk/clerk-react";

function FGorder() {
  return (
    <SignedIn>
      <div className="fgorder-container">
        <ExcelTable />
      </div>
    </SignedIn>
  );
}

export default FGorder;
