import { useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../lib/supabase";
import "../css/SharedModal.css";
import "../css/PriceList.css";

const EMPTY_DRAFT = {
  product_slug: "",
  screen_size: "",
  chip: "",
  chip_order: "0",
  cpu_cores: "",
  gpu_cores: "",
  storage: "",
  ram: "",
  price: "",
  offer_price: "",
  display_order: "0",
};

function toNumberOrNull(value) {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function formatISK(value) {
  if (value === null || value === undefined || value === "") return "—";
  return Number(value).toLocaleString("is-IS").replace(/,/g, ".") + " kr";
}

const SLUG_WORD_OVERRIDES = {
  macbook: "MacBook",
  imac: "iMac",
  mini: "mini",
};

// Controls the order product groups appear in on the page.
// Slugs not listed here fall to the end, alphabetically.
const PRODUCT_ORDER = [
  "macbook-neo",
  "macbook-air-m5",
  "macbook-pro-m4",
  "macbook-pro-m5",
  "imac-m4",
  "mac-mini-m4",
  "mac-studio",
];

function formatProductName(slug) {
  return slug
    .split("-")
    .map((word) => {
      if (SLUG_WORD_OVERRIDES[word]) return SLUG_WORD_OVERRIDES[word];
      if (/^m\d+$/i.test(word)) return word.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

export default function PriceList() {
  const { user, isLoaded } = useUser();
  const role = user?.publicMetadata?.role;
  const isEditor = isLoaded && (role === "admin" || role === "editor");

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [savingIds, setSavingIds] = useState(new Set());
  const [deletingIds, setDeletingIds] = useState(new Set());

  const [expandedRowIds, setExpandedRowIds] = useState(new Set());

  const [showAddModal, setShowAddModal] = useState(false);
  const [addDraft, setAddDraft] = useState(EMPTY_DRAFT);
  const [addError, setAddError] = useState("");
  const [addSaving, setAddSaving] = useState(false);

  const originalRowsRef = useRef({});

  useEffect(() => {
    loadPricing();
  }, []);

  useEffect(() => {
    if (!showAddModal) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") setShowAddModal(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [showAddModal]);

  async function loadPricing() {
    setLoading(true);
    setLoadError("");

    const { data, error } = await supabase
      .from("pricing")
      .select("*")
      .order("product_slug", { ascending: true })
      .order("screen_size", { ascending: true })
      .order("chip_order", { ascending: true })
      .order("display_order", { ascending: true });

    if (error) {
      console.error(error);
      setLoadError("Ekki tókst að sækja verðlista.");
      setLoading(false);
      return;
    }

    const loaded = data || [];
    originalRowsRef.current = Object.fromEntries(
      loaded.map((row) => [row.id, row]),
    );
    setRows(loaded);
    setLoading(false);
  }

  function toggleRowExpanded(id) {
    setExpandedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function updateField(id, field, value) {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  }

  function isDirty(row) {
    const original = originalRowsRef.current[row.id];
    if (!original) return false;
    return Object.keys(EMPTY_DRAFT).some(
      (field) => String(original[field] ?? "") !== String(row[field] ?? ""),
    );
  }

  function revertRow(id) {
    const original = originalRowsRef.current[id];
    if (!original) return;
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...original } : row)),
    );
  }

  async function saveRow(row) {
    setSavingIds((prev) => new Set(prev).add(row.id));

    const { error } = await supabase
      .from("pricing")
      .update({
        product_slug: row.product_slug.trim(),
        screen_size: toNumberOrNull(row.screen_size),
        chip: row.chip.trim(),
        chip_order: toNumberOrNull(row.chip_order) ?? 0,
        cpu_cores: row.cpu_cores?.trim() || null,
        gpu_cores: row.gpu_cores?.trim() || null,
        storage: row.storage.trim(),
        ram: row.ram.trim(),
        price: toNumberOrNull(row.price),
        offer_price: toNumberOrNull(row.offer_price),
        display_order: toNumberOrNull(row.display_order) ?? 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);

    setSavingIds((prev) => {
      const next = new Set(prev);
      next.delete(row.id);
      return next;
    });

    if (error) {
      console.error(error);
      window.alert("Ekki tókst að vista breytingar.");
      return;
    }

    originalRowsRef.current[row.id] = { ...row };
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r } : r)));
  }

  async function saveAllDirty() {
    const dirtyRows = rows.filter(isDirty);
    await Promise.all(dirtyRows.map((row) => saveRow(row)));
  }

  async function deleteRow(id) {
    const confirmed = window.confirm(
      "Ertu viss um að þú viljir eyða þessari verðlínu?",
    );
    if (!confirmed) return;

    setDeletingIds((prev) => new Set(prev).add(id));

    const { error } = await supabase.from("pricing").delete().eq("id", id);

    setDeletingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

    if (error) {
      console.error(error);
      window.alert("Ekki tókst að eyða línu.");
      return;
    }

    delete originalRowsRef.current[id];
    setRows((prev) => prev.filter((row) => row.id !== id));
  }

  function openAddModal(productSlug) {
    setAddDraft({
      ...EMPTY_DRAFT,
      product_slug: productSlug || "",
    });
    setAddError("");
    setShowAddModal(true);
  }

  async function submitAddDraft() {
    const productSlug = addDraft.product_slug.trim();
    const chip = addDraft.chip.trim();
    const storage = addDraft.storage.trim();
    const ram = addDraft.ram.trim();
    const price = toNumberOrNull(addDraft.price);

    if (!productSlug || !chip || !storage || !ram || price === null) {
      setAddError(
        "Vörulykill, örgjörvi, geymsla, vinnsluminni og verð eru nauðsynleg.",
      );
      return;
    }

    setAddSaving(true);

    const { data, error } = await supabase
      .from("pricing")
      .insert({
        product_slug: productSlug,
        screen_size: toNumberOrNull(addDraft.screen_size),
        chip,
        chip_order: toNumberOrNull(addDraft.chip_order) ?? 0,
        cpu_cores: addDraft.cpu_cores.trim() || null,
        gpu_cores: addDraft.gpu_cores.trim() || null,
        storage,
        ram,
        price,
        offer_price: toNumberOrNull(addDraft.offer_price),
        display_order: toNumberOrNull(addDraft.display_order) ?? 0,
      })
      .select()
      .single();

    setAddSaving(false);

    if (error) {
      console.error(error);
      setAddError("Ekki tókst að bæta við línu.");
      return;
    }

    originalRowsRef.current[data.id] = data;
    setRows((prev) => [...prev, data]);
    setShowAddModal(false);
  }

  const filteredRows = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return rows;
    return rows.filter((row) =>
      [
        row.product_slug,
        row.chip,
        row.cpu_cores,
        row.gpu_cores,
        row.storage,
        row.ram,
      ]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(value)),
    );
  }, [rows, search]);

  const groupedRows = useMemo(() => {
    const groups = [];
    const bySlug = new Map();

    for (const row of filteredRows) {
      if (!bySlug.has(row.product_slug)) {
        const group = { productSlug: row.product_slug, rows: [] };
        bySlug.set(row.product_slug, group);
        groups.push(group);
      }
      bySlug.get(row.product_slug).rows.push(row);
    }

    groups.sort((a, b) => {
      const aIndex = PRODUCT_ORDER.indexOf(a.productSlug);
      const bIndex = PRODUCT_ORDER.indexOf(b.productSlug);
      if (aIndex === -1 && bIndex === -1) {
        return a.productSlug.localeCompare(b.productSlug);
      }
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

    return groups;
  }, [filteredRows]);

  const dirtyCount = rows.filter(isDirty).length;

  return (
    <div className="pricelist-page">
      <div className="pricelist-header">
        <div>
          <h1>Verðlistar í verslunum</h1>
          {!isEditor && isLoaded && (
            <p className="pricelist-subtitle">Sæki verðlista.</p>
          )}
        </div>

        {isEditor && (
          <div className="pricelist-header-actions">
            {dirtyCount > 0 && (
              <button className="save-all-button" onClick={saveAllDirty}>
                Vista breytingar ({dirtyCount})
              </button>
            )}
            <button
              className="add-product-button"
              onClick={() => openAddModal("")}
            >
              + Bæta við línu
            </button>
          </div>
        )}
      </div>

      <input
        className="search-input"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Leita eftir vöru, örgjörva, geymslu eða vinnsluminni..."
      />

      {loading && <p className="pricelist-status">Hleð verðlista...</p>}
      {loadError && (
        <p className="pricelist-status pricelist-error">{loadError}</p>
      )}

      {!loading && !loadError && groupedRows.length === 0 && (
        <p className="pricelist-status">Engar niðurstöður.</p>
      )}

      {!loading &&
        !loadError &&
        groupedRows.map((group) => (
          <div className="pricelist-group" key={group.productSlug}>
            <div className="pricelist-group-header">
              <h2>{formatProductName(group.productSlug)}</h2>
              {isEditor && (
                <button
                  className="add-row-button"
                  onClick={() => openAddModal(group.productSlug)}
                >
                  + Bæta við í {formatProductName(group.productSlug)}
                </button>
              )}
            </div>

            <div className="pricelist-table-wrapper">
              <table className="pricelist-table">
                <thead>
                  <tr>
                    <th>Skjástærð</th>
                    <th>Örgjörvi</th>
                    <th>Chip Röð</th>
                    <th>CPU</th>
                    <th>GPU</th>
                    <th>Geymsla</th>
                    <th>Vinnsluminni</th>
                    <th className="pricelist-price-cell">Verð</th>
                    <th>Tilboðsverð</th>
                    <th>Birtingaröð</th>
                    {isEditor && <th>Aðgerðir</th>}
                  </tr>
                </thead>
                <tbody>
                  {group.rows.map((row) => {
                    const dirty = isDirty(row);
                    const saving = savingIds.has(row.id);
                    const deleting = deletingIds.has(row.id);

                    if (!isEditor) {
                      return (
                        <tr key={row.id}>
                          <td>{row.screen_size ?? "—"}</td>
                          <td>{row.chip}</td>
                          <td>{row.chip_order}</td>
                          <td>{row.cpu_cores || "—"}</td>
                          <td>{row.gpu_cores || "—"}</td>
                          <td>{row.storage}</td>
                          <td>{row.ram}</td>
                          <td className="pricelist-price-cell">
                            {formatISK(row.price)}
                          </td>
                          <td>{formatISK(row.offer_price)}</td>
                          <td>{row.display_order}</td>
                        </tr>
                      );
                    }

                    return (
                      <tr
                        key={row.id}
                        className={dirty ? "pricelist-row-dirty" : ""}
                      >
                        <td>
                          <input
                            className="cell-input cell-input-narrow"
                            type="number"
                            value={row.screen_size ?? ""}
                            onChange={(e) =>
                              updateField(row.id, "screen_size", e.target.value)
                            }
                            placeholder="No screen"
                          />
                        </td>
                        <td>
                          <input
                            className="cell-input"
                            value={row.chip}
                            onChange={(e) =>
                              updateField(row.id, "chip", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="cell-input cell-input-narrow"
                            type="number"
                            value={row.chip_order}
                            onChange={(e) =>
                              updateField(row.id, "chip_order", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="cell-input"
                            value={row.cpu_cores || ""}
                            onChange={(e) =>
                              updateField(row.id, "cpu_cores", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="cell-input"
                            value={row.gpu_cores || ""}
                            onChange={(e) =>
                              updateField(row.id, "gpu_cores", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="cell-input"
                            value={row.storage}
                            onChange={(e) =>
                              updateField(row.id, "storage", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="cell-input"
                            value={row.ram}
                            onChange={(e) =>
                              updateField(row.id, "ram", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="cell-input pricelist-price-cell"
                            type="number"
                            value={row.price ?? ""}
                            onChange={(e) =>
                              updateField(row.id, "price", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="cell-input"
                            type="number"
                            value={row.offer_price ?? ""}
                            onChange={(e) =>
                              updateField(row.id, "offer_price", e.target.value)
                            }
                            placeholder="No offer"
                          />
                        </td>
                        <td>
                          <input
                            className="cell-input cell-input-narrow"
                            type="number"
                            value={row.display_order}
                            onChange={(e) =>
                              updateField(
                                row.id,
                                "display_order",
                                e.target.value,
                              )
                            }
                          />
                        </td>
                        <td>
                          <div className="row-actions">
                            <button
                              className="row-save-button"
                              disabled={!dirty || saving}
                              onClick={() => saveRow(row)}
                            >
                              {saving ? "..." : "Vista"}
                            </button>
                            {dirty && !saving && (
                              <button
                                className="row-revert-button"
                                onClick={() => revertRow(row.id)}
                              >
                                Hætta við
                              </button>
                            )}
                            <button
                              className="row-delete-button"
                              disabled={deleting}
                              onClick={() => deleteRow(row.id)}
                            >
                              {deleting ? "..." : "Eyða"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="pricelist-mobile-cards">
              {group.rows.map((row) => {
                const dirty = isDirty(row);
                const saving = savingIds.has(row.id);
                const deleting = deletingIds.has(row.id);

                if (!isEditor) {
                  const expanded = expandedRowIds.has(row.id);
                  return (
                    <div className="pricelist-card" key={row.id}>
                      <button
                        type="button"
                        className="pricelist-card-summary"
                        onClick={() => toggleRowExpanded(row.id)}
                        aria-expanded={expanded}
                      >
                        <div className="pricelist-card-summary-text">
                          <span className="pricelist-card-chip">
                            {row.chip}
                          </span>
                          <span className="pricelist-card-summary-specs">
                            {row.screen_size ? `${row.screen_size}" · ` : ""}
                            {row.storage} · {row.ram}
                          </span>
                        </div>
                        <div className="pricelist-card-summary-right">
                          <span className="pricelist-card-price pricelist-price-cell">
                            {formatISK(row.price)}
                          </span>
                          <span
                            className={`pricelist-card-chevron ${expanded ? "is-open" : ""}`}
                            aria-hidden="true"
                          >
                            ⌄
                          </span>
                        </div>
                      </button>

                      {expanded && (
                        <div className="pricelist-card-body">
                          {row.offer_price != null && (
                            <div className="pricelist-card-offer">
                              Tilboð: {formatISK(row.offer_price)}
                            </div>
                          )}
                          <div className="pricelist-card-specs">
                            <div>
                              <span>Skjástærð</span>
                              <span>{row.screen_size ?? "—"}</span>
                            </div>
                            <div>
                              <span>CPU</span>
                              <span>{row.cpu_cores || "—"}</span>
                            </div>
                            <div>
                              <span>GPU</span>
                              <span>{row.gpu_cores || "—"}</span>
                            </div>
                            <div>
                              <span>Geymsla</span>
                              <span>{row.storage}</span>
                            </div>
                            <div>
                              <span>Vinnsluminni</span>
                              <span>{row.ram}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                const expanded = expandedRowIds.has(row.id);
                return (
                  <div
                    className={`pricelist-card ${dirty ? "pricelist-card-dirty" : ""}`}
                    key={row.id}
                  >
                    <button
                      type="button"
                      className="pricelist-card-summary"
                      onClick={() => toggleRowExpanded(row.id)}
                      aria-expanded={expanded}
                    >
                      <div className="pricelist-card-summary-text">
                        <span className="pricelist-card-chip">
                          {row.chip || "Ný lína"}
                        </span>
                        <span className="pricelist-card-summary-specs">
                          {row.screen_size ? `${row.screen_size}" · ` : ""}
                          {row.storage} · {row.ram}
                        </span>
                      </div>
                      <div className="pricelist-card-summary-right">
                        <span className="pricelist-card-price pricelist-price-cell">
                          {formatISK(row.price)}
                        </span>
                        {dirty && (
                          <span
                            className="pricelist-card-dirty-dot"
                            aria-hidden="true"
                          />
                        )}
                        <span
                          className={`pricelist-card-chevron ${expanded ? "is-open" : ""}`}
                          aria-hidden="true"
                        >
                          ⌄
                        </span>
                      </div>
                    </button>

                    {expanded && (
                      <div className="pricelist-card-body">
                        <div className="pricelist-card-field">
                          <label>Skjástærð</label>
                          <input
                            className="cell-input"
                            type="number"
                            value={row.screen_size ?? ""}
                            onChange={(e) =>
                              updateField(row.id, "screen_size", e.target.value)
                            }
                            placeholder="No screen"
                          />
                        </div>
                        <div className="pricelist-card-field">
                          <label>Örgjörvi</label>
                          <input
                            className="cell-input"
                            value={row.chip}
                            onChange={(e) =>
                              updateField(row.id, "chip", e.target.value)
                            }
                          />
                        </div>
                        <div className="pricelist-card-field">
                          <label>Chip Röð</label>
                          <input
                            className="cell-input"
                            type="number"
                            value={row.chip_order}
                            onChange={(e) =>
                              updateField(row.id, "chip_order", e.target.value)
                            }
                          />
                        </div>
                        <div className="pricelist-card-field">
                          <label>CPU</label>
                          <input
                            className="cell-input"
                            value={row.cpu_cores || ""}
                            onChange={(e) =>
                              updateField(row.id, "cpu_cores", e.target.value)
                            }
                          />
                        </div>
                        <div className="pricelist-card-field">
                          <label>GPU</label>
                          <input
                            className="cell-input"
                            value={row.gpu_cores || ""}
                            onChange={(e) =>
                              updateField(row.id, "gpu_cores", e.target.value)
                            }
                          />
                        </div>
                        <div className="pricelist-card-field">
                          <label>Geymsla</label>
                          <input
                            className="cell-input"
                            value={row.storage}
                            onChange={(e) =>
                              updateField(row.id, "storage", e.target.value)
                            }
                          />
                        </div>
                        <div className="pricelist-card-field">
                          <label>Vinnsluminni</label>
                          <input
                            className="cell-input"
                            value={row.ram}
                            onChange={(e) =>
                              updateField(row.id, "ram", e.target.value)
                            }
                          />
                        </div>
                        <div className="pricelist-card-field">
                          <label>Verð</label>
                          <input
                            className="cell-input pricelist-price-cell"
                            type="number"
                            value={row.price ?? ""}
                            onChange={(e) =>
                              updateField(row.id, "price", e.target.value)
                            }
                          />
                        </div>
                        <div className="pricelist-card-field">
                          <label>Tilboðsverð</label>
                          <input
                            className="cell-input"
                            type="number"
                            value={row.offer_price ?? ""}
                            onChange={(e) =>
                              updateField(row.id, "offer_price", e.target.value)
                            }
                            placeholder="No offer"
                          />
                        </div>
                        <div className="pricelist-card-field">
                          <label>Birtingaröð</label>
                          <input
                            className="cell-input"
                            type="number"
                            value={row.display_order}
                            onChange={(e) =>
                              updateField(
                                row.id,
                                "display_order",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="row-actions">
                          <button
                            className="row-save-button"
                            disabled={!dirty || saving}
                            onClick={() => saveRow(row)}
                          >
                            {saving ? "..." : "Vista"}
                          </button>
                          {dirty && !saving && (
                            <button
                              className="row-revert-button"
                              onClick={() => revertRow(row.id)}
                            >
                              Hætta við
                            </button>
                          )}
                          <button
                            className="row-delete-button"
                            disabled={deleting}
                            onClick={() => deleteRow(row.id)}
                          >
                            {deleting ? "..." : "Eyða"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Bæta við verðlínu</h2>

            <label className="modal-field-label">
              Vörulykill (product_slug)
            </label>
            <input
              className="modal-input"
              value={addDraft.product_slug}
              onChange={(e) =>
                setAddDraft((prev) => ({
                  ...prev,
                  product_slug: e.target.value,
                }))
              }
              placeholder="t.d. macbook-pro-m5"
            />

            <label className="modal-field-label">Skjástærð</label>
            <input
              className="modal-input"
              type="number"
              value={addDraft.screen_size}
              onChange={(e) =>
                setAddDraft((prev) => ({
                  ...prev,
                  screen_size: e.target.value,
                }))
              }
              placeholder="t.d. 14"
            />

            <label className="modal-field-label">Örgjörvi</label>
            <input
              className="modal-input"
              value={addDraft.chip}
              onChange={(e) =>
                setAddDraft((prev) => ({ ...prev, chip: e.target.value }))
              }
              placeholder="t.d. M5 Pro chip"
            />

            <label className="modal-field-label">Chip Röð (chip_order)</label>
            <input
              className="modal-input"
              type="number"
              value={addDraft.chip_order}
              onChange={(e) =>
                setAddDraft((prev) => ({ ...prev, chip_order: e.target.value }))
              }
            />

            <label className="modal-field-label">CPU</label>
            <input
              className="modal-input"
              value={addDraft.cpu_cores}
              onChange={(e) =>
                setAddDraft((prev) => ({ ...prev, cpu_cores: e.target.value }))
              }
              placeholder="t.d. 15-core CPU"
            />

            <label className="modal-field-label">GPU</label>
            <input
              className="modal-input"
              value={addDraft.gpu_cores}
              onChange={(e) =>
                setAddDraft((prev) => ({ ...prev, gpu_cores: e.target.value }))
              }
              placeholder="t.d. 16-core GPU"
            />

            <label className="modal-field-label">Geymsla</label>
            <input
              className="modal-input"
              value={addDraft.storage}
              onChange={(e) =>
                setAddDraft((prev) => ({ ...prev, storage: e.target.value }))
              }
              placeholder="t.d. 1TB"
            />

            <label className="modal-field-label">Vinnsluminni</label>
            <input
              className="modal-input"
              value={addDraft.ram}
              onChange={(e) =>
                setAddDraft((prev) => ({ ...prev, ram: e.target.value }))
              }
              placeholder="t.d. 24GB"
            />

            <label className="modal-field-label">Verð</label>
            <input
              className="modal-input"
              type="number"
              value={addDraft.price}
              onChange={(e) =>
                setAddDraft((prev) => ({ ...prev, price: e.target.value }))
              }
              placeholder="t.d. 389990"
            />

            <label className="modal-field-label">Tilboðsverð</label>
            <input
              className="modal-input"
              type="number"
              value={addDraft.offer_price}
              onChange={(e) =>
                setAddDraft((prev) => ({
                  ...prev,
                  offer_price: e.target.value,
                }))
              }
              placeholder="Skilja eftir autt ef ekkert tilboð"
            />

            <label className="modal-field-label">
              Birtingaröð (display_order)
            </label>
            <input
              className="modal-input"
              type="number"
              value={addDraft.display_order}
              onChange={(e) =>
                setAddDraft((prev) => ({
                  ...prev,
                  display_order: e.target.value,
                }))
              }
            />

            {addError && <p className="modal-error">{addError}</p>}

            <div className="modal-actions">
              <button
                className="modal-save-button"
                onClick={submitAddDraft}
                disabled={addSaving}
              >
                {addSaving ? "Vista..." : "Bæta við"}
              </button>
              <button
                className="modal-cancel-button"
                onClick={() => setShowAddModal(false)}
              >
                Hætta við
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
