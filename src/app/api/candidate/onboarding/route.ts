import { cookieHeader } from "../../auth/cookies";

const BACKEND_CANDIDATE_ONBOARDING_URL =
  process.env.BACKEND_CANDIDATE_ONBOARDING_URL ||
  "http://127.0.0.1:8000/auth/candidate/onboarding/";

import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  try {
    const response = await fetch(BACKEND_CANDIDATE_ONBOARDING_URL, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Cookie: cookieHeader(request),
      },
      body: await request.text(),
      cache: "no-store",
    });

    const data = await response.json();
    return Response.json(data, { status: response.status });
  } catch (error) {
    return Response.json(
      {
        detail: "Could not submit onboarding.",
        error: error.message,
      },
      { status: 502 },
    );
  }
}