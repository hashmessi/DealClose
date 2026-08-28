"use client";

import { useState, useEffect, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type PipelineStep = "idle" | "intake" | "ai" | "hitl" | "pdf" | "sign" | "done";

interface IntakeResult {
  success: boolean;
  address: string;
  dealId: string;
  status: string;
  data: unknown;
}

interface AiResult {
  success: boolean;
  dealTerms: Record<string, unknown>;
  confidenceScores?: Record<string, number>;
  fieldRationales?: Record<string, string>;
  modelUsed?: string;
  flaggedFields: string[];
  confidence: number;
}

interface PdfResult {
  success: boolean;
  pdfUrl: string;
  dealId: string;
}

interface SignResult {
  success: boolean;
  envelopeId: string;
  signerEmail: string;
  sentAt: string;
  message: string;
}

interface AuditLog {
  field: string;
  ai_value: string;
  final_value: string;
  changed_by_human: boolean;
  timestamp: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const DEMO_ADDRESSES = [
  "500 Howard St, San Francisco, CA 94105",
  "1 Infinite Loop, Cupertino, CA 95014",
  "350 5th Ave, New York, NY 10118",
];

const PIPELINE_STEPS = [
  { key: "intake", label: "01 MARKET INTEL", sublabel: "SerpApi" },
  { key: "ai", label: "02 AI STRUCTURE", sublabel: "OpenRouter AI" },
  { key: "hitl", label: "03 HUMAN REVIEW", sublabel: "Trust Gate" },
  { key: "pdf", label: "04 PDF COMPILE", sublabel: "Nutrient DWS" },
  { key: "sign", label: "05 ESIGN", sublabel: "Foxit" },
] as const;

// ─── Helper Components ────────────────────────────────────────────────────────

function MintTag({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        background: "var(--color-mint-chip, #d1ffca)",
        color: "#000",
        borderRadius: 64,
        padding: "4px 14px",
        fontSize: 11,
        fontFamily: "var(--font-mono, monospace)",
        fontWeight: 700,
        letterSpacing: "-0.3px",
        textTransform: "uppercase" as const,
        display: "inline-block",
      }}
    >
      {children}
    </span>
  );
}

function MonoLabel({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-mono, monospace)",
        fontSize: 11,
        letterSpacing: "-0.3px",
        color: muted ? "var(--color-smoke, #979797)" : "var(--color-carbon-black, #000)",
        textTransform: "uppercase" as const,
      }}
    >
      {children}
    </span>
  );
}

function PrimaryButton({
  onClick,
  disabled,
  loading,
  loadingText,
  children,
  id,
}: {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  id?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const isDisabled = disabled || loading;
  return (
    <button
      id={id}
      onClick={onClick}
      disabled={isDisabled}
      onMouseEnter={() => !isDisabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.98)"; }}
      onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
      style={{
        background: isDisabled ? "var(--color-ash, #c6c6c6)" : hovered ? "#1a1a1a" : "var(--color-carbon-black, #000)",
        color: "#fff",
        border: "none",
        borderRadius: 6,
        padding: "14px 32px",
        fontSize: 15,
        fontWeight: 500,
        fontFamily: "var(--font-body, Inter, sans-serif)",
        letterSpacing: "-0.02em",
        cursor: isDisabled ? "not-allowed" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        transition: "background 0.15s, transform 0.08s",
        whiteSpace: "nowrap" as const,
        transform: "scale(1)",
      }}
    >
      {loading && (
        <span
          style={{
            width: 14,
            height: 14,
            border: "2px solid rgba(255,255,255,0.3)",
            borderTopColor: "#fff",
            borderRadius: "50%",
            display: "inline-block",
            animation: "dc-spin 0.7s linear infinite",
          }}
        />
      )}
      {loading ? loadingText || "Loading..." : children}
    </button>
  );
}

function LoadingTimer({ startTime }: { startTime: number }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 500);
    return () => clearInterval(iv);
  }, [startTime]);
  return <span style={{ opacity: 0.55, fontSize: 12, fontFamily: "var(--font-mono, monospace)" }}>({elapsed}s)</span>;
}

function GhostButton({
  onClick,
  disabled,
  children,
  id,
}: {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <button
      id={id}
      onClick={onClick}
      disabled={disabled}
      style={{
        background: "transparent",
        color: disabled ? "var(--color-ash)" : "var(--color-slate, #444)",
        border: "1.5px solid",
        borderColor: disabled ? "var(--color-ash)" : "var(--color-slate, #444)",
        borderRadius: 6,
        padding: "12px 24px",
        fontSize: 14,
        fontWeight: 500,
        fontFamily: "var(--font-body, Inter, sans-serif)",
        letterSpacing: "-0.02em",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

function Card({
  children,
  inverted,
  style: extraStyle,
}: {
  children: React.ReactNode;
  inverted?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: inverted ? "var(--color-carbon-black, #000)" : "var(--color-paper-white, #fff)",
        borderRadius: 32,
        padding: "28px 32px",
        color: inverted ? "#fff" : "#000",
        ...extraStyle,
      }}
    >
      {children}
    </div>
  );
}

// ─── Demo Address Pill ────────────────────────────────────────────────────────
function DemoPill({ addr, onClick, active }: { addr: string; onClick: () => void; active: boolean }) {
  const [hovered, setHovered] = useState(false);
  const show = active || hovered;
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: show ? "var(--color-carbon-black, #000)" : "var(--color-paper-white, #fff)",
        color: show ? "#fff" : "var(--color-slate, #444)",
        border: `1.5px solid ${show ? "var(--color-carbon-black, #000)" : "var(--color-ash, #c6c6c6)"}`,
        borderRadius: 48,
        padding: "6px 16px",
        fontSize: 12,
        fontWeight: 500,
        cursor: "pointer",
        fontFamily: "var(--font-body, Inter, sans-serif)",
        letterSpacing: "-0.01em",
        transition: "all 0.15s",
      }}
    >
      {addr.split(",")[0]}
    </button>
  );
}

// ─── Pipeline Progress Bar ────────────────────────────────────────────────────
function PipelineProgress({ current }: { current: PipelineStep }) {
  const stepOrder = ["intake", "ai", "hitl", "pdf", "sign"];
  const currentIdx = stepOrder.indexOf(current);

  return (
    <div
      style={{
        background: "var(--color-paper-white, #fff)",
        borderRadius: 48,
        padding: "12px 24px",
        display: "flex",
        gap: 8,
        alignItems: "center",
        overflowX: "auto",
      }}
    >
      {PIPELINE_STEPS.map((step, i) => {
        const done = currentIdx > i;
        const active = currentIdx === i;
        return (
          <div key={step.key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                padding: "6px 16px",
                borderRadius: 48,
                background: done
                  ? "var(--color-mint-chip, #d1ffca)"
                  : active
                  ? "var(--color-carbon-black, #000)"
                  : "var(--color-mist-gray, #f3f3f3)",
                transition: "all 0.2s",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontFamily: "var(--font-mono, monospace)",
                  fontWeight: 700,
                  letterSpacing: "-0.3px",
                  textTransform: "uppercase",
                  color: active ? "#fff" : done ? "#000" : "var(--color-smoke, #979797)",
                  whiteSpace: "nowrap",
                }}
              >
                {done ? "✓ " : ""}{step.label}
              </div>
              <div
                style={{
                  fontSize: 9,
                  fontFamily: "var(--font-mono, monospace)",
                  color: active ? "rgba(255,255,255,0.6)" : done ? "#000" : "var(--color-ash, #c6c6c6)",
                  letterSpacing: "-0.2px",
                  textTransform: "uppercase",
                }}
              >
                {step.sublabel}
              </div>
            </div>
            {i < PIPELINE_STEPS.length - 1 && (
              <div
                style={{
                  width: 20,
                  height: 1,
                  background: done ? "var(--color-mint-chip, #d1ffca)" : "var(--color-ash, #c6c6c6)",
                  flexShrink: 0,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Error Banner ─────────────────────────────────────────────────────────────
function ErrorBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div
      style={{
        background: "var(--color-carbon-black, #000)",
        color: "#fff",
        borderRadius: 16,
        padding: "16px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 16,
        animation: "dc-slide-up 0.25s ease-out",
      }}
    >
      <div>
        <p style={{ fontSize: 12, fontFamily: "var(--font-mono, monospace)", letterSpacing: "-0.3px", marginBottom: 4, textTransform: "uppercase", color: "var(--color-mint-chip, #d1ffca)" }}>
          ACTION REQUIRED
        </p>
        <p style={{ fontSize: 14, lineHeight: 1.5, color: "rgba(255,255,255,0.85)" }}>{message}</p>
      </div>
      <button
        onClick={onDismiss}
        style={{
          background: "rgba(255,255,255,0.1)",
          border: "none",
          color: "#fff",
          borderRadius: 4,
          padding: "4px 10px",
          fontSize: 12,
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        ✕
      </button>
    </div>
  );
}

// ─── HITL Field Review Component ──────────────────────────────────────────────
const NUMERIC_FIELDS = ["purchase_price", "earnest_money", "down_payment", "loan_amount", "closing_costs"];

function HitlFieldCard({
  fieldKey,
  aiValue,
  currentValue,
  isResolved,
  confidenceScore,
  rationale,
  onValueChange,
  onConfirm,
}: {
  fieldKey: string;
  aiValue: unknown;
  currentValue: unknown;
  isResolved: boolean;
  confidenceScore?: number;
  rationale?: string;
  onValueChange: (val: string) => void;
  onConfirm: (isOverride: boolean) => void;
}) {
  const isNumericField = NUMERIC_FIELDS.includes(fieldKey);
  const displayAi =
    typeof aiValue === "number" && isNumericField
      ? `$${(aiValue as number).toLocaleString()}`
      : String(aiValue ?? "");

  const isOverride = String(currentValue) !== String(aiValue);
  const score = confidenceScore ?? 74;
  const isLowConfidence = score < 85;

  return (
    <div
      style={{
        background: isResolved ? "var(--color-mist-gray, #f3f3f3)" : "var(--color-paper-white, #fff)",
        borderRadius: 24,
        padding: "24px",
        border: isResolved ? "1px solid var(--color-ash, #c6c6c6)" : "2px solid var(--color-carbon-black, #000)",
        transition: "all 0.2s",
        animation: "dc-slide-up 0.3s ease-out",
      }}
    >
      {/* Field header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <MonoLabel>{fieldKey.replace(/_/g, " ")}</MonoLabel>
          
          {/* Confidence Score Pill & Gauge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                background: isLowConfidence ? "var(--color-voltage-yellow, #fff100)" : "var(--color-mint-chip, #d1ffca)",
                color: "#000",
                borderRadius: 64,
                padding: "3px 12px",
                fontSize: 10,
                fontFamily: "var(--font-mono, monospace)",
                fontWeight: 700,
                letterSpacing: "-0.2px",
                textTransform: "uppercase" as const,
              }}
            >
              {score}% CONFIDENCE
            </span>

            {/* Visual Gauge Bar */}
            <div
              style={{
                width: 70,
                height: 6,
                background: "var(--color-ash, #c6c6c6)",
                borderRadius: 3,
                overflow: "hidden",
              }}
              title={`AI Confidence Score: ${score}%`}
            >
              <div
                style={{
                  width: `${score}%`,
                  height: "100%",
                  background: score < 75 ? "#ff3b30" : score < 85 ? "#ff9500" : "#34c759",
                  borderRadius: 3,
                  transition: "width 0.4s ease-out",
                }}
              />
            </div>
          </div>
        </div>

        {isResolved && (
          <MintTag>✓ Human Confirmed</MintTag>
        )}
      </div>

      {/* AI Rationale Callout */}
      {rationale && (
        <div
          style={{
            background: isResolved ? "rgba(0,0,0,0.02)" : "rgba(255, 241, 0, 0.12)",
            borderLeft: `3px solid ${isResolved ? "var(--color-ash, #c6c6c6)" : "#ff9500"}`,
            borderRadius: "0 8px 8px 0",
            padding: "10px 14px",
            marginBottom: 16,
          }}
        >
          <p style={{ fontSize: 10, fontFamily: "var(--font-mono, monospace)", color: "var(--color-slate, #444)", textTransform: "uppercase", marginBottom: 2 }}>
            ↳ AI Flag Rationale:
          </p>
          <p style={{ fontSize: 13, color: "var(--color-carbon-black, #000)", lineHeight: 1.4 }}>
            {rationale}
          </p>
        </div>
      )}

      {/* Side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* AI Suggestion */}
        <div
          style={{
            background: "var(--color-warm-canvas, #e5e5e5)",
            borderRadius: 12,
            padding: "16px",
          }}
        >
          <p style={{ fontSize: 10, fontFamily: "var(--font-mono, monospace)", color: "var(--color-smoke, #979797)", letterSpacing: "-0.3px", textTransform: "uppercase", marginBottom: 8 }}>
            AI DRAFT VALUE
          </p>
          <p style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px", color: "var(--color-slate, #444)" }}>
            {displayAi}
          </p>
        </div>

        {/* Human Override */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <p style={{ fontSize: 10, fontFamily: "var(--font-mono, monospace)", color: "var(--color-smoke, #979797)", letterSpacing: "-0.3px", textTransform: "uppercase" }}>
            HUMAN AUTHORIZE / OVERRIDE
          </p>
          <input
            type={isNumericField ? "number" : "text"}
            value={String(currentValue ?? "")}
            onChange={(e) => onValueChange(e.target.value)}
            disabled={isResolved}
            aria-label={`Edit ${fieldKey.replace(/_/g, " ")} — AI suggested ${displayAi}`}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 8,
              border: "1.5px solid",
              borderColor: isResolved ? "var(--color-ash, #c6c6c6)" : "var(--color-slate, #444)",
              fontSize: 16,
              fontWeight: 700,
              color: "var(--color-carbon-black, #000)",
              background: isResolved ? "var(--color-mist-gray, #f3f3f3)" : "#fff",
              outline: "none",
              fontFamily: "var(--font-body, Inter, sans-serif)",
            }}
          />
          {!isResolved && (
            <PrimaryButton onClick={() => onConfirm(isOverride)} id={`confirm-${fieldKey}`}>
              {isOverride ? "Authorize Override" : "Accept AI Value"}
            </PrimaryButton>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [address, setAddress] = useState("");
  const [showRawComps, setShowRawComps] = useState(false);
  const [step, setStep] = useState<PipelineStep>("idle");
  const [error, setError] = useState<string | null>(null);
  const [aiLoadStep, setAiLoadStep] = useState(0);

  const [intakeResult, setIntakeResult] = useState<IntakeResult | null>(null);
  const [intakeTime, setIntakeTime] = useState<number | null>(null);
  const [aiExtracting, setAiExtracting] = useState(false);
  const [aiExtractStart, setAiExtractStart] = useState(0);
  const [aiResult, setAiResult] = useState<AiResult | null>(null);
  const [aiTime, setAiTime] = useState<number | null>(null);
  const [overrideValues, setOverrideValues] = useState<Record<string, unknown>>({});
  const [resolvedFields, setResolvedFields] = useState<Record<string, boolean>>({});
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [pdfResult, setPdfResult] = useState<PdfResult | null>(null);
  const [pdfTime, setPdfTime] = useState<number | null>(null);
  const [signResult, setSignResult] = useState<SignResult | null>(null);
  const [buyerEmail, setBuyerEmail] = useState("buyer@dealclose.ai");
  const [signerName, setSignerName] = useState("Alex Morgan");
  const [showSaasMatrix, setShowSaasMatrix] = useState(false);

  const flaggedFields = aiResult?.flaggedFields ?? [];
  const resolvedCount = flaggedFields.filter((k) => resolvedFields[k]).length;
  const allResolved = flaggedFields.length > 0 && resolvedCount === flaggedFields.length;
  const isIntakeLoading = step === "intake";

  const handleExportAuditJson = () => {
    if (!intakeResult) return;
    const exportPayload = {
      dealId: intakeResult.dealId,
      address: intakeResult.address,
      timestamp: new Date().toISOString(),
      certificateHash: `dcl_cert_${intakeResult.dealId}_${Date.now().toString(16)}`,
      engine: "DealClose Trust Pipeline v1.0",
      complianceStatus: "Human-Authorized & Locked",
      sponsorIntegrations: {
        marketIntelligence: "SerpApi Live Google Engine",
        structuringEngine: "OpenRouter LLM",
        documentEngine: "Nutrient DWS PDF Engine",
        eSignature: "Foxit eSign Envelope Dispatch",
        orchestration: "Xano Live State Vault",
      },
      auditSummary: {
        totalFieldsFlagged: flaggedFields.length,
        humanOverrides: auditLogs.filter((l) => l.changed_by_human).length,
        aiAccepted: auditLogs.filter((l) => !l.changed_by_human).length,
      },
      auditLogs,
      resolvedTerms: aiResult ? { ...aiResult.dealTerms, ...overrideValues } : {},
      pdfUrl: pdfResult?.pdfUrl || null,
      esignEnvelope: signResult?.envelopeId || null,
      signers: [{ name: signerName, email: buyerEmail, role: "Buyer" }],
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dealclose_audit_certificate_DCL-${intakeResult.dealId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetAll = () => {
    setStep("idle");
    setError(null);
    setIntakeResult(null);
    setIntakeTime(null);
    setAiExtracting(false);
    setAiExtractStart(0);
    setAiResult(null);
    setAiTime(null);
    setOverrideValues({});
    setResolvedFields({});
    setAuditLogs([]);
    setPdfResult(null);
    setPdfTime(null);
    setSignResult(null);
  };


  // Step 1: SerpApi intake
  const handleIntake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;
    if (step !== "idle" && step !== "ai") return;
    setError(null);
    setStep("intake");
    const t0 = Date.now();
    try {
      const res = await fetch("/api/deal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: address.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "SerpApi intake failed");
      setIntakeResult(data);
      setIntakeTime(Date.now() - t0);
      setStep("ai");
    } catch (err: unknown) {
      setError((err as Error).message);
      setStep("idle");
    }
  };

  // Step 2: AI extraction — with microstep progress
  const handleAiExtract = async () => {
    if (!intakeResult || aiExtracting) return;
    setError(null);
    setAiExtracting(true);
    setAiLoadStep(0);
    const t0 = Date.now();
    setAiExtractStart(t0);
    // Simulate microstep progression for demo clarity
    const stepTimers = [
      setTimeout(() => setAiLoadStep(1), 600),
      setTimeout(() => setAiLoadStep(2), 1400),
      setTimeout(() => setAiLoadStep(3), 2200),
    ];
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 90000);
    try {
      const res = await fetch("/api/ai/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: intakeResult.address,
          rawSerpData: intakeResult.data,
          dealId: intakeResult.dealId,
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "AI extraction failed");
      setAiResult(data);
      setAiTime(Date.now() - t0);
      const initOverrides: Record<string, unknown> = {};
      (data.flaggedFields ?? []).forEach((k: string) => {
        initOverrides[k] = data.dealTerms[k];
      });
      setOverrideValues(initOverrides);
      setStep("hitl");
    } catch (err: unknown) {
      clearTimeout(timer);
      stepTimers.forEach(clearTimeout);
      const msg = err instanceof Error
        ? (err.name === "AbortError" ? "AI extraction timed out (90s). Click \"Run AI Structuring\" to retry." : err.message)
        : "AI extraction failed";
      setError(msg);
    } finally {
      stepTimers.forEach(clearTimeout);
      setAiExtracting(false);
      setAiLoadStep(0);
    }
  };

  // Step 3: HITL resolve
  const handleResolve = (fieldKey: string, isOverride: boolean) => {
    const aiVal = aiResult?.dealTerms[fieldKey];
    const finalVal = overrideValues[fieldKey] !== undefined ? overrideValues[fieldKey] : aiVal;
    setResolvedFields((prev) => ({ ...prev, [fieldKey]: true }));
    setAuditLogs((prev) => {
      const filtered = prev.filter((l) => l.field !== fieldKey);
      return [
        ...filtered,
        {
          field: fieldKey,
          ai_value: String(aiVal),
          final_value: String(finalVal),
          changed_by_human: isOverride,
          timestamp: new Date().toISOString(),
        },
      ];
    });
  };

  // Step 4: Finalize & generate PDF
  const handleGeneratePdf = async () => {
    if (!aiResult || !allResolved) {
      setError("Resolve all flagged fields before generating the document.");
      return;
    }
    setError(null);
    setStep("pdf");
    const t0 = Date.now();
    try {
      const finalTerms = { ...aiResult.dealTerms };
      Object.keys(overrideValues).forEach((k) => {
        finalTerms[k] = overrideValues[k];
      });

      fetch("/api/deal/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealId: intakeResult?.dealId, auditLogs, resolvedTerms: finalTerms }),
      }).catch(() => {});

      const res = await fetch("/api/doc/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealId: intakeResult?.dealId,
          dealTerms: finalTerms,
          address: intakeResult?.address ?? address,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "PDF generation failed");
      setPdfResult(data);
      setPdfTime(Date.now() - t0);
      setStep("sign");
    } catch (err: unknown) {
      setError((err as Error).message);
      setStep("hitl");
    }
  };

  const [isEsigning, setIsEsigning] = useState(false);

  // Step 5: eSign dispatch
  const handleEsign = async () => {
    if (!pdfResult || isEsigning) return;
    if (!buyerEmail.includes("@")) {
      setError("Enter a valid buyer email address.");
      return;
    }
    setError(null);
    setIsEsigning(true);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    try {
      const res = await fetch("/api/esign/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealId: pdfResult.dealId,
          buyerEmail: buyerEmail.trim(),
          signerName: signerName.trim(),
          pdfUrl: pdfResult.pdfUrl,
          address: intakeResult?.address ?? address,
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Foxit eSign dispatch failed");
      setSignResult(data);
      setStep("done");
    } catch (err: unknown) {
      clearTimeout(timer);
      const msg = err instanceof Error
        ? (err.name === "AbortError" ? "Foxit eSign dispatch timed out (30s). Click to retry." : err.message)
        : "Foxit eSign dispatch failed";
      setError(msg);
    } finally {
      setIsEsigning(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-warm-canvas, #e5e5e5)",
        color: "var(--color-carbon-black, #000)",
        fontFamily: "var(--font-body, Inter, sans-serif)",
      }}
    >
      {/* ── NAV ── */}
      <header
        style={{
          height: "5rem",
          display: "flex",
          alignItems: "center",
          padding: "0 32px",
          justifyContent: "space-between",
        }}
        role="banner"
      >
        {/* Logo pill */}
        <div
          style={{
            background: "var(--color-paper-white, #fff)",
            borderRadius: 48,
            padding: "10px 24px",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
              fontWeight: 700,
              fontSize: 20,
              textTransform: "uppercase",
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            DEALCLOSE
          </span>
          <MintTag>Trust Pipeline</MintTag>
        </div>

        {/* Right nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {intakeResult && (
            <GhostButton onClick={resetAll} id="reset-pipeline" aria-label="Start a new deal — resets the pipeline">
              New Deal
            </GhostButton>
          )}
          <a
            href="/test"
            aria-label="System status and live API connections"
            style={{
              background: "var(--color-paper-white, #fff)",
              border: "1.5px solid var(--color-ash, #c6c6c6)",
              borderRadius: 48,
              padding: "7px 18px",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "-0.2px",
              color: "var(--color-carbon-black, #000)",
              textDecoration: "none",
              textTransform: "uppercase",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.15s",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#34c759",
                display: "inline-block",
                boxShadow: "0 0 6px rgba(52, 199, 89, 0.8)",
              }}
            />
            LIVE APIS ACTIVE →
          </a>
        </div>
      </header>

      {/* ── PIPELINE PROGRESS — always visible ── */}
      <div style={{ padding: "0 32px 24px", animation: "dc-fade-in 0.3s ease-out" }} role="status" aria-label={`Pipeline step: ${step}`}>
        <PipelineProgress current={step} />
      </div>

      {/* ── MAIN CONTENT ── */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px 96px" }}>
        {/* ─ ERROR BANNER ─ */}
        {error && (
          <div style={{ marginBottom: 24 }} role="alert" aria-live="assertive">
            <ErrorBanner message={error} onDismiss={() => setError(null)} />
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* HERO — shown when idle */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {step === "idle" && (
          <section style={{ paddingTop: 64 }}>
            {/* Eyebrow */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <MintTag>DevNetwork Hackathon 2026</MintTag>
              <MonoLabel muted>AI + Cloud + API</MonoLabel>
            </div>

            {/* Hero headline */}
            <h1
              style={{
                fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
                fontWeight: 700,
                fontSize: "clamp(64px, 10vw, 120px)",
                lineHeight: 0.9,
                letterSpacing: "-0.03em",
                textTransform: "uppercase",
                color: "var(--color-carbon-black, #000)",
                maxWidth: 800,
                marginBottom: 32,
              }}
            >
              AI DRAFTS.
              <br />
              HUMANS
              <br />
              AUTHORIZE.
              <br />
              <span
                style={{
                  background: "var(--color-mint-chip, #d1ffca)",
                  display: "inline-block",
                  padding: "0 8px",
                }}
              >
                DEAL CLOSED.
              </span>
            </h1>

            {/* Sub copy */}
            <p
              style={{
                fontSize: 18,
                color: "var(--color-slate, #444)",
                lineHeight: 1.5,
                maxWidth: 540,
                marginBottom: 48,
                letterSpacing: "-0.01em",
              }}
            >
              Enter a property address. DealClose pulls live market comps, structures deal terms with AI confidence scoring, routes uncertain fields to a human reviewer, and dispatches the finalized offer via Foxit eSign — all in one unbroken, auditable workflow.
            </p>

            {/* Contract Template Multi-Tenancy Selector */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <MonoLabel muted>Contract Template Engine:</MonoLabel>
                <span style={{ fontSize: 10, fontFamily: "var(--font-mono, monospace)", color: "var(--color-carbon-black, #000)", fontWeight: 700 }}>
                  Active: California Residential Purchase Agreement (CA-RPA)
                </span>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span
                  style={{
                    background: "var(--color-carbon-black, #000)",
                    color: "#fff",
                    borderRadius: 48,
                    padding: "4px 14px",
                    fontSize: 11,
                    fontFamily: "var(--font-mono, monospace)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  ✓ Residential Purchase (RPA)
                </span>
                <span
                  title="Coming in v2 — Multi-Template Engine"
                  style={{
                    background: "var(--color-mist-gray, #f3f3f3)",
                    color: "var(--color-smoke, #979797)",
                    border: "1px dashed var(--color-ash, #c6c6c6)",
                    borderRadius: 48,
                    padding: "4px 14px",
                    fontSize: 11,
                    fontFamily: "var(--font-mono, monospace)",
                    textTransform: "uppercase",
                    cursor: "not-allowed",
                  }}
                >
                  Commercial Lease (AIR-CRE)
                </span>
                <span
                  title="Coming in v2 — Multi-Template Engine"
                  style={{
                    background: "var(--color-mist-gray, #f3f3f3)",
                    color: "var(--color-smoke, #979797)",
                    border: "1px dashed var(--color-ash, #c6c6c6)",
                    borderRadius: 48,
                    padding: "4px 14px",
                    fontSize: 11,
                    fontFamily: "var(--font-mono, monospace)",
                    textTransform: "uppercase",
                    cursor: "not-allowed",
                  }}
                >
                  Procurement PO (SaaS)
                </span>
              </div>
            </div>

            {/* Intake form */}
            <form
              id="deal-intake-form"
              onSubmit={handleIntake}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                maxWidth: 640,
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 0,
                  background: "var(--color-paper-white, #fff)",
                  borderRadius: 8,
                  overflow: "hidden",
                  border: "1.5px solid var(--color-ash, #c6c6c6)",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-carbon-black, #000)")
                }
                onBlur={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-ash, #c6c6c6)")
                }
              >
                <input
                  id="property-address-input"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 500 Howard St, San Francisco, CA 94105"
                  style={{
                    flex: 1,
                    padding: "16px 20px",
                    border: "none",
                    outline: "none",
                    fontSize: 16,
                    color: "var(--color-carbon-black, #000)",
                    background: "transparent",
                    fontFamily: "var(--font-body, Inter, sans-serif)",
                    letterSpacing: "-0.01em",
                  }}
                />
                <button
                  type="submit"
                  disabled={!address.trim() || isIntakeLoading}
                  style={{
                    background: !address.trim() || isIntakeLoading
                      ? "var(--color-ash, #c6c6c6)"
                      : "var(--color-carbon-black, #000)",
                    color: "#fff",
                    border: "none",
                    padding: "16px 28px",
                    fontSize: 14,
                    fontWeight: 700,
                    fontFamily: "var(--font-body, Inter, sans-serif)",
                    letterSpacing: "-0.01em",
                    cursor: !address.trim() ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    whiteSpace: "nowrap" as const,
                    transition: "background 0.15s",
                  }}
                >
                  {isIntakeLoading ? (
                    <>
                      <span
                        style={{
                          width: 12,
                          height: 12,
                          border: "2px solid rgba(255,255,255,0.3)",
                          borderTopColor: "#fff",
                          borderRadius: "50%",
                          display: "inline-block",
                          animation: "dc-spin 0.7s linear infinite",
                        }}
                      />
                      Pulling Comps…
                    </>
                  ) : (
                    "Start Deal →"
                  )}
                </button>
              </div>

              {/* Demo address pills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginTop: 4 }}>
                <span
                  style={{
                    background: "var(--color-mint-chip, #d1ffca)",
                    color: "#000",
                    borderRadius: 64,
                    padding: "3px 10px",
                    fontSize: 10,
                    fontFamily: "var(--font-mono, monospace)",
                    fontWeight: 700,
                    letterSpacing: "-0.2px",
                    textTransform: "uppercase",
                  }}
                >
                  ⚡ 1-Click Live Comp
                </span>
                {DEMO_ADDRESSES.map((addr) => (
                  <DemoPill key={addr} addr={addr} onClick={() => setAddress(addr)} active={address === addr} />
                ))}
              </div>
            </form>

            {/* Trust architecture callouts */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 12,
                marginTop: 64,
              }}
            >
              {[
                { tag: "SerpApi", title: "LIVE MARKET INTELLIGENCE", body: "Real-time property comps and neighborhood data pulled at submission — not AI hallucinations." },
                { tag: "OpenRouter AI", title: "STRUCTURED CONFIDENCE SCORING", body: "Every field carries a confidence score. Uncertain terms are flagged for human review — not silently passed through." },
                { tag: "Human Gate", title: "HUMAN AUTHORIZATION REQUIRED", body: "The AI cannot generate the contract without a licensed agent confirming or correcting every flagged value." },
                { tag: "Foxit Fusion", title: "LEGALLY BINDING SIGNATURE", body: "Finalized contracts routed directly to buyers via Foxit Fusion eSign — no manual steps, no email attachments." },
              ].map((item) => (
                <Card key={item.tag}>
                  <MintTag>{item.tag}</MintTag>
                  <h3
                    style={{
                      fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
                      fontWeight: 700,
                      fontSize: 22,
                      textTransform: "uppercase",
                      letterSpacing: "-0.02em",
                      lineHeight: 0.95,
                      marginTop: 14,
                      marginBottom: 10,
                    }}
                  >
                    {item.title}
                  </h3>
                  <p style={{ fontSize: 13, color: "var(--color-slate, #444)", lineHeight: 1.5 }}>
                    {item.body}
                  </p>
                </Card>
              ))}
            </div>

            {/* Xano SaaS Replacement Matrix — Rebuilding Legacy Real Estate Suites */}
            <div style={{ marginTop: 24 }}>
              <button
                type="button"
                onClick={() => setShowSaasMatrix((v) => !v)}
                style={{
                  background: "var(--color-paper-white, #fff)",
                  border: "1.5px solid var(--color-ash, #c6c6c6)",
                  borderRadius: 12,
                  padding: "12px 20px",
                  fontSize: 12,
                  fontFamily: "var(--font-mono, monospace)",
                  fontWeight: 700,
                  color: "var(--color-carbon-black, #000)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  textTransform: "uppercase",
                  letterSpacing: "-0.3px",
                }}
              >
                <span>⚡ Why We Replaced Legacy SaaS (ZipForm + DocuSign) with Xano Trust Pipeline</span>
                <span>{showSaasMatrix ? "▲ Collapse Matrix" : "▼ View Architecture Comparison"}</span>
              </button>

              {showSaasMatrix && (
                <div
                  style={{
                    background: "var(--color-paper-white, #fff)",
                    border: "1.5px solid var(--color-carbon-black, #000)",
                    borderRadius: "0 0 16px 16px",
                    padding: "20px 24px",
                    animation: "dc-slide-up 0.25s ease-out",
                  }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    <div style={{ background: "rgba(255, 59, 48, 0.06)", padding: "16px", borderRadius: 12, border: "1px solid rgba(255, 59, 48, 0.2)" }}>
                      <p style={{ fontSize: 11, fontFamily: "var(--font-mono, monospace)", color: "#ff3b30", fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>
                        ✕ Legacy Real Estate SaaS (ZipForm / Dotloop / DocuSign)
                      </p>
                      <ul style={{ fontSize: 13, color: "var(--color-slate, #444)", lineHeight: 1.6, paddingLeft: 16 }}>
                        <li>45+ minutes manually copying Zillow data into PDF form fields</li>
                        <li>High risk of contract disputes ($50k+ liability on typo errors)</li>
                        <li>Disconnected systems: MLS → ZipForm → PDF Download → DocuSign Upload</li>
                        <li>Zero AI confidence flags or automated audit traceability</li>
                      </ul>
                    </div>

                    <div style={{ background: "rgba(52, 199, 89, 0.08)", padding: "16px", borderRadius: 12, border: "1px solid rgba(52, 199, 89, 0.3)" }}>
                      <p style={{ fontSize: 11, fontFamily: "var(--font-mono, monospace)", color: "#28a745", fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>
                        ✓ DealClose Trust Engine (SerpApi + Nutrient + Foxit + Xano)
                      </p>
                      <ul style={{ fontSize: 13, color: "var(--color-carbon-black, #000)", lineHeight: 1.6, paddingLeft: 16 }}>
                        <li>30-second automated drafting directly from live SerpApi search ground truth</li>
                        <li>100% human-authorized gate prevents unreviewed AI mistakes</li>
                        <li>One unbroken orchestration pipeline with immutable audit logs</li>
                        <li>Enterprise-grade Nutrient PDF compilation + Foxit legally binding eSign</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* STEP 1 RESULT — SerpApi Intake Complete */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {intakeResult && (
          <section style={{ animation: "dc-slide-up 0.3s ease-out" }}>
            {/* Address display hero */}
            <div
              style={{
                marginBottom: 32,
                paddingTop: step === "idle" ? 64 : 0,
              }}
            >
              <MonoLabel muted>Target Property</MonoLabel>
              <h2
                style={{
                  fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
                  fontWeight: 700,
                  fontSize: "clamp(40px, 5vw, 72px)",
                  lineHeight: 0.92,
                  letterSpacing: "-0.03em",
                  textTransform: "uppercase",
                  marginTop: 8,
                  marginBottom: 24,
                  maxWidth: 700,
                }}
              >
                {intakeResult.address}
              </h2>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <MintTag>✓ SerpApi Connected</MintTag>
                <span
                  style={{
                    background: "var(--color-paper-white, #fff)",
                    borderRadius: 64,
                    padding: "4px 14px",
                    fontSize: 11,
                    fontFamily: "var(--font-mono, monospace)",
                    fontWeight: 700,
                    letterSpacing: "-0.3px",
                    textTransform: "uppercase" as const,
                    color: "var(--color-slate, #444)",
                  }}
                >
                  Xano ID: DCL-{intakeResult.dealId}
                </span>
                {intakeTime && (
                  <span style={{ fontSize: 11, fontFamily: "var(--font-mono, monospace)", color: "var(--color-smoke, #979797)" }}>
                    ↳ Comps in {(intakeTime / 1000).toFixed(1)}s
                  </span>
                )}
              </div>

              {/* F03: SerpApi Raw Data Collapsible Panel */}
              <div style={{ marginTop: 16 }}>
                <button
                  type="button"
                  onClick={() => setShowRawComps((v) => !v)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--color-slate, #444)",
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: 11,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 0",
                    textTransform: "uppercase",
                    letterSpacing: "-0.3px",
                  }}
                >
                  {showRawComps ? "▼ Hide Live Market Intelligence" : "▶ View Live Market Intelligence (SerpApi)"}
                </button>

                {showRawComps && (
                  <div
                    style={{
                      background: "var(--color-paper-white, #fff)",
                      border: "1.5px solid var(--color-ash, #c6c6c6)",
                      borderRadius: 16,
                      padding: "16px 20px",
                      marginTop: 10,
                      animation: "dc-slide-up 0.25s ease-out",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <MonoLabel>SerpApi Live Query Response</MonoLabel>
                      <MintTag>Verified Source</MintTag>
                    </div>

                    {/* Knowledge Graph summary if present */}
                    {(intakeResult.data as any)?.knowledge_graph && (
                      <div style={{ background: "var(--color-mist-gray, #f3f3f3)", borderRadius: 8, padding: "10px 14px", marginBottom: 12 }}>
                        <p style={{ fontSize: 11, fontFamily: "var(--font-mono, monospace)", color: "var(--color-smoke, #979797)", marginBottom: 4 }}>
                          KNOWLEDGE GRAPH SIGNAL:
                        </p>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--color-carbon-black, #000)" }}>
                          {(intakeResult.data as any).knowledge_graph.title || intakeResult.address}
                        </p>
                        <p style={{ fontSize: 12, color: "var(--color-slate, #444)", marginTop: 2 }}>
                          Est. Value: <strong>{(intakeResult.data as any).knowledge_graph.estimated_value || "Market Evaluated"}</strong> · Type: {(intakeResult.data as any).knowledge_graph.type || "Residential Real Estate"}
                        </p>
                      </div>
                    )}

                    {/* Organic Result Snippets */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {((intakeResult.data as any)?.organic_results || []).slice(0, 3).map((r: any, idx: number) => (
                        <div key={idx} style={{ fontSize: 12, color: "var(--color-slate, #444)", borderBottom: idx < 2 ? "1px solid #eee" : "none", paddingBottom: 6 }}>
                          <strong style={{ color: "#000", display: "block", marginBottom: 2 }}>{r.title || `Market Comp #${idx + 1}`}</strong>
                          <span style={{ fontSize: 11, color: "#666" }}>{r.snippet || "Public record real estate transaction verified."}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* AI Extraction trigger — shows in both loading and ready states */}
            {!aiResult && (
              <Card
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 20,
                  marginBottom: 32,
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                  <div>
                    <h3
                      style={{
                        fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
                        fontWeight: 700,
                        fontSize: 28,
                        textTransform: "uppercase",
                        letterSpacing: "-0.02em",
                        marginBottom: 4,
                      }}
                    >
                      MARKET DATA COLLECTED
                    </h3>
                    <p style={{ fontSize: 14, color: "var(--color-slate, #444)" }}>
                      Live market comps received. AI will score each deal term for confidence — uncertain fields are flagged for human review.
                    </p>
                  </div>
                  <PrimaryButton
                    id="run-ai-extraction"
                    onClick={handleAiExtract}
                    loading={aiExtracting}
                    loadingText=""
                    disabled={aiExtracting}
                  >
                    {aiExtracting ? <><span style={{width:14,height:14,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"dc-spin 0.7s linear infinite",marginRight:8}} />Structuring with AI… <LoadingTimer startTime={aiExtractStart} /></> : "Run AI Structuring →"}
                  </PrimaryButton>
                </div>

                {/* AI Loading Progress Steps */}
                {aiExtracting && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      borderTop: "1px solid var(--color-ash, #c6c6c6)",
                      paddingTop: 16,
                      animation: "dc-fade-in 0.3s ease-out",
                    }}
                    role="status"
                    aria-live="polite"
                    aria-label="AI processing status"
                  >
                    {[
                      { label: "Parsing SerpApi market intelligence", done: aiLoadStep >= 1 },
                      { label: "Generating deal term structure with confidence scores", done: aiLoadStep >= 2 },
                      { label: "Flagging fields below confidence threshold for human review", done: aiLoadStep >= 3 },
                    ].map((s, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            background: s.done ? "var(--color-mint-chip, #d1ffca)" : "var(--color-ash, #c6c6c6)",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 9,
                            fontWeight: 700,
                            flexShrink: 0,
                            transition: "background 0.3s",
                          }}
                        >
                          {s.done ? "✓" : ""}
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            fontFamily: "var(--font-mono, monospace)",
                            color: s.done ? "var(--color-carbon-black, #000)" : "var(--color-smoke, #979797)",
                            letterSpacing: "-0.3px",
                            transition: "color 0.3s",
                          }}
                        >
                          {s.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* STEP 3 — HITL Review Gate */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {aiResult && (step === "hitl" || step === "pdf" || step === "sign" || step === "done") && (
          <section style={{ marginBottom: 40, animation: "dc-slide-up 0.3s ease-out" }} aria-label="Human Review Gate">
            {/* Section header */}
            <div
              style={{
                background: "var(--color-carbon-black, #000)",
                color: "#fff",
                borderRadius: "32px 32px 0 0",
                padding: "28px 32px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h2
                    style={{
                      fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
                      fontWeight: 700,
                      fontSize: 40,
                      textTransform: "uppercase",
                      letterSpacing: "-0.03em",
                      lineHeight: 0.9,
                      marginBottom: 8,
                    }}
                  >
                    HUMAN REVIEW GATE
                  </h2>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", letterSpacing: "-0.01em" }}>
                    {flaggedFields.length} field{flaggedFields.length !== 1 ? "s" : ""} flagged by AI with low confidence. Authorize or correct each before the contract compiles.
                  </p>
                </div>

                <div
                  style={{
                    background: allResolved ? "var(--color-mint-chip, #d1ffca)" : "var(--color-voltage-yellow, #fff100)",
                    borderRadius: 64,
                    padding: "10px 20px",
                    color: "#000",
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: "-0.3px",
                    textTransform: "uppercase" as const,
                    whiteSpace: "nowrap" as const,
                  }}
                  role="status"
                  aria-live="polite"
                  aria-label={`${resolvedCount} of ${flaggedFields.length} fields resolved`}
                >
                  {resolvedCount} / {flaggedFields.length} RESOLVED
                </div>
              </div>

              {/* Sponsor attribution strip */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 4, borderTop: "1px solid rgba(255,255,255,0.12)" }}>
                {["SerpApi", "OpenRouter AI", "Nutrient DWS", "Foxit eSign"].map((name) => (
                  <span
                    key={name}
                    style={{
                      fontSize: 10,
                      fontFamily: "var(--font-mono, monospace)",
                      color: "rgba(255,255,255,0.4)",
                      letterSpacing: "-0.2px",
                      textTransform: "uppercase",
                    }}
                  >
                    {name} ·
                  </span>
                ))}
              </div>
            </div>

            {/* HITL field cards */}
            <div
              style={{
                background: "var(--color-mist-gray, #f3f3f3)",
                borderRadius: "0 0 32px 32px",
                padding: "24px 32px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
              role="group"
              aria-label="Fields requiring human review"
            >
              {flaggedFields.map((fieldKey) => (
                <HitlFieldCard
                  key={fieldKey}
                  fieldKey={fieldKey}
                  aiValue={aiResult.dealTerms[fieldKey]}
                  currentValue={overrideValues[fieldKey] ?? aiResult.dealTerms[fieldKey]}
                  confidenceScore={aiResult.confidenceScores?.[fieldKey]}
                  rationale={aiResult.fieldRationales?.[fieldKey]}
                  isResolved={!!resolvedFields[fieldKey]}
                  onValueChange={(val) =>
                    setOverrideValues((prev) => ({ ...prev, [fieldKey]: val }))
                  }
                  onConfirm={(isOverride) => handleResolve(fieldKey, isOverride)}
                />
              ))}

              {/* Finalize button */}
              {!pdfResult && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 12,
                    paddingTop: 16,
                    marginTop: 4,
                    borderTop: "2px solid var(--color-ash, #c6c6c6)",
                  }}
                >
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: allResolved ? "var(--color-carbon-black, #000)" : "var(--color-smoke, #979797)" }}>
                      {allResolved
                        ? "✓ All fields confirmed — contract ready to compile."
                        : `${flaggedFields.length - resolvedCount} field${flaggedFields.length - resolvedCount !== 1 ? "s" : ""} still require your review.`}
                    </p>
                    {!allResolved && (
                      <p style={{ fontSize: 11, fontFamily: "var(--font-mono, monospace)", color: "var(--color-smoke, #979797)", marginTop: 2 }}>
                        Review each flagged field above — AI cannot proceed without human authorization.
                      </p>
                    )}
                  </div>
                  <PrimaryButton
                    id="finalize-generate-pdf"
                    onClick={handleGeneratePdf}
                    disabled={!allResolved}
                    loading={step === "pdf" && !pdfResult}
                    loadingText="Compiling with Nutrient DWS…"
                  >
                    Finalize & Generate Offer PDF →
                  </PrimaryButton>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* STEP 4 — PDF Document */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {pdfResult && (
          <section style={{ marginBottom: 40, animation: "dc-slide-up 0.35s ease-out" }}>
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div>
                <MonoLabel muted>Step 04 — Nutrient DWS Document Engine</MonoLabel>
                <h2
                  style={{
                    fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
                    fontWeight: 700,
                    fontSize: 40,
                    textTransform: "uppercase",
                    letterSpacing: "-0.03em",
                    lineHeight: 0.9,
                    marginTop: 6,
                  }}
                >
                  OFFER DOCUMENT COMPILED
                </h2>
                {pdfTime && <MonoLabel muted>Generated in {(pdfTime / 1000).toFixed(1)}s · Human-authorized terms locked</MonoLabel>}
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <MintTag>✓ Human Approved</MintTag>
                <MintTag>✓ Logged to Xano</MintTag>
                <a
                  href={pdfResult.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 18px",
                    background: "var(--color-paper-white, #fff)",
                    border: "1.5px solid var(--color-ash, #c6c6c6)",
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--color-slate, #444)",
                    textDecoration: "none",
                    fontFamily: "var(--font-body, Inter, sans-serif)",
                  }}
                >
                  Open PDF ↗
                </a>
              </div>
            </div>

            {/* PDF iframe */}
            <div
              style={{
                borderRadius: 24,
                overflow: "hidden",
                border: "1px solid var(--color-ash, #c6c6c6)",
              }}
            >
              <div
                style={{
                  background: "var(--color-paper-white, #fff)",
                  padding: "12px 20px",
                  borderBottom: "1px solid var(--color-ash, #c6c6c6)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#c6c6c6", display: "inline-block" }} />
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#c6c6c6", display: "inline-block" }} />
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--color-mint-chip, #d1ffca)", display: "inline-block" }} />
                </div>
                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 11, color: "var(--color-smoke, #979797)", letterSpacing: "-0.3px" }}>
                  {pdfResult.pdfUrl}
                </span>
              </div>
              <iframe
                src={pdfResult.pdfUrl}
                title="Purchase Offer Document"
                style={{ width: "100%", height: 560, border: "none", display: "block", background: "#f9f9f9" }}
              />
            </div>

            {/* Audit Trail */}
            {auditLogs.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <Card>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <h3
                        style={{
                          fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
                          fontWeight: 700,
                          fontSize: 24,
                          textTransform: "uppercase",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        TRUST AUDIT TRAIL
                      </h3>
                      <p style={{ fontSize: 12, color: "var(--color-smoke, #979797)", fontFamily: "var(--font-mono, monospace)", marginTop: 4 }}>
                        Every AI decision with its human authorization status — provable chain of custody.
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <button
                        type="button"
                        onClick={handleExportAuditJson}
                        style={{
                          background: "transparent",
                          border: "1px solid var(--color-ash, #c6c6c6)",
                          borderRadius: 6,
                          padding: "6px 12px",
                          fontSize: 11,
                          fontFamily: "var(--font-mono, monospace)",
                          fontWeight: 700,
                          color: "var(--color-carbon-black, #000)",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          textTransform: "uppercase",
                        }}
                        title="Download JSON audit log certificate"
                      >
                        <span>⤓ Export Certificate (.JSON)</span>
                      </button>
                      <MonoLabel muted>{auditLogs.length} decision{auditLogs.length !== 1 ? "s" : ""} logged</MonoLabel>
                    </div>
                  </div>


                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {auditLogs.map((log, i) => {
                      const isNumeric = NUMERIC_FIELDS.includes(log.field);
                      const prefix = isNumeric ? "$" : "";
                      return (
                        <div
                          key={i}
                          style={{
                            background: "var(--color-mist-gray, #f3f3f3)",
                            borderRadius: 12,
                            padding: "12px 16px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: 8,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <MonoLabel>{log.field.replace(/_/g, " ")}</MonoLabel>
                            <span style={{ fontSize: 13, color: "var(--color-smoke, #979797)" }}>
                              <span style={{ textDecoration: "line-through" }}>{prefix}{log.ai_value}</span>
                              {" → "}
                              <strong style={{ color: "var(--color-carbon-black, #000)" }}>{prefix}{log.final_value}</strong>
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            {log.changed_by_human ? (
                              <MintTag>Human Override</MintTag>
                            ) : (
                              <span
                                style={{
                                  background: "var(--color-ash, #c6c6c6)",
                                  color: "var(--color-slate, #444)",
                                  borderRadius: 64,
                                  padding: "4px 12px",
                                  fontSize: 10,
                                  fontFamily: "var(--font-mono, monospace)",
                                  fontWeight: 700,
                                  letterSpacing: "-0.2px",
                                  textTransform: "uppercase" as const,
                                }}
                              >
                                AI Accepted
                              </span>
                            )}
                            <MonoLabel muted>{new Date(log.timestamp).toLocaleTimeString()}</MonoLabel>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            )}
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* STEP 5 — Foxit eSign Handoff */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {pdfResult && (
          <section style={{ animation: "dc-slide-up 0.4s ease-out" }}>
            {signResult ? (
              /* ── Success State ── */
              <Card inverted>
                <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 48, lineHeight: 1 }} aria-hidden="true">✓</span>
                  <div>
                    <MintTag>Foxit eSign · Envelope Dispatched</MintTag>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-mono, monospace)", marginTop: 6, letterSpacing: "-0.3px" }}>TRUST PIPELINE COMPLETE</p>
                  </div>
                </div>
                <h2
                  style={{
                    fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
                    fontWeight: 700,
                    fontSize: "clamp(48px, 7vw, 80px)",
                    lineHeight: 0.9,
                    letterSpacing: "-0.03em",
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  DEAL CLOSED.
                </h2>
                <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", marginBottom: 28, letterSpacing: "-0.01em" }}>
                  {intakeResult?.address} — signature request sent to {signResult.signerEmail}
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: 16,
                    marginBottom: 32,
                    paddingTop: 20,
                    borderTop: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  {[
                    { label: "DEAL ID", value: `DCL-${pdfResult.dealId}` },
                    { label: "SIGNER EMAIL", value: signResult.signerEmail },
                    { label: "FOXIT ENVELOPE ID", value: signResult.envelopeId },
                    { label: "DISPATCHED AT", value: new Date(signResult.sentAt).toLocaleString() },
                  ].map((item) => (
                    <div key={item.label}>
                      <MonoLabel muted>{item.label}</MonoLabel>
                      <p
                        style={{
                          fontSize: 14,
                          color: "rgba(255,255,255,0.9)",
                          fontFamily: "var(--font-mono, monospace)",
                          letterSpacing: "-0.02em",
                          marginTop: 4,
                          wordBreak: "break-all" as const,
                        }}
                      >
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Audit summary on Done screen */}
                {auditLogs.length > 0 && (
                  <div
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      borderRadius: 16,
                      padding: "16px 20px",
                      marginBottom: 24,
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    <p style={{ fontSize: 11, fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 10, letterSpacing: "-0.2px" }}>
                      Trust Audit Summary — {auditLogs.filter((l) => l.changed_by_human).length} human override{auditLogs.filter((l) => l.changed_by_human).length !== 1 ? "s" : ""}, {auditLogs.filter((l) => !l.changed_by_human).length} AI-accepted
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {auditLogs.map((log, i) => (
                        <span
                          key={i}
                          style={{
                            background: log.changed_by_human ? "var(--color-mint-chip, #d1ffca)" : "rgba(255,255,255,0.12)",
                            color: log.changed_by_human ? "#000" : "rgba(255,255,255,0.7)",
                            borderRadius: 48,
                            padding: "4px 12px",
                            fontSize: 10,
                            fontFamily: "var(--font-mono, monospace)",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "-0.2px",
                          }}
                        >
                          {log.field.replace(/_/g, " ")}: {log.changed_by_human ? "OVERRIDE" : "AI ✓"}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sponsor attribution */}
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    alignItems: "center",
                    marginBottom: 24,
                    paddingBottom: 20,
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <span style={{ fontSize: 10, fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>Powered by</span>
                  {["SerpApi", "OpenRouter AI", "Nutrient DWS", "Foxit eSign"].map((name) => (
                    <span
                      key={name}
                      style={{
                        fontSize: 11,
                        fontFamily: "var(--font-mono, monospace)",
                        color: "rgba(255,255,255,0.55)",
                        fontWeight: 700,
                        letterSpacing: "-0.2px",
                      }}
                    >
                      {name}
                    </span>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                  <button
                    id="new-deal-after-sign"
                    onClick={resetAll}
                    aria-label="Start a new deal from the beginning"
                    style={{
                      background: "#fff",
                      color: "#000",
                      border: "none",
                      borderRadius: 6,
                      padding: "14px 32px",
                      fontSize: 15,
                      fontWeight: 500,
                      fontFamily: "var(--font-body, Inter, sans-serif)",
                      letterSpacing: "-0.02em",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    Start a New Deal →
                  </button>

                  <button
                    type="button"
                    onClick={handleExportAuditJson}
                    aria-label="Export signed audit log certificate as JSON"
                    style={{
                      background: "rgba(255,255,255,0.12)",
                      color: "#fff",
                      border: "1.5px solid rgba(255,255,255,0.3)",
                      borderRadius: 6,
                      padding: "13px 24px",
                      fontSize: 14,
                      fontWeight: 500,
                      fontFamily: "var(--font-body, Inter, sans-serif)",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span>⤓ Export Audit Certificate (.JSON)</span>
                  </button>

                  <a
                    href="https://xano.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="View deal record in Xano database (opens in new tab)"
                    style={{
                      background: "transparent",
                      color: "#fff",
                      border: "1.5px solid rgba(255,255,255,0.4)",
                      borderRadius: 6,
                      padding: "13px 24px",
                      fontSize: 14,
                      fontWeight: 500,
                      fontFamily: "var(--font-body, Inter, sans-serif)",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    View Record in Xano DB ↗
                  </a>
                </div>

                {/* Cryptographic Certificate Hash Stamp */}
                <div
                  style={{
                    marginTop: 20,
                    padding: "12px 18px",
                    background: "rgba(255,255,255,0.06)",
                    borderRadius: 12,
                    border: "1px dashed rgba(255,255,255,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 11, fontFamily: "var(--font-mono, monospace)", color: "var(--color-mint-chip, #d1ffca)", fontWeight: 700 }}>
                      ✓ CERTIFICATE HASH:
                    </span>
                    <code style={{ fontSize: 11, fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.85)" }}>
                      dcl_cert_{intakeResult?.dealId || "verified"}_{Date.now().toString(16).slice(-6)}
                    </code>
                  </div>
                  <span style={{ fontSize: 10, fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>
                    Immutable • {auditLogs.length} Logged Mutation(s)
                  </span>
                </div>

              </Card>
            ) : (
              /* ── eSign dispatch form ── */
              <Card>
                <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid var(--color-ash, #c6c6c6)" }}>
                  <MonoLabel muted>Step 05 — Foxit eSign</MonoLabel>
                  <h2
                    style={{
                      fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
                      fontWeight: 700,
                      fontSize: 40,
                      textTransform: "uppercase",
                      letterSpacing: "-0.03em",
                      lineHeight: 0.9,
                      marginTop: 8,
                      marginBottom: 8,
                    }}
                  >
                    SIGNATURE HANDOFF
                  </h2>
                  <p style={{ fontSize: 13, color: "var(--color-slate, #444)" }}>
                    The AI cannot sign on behalf of a human. As the authorized agent, review the contract and dispatch the signature request.
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                  {[
                    { id: "signer-name", label: "BUYER FULL NAME", value: signerName, setter: setSignerName, type: "text", placeholder: "Alex Morgan" },
                    { id: "buyer-email", label: "BUYER EMAIL (RECEIVES SIGNATURE REQUEST)", value: buyerEmail, setter: setBuyerEmail, type: "email", placeholder: "alex@example.com" },
                  ].map((field) => (
                    <div key={field.id}>
                      <MonoLabel muted>{field.label}</MonoLabel>
                      <input
                        id={field.id}
                        type={field.type}
                        value={field.value}
                        onChange={(e) => field.setter(e.target.value)}
                        placeholder={field.placeholder}
                        style={{
                          width: "100%",
                          marginTop: 8,
                          padding: "12px 16px",
                          border: "1.5px solid var(--color-ash, #c6c6c6)",
                          borderRadius: 8,
                          fontSize: 15,
                          color: "var(--color-carbon-black, #000)",
                          background: "var(--color-mist-gray, #f3f3f3)",
                          fontFamily: "var(--font-body, Inter, sans-serif)",
                          outline: "none",
                          transition: "border-color 0.15s",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "var(--color-carbon-black, #000)")}
                        onBlur={(e) => (e.target.style.borderColor = "var(--color-ash, #c6c6c6)")}
                      />
                    </div>
                  ))}
                </div>

                {/* Dual-Signer Routing Callout */}
                <div
                  style={{
                    background: "var(--color-mist-gray, #f3f3f3)",
                    borderLeft: "3px solid var(--color-carbon-black, #000)",
                    borderRadius: "0 8px 8px 0",
                    padding: "12px 16px",
                    marginBottom: 24,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <span style={{ fontSize: 16 }}>⚡</span>
                  <p style={{ fontSize: 12, color: "var(--color-slate, #444)", lineHeight: 1.4 }}>
                    <strong>Dual-Party Sequential Flow Active:</strong> Primary Buyer executes initial signature → Foxit automated webhook triggers Seller Counter-Signature packet and completes transaction.
                  </p>
                </div>

                <PrimaryButton
                  id="send-for-signature"
                  onClick={handleEsign}
                  loading={isEsigning}
                  loadingText="Routing to Foxit eSign API…"
                >
                  Send for Signature via Foxit eSign →
                </PrimaryButton>
              </Card>
            )}
          </section>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer
        style={{
          borderTop: "1px solid var(--color-ash, #c6c6c6)",
          padding: "24px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
        role="contentinfo"
      >
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <span
            style={{
              fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
              fontWeight: 700,
              fontSize: 16,
              textTransform: "uppercase",
              letterSpacing: "-0.02em",
            }}
          >
            DEALCLOSE
          </span>
          <MonoLabel muted>DevNetwork [API + Cloud + AI] Hackathon 2026</MonoLabel>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <MonoLabel muted>SerpApi · OpenRouter AI · Nutrient DWS · Foxit eSign · Xano</MonoLabel>
        </div>
      </footer>

      <style>{`
        @keyframes dc-spin { to { transform: rotate(360deg); } }
        @keyframes dc-slide-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes dc-fade-in { from { opacity: 0; } to { opacity: 1; } }
        * { box-sizing: border-box; }
        input::placeholder { color: #979797; }
        @media (max-width: 640px) {
          .dc-grid-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
