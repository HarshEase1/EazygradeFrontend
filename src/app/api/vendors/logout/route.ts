import { cookies } from "next/headers";

const VENDOR_EMAIL_COOKIE = "eazygrade_vendor_email";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(VENDOR_EMAIL_COOKIE);

  return Response.json({ detail: "Vendor logged out." });
}
