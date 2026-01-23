const fs = require("fs");
const path = require("path");

const dateNow = new Date().toLocaleString("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});
const timeNow = new Date().toLocaleString("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
});

const fileContent = `export const buildDate = "${dateNow}, kl ${timeNow}";\n`;

fs.writeFileSync(path.join(__dirname, "../buildInfo.js"), fileContent);

console.log("Build timestamp:", dateNow, ", kl:", timeNow);
