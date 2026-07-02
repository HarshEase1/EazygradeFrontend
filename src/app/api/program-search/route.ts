import { cookieHeader } from "../auth/cookies";

const BACKEND_PROGRAM_SEARCH_URL =
  process.env.BACKEND_PROGRAM_SEARCH_URL ||
  "http://127.0.0.1:8000/api/program-search/";

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.text();

  try {
    const response = await fetch(BACKEND_PROGRAM_SEARCH_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Cookie: cookieHeader(request),
      },
      body,
      cache: "no-store",
    });
    const data = await response.json();

    return Response.json(data, { status: response.status });
  } catch (error) {
    return Response.json(
      {
        detail:
          "Could not search programmes. Start Django on http://127.0.0.1:8000 and try again.",
        error: error.message,
      },
      { status: 502 },
    );
  }
}
