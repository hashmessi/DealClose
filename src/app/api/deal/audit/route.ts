import { NextResponse } from "next/server";

// In-memory vault for persistent audit records across the session
const auditVault = new Map<string, any>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dealId = searchParams.get("dealId");

  if (!dealId) {
    return NextResponse.json(
      { success: false, error: "dealId parameter is required." },
      { status: 400 }
    );
  }

  const record = auditVault.get(dealId);
  if (!record) {
    return NextResponse.json({
      success: true,
      dealId,
      status: "verified",
      message: "Standard audit trail active.",
      auditCount: 0,
      auditLogs: [],
      timestamp: new Date().toISOString(),
    });
  }

  return NextResponse.json({
    success: true,
    dealId,
    ...record,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dealId, auditLogs, resolvedTerms, address } = body;

    if (!dealId) {
      return NextResponse.json(
        { success: false, error: "dealId is required for audit logging." },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();
    const formattedLogs = (auditLogs || []).map((log: any) => ({
      ...log,
      timestamp: log.timestamp || timestamp,
    }));

    const auditRecord = {
      dealId,
      address: address || "Property",
      status: "human_verified",
      auditCount: formattedLogs.length,
      auditLogs: formattedLogs,
      resolvedTerms: resolvedTerms || {},
      certificateHash: `dcl_cert_${Math.abs(dealId.split("").reduce((a: number, b: string) => ((a << 5) - a) + b.charCodeAt(0), 0)).toString(16)}`,
      timestamp,
    };

    // Store in local vault
    auditVault.set(String(dealId), auditRecord);

    // Update Xano deal record if URL is configured
    const xanoApiUrl = process.env.XANO_API_URL;
    if (xanoApiUrl && xanoApiUrl.trim() !== "") {
      try {
        const sanitizedDealId = String(dealId).replace(/[^a-zA-Z0-9_-]/g, "");
        await fetch(`${xanoApiUrl.replace(/\/$/, "")}/deal/${sanitizedDealId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "human_verified",
            audit_trail: formattedLogs,
            structured_deal_data: resolvedTerms,
            updated_at: timestamp,
          }),
        });
      } catch (xanoErr: any) {
        console.warn("Xano audit patch warning:", xanoErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      ...auditRecord,
    });
  } catch (error: any) {
    console.error("Audit log error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record audit trail." },
      { status: 500 }
    );
  }
}

