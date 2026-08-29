"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("DealClose — unhandled error:", error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <title>Error — DealClose</title>
      </head>
      <body
        style={{
          background: "var(--color-warm-canvas, #e5e5e5)",
          color: "var(--color-carbon-black, #000)",
          fontFamily: "var(--font-body, 'Inter', sans-serif)",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
          margin: 0,
        }}
      >
        <div style={{ maxWidth: 580, textAlign: "center" }}>
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
              textTransform: "uppercase" as const,
              display: "inline-block",
              marginBottom: 24,
            }}
          >
            Pipeline Error
          </span>

          <h1
            className="dc-display"
            style={{
              fontSize: "clamp(56px, 10vw, 88px)",
              lineHeight: 0.9,
              letterSpacing: "-0.03em",
              marginBottom: 24,
            }}
          >
            SOMETHING
            <br />
            WENT WRONG
          </h1>

          <p style={{ fontSize: 16, color: "var(--color-slate, #444)", lineHeight: 1.55, marginBottom: 32 }}>
            The Trust Pipeline encountered an unexpected error. Your transaction data has not been compromised.
          </p>

          {error.message && (
            <p
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: 12,
                color: "var(--color-smoke, #979797)",
                background: "var(--color-paper-white, #fff)",
                borderRadius: 8,
                padding: "12px 16px",
                marginBottom: 32,
                textAlign: "left",
                wordBreak: "break-word" as const,
                border: "1px solid var(--color-ash, #c6c6c6)",
              }}
            >
              {error.message}
              {error.digest && ` (${error.digest})`}
            </p>
          )}

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={reset}
              className="dc-btn-press"
              style={{
                background: "var(--color-carbon-black, #000)",
                color: "#fff",
                border: "none",
                borderRadius: "var(--radius-btn, 6px)",
                padding: "14px 32px",
                fontSize: 15,
                fontWeight: 500,
                fontFamily: "var(--font-body, 'Inter', sans-serif)",
                letterSpacing: "-0.02em",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
            <Link
              href="/"
              className="dc-btn-press"
              style={{
                background: "transparent",
                color: "var(--color-slate, #444)",
                border: "1.5px solid var(--color-slate, #444)",
                borderRadius: "var(--radius-btn, 6px)",
                padding: "14px 32px",
                fontSize: 15,
                fontWeight: 500,
                fontFamily: "var(--font-body, 'Inter', sans-serif)",
                letterSpacing: "-0.02em",
                cursor: "pointer",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              Return Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
