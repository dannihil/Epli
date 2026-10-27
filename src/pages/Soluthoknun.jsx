import React, { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import "../css/Soluthoknun.css";
import { BsPhone, BsTablet, BsLaptop, BsSmartwatch } from "react-icons/bs";
import { FiCheck, FiMinus, FiPlus, FiX } from "react-icons/fi";
import SeasonalCommission from "../components/SeasonalCommission";
import {
  COMMISSION_PER_ACCESSORY,
  MONTHLY_COMMISSION_CAP,
  COMMISSION_CATEGORIES,
  COMMISSION_PERIOD_START_DAY,
} from "../data/commission";

const categoryIcons = {
  iphone: <BsPhone size={26} />,
  ipad: <BsTablet size={26} />,
  mac: <BsLaptop size={26} />,
  watch: <BsSmartwatch size={26} />,
};

const ACCESSORIES_TO_CAP = Math.ceil(
  MONTHLY_COMMISSION_CAP / COMMISSION_PER_ACCESSORY,
);

function formatISK(amount) {
  return Math.round(amount).toLocaleString("is-IS").replace(/,/g, ".") + " kr.";
}

// Núverandi þóknunartímabil, t.d. 21. sept – 20. okt.
function currentPeriod(today = new Date()) {
  const y = today.getFullYear();
  const m = today.getMonth();
  const startMonth = today.getDate() >= COMMISSION_PERIOD_START_DAY ? m : m - 1;
  return {
    start: new Date(y, startMonth, COMMISSION_PERIOD_START_DAY),
    end: new Date(y, startMonth + 1, COMMISSION_PERIOD_START_DAY - 1),
  };
}

// Söludagar eftir á tímabilinu, að deginum í dag meðtöldum.
function remainingSalesDays(end, today = new Date()) {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const todayUTC = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const endUTC = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.round((endUTC - todayUTC) / MS_PER_DAY) + 1;
}

// e.g. "20. október"
function formatDayMonth(date) {
  return date.toLocaleDateString("is-IS", { day: "numeric", month: "long" });
}

// e.g. "21. sep."
function formatShortDate(date) {
  return date.toLocaleDateString("is-IS", { day: "numeric", month: "short" });
}

function toNonNegative(value) {
  const n = parseFloat(String(value).replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

// Íslensk fleirtala: 1 aukahlut / 2 aukahluti (þolfall)
function plural(n, one, many) {
  return n % 10 === 1 && n % 100 !== 11 ? one : many;
}

// Talan er vistuð á Clerk aðgangi notandans (unsafeMetadata) svo hún fylgi
// á milli tækja. Hún gildir bara fyrir núverandi tímabil.
const METADATA_KEY = "soluthoknun";
const SAVE_DELAY_MS = 800;

function readAccountCount(user, periodKey) {
  const saved = user?.unsafeMetadata?.[METADATA_KEY];
  return saved?.period === periodKey ? String(saved.count) : null;
}

// Eldri útgáfa vistaði í vafranum; lesið einu sinni og flutt yfir á aðganginn.
const LEGACY_STORAGE_KEY = "soluthoknun-calc";

function readLegacyCount(periodKey) {
  try {
    const saved = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY));
    if (saved?.period !== periodKey || !saved.input) return null;
    const n = toNonNegative(saved.input);
    return String(
      Math.floor(saved.mode === "kr" ? n / COMMISSION_PER_ACCESSORY : n),
    );
  } catch {
    return null;
  }
}

function toCountString(value) {
  return value === "" ? "" : String(Math.floor(toNonNegative(value)));
}

// "YYYY-MM-DD" í staðartíma
function dateKey(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function Soluthoknun() {
  const period = currentPeriod();
  const periodKey = dateKey(period.start);
  const days = remainingSalesDays(period.end);
  const nextPeriodStart = new Date(
    period.end.getFullYear(),
    period.end.getMonth(),
    period.end.getDate() + 1,
  );

  const { user, isLoaded } = useUser();
  const [input, setInput] = useState("");
  const [syncState, setSyncState] = useState("idle"); // idle | saving | saved | error
  const hydratedRef = useRef(false);
  const lastSyncedRef = useRef("");
  // Clerk skiptir um user-hlut við hverja uppfærslu; ref kemur í veg fyrir tvívistun
  const userRef = useRef(user);
  userRef.current = user;

  // Sækja vistaða tölu af aðganginum
  useEffect(() => {
    if (!isLoaded || !user || hydratedRef.current) return;
    hydratedRef.current = true;
    const fromAccount = readAccountCount(user, periodKey);
    lastSyncedRef.current = fromAccount ?? "";
    // Ef ekkert er á aðganginum en eldri tala er í vafranum, flyst hún yfir við næstu vistun
    setInput(fromAccount ?? readLegacyCount(periodKey) ?? "");
  }, [isLoaded, user, periodKey]);

  // Vista á aðganginn þegar notandi hættir að slá inn
  useEffect(() => {
    if (!hydratedRef.current) return;
    const value = toCountString(input);
    if (value === lastSyncedRef.current) {
      // Ekkert að vista (t.d. strax eftir hleðslu, eða gildi breytt til baka)
      setSyncState((state) => (state === "saving" ? "saved" : state));
      return;
    }

    setSyncState("saving");
    const timer = setTimeout(async () => {
      const currentUser = userRef.current;
      if (!currentUser) return;
      try {
        await currentUser.update({
          unsafeMetadata: {
            ...currentUser.unsafeMetadata,
            [METADATA_KEY]: { period: periodKey, count: Number(value || 0) },
          },
        });
        lastSyncedRef.current = value;
        setSyncState("saved");
      } catch (err) {
        console.error("Failed to save commission count:", err);
        setSyncState("error");
      }
    }, SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [input, periodKey]);

  // Sækja nýjustu tölu þegar komið er aftur á síðuna (t.d. eftir breytingu í síma)
  useEffect(() => {
    if (!user) return;
    async function refresh() {
      if (document.visibilityState !== "visible") return;
      try {
        await user.reload();
      } catch {
        return;
      }
      const fromAccount = readAccountCount(user, periodKey);
      if (fromAccount === null) return;
      setInput((current) => {
        // Ekki skrifa yfir breytingu sem á eftir að vista
        if (toCountString(current) !== lastSyncedRef.current) return current;
        lastSyncedRef.current = fromAccount;
        return fromAccount;
      });
    }
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [user, periodKey]);

  const inputValue = toNonNegative(input);
  const soldSoFar = Math.floor(inputValue);

  const earned = Math.min(
    soldSoFar * COMMISSION_PER_ACCESSORY,
    MONTHLY_COMMISSION_CAP,
  );
  const remainingAmount = MONTHLY_COMMISSION_CAP - earned;
  const accessoriesNeeded = Math.max(ACCESSORIES_TO_CAP - soldSoFar, 0);

  const progress = Math.min(earned / MONTHLY_COMMISSION_CAP, 1);
  const capReached = accessoriesNeeded === 0;

  function adjust(delta) {
    setInput(String(Math.max(soldSoFar + delta, 0)));
  }

  return (
    <div className="sc-container">
      <header className="sc-header">
        <p className="sc-eyebrow">Söluþóknun</p>
        <h1 className="sc-heading">Svona virkar söluþóknunin</h1>
        <p className="sc-lead">
          Fáðu bónus fyrir aukahluti sem þú selur með tækjum.
        </p>
      </header>

      {/* Lykiltölur */}
      <section className="sc-section">
        <div className="sc-facts">
          <div className="sc-fact">
            <span className="sc-fact-value">
              {formatISK(COMMISSION_PER_ACCESSORY)}
            </span>
            <span className="sc-fact-label">
              fyrir hvern aukahlut sem seldur er í sömu færslu og iPhone, Mac,
              iPad eða Apple Watch
            </span>
          </div>
          <div className="sc-fact">
            <span className="sc-fact-value">
              {formatISK(MONTHLY_COMMISSION_CAP)}
            </span>
            <span className="sc-fact-label">
              hámarks söluþóknun á tímabili ({ACCESSORIES_TO_CAP} aukahlutir)
            </span>
          </div>
          <div className="sc-fact">
            <span className="sc-fact-value">
              {formatShortDate(period.start)} – {formatShortDate(period.end)}
            </span>
            <span className="sc-fact-live">
              <span className="sc-live-dot" aria-hidden="true" />
              Tímabilið sem er í gangi
            </span>
            <span className="sc-fact-label">
              Nýtt tímabil hefst {formatDayMonth(nextPeriodStart)}{" "}
              {days === 1 ? " - Á morgun" : ` - Eftir ${days} daga`}
            </span>
          </div>
        </div>
      </section>

      {/* Hvernig þóknun virkar: regla, dæmi og gildir flokkar í einum hluta */}
      <section className="sc-section">
        <h2 className="sc-section-heading">Hvenær færðu söluþóknun?</h2>
        <div className="sc-panel">
          <div className="sc-how">
            <div className="sc-how-card">
              <span className="sc-how-label">Svona virkar þetta</span>
              <ul className="sc-rule-list">
                <li>
                  <span className="sc-rule-icon yes" aria-hidden="true">
                    <FiCheck size={14} />
                  </span>
                  <span>
                    Aukahlutur þarf að vera seldur í{" "}
                    <strong>sömu færslu</strong> og iPhone, iPad, Mac eða Apple
                    Watch.
                  </span>
                </li>
                <li>
                  <span className="sc-rule-icon yes" aria-hidden="true">
                    <FiCheck size={14} />
                  </span>
                  <span>
                    <strong>{formatISK(COMMISSION_PER_ACCESSORY)}</strong> fyrir
                    hvern aukahlut úr gildum flokkum.
                  </span>
                </li>
                <li>
                  <span className="sc-rule-icon yes" aria-hidden="true">
                    <FiCheck size={14} />
                  </span>
                  <span>
                    Ef aukahluturinn er í{" "}
                    <strong>afsláttartilboði sem stjórnendur setja inn</strong>{" "}
                    færðu fulla söluþóknun.
                  </span>
                </li>
                <li>
                  <span className="sc-rule-icon no" aria-hidden="true">
                    <FiX size={14} />
                  </span>
                  <span>
                    <strong>Ef þú setur afslátt</strong> eða ef{" "}
                    <strong>viðskiptavinur er með fastan afslátt</strong> af
                    aukahlutnum fæst ekki söluþóknun.
                  </span>
                </li>

                <li>
                  <span className="sc-rule-icon no" aria-hidden="true">
                    <FiX size={14} />
                  </span>
                  <span>
                    <strong>
                      Aðeins aukahlutir sem þú selur telja til þinnar
                      söluþóknunar.
                    </strong>{" "}
                    Pantanir úr vefverslun og pantanir annarra sölumanna telja
                    ekki með.
                  </span>
                </li>
              </ul>
            </div>

            <div className="sc-how-card">
              <span className="sc-how-label">Dæmi um eina færslu</span>
              <div className="sc-receipt">
                <div className="sc-receipt-row">
                  <span className="sc-chip sc-chip-device">iPhone</span>
                  <span className="sc-receipt-amount muted">Tækið sjálft</span>
                </div>
                <div className="sc-receipt-row">
                  <span className="sc-chip">Hulstur</span>
                  <span className="sc-receipt-amount">
                    +{formatISK(COMMISSION_PER_ACCESSORY)}
                  </span>
                </div>
                <div className="sc-receipt-row">
                  <span className="sc-chip">PanzerGlass</span>
                  <span className="sc-receipt-amount">
                    +{formatISK(COMMISSION_PER_ACCESSORY)}
                  </span>
                </div>
                <div className="sc-receipt-total">
                  <span>Þín söluþóknun</span>
                  <span className="sc-example-total">
                    {formatISK(2 * COMMISSION_PER_ACCESSORY)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <h3 className="sc-panel-subheading">
            Eftirfarandi flokkar teljast til söluþóknunar
          </h3>
          <div className="sc-categories">
            {COMMISSION_CATEGORIES.map((cat) => (
              <div key={cat.id} className="sc-category">
                <div className="sc-category-head">
                  <span className="sc-category-icon">
                    {categoryIcons[cat.id]}
                  </span>
                  <h3>{cat.name}</h3>
                </div>
                <ul>
                  {cat.accessories.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reiknivél */}
      <section className="sc-section">
        <h2 className="sc-section-heading">Reiknivél</h2>
        <p className="sc-section-sub">
          Sjáðu hvað þú þarft að selja til að ná{" "}
          {formatISK(MONTHLY_COMMISSION_CAP)} fyrir {formatDayMonth(period.end)}
          .
        </p>

        <div className="sc-calc">
          <div className="sc-calc-inputs">
            <div className="sc-step">
              <div className="sc-step-head">
                <span className="sc-step-title">
                  Hvað hefur þú selt marga aukahluti á tímabilinu?
                </span>
              </div>

              <div className="sc-stepper">
                <button
                  type="button"
                  aria-label="Minnka"
                  onClick={() => adjust(-1)}
                  disabled={inputValue <= 0}
                >
                  <FiMinus size={20} />
                </button>
                <div className="sc-stepper-input">
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step={1}
                    placeholder="0"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    aria-label="Fjöldi aukahluta"
                  />
                  <span className="sc-stepper-unit">stk.</span>
                </div>
                <button
                  type="button"
                  aria-label="Auka"
                  onClick={() => adjust(1)}
                >
                  <FiPlus size={20} />
                </button>
              </div>
              <p className="sc-step-desc">
                Notaðu þetta til að halda utan um þína söluþóknun, allir flokkar
                saman. Bættu við með <strong>+</strong> í hvert skipti sem þú
                selur aukahlut með tæki. Talan núllstillist sjálfkrafa þegar
                nýtt tímabil hefst {formatDayMonth(nextPeriodStart)}.
              </p>
              <span
                className={`sc-sync sc-sync-${syncState}`}
                aria-live="polite"
              >
                {syncState === "saving" && "Vistar…"}
                {syncState === "error" && "Tókst ekki að vista. Reyndu aftur."}
                {(syncState === "idle" || syncState === "saved") &&
                  "Selt magn vistað á aðganginum þínum."}
              </span>
            </div>

            <div className="sc-days">
              <strong>{days}</strong> {plural(days, "dagur", "dagar")} eftir af
              tímabilinu ({formatDayMonth(period.start)} –{" "}
              {formatDayMonth(period.end)})
            </div>
          </div>

          <div className="sc-calc-results">
            {capReached ? (
              <div className="sc-done">
                <span className="sc-answer-big">Hámarki náð!</span>
                Þú hefur tryggt þér {formatISK(MONTHLY_COMMISSION_CAP)} í
                söluþóknun á þessu tímabili.
              </div>
            ) : (
              <div className="sc-answer">
                <span className="sc-answer-label">
                  Þú getur enn unnið þér inn
                </span>
                <span className="sc-answer-big">
                  {formatISK(remainingAmount)}
                </span>
                <span className="sc-answer-sub">
                  Seldu <strong>{accessoriesNeeded}</strong>{" "}
                  {plural(accessoriesNeeded, "aukahlut", "aukahluti")} til
                  viðbótar fyrir {formatDayMonth(period.end)}.
                </span>
              </div>
            )}

            <div className="sc-progress-head">
              <span>Söluþóknun hingað til</span>
              <strong>{formatISK(earned)}</strong>
            </div>
            <div
              className="sc-progress"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={MONTHLY_COMMISSION_CAP}
              aria-valuenow={earned}
            >
              <div
                className={`sc-progress-bar ${capReached ? "done" : ""}`}
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <div className="sc-progress-foot">
              <span>
                {soldSoFar} / {ACCESSORIES_TO_CAP} aukahlutir
              </span>
              <span>{Math.round(progress * 100)}%</span>
            </div>

            {!capReached && (
              <div className="sc-stats">
                <div className="sc-stat">
                  <span className="sc-stat-label">Aukahlutir seldir</span>
                  <span className="sc-stat-value">{soldSoFar}</span>
                </div>
                <div className="sc-stat">
                  <span className="sc-stat-label">Aukahlutir eftir</span>
                  <span className="sc-stat-value">{accessoriesNeeded}</span>
                </div>
                <div className="sc-stat">
                  <span className="sc-stat-label">Dagar eftir</span>
                  <span className="sc-stat-value">{days}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Tímabundin söluþóknun */}
      <SeasonalCommission icons={categoryIcons} />
    </div>
  );
}

export default Soluthoknun;
