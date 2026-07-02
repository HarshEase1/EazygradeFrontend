"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const EXAMPLE_QUERY =
  "I am a commerce student interested in law and government jobs. I want online or distance options.";

const EXAMPLE_CHIPS = [
  "Commerce student interested in law",
  "Working professional aiming for management",
  "Coding and data analysis, online course",
  "Teacher career with low fee courses",
];

const SELECTED_PROGRAMME_STORAGE_KEY = "eazygrad_selected_programme";

function Icon({ name, className = "h-4 w-4" }) {
  const iconClasses = {
    briefcase: "fa-solid fa-briefcase",
    chevron: "fa-solid fa-chevron-down",
    clock: "fa-solid fa-clock",
    graduation: "fa-solid fa-graduation-cap",
    monitor: "fa-solid fa-desktop",
    search: "fa-solid fa-magnifying-glass",
    shield: "fa-solid fa-shield-halved",
    sparkle: "fa-solid fa-wand-magic-sparkles",
    wallet: "fa-solid fa-wallet",
    warning: "fa-solid fa-triangle-exclamation",
    x: "fa-solid fa-xmark",
  };

  const faClass = iconClasses[name];
  if (faClass) {
    return (
      <i
        className={`${faClass} ${className} inline-flex items-center justify-center`}
        style={{ fontSize: "inherit", width: "1em", height: "1em" }}
      />
    );
  }

  const paths = {
    briefcase:
      "M6.5 6V4.75A2.75 2.75 0 0 1 9.25 2h5.5a2.75 2.75 0 0 1 2.75 2.75V6H20a2 2 0 0 1 2 2v9.25A2.75 2.75 0 0 1 19.25 20H4.75A2.75 2.75 0 0 1 2 17.25V8a2 2 0 0 1 2-2h2.5Zm2 0h7V4.75a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75V6Zm-4 4v7.25c0 .41.34.75.75.75h13.5c.41 0 .75-.34.75-.75V10h-5.1v.5a1 1 0 0 1-1 1h-2.8a1 1 0 0 1-1-1V10H4.5Z",
    chevron:
      "M6.3 8.7a1 1 0 0 1 1.4 0L12 13l4.3-4.3a1 1 0 1 1 1.4 1.4l-5 5a1 1 0 0 1-1.4 0l-5-5a1 1 0 0 1 0-1.4Z",
    clock:
      "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 5a1 1 0 1 0-2 0v5c0 .27.11.52.3.7l3 3a1 1 0 0 0 1.4-1.4L13 11.58V7Z",
    graduation:
      "M12.45 2.1a1 1 0 0 0-.9 0l-9 4.2a1 1 0 0 0 0 1.8l9 4.2a1 1 0 0 0 .9 0L20 8.78V14a1 1 0 1 0 2 0V7.2a1 1 0 0 0-.58-.9l-8.97-4.2ZM6 11.16v3.34C6 16.99 8.69 19 12 19s6-2.01 6-4.5v-3.34l-4.7 2.2a3 3 0 0 1-2.6 0L6 11.16Z",
    monitor:
      "M4.75 4A2.75 2.75 0 0 0 2 6.75v8.5A2.75 2.75 0 0 0 4.75 18H10v1H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-2v-1h5.25A2.75 2.75 0 0 0 22 15.25v-8.5A2.75 2.75 0 0 0 19.25 4H4.75Zm0 2h14.5c.41 0 .75.34.75.75v8.5c0 .41-.34.75-.75.75H4.75a.75.75 0 0 1-.75-.75v-8.5c0-.41.34-.75.75-.75Z",
    search:
      "M10.5 3a7.5 7.5 0 0 0 0 15 7.46 7.46 0 0 0 4.6-1.57l3.23 3.24a1 1 0 0 0 1.42-1.42l-3.24-3.23A7.5 7.5 0 0 0 10.5 3Zm0 2a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11Z",
    shield:
      "M11.6 2.08a1 1 0 0 1 .8 0l7 3A1 1 0 0 1 20 6v5.25c0 4.72-2.84 8.1-7.66 10.65a1 1 0 0 1-.93 0C6.66 19.35 4 15.97 4 11.25V6a1 1 0 0 1 .6-.92l7-3Zm4.1 7.62a1 1 0 0 0-1.4-1.4L11 11.58 9.7 10.3a1 1 0 0 0-1.4 1.4l2 2a1 1 0 0 0 1.4 0l4-4Z",
    sparkle:
      "M12 2a1 1 0 0 1 .93.63l1.45 3.62 3.62 1.45a1 1 0 0 1 0 1.86l-3.62 1.45-1.45 3.62a1 1 0 0 1-1.86 0l-1.45-3.62L6 9.56a1 1 0 0 1 0-1.86l3.62-1.45 1.45-3.62A1 1 0 0 1 12 2Zm6 11a1 1 0 0 1 .93.63l.48 1.2 1.2.48a1 1 0 0 1 0 1.86l-1.2.48-.48 1.2a1 1 0 0 1-1.86 0l-.48-1.2-1.2-.48a1 1 0 0 1 0-1.86l1.2-.48.48-1.2A1 1 0 0 1 18 13Z",
    wallet:
      "M4.75 5A2.75 2.75 0 0 0 2 7.75v8.5A2.75 2.75 0 0 0 4.75 19h14.5A2.75 2.75 0 0 0 22 16.25v-6.5A2.75 2.75 0 0 0 19.25 7H5a1 1 0 0 1 0-2h12a1 1 0 1 0 0-2H4.75Zm13.75 7a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z",
    warning:
      "M10.29 3.86a2 2 0 0 1 3.42 0l8 13.5A2 2 0 0 1 20 20.4H4a2 2 0 0 1-1.71-3.03l8-13.5ZM12 8a1 1 0 0 0-1 1v4a1 1 0 1 0 2 0V9a1 1 0 0 0-1-1Zm0 8a1.15 1.15 0 1 0 0 2.3 1.15 1.15 0 0 0 0-2.3Z",
    x:
      "M6.29 4.88a1 1 0 0 0-1.41 1.41L10.59 12l-5.7 5.71a1 1 0 1 0 1.4 1.41L12 13.41l5.71 5.71a1 1 0 0 0 1.41-1.41L13.41 12l5.71-5.71a1 1 0 0 0-1.41-1.41L12 10.59 6.29 4.88Z",
  };

  return (
    <svg aria-hidden="true" className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d={paths[name]} />
    </svg>
  );
}

function resultSearchText(result) {
  return [
    result.program_name,
    result.provider,
    result.degree_type,
    result.duration,
    result.fee_range,
    result.mode,
    result.reason,
    result.watch_out,
    result.source,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function ProgramResultCard({ result, index }) {
  const sourceLabels = {
    demo_programme: "Seeded programme",
    ugc_deb: "UGC-DEB programme",
    vendor_course: "Institute course",
  };

  return (
    <article className="rounded-2xl border border-black/10 bg-white p-5 shadow-lg shadow-lime-950/5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-amber-700">
            <Icon className="h-3.5 w-3.5" name="sparkle" />
            Rank #{index + 1}
          </p>
          <h3 className="mt-1 text-2xl font-black leading-tight text-neutral-950">
            {result.program_name}
          </h3>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-neutral-950 px-4 py-2 text-sm font-black text-[#ddff5b]">
          <Icon className="h-4 w-4" name="shield" />
          {result.match_percentage}% match
        </div>
      </div>

      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["shield", "Source", sourceLabels[result.source] || "Course record"],
          ["briefcase", "Provider", result.provider],
          ["graduation", "Degree type", result.degree_type],
          ["clock", "Duration", result.duration],
          ["wallet", "Fee range", result.fee_range],
          ["monitor", "Mode", result.mode],
        ].map(([icon, label, value]) => (
          <div className="rounded-xl bg-[#fbfff0] p-3" key={label}>
            <dt className="flex items-center gap-2 text-xs font-black uppercase text-stone-500">
              <Icon className="h-3.5 w-3.5 text-amber-700" name={icon} />
              {label}
            </dt>
            <dd className="mt-1 font-black text-neutral-950">{value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold leading-6 text-emerald-950">
        <span className="inline-flex items-center gap-2 font-black">
          <Icon className="h-4 w-4" name="sparkle" />
          Why this matches:
        </span>{" "}
        {result.reason}
      </p>

      {result.watch_out ? (
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-950">
          <span className="inline-flex items-center gap-2 font-black">
            <Icon className="h-4 w-4" name="warning" />
            Watch out:
          </span>{" "}
          {result.watch_out}
        </p>
      ) : null}
    </article>
  );
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
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

export default function ProgramSearchPanel() {
  const router = useRouter();
  const googleButtonRef = useRef(null);
  const textareaRef = useRef(null);
  const [query, setQuery] = useState(EXAMPLE_QUERY);
  const [useProfileContext, setUseProfileContext] = useState(false);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMoreResults, setShowMoreResults] = useState(false);
  const [modalSearch, setModalSearch] = useState("");
  const [selectedProgramme, setSelectedProgramme] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profileMessage, setProfileMessage] = useState("");

  const normalizedModalSearch = modalSearch.trim().toLowerCase();
  const visibleResults = normalizedModalSearch
    ? results.filter((result) => resultSearchText(result).includes(normalizedModalSearch))
    : results;
  const topResults = visibleResults.slice(0, 3);
  const otherResults = visibleResults.slice(3, 10);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!textareaRef.current) {
      return;
    }

    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 220)}px`;
  }, [query]);

  useEffect(() => {
    if (!isLoginModalOpen || !googleClientId || !googleButtonRef.current) {
      return;
    }

    function continueToProgramme() {
      setIsLoginModalOpen(false);
      router.push("/programmes/selected");
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

          continueToProgramme();
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
      googleButtonRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "filled_black",
        size: "large",
        type: "standard",
        shape: "pill",
        text: "continue_with",
        width: googleButtonRef.current.offsetWidth || 320,
      });
    }

    if (window.google?.accounts?.id) {
      renderButton();
      return;
    }

    const existingScript = document.querySelector("script[src='https://accounts.google.com/gsi/client']");
    if (existingScript) {
      existingScript.addEventListener("load", renderButton, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = renderButton;
    script.onerror = () => setAuthError("Could not load Google sign-in. Check your connection.");
    document.head.appendChild(script);
  }, [googleClientId, isLoginModalOpen, router]);

  async function runSearch(nextQuery = query) {
    const trimmedQuery = nextQuery.trim();
    if (!trimmedQuery) {
      setError("Tell us what you want to study or become.");
      return;
    }

    setLoading(true);
    setError("");
    setProfileMessage("");
    setHasSearched(true);
    setIsModalOpen(false);
    setShowMoreResults(false);
    setModalSearch("");

    try {
      const response = await fetch("/api/program-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: trimmedQuery,
          use_profile_context: useProfileContext,
          filters: {},
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Could not search programmes.");
      }

      setResults(data.results || []);
      setProfileMessage(data.profile_message || "");
      setShowMoreResults(false);
      setModalSearch("");
      setIsModalOpen(true);
    } catch (searchError) {
      setResults([]);
      setIsModalOpen(false);
      setError(searchError.message);
    } finally {
      setLoading(false);
    }
  }

  function useChip(text) {
    setQuery(text);
    runSearch(text);
  }

  async function userIsLoggedIn() {
    let response = await fetch("/api/auth/me", { cache: "no-store" });

    if (response.status === 401) {
      await fetch("/api/auth/refresh", { method: "POST" });
      response = await fetch("/api/auth/me", { cache: "no-store" });
    }

    return response.ok;
  }

  async function openProgramme(result) {
    const payload = {
      ...result,
      searched_query: query,
      saved_at: new Date().toISOString(),
    };
    window.sessionStorage.setItem(SELECTED_PROGRAMME_STORAGE_KEY, JSON.stringify(payload));
    setSelectedProgramme(payload);
    setAuthError("");

    if (await userIsLoggedIn()) {
      router.push("/programmes/selected");
      return;
    }

    setIsLoginModalOpen(true);
  }

  return (
    <section className="eazy-surface mb-8 min-h-[78vh] overflow-hidden rounded-[2rem] border border-black/10 p-5 shadow-2xl shadow-lime-950/10 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-5xl text-center">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#9a3f00] sm:text-base">
          AI course search
        </p>
        <h2 className="mt-4 text-4xl font-black leading-tight text-neutral-950 sm:text-6xl lg:text-7xl">
          What do you want to study or become?
        </h2>
      </div>

      <form
        className="mx-auto mt-8 max-w-6xl rounded-[2rem] border border-black/10 bg-white p-4 text-left shadow-2xl shadow-lime-950/10 sm:p-5"
        onSubmit={(event) => {
          event.preventDefault();
          runSearch();
        }}
      >
        <textarea
          ref={textareaRef}
          className="min-h-[220px] w-full resize-none overflow-hidden rounded-[1.5rem] border-0 bg-[#fbf7ed] p-6 text-xl font-black leading-9 text-neutral-950 outline-none placeholder:text-stone-400 sm:text-2xl sm:leading-10"
          placeholder={EXAMPLE_QUERY}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              runSearch();
            }
          }}
        />
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="flex items-center gap-3 text-base font-bold leading-6 text-stone-700">
            <input
              checked={useProfileContext}
              className="h-5 w-5 accent-neutral-950"
              type="checkbox"
              onChange={(event) => setUseProfileContext(event.target.checked)}
            />
            Use my profile context for better matching
          </label>
          <button
            className="eazy-cta min-h-16 rounded-full px-10 text-xl font-black transition disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
            type="submit"
          >
            {loading ? "Finding courses..." : "Find my best courses"}
          </button>
        </div>
      </form>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {EXAMPLE_CHIPS.map((chip) => (
          <button
            className="rounded-full border border-[#ddff5b] bg-white/80 px-5 py-2.5 text-sm font-black text-[#5a2a12] shadow-sm transition hover:border-neutral-950 hover:bg-[#f4ffd1]"
            key={chip}
            type="button"
            onClick={() => useChip(chip)}
          >
            {chip}
          </button>
        ))}
      </div>

      {profileMessage ? (
        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-950">
          {profileMessage}
        </div>
      ) : null}

      {error ? (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-900">
          {error}
        </div>
      ) : null}

      {hasSearched && loading ? (
        <div className="mx-auto mt-6 max-w-4xl rounded-2xl border border-stone-200 bg-white p-8 text-center text-sm font-black text-stone-600">
          Searching courses...
        </div>
      ) : null}

      {isModalOpen ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-neutral-950/60 px-4 py-6 backdrop-blur-sm sm:py-10"
          role="dialog"
        >
          <div className="w-full max-w-5xl rounded-2xl border border-black/10 bg-[#fbfff0] p-4 shadow-2xl sm:p-5">
            <div className="flex items-center gap-3">
              <label className="relative min-w-0 flex-1">
                <Icon
                  className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400"
                  name="search"
                />
                <input
                  autoFocus
                  className="min-h-14 w-full rounded-full border border-black/10 bg-white py-3 pl-12 pr-4 text-base font-bold text-neutral-950 outline-none transition placeholder:text-stone-400 focus:border-neutral-950 focus:ring-4 focus:ring-[#ddff5b]/40"
                  placeholder="Search courses, university, mode..."
                  type="search"
                  value={modalSearch}
                  onChange={(event) => {
                    setModalSearch(event.target.value);
                    setShowMoreResults(true);
                  }}
                />
              </label>
              <button
                aria-label="Close results"
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-black/10 bg-white text-neutral-950 shadow-sm transition hover:bg-[#f4ffd1]"
                type="button"
                onClick={() => setIsModalOpen(false)}
              >
                <Icon className="h-5 w-5" name="x" />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-[#9a3f00]">
                {normalizedModalSearch
                  ? `${visibleResults.length} matching results`
                  : "Top 3 matches"}
              </p>
            </div>

            {topResults.length ? (
              <div className="mt-4 grid gap-4">
                {topResults.map((result, index) => (
                  <button
                  className="block text-left transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-[#ddff5b]/40"
                    key={`${result.program_name}-${result.provider}`}
                    type="button"
                    onClick={() => openProgramme(result)}
                  >
                    <ProgramResultCard index={index} result={result} />
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-lg border border-stone-200 bg-white p-8 text-center text-sm font-black text-stone-600">
                No programme in the top 10 matches this search.
              </div>
            )}

            {otherResults.length ? (
              <div className="mt-5">
                <button
                  className="min-h-12 w-full rounded-full border border-black/10 bg-white px-5 text-sm font-black text-neutral-950 shadow-sm transition hover:border-neutral-950 hover:bg-[#f4ffd1]"
                  type="button"
                  onClick={() => setShowMoreResults((current) => !current)}
                >
                  {showMoreResults
                    ? "Hide other options"
                    : `More options (${otherResults.length})`}
                  <Icon
                    className={`ml-2 inline-block h-4 w-4 transition ${
                      showMoreResults ? "rotate-180" : ""
                    }`}
                    name="chevron"
                  />
                </button>

                {showMoreResults ? (
                  <div className="mt-4 grid gap-4">
                    {otherResults.map((result, index) => (
                      <button
                        className="block text-left transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-[#ddff5b]/40"
                        key={`${result.program_name}-${result.provider}`}
                        type="button"
                        onClick={() => openProgramme(result)}
                      >
                        <ProgramResultCard index={index + 3} result={result} />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {isLoginModalOpen ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-[60] grid place-items-center bg-neutral-950/60 px-4 backdrop-blur-sm"
          role="dialog"
        >
          <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#9a3f00]">
                  Continue with Google
                </p>
                <h3 className="mt-2 text-2xl font-black leading-tight text-neutral-950">
                  Open course details
                </h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-stone-600">
                  Sign in to see admission guidance, eligibility notes, and next steps for{" "}
                  <span className="font-black text-neutral-950">
                    {selectedProgramme?.program_name || "this programme"}
                  </span>
                  .
                </p>
              </div>
              <button
                aria-label="Close login"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-stone-200 text-neutral-950 transition hover:bg-[#f4ffd1]"
                type="button"
                onClick={() => setIsLoginModalOpen(false)}
              >
                <Icon className="h-5 w-5" name="x" />
              </button>
            </div>

            <div className="mt-5">
              {googleClientId ? (
                <div
                  className={isSigningIn ? "pointer-events-none opacity-60" : ""}
                  ref={googleButtonRef}
                />
              ) : (
                <button
                  className="eazy-cta flex min-h-14 w-full items-center justify-center gap-3 rounded-full px-5 text-base font-black transition"
                  type="button"
                  onClick={() => setAuthError("Set NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable Google login.")}
                >
                  <GoogleMark />
                  Continue with Google
                </button>
              )}
            </div>
            {authError ? (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                {authError}
              </p>
            ) : null}
            {isSigningIn ? (
              <p className="mt-3 text-center text-sm font-semibold text-stone-600">
                Signing you in...
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
