import React, { useState, useEffect, useRef } from "react";
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
import { FaDownload, FaUpload } from "react-icons/fa";
import { skuMap, skuMapFromIdentifier } from "../data/skuMap";
import {
  descriptionOverride,
  descriptionOverrideFromIdentifier,
} from "../data/descriptionOverride";

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import PatchNotesModal from "../functions/patchNotesModal";
import { Snackbar, Alert, CircularProgress } from "@mui/material";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../lib/supabase";

const BUCKET = "excel-data";
const FILE_PATH = "data.xlsx";

// Known shipping pipeline stages, earliest to latest. Statuses not in this
// list (or new ones Apple adds) safely fall back to "status-default".
const STATUS_STAGE_ORDER = [
  "order received",
  "in production",
  "shipment picked up",
  "origin airport terminal",
  "departed origin",
  "in transit",
  "final destination airport terminal",
  "released from customs at destination",
  "out for delivery",
];
const STATUS_STAGE_BUCKETS = 4;

function getStatusClass(status) {
  if (!status) return "status-default";
  const normalized = status.trim().toLowerCase();
  if (normalized === "delivered") return "status-delivered";
  if (normalized === "shipment delay") return "status-delayed";

  const stageIndex = STATUS_STAGE_ORDER.indexOf(normalized);
  if (stageIndex === -1) return "status-default";

  const bucket = Math.min(
    STATUS_STAGE_BUCKETS - 1,
    Math.floor((stageIndex / STATUS_STAGE_ORDER.length) * STATUS_STAGE_BUCKETS),
  );
  return `status-stage-${bucket}`;
}

const ExcelTable = () => {
  const { user, isLoaded } = useUser();
  const isAdmin = isLoaded && user?.publicMetadata?.role === "admin";

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [fileUpdatedAt, setFileUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const loadStartRef = useRef(null);
  const [uploadingExcel, setUploadingExcel] = useState(false);
  const uploadInputRef = useRef(null);

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

  function parseBlob(blob, updatedAt) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const workbook = XLSX.read(e.target.result, { type: "binary" });
      const sheetName = workbook.SheetNames[0];

      // Row 4 (index 3) contains "Data Refreshed: YYYY-MM-DD HH:MM:SS GMT"
      const rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 1,
      });
      const dataRefreshedCell = rawRows[3]?.[0];
      const dateMatch =
        typeof dataRefreshedCell === "string" &&
        dataRefreshedCell.match(/Data Refreshed:\s*(.+)/i);
      const sheetDate = dateMatch
        ? new Date(
            dateMatch[1]
              .trim()
              .replace(" ", "T")
              .replace(/\s*GMT\s*$/, "Z"),
          )
        : null;

      const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        range: 5,
      });
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
        .filter((row) => row.inTransit > 0);
      setData(processedData);
      setFilteredData(processedData);
      setFileUpdatedAt(sheetDate || (updatedAt ? new Date(updatedAt) : null));
      const elapsed = Date.now() - (loadStartRef.current ?? 0);
      setTimeout(() => setLoading(false), Math.max(0, 1000 - elapsed));
    };
    reader.readAsBinaryString(blob);
  }

  async function loadData() {
    loadStartRef.current = Date.now();
    setLoading(true);
    try {
      const { data: files } = await supabase.storage
        .from(BUCKET)
        .list("", { search: FILE_PATH });

      const updatedAt = files?.[0]?.updated_at ?? null;

      const { data: signedData, error: signedError } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(FILE_PATH, 300);

      if (signedError) throw signedError;

      const response = await fetch(signedData.signedUrl, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      parseBlob(blob, updatedAt);
    } catch (err) {
      console.error("Failed to load data from Supabase:", err);
      const elapsed = Date.now() - (loadStartRef.current ?? 0);
      setTimeout(() => setLoading(false), Math.max(0, 1000 - elapsed));
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleExcelUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingExcel(true);
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(FILE_PATH, file, { upsert: true });

    if (error) {
      setSnackbar({ open: true, severity: "error", message: "Upload failed." });
    } else {
      await loadData();
      setSnackbar({
        open: true,
        severity: "success",
        message: "Gögn uppfærð!",
      });
    }

    setUploadingExcel(false);
    e.target.value = "";
  }

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
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase()),
      ),
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
            cell.value ? cell.value.toString().length : 0,
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

  return (
    <div className="excel-table-root">
      <PatchNotesModal />
      {fileUpdatedAt
        ? (() => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const daysOld = Math.floor((today - fileUpdatedAt) / 86400000);
            const label = fileUpdatedAt
              .toLocaleString("is-IS", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
              .replace(/\//g, ".");
            return daysOld >= 2 ? (
              <div className="build-date stale">
                <span className="stale-icon">⚠️</span>
                <span>Gögn úrelt — uppfært {label} — þarf að endurnýja</span>
              </div>
            ) : (
              <div className="build-date fresh">
                <span className="fresh-dot" />
                <span>Gögn uppfærð: {label}</span>
              </div>
            );
          })()
        : null}
      <div className="filter-buttons-and-search-bar">
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
          ].map((lob) => {
            const count =
              lob === "All"
                ? data.length
                : data.filter((r) => r.lob === lob).length;
            return (
              <button
                key={lob}
                className={`filter-button ${activeFilter === lob ? "active" : ""} ${count === 0 ? "disabled" : ""}`}
                onClick={() => count > 0 && filterDataByLOB(lob)}
                disabled={count === 0}
              >
                {lob} <span className="filter-count">{count}</span>
              </button>
            );
          })}
        </div>
        {/*<button
          onClick={toggleSearch}
          aria-label="Toggle search"
          style={{ cursor: "pointer", background: "none", border: "none" }}
        >
          <FaSearch size={20} />
        </button>*/}
        <div className="search-and-export">
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

          {isAdmin && (
            <>
              <input
                ref={uploadInputRef}
                type="file"
                accept=".xlsx,.xls"
                style={{ display: "none" }}
                onChange={handleExcelUpload}
              />
              <button
                className="export-icon-button"
                aria-label="Upload new Excel"
                disabled={uploadingExcel}
                onClick={() => uploadInputRef.current?.click()}
                title="Hlaða upp nýjum gögnum (admin)"
              >
                {uploadingExcel ? (
                  <CircularProgress size={18} />
                ) : (
                  <FaUpload size={20} />
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {loading && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            height: 300,
            color: "#888",
          }}
        >
          <CircularProgress size={36} thickness={4} style={{ color: "#888" }} />
          <span style={{ fontSize: 20, fontWeight: 700 }}>Hleð gögnum...</span>
        </div>
      )}

      {/* Mobile card view */}
      <div
        className="mobile-cards"
        style={{ display: loading ? "none" : undefined }}
      >
        {sortedData.map((row, index) => (
          <div key={index} className="mobile-card">
            <div className="mobile-card-header">
              <span className="mobile-card-apple-order">{row.description}</span>
            </div>
            <div className="mobile-card-meta">
              <span className="mobile-card-label">Part</span>
              <span className="mobile-card-value">{row.partNumber}</span>
            </div>
            <div className="mobile-card-meta">
              <span className="mobile-card-label">Apple</span>
              <span className="mobile-card-value">{row.appleOrderNumber}</span>
            </div>
            <div className="mobile-card-meta">
              <span className="mobile-card-label">PO</span>
              <span className="mobile-card-value">{row.orderNumber}</span>
            </div>
            <div className="mobile-card-stats">
              <div className="mobile-stat">
                <span>{row.orderQty}</span>
                <label>Ordered</label>
              </div>
              <div className="mobile-stat">
                <span>{row.deliveredQty}</span>
                <label>Delivered</label>
              </div>
              <div className="mobile-stat mobile-stat-highlight">
                <span>{row.inTransit}</span>
                <label>In Transit</label>
              </div>
              <div className="mobile-stat">
                <span>{row.remainingQty}</span>
                <label>Remaining</label>
              </div>
            </div>
            {row.estimatedDelivery && row.estimatedDelivery !== "N/A" && (
              <div className="mobile-card-delivery">
                Est. Delivery: <strong>{row.estimatedDelivery}</strong>
              </div>
            )}
            <span className={`status-pill ${getStatusClass(row.status)}`}>
              {row.status}
            </span>
          </div>
        ))}
      </div>

      <div
        className="table-container-2"
        style={{ display: loading ? "none" : undefined }}
      >
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
                    <span className={`status-pill ${getStatusClass(row.status)}`}>
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
