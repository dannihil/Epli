import React, { useState, useEffect } from "react";
import "../../css/CtoProduct.css";
import Divider from "@mui/material/Divider";
import { jsPDF } from "jspdf";
import { useUser, SignedIn } from "@clerk/clerk-react";
import PatchNotesModal from "../../functions/patchNotesModal";

function MacbookAir() {
  const [date, setDate] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const user = useUser();

  useEffect(() => {
    // Set date initially
    setDate(new Date().toLocaleDateString("en-GB"));

    // Optionally, update the date every second if you want real-time updates
    const interval = setInterval(() => {
      setDate(new Date().toLocaleDateString("en-GB"));
    }, 1000);

    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  useEffect(() => {
    if (!showModal) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setShowModal(false);
        setOrderNumber("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showModal]);

  const basePrices = { 13: 199990, 15: 249990 };

  const priceModifiers = {
    processor: {
      "M4 chip with 10-core CPU, 8-core GPU": 0,
      "M4 chip with 10-core CPU, 10-core GPU": 20000,
    },
    storage: {
      "256GB": 0,
      "512GB": 50000,
      "1TB": 90000,
      "2TB": 170000,
    },
    memory: {
      "16GB": 0,
      "24GB": 40000,
      "32GB": 80000,
    },
    color: {
      "Sky Blue": 0,
      Silver: 0,
      Starlight: 0,
      Midnight: 0,
    },
    display: {},
    accessories: {
      "30W Power Adapter": 0,
      "35W Dual USB-C Power Adapter": 5000,
      "70W Power Adapter": 5000,
    },
  };

  const [selectedOptions, setSelectedOptions] = useState({
    screenSize: "13", // Default selection
    processor: "M4 chip with 10-core CPU, 8-core GPU", // Default selection
    storage: "256GB", // Default selection
    memory: "16GB", // Default selection
    color: "Sky Blue", // Default selection
    accessories: "30W Power Adapter", // Default selection
  });

  const totalPrice =
    (basePrices[selectedOptions.screenSize] || 0) +
    Object.keys(priceModifiers).reduce((sum, key) => {
      const modifier = priceModifiers[key][selectedOptions[key]];
      return sum + (modifier || 0);
    }, 0) -
    // 35W dual adapter discount (only for 15")
    (selectedOptions.screenSize === "15" &&
    selectedOptions.accessories === "35W Dual USB-C Power Adapter"
      ? 5000
      : 0) -
    // M4 10-core is free if used with qualifying memory or storage
    ((selectedOptions.processor === "M4 chip with 10-core CPU, 10-core GPU" &&
      (["512GB", "1TB", "2TB"].includes(selectedOptions.storage) ||
        ["24GB", "32GB"].includes(selectedOptions.memory))) ||
    ["15"].includes(selectedOptions.screenSize)
      ? 20000
      : 0);

  const formatPriceISK = (price) => {
    const formattedPrice = price.toLocaleString("is-IS");
    return formattedPrice.replace(/,/g, ".") + "kr";
  };

  const handleSelection = (category, option) => {
    setSelectedOptions((prev) => {
      let newSelection = { ...prev, [category]: option };

      if (category === "screenSize" && option === "13") {
        newSelection.processor = "M4 chip with 10-core CPU, 8-core GPU";
        newSelection.storage = "256GB";
        newSelection.memory = "16GB";
        newSelection.accessories = "30W Power Adapter";
      }
      if (category === "screenSize" && option === "15") {
        newSelection.processor = "M4 chip with 10-core CPU, 10-core GPU";
        newSelection.storage = "256GB";
        newSelection.memory = "16GB";
        newSelection.accessories = "35W Dual USB-C Power Adapter";
      }
      if (
        (category === "memory" && option === "24GB") ||
        (category === "memory" && option === "32GB") ||
        (category === "storage" && option === "512GB") ||
        (category === "storage" && option === "1TB") ||
        (category === "storage" && option === "2TB")
      ) {
        newSelection.processor = "M4 chip with 10-core CPU, 10-core GPU";
      }
      if (
        category === "processor" &&
        option === "M4 chip with 10-core CPU, 8-core GPU"
      ) {
        newSelection.memory = "16GB";
      }
      return newSelection;
    });
  };

  function getBase64Image(imageUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous"; // handle cross-origin issues
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL("image/png"); // Convert image to Base64
        resolve(dataURL);
      };
      img.onerror = (error) => {
        reject(error);
      };
      img.src = imageUrl;
    });
  }

  const generatePdf = async (title) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const formattedDate = new Date().toLocaleDateString("en-GB");

    // Add image based on screen size and color
    let imageSrc = "";
    if (
      selectedOptions.screenSize === "15" &&
      selectedOptions.color === "Sky Blue"
    ) {
      imageSrc = "../assets/mba_15_m4_sk-bl.png";
    } else if (
      selectedOptions.screenSize === "15" &&
      selectedOptions.color === "Silver"
    ) {
      imageSrc = "../assets/mba_15_m3_sil.png";
    } else if (
      selectedOptions.screenSize === "15" &&
      selectedOptions.color === "Starlight"
    ) {
      imageSrc = "../assets/mba_15_m3_stl.png";
    } else if (
      selectedOptions.screenSize === "15" &&
      selectedOptions.color === "Midnight"
    ) {
      imageSrc = "../assets/mba_15_m3_mid.png";
    } else if (
      selectedOptions.screenSize === "13" &&
      selectedOptions.color === "Sky Blue"
    ) {
      imageSrc = "../assets/mba_m4_sk-bl.png";
    } else if (
      selectedOptions.screenSize === "13" &&
      selectedOptions.color === "Silver"
    ) {
      imageSrc = "../assets/mba_m3_sil.png";
    } else if (
      selectedOptions.screenSize === "13" &&
      selectedOptions.color === "Starlight"
    ) {
      imageSrc = "../assets/mba_m3_sl.png";
    } else if (
      selectedOptions.screenSize === "13" &&
      selectedOptions.color === "Midnight"
    ) {
      imageSrc = "../assets/mba_m3_mid.png";
    }

    // Convert image to Base64
    const base64Image = await getBase64Image(imageSrc);

    // Add image to PDF (10, 20 is the position, 180, 160 is the size)
    if (selectedOptions.screenSize == "13") {
      doc.addImage(base64Image, "PNG", 5, 23, 100, 100);
    } else if (selectedOptions.screenSize == "15") {
      doc.addImage(base64Image, "PNG", 5, 25, 100, 100);
    }

    doc.setFontSize(25);
    doc.setFont("georgia", "bold");
    doc.text(`${title}`, 10, 25);

    // 🟡 Pöntunarnúmer
    doc.setFont("georgia", "bold");
    doc.setFontSize(12);
    if (orderNumber) {
      doc.text("Pöntunarnúmer:", 150, 10);
      doc.setFont("georgia", "normal");
      doc.text(orderNumber.toUpperCase(), 150, 16);

      // 🟡 Date & Salesperson
      doc.setFont("georgia", "bold");
      doc.text("Dagsetning:", 150, 24);
      doc.setFont("georgia", "normal");
      doc.text(formattedDate, 175, 24);

      doc.setFont("georgia", "bold");
      doc.text("Sölumaður:", 150, 30);
      doc.setFont("georgia", "normal");
      doc.text(`${user.user.firstName}`, 175, 30);
    } else {
      // 🟡 Date & Salesperson
      doc.setFont("georgia", "bold");
      doc.text("Dagsetning:", 150, 20);
      doc.setFont("georgia", "normal");
      doc.text(formattedDate, 175, 20);

      doc.setFont("georgia", "bold");
      doc.text("Sölumaður:", 150, 28);
      doc.setFont("georgia", "normal");
      doc.text(`${user.user.firstName}`, 175, 28);
    }

    doc.line(10, 36, pageWidth - 10, 36);

    // Add selected options list
    let xPosition = 105; // x-coordinate (start right of the image)
    let yPosition = 50; // y-coordinate (aligned with the top of the image)

    // Add selected options list with dynamic font size and weight
    doc.setFontSize(15);
    doc.setFont("georgia", "bold");
    doc.text(`Tæknilegar upplýsingar`, xPosition, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.setFont("georgia", "Normal");
    doc.text(`Litur: ${selectedOptions.color}`, xPosition, yPosition);
    yPosition += 7;
    doc.text(
      `Skjástærð: ${selectedOptions.screenSize}" Retina skjár`,
      xPosition,
      yPosition
    );
    yPosition += 7;
    doc.text(`Örgjörvi: ${selectedOptions.processor}`, xPosition, yPosition);
    yPosition += 7;
    doc.text(`Geymsla: ${selectedOptions.storage} SSD`, xPosition, yPosition);
    yPosition += 7;
    doc.text(
      `Vinnsluminni: ${selectedOptions.memory} Unified Memory`,
      xPosition,
      yPosition
    );
    yPosition += 7;
    doc.text("Skjár: Standard glass", xPosition, yPosition);
    yPosition += 7;
    doc.text(
      `Aukahlutir: ${selectedOptions.accessories}`,
      xPosition,
      yPosition
    );

    // Add price
    yPosition += 20;
    doc.line(157, 115, pageWidth - 10, 115);

    doc.setFont("georgia", "bold");
    doc.text("Samtals verð með VSK:", 157, yPosition);
    doc.setFont("georgia", "normal");
    yPosition += 7;
    if (formatPriceISK(totalPrice).length === 9) {
      doc.text(`${formatPriceISK(totalPrice)}`, 183, yPosition);
    }
    if (formatPriceISK(totalPrice).length > 9) {
      doc.text(`${formatPriceISK(totalPrice)}`, 180, yPosition);
    }
    yPosition += 20;
    doc.line(10, 140, pageWidth - 10, 140);
    doc.setFont("georgia", "bold");
    doc.text(
      "Afgreiðslutími sérpanta getur verið allt að 4-6 vikur frá degi pöntunar.",
      10,
      yPosition
    );
    yPosition += 7;
    doc.text(
      "Gerð er krafa um að lágmarki 30% fyrirframgreiðslu við pöntun.",
      10,
      yPosition
    );
    yPosition += 7;
    doc.text(
      "Ekki er hægt að hætta við sérpöntun sé varan komin í framleiðsluferli.",
      10,
      yPosition
    );
    yPosition += 12;
    doc.text(
      `Ef þú hefur einhverjar spurningar vinsamlegast hafðu samband í netfangið   ${user.user.emailAddresses}`,
      10,
      yPosition
    );
    doc.line(10, 183, pageWidth - 10, 183);

    yPosition += 70;
    doc.text("Undirskrift (staðfesting á pöntun)", 10, yPosition);
    doc.line(10, 240, pageWidth - 100, 240);

    const logoBase64 = await getBase64Image("../assets/epli-logo-black.png");
    doc.addImage(logoBase64, "PNG", 65, 240, 80, 52.5);
    doc.line(65, 285, pageWidth - 65, 285);
    doc.text("Laugavegur 182 - Smáralind - epli.is", 73, 290);

    if (orderNumber) {
      doc.save(
        `${title.replace(/"/g, "").trim()} - ${orderNumber.toUpperCase()}.pdf`
      );
    } else {
      doc.save(`${title.replace(/"/g, "").trim()}.pdf`);
    }
  };

  return (
    <SignedIn>
      <div className="main-container">
        <PatchNotesModal />
        <div className="page-container">
          <div className="image-spec-container">
            <div className="product-image-container">
              {selectedOptions.screenSize === "13" ? (
                selectedOptions.color === "Sky Blue" ? (
                  <img
                    src="../assets/mba_m4_sk-bl.png"
                    alt="MacBook Air"
                    className="product-image"
                    draggable={false}
                  />
                ) : selectedOptions.color === "Silver" ? (
                  <img
                    src="../assets/mba_m3_sil.png"
                    alt="MacBook Air"
                    className="product-image"
                    draggable={false}
                  />
                ) : selectedOptions.color === "Starlight" ? (
                  <img
                    src="../assets/mba_m3_sl.png"
                    alt="MacBook Air"
                    className="product-image"
                    draggable={false}
                  />
                ) : selectedOptions.color === "Midnight" ? (
                  <img
                    src="../assets/mba_m3_mid.png"
                    alt="MacBook Air"
                    className="product-image"
                    draggable={false}
                  />
                ) : (
                  <img
                    src="../assets/mba_m3_sg.png"
                    alt="MacBook Air"
                    className="product-image"
                    draggable={false}
                  />
                )
              ) : selectedOptions.screenSize === "15" ? (
                selectedOptions.color === "Sky Blue" ? (
                  <img
                    src="../assets/mba_15_m4_sk-bl.png"
                    alt="MacBook Air"
                    className="product-image"
                    draggable={false}
                  />
                ) : selectedOptions.color === "Silver" ? (
                  <img
                    src="../assets/mba_15_m3_sil.png"
                    alt="MacBook Air"
                    className="product-image"
                    draggable={false}
                  />
                ) : selectedOptions.color === "Starlight" ? (
                  <img
                    src="../assets/mba_15_m3_stl.png"
                    alt="MacBook Air"
                    className="product-image"
                    draggable={false}
                  />
                ) : selectedOptions.color === "Midnight" ? (
                  <img
                    src="../assets/mba_15_m3_mid.png"
                    alt="MacBook Air"
                    className="product-image"
                    draggable={false}
                  />
                ) : (
                  <img
                    src="../assets/mba_15_m3_sg.png"
                    alt="MacBook Air"
                    className="product-image"
                    draggable={false}
                  />
                )
              ) : (
                <img
                  src="../assets/mba_15_m3_sg.png"
                  alt="MacBook Air"
                  className="product-image"
                  draggable={false}
                />
              )}
            </div>
            <p className="spec-list-title">Tæknilegar upplýsingar</p>
            <div className="spec-list">
              <ul>
                <li className="spec-item">
                  {selectedOptions.screenSize === "13" ? '13"' : '15"'} Retina
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
              Macbook Air {selectedOptions.screenSize}"
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
                <p style={{ color: "red", marginLeft: 5, marginTop: 5 }}>
                  Verð out of date!
                </p>
              </div>
              <button onClick={() => setShowModal(true)} className="pdf-button">
                Búa til PDF
              </button>
              {/* 🟡 Modal for input */}
              {showModal && (
                <div
                  onPointerDown={() => {
                    setShowModal(false);
                    setOrderNumber("");
                  }}
                  style={{
                    position: "fixed",
                    inset: 0, // covers top/right/bottom/left
                    backgroundColor: "rgba(0,0,0,0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 2147483647, // very high z-index for testing
                    pointerEvents: "auto",
                  }}
                >
                  <div
                    role="dialog"
                    aria-modal="true"
                    onPointerDown={(e) => e.stopPropagation()} // STOP the same event type from reaching the overlay
                    style={{
                      background: "white",
                      padding: "2rem",
                      borderRadius: "10px",
                      width: "100%",
                      maxWidth: "400px",
                    }}
                  >
                    {/* ...your modal content (title, input, buttons) ... */}
                    <h2 style={{ fontWeight: 900, marginBottom: "5px" }}>
                      Sölupöntunarnúmer:
                    </h2>
                    <input
                      className="input-field"
                      type="text"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      placeholder="Dæmi: SBP00******"
                      style={{ width: "100%", padding: "0.5rem" }}
                    />
                    <p style={{ fontSize: "12px", marginBottom: "20px" }}>
                      Skildu reitinn eftir tómann ef pöntunarnúmer á ekki við.
                    </p>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "1rem",
                      }}
                    >
                      <button
                        className="order-nr-pdf-button"
                        onClick={() => {
                          generatePdf(
                            `Sérpöntun - MacBook Air ${selectedOptions.screenSize}"`,
                            orderNumber
                          );
                          setShowModal(false);
                          setOrderNumber("");
                        }}
                      >
                        Staðfesta
                      </button>
                      <button
                        className="order-nr-pdf-button"
                        onClick={() => {
                          setShowModal(false);
                          setOrderNumber("");
                        }}
                      >
                        Hætta við
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>{" "}
            {/* Updated total price display */}
            <Divider style={{ margin: "10px 0px 10px 0px" }} />
            <p className="spec-title">Skjástærð</p>
            <div className="spec-selection-buttons">
              <button
                className={`filter-button-selection ${
                  selectedOptions.screenSize === "13" ? "active" : ""
                }`}
                onClick={() => handleSelection("screenSize", "13")}
              >
                13"
              </button>
              <button
                className={`filter-button-selection ${
                  selectedOptions.screenSize === "15" ? "active" : ""
                }`}
                onClick={() => handleSelection("screenSize", "15")}
              >
                15"
              </button>
            </div>
            <p className="spec-title">Örgjörvi</p>
            <div className="spec-selection-buttons">
              <div
                className={`filter-button-processor ${
                  selectedOptions.processor ===
                  "M4 chip with 10-core CPU, 8-core GPU"
                    ? "active"
                    : ""
                } ${
                  selectedOptions.storage === "512GB"
                    ? "disabled"
                    : "" || selectedOptions.storage === "1TB"
                    ? "disabled"
                    : "" || selectedOptions.storage === "2TB"
                    ? "disabled"
                    : "" || selectedOptions.screenSize === "15"
                    ? "disabled"
                    : ""
                }`}
                onClick={() => {
                  if (selectedOptions.screenSize !== "15") {
                    handleSelection(
                      "processor",
                      "M4 chip with 10-core CPU, 8-core GPU"
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
                  10-core CPU 8-core GPU
                </p>
              </div>
              <div
                className={`filter-button-processor ${
                  selectedOptions.processor ===
                  "M4 chip with 10-core CPU, 10-core GPU"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleSelection(
                    "processor",
                    "M4 chip with 10-core CPU, 10-core GPU"
                  )
                }
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
            </div>
            <p className="spec-title">Geymsla</p>
            <div className="spec-selection-buttons">
              <button
                className={`filter-button-selection ${
                  selectedOptions.storage === "256GB" ? "active" : ""
                }`}
                onClick={() => handleSelection("storage", "256GB")}
              >
                256GB
              </button>
              <button
                className={`filter-button-selection ${
                  selectedOptions.storage === "512GB" ? "active" : ""
                }`}
                onClick={() => handleSelection("storage", "512GB")}
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
            </div>
            <p className="spec-title">Vinnsluminni</p>
            <div className="spec-selection-buttons">
              <button
                className={`filter-button-selection ${
                  selectedOptions.memory === "16GB" ? "active" : ""
                }`}
                onClick={() => handleSelection("memory", "16GB")}
              >
                16GB
              </button>
              <button
                className={`filter-button-selection ${
                  selectedOptions.memory === "24GB" ? "active" : ""
                }`}
                onClick={() => handleSelection("memory", "24GB")}
              >
                24GB
              </button>
              <button
                className={`filter-button-selection ${
                  selectedOptions.memory === "32GB" ? "active" : ""
                }`}
                onClick={() => handleSelection("memory", "32GB")}
              >
                32GB
              </button>
            </div>
            <p className="spec-title">Litur</p>
            <div className="spec-selection-buttons">
              <button
                className={`filter-button-selection ${
                  selectedOptions.color === "Sky Blue" ? "active" : ""
                }`}
                onClick={() => handleSelection("color", "Sky Blue")}
              >
                Sky Blue
              </button>
              <button
                className={`filter-button-selection ${
                  selectedOptions.color === "Silver" ? "active" : ""
                }`}
                onClick={() => handleSelection("color", "Silver")}
              >
                Silver
              </button>
              <button
                className={`filter-button-selection ${
                  selectedOptions.color === "Starlight" ? "active" : ""
                }`}
                onClick={() => handleSelection("color", "Starlight")}
              >
                Starlight
              </button>
              <button
                className={`filter-button-selection ${
                  selectedOptions.color === "Midnight" ? "active" : ""
                }`}
                onClick={() => handleSelection("color", "Midnight")}
              >
                Midnight
              </button>
            </div>
            <p className="spec-title">Aukahlutir</p>
            <div className="spec-selection-buttons">
              <button
                className={`filter-button-selection ${
                  selectedOptions.accessories === "30W Power Adapter"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleSelection("accessories", "30W Power Adapter")
                }
                disabled={selectedOptions.screenSize === "15"}
              >
                30W Power Adapter
              </button>
              <button
                className={`filter-button-selection ${
                  selectedOptions.accessories === "35W Dual USB-C Power Adapter"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleSelection("accessories", "35W Dual USB-C Power Adapter")
                }
              >
                35W Dual USB-C Power Adapter
              </button>
              <button
                className={`filter-button-selection ${
                  selectedOptions.accessories === "70W Power Adapter"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleSelection("accessories", "70W Power Adapter")
                }
              >
                70W Power Adapter
              </button>
            </div>
          </div>
        </div>
      </div>
    </SignedIn>
  );
}

export default MacbookAir;
