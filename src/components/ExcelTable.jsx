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
import { FaX, FaCircleInfo } from "react-icons/fa6";
import { FaDownload, FaUpload } from "react-icons/fa";
import { skuMap } from "../data/skuMap";
import { descriptionOverride } from "../data/descriptionOverride";

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import PatchNotesModal from "../functions/patchNotesModal";
import { Snackbar, Alert, CircularProgress, Tooltip } from "@mui/material";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../lib/supabase";

// Supabase skilar mest 1000 línum í hverri fyrirspurn sjálfgefið
const PAGE_SIZE = 1000;

// Töflur fyrir nýja Excel sniðið (sjá src/data/shipments_v2_schema.sql)
const TABLE = "shipments_v2";
const META_TABLE = "shipments_v2_meta";

// Dálkaheiti í Excel skjalinu (fyrsta lína)
const COLS = {
  subLob: "SUB LOB",
  partNumber: "Vörunúmer",
  description: "Lýsing",
  shipmentQty: "Magn sendingar",
  epliQty: "Epli áætlað magn",
  estimatedDelivery: "Áætl. afhending",
  status: "Shipping status",
  dnNumber: "DN númer",
  lob: "LOB",
  poNumber: "Customer PO Number",
};

const LOB_FILTERS = [
  "All",
  "Mac",
  "iPhone",
  "iPad",
  "Watch",
  "AirPods",
  "Beats",
  "Home",
  "Accessories",
];

// Dálkar í töflu og Excel útflutningi, í þessari röð
const COLUMNS = [
  { label: "Vörunúmer", key: "partNumber" },
  { label: "Lýsing", key: "description" },
  { label: "Epli áætlað magn", key: "epliQty" },
  { label: "Staða", key: "status" },
  { label: "Áætl. afhending", key: "estimatedDelivery" },
];

// Pantanir sem byrja á "SBP" eru sérpantanir
function isSpecialOrder(row) {
  return /^sbp/i.test(row.poNumber ?? "");
}

// Vöruflokkur (LOB sía) og "Aðeins sérpantanir" rofinn eru óháð hvort öðru
function matchesFilters(row, lob, specialOnly) {
  if (specialOnly && !isSpecialOrder(row)) return false;
  return lob === "All" || row.lob === lob;
}

// Varaleið ef LOB dálkinn vantar eða er tómur:
// SUB LOB (t.d. "iPad Air 11in (6th Gen)") -> síuflokkur
function lobFromSubLob(subLob) {
  const s = (subLob || "").toLowerCase();
  if (/accys|accessor/.test(s)) return "Accessories";
  if (s.startsWith("iphone")) return "iPhone";
  if (s.startsWith("ipad")) return "iPad";
  if (/^(imac|mac)/.test(s)) return "Mac";
  if (/^(apple watch|watch)/.test(s)) return "Watch";
  if (s.startsWith("airpods")) return "AirPods";
  if (s.startsWith("beats")) return "Beats";
  if (/^(apple tv|homepod)/.test(s)) return "Home";
  return "Accessories";
}

// Les Excel skjalið og heldur bara dálkunum sem síðan sýnir.
// Kastar villu ef skjalið passar ekki.
function parseShipmentWorkbook(buffer) {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

  const headerIndex = rawRows.findIndex((row) => {
    const cells = row.map((c) => String(c).trim());
    return cells.includes(COLS.partNumber) && cells.includes(COLS.description);
  });
  if (headerIndex === -1) {
    throw new Error(
      `Skjalið passar ekki: dálkana „${COLS.partNumber}“ og „${COLS.description}“ vantar.`,
    );
  }

  const header = rawRows[headerIndex].map((c) => String(c).trim());
  const cell = (row, name) => {
    const i = header.indexOf(name);
    return i === -1 ? "" : row[i];
  };

  const rows = rawRows
    .slice(headerIndex + 1)
    .filter((row) => toText(cell(row, COLS.partNumber)))
    .map((row) => ({
      sub_lob: toText(cell(row, COLS.subLob)),
      part_number: toText(cell(row, COLS.partNumber)),
      description: toText(cell(row, COLS.description)),
      shipment_qty: toInt(cell(row, COLS.shipmentQty)),
      epli_qty: toInt(cell(row, COLS.epliQty)),
      estimated_delivery: toISODate(cell(row, COLS.estimatedDelivery)),
      status: toText(cell(row, COLS.status)),
      dn_number: toText(cell(row, COLS.dnNumber)),
      lob: toText(cell(row, COLS.lob)),
      po_number: toText(cell(row, COLS.poNumber)),
    }));

  if (rows.length === 0) {
    throw new Error("Skjalið passar ekki: engar línur fundust.");
  }
  return rows;
}

function toText(value) {
  if (value === undefined || value === null || value === "") return null;
  return String(value).trim();
}

function toInt(value) {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n) : null;
}

// Excel raðnúmer, Date eða texti "19.10.2026" -> "YYYY-MM-DD"
function toISODate(value) {
  if (typeof value === "number" && value > 0) {
    return new Date((value - 25569) * 86400000).toISOString().slice(0, 10);
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  const match = String(value ?? "")
    .trim()
    .match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (match) {
    const [, d, m, y] = match;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return null;
}

// Dálkar úr töflunni -> snið sem síðan notar
function fromDbRow(row) {
  let estimatedDelivery = "—";
  if (row.estimated_delivery) {
    const [y, m, d] = row.estimated_delivery.split("-");
    estimatedDelivery = `${d}.${m}.${y}`;
  }
  return {
    subLob: row.sub_lob,
    lob: row.lob || lobFromSubLob(row.sub_lob),
    partNumber: row.part_number,
    description: row.description,
    shipmentQty: row.shipment_qty,
    epliQty: row.epli_qty,
    estimatedDelivery,
    // Raðað eftir ISO dagsetningu, ekki textanum sem er birtur
    estimatedDeliverySort: row.estimated_delivery ?? "",
    status: row.status,
    dnNumber: row.dn_number,
    poNumber: row.po_number,
  };
}

async function fetchAllShipments() {
  const all = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    all.push(...data);
    if (data.length < PAGE_SIZE) return all;
  }
}

// Known shipping pipeline stages, earliest to latest. Statuses not in this
// list (or new ones Apple adds) safely fall back to "status-default".
const STATUS_STAGE_ORDER = [
  "order received",
  "in production",
  "shipment picked up",
  "uplift",
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

const DELIVERED_INFO =
  "Ef skráð Delivered gæti sendingin verið komin til landsins en ekki móttekin á aðallager.";

// Stöðumerki; "Delivered" fær upplýsingatákn og skýringu þegar farið er yfir það
function StatusPill({ status }) {
  const className = `status-pill ${getStatusClass(status)}`;
  if (status?.trim().toLowerCase() !== "delivered") {
    return <span className={className}>{status}</span>;
  }
  return (
    <Tooltip
      title={
        <span className="status-tooltip">
          <FaCircleInfo size={13} aria-hidden="true" />
          {DELIVERED_INFO}
        </span>
      }
      arrow
      placement="top"
      enterTouchDelay={0}
      leaveTouchDelay={4000}
    >
      <span className={`${className} status-pill-info`} tabIndex={0}>
        {status}
        <FaCircleInfo size={11} aria-hidden="true" />
      </span>
    </Tooltip>
  );
}

const ExcelTable = () => {
  const { user, isLoaded } = useUser();
  const isAdmin = isLoaded && user?.publicMetadata?.role === "admin";

  const [data, setData] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [specialOnly, setSpecialOnly] = useState(false);
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
  };

  const [exporting, setExporting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  function finishLoading() {
    const elapsed = Date.now() - (loadStartRef.current ?? 0);
    setTimeout(() => setLoading(false), Math.max(0, 1000 - elapsed));
  }

  async function loadData() {
    loadStartRef.current = Date.now();
    setLoading(true);
    try {
      const [rows, { data: meta, error: metaError }] = await Promise.all([
        fetchAllShipments(),
        supabase.from(META_TABLE).select("*").maybeSingle(),
      ]);
      if (metaError) throw metaError;

      // Línur þar sem Epli fær ekkert úr sendingunni eru ekki sýndar
      const processedData = rows
        .map(fromDbRow)
        .filter((row) => row.epliQty !== 0);
      setData(processedData);
      const updatedAt = meta?.uploaded_at;
      setFileUpdatedAt(updatedAt ? new Date(updatedAt) : null);
    } catch (err) {
      console.error("Failed to load shipments from Supabase:", err);
    } finally {
      finishLoading();
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleExcelUpload(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploadingExcel(true);
    try {
      const rows = parseShipmentWorkbook(await file.arrayBuffer());

      const { error } = await supabase.rpc("replace_shipments_v2", {
        p_rows: rows,
      });
      if (error) throw error;

      setActiveFilter("All");
      await loadData();
      setSnackbar({
        open: true,
        severity: "success",
        message: `Gögn uppfærð! ${rows.length} línur.`,
      });
    } catch (err) {
      console.error("Upload failed:", err);
      setSnackbar({
        open: true,
        severity: "error",
        message: err.message?.startsWith("Skjalið")
          ? err.message
          : "Upphleðsla mistókst.",
      });
    } finally {
      setUploadingExcel(false);
    }
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
  const filteredData = data.filter((row) =>
    matchesFilters(row, activeFilter, specialOnly),
  );
  const specialCount = data.filter((row) =>
    matchesFilters(row, activeFilter, true),
  ).length;

  const sortedData = [...filteredData]
    .map((row) => {
      const partNumber = skuMap[row.partNumber] || row.partNumber;
      return {
        ...row,
        partNumber: isSpecialOrder(row)
          ? `${partNumber} SÉRPÖNTUN (${row.poNumber})`
          : partNumber,
        description: descriptionOverride[row.partNumber] || row.description,
      };
    })
    .filter((row) =>
      Object.values(row).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    );

  // Sérpantanir (SBP) alltaf neðst, líka þegar raðað er eftir dálki
  sortedData.sort((a, b) => {
    const specialDiff = isSpecialOrder(a) - isSpecialOrder(b);
    if (specialDiff !== 0) return specialDiff;
    if (!sortConfig.key) return 0;

    const key =
      sortConfig.key === "estimatedDelivery"
        ? "estimatedDeliverySort"
        : sortConfig.key;
    const aVal = a[key] ?? "";
    const bVal = b[key] ?? "";
    const aStr = typeof aVal === "string" ? aVal.toLowerCase() : aVal;
    const bStr = typeof bVal === "string" ? bVal.toLowerCase() : bVal;
    if (aStr < bStr) return sortConfig.direction === "ascending" ? -1 : 1;
    if (aStr > bStr) return sortConfig.direction === "ascending" ? 1 : -1;
    return 0;
  });

  // Export to Excel
  const exportToExcel = async () => {
    try {
      setExporting(true);

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Filtered Data");

      const headers = COLUMNS.map((c) => c.label);

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
        worksheet.addRow(COLUMNS.map((c) => row[c.key]));
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
      <div className="table-top-row">
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
        <div className="table-note">
          <FaCircleInfo size={13} aria-hidden="true" />
          <span>
            <strong>Athugið:</strong> Sérpantanir birtast alltaf neðst. Lýsingar
            á sérpöntunum eru ekki réttar, skoðaðu sölupöntunina í BC fyrir
            réttar spec upplýsingar.
          </span>
        </div>
      </div>
      <div className="filter-buttons-and-search-bar">
        <div className="filter-buttons">
          {[
            ...LOB_FILTERS,
            // LOB gildi úr skjalinu sem eru ekki í föstu listanum fá líka hnapp
            ...[...new Set(data.map((r) => r.lob))].filter(
              (lob) => lob && !LOB_FILTERS.includes(lob),
            ),
          ].map((lob) => {
            const count = data.filter((r) =>
              matchesFilters(r, lob, specialOnly),
            ).length;
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
          <button
            type="button"
            role="switch"
            aria-checked={specialOnly}
            className={`special-toggle ${specialOnly ? "on" : ""}`}
            onClick={() => setSpecialOnly((on) => !on)}
          >
            <span className="special-toggle-track" aria-hidden="true">
              <span className="special-toggle-thumb" />
            </span>
            Aðeins sérpantanir
            <span className="filter-count">{specialCount}</span>
          </button>
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
              <span className="mobile-card-label">Vörunr.</span>
              <span className="mobile-card-value">{row.partNumber}</span>
            </div>
            <div className="mobile-card-stats">
              <div className="mobile-stat mobile-stat-highlight">
                <span>{row.epliQty}</span>
                <label>Epli áætlað</label>
              </div>
            </div>
            {row.estimatedDelivery && row.estimatedDelivery !== "—" && (
              <div className="mobile-card-delivery">
                Áætl. afhending: <strong>{row.estimatedDelivery}</strong>
              </div>
            )}
            <StatusPill status={row.status} />
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
                {COLUMNS.map(({ label, key }) => (
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
                  {COLUMNS.map(({ key }) => (
                    <TableCell key={key} className="sticky-cell">
                      {key === "status" ? (
                        <StatusPill status={row.status} />
                      ) : (
                        <p className="sticky-cell-text">{row[key]}</p>
                      )}
                    </TableCell>
                  ))}
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
