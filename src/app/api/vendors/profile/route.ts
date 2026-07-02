import { cookies } from "next/headers";

const BACKEND_VENDOR_PROFILE_URL =
  process.env.BACKEND_VENDOR_PROFILE_URL ||
  "http://127.0.0.1:8000/vendors/profile/";

const VENDOR_EMAIL_COOKIE = "eazygrade_vendor_email";

async function vendorEmailFromCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(VENDOR_EMAIL_COOKIE)?.value || "";
}

export async function GET() {
  try {
    const email = await vendorEmailFromCookie();

    if (!email) {
      return Response.json(
        { detail: "Vendor login is required." },
        { status: 401 },
      );
    }

    const url = new URL(BACKEND_VENDOR_PROFILE_URL);
    url.searchParams.set("email", email);

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });
    const data = await response.json();

    return Response.json(data, { status: response.status });
  } catch (error) {
    return Response.json(
      {
        detail:
          "Vendor profile could not be loaded. Start Django on http://127.0.0.1:8000 and try again.",
        error: error.message,
      },
      { status: 502 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body.email || (await vendorEmailFromCookie());

    if (!email) {
      return Response.json(
        { detail: "Vendor login is required." },
        { status: 401 },
      );
    }

    const response = await fetch(BACKEND_VENDOR_PROFILE_URL, {
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
          "Vendor profile could not be saved. Start Django on http://127.0.0.1:8000 and try again.",
        error: error.message,
      },
      { status: 502 },
    );
  }
}
