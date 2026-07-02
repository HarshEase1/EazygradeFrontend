import { cookieHeader, copySetCookieHeaders } from "../cookies";

const BACKEND_LOGOUT_URL =
  process.env.BACKEND_LOGOUT_URL || "http://127.0.0.1:8000/auth/logout/";

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const response = await fetch(BACKEND_LOGOUT_URL, {
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
      { detail: "Could not log out.", error: error.message },
      { status: 502 },
    );
  }
}
