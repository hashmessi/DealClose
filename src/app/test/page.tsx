"use client";

import { useState } from "react";

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
    label: "pdf-lib (Nutrient DWS)",
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
    label: "Xano",
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
          background: "#fff100",
          color: "#000000",
          borderRadius: 64,
          padding: "4px 14px",
          fontSize: 11,
          fontFamily: "monospace",
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
          background: "#d1ffca",
          color: "#000000",
          borderRadius: 64,
          padding: "4px 14px",
          fontSize: 11,
          fontFamily: "monospace",
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
        background: critical ? "#000000" : "#c6c6c6",
        color: "#ffffff",
        borderRadius: 64,
        padding: "4px 14px",
        fontSize: 11,
        fontFamily: "monospace",
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

  const runTests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/test/connections");
      const data = await res.json();
      setResults(data);
    } catch (e: any) {
      setError(e.message || "Failed to run tests");
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    ALL_SYSTEMS_GO: "#d1ffca",
    READY_WITH_WARNINGS: "#fff100",
    CRITICAL_FAILURE: "#000000",
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
        background: "#e5e5e5",
        fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
        color: "#000000",
      }}
    >
      {/* Header */}
      <header
        style={{
          height: "5rem",
          display: "flex",
          alignItems: "center",
          padding: "0 48px",
          borderBottom: "1px solid #c6c6c6",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            borderRadius: 48,
            padding: "10px 28px",
            display: "flex",
            alignItems: "center",
            gap: 24,
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 500, color: "#444444", letterSpacing: "-0.02em" }}>
            DealClose
          </span>
          <span
            style={{
              background: "#d1ffca",
              color: "#000000",
              borderRadius: 64,
              padding: "3px 12px",
              fontSize: 11,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: "-0.3px",
            }}
          >
            DEV TOOLS
          </span>
        </div>
      </header>

      {/* Main */}
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "64px 24px" }}>
        {/* Hero heading */}
        <div style={{ marginBottom: 48 }}>
          <p
            style={{
              fontFamily: "monospace",
              fontSize: 12,
              color: "#979797",
              letterSpacing: "-0.3px",
              marginBottom: 12,
              textTransform: "uppercase",
            }}
          >
            Phase 4a — Integration Validation
          </p>
          <h1
            style={{
              fontSize: "clamp(56px, 8vw, 96px)",
              fontWeight: 700,
              lineHeight: 0.9,
              letterSpacing: "-3px",
              textTransform: "uppercase",
              color: "#000000",
              marginBottom: 24,
            }}
          >
            API CONNECTION
            <br />
            TESTS
          </h1>
          <p style={{ fontSize: 16, color: "#444444", lineHeight: 1.5, maxWidth: 560 }}>
            Validates all 5 service integrations that power the DealClose Trust Pipeline.
            Run before demo day to confirm credentials are live.
          </p>
        </div>

        {/* Run Button */}
        <div style={{ marginBottom: 48 }}>
          <button
            id="run-connection-tests"
            onClick={runTests}
            disabled={loading}
            style={{
              background: loading ? "#c6c6c6" : "#000000",
              color: "#ffffff",
              border: "none",
              borderRadius: 8,
              padding: "16px 40px",
              fontSize: 16,
              fontWeight: 500,
              letterSpacing: "-0.02em",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.15s",
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
                    animation: "spin 0.7s linear infinite",
                    display: "inline-block",
                  }}
                />
                Testing all connections...
              </>
            ) : (
              "Run Connection Tests"
            )}
          </button>

          {error && (
            <p style={{ marginTop: 16, color: "#000000", fontSize: 14, fontFamily: "monospace" }}>
              ✗ {error}
            </p>
          )}
        </div>

        {/* Overall Status Banner */}
        {results && (
          <div
            style={{
              background: statusColors[results.overallStatus] || "#c6c6c6",
              color: results.overallStatus === "CRITICAL_FAILURE" ? "#ffffff" : "#000000",
              borderRadius: 24,
              padding: "20px 28px",
              marginBottom: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em" }}>
              {statusLabels[results.overallStatus]}
            </span>
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 11,
                opacity: 0.7,
                letterSpacing: "-0.3px",
              }}
            >
              {new Date(results.timestamp).toLocaleTimeString()}
            </span>
          </div>
        )}

        {/* Service Cards */}
        {results && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {Object.entries(results.services).map(([key, result]) => {
              const meta = SERVICE_META[key];
              const isSkipped = result.ok && result.message.startsWith("Skipped");

              return (
                <div
                  key={key}
                  style={{
                    background: "#ffffff",
                    borderRadius: 24,
                    padding: "24px 28px",
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 16,
                    alignItems: "start",
                    border: !result.ok && meta?.critical ? "2px solid #000000" : "none",
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
                          color: "#000000",
                        }}
                      >
                        {meta?.label ?? key}
                      </span>
                      {meta?.critical && (
                        <span
                          style={{
                            background: "#f3f3f3",
                            color: "#444444",
                            borderRadius: 64,
                            padding: "2px 10px",
                            fontSize: 10,
                            fontFamily: "monospace",
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
                        color: "#979797",
                        marginBottom: 10,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {meta?.role}
                    </p>

                    <p
                      style={{
                        fontSize: 13,
                        color: result.ok ? "#444444" : "#000000",
                        fontFamily: "monospace",
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
                        color: "#979797",
                        fontFamily: "monospace",
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
                        style={{
                          fontSize: 11,
                          fontFamily: "monospace",
                          color: "#979797",
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
              background: "#ffffff",
              borderRadius: 32,
              padding: "64px 40px",
              textAlign: "center",
              color: "#979797",
            }}
          >
            <p
              style={{
                fontSize: 48,
                fontWeight: 700,
                letterSpacing: "-2px",
                textTransform: "uppercase",
                color: "#c6c6c6",
                lineHeight: 0.9,
                marginBottom: 16,
              }}
            >
              NOT YET
              <br />
              TESTED
            </p>
            <p style={{ fontSize: 14, maxWidth: 360, margin: "0 auto" }}>
              Click "Run Connection Tests" to validate each API integration before your demo.
            </p>
          </div>
        )}
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
