import { cookieHeader } from "../../../auth/cookies";

const BACKEND_RECOMMENDATIONS_ELIGIBILITY_URL =
  process.env.BACKEND_RECOMMENDATIONS_ELIGIBILITY_URL ||
  "http://127.0.0.1:8000/api/recommendations/eligibility/programmes/";

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const incomingUrl = new URL(request.url);
  const backendUrl = new URL(BACKEND_RECOMMENDATIONS_ELIGIBILITY_URL);

  incomingUrl.searchParams.forEach((value, key) => {
    backendUrl.searchParams.set(key, value);
  });

  try {
    const response = await fetch(backendUrl, {
      headers: {
        Accept: "application/json",
        Cookie: cookieHeader(request),
      },
      cache: "no-store",
    });
    const data = await response.json();

    return Response.json(data, { status: response.status });
  } catch (error) {
    return Response.json(
      {
        detail:
          "Could not load recommendation eligibility. Start Django on http://127.0.0.1:8000 and try again.",
        error: error.message,
      },
      { status: 502 },
    );
  }
}
