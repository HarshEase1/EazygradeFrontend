import { cookieHeader } from "../../../../auth/cookies";

const BACKEND_RECOMMENDATIONS_REPORT_URL =
  process.env.BACKEND_RECOMMENDATIONS_REPORT_URL ||
  "http://127.0.0.1:8000/api/recommendations/analysis/report/pdf/";

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const incomingUrl = new URL(request.url);
  const backendUrl = new URL(BACKEND_RECOMMENDATIONS_REPORT_URL);

  incomingUrl.searchParams.forEach((value, key) => {
    backendUrl.searchParams.set(key, value);
  });

  try {
    const response = await fetch(backendUrl, {
      headers: {
        Accept: "*/*",
        Cookie: cookieHeader(request),
      },
      cache: "no-store",
    });
    const body = await response.arrayBuffer();

    return new Response(body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/pdf",
        "Content-Disposition":
          response.headers.get("content-disposition") ||
          'attachment; filename="eazygrad-recommendation-report.pdf"',
      },
    });
  } catch (error) {
    return Response.json(
      {
        detail:
          "Could not download recommendation report. Start Django on http://127.0.0.1:8000 and try again.",
        error: error.message,
      },
      { status: 502 },
    );
  }
}
