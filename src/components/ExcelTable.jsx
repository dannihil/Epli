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
import { skuMap } from "../data/skuMap";
import { descriptionOverride } from "../data/descriptionOverride";

const ExcelTable = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState(""); // New state for search input

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
    const mappedDescription =
      descriptionOverride[row.partNumber] || row.description;

    return Object.values({
      ...row,
      partNumber: mappedPartNumber, // Use mapped value for search
      description: mappedDescription, // Use overridden description for searching
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
                  <p className="sticky-header-text">Apple Order #</p>
                </TableCell>
                <TableCell className="sticky-header">
                  <p className="sticky-header-text">Purchase Order #</p>
                </TableCell>
                <TableCell className="sticky-header">
                  <p className="sticky-header-text">Part #</p>
                </TableCell>
                <TableCell className="sticky-header">
                  <p className="sticky-header-text">Description</p>
                </TableCell>
                <TableCell className="sticky-header">
                  <p className="sticky-header-text">Order Qty</p>
                </TableCell>
                <TableCell className="sticky-header">
                  <p className="sticky-header-text">Delivered</p>
                </TableCell>
                <TableCell className="sticky-header">
                  <p className="sticky-header-text">In Transit</p>
                </TableCell>
                <TableCell className="sticky-header">
                  <p className="sticky-header-text">Remaining</p>
                </TableCell>
                <TableCell className="sticky-header">
                  <p className="sticky-header-text">Status</p>
                </TableCell>
                <TableCell className="sticky-header">
                  <p className="sticky-header-text">Estimated Delivery</p>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="sticky-cell">
                    <p className="sticky-cell-text">{row.appleOrderNumber}</p>
                  </TableCell>
                  <TableCell className="sticky-cell">
                    <p className="sticky-cell-text">{row.orderNumber}</p>
                  </TableCell>
                  <TableCell className="sticky-cell">
                    <p className="sticky-cell-text">
                      {skuMap[row.partNumber] || row.partNumber}
                    </p>
                  </TableCell>
                  <TableCell className="sticky-cell">
                    <p className="sticky-cell-text">
                      {descriptionOverride[row.partNumber] || row.description}
                    </p>
                  </TableCell>
                  <TableCell className="sticky-cell">
                    <p className="sticky-cell-text">{row.orderQty}</p>
                  </TableCell>
                  <TableCell className="sticky-cell">
                    <p className="sticky-cell-text">{row.deliveredQty}</p>
                  </TableCell>
                  <TableCell className="sticky-cell">
                    <p className="sticky-cell-text">{row.inTransit}</p>
                  </TableCell>
                  <TableCell className="sticky-cell">
                    <p className="sticky-cell-text">{row.remainingQty}</p>
                  </TableCell>
                  <TableCell className="sticky-cell">
                    <p className="sticky-cell-text">{row.status}</p>
                  </TableCell>
                  <TableCell className="sticky-cell">
                    <p className="sticky-cell-text">{row.estimatedDelivery}</p>
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
