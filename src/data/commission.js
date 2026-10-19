// Söluþóknun — reglur sem birtast á /soluthoknun.
// Breyttu hér ef upphæðir eða aukahlutaflokkar breytast.

export const COMMISSION_PER_ACCESSORY = 400; // kr. per aukahlut
export const MONTHLY_COMMISSION_CAP = 50000; // kr. hámark á tímabili
// Þóknunartímabil: frá 21. hvers mánaðar til 20. næsta mánaðar.
export const COMMISSION_PERIOD_START_DAY = 21;

// Aðalflokkar. Þóknun fæst fyrir aukahluti úr `accessories` sem seldir eru
// í sömu færslu og tæki úr viðkomandi flokki.
export const COMMISSION_CATEGORIES = [
  {
    id: "iphone",
    name: "iPhone",
    accessories: [
      "Hulstur & skjáfilmur",
      "Hleðslutæki",
      "Snúrur og breytistykki",
    ],
  },
  {
    id: "ipad",
    name: "iPad",
    accessories: [
      "Hulstur & skjáfilmur",
      "Hleðslutæki",
      "Snúrur og breytistykki",
      "Apple Pencil og Magic Keyboard",
    ],
  },
  {
    id: "mac",
    name: "Mac",
    accessories: [
      "Hleðslutæki",
      "Snúrur og millistykki",
      "Mýs og lyklaborð",
      "Töskur / Sleeve",
    ],
  },
  {
    id: "watch",
    name: "Apple Watch",
    accessories: ["Ólar", "Hleðslutæki og hleðslusnúrur"],
  },
];
