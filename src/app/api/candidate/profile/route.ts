import { cookieHeader } from "../../auth/cookies";

const BACKEND_CANDIDATE_PROFILE_URL =
  process.env.BACKEND_CANDIDATE_PROFILE_URL ||
  "http://127.0.0.1:8000/auth/candidate/profile/";

import { NextRequest, NextResponse } from "next/server";

async function forwardProfileRequest(request: NextRequest, method: string) {
  const init: any = {
    method,
    headers: {
      Accept: "application/json",
      Cookie: cookieHeader(request),
    },
    cache: "no-store",
  };

  if (method === "PATCH") {
    init.headers["Content-Type"] = "application/json";
    init.body = await request.text();
  }

  const response = await fetch(BACKEND_CANDIDATE_PROFILE_URL, init);
  const data = await response.json();

  return Response.json(data, { status: response.status });
}

export async function GET(request: NextRequest) {
  try {
    return await forwardProfileRequest(request, "GET");
  } catch (error) {
    return Response.json(
      { detail: "Could not load candidate profile.", error: error.message },
      { status: 502 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    return await forwardProfileRequest(request, "PATCH");
  } catch (error) {
    return Response.json(
      { detail: "Could not update candidate profile.", error: error.message },
      { status: 502 },
    );
  }
}
