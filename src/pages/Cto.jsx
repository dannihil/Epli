import React from "react";
import "../css/Cto.css";
import { useNavigate } from "react-router-dom";
import { SignedIn } from "@clerk/clerk-react";
import PatchNotesModal from "../functions/patchNotesModal";

const categories = [
  {
    route: "/cto/macbook-air",
    image: "../../assets/mba_m3_mid.png",
    alt: "MacBook Air",
    name: "MacBook Air",
    chip: "Apple M5",
    price: "219.990 kr.",
  },
  {
    route: "/cto/macbook-pro",
    image: "../../assets/mbp_14_SB.png",
    alt: "MacBook Pro",
    name: "MacBook Pro",
    chip: "M5 · M5 Pro · M5 Max",
    price: "329.990 kr.",
  },
  {
    route: "/cto/imac",
    image: "../../assets/imac_silver.png",
    alt: "iMac",
    name: "iMac",
    chip: "Apple M4",
    price: "249.990 kr.",
  },
  {
    route: "/cto/mac-studio",
    image: "../../assets/mac_studio.png",
    alt: "Mac Studio",
    name: "Mac Studio",
    chip: "M4 Max · M3 Ultra",
    price: "399.990 kr.",
  },
  {
    route: "/cto/mac-mini",
    image: "../../assets/mac_mini.png",
    alt: "Mac mini",
    name: "Mac mini",
    chip: "M4 · M4 Pro",
    price: "159.990 kr.",
  },
];

function Cto() {
  const navigate = useNavigate();
  return (
    <SignedIn>
      <div className="cto-container">
        <PatchNotesModal />
        <h1 className="cto-heading">Veldu flokk</h1>
        <div className="category-selection-container">
          {categories.map((cat, i) => (
            <div
              key={cat.route}
              className="category-selection-box"
              style={{ animationDelay: `${i * 0.07}s` }}
              onClick={() => navigate(cat.route)}
            >
              <img
                src={cat.image}
                alt={cat.alt}
                className="category-image"
                draggable={false}
              />
              <div className="category-label">
                <p className="category-text">{cat.name}</p>
                <p className="category-chip">{cat.chip}</p>
                <p className="category-price">Verð frá {cat.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SignedIn>
  );
}

export default Cto;
