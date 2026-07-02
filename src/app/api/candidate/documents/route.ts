import { cookieHeader } from "../../auth/cookies";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BACKEND_CANDIDATE_DOCUMENTS_URL =
  process.env.BACKEND_CANDIDATE_DOCUMENTS_URL ||
  "http://127.0.0.1:8000/auth/candidate/documents/";

import { NextRequest, NextResponse } from "next/server";

async function responseJson(response: Response, fallbackDetail: string) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return { detail: text || fallbackDetail };
}

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(BACKEND_CANDIDATE_DOCUMENTS_URL, {
      headers: {
        Accept: "application/json",
        Cookie: cookieHeader(request),
      },
      cache: "no-store",
    });
    const data = await responseJson(
      response,
      "Could not load candidate documents.",
    );

    return Response.json(data, { status: response.status });
  } catch (error) {
    return Response.json(
      { detail: "Could not load candidate documents.", error: error.message },
      { status: 502 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();

    const response = await fetch(BACKEND_CANDIDATE_DOCUMENTS_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Cookie: cookieHeader(request),
      },
      body,
      cache: "no-store",
    });
    const data = await responseJson(
      response,
      "Could not upload candidate document.",
    );

    return Response.json(data, { status: response.status });
  } catch (error) {
    return Response.json(
      { detail: "Could not upload candidate document.", error: error.message },
      { status: 502 },
    );
  }
}
