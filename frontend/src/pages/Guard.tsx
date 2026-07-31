import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
    useLoadingOverlay,
    usePageLoading,
} from "../contexts/LoadingOverlayContext";
import { queueService } from "../services/api";
import "./Guard.css";

type ServiceKey =
  | "BALIK_MANGAGAWA"
  | "DIRECT_HIRE"
  | "G_TO_G"
  | "HELP_DESK"
  | "INFORMATION_SHEET";

interface ServiceDef {
  key: ServiceKey;
  label: string;
  serviceName: string;
}

const SERVICES: ServiceDef[] = [
  {
    key: "BALIK_MANGAGAWA",
    label: "BALIK MANGAGAWA",
    serviceName: "Balik Manggagawa",
  },
  { key: "DIRECT_HIRE", label: "DIRECT HIRE", serviceName: "Direct Hire" },
  { key: "G_TO_G", label: "G TO G", serviceName: "G to G" },
  { key: "HELP_DESK", label: "HELP DESK", serviceName: "Help Desk" },
  {
    key: "INFORMATION_SHEET",
    label: "INFORMATION SHEET",
    serviceName: "Information Sheet",
  },
];

const HELP_DESK_OPTIONS = ["INQUIRY", "PEOS", "ACCOUNT RETRIEVAL", "OEC"];

const HELP_DESK_BACKEND_MAP: Record<string, string> = {
  INQUIRY: "Inquiry",
  PEOS: "PEOS",
  "ACCOUNT RETRIEVAL": "Account Retrieval",
  OEC: "OEC",
};

type PriorityType = "PWD" | "SENIOR_CITIZEN" | "PREGNANT";

type DirectHireStep = "q1" | "q2-bm-appointment" | "q2-select" | "q3-name";

const PRIORITY_OPTIONS: { key: PriorityType; label: string }[] = [
  { key: "PWD", label: "Person with Disability" },
  { key: "SENIOR_CITIZEN", label: "SENIOR CITIZEN" },
  { key: "PREGNANT", label: "PREGNANT" },
];

const PRIORITY_LABEL: Record<PriorityType, string> = {
  PWD: "Person with Disability",
  SENIOR_CITIZEN: "Senior Citizen",
  PREGNANT: "Pregnant",
};

function Guard() {
  /* ---------- routing & auth ---------- */
  const navigate = useNavigate();

  /* ---------- loading overlay (ref-safe) ---------- */
  const { showLoading, hideLoading } = useLoadingOverlay();
  const showLoadingRef = useRef(showLoading);
  const hideLoadingRef = useRef(hideLoading);
  useEffect(() => {
    showLoadingRef.current = showLoading;
    hideLoadingRef.current = hideLoading;
  });

  /* ---------- state: page data fetch (for ticket generation overlay) ---------- */
  const [loading, setLoading] = useState(false);
  usePageLoading(loading, "", 300);

  /* ---------- state: service selection ---------- */
  const [selectedServices, setSelectedServices] = useState<ServiceKey[]>([]);

  /* ---------- state: modals ---------- */
  const [modalBalik, setModalBalik] = useState(false);
  const [modalDirectHire, setModalDirectHire] = useState(false);
  const [dhStep, setDhStep] = useState<DirectHireStep>("q1");
  const [modalG2G, setModalG2G] = useState(false);
  const [modalHelpDesk, setModalHelpDesk] = useState(false);
  const [modalPriority, setModalPriority] = useState(false);

  /* ---------- state: priority flag + selection ---------- */
  const [isPriority, setIsPriority] = useState(false);
  const [priorityType, setPriorityType] = useState<PriorityType | null>(null);

  /* ---------- state: ticket flow side-channel data ---------- */
  const [dhSubtype, setDhSubtype] = useState<"INQUIRY" | "APPOINTMENT" | null>(
    null,
  );
  // Client name collected on Direct Hire NO-path
  const [dhClientName, setDhClientName] = useState("");
  // G to G subtype
  const [g2gSubtype, setG2gSubtype] = useState<
    "INQUIRY" | "SUBMISSION_OF_REQUIREMENTS" | null
  >(null);
  // Help Desk multi-select
  const [helpDeskSelected, setHelpDeskSelected] = useState<string[]>([]);
  // Overall appointment flag (merged from various flows)
  const [hasAppointment, setHasAppointment] = useState(false);
  // Success result
  const [generatedTicket, setGeneratedTicket] = useState<any>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);

  /* ---------- auth guard ---------- */
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      navigate("/login");
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== "guard") {
      if (user.role === "superadmin") navigate("/dashboard");
      else if (user.role === "counter")
        navigate(`/counter/${user.counter?.id || 1}`);
    }
  }, [navigate]);

  /* ---------- helpers ---------- */
  const serviceNameOf = (k: ServiceKey) =>
    SERVICES.find((s) => s.key === k)!.serviceName;

  const counterNameOf = (id: number): string => {
    const map: Record<number, string> = {
      1: "Counter 1 — Help Desk / BM w/o Appointment",
      2: "Counter 2 — Help Desk / OEC / PEOS / AR",
      3: "Counter 3 — Information Sheet",
      4: "Counter 4 — Direct Hire / G to G",
      5: "Counter 5 — Balik Manggagawa w/ Appointment",
      6: "Counter 6",
      7: "Counter 7",
      8: "Counter 8",
    };
    return map[id] || `Counter ${id}`;
  };

  const parseAssignedCounterIds = (raw: any): number[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.map((n) => Number(n)).filter(Boolean);
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed))
          return parsed.map((n) => Number(n)).filter(Boolean);
      } catch (_) {}
      const csv = raw
        .split(",")
        .map((s) => Number(s.trim()))
        .filter(Boolean);
      if (csv.length) return csv;
    }
    return [];
  };

  const selectedServiceNames = useMemo(
    () => selectedServices.map((k) => serviceNameOf(k)),
    [selectedServices],
  );

  const addService = (k: ServiceKey) => {
    setSelectedServices((prev) =>
      prev.includes(k) ? prev : prev.length >= 7 ? prev : [...prev, k],
    );
  };

  const toggleService = (k: ServiceKey) => {
    setSelectedServices((prev) => {
      if (prev.includes(k)) {
        return prev.filter((x) => x !== k);
      }
      if (prev.length >= 7) {
        toast.warning("Maximum 7 services allowed per ticket!");
        return prev;
      }
      return [...prev, k];
    });
  };

  /* ---------- Priority checkbox toggle + modal handlers ---------- */
  const handlePriorityToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    if (checked) {
      // Open priority modal; only commit "priority ON" after user selects a type
      setModalPriority(true);
    } else {
      // Turning OFF → clear both
      setIsPriority(false);
      setPriorityType(null);
    }
  };

  const finishPrioritySelect = (type: PriorityType) => {
    setPriorityType(type);
    setIsPriority(true);
    setModalPriority(false);
  };

  const cancelPriorityModal = () => {
    // If user closes modal without picking (or had a prior selection),
    // keep the checkbox off to ensure consistency.
    if (!priorityType) {
      setIsPriority(false);
    }
    setModalPriority(false);
  };

  /* ---------- Service tile click handler ---------- */
  const handleServiceTileClick = (svc: ServiceDef) => {
    // If already selected → simple toggle OFF (no modal)
    if (selectedServices.includes(svc.key)) {
      toggleService(svc.key);
      return;
    }
    if (selectedServices.length >= 7) {
      toast.warning("Maximum 7 services allowed per ticket!");
      return;
    }

    switch (svc.key) {
      case "BALIK_MANGAGAWA":
        setModalBalik(true);
        break;
      case "DIRECT_HIRE":
        setDhStep("q1");
        setDhSubtype(null);
        setDhClientName("");
        setModalDirectHire(true);
        break;
      case "G_TO_G":
        setG2gSubtype(null);
        setModalG2G(true);
        break;
      case "HELP_DESK":
        setHelpDeskSelected([]);
        setModalHelpDesk(true);
        break;
      case "INFORMATION_SHEET":
      default:
        addService(svc.key);
        break;
    }
  };

  /* ---------- Balik Manggagawa modal finishers ---------- */
  const finishBalik = (has: boolean) => {
    if (has) setHasAppointment(true);
    addService("BALIK_MANGAGAWA");
    setModalBalik(false);
  };

  /* ---------- Direct Hire flow handlers ---------- */
  // Q1 YES → go to Balik-style appointment question
  const dhGoQ1Yes = () => setDhStep("q2-bm-appointment");
  // Q1 NO → go to Inquiry / Appointment selector
  const dhGoQ1No = () => setDhStep("q2-select");
  // BACK navigators
  const dhBackToQ1 = () => setDhStep("q1");
  const dhBackToQ2Select = () => setDhStep("q2-select");

  // YES-path (BM question) finisher: this is really a BM client, so add
  // BALIK_MANGAGAWA service (not DIRECT_HIRE) so routing assigns Counter 5
  // (with appointment) or Counters 1+2 (without appointment).
  const finishDhBmAppointment = (has: boolean) => {
    if (has) setHasAppointment(true);
    addService("BALIK_MANGAGAWA");
    setModalDirectHire(false);
  };

  // NO-path Q2: after user picks Inquiry or Appointment → go to ENTER NAME
  const proceedDhSelectToName = (subtype: "INQUIRY" | "APPOINTMENT") => {
    setDhSubtype(subtype);
    if (subtype === "APPOINTMENT") setHasAppointment(true);
    setDhClientName("");
    setDhStep("q3-name");
  };

  // NO-path final: after DONE on ENTER NAME
  const finishDhEnterName = () => {
    const trimmed = dhClientName.trim();
    if (!trimmed) {
      toast.error("Please enter the client's name.");
      return;
    }
    addService("DIRECT_HIRE");
    setModalDirectHire(false);
  };

  /* ---------- G to G finisher ---------- */
  const finishG2G = (subtype: "INQUIRY" | "SUBMISSION_OF_REQUIREMENTS") => {
    setG2gSubtype(subtype);
    addService("G_TO_G");
    setModalG2G(false);
  };

  /* ---------- Help Desk toggle + finisher ---------- */
  const toggleHelpDeskOption = (opt: string) => {
    setHelpDeskSelected((prev) =>
      prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt],
    );
  };
  const finishHelpDesk = () => {
    if (helpDeskSelected.length === 0) {
      toast.error("Please select at least one Help Desk option.");
      return;
    }
    addService("HELP_DESK");
    setModalHelpDesk(false);
  };

  /* ---------- Generate Ticket ---------- */
  const handleGenerateTicket = async () => {
    if (selectedServices.length === 0) {
      toast.error("Please select at least one service type!");
      return;
    }

    // Compose helpdesk_type from multiple flows
    const helpdeskParts: string[] = [];
    if (helpDeskSelected.length) {
      helpdeskParts.push(
        ...helpDeskSelected.map((o) => HELP_DESK_BACKEND_MAP[o] || o),
      );
    }
    if (dhSubtype) helpdeskParts.push(`Direct Hire: ${dhSubtype}`);
    if (g2gSubtype) helpdeskParts.push(`G2G: ${g2gSubtype.replace(/_/g, " ")}`);

    setLoading(true);
    try {
      const response = await queueService.addTicket({
        service_names: selectedServiceNames,
        has_appointment: hasAppointment,
        client_name: dhClientName.trim(),
        scheduled_time: "",
        scheduled_day: "",
        helpdesk_type: helpdeskParts.join(", "),
        is_priority: isPriority,
        priority_type: priorityType,
      });
      setGeneratedTicket(response.data);
      setShowTicketModal(true);

      // Reset everything for next ticket
      setSelectedServices([]);
      setHasAppointment(false);
      setDhSubtype(null);
      setDhClientName("");
      setG2gSubtype(null);
      setHelpDeskSelected([]);
      setIsPriority(false);
      setPriorityType(null);
      toast.success("Ticket generated successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to generate ticket!");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Sidebar actions ---------- */
  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="counter-mockup-dashboard guard-layout">
      {/* ====== HEADER ====== */}
      <div className="mockup-header">
        <div className="mockup-header-left">
          <div className="dmw-seal">
            <img src="/dmw.png" alt="DMW Seal" className="seal-img" />
          </div>
          <div className="dmw-text">
            <p className="dmw-republic">Republic of the Philippines</p>
            <p className="dmw-dept">DEPARTMENT OF MIGRANT WORKERS</p>
            <p className="dmw-office">Regional Office X</p>
          </div>
        </div>
        <div className="mockup-header-right">
          <span className="hello-user">hello, Guard</span>
          <div className="user-avatar">
            <svg viewBox="0 0 48 48" width="32" height="32" aria-hidden="true">
              <circle cx="24" cy="20" r="12" fill="#2c3e50" />
              <path d="M4 46 C 6 34, 42 34, 44 46 Z" fill="#2c3e50" />
            </svg>
          </div>
        </div>
      </div>

      {/* ====== BODY: sidebar + main content ====== */}
      <div className="mockup-body">
        {/* ----- SIDEBAR ----- */}
        <aside className="mockup-sidebar">
          <div className="sidebar-brand">
            <p className="brand-line1">DMW ROX</p>
            <p className="brand-line2">MWPSD</p>
          </div>

          <button
            className="sidebar-btn active"
            onClick={() => toast.info("Already on Dashboard")}
          >
            DASHBOARD
          </button>
          <button
            className="sidebar-btn"
            onClick={() => toast.info("Settings coming soon")}
          >
            SETTINGS
          </button>

          <div className="sidebar-spacer" />
          <button className="sidebar-logout" onClick={handleLogout}>
            LOGOUT
          </button>
        </aside>

        {/* ----- MAIN CONTENT ----- */}
        <main className="mockup-main guard-main">
          {/* Watermark layer */}
          <img
            src="/dmw.png"
            alt=""
            className="mockup-bottom-watermark guard-watermark"
            aria-hidden="true"
          />

          <div className="guard-services-card">
            <div className="guard-card-header-row">
              <label className="guard-priority-check" htmlFor="guard-priority">
                <input
                  id="guard-priority"
                  type="checkbox"
                  className="guard-priority-input"
                  checked={isPriority}
                  onChange={handlePriorityToggle}
                />
                <span
                  className={`guard-priority-checkmark ${
                    isPriority ? "checked" : ""
                  }`}
                  aria-hidden="true"
                >
                  {isPriority ? "✓" : ""}
                </span>
                <span className="guard-priority-label">PRIORITY?</span>
                {isPriority && priorityType && (
                  <span className="guard-priority-pill">
                    {PRIORITY_LABEL[priorityType]}
                  </span>
                )}
              </label>
            </div>
            <h2 className="guard-services-title">SELECT SERVICES</h2>

            <div className="guard-tile-grid">
              {SERVICES.map((s) => (
                <button
                  key={s.key}
                  className={`guard-tile ${
                    selectedServices.includes(s.key) ? "pressed" : ""
                  }`}
                  onClick={() => handleServiceTileClick(s)}
                  type="button"
                >
                  <span className="guard-tile-label">{s.label}</span>
                  {selectedServices.includes(s.key) && (
                    <span className="guard-tile-check" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </button>
              ))}
              {/* Bottom-right cell (6th grid slot) intentionally empty */}
              <div className="guard-tile guard-tile-empty" aria-hidden="true" />
            </div>

            {selectedServices.length > 0 && (
              <div className="guard-selected-row">
                <span className="guard-selected-label">Selected:</span>
                <span className="guard-selected-pills">
                  {selectedServices.map((k) => (
                    <span key={k} className="guard-selected-pill">
                      {serviceNameOf(k)}
                      <button
                        type="button"
                        className="guard-pill-close"
                        aria-label={`Remove ${serviceNameOf(k)}`}
                        onClick={() => toggleService(k)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </span>
              </div>
            )}

            <div className="guard-generate-row">
              <button
                type="button"
                className="mockup-mark-complete guard-generate-btn"
                onClick={handleGenerateTicket}
                disabled={loading || selectedServices.length === 0}
              >
                {loading ? "GENERATING..." : "GENERATE TICKET"}
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* =================================================================
         MODALS
         ================================================================= */}

      {/* ---------- SUCCESS: generated ticket modal ---------- */}
      {showTicketModal && generatedTicket && (
        <div
          className="modal-overlay"
          onClick={() => setShowTicketModal(false)}
        >
          <div
            className="modal-card modal-card-small"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="modal-title">TICKET GENERATED</h3>
            {generatedTicket.is_priority && (
              <div className="ticket-priority-banner">
                ⚠ PRIORITY —{" "}
                {generatedTicket.priority_type
                  ? (PRIORITY_LABEL[
                      generatedTicket.priority_type as PriorityType
                    ] ?? generatedTicket.priority_type)
                  : ""}
              </div>
            )}
            <div className="ticket-success-number">
              {generatedTicket.ticket_identifier}
            </div>
            <div className="ticket-success-services">
              {(
                generatedTicket.services || [generatedTicket.service_type]
              ).join(" · ")}
            </div>

            {generatedTicket.client_name && (
              <div className="ticket-info-row">
                <span className="ticket-info-label">Client:</span>
                <span className="ticket-info-value">
                  {generatedTicket.client_name}
                </span>
              </div>
            )}

            {generatedTicket.helpdesk_type && (
              <div className="ticket-info-row">
                <span className="ticket-info-label">Details:</span>
                <span className="ticket-info-value">
                  {generatedTicket.helpdesk_type}
                </span>
              </div>
            )}

            {parseAssignedCounterIds(generatedTicket.assigned_counter_ids)
              .length > 0 && (
              <div className="ticket-counter-block">
                <p className="ticket-counter-heading">ASSIGNED COUNTER</p>
                {parseAssignedCounterIds(
                  generatedTicket.assigned_counter_ids,
                ).map((cid) => (
                  <div key={cid} className="ticket-counter-chip">
                    {counterNameOf(cid)}
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              className="mockup-mark-complete modal-primary-btn"
              onClick={() => setShowTicketModal(false)}
            >
              DONE
            </button>
          </div>
        </div>
      )}

      {/* ---------- BALIK MANGAGAWA MODAL ---------- */}
      {modalBalik && (
        <div className="modal-overlay" onClick={() => setModalBalik(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title modal-title-accent">
              BALIK MANGAGAWA MODAL
            </h3>
            <p className="modal-question">Do you have an Appointment?</p>
            <div className="modal-yn-row">
              <button
                type="button"
                className="btn-bevel btn-navy"
                onClick={() => finishBalik(true)}
              >
                YES
              </button>
              <button
                type="button"
                className="btn-bevel btn-red"
                onClick={() => finishBalik(false)}
              >
                NO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- DIRECT HIRE MODAL (3-step) ---------- */}
      {modalDirectHire && (
        <div
          className="modal-overlay"
          onClick={() => setModalDirectHire(false)}
        >
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title modal-title-accent">DIRECT HIRE FLOW</h3>

            {dhStep === "q1" && (
              <>
                <p className="modal-question">
                  Did you already start with this employer?
                </p>
                <div className="modal-yn-row">
                  <button
                    type="button"
                    className="btn-bevel btn-navy"
                    onClick={dhGoQ1Yes}
                  >
                    YES
                  </button>
                  <button
                    type="button"
                    className="btn-bevel btn-red"
                    onClick={dhGoQ1No}
                  >
                    NO
                  </button>
                </div>
              </>
            )}

            {dhStep === "q2-bm-appointment" && (
              <>
                <p className="modal-question">Do you have an Appointment?</p>
                <div className="modal-yn-row">
                  <button
                    type="button"
                    className="btn-bevel btn-navy"
                    onClick={() => finishDhBmAppointment(true)}
                  >
                    YES
                  </button>
                  <button
                    type="button"
                    className="btn-bevel btn-red"
                    onClick={() => finishDhBmAppointment(false)}
                  >
                    NO
                  </button>
                </div>
                <div className="modal-back-row">
                  <button
                    type="button"
                    className="btn-bevel btn-gray"
                    onClick={dhBackToQ1}
                  >
                    ← BACK
                  </button>
                </div>
              </>
            )}

            {dhStep === "q2-select" && (
              <>
                <p className="modal-subtitle">SELECT ONE</p>
                <div className="modal-blue-stack">
                  <button
                    type="button"
                    className="btn-bevel btn-blue btn-wide"
                    onClick={() => proceedDhSelectToName("INQUIRY")}
                  >
                    INQUIRY
                  </button>
                  <button
                    type="button"
                    className="btn-bevel btn-blue btn-wide"
                    onClick={() => proceedDhSelectToName("APPOINTMENT")}
                  >
                    APPOINTMENT
                  </button>
                </div>
                <div className="modal-back-row">
                  <button
                    type="button"
                    className="btn-bevel btn-gray"
                    onClick={dhBackToQ1}
                  >
                    ← BACK
                  </button>
                </div>
              </>
            )}

            {dhStep === "q3-name" && (
              <>
                <p className="modal-name-title">ENTER YOUR NAME</p>
                <input
                  type="text"
                  className="modal-name-input"
                  value={dhClientName}
                  onChange={(e) => setDhClientName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") finishDhEnterName();
                  }}
                  placeholder="Full Name"
                  autoFocus
                />
                <div className="modal-done-row">
                  <button
                    type="button"
                    className="mockup-mark-complete modal-primary-btn"
                    onClick={finishDhEnterName}
                    disabled={!dhClientName.trim()}
                  >
                    DONE
                  </button>
                </div>
                <div className="modal-back-row">
                  <button
                    type="button"
                    className="btn-bevel btn-gray"
                    onClick={dhBackToQ2Select}
                  >
                    ← BACK
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ---------- G TO G MODAL ---------- */}
      {modalG2G && (
        <div className="modal-overlay" onClick={() => setModalG2G(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title modal-title-accent">G TO G MODAL</h3>
            <p className="modal-subtitle">SELECT ONE</p>
            <div className="modal-blue-stack">
              <button
                type="button"
                className="btn-bevel btn-blue btn-wide"
                onClick={() => finishG2G("INQUIRY")}
              >
                INQUIRY
              </button>
              <button
                type="button"
                className="btn-bevel btn-blue btn-wide"
                onClick={() => finishG2G("SUBMISSION_OF_REQUIREMENTS")}
              >
                SUBMISSION OF REQUIREMENTS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- HELP DESK MODAL ---------- */}
      {modalHelpDesk && (
        <div className="modal-overlay" onClick={() => setModalHelpDesk(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title modal-title-accent">HELP DESK MODAL</h3>
            <p className="modal-question">What do you need help with?</p>
            <div className="hd-option-grid">
              {HELP_DESK_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={`btn-bevel btn-blue ${
                    helpDeskSelected.includes(opt) ? "sunken" : ""
                  }`}
                  onClick={() => toggleHelpDeskOption(opt)}
                >
                  {opt}
                  {helpDeskSelected.includes(opt) && (
                    <span className="hd-opt-check" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="modal-done-row">
              <button
                type="button"
                className="mockup-mark-complete modal-primary-btn"
                onClick={finishHelpDesk}
                disabled={helpDeskSelected.length === 0}
              >
                DONE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- PRIORITY TYPE MODAL (checkbox triggers this) ---------- */}
      {modalPriority && (
        <div className="modal-overlay" onClick={cancelPriorityModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title modal-title-accent">SELECT ONE</h3>
            <div className="priority-option-stack">
              {PRIORITY_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  className={`btn-bevel btn-blue btn-wide priority-option-btn ${
                    priorityType === opt.key ? "sunken" : ""
                  }`}
                  onClick={() => finishPrioritySelect(opt.key)}
                >
                  {opt.label}
                  {priorityType === opt.key && (
                    <span className="priority-opt-check" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Guard;
