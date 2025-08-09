import React, { useState, useEffect } from "react";
import "../../css/CtoProduct.css";
import Divider from "@mui/material/Divider";
import { jsPDF } from "jspdf";
import { SignedIn, useUser } from "@clerk/clerk-react";
import PatchNotesModal from "../../functions/patchNotesModal";

function MacMini() {
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

  const priceModifiers = {
    processor: {
      "M4 chip with 10-core CPU, 10-core GPU": 0,
      "M4 Pro chip with 12-core CPU, 16-core GPU": 0,
      "M4 Pro chip with 14-core CPU, 20-core GPU": 40000,
    },
    storage: {
      "256GB": 0,
      "512GB": 40000,
      "512GB-M4PRO": 0,
      "1TB": 80000,
      "1TB-M4PRO": 40000,
      "2TB": 160000,
      "2TB-M4PRO": 130000,
      "4TB": 260000,
      "8TB": 520000,
    },
    memory: {
      "16GB": 0,
      "24GB": 40000,
      "24GB-M4PRO": 0,
      "32GB": 80000,
      "48GB": 80000,
      "64GB": 130000,
    },
    ethernet: {
      "Gigabit Ethernet": 0,
      "10 Gigabit Ethernet": 20000,
    },
  };

  const [selectedOptions, setSelectedOptions] = useState({
    processor: "M4 chip with 10-core CPU, 10-core GPU",
    storage: "256GB",
    memory: "16GB",
    ethernet: "Gigabit Ethernet",
  });

  const basePrices = {
    M4: 129990,
    M4PRO: 289990,
  };

  const getBasePrice = () => {
    if (!selectedOptions || !selectedOptions.processor) return 0;

    const processor = selectedOptions.processor;

    if (processor.includes("M4 chip")) return basePrices.M4;
    if (processor.includes("M4 Pro chip")) return basePrices.M4PRO;

    return 0;
  };

  const totalPrice =
    getBasePrice() +
    Object.keys(priceModifiers).reduce((sum, key) => {
      let modifier = priceModifiers[key][selectedOptions[key]] || 0;

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
        option === "M4 chip with 10-core CPU, 10-core GPU"
      ) {
        newSelection.storage = "256GB";
        newSelection.memory = "16GB";
      }
      if (
        (category === "processor" &&
          option === "M4 Pro chip with 12-core CPU, 16-core GPU") ||
        (category === "processor" &&
          option === "M4 Pro chip with 14-core CPU, 20-core GPU")
      ) {
        newSelection.storage = "512GB-M4PRO";
        newSelection.memory = "24GB-M4PRO";
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

  const generatePdf = async (title, orderNumber) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const formattedDate = new Date().toLocaleDateString("en-GB");

    let imageSrc = "../assets/mac_mini.png";

    // Convert image to Base64
    const base64Image = await getBase64Image(imageSrc);

    // Add image to the PDF (10, 25 is the position, 100, 100 is the size)
    doc.addImage(base64Image, "PNG", 5, 15, 100, 100);

    // Add title
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
    doc.text("Tæknilegar upplýsingar", xPosition, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.setFont("georgia", "normal");
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
    doc.text(`Ethernet: ${selectedOptions.ethernet}`, xPosition, yPosition);

    // Add price
    yPosition += 20;
    doc.line(157, 95, pageWidth - 10, 95);

    doc.setFont("georgia", "bold");
    doc.text("Samtals verð með VSK:", 157, yPosition);
    doc.setFont("georgia", "normal");
    yPosition += 7;
    doc.text(`${formatPriceISK(totalPrice)}`, 183, yPosition);

    yPosition += 41;
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
              <img
                src="../assets/mac_mini.png"
                alt="Mac mini"
                className="product-image"
                draggable={false}
              />
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
                <li className="spec-list-item">{selectedOptions.ethernet}</li>
              </ul>
              <p
                style={{
                  marginTop: "20px",
                  fontSize: "18px",
                  fontWeight: "800",
                }}
              >
                Tengimöguleikar
              </p>
              <ul>
                <li className="spec-list-item">
                  <b>Front:</b> Two USB-C ports with support for USB 3 (up to
                  10Gb/s)
                </li>
                <li className="spec-list-item">3.5 mm headphone jack</li>
                {selectedOptions.processor ===
                "M4 chip with 10-core CPU, 10-core GPU" ? (
                  <>
                    <li className="spec-list-item">
                      <b>Back:</b> Gigabit Ethernet port (configurable to 10Gb
                      Ethernet)
                    </li>
                    <li className="spec-list-item">HDMI port</li>
                    <li className="spec-list-item">
                      <b>Three Thunderbolt 4 (USB-C) ports with support for:</b>
                    </li>
                    <li className="spec-list-item">
                      Thunderbolt 4 (up to 40Gb/s)
                    </li>
                    <li className="spec-list-item">USB 4 (up to 40Gb/s)</li>
                    <li className="spec-list-item">DisplayPort</li>
                  </>
                ) : selectedOptions.processor ===
                    "M4 Pro chip with 12-core CPU, 16-core GPU" ||
                  selectedOptions.processor ===
                    "M4 Pro chip with 14-core CPU, 20-core GPU" ? (
                  <>
                    <li className="spec-list-item">
                      <b>Back:</b> Gigabit Ethernet port (configurable to 10Gb
                      Ethernet)
                    </li>
                    <li className="spec-list-item">HDMI port</li>
                    <li className="spec-list-item">
                      <b>Three Thunderbolt 5 (USB-C) ports with support for:</b>
                    </li>
                    <li className="spec-list-item">
                      Thunderbolt 5 (up to 120Gb/s)
                    </li>
                    <li className="spec-list-item">USB 4 (up to 120Gb/s)</li>
                    <li className="spec-list-item">DisplayPort</li>
                  </>
                ) : (
                  ""
                )}
              </ul>
            </div>
          </div>
          <div className="cto-spec-selection">
            <h1 style={{ fontWeight: 900, fontSize: 40, marginBottom: 10 }}>
              Mac mini
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
                          generatePdf(`Sérpöntun - Mac mini`, orderNumber);
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
                } `}
                onClick={() => {
                  handleSelection(
                    "processor",
                    "M4 Pro chip with 12-core CPU, 16-core GPU"
                  );
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
                } `}
                onClick={() => {
                  handleSelection(
                    "processor",
                    "M4 Pro chip with 14-core CPU, 20-core GPU"
                  );
                }}
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
            </div>
            <p className="spec-title">Geymsla</p>
            <div className="spec-selection-buttons">
              <button
                className={`filter-button-selection ${
                  selectedOptions.storage === "256GB" ? "active" : ""
                }`}
                onClick={() => handleSelection("storage", "256GB")}
                disabled={
                  selectedOptions.processor ===
                    "M4 Pro chip with 12-core CPU, 16-core GPU" ||
                  selectedOptions.processor ===
                    "M4 Pro chip with 14-core CPU, 20-core GPU"
                }
              >
                256GB
              </button>
              {selectedOptions.processor ===
              "M4 chip with 10-core CPU, 10-core GPU" ? (
                <button
                  className={`filter-button-selection ${
                    selectedOptions.storage === "512GB" ? "active" : ""
                  }`}
                  onClick={() => handleSelection("storage", "512GB")}
                >
                  512GB
                </button>
              ) : selectedOptions.processor ===
                  "M4 Pro chip with 12-core CPU, 16-core GPU" ||
                selectedOptions.processor ===
                  "M4 Pro chip with 14-core CPU, 20-core GPU" ? (
                <button
                  className={`filter-button-selection ${
                    selectedOptions.storage === "512GB-M4PRO" ? "active" : ""
                  }`}
                  onClick={() => handleSelection("storage", "512GB-M4PRO")}
                >
                  512GB
                </button>
              ) : (
                ""
              )}
              {selectedOptions.processor ===
              "M4 chip with 10-core CPU, 10-core GPU" ? (
                <button
                  className={`filter-button-selection ${
                    selectedOptions.storage === "1TB" ? "active" : ""
                  }`}
                  onClick={() => handleSelection("storage", "1TB")}
                >
                  1TB
                </button>
              ) : selectedOptions.processor ===
                  "M4 Pro chip with 12-core CPU, 16-core GPU" ||
                selectedOptions.processor ===
                  "M4 Pro chip with 14-core CPU, 20-core GPU" ? (
                <button
                  className={`filter-button-selection ${
                    selectedOptions.storage === "1TB-M4PRO" ? "active" : ""
                  }`}
                  onClick={() => handleSelection("storage", "1TB-M4PRO")}
                >
                  1TB
                </button>
              ) : (
                ""
              )}
              {selectedOptions.processor ===
              "M4 chip with 10-core CPU, 10-core GPU" ? (
                <button
                  className={`filter-button-selection ${
                    selectedOptions.storage === "2TB" ? "active" : ""
                  }`}
                  onClick={() => handleSelection("storage", "2TB")}
                >
                  2TB
                </button>
              ) : selectedOptions.processor ===
                  "M4 Pro chip with 12-core CPU, 16-core GPU" ||
                selectedOptions.processor ===
                  "M4 Pro chip with 14-core CPU, 20-core GPU" ? (
                <button
                  className={`filter-button-selection ${
                    selectedOptions.storage === "2TB-M4PRO" ? "active" : ""
                  }`}
                  onClick={() => handleSelection("storage", "2TB-M4PRO")}
                >
                  2TB
                </button>
              ) : (
                ""
              )}
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
                  "M4 chip with 10-core CPU, 10-core GPU"
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
                  selectedOptions.processor ===
                    "M4 Pro chip with 12-core CPU, 16-core GPU" ||
                  selectedOptions.processor ===
                    "M4 Pro chip with 14-core CPU, 20-core GPU"
                }
              >
                16GB
              </button>
              {selectedOptions.processor ===
              "M4 chip with 10-core CPU, 10-core GPU" ? (
                <button
                  className={`filter-button-selection ${
                    selectedOptions.memory === "24GB" ? "active" : ""
                  }`}
                  onClick={() => handleSelection("memory", "24GB")}
                >
                  24GB
                </button>
              ) : selectedOptions.processor ===
                  "M4 Pro chip with 12-core CPU, 16-core GPU" ||
                selectedOptions.processor ===
                  "M4 Pro chip with 14-core CPU, 20-core GPU" ? (
                <button
                  className={`filter-button-selection ${
                    selectedOptions.memory === "24GB-M4PRO" ? "active" : ""
                  }`}
                  onClick={() => handleSelection("memory", "24GB-M4PRO")}
                >
                  24GB
                </button>
              ) : (
                ""
              )}
              <button
                className={`filter-button-selection ${
                  selectedOptions.memory === "32GB" ? "active" : ""
                }`}
                onClick={() => handleSelection("memory", "32GB")}
                disabled={
                  selectedOptions.processor ===
                    "M4 Pro chip with 12-core CPU, 16-core GPU" ||
                  selectedOptions.processor ===
                    "M4 Pro chip with 14-core CPU, 20-core GPU"
                }
              >
                32GB
              </button>
              <button
                className={`filter-button-selection ${
                  selectedOptions.memory === "48GB" ? "active" : ""
                }`}
                onClick={() => handleSelection("memory", "48GB")}
                disabled={
                  selectedOptions.processor ===
                  "M4 chip with 10-core CPU, 10-core GPU"
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
                  "M4 chip with 10-core CPU, 10-core GPU"
                }
              >
                64GB
              </button>
            </div>
            <p className="spec-title">Ethernet</p>
            <div className="spec-selection-buttons">
              <button
                className={`filter-button-selection ${
                  selectedOptions.ethernet === "Gigabit Ethernet"
                    ? "active"
                    : ""
                }`}
                onClick={() => handleSelection("ethernet", "Gigabit Ethernet")}
              >
                Gigabit Ethernet
              </button>
              <button
                className={`filter-button-selection ${
                  selectedOptions.ethernet === "10 Gigabit Ethernet"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleSelection("ethernet", "10 Gigabit Ethernet")
                }
              >
                10 Gigabit Ethernet
              </button>
            </div>
          </div>
        </div>
      </div>
    </SignedIn>
  );
}

export default MacMini;
