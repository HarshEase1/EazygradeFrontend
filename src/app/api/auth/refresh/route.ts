import { cookieHeader, copySetCookieHeaders } from "../cookies";

const BACKEND_REFRESH_URL =
  process.env.BACKEND_REFRESH_URL || "http://127.0.0.1:8000/auth/refresh/";

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const response = await fetch(BACKEND_REFRESH_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Cookie: cookieHeader(request),
      },
      cache: "no-store",
    });
    const data = await response.json();
    const headers = new Headers();
    copySetCookieHeaders(response, headers);

    return Response.json(data, { status: response.status, headers });
  } catch (error) {
    return Response.json(
      { detail: "Could not refresh auth session.", error: error.message },
      { status: 502 },
    );
  }
}
