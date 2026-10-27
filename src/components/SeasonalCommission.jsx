import React, { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { useUser } from "@clerk/clerk-react";
import { Snackbar, Alert, CircularProgress } from "@mui/material";
import { FiSearch, FiChevronDown, FiUpload, FiTrash2 } from "react-icons/fi";
import { supabase } from "../lib/supabase";
import {
  COMMISSION_CATEGORIES,
  MONTHLY_COMMISSION_CAP,
} from "../data/commission";

const BUCKET = "excel-data";
const FILE_PATH = "seasonal-commission.xlsx";

// Hópar með fleiri vörum en þetta eru felldir saman þar til smellt er á „Sýna allar“
const COLLAPSED_ROWS = 5;

// Dálkaheiti í Business Central útflutningnum
const COL_SKU = "Nr.";
const COL_NAME = "Lýsing";
const COL_EXCLUDED = "Undanskilið";
const COL_COMMISSION = "Föst söluþóknun";

const OTHER_CATEGORY = { id: "other", name: "Aukahlutir" };

function formatISK(amount) {
  return Math.round(amount).toLocaleString("is-IS").replace(/,/g, ".") + " kr.";
}

function normalize(text) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function categoryFromName(name) {
  const n = name.toLowerCase();
  if (n.startsWith("iphone")) return "iphone";
  if (n.startsWith("ipad")) return "ipad";
  if (n.startsWith("apple watch")) return "watch";
  if (/^(macbook|imac|mac )/.test(n)) return "mac";
  return OTHER_CATEGORY.id;
}

// Excel getur skilað 1000 sem tölu eða "1.000," sem texta (íslenskt snið)
function parseAmount(value) {
  if (typeof value === "number") return value;
  const n = parseFloat(
    String(value ?? "")
      .replace(/\./g, "")
      .replace(",", "."),
  );
  return Number.isFinite(n) ? n : 0;
}

function isTruthy(value) {
  return (
    value === true || /^(true|já|ja|yes|1)$/i.test(String(value ?? "").trim())
  );
}

// Les BC útflutning og skilar vörulista. Kastar villu ef skjalið passar ekki.
function parseWorkbook(buffer) {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

  const headerIndex = rows.findIndex((row) => {
    const cells = row.map((c) => String(c).trim());
    return cells.includes(COL_SKU) && cells.includes(COL_NAME);
  });
  if (headerIndex === -1) {
    throw new Error(`Fann ekki dálkana „${COL_SKU}“ og „${COL_NAME}“.`);
  }

  const header = rows[headerIndex].map((c) => String(c).trim());
  const col = (name) => header.indexOf(name);
  if (col(COL_COMMISSION) === -1) {
    throw new Error(`Fann ekki dálkinn „${COL_COMMISSION}“.`);
  }

  const products = rows
    .slice(headerIndex + 1)
    .map((row) => ({
      sku: String(row[col(COL_SKU)]).trim(),
      name: String(row[col(COL_NAME)]).trim(),
      commission: parseAmount(row[col(COL_COMMISSION)]),
      excluded: col(COL_EXCLUDED) !== -1 && isTruthy(row[col(COL_EXCLUDED)]),
    }))
    .filter((p) => p.sku && p.name && p.commission > 0 && !p.excluded)
    .map(({ sku, name, commission }) => ({
      sku,
      name,
      commission,
      category: categoryFromName(name),
    }));

  if (products.length === 0) {
    throw new Error("Engar vörur með söluþóknun fundust í skjalinu.");
  }
  return products;
}

function formatUpdated(date) {
  return date.toLocaleDateString("is-IS", { day: "numeric", month: "long" });
}

function SeasonalCommission({ icons }) {
  const { user, isLoaded } = useUser();
  const role = user?.publicMetadata?.role;
  const canEdit = isLoaded && (role === "admin" || role === "editor");

  const [products, setProducts] = useState([]);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const uploadInputRef = useRef(null);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [expanded, setExpanded] = useState({});

  async function loadData() {
    try {
      const { data: files } = await supabase.storage
        .from(BUCKET)
        .list("", { search: FILE_PATH });
      const file = files?.find((f) => f.name === FILE_PATH);
      if (!file) {
        setProducts([]);
        setUpdatedAt(null);
        return;
      }

      const { data: signed, error } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(FILE_PATH, 300);
      if (error) throw error;

      const response = await fetch(signed.signedUrl, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setProducts(parseWorkbook(await response.arrayBuffer()));
      setUpdatedAt(file.updated_at ? new Date(file.updated_at) : null);
    } catch (err) {
      console.error("Failed to load seasonal commission:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      // Sannreyna skjalið áður en það er vistað, svo röng skrá eyði ekki listanum
      const parsed = parseWorkbook(await file.arrayBuffer());

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(FILE_PATH, file, { upsert: true });
      if (error) throw error;

      await loadData();
      setSnackbar({
        open: true,
        severity: "success",
        message: `Listi uppfærður: ${parsed.length} vörur.`,
      });
    } catch (err) {
      setSnackbar({
        open: true,
        severity: "error",
        message: err.message || "Upphleðsla mistókst.",
      });
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    setConfirmRemove(false);
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .remove([FILE_PATH]);
    // Supabase skilar engri villu þegar RLS hafnar eyðingu, bara tómum lista,
    // svo athuga þarf hvort skráin hafi raunverulega verið fjarlægð.
    if (error || !data?.length) {
      console.error(
        "Failed to remove seasonal commission:",
        error ?? "no rows deleted (storage DELETE policy?)",
      );
      setSnackbar({
        open: true,
        severity: "error",
        message: "Tókst ekki að fjarlægja lista. Vantar heimild í Supabase.",
      });
      return;
    }
    await loadData();
    setSnackbar({ open: true, severity: "success", message: "Átak fjarlægt." });
  }

  if (loading) return null;

  const categories = [...COMMISSION_CATEGORIES, OTHER_CATEGORY];

  const q = normalize(query);
  const matches = products.filter(
    (p) =>
      (category === "all" || p.category === category) &&
      (!q || normalize(`${p.name} ${p.sku}`).includes(q)),
  );

  const groups = categories
    .map((cat) => ({
      ...cat,
      products: matches.filter((p) => p.category === cat.id),
    }))
    .filter((g) => g.products.length > 0);

  // Skipta flokkum í tvo sjálfstæða dálka eftir heildarfjölda vara, svo
  // dálkarnir verði álíka langir. Skiptingin fer ekki eftir "Sýna allar",
  // svo spjöld hoppa ekki á milli dálka þegar flokkur er opnaður.
  const groupColumns =
    groups.length <= 1
      ? [groups]
      : groups.reduce(
          (cols, group) => {
            const size = (col) =>
              col.reduce((n, g) => n + g.products.length, 0);
            cols[size(cols[0]) <= size(cols[1]) ? 0 : 1].push(group);
            return cols;
          },
          [[], []],
        );

  const counts = Object.fromEntries(
    categories.map((cat) => [
      cat.id,
      products.filter((p) => p.category === cat.id).length,
    ]),
  );

  const amounts = [...new Set(products.map((p) => p.commission))];
  const sameAmount = amounts.length === 1 ? amounts[0] : null;

  const adminControls = canEdit && (
    <div className="fp-admin">
      <input
        ref={uploadInputRef}
        type="file"
        accept=".xlsx,.xls"
        hidden
        onChange={handleUpload}
      />
      <button
        type="button"
        className="fp-admin-btn"
        disabled={uploading}
        onClick={() => uploadInputRef.current?.click()}
      >
        {uploading ? <CircularProgress size={14} /> : <FiUpload size={15} />}
        {products.length ? "Hlaða upp nýjum lista" : "Hlaða upp lista"}
      </button>
      {products.length > 0 &&
        (confirmRemove ? (
          <>
            <button
              type="button"
              className="fp-admin-btn fp-admin-danger"
              onClick={handleRemove}
            >
              Já, fjarlægja átak
            </button>
            <button
              type="button"
              className="fp-admin-btn"
              onClick={() => setConfirmRemove(false)}
            >
              Hætta við
            </button>
          </>
        ) : (
          <button
            type="button"
            className="fp-admin-btn"
            onClick={() => setConfirmRemove(true)}
          >
            <FiTrash2 size={15} />
            Fjarlægja
          </button>
        ))}
    </div>
  );

  return (
    <section className="sc-section fp-section">
      <div className="fp-header">
        <div className="fp-header-top">
          <span className="fp-badge">Tímabundið átak</span>
          {adminControls}
        </div>
        <h2 className="sc-section-heading">Tímabundin söluþóknun</h2>
        {products.length > 0 ? (
          <div className="fp-summary">
            <div className="fp-summary-amount">
              <span className="fp-summary-value">
                {sameAmount !== null ? formatISK(sameAmount) : "Föst upphæð"}
              </span>
              <span className="fp-summary-label">
                fyrir hverja selda vöru á listanum
              </span>
            </div>
            <ul className="fp-summary-facts">
              <li>Telur upp í {formatISK(MONTHLY_COMMISSION_CAP)} hámarkið</li>
              <li>Gildir á meðan átakið stendur yfir</li>
              <li>
                Vörurnar geta breyst milli átaka
                {updatedAt && <> · uppfært {formatUpdated(updatedAt)}</>}
              </li>
            </ul>
          </div>
        ) : (
          <p className="sc-section-sub">
            {canEdit ? (
              <>
                Ekkert átak í gangi. Hladdu upp Excel útflutningi úr Business
                Central með dálkunum „{COL_SKU}“, „{COL_NAME}“ og „
                {COL_COMMISSION}“.
              </>
            ) : (
              "Ekkert átak í gangi núna. Þegar nýtt átak hefst birtast vörurnar hér."
            )}
          </p>
        )}
      </div>

      {products.length > 0 && (
        <>
          <div className="fp-toolbar">
            <label className="fp-search">
              <FiSearch size={16} />
              <input
                type="search"
                placeholder="Leita eftir vöru eða vörunúmeri"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <div className="fp-filters" role="group">
              <button
                type="button"
                className={category === "all" ? "active" : ""}
                onClick={() => setCategory("all")}
              >
                Allt <span>{products.length}</span>
              </button>
              {categories
                .filter((cat) => counts[cat.id] > 0)
                .map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={category === cat.id ? "active" : ""}
                    onClick={() => setCategory(cat.id)}
                  >
                    {cat.name} <span>{counts[cat.id]}</span>
                  </button>
                ))}
            </div>
          </div>

          {groups.length === 0 ? (
            <div className="fp-empty">Engar vörur fundust fyrir „{query}“.</div>
          ) : (
            <div
              className={`fp-groups ${groupColumns.length === 1 ? "fp-groups-single" : ""}`}
            >
              {groupColumns.map((column, i) => (
                <div key={i} className="fp-col">
                  {column.map((group) => {
                    // Sýna allt þegar leitað er, annars fella langa hópa saman
                    const isOpen = q || expanded[group.id];
                    const visible = isOpen
                      ? group.products
                      : group.products.slice(0, COLLAPSED_ROWS);
                    const hidden = group.products.length - visible.length;

                    return (
                      <div key={group.id} className="fp-group">
                        <div className="fp-group-head">
                          {icons[group.id] && (
                            <span className="fp-group-icon">{icons[group.id]}</span>
                          )}
                          <h3>{group.name}</h3>
                          <span className="fp-group-count">
                            {group.products.length}
                          </span>
                        </div>
                        <ul className="fp-list">
                          {visible.map((p) => (
                            <li key={p.sku} className="fp-row">
                              <div className="fp-row-main">
                                <span className="fp-name">{p.name}</span>
                                <span className="fp-sku">{p.sku}</span>
                              </div>
                              {sameAmount === null && (
                                <span className="fp-amount">
                                  {formatISK(p.commission)}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                        {hidden > 0 && (
                          <button
                            type="button"
                            className="fp-more"
                            onClick={() =>
                              setExpanded((prev) => ({ ...prev, [group.id]: true }))
                            }
                          >
                            Sýna allar ({group.products.length})
                            <FiChevronDown size={16} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </section>
  );
}

export default SeasonalCommission;
