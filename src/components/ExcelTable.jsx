import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import "../css/ExcelTable.css";
import { FaX } from "react-icons/fa6";

const ExcelTable = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState(""); // New state for search input
  const skuMap = {
    "MU9D3ZE/A": "Z1CF",
    "MCX44ZE/A": "Z1JV",
    "MCYT4ZE/A": "Z1JX",
    "MU9E3ZE/A": "Z1CG",
  };

  // Filter function based on selected LOB
  const filterDataByLOB = (lob) => {
    setActiveFilter(lob);
    setSearchTerm(""); // Reset search bar
    const newFilteredData =
      lob === "All" ? data : data.filter((row) => row.lob === lob);
    setFilteredData(newFilteredData);
  };

  // Load and process Excel data
  useEffect(() => {
    fetch("/data.xlsx") // Replace with actual path
      .then((response) => response.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const workbook = XLSX.read(e.target.result, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
          const processedData = sheet
            .map((row) => {
              const excelDate = row["Estimated Delivery Date on or before"];
              let formattedDate = "N/A";
              if (excelDate) {
                const date = new Date((excelDate - 25569) * 86400000);
                formattedDate = date.toLocaleDateString("en-GB"); // dd/mm/yyyy format
              }
              return {
                orderNumber: row["Customer PO Number"],
                appleOrderNumber: row["Apple Sales Order Number"],
                partNumber: row["Apple Part #"],
                description: row["Apple Part Description"],
                orderQty: row["Order Quantity"],
                deliveredQty: row["Delivered Quantity"],
                inTransit: row["In-Transit"],
                remainingQty: row["Remaining Quantity"],
                status: row["Shipping Status"],
                estimatedDelivery: formattedDate,
                lob: row["LOB"],
              };
            })
            .filter((row) => row.inTransit >= 1);

          setData(processedData);
          setFilteredData(processedData);
        };
        reader.readAsBinaryString(blob);
      });
  }, []);

  // Search filter logic
  const displayedData = filteredData.filter((row) => {
    const mappedPartNumber = skuMap[row.partNumber] || row.partNumber;

    return Object.values({
      ...row,
      partNumber: mappedPartNumber, // Use mapped value for search
    }).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="p-6">
      {/* LOB Filter Buttons */}
      <div className="filter-buttons-and-search-bar">
        <div className="filter-buttons">
          {[
            "All",
            "Mac",
            "iPhone",
            "iPad",
            "Watch",
            "AirPods",
            "Accessories",
          ].map((lob) => (
            <button
              key={lob}
              className={`filter-button ${
                activeFilter === lob ? "active" : ""
              }`}
              onClick={() => filterDataByLOB(lob)}
            >
              {lob}
            </button>
          ))}
        </div>
        <div className="search-container">
          <input
            type="text"
            className="search-bar"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <FaX className="search-x" onClick={() => setSearchTerm("")} />
          )}
        </div>
      </div>
      <div className="table-container-2">
        <TableContainer component={Paper} className="table-container">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className="sticky-header">
                  <p style={{ fontWeight: "bold" }}>Purchase Order #</p>
                </TableCell>
                <TableCell className="sticky-header">
                  <p style={{ fontWeight: "bold" }}>Apple Order #</p>
                </TableCell>
                <TableCell className="sticky-header">
                  <p style={{ fontWeight: "bold" }}>Part #</p>
                </TableCell>
                <TableCell className="sticky-header">
                  <p style={{ fontWeight: "bold" }}>Description</p>
                </TableCell>
                <TableCell className="sticky-header">
                  <p style={{ fontWeight: "bold" }}>Order Qty</p>
                </TableCell>
                <TableCell className="sticky-header">
                  <p style={{ fontWeight: "bold" }}>Delivered</p>
                </TableCell>
                <TableCell className="sticky-header">
                  <p style={{ fontWeight: "bold" }}>In Transit</p>
                </TableCell>
                <TableCell className="sticky-header">
                  <p style={{ fontWeight: "bold" }}>Remaining</p>
                </TableCell>
                <TableCell className="sticky-header">
                  <p style={{ fontWeight: "bold" }}>Status</p>
                </TableCell>
                <TableCell className="sticky-header">
                  <p style={{ fontWeight: "bold" }}>Estimated Delivery</p>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="sticky-cell">
                    {row.appleOrderNumber}
                  </TableCell>
                  <TableCell className="sticky-cell">
                    {row.orderNumber}
                  </TableCell>
                  <TableCell className="sticky-cell">
                    {skuMap[row.partNumber] || row.partNumber}
                  </TableCell>

                  <TableCell className="sticky-cell">
                    {row.description}
                  </TableCell>
                  <TableCell className="sticky-cell">{row.orderQty}</TableCell>
                  <TableCell className="sticky-cell">
                    {row.deliveredQty}
                  </TableCell>
                  <TableCell className="sticky-cell">{row.inTransit}</TableCell>
                  <TableCell className="sticky-cell">
                    {row.remainingQty}
                  </TableCell>
                  <TableCell className="sticky-cell">{row.status}</TableCell>
                  <TableCell className="sticky-cell">
                    {row.estimatedDelivery}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};

export default ExcelTable;
