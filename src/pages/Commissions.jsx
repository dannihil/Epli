import React, { useState } from "react";

function Commissions() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const tryggingarBonuses = [
    {
      product: "iPhone",
      months: ["6 mán", "12 mán"],
      bonus: ["2.000", "3.000"],
    },
    {
      product: "iPad",
      months: ["12 mán", "24 mán"],
      bonus: ["2.000", "3.000"],
    },
    {
      product: "iMac og Mac mini",
      months: ["36 mán", "48 mán"],
      bonus: ["3.000", "5.000"],
    },
    {
      product: "MacBook Air og MacBook Pro",
      months: ["24 mán", "36 mán"],
      bonus: ["3.000", "5.000"],
    },
    {
      product: "Watch",
      months: ["12 mán", "24 mán"],
      bonus: ["2.000", "3.000"],
    },
    {
      product: "Headset",
      months: ["6 mán", "12 mán", "24 mán"],
      bonus: ["1.000", "2.000", "3.000"],
    },
  ];

  const computerBonuses = {
    "MacBook Air": {
      A: ["MacBook Air M1 2020"],
      B: ["MacBook Air M2 2022"],
      C: ["MacBook Air M3 2024"],
    },
    "MacBook Pro": {
      A: ["MacBook Pro 13” Intel"],
      B: ["MacBook Pro 14” M1"],
      C: ["MacBook Pro 16” M3"],
    },
    iMac: {
      A: ["iMac 21.5” Intel"],
      B: ["iMac 24” M1"],
      C: ["iMac 27” M3 Pro"],
    },
    "Mac mini": {
      A: ["Mac mini Intel"],
      B: ["Mac mini M1"],
      C: ["Mac mini M2 Pro"],
    },
    "Mac Studio": {
      A: ["Mac Studio M1 Max"],
      B: ["Mac Studio M2 Max"],
      C: ["Mac Studio M2 Ultra"],
    },
  };

  return (
    <div style={{ marginTop: "100px", padding: "20px" }}>
      <h2>Sölubónusar</h2>

      <ul style={{ listStyle: "none", padding: 0 }}>
        <li
          onClick={() => setSelectedCategory("Tryggingar")}
          style={listItemStyle(selectedCategory === "Tryggingar")}
        >
          Tryggingar
        </li>
        <li
          onClick={() => setSelectedCategory("Tölvur")}
          style={listItemStyle(selectedCategory === "Tölvur")}
        >
          Tölvur
        </li>
      </ul>

      {/* Tryggingar Table */}
      {selectedCategory === "Tryggingar" && (
        <div style={{ marginTop: "20px" }}>
          <h3>Tryggingar</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Vara</th>
                <th style={thStyle}>Tímalengd</th>
                <th style={thStyle}>Bónus</th>
              </tr>
            </thead>
            <tbody>
              {tryggingarBonuses.map((item, idx) => (
                <tr key={idx}>
                  <td style={tdStyle}>{item.product}</td>
                  <td style={tdStyle}>
                    {item.months.map((m, i) => (
                      <div key={i}>{m}</div>
                    ))}
                  </td>
                  <td style={tdStyle}>
                    {item.bonus.map((b, i) => (
                      <div key={i}>{b} kr.</div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tölvur (All Computers) Table */}
      {selectedCategory === "Tölvur" && (
        <div style={{ marginTop: "20px" }}>
          <h3>Tölvur</h3>
          {Object.keys(computerBonuses).map((productName) => (
            <div key={productName} style={{ marginBottom: "30px" }}>
              <h4>{productName}</h4>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Flokkur</th>
                    <th style={thStyle}>Tegundir</th>
                    <th style={thStyle}>Bónus</th>
                  </tr>
                </thead>
                <tbody>
                  {["A", "B", "C"].map((category) => (
                    <tr key={category}>
                      <td style={tdStyle}>{category}</td>
                      <td style={tdStyle}>
                        {computerBonuses[productName][category].map(
                          (model, i) => (
                            <div key={i}>{model}</div>
                          )
                        )}
                      </td>
                      <td style={tdStyle}>
                        {category === "A" && "0 kr."}
                        {category === "B" && "2.000 kr."}
                        {category === "C" && "5.000 kr."}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const thStyle = {
  borderBottom: "2px solid #ccc",
  padding: "10px",
  textAlign: "left",
  backgroundColor: "#f5f5f5",
};

const tdStyle = {
  padding: "10px",
  verticalAlign: "top",
  borderBottom: "1px solid #eee",
};

const listItemStyle = (isActive) => ({
  cursor: "pointer",
  marginBottom: "10px",
  color: isActive ? "#0070f3" : "#000",
  fontWeight: isActive ? "bold" : "normal",
});

export default Commissions;
