"use client";

import { useEffect } from "react";

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
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700&family=Inter:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          background: "#e5e5e5",
          color: "#000",
          fontFamily: "'Inter', sans-serif",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
          margin: 0,
        }}
      >
        <div style={{ maxWidth: 560, textAlign: "center" }}>
          <span
            style={{
              background: "#d1ffca",
              color: "#000",
              borderRadius: 64,
              padding: "4px 14px",
              fontSize: 11,
              fontFamily: "monospace",
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
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(64px, 12vw, 96px)",
              lineHeight: 0.9,
              letterSpacing: "-0.03em",
              textTransform: "uppercase" as const,
              marginBottom: 24,
            }}
          >
            SOMETHING
            <br />
            WENT WRONG
          </h1>

          <p style={{ fontSize: 16, color: "#444", lineHeight: 1.5, marginBottom: 32 }}>
            The Trust Pipeline encountered an unexpected error. Your data has not been submitted.
          </p>

          {error.message && (
            <p
              style={{
                fontFamily: "monospace",
                fontSize: 12,
                color: "#979797",
                background: "#fff",
                borderRadius: 8,
                padding: "12px 16px",
                marginBottom: 32,
                textAlign: "left",
                wordBreak: "break-word" as const,
              }}
            >
              {error.message}
              {error.digest && ` (${error.digest})`}
            </p>
          )}

          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              onClick={reset}
              style={{
                background: "#000",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "14px 32px",
                fontSize: 15,
                fontWeight: 500,
                fontFamily: "'Inter', sans-serif",
                letterSpacing: "-0.02em",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
            <a
              href="/"
              style={{
                background: "transparent",
                color: "#444",
                border: "1.5px solid #444",
                borderRadius: 6,
                padding: "14px 32px",
                fontSize: 15,
                fontWeight: 500,
                fontFamily: "'Inter', sans-serif",
                letterSpacing: "-0.02em",
                cursor: "pointer",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              Return Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
