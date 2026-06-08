import React, { useState, useEffect } from "react";
import "../../css/CtoProduct.css";
import Divider from "@mui/material/Divider";
import { jsPDF } from "jspdf";
import { SignedIn, useUser } from "@clerk/clerk-react";
import PatchNotesModal from "../../functions/patchNotesModal";
import { supabase } from "../../lib/supabase";

const PRODUCT_ID = "aaaaaaaa-0005-0000-0000-000000000000";
const chipMap = {
  "M4 chip with 10-core CPU, 10-core GPU": "m4_10_10",
  "M4 Pro chip with 12-core CPU, 16-core GPU": "m4pro_12_16",
  "M4 Pro chip with 14-core CPU, 20-core GPU": "m4pro_14_20",
};

function MacMini() {
  const [date, setDate] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const user = useUser();

  useEffect(() => {
    setDate(new Date().toLocaleDateString("en-GB"));
    const interval = setInterval(() => {
      setDate(new Date().toLocaleDateString("en-GB"));
    }, 1000);
    return () => clearInterval(interval);
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

  const [basePrice, setBasePrice] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(false);

  const [selectedOptions, setSelectedOptions] = useState({
    processor: "M4 chip with 10-core CPU, 10-core GPU",
    storage: "512GB",
    memory: "16GB",
    ethernet: "Gigabit Ethernet",
  });

  useEffect(() => {
    const { processor, storage, memory } = selectedOptions;
    const chip = chipMap[processor];
    if (!chip) { setBasePrice(null); return; }
    setLoadingPrice(true);
    supabase
      .from("configuration")
      .select("price_isk")
      .eq("product_id", PRODUCT_ID)
      .eq("chip", chip)
      .eq("storage", storage.toLowerCase())
      .eq("memory", memory.toLowerCase())
      .single()
      .then(({ data, error }) => {
        setBasePrice(error || !data ? null : data.price_isk);
        setLoadingPrice(false);
      });
  }, [selectedOptions]);

  const ethernetMod = selectedOptions.ethernet === "10 Gigabit Ethernet" ? 20000 : 0;
  const totalPrice = basePrice !== null ? basePrice + ethernetMod : null;

  const formatPriceISK = (price) => {
    const formattedPrice = price.toLocaleString("is-IS");
    return formattedPrice.replace(/,/g, ".") + "kr";
  };

  const handleSelection = (category, option) => {
    setSelectedOptions((prev) => {
      let newSelection = { ...prev, [category]: option };
      if (category === "processor" && option === "M4 chip with 10-core CPU, 10-core GPU") {
        newSelection.storage = "512GB";
        newSelection.memory = "16GB";
      }
      if (
        (category === "processor" && option === "M4 Pro chip with 12-core CPU, 16-core GPU") ||
        (category === "processor" && option === "M4 Pro chip with 14-core CPU, 20-core GPU")
      ) {
        newSelection.storage = "512GB";
        newSelection.memory = "24GB";
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

    const [base64Image, logoBase64] = await Promise.all([
      getBase64Image("../assets/mac_mini.png"),
      getBase64Image("../assets/epli-logo-black.png"),
    ]);

    const logoRatio = 52.5 / 80;

    // ── Header ───────────────────────────────────────
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
    doc.text("Mac mini", W - m, 22, { align: "right" });

    doc.setDrawColor(210, 210, 210);
    doc.line(m, 30, W - m, 30);

    // ── Meta ─────────────────────────────────────────
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

    // ── Product image ────────────────────────────────
    const imgX = m;
    const imgY = 62;
    const imgW = 82;
    const imgH = 68;
    doc.setFillColor(245, 245, 247);
    doc.roundedRect(imgX, imgY, imgW, imgH, 5, 5, "F");
    doc.addImage(base64Image, "PNG", imgX + 3, imgY + 3, imgW - 6, imgH - 6);

    // ── Spec table ───────────────────────────────────
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
      ["Örgjörvi", selectedOptions.processor],
      ["Geymsla", `${selectedOptions.storage} SSD`],
      ["Vinnsluminni", `${selectedOptions.memory} Unified`],
      ["Ethernet", selectedOptions.ethernet],
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

    // ── Price ─────────────────────────────────────────
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
    doc.text(totalPrice !== null ? formatPriceISK(totalPrice) : "Verð ekki tiltækt", W - m - 1, y, { align: "right" });

    // ── Section divider ───────────────────────────────
    doc.setDrawColor(220, 220, 220);
    doc.line(m, 150, W - m, 150);

    // ── Terms ─────────────────────────────────────────
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

    // ── Signature ─────────────────────────────────────
    const sigY = 218;
    doc.setDrawColor(170, 170, 170);
    doc.line(m, sigY, m + 85, sigY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(130, 130, 130);
    doc.text("Undirskrift (staðfesting á pöntun)", m, sigY + 5);

    // ── Footer ────────────────────────────────────────
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

    // ── Save ──────────────────────────────────────────
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
            <img
              src="../assets/mac_mini.png"
              alt="Mac mini"
              className="product-image"
              draggable={false}
            />
          </div>

          <div className="cto-spec-selection">
            <div className="cto-sticky-header">
              <h1 className="cto-title">Mac mini</h1>
              <div className="cto-price-row">
                <p className="cto-price">
                  {loadingPrice ? "..." : totalPrice !== null ? formatPriceISK(totalPrice) : "Verð ekki tiltækt"}
                </p>
                <button onClick={() => setShowModal(true)} className="pdf-button">
                  Búa til PDF
                </button>
                {showModal && (
                  <div
                    onPointerDown={() => { setShowModal(false); setOrderNumber(""); }}
                    style={{
                      position: "fixed",
                      inset: 0,
                      backgroundColor: "rgba(0,0,0,0.4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 2147483647,
                      pointerEvents: "auto",
                    }}
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
                            generatePdf(`Sérpöntun - Mac mini`, orderNumber);
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

            <p className="spec-title">Örgjörvi</p>
            <div className="spec-selection-buttons">
              <div
                className={`filter-button-processor ${selectedOptions.processor === "M4 chip with 10-core CPU, 10-core GPU" ? "active" : ""}`}
                onClick={() => handleSelection("processor", "M4 chip with 10-core CPU, 10-core GPU")}
              >
                <img src="../assets/m4.svg" alt="M4 logo" className="button-processor-logo" />
                <p className="filter-button-processor-text">10-core CPU 10-core GPU</p>
              </div>
              <div
                className={`filter-button-processor ${selectedOptions.processor === "M4 Pro chip with 12-core CPU, 16-core GPU" ? "active" : ""}`}
                onClick={() => handleSelection("processor", "M4 Pro chip with 12-core CPU, 16-core GPU")}
              >
                <img src="../assets/m4pro.svg" alt="M4 Pro logo" className="button-processor-logo" />
                <p className="filter-button-processor-text">12-core CPU 16-core GPU</p>
              </div>
              <div
                className={`filter-button-processor ${selectedOptions.processor === "M4 Pro chip with 14-core CPU, 20-core GPU" ? "active" : ""}`}
                onClick={() => handleSelection("processor", "M4 Pro chip with 14-core CPU, 20-core GPU")}
              >
                <img src="../assets/m4pro.svg" alt="M4 Pro logo" className="button-processor-logo" />
                <p className="filter-button-processor-text">14-core CPU 20-core GPU</p>
              </div>
            </div>

            <p className="spec-title">Geymsla</p>
            <div className="spec-selection-buttons">
              {[
                { label: "512GB", value: "512GB", available: true },
                { label: "1TB",   value: "1TB",   available: true },
                { label: "2TB",   value: "2TB",   available: true },
                { label: "4TB",   value: "4TB",   available: selectedOptions.processor !== "M4 chip with 10-core CPU, 10-core GPU" },
                { label: "8TB",   value: "8TB",   available: selectedOptions.processor !== "M4 chip with 10-core CPU, 10-core GPU" },
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
                { label: "16GB", value: "16GB", available: selectedOptions.processor === "M4 chip with 10-core CPU, 10-core GPU" },
                { label: "24GB", value: "24GB", available: true },
                { label: "48GB", value: "48GB", available: selectedOptions.processor !== "M4 chip with 10-core CPU, 10-core GPU" },
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

            <p className="spec-title">Ethernet</p>
            <div className="spec-selection-buttons">
              {["Gigabit Ethernet", "10 Gigabit Ethernet"].map((opt) => (
                <button
                  key={opt}
                  className={`filter-button-selection ${selectedOptions.ethernet === opt ? "active" : ""}`}
                  onClick={() => handleSelection("ethernet", opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="product-spec-section">
            <p className="spec-list-title">Tæknilegar upplýsingar</p>
            <div className="spec-list">
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
                <span className="spec-row-label">Ethernet</span>
                <span className="spec-row-value">{selectedOptions.ethernet}</span>
              </div>
            </div>
            <p className="spec-list-title" style={{ marginTop: "20px" }}>Tengimöguleikar</p>
            <div className="spec-list">
              <div className="spec-row">
                <span className="spec-row-label">Front</span>
                <span className="spec-row-value">Two USB-C ports with support for USB 3 (up to 10Gb/s)</span>
              </div>
              <div className="spec-row">
                <span className="spec-row-label">Audio</span>
                <span className="spec-row-value">3.5 mm headphone jack</span>
              </div>
              {selectedOptions.processor === "M4 chip with 10-core CPU, 10-core GPU" ? (
                <>
                  <div className="spec-row">
                    <span className="spec-row-label">Back</span>
                    <span className="spec-row-value">Gigabit Ethernet port (configurable to 10Gb), HDMI port</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-row-label">Thunderbolt</span>
                    <span className="spec-row-value">Three Thunderbolt 4 ports (up to 40Gb/s)</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="spec-row">
                    <span className="spec-row-label">Back</span>
                    <span className="spec-row-value">Gigabit Ethernet port (configurable to 10Gb), HDMI port</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-row-label">Thunderbolt</span>
                    <span className="spec-row-value">Three Thunderbolt 5 ports (up to 120Gb/s)</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </SignedIn>
  );
}

export default MacMini;
