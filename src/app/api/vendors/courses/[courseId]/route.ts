import { cookies } from "next/headers";

const BACKEND_VENDOR_COURSES_BASE_URL =
  process.env.BACKEND_VENDOR_COURSES_BASE_URL ||
  "http://127.0.0.1:8000/vendors/courses/";

const VENDOR_EMAIL_COOKIE = "eazygrade_vendor_email";

async function vendorEmail() {
  const cookieStore = await cookies();
  return cookieStore.get(VENDOR_EMAIL_COOKIE)?.value || "";
}

function backendCourseUrl(courseId, email) {
  const url = new URL(`${BACKEND_VENDOR_COURSES_BASE_URL}${courseId}/`);
  if (email) {
    url.searchParams.set("email", email);
  }
  return url;
}

import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest, { params }: { params: any }) {
  try {
    const email = await vendorEmail();

    if (!email) {
      return Response.json({ detail: "Vendor login is required." }, { status: 401 });
    }

    const { courseId } = await params;
    const response = await fetch(backendCourseUrl(courseId, email), {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const data = await response.json();

    return Response.json(data, { status: response.status });
  } catch (error) {
    return Response.json(
      { detail: "Course could not be loaded.", error: error.message },
      { status: 502 },
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: any }) {
  try {
    const email = await vendorEmail();

    if (!email) {
      return Response.json({ detail: "Vendor login is required." }, { status: 401 });
    }

    const { courseId } = await params;
    const body = await request.json();
    const response = await fetch(`${BACKEND_VENDOR_COURSES_BASE_URL}${courseId}/`, {
      method: "PATCH",
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
      { detail: "Course could not be updated.", error: error.message },
      { status: 502 },
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: any }) {
  try {
    const email = await vendorEmail();

    if (!email) {
      return Response.json({ detail: "Vendor login is required." }, { status: 401 });
    }

    const { courseId } = await params;
    const response = await fetch(`${BACKEND_VENDOR_COURSES_BASE_URL}${courseId}/`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
      cache: "no-store",
    });
    const data = await response.json();

    return Response.json(data, { status: response.status });
  } catch (error) {
    return Response.json(
      { detail: "Course could not be deleted.", error: error.message },
      { status: 502 },
    );
  }
}
