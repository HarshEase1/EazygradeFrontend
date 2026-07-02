import { NextRequest } from "next/server";

export function copySetCookieHeaders(fromResponse: Response, toHeaders: Headers) {
  const setCookies = fromResponse.headers.getSetCookie?.() || [];

  if (setCookies.length) {
    setCookies.forEach((cookie) => toHeaders.append("Set-Cookie", cookie));
    return;
  }

  const setCookie = fromResponse.headers.get("set-cookie");

  if (setCookie) {
    toHeaders.append("Set-Cookie", setCookie);
  }
}

export function cookieHeader(request: NextRequest) {
  return request.headers.get("cookie") || "";
}
