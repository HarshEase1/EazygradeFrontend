import { copySetCookieHeaders } from "../cookies";

const BACKEND_GOOGLE_AUTH_URL =
  process.env.BACKEND_GOOGLE_AUTH_URL || "http://127.0.0.1:8000/auth/google/";

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await fetch(BACKEND_GOOGLE_AUTH_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const data = await response.json();
    const headers = new Headers();
    copySetCookieHeaders(response, headers);

    return Response.json(data, { status: response.status, headers });
  } catch (error) {
    return Response.json(
      {
        detail:
          "Google login is unavailable. Start Django on http://127.0.0.1:8000 and try again.",
        error: error.message,
      },
      { status: 502 },
    );
  }
}
