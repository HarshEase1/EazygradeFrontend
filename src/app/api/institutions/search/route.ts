const BACKEND_SEARCH_URL =
  process.env.NEXT_PUBLIC_BACKEND_SEARCH_URL ||
  "http://127.0.0.1:8000/institutions/search/";

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const incomingUrl = new URL(request.url);
  const backendUrl = new URL(BACKEND_SEARCH_URL);

  incomingUrl.searchParams.forEach((value, key) => {
    backendUrl.searchParams.set(key, value);
  });

  try {
    const response = await fetch(backendUrl, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });
    const data = await response.json();

    return Response.json(data, { status: response.status });
  } catch (error) {
    return Response.json(
      {
        error:
          "Backend search is unavailable. Start Django on http://127.0.0.1:8000 and try again.",
        detail: error.message,
      },
      { status: 502 },
    );
  }
}
