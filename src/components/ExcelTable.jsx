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
import { FaSearch, FaDownload } from "react-icons/fa";
import { skuMap, skuMapFromIdentifier } from "../data/skuMap";
import {
  descriptionOverride,
  descriptionOverrideFromIdentifier,
} from "../data/descriptionOverride";

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import PatchNotesModal from "../functions/patchNotesModal";
import { buildDate } from "../../buildInfo";
import { Snackbar, Alert, CircularProgress } from "@mui/material";

const ExcelTable = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  // Filter function
  const filterDataByLOB = (lob) => {
    setActiveFilter(lob);
    setSearchTerm("");
    const newFilteredData =
      lob === "All" ? data : data.filter((row) => row.lob === lob);
    setFilteredData(newFilteredData);
  };

  const [exporting, setExporting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Load Excel
  useEffect(() => {
    fetch("/data.xlsx")
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
                formattedDate = date.toLocaleDateString("en-GB");
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
                productIdentifier: row["Product Configuration Identifier"],
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

  // Sorting function
  const handleSort = (key) => {
    if (sortConfig.key === key) {
      if (sortConfig.direction === "ascending") {
        setSortConfig({ key, direction: "descending" });
      } else if (sortConfig.direction === "descending") {
        setSortConfig({ key: null, direction: "ascending" }); // reset
      }
    } else {
      setSortConfig({ key, direction: "ascending" });
    }
  };

  // Prepare sorted and filtered data
  const sortedData = [...filteredData]
    .map((row) => {
      let mappedPartNumber = skuMap[row.partNumber] || row.partNumber;
      let mappedDescription =
        descriptionOverride[row.partNumber] || row.description;

      if (
        row.productIdentifier &&
        skuMapFromIdentifier[row.productIdentifier]
      ) {
        mappedPartNumber = skuMapFromIdentifier[row.productIdentifier];
      }

      if (
        row.productIdentifier &&
        descriptionOverrideFromIdentifier[row.productIdentifier]
      ) {
        mappedDescription =
          descriptionOverrideFromIdentifier[row.productIdentifier];
      }

      return {
        ...row,
        partNumber: mappedPartNumber,
        description: mappedDescription,
      };
    })
    .filter((row) =>
      Object.values(row).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

  if (sortConfig.key) {
    sortedData.sort((a, b) => {
      const aVal = a[sortConfig.key] ?? "";
      const bVal = b[sortConfig.key] ?? "";
      const aStr = typeof aVal === "string" ? aVal.toLowerCase() : aVal;
      const bStr = typeof bVal === "string" ? bVal.toLowerCase() : bVal;
      if (aStr < bStr) return sortConfig.direction === "ascending" ? -1 : 1;
      if (aStr > bStr) return sortConfig.direction === "ascending" ? 1 : -1;
      return 0;
    });
  }

  // Export to Excel
  const exportToExcel = async () => {
    try {
      setExporting(true);

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Filtered Data");

      const headers = [
        "Apple Order #",
        "Purchase Order #",
        "LOB",
        "Part #",
        "Description",
        "Order Qty",
        "Delivered",
        "In Transit",
        "Remaining",
        "Status",
        "Estimated Delivery",
      ];

      const headerRow = worksheet.addRow(headers);

      // ✅ ORIGINAL HEADER STYLING (UNCHANGED)
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 15 };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "4d77b1" },
        };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      sortedData.forEach((row) => {
        worksheet.addRow([
          row.appleOrderNumber,
          row.orderNumber,
          row.lob,
          row.partNumber,
          row.description,
          row.orderQty,
          row.deliveredQty,
          row.inTransit,
          row.remainingQty,
          row.status,
          row.estimatedDelivery,
        ]);
      });

      // ✅ ORIGINAL AUTO-COLUMN WIDTH (UNCHANGED)
      worksheet.columns.forEach((column) => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          maxLength = Math.max(
            maxLength,
            cell.value ? cell.value.toString().length : 0
          );
        });
        column.width = maxLength + 5;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(blob, "stada-sendinga-EpliPortal.xlsx");

      // ⭐ SUCCESS FEEDBACK
      setSnackbar({
        open: true,
        severity: "success",
        message: `Exported ${sortedData.length} rows successfully 🎉`,
      });
    } catch (error) {
      // ❌ ERROR FEEDBACK
      setSnackbar({
        open: true,
        severity: "error",
        message: "Export failed. Please try again.",
      });
    } finally {
      setExporting(false);
    }
  };

  const toggleSearch = () => {
    if (searchActive) {
      setSearchTerm("");
    }
    setSearchActive(!searchActive);
  };

  return (
    <div>
      <PatchNotesModal />
      <p
        style={{
          fontSize: "20px",
          fontWeight: "600",
          marginTop: 90,
          marginBottom: 10,
          textAlign: "left",
        }}
      >
        Gögn uppfærð: {buildDate.replaceAll("/", ".")}
      </p>
      <div
        className="filter-buttons-and-search-bar"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginTop: 40,
          marginBottom: 20,
        }}
      >
        <div className="filter-buttons">
          {[
            "All",
            "Mac",
            "iPhone",
            "iPad",
            "Watch",
            "AirPods",
            "Beats",
            "Home",
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
        {/*<button
          onClick={toggleSearch}
          aria-label="Toggle search"
          style={{ cursor: "pointer", background: "none", border: "none" }}
        >
          <FaSearch size={20} />
        </button>*/}
        <div style={{ display: "flex", justifyContent: "center" }}>
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
          <button
            onClick={exportToExcel}
            aria-label="Export to Excel"
            disabled={exporting}
            className="export-icon-button"
          >
            {exporting ? (
              <CircularProgress size={18} />
            ) : (
              <FaDownload size={20} />
            )}
          </button>
        </div>
      </div>

      <div className="table-container-2">
        <TableContainer component={Paper} className="table-container">
          <Table>
            <TableHead>
              <TableRow>
                {[
                  { label: "Apple Order #", key: "appleOrderNumber" },
                  { label: "Purchase Order #", key: "orderNumber" },
                  { label: "Part #", key: "partNumber" },
                  { label: "Description", key: "description" },
                  { label: "Order Qty", key: "orderQty" },
                  { label: "Delivered", key: "deliveredQty" },
                  { label: "In Transit", key: "inTransit" },
                  { label: "Remaining", key: "remainingQty" },
                  { label: "Status", key: "status" },
                  { label: "Estimated Delivery", key: "estimatedDelivery" },
                ].map(({ label, key }) => (
                  <TableCell
                    key={key}
                    className="sticky-header"
                    onClick={() => handleSort(key)}
                    style={{ cursor: "pointer" }}
                  >
                    <p className="sticky-header-text">
                      {label}
                      {sortConfig.key === key && (
                        <span style={{ marginLeft: 4 }}>
                          {sortConfig.direction === "ascending" ? "▲" : "▼"}
                        </span>
                      )}
                    </p>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="sticky-cell">
                    <p className="sticky-cell-text">{row.appleOrderNumber}</p>
                  </TableCell>
                  <TableCell className="sticky-cell">
                    <p className="sticky-cell-text">{row.orderNumber}</p>
                  </TableCell>
                  <TableCell className="sticky-cell">
                    <p className="sticky-cell-text">{row.partNumber}</p>
                  </TableCell>
                  <TableCell className="sticky-cell">
                    <p className="sticky-cell-text">{row.description}</p>
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
                    <span
                      className={`status-pill ${
                        row.status === "Delivered"
                          ? "status-delivered"
                          : row.status === "Shipment Delay"
                          ? "status-delayed"
                          : "status-default"
                      }`}
                    >
                      {row.status}
                    </span>
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
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ExcelTable;
