import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { address } = body;

    const cleanAddress = String(address || "").trim().replace(/[\r\n\t]/g, " ").slice(0, 300);

    if (cleanAddress.length < 5) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid property street address." },
        { status: 400 }
      );
    }

    const serpApiKey = process.env.SERPAPI_KEY;
    const xanoApiUrl = process.env.XANO_API_URL;

    let serpData: any = null;

    // 1. Fetch live SerpApi data
    if (serpApiKey && serpApiKey.trim() !== "") {
      const serpUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(
        cleanAddress + " property details market comps price Zillow Redfin"
      )}&api_key=${serpApiKey}`;

      const serpRes = await fetch(serpUrl, { cache: "no-store" });
      if (!serpRes.ok) {
        const errText = await serpRes.text();
        throw new Error(`SerpApi failed (${serpRes.status}): ${errText}`);
      }
      serpData = await serpRes.json();
    } else {
      // Demo fallback when key is not configured locally yet
      serpData = {
        search_metadata: { status: "Success (Demo Mode)", address },
        organic_results: [
          {
            title: `${address} - Property Profile & Comps`,
            snippet: `Estimated Value: $785,000. 3 Beds, 2.5 Baths, 2,150 sqft. Comparable properties in radius: $760,000 - $810,000.`,
            link: "https://zillow.com/homedetails/demo",
          },
          {
            title: "Local Market Intelligence",
            snippet: "Average Days on Market: 14 days. Median price per sqft: $365.",
            link: "https://redfin.com/city/demo",
          },
        ],
        knowledge_graph: {
          title: address,
          type: "Single Family Residential",
          estimated_value: "$785,000",
          year_built: 2018,
          last_sold: "$620,000 (2021)",
        },
      };
    }

    // 2. Persist deal record in Xano backend
    let dealRecord: any = null;
    if (xanoApiUrl && xanoApiUrl.trim() !== "") {
      try {
        const xanoRes = await fetch(`${xanoApiUrl.replace(/\/$/, "")}/deal`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            property_address: address,
            status: "research_complete",
            raw_serpapi_data: serpData,
            user_id: 1, // Pre-seeded demo account ID
          }),
        });

        if (xanoRes.ok) {
          dealRecord = await xanoRes.json();
        } else {
          console.warn("Xano write non-ok status:", xanoRes.status);
        }
      } catch (xanoErr: any) {
        console.warn("Xano endpoint connection warning:", xanoErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      address: cleanAddress,
      dealId: dealRecord?.id || `deal_${Date.now()}`,
      status: "research_complete",
      data: serpData,
    });
  } catch (error: any) {
    console.error("Deal intake error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An unexpected error occurred during property intake.",
      },
      { status: 500 }
    );
  }
}
