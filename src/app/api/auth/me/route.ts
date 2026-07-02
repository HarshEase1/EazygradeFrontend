import { cookieHeader } from "../cookies";

const BACKEND_ME_URL = process.env.BACKEND_ME_URL || "http://127.0.0.1:8000/auth/me/";

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(BACKEND_ME_URL, {
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
      { detail: "Could not read auth session.", error: error.message },
      { status: 502 },
    );
  }
}
