import React from "react";
import "../css/Cto.css";
import { useNavigate } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import PatchNotesModal from "../functions/patchNotesModal";

function Cto() {
  const navigate = useNavigate();
  return (
    <>
      <SignedIn>
        <div className="container">
          <PatchNotesModal />
          <h1>Veldu flokk</h1>
          <div>
            <div className="category-selection-container">
              <div
                className="category-selection-box"
                onClick={() => navigate("/cto/macbook-air")}
              >
                <img
                  src="../../assets/mba_m3_mid.png"
                  alt="MacBook Air"
                  className="category-image"
                  draggable={false}
                />
                <p className="category-text">MacBook Air</p>
              </div>
              <div
                className="category-selection-box"
                onClick={() => navigate("/cto/macbook-pro")}
              >
                <img
                  src="../../assets/mbp_14_SB.png"
                  alt="MacBook Pro"
                  className="category-image"
                  draggable={false}
                />
                <p className="category-text">MacBook Pro</p>
              </div>
              <div
                className="category-selection-box"
                onClick={() => navigate("/cto/imac")}
              >
                <img
                  src="../../assets/imac_silver.png"
                  alt="iMac"
                  className="category-image"
                  draggable={false}
                />
                <p className="category-text">iMac</p>
              </div>
              <div
                className="category-selection-box"
                onClick={() => navigate("/cto/mac-studio")}
              >
                <img
                  src="../../assets/mac_studio.png"
                  alt="Mac Studio"
                  className="category-image"
                  draggable={false}
                />
                <p className="category-text">Mac Studio</p>
              </div>
              <div
                className="category-selection-box"
                onClick={() => navigate("/cto/mac-mini")}
              >
                <img
                  src="../../assets/mac_mini.png"
                  alt="Mac mini"
                  className="category-image"
                  draggable={false}
                />
                <p className="category-text">Mac mini</p>
              </div>
              {/*<div
                className="category-selection-box"
                onClick={() => navigate("/cto/mac-pro")}
              >
                <img
                  src="../../assets/mac_pro.png"
                  alt="Mac Pro"
                  className="category-image"
                  draggable={false}
                />
                <p className="category-text">Mac Pro</p>
              </div>*/}
            </div>
          </div>
        </div>
      </SignedIn>
    </>
  );
}

export default Cto;
