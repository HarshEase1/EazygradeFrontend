import { cookies } from "next/headers";

const BACKEND_VENDOR_OTP_SEND_URL =
  process.env.BACKEND_VENDOR_OTP_SEND_URL ||
  "http://127.0.0.1:8000/vendors/otp/send/";

const VENDOR_EMAIL_COOKIE = "eazygrade_vendor_email";

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await fetch(BACKEND_VENDOR_OTP_SEND_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const data = await response.json();

    if (response.ok && data.demo_login && data.email) {
      const cookieStore = await cookies();
      cookieStore.set(VENDOR_EMAIL_COOKIE, data.email, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 14,
        path: "/",
        sameSite: "lax",
      });
    }

    return Response.json(data, { status: response.status });
  } catch (error) {
    return Response.json(
      {
        detail:
          "Vendor email login is unavailable. Start Django on http://127.0.0.1:8000 and try again.",
        error: error.message,
      },
      { status: 502 },
    );
  }
}
