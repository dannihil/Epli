import React, { useEffect, useState } from "react";
import "../css/Cto.css";
import { useNavigate } from "react-router-dom";
import { SignedIn } from "@clerk/clerk-react";
import PatchNotesModal from "../functions/patchNotesModal";
import { supabase } from "../lib/supabase";

const categories = [
  {
    route: "/cto/macbook-air",
    productId: "aaaaaaaa-0003-0000-0000-000000000000",
    image: "../../assets/mba_m3_mid.png",
    alt: "MacBook Air",
    name: "MacBook Air",
  },
  {
    route: "/cto/macbook-pro",
    productId: "aaaaaaaa-0002-0000-0000-000000000000",
    image: "../../assets/mbp_14_SB.png",
    alt: "MacBook Pro",
    name: "MacBook Pro",
  },
  {
    route: "/cto/imac",
    productId: "aaaaaaaa-0004-0000-0000-000000000000",
    image: "../../assets/imac_silver.png",
    alt: "iMac",
    name: "iMac",
  },
  {
    route: "/cto/mac-studio",
    productId: "aaaaaaaa-0001-0000-0000-000000000000",
    image: "../../assets/mac_studio.png",
    alt: "Mac Studio",
    name: "Mac Studio",
  },
  {
    route: "/cto/mac-mini",
    productId: "aaaaaaaa-0005-0000-0000-000000000000",
    image: "../../assets/mac_mini.png",
    alt: "Mac mini",
    name: "Mac mini",
  },
];

function formatPriceISK(price) {
  return price.toLocaleString("is-IS").replace(/,/g, ".") + " kr.";
}

// e.g. "m5pro_18_20" -> "M5 Pro", "m4max_14_32" -> "M4 Max", "m4_10_10" -> "M4"
function chipFamilyLabel(chip) {
  const match = chip.match(/^m(\d)(max|pro|ultra)?/i);
  if (!match) return chip;
  const [, generation, variant] = match;
  return variant
    ? `M${generation} ${variant[0].toUpperCase()}${variant.slice(1)}`
    : `M${generation}`;
}

function Cto() {
  const navigate = useNavigate();
  const [productInfo, setProductInfo] = useState({});

  useEffect(() => {
    const fetchChipMinPrices = async () => {
      const { data, error } = await supabase.rpc(
        "configuration_chip_min_prices",
      );

      if (error || !data) {
        console.error(error);
        return;
      }

      const info = {};
      for (const { product_id, chip, min_price } of data) {
        if (!info[product_id]) {
          info[product_id] = { minPrice: min_price, chipPrices: new Map() };
        }
        const product = info[product_id];
        product.minPrice = Math.min(product.minPrice, min_price);

        const label = chipFamilyLabel(chip);
        const existing = product.chipPrices.get(label);
        product.chipPrices.set(
          label,
          existing === undefined ? min_price : Math.min(existing, min_price),
        );
      }
      setProductInfo(info);
    };
    fetchChipMinPrices();
  }, []);

  return (
    <SignedIn>
      <div className="cto-container">
        <PatchNotesModal />
        <h1 className="cto-heading">Veldu flokk</h1>
        <div className="category-selection-container">
          {categories.map((cat, i) => {
            const product = productInfo[cat.productId];
            const chipLabel = product
              ? [...product.chipPrices.entries()]
                  .sort((a, b) => a[1] - b[1])
                  .map(([label]) => label)
                  .join(" · ")
              : "";
            return (
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
                  <p className="category-chip">{chipLabel} chip</p>
                  <p className="category-price">
                    {product
                      ? `Verð frá ${formatPriceISK(product.minPrice)}`
                      : " "}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SignedIn>
  );
}

export default Cto;
