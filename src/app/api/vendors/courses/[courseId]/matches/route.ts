import { cookies } from "next/headers";

const BACKEND_VENDOR_COURSES_BASE_URL =
  process.env.BACKEND_VENDOR_COURSES_BASE_URL ||
  "http://127.0.0.1:8000/vendors/courses/";

const VENDOR_EMAIL_COOKIE = "eazygrade_vendor_email";

import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest, { params }: { params: any }) {
  try {
    const cookieStore = await cookies();
    const email = cookieStore.get(VENDOR_EMAIL_COOKIE)?.value || "";

    if (!email) {
      return Response.json({ detail: "Vendor login is required." }, { status: 401 });
    }

    const { courseId } = await params;
    const url = new URL(`${BACKEND_VENDOR_COURSES_BASE_URL}${courseId}/matches/`);
    url.searchParams.set("email", email);

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const data = await response.json();

    return Response.json(data, { status: response.status });
  } catch (error) {
    return Response.json(
      { detail: "Candidate matches could not be loaded.", error: error.message },
      { status: 502 },
    );
  }
}
