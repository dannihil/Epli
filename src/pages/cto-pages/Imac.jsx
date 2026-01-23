import React, { useState, useEffect } from "react";
import "../../css/CtoProduct.css";
import Divider from "@mui/material/Divider";
import { jsPDF } from "jspdf";
import { useUser, SignedIn } from "@clerk/clerk-react";
import PatchNotesModal from "../../functions/patchNotesModal";

function Imac() {
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

  const basePrices = {
    M48C: 249990,
    M410C: 279990,
  };

  const priceModifiers = {
    processor: {
      "M4 chip with 8-core CPU, 8-core GPU": 0,
      "M4 chip with 10-core CPU, 10-core GPU": 0,
    },
    color: {
      Blue: 0,
      Purple: 0,
      Pink: 0,
      Orange: 0,
      Yellow: 0,
      Green: 0,
      Silver: 0,
    },
    storage: {
      "256GB": 0,
      "512GB": 40000,
      "1TB": 80000,
      "2TB": 160000,
    },
    memory: {
      "16GB": 0,
      "24GB": 40000,
      "32GB": 80000,
    },
    display: {
      "Standard display": 0,
      "Nano-texture display": 40000,
    },
    mouseTrackpad: {
      "Magic Mouse": 0,
      "Magic Trackpad": 10000,
    },
    keyboard: {
      "Magic Keyboard with Touch ID": 0,
      "Magic Keyboard with Touch ID and Numeric Keypad": 10000,
    },
  };

  const [selectedOptions, setSelectedOptions] = useState({
    processor: "M4 chip with 8-core CPU, 8-core GPU",
    storage: "256GB",
    memory: "16GB",
    color: "Blue",
    display: "Standard display",
    mouseTrackpad: "Magic Mouse",
    keyboard: "Magic Keyboard with Touch ID",
  });

  const getBasePrice = () => {
    if (!selectedOptions || !selectedOptions.processor) return 0;

    const processor = selectedOptions.processor;

    if (processor.includes("M4 chip with 8-core CPU, 8-core GPU"))
      return basePrices.M48C;
    if (processor.includes("M4 chip with 10-core CPU, 10-core GPU"))
      return basePrices.M410C;

    return 0;
  };

  const totalPrice =
    getBasePrice() +
    Object.keys(priceModifiers).reduce((sum, key) => {
      let modifier = priceModifiers[key][selectedOptions[key]] || 0;

      // Apply discount of 40,000 ISK to storage upgrades if processor is M3 Ultra
      if (
        key === "storage" &&
        selectedOptions.processor.includes("M3 Ultra") &&
        selectedOptions.storage !== "16TB"
      ) {
        modifier = Math.max(modifier - 40000, 0);
      }

      return sum + modifier;
    }, 0);

  const formatPriceISK = (price) => {
    const formattedPrice = price.toLocaleString("is-IS");
    return formattedPrice.replace(/,/g, ".") + "kr";
  };

  const handleSelection = (category, option) => {
    setSelectedOptions((prev) => {
      let newSelection = { ...prev, [category]: option };

      // Reset storage/memory if processor is changed
      if (
        category === "processor" &&
        (option === "M4 chip with 8-core CPU, 8-core GPU" ||
          option === "M4 chip with 10-core CPU, 10-core GPU")
      ) {
        newSelection.storage = "256GB";
        newSelection.memory = "16GB";
        newSelection.display = "Standard display";
      }

      return newSelection; // <- This was missing
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
    if (selectedOptions.color === "Blue") {
      imageSrc = "../assets/imac_blue.png";
    } else if (selectedOptions.color === "Purple") {
      imageSrc = "../assets/imac_purple.png";
    } else if (selectedOptions.color === "Pink") {
      imageSrc = "../assets/imac_pink.png";
    } else if (selectedOptions.color === "Orange") {
      imageSrc = "../assets/imac_orange.png";
    } else if (selectedOptions.color === "Yellow") {
      imageSrc = "../assets/imac_yellow.png";
    } else if (selectedOptions.color === "Green") {
      imageSrc = "../assets/imac_green.png";
    } else if (selectedOptions.color === "Silver") {
      imageSrc = "../assets/imac_silver.png";
    }

    // Convert image to Base64
    const base64Image = await getBase64Image(imageSrc);

    // Add image to the PDF (10, 25 is the position, 100, 100 is the size)
    doc.addImage(base64Image, "PNG", 20, 41, 70, 65);

    // Add title
    doc.setFontSize(25);
    doc.setFont("georgia", "bold");
    doc.text(`${title}`, 10, 25);

    // 🟡 Pöntunarnúmer
    doc.setFontSize(12);
    doc.setFont("georgia", "bold");
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
    doc.text("Tæknilegar upplýsingar", xPosition, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.setFont("georgia", "normal");
    doc.text(`Litur: ${selectedOptions.color}`, xPosition, yPosition);
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
    doc.text(`Skjár: ${selectedOptions.display}`, xPosition, yPosition);
    yPosition += 7;
    doc.text(
      `Mús eða trackpad: ${selectedOptions.mouseTrackpad}`,
      xPosition,
      yPosition
    );
    yPosition += 7;
    if (selectedOptions.keyboard === "Magic Keyboard with Touch ID") {
      doc.text(`Lyklaborð: ${selectedOptions.keyboard}`, xPosition, yPosition);
    } else if (
      selectedOptions.keyboard ===
      "Magic Keyboard with Touch ID and Numeric Keypad"
    ) {
      doc.text(`Lyklaborð: Magic Keyboard with Touch ID`, xPosition, yPosition);
      yPosition += 7;
      doc.text(`and numeric keyboard`, xPosition, yPosition);
      yPosition -= 7;
    }

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
      `Ef þú hefur einhverjar spurningar vinsamlegast hafðu samband í netfangið ${user.user.emailAddresses}`,
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
              {selectedOptions.color === "Blue" ? (
                <img
                  src="../assets/imac_blue.png"
                  alt="iMac"
                  className="product-image"
                  draggable={false}
                />
              ) : selectedOptions.color === "Purple" ? (
                <img
                  src="../assets/imac_purple.png"
                  alt="iMac"
                  className="product-image"
                  draggable={false}
                />
              ) : selectedOptions.color === "Pink" ? (
                <img
                  src="../assets/imac_pink.png"
                  alt="iMac"
                  className="product-image"
                  draggable={false}
                />
              ) : selectedOptions.color === "Orange" ? (
                <img
                  src="../assets/imac_orange.png"
                  alt="iMac"
                  className="product-image"
                  draggable={false}
                />
              ) : selectedOptions.color === "Yellow" ? (
                <img
                  src="../assets/imac_yellow.png"
                  alt="iMac"
                  className="product-image"
                  draggable={false}
                />
              ) : selectedOptions.color === "Green" ? (
                <img
                  src="../assets/imac_green.png"
                  alt="iMac"
                  className="product-image"
                  draggable={false}
                />
              ) : selectedOptions.color === "Silver" ? (
                <img
                  src="../assets/imac_silver.png"
                  alt="iMac"
                  className="product-image"
                  draggable={false}
                />
              ) : (
                <img
                  src="../assets/imac_blue.png"
                  alt="iMac"
                  className="product-image"
                  draggable={false}
                />
              )}
            </div>
            <p className="spec-list-title">Tæknilegar upplýsingar</p>
            <div className="spec-list">
              <ul>
                <li className="spec-list-item">{selectedOptions.processor}</li>
                <li className="spec-list-item">
                  {selectedOptions.storage} SSD geymsla
                </li>
                <li className="spec-list-item">
                  {selectedOptions.memory} Unified vinnsluminni
                </li>
                <li className="spec-list-item">{selectedOptions.display}</li>
                <li className="spec-list-item">
                  {selectedOptions.mouseTrackpad}
                </li>
                <li className="spec-list-item">{selectedOptions.keyboard}</li>
              </ul>
            </div>
          </div>
          <div className="cto-spec-selection">
            <h1 style={{ fontWeight: 900, fontSize: 40, marginBottom: 10 }}>
              iMac
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
              <button onClick={() => setShowModal(true)} className="pdf-button">
                Búa til PDF
              </button>
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
                          generatePdf(`Sérpöntun - iMac 24"`, orderNumber);
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
            <p className="spec-title">Örgjörvi</p>
            <div className="spec-selection-buttons">
              <div
                className={`filter-button-processor ${
                  selectedOptions.processor ===
                  "M4 chip with 8-core CPU, 8-core GPU"
                    ? "active"
                    : ""
                } `}
                onClick={() => {
                  handleSelection(
                    "processor",
                    "M4 chip with 8-core CPU, 8-core GPU"
                  );
                }}
              >
                <img
                  src="../assets/m4.svg"
                  alt="M4 logo"
                  className="button-processor-logo"
                />
                <p className="filter-button-processor-text">
                  8-core CPU 8-core GPU
                </p>
              </div>
              <div
                className={`filter-button-processor ${
                  selectedOptions.processor ===
                  "M4 chip with 10-core CPU, 10-core GPU"
                    ? "active"
                    : ""
                } `}
                onClick={() => {
                  handleSelection(
                    "processor",
                    "M4 chip with 10-core CPU, 10-core GPU"
                  );
                }}
              >
                <img
                  src="../assets/m4.svg"
                  alt="M3 logo"
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
                disabled={
                  selectedOptions.processor ===
                  "M4 chip with 8-core CPU, 8-core GPU"
                }
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
                disabled={
                  selectedOptions.processor ===
                  "M4 chip with 8-core CPU, 8-core GPU"
                }
              >
                32GB
              </button>
            </div>
            <p className="spec-title">Litur</p>
            <div className="spec-selection-buttons">
              <button
                className={`filter-button-selection ${
                  selectedOptions.color === "Blue" ? "active" : ""
                }`}
                onClick={() => handleSelection("color", "Blue")}
              >
                Blue
              </button>
              <button
                className={`filter-button-selection ${
                  selectedOptions.color === "Purple" ? "active" : ""
                }`}
                onClick={() => handleSelection("color", "Purple")}
              >
                Purple
              </button>
              <button
                className={`filter-button-selection ${
                  selectedOptions.color === "Pink" ? "active" : ""
                }`}
                onClick={() => handleSelection("color", "Pink")}
              >
                Pink
              </button>
              <button
                className={`filter-button-selection ${
                  selectedOptions.color === "Orange" ? "active" : ""
                }`}
                onClick={() => handleSelection("color", "Orange")}
              >
                Orange
              </button>
              <button
                className={`filter-button-selection ${
                  selectedOptions.color === "Yellow" ? "active" : ""
                }`}
                onClick={() => handleSelection("color", "Yellow")}
              >
                Yellow
              </button>
              <button
                className={`filter-button-selection ${
                  selectedOptions.color === "Green" ? "active" : ""
                }`}
                onClick={() => handleSelection("color", "Green")}
              >
                Green
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
                disabled={
                  selectedOptions.processor ===
                  "M4 chip with 8-core CPU, 8-core GPU"
                }
              >
                Nano-texture display
              </button>
            </div>
            <p className="spec-title">Mús eða Trackpad</p>
            <div className="spec-selection-buttons">
              <button
                className={`filter-button-selection ${
                  selectedOptions.mouseTrackpad === "Magic Mouse"
                    ? "active"
                    : ""
                }`}
                onClick={() => handleSelection("mouseTrackpad", "Magic Mouse")}
              >
                Magic Mouse
              </button>
              <button
                className={`filter-button-selection ${
                  selectedOptions.mouseTrackpad === "Magic Trackpad"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleSelection("mouseTrackpad", "Magic Trackpad")
                }
              >
                Magic Trackpad
              </button>
            </div>
            <p className="spec-title">Lyklaborð</p>
            <div className="spec-selection-buttons">
              <button
                className={`filter-button-selection ${
                  selectedOptions.keyboard === "Magic Keyboard with Touch ID"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleSelection("keyboard", "Magic Keyboard with Touch ID")
                }
              >
                Magic Keyboard with Touch ID
              </button>
              <button
                className={`filter-button-selection ${
                  selectedOptions.keyboard ===
                  "Magic Keyboard with Touch ID and Numeric Keypad"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleSelection(
                    "keyboard",
                    "Magic Keyboard with Touch ID and Numeric Keypad"
                  )
                }
              >
                Magic Keyboard with Touch ID and Numeric Keypad
              </button>
            </div>
          </div>
        </div>
      </div>
    </SignedIn>
  );
}

export default Imac;
