import React, { useState, useEffect } from "react";
import "../../css/CtoProduct.css";
import Divider from "@mui/material/Divider";
import { jsPDF } from "jspdf";
import { SignedIn, useUser } from "@clerk/clerk-react";
import PatchNotesModal from "../../functions/patchNotesModal";

function MacbookProTest() {
  const [date, setDate] = useState("");

  useEffect(() => {
    // Set date initially
    setDate(new Date().toLocaleDateString("en-GB"));

    // Optionally, update the date every second if you want real-time updates
    const interval = setInterval(() => {
      setDate(new Date().toLocaleDateString("en-GB"));
    }, 1000);

    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);
  const user = useUser();
  const basePrices = { 14: 339990, 16: 529990 };

  const priceModifiers = {
    processor: {
      "M4 chip with 10-core CPU, 10-core GPU": 0,
      "M4 Pro chip with 12-core CPU, 16-core GPU": 40000,
      "M4 Pro chip with 14-core CPU, 20-core GPU": 80000,
      "M4 Max chip with 14-core CPU, 32-core GPU": 300000,
      "M4 Max chip with 16-core CPU, 40-core GPU": 320000,
    },
    storage: {
      "512GB": 0,
      "1TB": 40000,
      "2TB": 120000,
      "4TB": 240000,
      "8TB": 480000,
    },
    memory: {
      "16GB": 0,
      "24GB": 40000,
      "32GB": 80000,
      "36GB": 0,
      "48GB": 40000,
      "64GB": 80000,
      "128GB": 240000,
    },
    color: {
      "Space Black": 0,
      Silver: 0,
    },
    display: {
      "Standard display": 0,
      "Nano-texture display": 30000,
    },
    accessories: {
      "70W Power Adapter": 0,
      "96W Power Adapter": 3000,
      "140W Power Adapter": 0,
    },
  };

  const [selectedOptions, setSelectedOptions] = useState({
    screenSize: "14", // Default selection
    processor: "M4 chip with 10-core CPU, 10-core GPU", // Default selection
    storage: "512GB", // Default selection
    memory: "16GB", // Default selection
    color: "Space Black", // Default selection
    display: "Standard display", // Default selection
    accessories: "70W Power Adapter", // Default selection
  });

  const totalPrice =
    basePrices[selectedOptions.screenSize] +
    Object.keys(priceModifiers).reduce(
      (sum, key) => sum + priceModifiers[key][selectedOptions[key]],
      0
    ) +
    (selectedOptions.processor ===
      "M4 Pro chip with 12-core CPU, 16-core GPU" &&
    selectedOptions.memory === "48GB"
      ? 80000
      : 0) +
    (selectedOptions.processor ===
      "M4 Pro chip with 14-core CPU, 20-core GPU" &&
    selectedOptions.memory === "48GB"
      ? 80000
      : 0) -
    ((selectedOptions.processor ===
      "M4 Max chip with 14-core CPU, 32-core GPU" ||
      selectedOptions.processor ===
        "M4 Max chip with 16-core CPU, 40-core GPU" ||
      selectedOptions.processor ===
        "M4 Pro chip with 14-core CPU, 20-core GPU") &&
    selectedOptions.accessories === "96W Power Adapter"
      ? priceModifiers.accessories["96W Power Adapter"]
      : 0) -
    (selectedOptions.screenSize === "16" &&
    selectedOptions.processor === "M4 Pro chip with 14-core CPU, 20-core GPU"
      ? priceModifiers.processor["M4 Pro chip with 14-core CPU, 20-core GPU"]
      : 0) -
    (selectedOptions.screenSize === "16" &&
    selectedOptions.processor === "M4 Pro chip with 14-core CPU, 20-core GPU"
      ? priceModifiers.memory["24GB"]
      : 0) -
    // ✅ NEW FIX: Adjust pricing when "M4 Max chip with 14-core CPU, 32-core GPU" is selected on 16"
    (selectedOptions.screenSize === "16" &&
    selectedOptions.processor === "M4 Max chip with 14-core CPU, 32-core GPU"
      ? 130000
      : 0) -
    // ✅ NEW FIX: Adjust pricing when "M4 Max chip with 14-core CPU, 32-core GPU" is selected on 16"
    (selectedOptions.screenSize === "16" &&
    selectedOptions.processor === "M4 Max chip with 16-core CPU, 40-core GPU"
      ? 80000
      : 0);

  const formatPriceISK = (price) => {
    const formattedPrice = price.toLocaleString("is-IS");
    return formattedPrice.replace(/,/g, ".") + "kr";
  };

  const handleSelection = (category, option) => {
    setSelectedOptions((prev) => {
      let newSelection = { ...prev, [category]: option };

      if (category === "screenSize" && option === "14") {
        newSelection.processor = "M4 chip with 10-core CPU, 10-core GPU";
        newSelection.storage = "512GB";
        newSelection.memory = "16GB";
        newSelection.accessories = "70W Power Adapter";
      }
      if (category === "screenSize" && option === "16") {
        newSelection.processor = "M4 Pro chip with 14-core CPU, 20-core GPU";
        newSelection.storage = "512GB";
        newSelection.memory = "24GB";
        newSelection.accessories = "140W Power Adapter";
      }
      if (
        category === "processor" &&
        option === "M4 chip with 10-core CPU, 10-core GPU"
      ) {
        newSelection.memory = "16GB";
      }
      if (
        (category === "processor" &&
          option === "M4 Pro chip with 12-core CPU, 16-core GPU") ||
        (category === "processor" &&
          option === "M4 Pro chip with 14-core CPU, 20-core GPU")
      ) {
        newSelection.memory = "24GB";
      }
      if (
        (newSelection.screenSize === "14" &&
          category === "processor" &&
          option === "M4 Pro chip with 14-core CPU, 20-core GPU") ||
        (category === "processor" &&
          option === "M4 Max chip with 14-core CPU, 32-core GPU") ||
        (category === "processor" &&
          option === "M4 Max chip with 16-core CPU, 40-core GPU")
      ) {
        newSelection.accessories = "96W Power Adapter";
      }
      if (
        newSelection.screenSize === "16" &&
        category === "processor" &&
        option === "M4 Pro chip with 14-core CPU, 20-core GPU"
      ) {
        newSelection.accessories = "140W Power Adapter";
      }
      if (
        category === "processor" &&
        option === "M4 Max chip with 14-core CPU, 32-core GPU"
      ) {
        newSelection.storage = "1TB";
        newSelection.memory = "36GB";
      }
      if (
        category === "processor" &&
        option === "M4 Max chip with 16-core CPU, 40-core GPU"
      ) {
        newSelection.memory = "48GB";
      }

      return newSelection;
    });
  };

  return (
    <SignedIn>
      <div className="main-container">
        <PatchNotesModal />
        <div className="page-container">
          <div className="image-spec-container">
            <div className="product-image-container">
              {selectedOptions.screenSize === "16" ? (
                selectedOptions.color === "Space Black" ? (
                  <img
                    src="../assets/mbp_16_SB.png"
                    alt="MacBook Pro"
                    className="product-image"
                    draggable={false}
                  />
                ) : selectedOptions.color === "Silver" ? (
                  <img
                    src="../assets/mbp_16_SL.png"
                    alt="MacBook Pro"
                    className="product-image"
                    draggable={false}
                  />
                ) : (
                  <img
                    src="../assets/mbp_16_SB.png"
                    alt="MacBook Pro"
                    className="product-image"
                    draggable={false}
                  />
                )
              ) : selectedOptions.screenSize === "14" ? (
                selectedOptions.color === "Space Black" ? (
                  <img
                    src="../assets/mbp_14_SB.png"
                    alt="MacBook Pro"
                    className="product-image"
                    draggable={false}
                  />
                ) : selectedOptions.color === "Silver" ? (
                  <img
                    src="../assets/mbp_14_SL.png"
                    alt="MacBook Pro"
                    className="product-image"
                    draggable={false}
                  />
                ) : (
                  <img
                    src="../assets/mbp_14_SB.png"
                    alt="MacBook Pro"
                    className="product-image"
                    draggable={false}
                  />
                )
              ) : (
                <img
                  src="../assets/mbp_14_SB.png"
                  alt="MacBook Pro"
                  className="product-image"
                  draggable={false}
                />
              )}
            </div>
            <p className="spec-list-title">Tæknilegar upplýsingar</p>
            <div className="spec-list">
              <ul>
                <li className="spec-item">
                  {selectedOptions.screenSize === "14" ? '14"' : '16"'} Retina
                  skjár
                </li>
                <li className="spec-list-item">{selectedOptions.processor}</li>
                <li className="spec-list-item">
                  {selectedOptions.storage} SSD geymsla
                </li>
                <li className="spec-list-item">
                  {selectedOptions.memory} Unified vinnsluminni
                </li>
                <li className="spec-list-item">{selectedOptions.display}</li>
                <li className="spec-list-item">
                  {selectedOptions.accessories}
                </li>
              </ul>
            </div>
          </div>
          <div className="cto-spec-selection">
            <h1 style={{ fontWeight: 900, fontSize: 40, marginBottom: 10 }}>
              Macbook Pro {selectedOptions.screenSize}"
            </h1>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex" }}>
                <p
                  style={{ fontSize: "20px", fontWeight: 700, marginRight: 10 }}
                >
                  <b>Verð:</b>
                </p>
                <p style={{ fontSize: "20px" }}>{formatPriceISK(totalPrice)}</p>
              </div>
              <button
                onClick={() =>
                  generatePdf(
                    `Sérpöntun - MacBook Pro ${selectedOptions.screenSize}`
                  )
                }
                className="pdf-button"
              >
                Búa til PDF
              </button>
            </div>{" "}
            {/* Updated total price display */}
            <Divider style={{ margin: "10px 0px 10px 0px" }} />
            <p className="spec-title">Skjástærð</p>
            <div className="spec-selection-buttons">
              <button
                className={`filter-button-selection ${
                  selectedOptions.screenSize === "14" ? "active" : ""
                }`}
                onClick={() => handleSelection("screenSize", "14")}
              >
                14"
              </button>
              <button
                className={`filter-button-selection ${
                  selectedOptions.screenSize === "16" ? "active" : ""
                }`}
                onClick={() => handleSelection("screenSize", "16")}
              >
                16"
              </button>
            </div>
            <p className="spec-title">Örgjörvi</p>
            <div className="spec-selection-buttons">
              <div
                className={`filter-button-processor ${
                  selectedOptions.processor ===
                  "M4 chip with 10-core CPU, 10-core GPU"
                    ? "active"
                    : ""
                } ${selectedOptions.screenSize === "16" ? "disabled" : ""}`}
                onClick={() => {
                  if (selectedOptions.screenSize !== "16") {
                    handleSelection(
                      "processor",
                      "M4 chip with 10-core CPU, 10-core GPU"
                    );
                  }
                }}
              >
                <img
                  src="../assets/m4.svg"
                  alt="M4 logo"
                  className="button-processor-logo"
                />
                <p className="filter-button-processor-text">
                  10-core CPU 10-core GPU
                </p>
              </div>
              <div
                className={`filter-button-processor ${
                  selectedOptions.processor ===
                  "M4 Pro chip with 12-core CPU, 16-core GPU"
                    ? "active"
                    : ""
                } ${selectedOptions.screenSize === "16" ? "disabled" : ""}`}
                onClick={() => {
                  if (selectedOptions.screenSize !== "16") {
                    handleSelection(
                      "processor",
                      "M4 Pro chip with 12-core CPU, 16-core GPU"
                    );
                  }
                }}
              >
                <img
                  src="../assets/m4pro.svg"
                  alt="M4 Pro logo"
                  className="button-processor-logo"
                />
                <p className="filter-button-processor-text">
                  12-core CPU 16-core GPU
                </p>
              </div>
              <div
                className={`filter-button-processor ${
                  selectedOptions.processor ===
                  "M4 Pro chip with 14-core CPU, 20-core GPU"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleSelection(
                    "processor",
                    "M4 Pro chip with 14-core CPU, 20-core GPU"
                  )
                }
              >
                <img
                  src="../assets/m4pro.svg"
                  alt="M4 Pro logo"
                  className="button-processor-logo"
                />
                <p className="filter-button-processor-text">
                  14-core CPU 20-core GPU
                </p>
              </div>
              <div
                className={`filter-button-processor ${
                  selectedOptions.processor ===
                  "M4 Max chip with 14-core CPU, 32-core GPU"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleSelection(
                    "processor",
                    "M4 Max chip with 14-core CPU, 32-core GPU"
                  )
                }
              >
                <img
                  src="../assets/m4max.svg"
                  alt="M4 Max logo"
                  className="button-processor-logo"
                />
                <p className="filter-button-processor-text">
                  14-core CPU 32-core GPU
                </p>
              </div>
              <div
                className={`filter-button-processor ${
                  selectedOptions.processor ===
                  "M4 Max chip with 16-core CPU, 40-core GPU"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleSelection(
                    "processor",
                    "M4 Max chip with 16-core CPU, 40-core GPU"
                  )
                }
              >
                <img
                  src="../assets/m4max.svg"
                  alt="M4 Max logo"
                  className="button-processor-logo"
                />
                <p className="filter-button-processor-text">
                  16-core CPU 40-core GPU
                </p>
              </div>
            </div>
            <p className="spec-title">Geymsla</p>
            <div className="spec-selection-buttons">
              <button
                className={`filter-button-selection ${
                  selectedOptions.storage === "512GB" ? "active" : ""
                }`}
                onClick={() => handleSelection("storage", "512GB")}
                disabled={
                  selectedOptions.processor ===
                    "M4 Max chip with 14-core CPU, 32-core GPU" ||
                  selectedOptions.processor ===
                    "M4 Max chip with 16-core CPU, 40-core GPU"
                }
              >
                512GB
              </button>
              <button
                className={`filter-button-selection ${
                  selectedOptions.storage === "1TB" ? "active" : ""
                }`}
                onClick={() => handleSelection("storage", "1TB")}
              >
                1TB
              </button>
              <button
                className={`filter-button-selection ${
                  selectedOptions.storage === "2TB" ? "active" : ""
                }`}
                onClick={() => handleSelection("storage", "2TB")}
              >
                2TB
              </button>
              <button
                className={`filter-button-selection ${
                  selectedOptions.storage === "4TB" ? "active" : ""
                }`}
                onClick={() => handleSelection("storage", "4TB")}
                disabled={
                  selectedOptions.processor ===
                  "M4 chip with 10-core CPU, 10-core GPU"
                }
              >
                4TB
              </button>
              <button
                className={`filter-button-selection ${
                  selectedOptions.storage === "8TB" ? "active" : ""
                }`}
                onClick={() => handleSelection("storage", "8TB")}
                disabled={
                  selectedOptions.processor ===
                    "M4 chip with 10-core CPU, 10-core GPU" ||
                  selectedOptions.processor ===
                    "M4 Pro chip with 12-core CPU, 16-core GPU" ||
                  selectedOptions.processor ===
                    "M4 Pro chip with 14-core CPU, 20-core GPU"
                }
              >
                8TB
              </button>
            </div>
            <p className="spec-title">Vinnsluminni</p>
            <div className="spec-selection-buttons">
              <button
                className={`filter-button-selection ${
                  selectedOptions.memory === "16GB" ? "active" : ""
                }`}
                onClick={() => handleSelection("memory", "16GB")}
                disabled={
                  selectedOptions.screenSize === "16" ||
                  selectedOptions.processor ===
                    "M4 Pro chip with 12-core CPU, 16-core GPU" ||
                  selectedOptions.processor ===
                    "M4 Pro chip with 14-core CPU, 20-core GPU" ||
                  selectedOptions.processor ===
                    "M4 Max chip with 14-core CPU, 32-core GPU" ||
                  selectedOptions.processor ===
                    "M4 Max chip with 16-core CPU, 40-core GPU"
                }
              >
                16GB
              </button>
              <button
                className={`filter-button-selection ${
                  selectedOptions.memory === "24GB" ? "active" : ""
                }`}
                onClick={() => handleSelection("memory", "24GB")}
                disabled={
                  selectedOptions.processor ===
                    "M4 Max chip with 14-core CPU, 32-core GPU" ||
                  selectedOptions.processor ===
                    "M4 Max chip with 16-core CPU, 40-core GPU"
                }
              >
                24GB
              </button>
              <button
                className={`filter-button-selection ${
                  selectedOptions.memory === "32GB" ? "active" : ""
                }`}
                onClick={() => handleSelection("memory", "32GB")}
                disabled={
                  selectedOptions.processor ===
                    "M4 Pro chip with 12-core CPU, 16-core GPU" ||
                  selectedOptions.processor ===
                    "M4 Pro chip with 14-core CPU, 20-core GPU" ||
                  selectedOptions.processor ===
                    "M4 Max chip with 14-core CPU, 32-core GPU" ||
                  selectedOptions.processor ===
                    "M4 Max chip with 16-core CPU, 40-core GPU"
                }
              >
                32GB
              </button>
              <button
                className={`filter-button-selection ${
                  selectedOptions.memory === "36GB" ? "active" : ""
                }`}
                onClick={() => handleSelection("memory", "36GB")}
                disabled={
                  selectedOptions.processor ===
                    "M4 chip with 10-core CPU, 10-core GPU" ||
                  selectedOptions.processor ===
                    "M4 Pro chip with 12-core CPU, 16-core GPU" ||
                  selectedOptions.processor ===
                    "M4 Pro chip with 14-core CPU, 20-core GPU" ||
                  selectedOptions.processor ===
                    "M4 Max chip with 16-core CPU, 40-core GPU"
                }
              >
                36GB
              </button>
              <button
                className={`filter-button-selection ${
                  selectedOptions.memory === "48GB" ? "active" : ""
                }`}
                onClick={() => handleSelection("memory", "48GB")}
                disabled={
                  selectedOptions.processor ===
                    "M4 chip with 10-core CPU, 10-core GPU" ||
                  selectedOptions.processor ===
                    "M4 Max chip with 14-core CPU, 32-core GPU"
                }
              >
                48GB
              </button>
              <button
                className={`filter-button-selection ${
                  selectedOptions.memory === "64GB" ? "active" : ""
                }`}
                onClick={() => handleSelection("memory", "64GB")}
                disabled={
                  selectedOptions.processor ===
                    "M4 chip with 10-core CPU, 10-core GPU" ||
                  selectedOptions.processor ===
                    "M4 Pro chip with 12-core CPU, 16-core GPU" ||
                  selectedOptions.processor ===
                    "M4 Pro chip with 14-core CPU, 20-core GPU" ||
                  selectedOptions.processor ===
                    "M4 Max chip with 14-core CPU, 32-core GPU"
                }
              >
                64GB
              </button>
              <button
                className={`filter-button-selection ${
                  selectedOptions.memory === "128GB" ? "active" : ""
                }`}
                onClick={() => handleSelection("memory", "128GB")}
                disabled={
                  selectedOptions.processor ===
                    "M4 chip with 10-core CPU, 10-core GPU" ||
                  selectedOptions.processor ===
                    "M4 Pro chip with 12-core CPU, 16-core GPU" ||
                  selectedOptions.processor ===
                    "M4 Pro chip with 14-core CPU, 20-core GPU" ||
                  selectedOptions.processor ===
                    "M4 Max chip with 14-core CPU, 32-core GPU"
                }
              >
                128GB
              </button>
            </div>
            <p className="spec-title">Litur</p>
            <div className="spec-selection-buttons">
              <button
                className={`filter-button-selection ${
                  selectedOptions.color === "Space Black" ? "active" : ""
                }`}
                onClick={() => handleSelection("color", "Space Black")}
              >
                Space Black
              </button>
              <button
                className={`filter-button-selection ${
                  selectedOptions.color === "Silver" ? "active" : ""
                }`}
                onClick={() => handleSelection("color", "Silver")}
              >
                Silver
              </button>
            </div>
            <p className="spec-title">Skjár</p>
            <div className="spec-selection-buttons">
              <button
                className={`filter-button-selection ${
                  selectedOptions.display === "Standard display" ? "active" : ""
                }`}
                onClick={() => handleSelection("display", "Standard display")}
              >
                Standard display
              </button>
              <button
                className={`filter-button-selection ${
                  selectedOptions.display === "Nano-texture display"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleSelection("display", "Nano-texture display")
                }
              >
                Nano-texture display
              </button>
            </div>
            <p className="spec-title">Aukahlutir</p>
            <div className="spec-selection-buttons">
              <button
                className={`filter-button-selection ${
                  selectedOptions.accessories === "70W Power Adapter"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleSelection("accessories", "70W Power Adapter")
                }
                disabled={
                  selectedOptions.screenSize === "16" ||
                  selectedOptions.processor ===
                    "M4 Max chip with 14-core CPU, 32-core GPU" ||
                  selectedOptions.processor ===
                    "M4 Max chip with 16-core CPU, 40-core GPU" ||
                  selectedOptions.processor ===
                    "M4 Pro chip with 14-core CPU, 20-core GPU"
                }
              >
                70W Power Adapter
              </button>
              <button
                className={`filter-button-selection ${
                  selectedOptions.accessories === "96W Power Adapter"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleSelection("accessories", "96W Power Adapter")
                }
                disabled={selectedOptions.screenSize === "16"}
              >
                96W Power Adapter
              </button>
              <button
                className={`filter-button-selection ${
                  selectedOptions.accessories === "140W Power Adapter"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleSelection("accessories", "140W Power Adapter")
                }
                disabled={selectedOptions.screenSize === "14"}
              >
                140W Power Adapter
              </button>
            </div>
          </div>
        </div>
      </div>
    </SignedIn>
  );
}

export default MacbookProTest;
