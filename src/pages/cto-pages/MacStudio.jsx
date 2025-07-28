import React, { useState, useEffect } from "react";
import "../../css/CtoProduct.css";
import Divider from "@mui/material/Divider";
import { jsPDF } from "jspdf";
import { SignedIn, useUser } from "@clerk/clerk-react";
import PatchNotesModal from "../../functions/patchNotesModal";

function MacStudio() {
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
  const basePrices = {
    M4MAX: 399990,
    M3ULTRA: 799990,
  };

  const priceModifiers = {
    processor: {
      "M4 Max chip with 14-core CPU, 32-core GPU": 0,
      "M4 Max chip with 16-core CPU, 40-core GPU": 110000,
      "M3 Ultra chip with 28-core CPU, 60-core GPU": 0,
      "M3 Ultra chip with 32-core CPU, 80-core GPU": 300000,
    },
    storage: {
      "512GB": 0,
      "1TB": 40000,
      "2TB": 120000,
      "4TB": 240000,
      "8TB": 480000,
      "16TB": 920000,
    },
    memory: {
      "36GB": 0,
      "48GB": 0,
      "64GB": 40000,
      "96GB": 0,
      "128GB": 200000,
      "256GB": 340000,
      "512GB": 800000,
    },
  };

  const [selectedOptions, setSelectedOptions] = useState({
    processor: "M4 Max chip with 14-core CPU, 32-core GPU",
    storage: "512GB",
    memory: "36GB",
  });

  const getBasePrice = () => {
    const processor = selectedOptions.processor;

    if (processor.includes("M4 Max")) return basePrices.M4MAX;
    if (processor.includes("M3 Ultra")) return basePrices.M3ULTRA;

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

      if (
        category === "processor" &&
        option === "M4 Max chip with 14-core CPU, 32-core GPU"
      ) {
        newSelection.storage = "512GB";
        newSelection.memory = "36GB";
      }
      if (
        category === "processor" &&
        option === "M4 Max chip with 16-core CPU, 40-core GPU"
      ) {
        newSelection.memory = "48GB";
      }
      if (
        category === "processor" &&
        option === "M3 Ultra chip with 28-core CPU, 60-core GPU"
      ) {
        newSelection.storage = "1TB";
      }
      if (
        (category === "processor" &&
          option === "M3 Ultra chip with 28-core CPU, 60-core GPU") ||
        (category === "processor" &&
          option === "M3 Ultra chip with 32-core CPU, 80-core GPU")
      ) {
        newSelection.memory = "96GB";
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
    let imageSrc = "../assets/mac_studio.png";

    // Convert image to Base64
    const base64Image = await getBase64Image(imageSrc);

    // Add image to the PDF (10, 25 is the position, 100, 100 is the size)
    doc.addImage(base64Image, "PNG", 5, 23, 100, 100);

    // Add title
    doc.setFontSize(25);
    doc.setFont("georgia", "bold");
    doc.line(10, 10, pageWidth - 10, 10);
    doc.text(`${title}`, 10, 25);

    doc.setFontSize(12);
    doc.setFont("georgia", "bold");
    doc.text("Dagsetning:", 150, 20);
    doc.setFont("georgia", "normal");
    doc.text(formattedDate, 175, 20);

    doc.setFont("georgia", "bold");
    doc.text("Sölumaður:", 150, 28);
    doc.setFont("georgia", "normal");
    doc.text(`${user.user.firstName}`, 175, 28);

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

    // Add price
    yPosition += 48;
    doc.line(157, 115, pageWidth - 10, 115);

    doc.setFont("georgia", "bold");
    doc.text("Samtals verð með VSK:", 157, yPosition);
    doc.setFont("georgia", "normal");
    yPosition += 7;
    doc.text(`${formatPriceISK(totalPrice)}`, 183, yPosition);
    yPosition += 62;
    doc.line(10, 182, pageWidth - 10, 182);
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
    doc.line(10, 225, pageWidth - 10, 225);

    // Add logo image (base64 format or URL)
    const logoBase64 = await getBase64Image("../assets/epli-logo-black.png");
    doc.addImage(logoBase64, "PNG", 30, 208, 150, 100);
    doc.line(65, 285, pageWidth - 65, 285);
    doc.text("Laugavegur 182 - Smáralind - epli.is", 73, 290);

    // Save the PDF
    doc.save(`${title}.pdf`);
  };

  return (
    <SignedIn>
      <div className="main-container">
        <PatchNotesModal />
        <div className="page-container">
          <div className="image-spec-container">
            <div className="product-image-container">
              <img
                src="../assets/mac_studio.png"
                alt="MacBook Pro"
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
                  <b>Front:</b> Two USB-C ports, one SDXC card slot
                </li>
                <li className="spec-list-item">
                  <b>Back:</b> Four Thunderbolt 5 ports, two USB-A ports, HDMI
                  port,
                </li>
                <li className="spec-list-item">
                  10Gb Ethernet port, headphone jack
                </li>
                <li className="spec-list-item">
                  <i style={{ fontWeight: "550" }}>
                    Support for up to five displays
                  </i>
                </li>
              </ul>
            </div>
          </div>
          <div className="cto-spec-selection">
            <h1 style={{ fontWeight: 900, fontSize: 40, marginBottom: 10 }}>
              Mac Studio
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
                onClick={() => generatePdf(`Sérpöntun - Mac Studio`)}
                className="pdf-button"
              >
                Búa til PDF
              </button>
            </div>{" "}
            {/* Updated total price display */}
            <Divider style={{ margin: "10px 0px 10px 0px" }} />
            <p className="spec-title">Örgjörvi</p>
            <div className="spec-selection-buttons">
              <div
                className={`filter-button-processor ${
                  selectedOptions.processor ===
                  "M4 Max chip with 14-core CPU, 32-core GPU"
                    ? "active"
                    : ""
                } `}
                onClick={() => {
                  handleSelection(
                    "processor",
                    "M4 Max chip with 14-core CPU, 32-core GPU"
                  );
                }}
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
                } `}
                onClick={() => {
                  handleSelection(
                    "processor",
                    "M4 Max chip with 16-core CPU, 40-core GPU"
                  );
                }}
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
              <div
                className={`filter-button-processor ${
                  selectedOptions.processor ===
                  "M3 Ultra chip with 28-core CPU, 60-core GPU"
                    ? "active"
                    : ""
                } `}
                onClick={() => {
                  handleSelection(
                    "processor",
                    "M3 Ultra chip with 28-core CPU, 60-core GPU"
                  );
                }}
              >
                <img
                  src="../assets/m3ultra.svg"
                  alt="M3 Ultra logo"
                  className="button-processor-logo"
                />
                <p className="filter-button-processor-text">
                  28-core CPU 60-core GPU
                </p>
              </div>
              <div
                className={`filter-button-processor ${
                  selectedOptions.processor ===
                  "M3 Ultra chip with 32-core CPU, 80-core GPU"
                    ? "active"
                    : ""
                } `}
                onClick={() => {
                  handleSelection(
                    "processor",
                    "M3 Ultra chip with 32-core CPU, 80-core GPU"
                  );
                }}
              >
                <img
                  src="../assets/m3ultra.svg"
                  alt="M3 Ultra logo"
                  className="button-processor-logo"
                />
                <p className="filter-button-processor-text">
                  32-core CPU 80-core GPU
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
                    "M3 Ultra chip with 28-core CPU, 60-core GPU" ||
                  selectedOptions.processor ===
                    "M3 Ultra chip with 32-core CPU, 80-core GPU"
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
              >
                4TB
              </button>
              <button
                className={`filter-button-selection ${
                  selectedOptions.storage === "8TB" ? "active" : ""
                }`}
                onClick={() => handleSelection("storage", "8TB")}
              >
                8TB
              </button>
              <button
                className={`filter-button-selection ${
                  selectedOptions.storage === "16TB" ? "active" : ""
                }`}
                onClick={() => handleSelection("storage", "16TB")}
                disabled={
                  selectedOptions.processor ===
                    "M4 Max chip with 14-core CPU, 32-core GPU" ||
                  selectedOptions.processor ===
                    "M4 Max chip with 16-core CPU, 40-core GPU"
                }
              >
                16TB
              </button>
            </div>
            <p className="spec-title">Vinnsluminni</p>
            <div className="spec-selection-buttons">
              <button
                className={`filter-button-selection ${
                  selectedOptions.memory === "36GB" ? "active" : ""
                }`}
                onClick={() => handleSelection("memory", "36GB")}
                disabled={
                  selectedOptions.processor ===
                    "M4 Max chip with 16-core CPU, 40-core GPU" ||
                  selectedOptions.processor ===
                    "M3 Ultra chip with 28-core CPU, 60-core GPU" ||
                  selectedOptions.processor ===
                    "M3 Ultra chip with 32-core CPU, 80-core GPU"
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
                    "M4 Max chip with 14-core CPU, 32-core GPU" ||
                  selectedOptions.processor ===
                    "M3 Ultra chip with 28-core CPU, 60-core GPU" ||
                  selectedOptions.processor ===
                    "M3 Ultra chip with 32-core CPU, 80-core GPU"
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
                    "M4 Max chip with 14-core CPU, 32-core GPU" ||
                  selectedOptions.processor ===
                    "M3 Ultra chip with 28-core CPU, 60-core GPU" ||
                  selectedOptions.processor ===
                    "M3 Ultra chip with 32-core CPU, 80-core GPU"
                }
              >
                64GB
              </button>
              <button
                className={`filter-button-selection ${
                  selectedOptions.memory === "96GB" ? "active" : ""
                }`}
                onClick={() => handleSelection("memory", "96GB")}
                disabled={
                  selectedOptions.processor ===
                    "M4 Max chip with 14-core CPU, 32-core GPU" ||
                  selectedOptions.processor ===
                    "M4 Max chip with 16-core CPU, 40-core GPU"
                }
              >
                96GB
              </button>
              <button
                className={`filter-button-selection ${
                  selectedOptions.memory === "128GB" ? "active" : ""
                }`}
                onClick={() => handleSelection("memory", "128GB")}
                disabled={
                  selectedOptions.processor ===
                    "M4 Max chip with 14-core CPU, 32-core GPU" ||
                  selectedOptions.processor ===
                    "M3 Ultra chip with 28-core CPU, 60-core GPU" ||
                  selectedOptions.processor ===
                    "M3 Ultra chip with 32-core CPU, 80-core GPU"
                }
              >
                128GB
              </button>
              <button
                className={`filter-button-selection ${
                  selectedOptions.memory === "256GB" ? "active" : ""
                }`}
                onClick={() => handleSelection("memory", "256GB")}
                disabled={
                  selectedOptions.processor ===
                    "M4 Max chip with 14-core CPU, 32-core GPU" ||
                  selectedOptions.processor ===
                    "M4 Max chip with 16-core CPU, 40-core GPU"
                }
              >
                256GB
              </button>
              <button
                className={`filter-button-selection ${
                  selectedOptions.memory === "512GB" ? "active" : ""
                }`}
                onClick={() => handleSelection("memory", "512GB")}
                disabled={
                  selectedOptions.processor ===
                    "M4 Max chip with 14-core CPU, 32-core GPU" ||
                  selectedOptions.processor ===
                    "M3 Ultra chip with 28-core CPU, 60-core GPU" ||
                  selectedOptions.processor ===
                    "M4 Max chip with 16-core CPU, 40-core GPU"
                }
              >
                512GB
              </button>
            </div>
          </div>
        </div>
      </div>
    </SignedIn>
  );
}

export default MacStudio;
