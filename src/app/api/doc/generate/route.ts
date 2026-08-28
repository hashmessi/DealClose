import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";

function cleanNumber(val: any, fallback = 0): number {
  if (typeof val === "number" && !isNaN(val)) return Math.round(val);
  if (typeof val === "string") {
    const cleaned = val.replace(/[^0-9.-]/g, "");
    const num = parseFloat(cleaned);
    if (!isNaN(num)) return Math.round(num);
  }
  return fallback;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dealId, dealTerms, address } = body;

    const sanitizedDealId = dealId ? String(dealId).replace(/[^a-zA-Z0-9_-]/g, "") : `deal_${Date.now()}`;
    const targetAddress = address || "742 Evergreen Terrace, Springfield, OR";
    
    const rawTerms = dealTerms || {};
    const terms = {
      offer_price: cleanNumber(rawTerms.offer_price, 785000),
      earnest_money: cleanNumber(rawTerms.earnest_money, 23550),
      closing_days: cleanNumber(rawTerms.closing_days, 30),
      contingency_financing: rawTerms.contingency_financing !== false,
      contingency_inspection: rawTerms.contingency_inspection !== false,
      seller_concessions: cleanNumber(rawTerms.seller_concessions, 7500),
      closing_costs_buyer: cleanNumber(rawTerms.closing_costs_buyer, 15700),
      closing_costs_seller: cleanNumber(rawTerms.closing_costs_seller, 11775),
    };

    // 1. Create a new PDF document using pdf-lib
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // Standard Letter Size
    const { width, height } = page.getSize();

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Primary Brand Palette
    const cyanBrand = rgb(0.02, 0.65, 0.82);
    const darkText = rgb(0.08, 0.1, 0.15);
    const slateText = rgb(0.35, 0.4, 0.5);
    const borderSlate = rgb(0.85, 0.88, 0.92);

    let yPos = height - 50;

    // Header & Banner
    page.drawRectangle({
      x: 0,
      y: height - 80,
      width: width,
      height: 80,
      color: rgb(0.04, 0.06, 0.12),
    });

    page.drawText("DEALCLOSE TRUST PIPELINE • REAL ESTATE OFFER", {
      x: 40,
      y: height - 40,
      size: 10,
      font: fontBold,
      color: cyanBrand,
    });

    page.drawText("PURCHASE & SALE AGREEMENT", {
      x: 40,
      y: height - 62,
      size: 18,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    yPos = height - 110;

    // Deal Metadata Block
    page.drawText("PROPERTY ADDRESS:", { x: 40, y: yPos, size: 9, font: fontBold, color: slateText });
    page.drawText(targetAddress, { x: 160, y: yPos, size: 10, font: fontBold, color: darkText });

    yPos -= 20;
    page.drawText("DEAL REF ID:", { x: 40, y: yPos, size: 9, font: fontBold, color: slateText });
    page.drawText(sanitizedDealId, { x: 160, y: yPos, size: 10, font: fontRegular, color: darkText });

    yPos -= 20;
    page.drawText("BUYER AGENT:", { x: 40, y: yPos, size: 9, font: fontBold, color: slateText });
    page.drawText("DevNetwork Demo Agent (Licensed)", { x: 160, y: yPos, size: 10, font: fontRegular, color: darkText });

    yPos -= 30;
    page.drawLine({ start: { x: 40, y: yPos }, end: { x: width - 40, y: yPos }, thickness: 1, color: borderSlate });

    // Section 1: Financial Structure
    yPos -= 25;
    page.drawText("1. FINANCIAL TERMS & CALCULATED COSTS", { x: 40, y: yPos, size: 12, font: fontBold, color: darkText });

    const financialRows = [
      ["Purchase Offer Price:", `$${Number(terms.offer_price).toLocaleString()}`],
      ["Earnest Money Deposit (3%):", `$${Number(terms.earnest_money).toLocaleString()}`],
      ["Buyer Closing Costs (Estimated 2%):", `$${Number(terms.closing_costs_buyer).toLocaleString()}`],
      ["Seller Closing Costs (Estimated 1.5%):", `$${Number(terms.closing_costs_seller).toLocaleString()}`],
      ["Requested Seller Concessions:", `$${Number(terms.seller_concessions).toLocaleString()}`],
      ["Proposed Closing Timeline:", `${terms.closing_days || 30} Days from Acceptance`],
    ];

    yPos -= 15;
    financialRows.forEach(([label, val]) => {
      yPos -= 18;
      page.drawText(label, { x: 50, y: yPos, size: 10, font: fontRegular, color: slateText });
      page.drawText(val, { x: 300, y: yPos, size: 10, font: fontBold, color: darkText });
    });

    yPos -= 25;
    page.drawLine({ start: { x: 40, y: yPos }, end: { x: width - 40, y: yPos }, thickness: 1, color: borderSlate });

    // Section 2: Branching Contingency Logic (DOC-02)
    yPos -= 25;
    page.drawText("2. CONTINGENCY BRANCHING CLAUSES", { x: 40, y: yPos, size: 12, font: fontBold, color: darkText });

    yPos -= 20;
    if (terms.contingency_financing) {
      page.drawText("[ACTIVE] CLAUSE 2.1 - FINANCING CONTINGENCY", { x: 50, y: yPos, size: 10, font: fontBold, color: cyanBrand });
      yPos -= 15;
      page.drawText(
        "This offer is expressly contingent upon Buyer obtaining formal mortgage loan approval within 21 days.",
        { x: 50, y: yPos, size: 9, font: fontRegular, color: darkText }
      );
    } else {
      page.drawText("[WAIVED] CLAUSE 2.1 - CASH OFFER (NO FINANCING CONTINGENCY)", { x: 50, y: yPos, size: 10, font: fontBold, color: darkText });
    }

    yPos -= 25;
    if (terms.contingency_inspection) {
      page.drawText("[ACTIVE] CLAUSE 2.2 - PROPERTY INSPECTION CONTINGENCY", { x: 50, y: yPos, size: 10, font: fontBold, color: cyanBrand });
      yPos -= 15;
      page.drawText(
        "Buyer retains full right to conduct licensed home inspection within 10 business days of mutual acceptance.",
        { x: 50, y: yPos, size: 9, font: fontRegular, color: darkText }
      );
    }

    yPos -= 30;
    page.drawLine({ start: { x: 40, y: yPos }, end: { x: width - 40, y: yPos }, thickness: 1, color: borderSlate });

    // Section 3: Signature Blocks (Ready for Foxit eSign handoff in Phase 3)
    yPos -= 25;
    page.drawText("3. AUTHORIZATION & SIGNATURE QUEUE", { x: 40, y: yPos, size: 12, font: fontBold, color: darkText });

    yPos -= 70;
    // Buyer Signature Box
    page.drawRectangle({ x: 50, y: yPos, width: 230, height: 50, borderColor: borderSlate, borderWidth: 1 });
    page.drawText("BUYER SIGNATURE (Pending eSign Handoff)", { x: 55, y: yPos + 35, size: 8, font: fontBold, color: slateText });
    page.drawText("X _________________________________", { x: 55, y: yPos + 15, size: 9, font: fontRegular, color: darkText });

    // Seller Signature Box
    page.drawRectangle({ x: 310, y: yPos, width: 230, height: 50, borderColor: borderSlate, borderWidth: 1 });
    page.drawText("SELLER ACCEPTANCE SIGNATURE", { x: 315, y: yPos + 35, size: 8, font: fontBold, color: slateText });
    page.drawText("X _________________________________", { x: 315, y: yPos + 15, size: 9, font: fontRegular, color: darkText });

    // Footer Audit Stamp
    page.drawRectangle({ x: 0, y: 0, width: width, height: 40, color: rgb(0.96, 0.97, 0.98) });
    page.drawText(`DealClose Audit Trail | Generated: ${new Date().toLocaleDateString()} | Nutrient DWS PDF Render Engine`, {
      x: 40,
      y: 16,
      size: 8,
      font: fontRegular,
      color: slateText,
    });

    // 2. Save PDF bytes and write to public/documents
    const pdfBytes = await pdfDoc.save();

    const publicDocsDir = path.join(process.cwd(), "public", "documents");
    if (!fs.existsSync(publicDocsDir)) {
      fs.mkdirSync(publicDocsDir, { recursive: true });
    }

    const fileName = `offer_${sanitizedDealId}.pdf`;
    const filePath = path.join(publicDocsDir, fileName);
    fs.writeFileSync(filePath, pdfBytes);

    const relativePdfUrl = `/documents/${fileName}`;

    // 3. Update Xano deal state
    const xanoApiUrl = process.env.XANO_API_URL;
    if (xanoApiUrl && xanoApiUrl.trim() !== "") {
      try {
        await fetch(`${xanoApiUrl.replace(/\/$/, "")}/deal/${sanitizedDealId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "draft_complete",
            doc_url: relativePdfUrl,
          }),
        });
      } catch (xanoErr: any) {
        console.warn("Xano patch doc url error:", xanoErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      pdfUrl: relativePdfUrl,
      dealId: sanitizedDealId,
      status: "draft_complete",
    });
  } catch (error: any) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate Purchase Offer PDF.",
      },
      { status: 500 }
    );
  }
}
