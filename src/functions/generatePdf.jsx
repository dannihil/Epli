import React from "react";
import { jsPDF } from "jspdf";

const generatePdf = (title, selectedOptions, totalPrice, formatPriceISK) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Add image based on screen size and color
  let imageSrc = "";
  if (
    selectedOptions.screenSize === "16" &&
    selectedOptions.color === "Space Black"
  ) {
    imageSrc = "../assets/mbp_16_SB.png";
  } else if (
    selectedOptions.screenSize === "16" &&
    selectedOptions.color === "Silver"
  ) {
    imageSrc = "../assets/mbp_16_SL.png";
  } else if (
    selectedOptions.screenSize === "14" &&
    selectedOptions.color === "Space Black"
  ) {
    imageSrc = "../assets/mbp_14_SB.png";
  } else if (
    selectedOptions.screenSize === "14" &&
    selectedOptions.color === "Silver"
  ) {
    imageSrc = "../assets/mbp_14_SL.png";
  }

  // Title
  doc.setFontSize(25);
  doc.setFont("georgia", "bold");
  doc.text("Sérpöntun - MacBook Pro", 60, 15);
  doc.line(58, 20, pageWidth - 50, 20);

  // Config info
  let xPosition = 105;
  let yPosition = 40;
  doc.setFontSize(15);
  doc.setFont("georgia", "bold");
  doc.text("Tæknilegar upplýsingar", xPosition, yPosition);
  yPosition += 10;
  doc.setFontSize(12);
  doc.setFont("georgia", "normal");
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
  doc.text(`Skjár: ${selectedOptions.display}`, xPosition, yPosition);
  yPosition += 7;
  doc.text(`Aukahlutir: ${selectedOptions.accessories}`, xPosition, yPosition);

  // Price
  yPosition += 20;
  doc.line(140, 98, pageWidth - 20, 98);
  doc.setFont("georgia", "bold");
  doc.text("Samtals verð með VSK:", 145, yPosition);
  doc.setFont("georgia", "normal");
  yPosition += 7;
  doc.text(`${formatPriceISK(totalPrice)}`, 170, yPosition);

  // Terms
  yPosition += 80;
  doc.line(10, 182, pageWidth - 10, 182);
  doc.setFont("georgia", "bold");
  doc.text(
    "Afgreiðslutími sérpanta getur verið allt að 6-8 vikur frá degi pöntunar.",
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
  doc.line(10, 215, pageWidth - 10, 215);

  // Footer
  doc.addImage("../assets/epli-logo-black.png", "PNG", 30, 208, 150, 100);
  doc.line(65, 285, pageWidth - 65, 285);
  doc.text("Laugavegur 182 - Smáralind - epli.is", 73, 290);

  // Save
  doc.save(`${title}.pdf`);
};

export default generatePdf;
