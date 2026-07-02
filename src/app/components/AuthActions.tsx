"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const styles = {
  navLogin:
    "rounded-full bg-[#ddff5b] px-5 py-2.5 text-sm font-black text-neutral-950 shadow-sm transition hover:bg-[#d2f24f]",
  navLogout:
    "rounded-full border border-stone-200 bg-white/80 px-5 py-2.5 text-sm font-black text-stone-700 shadow-sm transition hover:border-red-300 hover:bg-red-50 hover:text-red-600",
  footerLogin: "transition hover:text-yellow-300",
  footerLogout: "transition hover:text-red-300",
};

function getDisplayName(user) {
  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim();
  return fullName || user?.email || "Candidate";
}

function getInitials(user) {
  const nameParts = [user?.first_name, user?.last_name].filter(Boolean);

  if (nameParts.length) {
    return nameParts.map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  }

  return (user?.email?.[0] || "C").toUpperCase();
}

export default function AuthActions({ hideLoggedOut = false, variant = "nav" }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profileCompletion, setProfileCompletion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadSession() {
      try {
        let response = await fetch("/api/auth/me", { cache: "no-store" });

        if (response.status === 401) {
          await fetch("/api/auth/refresh", { method: "POST" });
          response = await fetch("/api/auth/me", { cache: "no-store" });
        }

        if (!isActive) {
          return;
        }

        if (response.ok) {
          const data = await response.json();
          let profile = null;

          try {
            const profileResponse = await fetch("/api/candidate/profile", { cache: "no-store" });
            profile = profileResponse.ok ? await profileResponse.json() : null;
          } catch {
            profile = null;
          }

          if (!isActive) {
            return;
          }

          setUser(data.user);
          setProfileCompletion(
            profile ? Number(profile.profile_completion_percentage || 0) : null,
          );
        } else {
          setUser(null);
          setProfileCompletion(null);
        }
      } catch {
        if (isActive) {
          setUser(null);
          setProfileCompletion(null);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadSession();

    return () => {
      isActive = false;
    };
  }, []);

  async function logout() {
    setIsLoggingOut(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      setProfileCompletion(null);
      setIsLoggingOut(false);
      router.replace("/");
      router.refresh();
    }
  }

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined;
    }

    function closeMenu() {
      setIsMenuOpen(false);
    }

    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, [isMenuOpen]);

  if (isLoading) {
    return null;
  }

  if (!user) {
    if (hideLoggedOut) {
      return null;
    }

    return (
      <Link className={variant === "footer" ? styles.footerLogin : styles.navLogin} href="/login">
        {variant === "footer" ? "Candidate login" : "Login"}
      </Link>
    );
  }

  if (variant === "footer") {
    return (
      <button
        className={styles.footerLogout}
        disabled={isLoggingOut}
        onClick={logout}
        type="button"
      >
        {isLoggingOut ? "Logging out..." : "Logout"}
      </button>
    );
  }

  const displayName = getDisplayName(user);
  const shouldShowProfileLink = profileCompletion === null || profileCompletion < 100;

  return (
    <div className="relative" onClick={(event) => event.stopPropagation()}>
      <button
        aria-expanded={isMenuOpen}
        aria-haspopup="menu"
        aria-label="Open profile menu"
        className="group flex h-12 items-center gap-2 rounded-full border border-black/10 bg-white/90 p-1.5 pr-3 shadow-lg shadow-lime-950/10 ring-1 ring-black/[0.02] transition hover:border-[#ddff5b] hover:bg-[#fbfff0]"
        onClick={() => setIsMenuOpen((current) => !current)}
        type="button"
      >
        <span className="grid h-9 w-9 place-items-center rounded-full bg-neutral-950 text-sm font-black text-[#ddff5b] shadow-inner">
          {getInitials(user)}
        </span>
        <span className="hidden max-w-32 truncate text-sm font-black text-stone-700 sm:inline">
          {displayName}
        </span>
        <span
          className={`text-stone-500 transition group-hover:text-neutral-950 ${
            isMenuOpen ? "rotate-180" : ""
          } flex items-center justify-center`}
          aria-hidden="true"
        >
          <i className="fa-solid fa-chevron-down text-[10px]" />
        </span>
      </button>

      {isMenuOpen ? (
        <div
          className="absolute right-0 z-30 mt-3 w-64 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl shadow-lime-950/15 ring-1 ring-black/[0.03]"
          role="menu"
        >
          <div className="border-b border-stone-100 bg-[#f5ffd7] px-4 py-3">
            <p className="truncate text-sm font-black text-neutral-950">{displayName}</p>
            {user?.email ? (
              <p className="mt-1 truncate text-xs font-semibold text-stone-500">{user.email}</p>
            ) : null}
          </div>
          {shouldShowProfileLink ? (
            <Link
              className="flex items-center justify-between px-4 py-3 text-sm font-black text-neutral-950 transition hover:bg-[#f5ffd7]"
              href="/onboarding"
              onClick={() => setIsMenuOpen(false)}
              role="menuitem"
            >
              <span className="flex items-center gap-2">
                <i className="fa-solid fa-user-pen text-stone-500 w-4 text-center" />
                Complete profile
              </span>
              <span className="text-stone-400" aria-hidden="true">
                →
              </span>
            </Link>
          ) : null}
          <button
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-black text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoggingOut}
            onClick={logout}
            role="menuitem"
            type="button"
          >
            <span className="flex items-center gap-2">
              <i className="fa-solid fa-arrow-right-from-bracket text-red-500 w-4 text-center" />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </span>
            <span className="text-red-300" aria-hidden="true">
              →
            </span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
