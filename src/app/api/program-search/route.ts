import { NextRequest } from "next/server";
import { cookieHeader } from "../auth/cookies";

const BACKEND_PROGRAM_SEARCH_URL =
  process.env.BACKEND_PROGRAM_SEARCH_URL ||
  "http://127.0.0.1:8000/api/program-search/";

export async function POST(request: NextRequest) {
  try {
    const incomingBody = await request.json();

    const backendBody = {
      ...incomingBody,
      require_openai: true, // force Django to fail if OpenAI is not working
    };

    const response = await fetch(BACKEND_PROGRAM_SEARCH_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Cookie: cookieHeader(request),
      },
      body: JSON.stringify(backendBody),
      cache: "no-store",
    });

    let data;

    try {
      data = await response.json();
    } catch {
      data = {
        detail: "Backend returned a non-JSON response.",
      };
    }

    // Important:
    // If Django returns 503 for OpenAI failure,
    // this Next.js route will also return 503 to frontend.
    return Response.json(data, { status: response.status });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown programme search error";

    return Response.json(
      {
        detail:
          "Could not search programmes. Start Django on http://127.0.0.1:8000 and try again.",
        error: message,
      },
      { status: 502 },
    );
  }
}