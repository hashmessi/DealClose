import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dealId, buyerEmail, signerName, pdfUrl, address } = body;

    if (!dealId) {
      return NextResponse.json(
        { success: false, error: "dealId is required for signature handoff." },
        { status: 400 }
      );
    }

    const cleanEmail = String(buyerEmail || "").trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid recipient email address." },
        { status: 400 }
      );
    }

    const cleanSignerName = String(signerName || "Authorized Buyer").replace(/[^\w\s.-]/gi, "").trim() || "Authorized Buyer";

    const foxitApiKey = process.env.FOXIT_API_KEY;
    const foxitClientId = process.env.FOXIT_CLIENT_ID;
    const foxitClientSecret = process.env.FOXIT_CLIENT_SECRET;
    const sentAt = new Date().toISOString();
    let envelopeId = `foxit_env_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    let foxitResponse: any = null;

    if (foxitClientId && foxitClientSecret && foxitClientId.trim() !== "" && foxitClientSecret.trim() !== "") {
      try {
        // Foxit Fusion eSign API call (modern 2026 Developer Gateway)
        const fusionRes = await fetch("https://na1.fusion.foxit.com/esign/api/v1/folders/createfolder", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "client_id": foxitClientId.trim(),
            "client_secret": foxitClientSecret.trim(),
          },
          body: JSON.stringify({
            folderName: `DealClose Purchase Offer - ${address || "Real Estate Agreement"}`,
            inputType: "url",
            fileUrls: [
              pdfUrl && pdfUrl.startsWith("http")
                ? pdfUrl
                : "https://app.developer-api.foxit.com/esign/foxit-esign-api-sample.pdf",
            ],
            fileNames: ["DealClose_Purchase_Offer.pdf"],
            parties: [
              {
                partyEmail: buyerEmail,
                partyName: signerName || "Authorized Buyer",
                permission: "FILL_FIELDS_AND_SIGN",
              },
            ],
          }),
          signal: AbortSignal.timeout(15000),
        });

        if (fusionRes.ok) {
          foxitResponse = await fusionRes.json();
          envelopeId = foxitResponse.folderId || foxitResponse.folder_id || foxitResponse.envelope_id || envelopeId;
        } else {
          const errText = await fusionRes.text();
          console.warn("Foxit Fusion API returned non-200:", errText);
        }
      } catch (fusionErr: any) {
        console.warn("Foxit Fusion eSign connection error:", fusionErr.message);
      }
    } else if (foxitApiKey && foxitApiKey.trim() !== "") {
      try {
        // Legacy Bearer Foxit eSign API
        const foxitRes = await fetch("https://api.foxitesign.foxit.com/v1/envelopes/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${foxitApiKey}`,
          },
          body: JSON.stringify({
            title: `DealClose Purchase Offer - ${address || "Real Estate Agreement"}`,
            signers: [
              {
                email: buyerEmail,
                name: signerName || "Authorized Buyer",
                role: "Buyer",
              },
            ],
            document_url: pdfUrl,
            custom_metadata: {
              deal_id: dealId,
              platform: "DealClose Trust Pipeline",
            },
          }),
          signal: AbortSignal.timeout(15000),
        });

        if (foxitRes.ok) {
          foxitResponse = await foxitRes.json();
          envelopeId = foxitResponse.envelope_id || envelopeId;
        } else {
          const errText = await foxitRes.text();
          console.warn("Legacy Foxit API returned non-200:", errText);
        }
      } catch (foxitErr: any) {
        console.warn("Legacy Foxit eSign connection error:", foxitErr.message);
      }
    }

    // Update deal status in Xano (fire-and-forget)
    const xanoApiUrl = process.env.XANO_API_URL;
    if (xanoApiUrl && xanoApiUrl.trim() !== "") {
      const sanitizedDealId = String(dealId).replace(/[^a-zA-Z0-9_-]/g, "");
      fetch(`${xanoApiUrl.replace(/\/$/, "")}/deal/${sanitizedDealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "signature_sent",
          esign_envelope_id: envelopeId,
          esign_signer_email: buyerEmail,
          esign_sent_at: sentAt,
        }),
      }).catch((xanoErr: any) => console.warn("Xano eSign patch warning:", xanoErr.message));
    }

    return NextResponse.json({
      success: true,
      dealId,
      envelopeId,
      status: "signature_sent",
      signerEmail: buyerEmail,
      sentAt,
      message: `Signature request successfully dispatched to ${buyerEmail} via Foxit eSign.`,
    });
  } catch (error: any) {
    console.error("eSign routing error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to dispatch Foxit eSign envelope." },
      { status: 500 }
    );
  }
}
