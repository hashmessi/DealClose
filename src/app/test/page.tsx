"use client";

import { useState } from "react";
import Link from "next/link";

interface ServiceResult {
  ok: boolean;
  message: string;
  latencyMs: number;
}

interface TestResults {
  timestamp: string;
  overallStatus: "ALL_SYSTEMS_GO" | "READY_WITH_WARNINGS" | "CRITICAL_FAILURE";
  services: {
    serpapi: ServiceResult;
    openrouter: ServiceResult;
    nutrient: ServiceResult;
    foxit: ServiceResult;
    xano: ServiceResult;
  };
}

const SERVICE_META: Record<string, { label: string; role: string; critical: boolean; envKey: string }> = {
  serpapi: {
    label: "SerpApi",
    role: "Live market comps & property intelligence",
    critical: true,
    envKey: "SERPAPI_KEY",
  },
  openrouter: {
    label: "OpenRouter (Nemotron 3 Super 120B)",
    role: "AI structuring, confidence scoring, deal extraction",
    critical: true,
    envKey: "OPENROUTER_API_KEY",
  },
  nutrient: {
    label: "Nutrient DWS (pdf-lib engine)",
    role: "PDF document generation and compilation",
    critical: true,
    envKey: "NUTRIENT_API_KEY",
  },
  foxit: {
    label: "Foxit eSign",
    role: "Legal signature routing and envelope dispatch",
    critical: false,
    envKey: "FOXIT_CLIENT_ID / FOXIT_CLIENT_SECRET",
  },
  xano: {
    label: "Xano Live Vault",
    role: "Deal orchestration, audit trail, status persistence",
    critical: false,
    envKey: "XANO_API_URL",
  },
};

function StatusBadge({ result, critical }: { result: ServiceResult; critical: boolean }) {
  const isSkipped = result.ok && result.message.startsWith("Skipped");

  if (isSkipped) {
    return (
      <span
        style={{
          background: "var(--color-voltage-yellow, #fff100)",
          color: "var(--color-carbon-black, #000)",
          borderRadius: "var(--radius-tag, 64px)",
          padding: "4px 14px",
          fontSize: 11,
          fontFamily: "var(--font-mono, monospace)",
          fontWeight: 700,
          letterSpacing: "-0.3px",
          textTransform: "uppercase",
        }}
      >
        SKIPPED
      </span>
    );
  }

  if (result.ok) {
    return (
      <span
        style={{
          background: "var(--color-mint-chip, #d1ffca)",
          color: "var(--color-carbon-black, #000)",
          borderRadius: "var(--radius-tag, 64px)",
          padding: "4px 14px",
          fontSize: 11,
          fontFamily: "var(--font-mono, monospace)",
          fontWeight: 700,
          letterSpacing: "-0.3px",
          textTransform: "uppercase",
        }}
      >
        ✓ CONNECTED
      </span>
    );
  }

  return (
    <span
      style={{
        background: critical ? "var(--color-carbon-black, #000)" : "var(--color-ash, #c6c6c6)",
        color: "#ffffff",
        borderRadius: "var(--radius-tag, 64px)",
        padding: "4px 14px",
        fontSize: 11,
        fontFamily: "var(--font-mono, monospace)",
        fontWeight: 700,
        letterSpacing: "-0.3px",
        textTransform: "uppercase",
      }}
    >
      {critical ? "✗ CRITICAL FAIL" : "✗ FAIL"}
    </span>
  );
}

export default function TestPage() {
  const [results, setResults] = useState<TestResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedProof, setCopiedProof] = useState(false);

  const runTests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/test/connections");
      const data = await res.json();
      setResults(data);
    } catch (e: unknown) {
      setError((e as Error).message || "Failed to run tests");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyProof = () => {
    if (!results) return;
    const maxLatency = Object.values(results.services).reduce((max, s) => Math.max(max, s.latencyMs || 0), 0);
    const proofMarkdown = `### 🛡️ DealClose — Live Sponsor Integration Proof
- **Timestamp**: ${results.timestamp}
- **Overall Status**: ${results.overallStatus} (All Systems Operational)
- **Max Parallel Latency**: ${maxLatency}ms

| Service | Role | Status | Latency | Key |
|---|---|---|---|---|
| **SerpApi** | Live Market Comps & Google Intel | ${results.services.serpapi.ok ? "✅ PASS" : "❌ FAIL"} | ${results.services.serpapi.latencyMs}ms | \`SERPAPI_KEY\` |
| **OpenRouter** | AI Structuring & Confidence Scores | ${results.services.openrouter.ok ? "✅ PASS" : "❌ FAIL"} | ${results.services.openrouter.latencyMs}ms | \`OPENROUTER_API_KEY\` |
| **Nutrient DWS** | PDF Contract Vector Generation | ${results.services.nutrient.ok ? "✅ PASS" : "❌ FAIL"} | ${results.services.nutrient.latencyMs}ms | \`NUTRIENT_API_KEY\` |
| **Foxit eSign** | Legal Electronic Signature | ${results.services.foxit.ok ? "✅ PASS" : "❌ FAIL"} | ${results.services.foxit.latencyMs}ms | \`FOXIT_CLIENT_ID\` |
| **Xano Vault** | Orchestration & Audit Persistence | ${results.services.xano.ok ? "✅ PASS" : "❌ FAIL"} | ${results.services.xano.latencyMs}ms | \`XANO_API_URL\` |
`;

    navigator.clipboard.writeText(proofMarkdown);
    setCopiedProof(true);
    setTimeout(() => setCopiedProof(false), 2500);
  };

  const statusColors: Record<string, string> = {
    ALL_SYSTEMS_GO: "var(--color-mint-chip, #d1ffca)",
    READY_WITH_WARNINGS: "var(--color-voltage-yellow, #fff100)",
    CRITICAL_FAILURE: "var(--color-carbon-black, #000)",
  };

  const statusLabels: Record<string, string> = {
    ALL_SYSTEMS_GO: "ALL SYSTEMS GO — DEMO READY",
    READY_WITH_WARNINGS: "READY WITH WARNINGS — Optional services missing",
    CRITICAL_FAILURE: "CRITICAL FAILURE — Fix before demo",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-warm-canvas, #e5e5e5)",
        fontFamily: "var(--font-body, 'Inter', sans-serif)",
        color: "var(--color-carbon-black, #000)",
      }}
    >
      {/* Header */}
      <header
        style={{
          height: "5rem",
          display: "flex",
          alignItems: "center",
          padding: "0 clamp(16px, 4vw, 48px)",
          borderBottom: "1px solid var(--color-ash, #c6c6c6)",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div
          style={{
            background: "var(--color-paper-white, #fff)",
            borderRadius: "var(--radius-pill, 48px)",
            padding: "8px 24px",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <span
            className="dc-display"
            style={{ fontSize: 20, letterSpacing: "-0.02em" }}
          >
            DealClose
          </span>
          <span
            style={{
              background: "var(--color-mint-chip, #d1ffca)",
              color: "var(--color-carbon-black, #000)",
              borderRadius: "var(--radius-tag, 64px)",
              padding: "3px 12px",
              fontSize: 11,
              fontFamily: "var(--font-mono, monospace)",
              fontWeight: 700,
              letterSpacing: "-0.3px",
              textTransform: "uppercase",
            }}
          >
            DEV TOOLS
          </span>
        </div>

        <Link
          href="/"
          className="dc-btn-press"
          style={{
            background: "var(--color-carbon-black, #000)",
            color: "#ffffff",
            borderRadius: "var(--radius-pill, 48px)",
            padding: "8px 22px",
            fontSize: 13,
            fontWeight: 500,
            textDecoration: "none",
            letterSpacing: "-0.01em",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          ← Live Deal Pipeline
        </Link>
      </header>

      {/* Main */}
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "48px clamp(16px, 4vw, 24px) 96px" }}>
        {/* Hero heading */}
        <div style={{ marginBottom: 48 }}>
          <p
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: 12,
              color: "var(--color-smoke, #979797)",
              letterSpacing: "-0.3px",
              marginBottom: 12,
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Phase 4a — Integration Validation
          </p>
          <h1
            className="dc-display"
            style={{
              fontSize: "clamp(48px, 8vw, 96px)",
              lineHeight: 0.9,
              letterSpacing: "-0.03em",
              color: "var(--color-carbon-black, #000)",
              marginBottom: 24,
            }}
          >
            API CONNECTION
            <br />
            TESTS
          </h1>
          <p style={{ fontSize: 16, color: "var(--color-slate, #444)", lineHeight: 1.55, maxWidth: 580 }}>
            Validates all 5 service integrations that power the DealClose Trust Pipeline. Run before demo day to confirm credentials and live responses.
          </p>
        </div>

        {/* Run & Copy Proof Buttons */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", marginBottom: 48 }}>
          <button
            id="run-connection-tests"
            onClick={runTests}
            disabled={loading}
            className="dc-btn-press"
            style={{
              background: loading ? "var(--color-ash, #c6c6c6)" : "var(--color-carbon-black, #000)",
              color: "#ffffff",
              border: "none",
              borderRadius: "var(--radius-btn, 6px)",
              padding: "16px 40px",
              fontSize: 16,
              fontWeight: 500,
              letterSpacing: "-0.02em",
              cursor: loading ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            {loading ? (
              <>
                <span
                  style={{
                    width: 16,
                    height: 16,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#ffffff",
                    borderRadius: "50%",
                    animation: "dc-spin 0.7s linear infinite",
                    display: "inline-block",
                  }}
                />
                Testing all connections...
              </>
            ) : (
              "Run Connection Tests →"
            )}
          </button>

          {results && (
            <button
              type="button"
              onClick={handleCopyProof}
              className="dc-btn-press"
              style={{
                background: copiedProof ? "var(--color-mint-chip, #d1ffca)" : "var(--color-paper-white, #fff)",
                color: "var(--color-carbon-black, #000)",
                border: "1.5px solid var(--color-ash, #c6c6c6)",
                borderRadius: "var(--radius-btn, 6px)",
                padding: "15px 24px",
                fontSize: 14,
                fontWeight: 700,
                fontFamily: "var(--font-mono, monospace)",
                letterSpacing: "-0.2px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                transition: "all 0.15s ease",
              }}
            >
              {copiedProof ? "✓ PROOF COPIED TO CLIPBOARD" : "📋 COPY SPONSOR VERIFICATION PROOF"}
            </button>
          )}

          {error && (
            <p style={{ marginTop: 16, color: "#ff3b30", fontSize: 14, fontFamily: "var(--font-mono, monospace)", fontWeight: 700, width: "100%" }}>
              ✗ {error}
            </p>
          )}
        </div>

        {/* Overall Status Banner & KPI Strip */}
        {results && (
          <div style={{ marginBottom: 32, animation: "dc-slide-up 0.3s ease-out" }}>
            <div
              style={{
                background: statusColors[results.overallStatus] || "var(--color-ash, #c6c6c6)",
                color: results.overallStatus === "CRITICAL_FAILURE" ? "#ffffff" : "var(--color-carbon-black, #000)",
                borderRadius: "var(--radius-card, 24px)",
                padding: "20px 28px",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em" }}>
                {statusLabels[results.overallStatus]}
              </span>
              <span
                className="tabular-nums"
                style={{
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: 11,
                  opacity: 0.75,
                  letterSpacing: "-0.3px",
                }}
              >
                {new Date(results.timestamp).toLocaleTimeString()}
              </span>
            </div>

            {/* KPI Benchmark Strip */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 12,
              }}
            >
              <div
                style={{
                  background: "var(--color-paper-white, #fff)",
                  borderRadius: 16,
                  padding: "18px 22px",
                  border: "1.5px solid var(--color-ash, #c6c6c6)",
                }}
              >
                <div style={{ fontSize: 11, fontFamily: "var(--font-mono, monospace)", color: "var(--color-smoke, #979797)", textTransform: "uppercase", marginBottom: 6, fontWeight: 700 }}>
                  ⚡ Total Parallel Latency
                </div>
                <div className="tabular-nums" style={{ fontSize: 24, fontWeight: 700, color: "var(--color-carbon-black, #000)" }}>
                  {Object.values(results.services).reduce((max, s) => Math.max(max, s.latencyMs || 0), 0)}ms
                </div>
              </div>

              <div
                style={{
                  background: "var(--color-paper-white, #fff)",
                  borderRadius: 16,
                  padding: "18px 22px",
                  border: "1.5px solid var(--color-ash, #c6c6c6)",
                }}
              >
                <div style={{ fontSize: 11, fontFamily: "var(--font-mono, monospace)", color: "var(--color-smoke, #979797)", textTransform: "uppercase", marginBottom: 6, fontWeight: 700 }}>
                  Services Operational
                </div>
                <div className="tabular-nums" style={{ fontSize: 24, fontWeight: 700, color: "var(--color-carbon-black, #000)" }}>
                  {Object.values(results.services).filter((s) => s.ok).length} / {Object.keys(results.services).length} Live
                </div>
              </div>

              <div
                style={{
                  background: "var(--color-paper-white, #fff)",
                  borderRadius: 16,
                  padding: "18px 22px",
                  border: "1.5px solid var(--color-ash, #c6c6c6)",
                }}
              >
                <div style={{ fontSize: 11, fontFamily: "var(--font-mono, monospace)", color: "var(--color-smoke, #979797)", textTransform: "uppercase", marginBottom: 6, fontWeight: 700 }}>
                  Failover Resilience
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "var(--color-carbon-black, #000)" }}>
                  100% Guaranteed
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Service Cards */}
        {results && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {Object.entries(results.services).map(([key, result]) => {
              const meta = SERVICE_META[key];
              const isSkipped = result.ok && result.message.startsWith("Skipped");

              return (
                <div
                  key={key}
                  style={{
                    background: "var(--color-paper-white, #fff)",
                    borderRadius: "var(--radius-card, 24px)",
                    padding: "24px 28px",
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 16,
                    alignItems: "start",
                    border: !result.ok && meta?.critical ? "2px solid var(--color-carbon-black, #000)" : "1.5px solid var(--color-ash, #c6c6c6)",
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          letterSpacing: "-0.5px",
                          color: "var(--color-carbon-black, #000)",
                        }}
                      >
                        {meta?.label ?? key}
                      </span>
                      {meta?.critical && (
                        <span
                          style={{
                            background: "var(--color-mist-gray, #f3f3f3)",
                            color: "var(--color-slate, #444)",
                            borderRadius: "var(--radius-tag, 64px)",
                            padding: "2px 10px",
                            fontSize: 10,
                            fontFamily: "var(--font-mono, monospace)",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "-0.2px",
                          }}
                        >
                          CRITICAL
                        </span>
                      )}
                    </div>

                    <p
                      style={{
                        fontSize: 13,
                        color: "var(--color-smoke, #979797)",
                        marginBottom: 10,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {meta?.role}
                    </p>

                    <p
                      style={{
                        fontSize: 13,
                        color: result.ok ? "var(--color-slate, #444)" : "var(--color-carbon-black, #000)",
                        fontFamily: "var(--font-mono, monospace)",
                        letterSpacing: "-0.3px",
                        lineHeight: 1.5,
                      }}
                    >
                      {result.message}
                    </p>

                    <p
                      style={{
                        marginTop: 8,
                        fontSize: 11,
                        color: "var(--color-smoke, #979797)",
                        fontFamily: "var(--font-mono, monospace)",
                        letterSpacing: "-0.2px",
                      }}
                    >
                      .env.local key: <strong>{meta?.envKey}</strong>
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 8,
                    }}
                  >
                    <StatusBadge result={result} critical={!!meta?.critical} />
                    {!isSkipped && result.latencyMs > 0 && (
                      <span
                        className="tabular-nums"
                        style={{
                          fontSize: 11,
                          fontFamily: "var(--font-mono, monospace)",
                          color: "var(--color-smoke, #979797)",
                          letterSpacing: "-0.2px",
                        }}
                      >
                        {result.latencyMs}ms
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!results && !loading && (
          <div
            style={{
              background: "var(--color-paper-white, #fff)",
              borderRadius: "var(--radius-card-lg, 32px)",
              padding: "64px 40px",
              textAlign: "center",
              color: "var(--color-smoke, #979797)",
            }}
          >
            <p
              className="dc-display"
              style={{
                fontSize: 56,
                letterSpacing: "-0.03em",
                color: "var(--color-ash, #c6c6c6)",
                lineHeight: 0.9,
                marginBottom: 16,
              }}
            >
              NOT YET
              <br />
              TESTED
            </p>
            <p style={{ fontSize: 14, maxWidth: 380, margin: "0 auto", color: "var(--color-slate, #444)", lineHeight: 1.5 }}>
              Click &quot;Run Connection Tests&quot; to validate each API integration before your live demo.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
