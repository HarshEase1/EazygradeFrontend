import { cookies } from "next/headers";

const BACKEND_VENDOR_COURSES_URL =
  process.env.BACKEND_VENDOR_COURSES_URL ||
  "http://127.0.0.1:8000/vendors/courses/";

const VENDOR_EMAIL_COOKIE = "eazygrade_vendor_email";

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const email = cookieStore.get(VENDOR_EMAIL_COOKIE)?.value || "";

    if (!email) {
      return Response.json(
        { detail: "Vendor login is required." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const response = await fetch(BACKEND_VENDOR_COURSES_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...body, email }),
      cache: "no-store",
    });
    const data = await response.json();

    return Response.json(data, { status: response.status });
  } catch (error) {
    return Response.json(
      {
        detail:
          "Course could not be saved. Start Django on http://127.0.0.1:8000 and try again.",
        error: error.message,
      },
      { status: 502 },
    );
  }
}
