import React, { useState, useEffect } from "react";
import "../../css/CtoProduct.css";
import Divider from "@mui/material/Divider";
import { jsPDF } from "jspdf";
import { useUser, SignedIn } from "@clerk/clerk-react";
import PatchNotesModal from "../../functions/patchNotesModal";
import { supabase } from "../../lib/supabase";

const PRODUCT_ID = "aaaaaaaa-0003-0000-0000-000000000000";

const chipMap = {
  "M5 chip with 10-core CPU, 8-core GPU": "m5_10_8",
  "M5 chip with 10-core CPU, 10-core GPU": "m5_10_10",
};

const colorMap = {
  "Sky Blue": "sky_blue",
  Silver: "silver",
  Starlight: "starlight",
  Midnight: "midnight",
};

function MacbookAir() {
  const [showModal, setShowModal] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [totalPrice, setTotalPrice] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const user = useUser();

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

  const [selectedOptions, setSelectedOptions] = useState({
    screenSize: "13",
    processor: "M5 chip with 10-core CPU, 8-core GPU",
    storage: "512GB",
    memory: "16GB",
    color: "Sky Blue",
  });

  useEffect(() => {
    const fetchPrice = async () => {
      setLoadingPrice(true);
      const { data, error } = await supabase
        .from("configuration")
        .select("price_isk")
        .eq("product_id", PRODUCT_ID)
        .eq("chip", chipMap[selectedOptions.processor])
        .eq("storage", selectedOptions.storage.toLowerCase())
        .eq("memory", selectedOptions.memory.toLowerCase())
        .eq("screen_size", selectedOptions.screenSize)
        .eq("color", colorMap[selectedOptions.color])
        .single();

      setTotalPrice(error || !data ? null : data.price_isk);
      setLoadingPrice(false);
    };
    fetchPrice();
  }, [selectedOptions]);

  const formatPriceISK = (price) => {
    return price.toLocaleString("is-IS").replace(/,/g, ".") + "kr";
  };

  const handleSelection = (category, option) => {
    setSelectedOptions((prev) => {
      let newSelection = { ...prev, [category]: option };
      if (category === "screenSize" && option === "13") {
        newSelection.processor = "M5 chip with 10-core CPU, 8-core GPU";
        newSelection.storage = "512GB";
        newSelection.memory = "16GB";
      }
      if (category === "screenSize" && option === "15") {
        newSelection.processor = "M5 chip with 10-core CPU, 10-core GPU";
        newSelection.storage = "512GB";
        newSelection.memory = "16GB";
      }
      if (category === "processor" && option === "M5 chip with 10-core CPU, 8-core GPU") {
        newSelection.storage = "512GB";
        newSelection.memory = "16GB";
      }
      return newSelection;
    });
  };

  function getBase64Image(imageUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = reject;
      img.src = imageUrl;
    });
  }

  const generatePdf = async (title, orderNumber = "") => {
    const doc = new jsPDF();
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const m = 14;
    const formattedDate = new Date().toLocaleDateString("en-GB");

    const imgMap = {
      "15-Sky Blue": "../assets/mba_15_m4_sk-bl.png",
      "15-Silver": "../assets/mba_15_m3_sil.png",
      "15-Starlight": "../assets/mba_15_m3_stl.png",
      "15-Midnight": "../assets/mba_15_m3_mid.png",
      "13-Sky Blue": "../assets/mba_m4_sk-bl.png",
      "13-Silver": "../assets/mba_m3_sil.png",
      "13-Starlight": "../assets/mba_m3_sl.png",
      "13-Midnight": "../assets/mba_m3_mid.png",
    };
    const imageSrc = imgMap[`${selectedOptions.screenSize}-${selectedOptions.color}`] || "../assets/mba_m4_sk-bl.png";

    const [base64Image, logoBase64] = await Promise.all([
      getBase64Image(imageSrc),
      getBase64Image("../assets/epli-logo-black.png"),
    ]);

    const logoRatio = 52.5 / 80;

    const logoW = 30;
    const logoH = logoW * logoRatio;
    doc.addImage(logoBase64, "PNG", m, 6, logoW, logoH);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(20, 20, 20);
    doc.text("SÉRPÖNTUN", W - m, 14, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(130, 130, 130);
    doc.text(`MacBook Air ${selectedOptions.screenSize}"`, W - m, 22, { align: "right" });
    doc.setDrawColor(210, 210, 210);
    doc.line(m, 30, W - m, 30);

    const metaFields = [
      ["DAGSETNING", formattedDate],
      ["SÖLUMAÐUR", user.user.firstName],
      ...(orderNumber ? [["PÖNTUNARNÚMER", orderNumber.toUpperCase()]] : []),
    ];
    const colW = (W - m * 2) / metaFields.length;
    metaFields.forEach(([label, value], i) => {
      const x = m + i * colW;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(140, 140, 140);
      doc.text(label, x, 38);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(20, 20, 20);
      doc.text(value, x, 45);
    });
    doc.setDrawColor(230, 230, 230);
    doc.line(m, 51, W - m, 51);

    const imgX = m, imgY = 62, imgW = 82, imgH = 68;
    doc.setFillColor(245, 245, 247);
    doc.roundedRect(imgX, imgY, imgW, imgH, 5, 5, "F");
    doc.addImage(base64Image, "PNG", imgX + 3, imgY + 3, imgW - 6, imgH - 6);

    const specX = imgX + imgW + 8;
    const specW = W - specX - m;
    let y = imgY;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("TÆKNILEGAR UPPLÝSINGAR", specX, y);
    y += 4;
    doc.setDrawColor(210, 210, 210);
    doc.line(specX, y, W - m, y);
    y += 6;

    const specs = [
      ["Litur", selectedOptions.color],
      ["Skjástærð", `${selectedOptions.screenSize}" Retina`],
      ["Örgjörvi", selectedOptions.processor],
      ["Geymsla", `${selectedOptions.storage} SSD`],
      ["Vinnsluminni", `${selectedOptions.memory} Unified`],
    ];
    const rowH = 9;
    specs.forEach(([label, value], i) => {
      if (i % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(specX - 1, y - 3.5, specW + 1, rowH, "F");
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(130, 130, 130);
      doc.text(label, specX + 1, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(20, 20, 20);
      doc.text(value, W - m - 1, y, { align: "right" });
      y += rowH;
    });

    y += 3;
    doc.setDrawColor(210, 210, 210);
    doc.line(specX, y, W - m, y);
    y += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(110, 110, 110);
    doc.text("SAMTALS VERÐ MEÐ VSK", specX, y);
    y += 7;
    doc.setFontSize(17);
    doc.setTextColor(20, 20, 20);
    const priceStr = totalPrice ? formatPriceISK(totalPrice) : "—";
    doc.text(priceStr, W - m - 1, y, { align: "right" });

    doc.setDrawColor(220, 220, 220);
    doc.line(m, 150, W - m, 150);

    let tY = 159;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text("SKILMÁLAR", m, tY);
    tY += 7;
    const email = user.user.emailAddresses[0]?.emailAddress || "";
    const terms = [
      "Afgreiðslutími sérpanta getur verið allt að 4-6 vikur frá degi pöntunar.",
      "Gerð er krafa um að lágmarki 30% fyrirframgreiðslu við pöntun.",
      "Ekki er hægt að hætta við sérpöntun sé varan komin í framleiðsluferli.",
      `Spurningar: hafðu samband í netfangið ${email}`,
    ];
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(90, 90, 90);
    terms.forEach((term) => {
      const lines = doc.splitTextToSize(`• ${term}`, W - m * 2);
      doc.text(lines, m, tY);
      tY += lines.length * 5.5 + 2;
    });

    const sigY = 218;
    doc.setDrawColor(170, 170, 170);
    doc.line(m, sigY, m + 85, sigY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(130, 130, 130);
    doc.text("Undirskrift (staðfesting á pöntun)", m, sigY + 5);

    const footerY = H - 22;
    doc.setDrawColor(210, 210, 210);
    doc.line(m, footerY, W - m, footerY);
    const fLogoW = 18;
    const fLogoH = fLogoW * logoRatio;
    doc.addImage(logoBase64, "PNG", m, footerY + 4, fLogoW, fLogoH);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text("Laugavegur 182  ·  Smáralind  ·  epli.is", W / 2, footerY + 12, { align: "center" });

    if (orderNumber) {
      doc.save(`${title.replace(/"/g, "").trim()} - ${orderNumber.toUpperCase()}.pdf`);
    } else {
      doc.save(`${title.replace(/"/g, "").trim()}.pdf`);
    }
  };

  return (
    <SignedIn>
      <div className="main-container">
        <PatchNotesModal />
        <div className="page-container">
          <div className="product-image-container">
            {selectedOptions.screenSize === "13" ? (
              selectedOptions.color === "Sky Blue" ? (
                <img src="../assets/mba_m4_sk-bl.png" alt="MacBook Air" className="product-image" draggable={false} />
              ) : selectedOptions.color === "Silver" ? (
                <img src="../assets/mba_m3_sil.png" alt="MacBook Air" className="product-image" draggable={false} />
              ) : selectedOptions.color === "Starlight" ? (
                <img src="../assets/mba_m3_sl.png" alt="MacBook Air" className="product-image" draggable={false} />
              ) : (
                <img src="../assets/mba_m3_mid.png" alt="MacBook Air" className="product-image" draggable={false} />
              )
            ) : selectedOptions.color === "Sky Blue" ? (
              <img src="../assets/mba_15_m4_sk-bl.png" alt="MacBook Air" className="product-image" draggable={false} />
            ) : selectedOptions.color === "Silver" ? (
              <img src="../assets/mba_15_m3_sil.png" alt="MacBook Air" className="product-image" draggable={false} />
            ) : selectedOptions.color === "Starlight" ? (
              <img src="../assets/mba_15_m3_stl.png" alt="MacBook Air" className="product-image" draggable={false} />
            ) : (
              <img src="../assets/mba_15_m3_mid.png" alt="MacBook Air" className="product-image" draggable={false} />
            )}
          </div>

          <div className="cto-spec-selection">
            <div className="cto-sticky-header">
              <h1 className="cto-title">MacBook Air {selectedOptions.screenSize}"</h1>
              <div className="cto-price-row">
                {loadingPrice ? (
                  <p className="cto-price">...</p>
                ) : totalPrice ? (
                  <p className="cto-price">{formatPriceISK(totalPrice)}</p>
                ) : (
                  <p className="cto-price">Verð ekki tiltækt</p>
                )}
                <button onClick={() => setShowModal(true)} className="pdf-button">
                  Búa til PDF
                </button>
                {showModal && (
                  <div
                    onPointerDown={() => { setShowModal(false); setOrderNumber(""); }}
                    style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2147483647, pointerEvents: "auto" }}
                  >
                    <div
                      role="dialog"
                      aria-modal="true"
                      onPointerDown={(e) => e.stopPropagation()}
                      style={{ background: "white", padding: "2rem", borderRadius: "10px", width: "100%", maxWidth: "400px" }}
                    >
                      <h2 style={{ fontWeight: 900, marginBottom: "5px" }}>Sölupöntunarnúmer:</h2>
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
                      <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
                        <button
                          className="order-nr-pdf-button"
                          onClick={() => {
                            generatePdf(`Sérpöntun - MacBook Air ${selectedOptions.screenSize}"`, orderNumber);
                            setShowModal(false);
                            setOrderNumber("");
                          }}
                        >
                          Staðfesta
                        </button>
                        <button
                          className="order-nr-pdf-button"
                          onClick={() => { setShowModal(false); setOrderNumber(""); }}
                        >
                          Hætta við
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <Divider style={{ margin: "10px 0px 10px 0px" }} />
            </div>

            <p className="spec-title">Skjástærð</p>
            <div className="spec-selection-buttons">
              {["13", "15"].map((size) => (
                <button
                  key={size}
                  className={`filter-button-selection ${selectedOptions.screenSize === size ? "active" : ""}`}
                  onClick={() => handleSelection("screenSize", size)}
                >
                  {size}"
                </button>
              ))}
            </div>

            <p className="spec-title">Örgjörvi</p>
            <div className="spec-selection-buttons">
              <div
                className={`filter-button-processor ${selectedOptions.processor === "M5 chip with 10-core CPU, 8-core GPU" ? "active" : ""} ${
                  ["1TB", "2TB", "4TB"].includes(selectedOptions.storage) || selectedOptions.memory !== "16GB" || selectedOptions.screenSize === "15" ? "disabled" : ""
                }`}
                onClick={() => {
                  if (selectedOptions.screenSize !== "15" && !["1TB", "2TB", "4TB"].includes(selectedOptions.storage) && selectedOptions.memory === "16GB") {
                    handleSelection("processor", "M5 chip with 10-core CPU, 8-core GPU");
                  }
                }}
              >
                <img src="../assets/m5.svg" alt="M5 logo" className="button-processor-logo" />
                <p className="filter-button-processor-text">10-core CPU 8-core GPU</p>
              </div>
              <div
                className={`filter-button-processor ${selectedOptions.processor === "M5 chip with 10-core CPU, 10-core GPU" ? "active" : ""}`}
                onClick={() => handleSelection("processor", "M5 chip with 10-core CPU, 10-core GPU")}
              >
                <img src="../assets/m5.svg" alt="M5 logo" className="button-processor-logo" />
                <p className="filter-button-processor-text">10-core CPU 10-core GPU</p>
              </div>
            </div>

            <p className="spec-title">Geymsla</p>
            <div className="spec-selection-buttons">
              {[
                { label: "512GB", value: "512GB", available: true },
                { label: "1TB",   value: "1TB",   available: selectedOptions.processor === "M5 chip with 10-core CPU, 10-core GPU" },
                { label: "2TB",   value: "2TB",   available: selectedOptions.processor === "M5 chip with 10-core CPU, 10-core GPU" },
                { label: "4TB",   value: "4TB",   available: selectedOptions.processor === "M5 chip with 10-core CPU, 10-core GPU" },
              ].filter((o) => o.available).map(({ label, value }) => (
                <button
                  key={value}
                  className={`filter-button-selection ${selectedOptions.storage === value ? "active" : ""}`}
                  onClick={() => handleSelection("storage", value)}
                >
                  {label}
                </button>
              ))}
            </div>

            <p className="spec-title">Vinnsluminni</p>
            <div className="spec-selection-buttons">
              {[
                { label: "16GB", value: "16GB", available: true },
                { label: "24GB", value: "24GB", available: selectedOptions.processor === "M5 chip with 10-core CPU, 10-core GPU" },
                { label: "32GB", value: "32GB", available: selectedOptions.processor === "M5 chip with 10-core CPU, 10-core GPU" },
              ].filter((o) => o.available).map(({ label, value }) => (
                <button
                  key={value}
                  className={`filter-button-selection ${selectedOptions.memory === value ? "active" : ""}`}
                  onClick={() => handleSelection("memory", value)}
                >
                  {label}
                </button>
              ))}
            </div>

            <p className="spec-title">Litur</p>
            <div className="spec-selection-buttons">
              {[
                { label: "Sky Blue", value: "Sky Blue", swatch: "#5fa5d5" },
                { label: "Silver", value: "Silver", swatch: "#e8e8ed" },
                { label: "Starlight", value: "Starlight", swatch: "#f2ede4" },
                { label: "Midnight", value: "Midnight", swatch: "#1c2332" },
              ].map(({ label, value, swatch }) => (
                <button
                  key={value}
                  className={`color-swatch-button ${selectedOptions.color === value ? "active" : ""}`}
                  onClick={() => handleSelection("color", value)}
                >
                  <span className="color-dot" style={{ backgroundColor: swatch }} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="product-spec-section">
            <p className="spec-list-title">Tæknilegar upplýsingar</p>
            <div className="spec-list">
              <div className="spec-row">
                <span className="spec-row-label">Skjár</span>
                <span className="spec-row-value">{selectedOptions.screenSize === "13" ? '13"' : '15"'} Retina</span>
              </div>
              <div className="spec-row">
                <span className="spec-row-label">Örgjörvi</span>
                <span className="spec-row-value">{selectedOptions.processor}</span>
              </div>
              <div className="spec-row">
                <span className="spec-row-label">Geymsla</span>
                <span className="spec-row-value">{selectedOptions.storage} SSD</span>
              </div>
              <div className="spec-row">
                <span className="spec-row-label">Minni</span>
                <span className="spec-row-value">{selectedOptions.memory} Unified</span>
              </div>
              <div className="spec-row">
                <span className="spec-row-label">Litur</span>
                <span className="spec-row-value">{selectedOptions.color}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SignedIn>
  );
}

export default MacbookAir;
