"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import AuthActions from "../components/AuthActions";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const EAZYGRAD_LOGO_URL =
  "https://framerusercontent.com/images/czlTrRfNKMvHap0TW60cYEGcglI.png?width=414&height=87";

function GoogleMark() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function BrandLogo({ footer = false }) {
  return (
    <span
      className={
        footer
          ? "inline-flex rounded-xl bg-white px-3 py-2"
          : "inline-flex"
      }
    >
      <img
        alt="EazyGrad"
        className="h-auto w-[150px] sm:w-[168px]"
        height="87"
        src={EAZYGRAD_LOGO_URL}
        width="414"
      />
    </span>
  );
}

function Footer() {
  return (
    <footer className="rounded-2xl border border-stone-200 bg-neutral-950 px-5 py-6 text-white sm:px-7">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <BrandLogo footer />
        <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-stone-300">
          <Link className="transition hover:text-[#ddff5b]" href="/">
            Search
          </Link>
          <AuthActions variant="footer" />
          <a
            className="rounded-full bg-[#ddff5b] px-5 py-2.5 font-black text-neutral-950 transition hover:bg-[#d2f24f]"
            href="https://www.eazygrad.com/"
            target="_blank"
            rel="noreferrer"
          >
            EazyGrad website →
          </a>
          <span className="text-stone-500">© 2026 EazyGrade</span>
        </div>
      </div>
    </footer>
  );
}

export default function LoginPage() {
  const googleButtonRef = useRef(null);
  const router = useRouter();
  const [authError, setAuthError] = useState("");
  const [hasCandidateSession, setHasCandidateSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    let isActive = true;

    async function checkCandidateSession() {
      try {
        let response = await fetch("/api/auth/me", { cache: "no-store" });

        if (response.status === 401) {
          await fetch("/api/auth/refresh", { method: "POST" });
          response = await fetch("/api/auth/me", { cache: "no-store" });
        }

        if (isActive) {
          setHasCandidateSession(response.ok);
        }
      } catch {
        if (isActive) {
          setHasCandidateSession(false);
        }
      } finally {
        if (isActive) {
          setIsCheckingSession(false);
        }
      }
    }

    checkCandidateSession();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) {
      return;
    }

    function handleCredentialResponse(response) {
      if (!response.credential) {
        setAuthError("Google did not return a credential.");
        return;
      }

      setIsSigningIn(true);
      setAuthError("");

      fetch("/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ credential: response.credential }),
      })
        .then(async (loginResponse) => {
          const data = await loginResponse.json();

          if (!loginResponse.ok) {
            throw new Error(data.detail || "Google login failed.");
          }

          router.push(data.next || "/onboarding");
        })
        .catch((error) => {
          setAuthError(error.message);
        })
        .finally(() => {
          setIsSigningIn(false);
        });
    }

    function renderButton() {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleCredentialResponse,
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "filled_black",
        size: "large",
        type: "standard",
        shape: "pill",
        text: "continue_with",
        width: googleButtonRef.current.offsetWidth,
      });
    }

    if (window.google?.accounts?.id) {
      renderButton();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = renderButton;
    script.onerror = () => {
      setAuthError("Could not load Google sign-in. Check your connection.");
    };
    document.head.appendChild(script);
  }, [googleClientId, router]);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#e2f7eb_0,#fffaf0_360px,#ffffff_860px)] text-neutral-950">
      <div className="mx-auto flex min-h-screen max-w-[1120px] flex-col px-4 py-5 sm:px-6">
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4"
          aria-label="Login navigation"
        >
          <Link className="inline-flex" href="/">
            <BrandLogo />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              className="rounded-full border border-stone-200 bg-white/80 px-4 py-2 text-sm font-black text-stone-700 shadow-sm transition hover:border-[#ddff5b] hover:bg-[#fbfff0] flex items-center gap-1.5"
              href="/"
            >
              <i className="fa-solid fa-magnifying-glass text-xs" />
              Back to search
            </Link>
            <AuthActions hideLoggedOut />
          </div>
        </motion.nav>

        <section className="grid flex-1 gap-8 py-10 lg:grid-cols-[1fr_470px] lg:items-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.35 }}
            className="max-w-2xl"
          >
            <p className="mb-4 text-sm font-black uppercase text-amber-800">
              EazyGrad candidate portal
            </p>
            <h1 className="text-[2.65rem] font-black leading-none text-neutral-950 sm:text-6xl lg:text-7xl">
              Continue your admission journey with EazyGrade.
            </h1>
            <div className="mt-5 h-3 w-[min(350px,74%)] rounded-full bg-[#ddff5b]" />
            <p className="mt-6 max-w-xl text-base leading-8 text-stone-700 sm:text-lg">
              Sign in to track shortlisted colleges, review verified programme
              data, and keep your counselling workflow in one place.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.08, duration: 0.35 }}
            className="rounded-2xl border border-stone-200 bg-white p-4 shadow-2xl shadow-amber-950/10 sm:p-6"
          >
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 sm:p-5">
              <span className="rounded-full bg-neutral-950 px-3 py-1.5 text-xs font-black uppercase text-[#ddff5b]">
                Candidate login
              </span>
              <h2 className="mt-5 text-2xl font-black leading-tight text-neutral-950 sm:text-3xl">
                Login as a candidate
              </h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-stone-700">
                Use your Google account for a faster and more secure sign-in.
              </p>
              <div className="mt-6">
                {googleClientId ? (
                  <div
                    className={isSigningIn ? "pointer-events-none opacity-60" : ""}
                    ref={googleButtonRef}
                  />
                ) : (
                  <button
                    className="flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-neutral-950 px-5 text-base font-black text-white shadow-lg shadow-neutral-950/15 transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-950/20"
                    type="button"
                    onClick={() =>
                      setAuthError("Set NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable Google login.")
                    }
                  >
                    <GoogleMark />
                    Continue with Google
                  </button>
                )}
              </div>
              {authError ? (
                <p className="mt-3 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700">
                  {authError}
                </p>
              ) : null}
              {isSigningIn ? (
                <p className="mt-3 text-center text-sm font-semibold text-stone-600">
                  Signing you in...
                </p>
              ) : null}
            </div>

            {!isCheckingSession && !hasCandidateSession ? (
              <div className="mt-5 rounded-xl border border-stone-200 bg-white p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-sm font-black text-neutral-950">Vendor access</h3>
                    <p className="mt-1 text-xs font-semibold leading-5 text-stone-500">
                      For EazyGrade partner and vendor teams.
                    </p>
                  </div>
                  <Link
                    className="rounded-full border border-stone-200 px-4 py-2 text-sm font-black text-stone-700 transition hover:border-[#ddff5b] hover:bg-[#fbfff0]"
                    href="/vendors"
                  >
                    Vendor login
                  </Link>
                </div>
              </div>
            ) : null}

            <p className="mt-5 text-center text-xs font-semibold leading-5 text-stone-500">
              By continuing, you agree to use EazyGrade for verified education
              discovery and counselling workflows.
            </p>
          </motion.div>
        </section>
        <Footer />
      </div>
    </main>
  );
}
