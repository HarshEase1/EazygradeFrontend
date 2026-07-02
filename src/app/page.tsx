"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AuthActions from "./components/AuthActions";
import ProgramSearchPanel from "./components/ProgramSearchPanel";

const SOURCE_LABELS = {
  ugc: "UGC",
  aishe: "AISHE",
  ugc_aishe: "UGC/AISHE",
  ugc_deb: "UGC-DEB",
  nirf: "NIRF",
};

const TYPE_LABELS = {
  university: "University",
  ugc_deb_programme: "Programme",
  nirf_ranking: "NIRF Ranking",
};

const SAMPLE_QUERIES = [
  "diploma in computer",
  "online mba",
  "engineering colleges delhi",
  "central university",
];

const PIPELINE_SECTIONS = [
  {
    key: "profile",
    label: "Profile",
    detail: "Candidate profile, documents, goals, subjects, and preferences",
  },
  {
    key: "eligibility",
    label: "Eligibility",
    detail: "Qualification, stream, subjects, percentage, and document readiness",
  },
  {
    key: "course_filter",
    label: "Course filter",
    detail: "Immediate, likely, future-path, and not-recommended programme filtering",
  },
  {
    key: "scoring",
    label: "Scoring",
    detail: "Eligibility, career goal, academics, interests, location, and trust score",
  },
  {
    key: "ranking",
    label: "Ranked courses",
    detail: "Final ordered recommendation list with match percentages",
  },
  {
    key: "ai_analysis",
    label: "AI explanation",
    detail: "Candidate-facing explanation and next actions",
  },
];

const EAZYGRAD_LOGO_URL =
  "https://framerusercontent.com/images/czlTrRfNKMvHap0TW60cYEGcglI.png?width=414&height=87";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

function buildQuery(params: Record<string, any>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  return searchParams.toString();
}

function stripMarks(value = "") {
  return value.replaceAll("<mark>", "").replaceAll("</mark>", "");
}

function labelFor(map, value, fallback = "All") {
  if (!value) return fallback;
  return map[value] || value.replaceAll("_", " ");
}

function formatDetailValue(value) {
  if (!value) return "";

  return String(value)
    .replaceAll("_", " ")
    .replace(/\bugc deb programme\b/i, "Programme")
    .replace(/\bonline\((.*?)\)/gi, "Online ($1)")
    .replace(/\bodl\((.*?)\)/gi, "ODL ($1)")
    .trim();
}

function getLocation(result) {
  return [result.city, result.district, result.state].filter(Boolean).join(", ");
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
    <footer className="mt-14 rounded-2xl border border-stone-200 bg-neutral-950 px-5 py-6 text-white sm:px-7">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <BrandLogo footer />
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-stone-300">
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

function Badge({ children, dark = false }) {
  return (
    <span
      className={`rounded-full border px-3 py-1.5 text-xs font-black ${
        dark
          ? "border-neutral-950 bg-neutral-950 text-yellow-300"
          : "border-amber-200 bg-amber-50 text-amber-950"
      }`}
    >
      {children}
    </span>
  );
}

function AnalysisWaitingCard({ compact = false }) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-2xl shadow-amber-950/10 ring-1 ring-black/[0.02] sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase text-amber-800">
            Candidate engine
          </p>
          <h2 className="mt-1 text-xl font-black leading-tight text-neutral-950">
            Preparing recommendation report
          </h2>
          <p className="mt-2 text-sm font-bold leading-6 text-stone-600">
            Checking profile, courses, eligibility, and matches. This can take a moment.
          </p>
        </div>
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-yellow-300 text-xl font-black text-neutral-950">
          ...
        </span>
      </div>

      <div className={`mt-5 grid gap-3 ${compact ? "" : "sm:grid-cols-3"}`}>
        {["Profile", "Eligibility", "Ranking"].map((label) => (
          <div
            className="overflow-hidden rounded-lg border border-stone-200 bg-[#fffaf0] p-3"
            key={label}
          >
            <p className="text-xs font-black uppercase text-stone-500">{label}</p>
            <div className="mt-3 h-3 animate-pulse rounded-full bg-gradient-to-r from-yellow-100 via-yellow-300 to-yellow-100" />
            <div className="mt-2 h-3 w-2/3 animate-pulse rounded-full bg-stone-100" />
          </div>
        ))}
      </div>
    </section>
  );
}

function RecommendationFlow() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function fetchJsonWithRefresh(url) {
      let response = await fetch(url, { cache: "no-store" });

      if (response.status === 401) {
        await fetch("/api/auth/refresh", { method: "POST" });
        response = await fetch(url, { cache: "no-store" });
      }

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.detail || body.error || "Could not load data.");
      }

      return response.json();
    }

    async function loadProgress() {
      setLoading(true);
      const payload = await fetchJsonWithRefresh("/api/recommendations/analysis?limit=100");

      if (!isActive) return;

      if (!payload?.id) {
        setError("Login and complete your candidate profile to start the recommendation engine.");
        setData(null);
        return;
      }

      setData(payload);
      setError("");
      setLoading(false);
    }

    loadProgress().catch((err) => {
      if (isActive) {
        const msg = err.message || "";
        if (msg.includes("Authentication") || msg.includes("credentials") || msg.includes("Unauthorized")) {
          setError("Login and complete your candidate profile to start the recommendation engine.");
        } else {
          setError(msg || "Could not start the recommendation engine. Check that Django is running.");
        }
        setLoading(false);
      }
    });

    return () => {
      isActive = false;
    };
  }, []);

  const completedCount = data?.sections
    ? Object.values(data.sections).filter((section: any) => section.status === "completed").length
    : 0;
  const topMatch = data?.recommendations?.[0]?.match_percentage;
  const isReady = Boolean(data?.id);

  if (loading) {
    return <AnalysisWaitingCard compact />;
  }

  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-2xl shadow-amber-950/10 ring-1 ring-black/[0.02] sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase text-amber-800">Candidate engine</p>
          <h2 className="mt-1 text-xl font-black leading-tight text-neutral-950">
            Profile to AI analysis
          </h2>
          <p className="mt-2 text-sm font-bold leading-6 text-stone-600">
            {loading
              ? "Checking your recommendation run..."
              : error
                ? "Complete login/profile, then run the engine."
                : `${completedCount}/6 sections ready${topMatch ? ` · top match ${topMatch}%` : ""}`}
          </p>
        </div>
        <Link
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-neutral-950 text-2xl font-black text-yellow-300 transition hover:bg-stone-800"
          href={isReady ? "/eligibility" : "/onboarding"}
          aria-label="Open full analysis page"
        >
          →
        </Link>
      </div>

      <div className="mt-5">
        <div className="relative grid grid-cols-6 gap-1">
          <div className="absolute left-0 right-0 top-4 h-1 rounded-full bg-stone-200" />
          <motion.div
            className="absolute left-0 top-4 h-1 rounded-full bg-neutral-950"
            initial={{ width: "0%" }}
            animate={{ width: `${Math.max((completedCount / PIPELINE_SECTIONS.length) * 100, loading ? 18 : 0)}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          {PIPELINE_SECTIONS.map((step, index) => {
            const isComplete = Boolean((data?.sections as any)?.[step.key]?.status === "completed");
            return (
              <div className="relative grid justify-items-center gap-2" key={step.key}>
                <span
                  className={`z-10 grid h-9 w-9 place-items-center rounded-full border text-xs font-black ${
                    isComplete
                      ? "border-neutral-950 bg-neutral-950 text-yellow-300"
                      : index === 0 && loading
                        ? "border-yellow-300 bg-yellow-300 text-neutral-950"
                        : "border-stone-200 bg-white text-stone-400"
                  }`}
                >
                  {index + 1}
                </span>
                <span className="hidden text-center text-[10px] font-black uppercase leading-4 text-stone-500 sm:block">
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {error ? (
          <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-black text-red-700">
            Needs profile
          </span>
        ) : null}
        {data?.cached ? (
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-800">
            Cached run
          </span>
        ) : null}
        <Link
          className="rounded-full border border-stone-200 bg-yellow-50 px-3 py-1.5 text-xs font-black text-neutral-950 transition hover:border-yellow-300 hover:bg-yellow-100"
          href={isReady ? "/eligibility" : "/onboarding"}
        >
          {isReady ? "Open full analysis" : "Complete profile"} →
        </Link>
      </div>
    </section>
  );
}

function CandidateEngineGate() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function checkSession() {
      try {
        let response = await fetch("/api/auth/me", { cache: "no-store" });

        if (response.status === 401) {
          await fetch("/api/auth/refresh", { method: "POST" });
          response = await fetch("/api/auth/me", { cache: "no-store" });
        }

        if (isActive) {
          setIsLoggedIn(response.ok);
        }
      } catch {
        if (isActive) {
          setIsLoggedIn(false);
        }
      } finally {
        if (isActive) {
          setIsChecking(false);
        }
      }
    }

    checkSession();

    return () => {
      isActive = false;
    };
  }, []);

  if (isChecking || !isLoggedIn) {
    return null;
  }

  return <RecommendationFlow />;
}

function ResultCard({ result, index }) {
  const location = getLocation(result);
  const headline = stripMarks(result.headline || "");
  const sourceLabel = labelFor(SOURCE_LABELS, result.source, "Source");
  const typeLabel = labelFor(TYPE_LABELS, result.entity_type, "Record");
  const metadata = result.metadata || {};
  const detailRows = [
    (metadata.hei_name || result.subtitle) && [
      "Institution",
      metadata.hei_name || result.subtitle,
    ],
    result.category && ["Category", labelFor(TYPE_LABELS, result.category, "Record")],
    result.level && ["Level", result.level],
    result.mode && ["Mode", result.mode],
    result.year && ["Year", result.year],
    result.rank && ["Rank", result.rank],
    result.score && ["Score", result.score],
    metadata.session && ["Session", metadata.session],
  ].filter(Boolean);

  return (
    <motion.article
      layout
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.035, 0.2) }}
      className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm shadow-amber-950/5 ring-1 ring-black/[0.02] sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge dark>{sourceLabel}</Badge>
            <Badge>{typeLabel}</Badge>
          </div>
          <h2 className="break-words text-xl font-black leading-tight text-neutral-950 sm:text-2xl">
            {result.title}
          </h2>
          {location ? (
            <p className="mt-2 text-sm font-bold text-stone-500">{location}</p>
          ) : null}
        </div>
        {result.source_url ? (
          <a
            className="shrink-0 rounded-full border border-stone-200 bg-white px-4 py-2 text-center text-sm font-black text-neutral-950 transition hover:border-yellow-300 hover:bg-yellow-50"
            href={result.source_url}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open source for ${result.title}`}
          >
            Source
          </a>
        ) : null}
      </div>

      {headline ? (
        <p className="mt-4 border-l-4 border-yellow-300 bg-[#fffaf0] px-4 py-3 text-sm font-semibold leading-7 text-stone-700 sm:text-[15px]">
          {headline}
        </p>
      ) : null}

      {detailRows.length ? (
        <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {detailRows.map(([label, value]) => (
            <div
              className="min-w-0 rounded-xl border border-stone-200 bg-white p-4 shadow-[0_1px_0_rgba(18,18,18,0.04)] transition hover:border-yellow-300 hover:bg-yellow-50/30"
              key={`${label}-${value}`}
            >
              <dt className="mb-2 text-[11px] font-black uppercase text-stone-500">
                {label}
              </dt>
              <dd className="break-words text-[15px] font-black leading-6 text-neutral-950">
                {formatDetailValue(value)}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </motion.article>
  );
}

export default function Home() {
  const [query, setQuery] = useState("diploma in computer");
  const [submittedQuery, setSubmittedQuery] = useState("diploma in computer");
  const [dedupe, setDedupe] = useState(true);
  const [source, setSource] = useState("");
  const [entityType, setEntityType] = useState("");
  const [limit, setLimit] = useState("20");
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasCandidateSession, setHasCandidateSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const activeSummary = useMemo(() => {
    return [
      labelFor(SOURCE_LABELS, source),
      labelFor(TYPE_LABELS, entityType),
      `${limit} results`,
      dedupe ? "Smart dedupe on" : "Raw results",
    ].join(" / ");
  }, [dedupe, entityType, limit, source]);

  const numericLimit = Number(limit);
  const pagination = data?.pagination;
  const pageNumber = Math.floor(offset / numericLimit) + 1;
  const pageStart = data?.results?.length ? offset + 1 : 0;
  const pageEnd = data?.results?.length ? offset + data.results.length : 0;

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
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setOffset(0);
      setSubmittedQuery("");
      return;
    }

    const timer = setTimeout(() => {
      setOffset(0);
      setSubmittedQuery(trimmedQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!submittedQuery.trim()) {
      setData(null);
      return;
    }

    const controller = new AbortController();

    async function runSearch() {
      setIsLoading(true);
      setError("");

      try {
        const qs = buildQuery({
          q: submittedQuery.trim(),
          dedupe: dedupe ? "true" : "false",
          source,
          type: entityType,
          limit,
          offset,
        });
        const response = await fetch(`/api/institutions/search?${qs}`, {
          signal: controller.signal,
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Search failed");
        }

        setData(payload);
      } catch (searchError) {
        if (searchError.name !== "AbortError") {
          setError(searchError.message);
          setData(null);
        }
      } finally {
        setIsLoading(false);
      }
    }

    runSearch();

    return () => controller.abort();
  }, [dedupe, entityType, limit, offset, source, submittedQuery]);

  function onSubmit(event) {
    event.preventDefault();
    setOffset(0);
    setSubmittedQuery(query);
  }

  function updateFilter(setter, value) {
    setter(value);
    setOffset(0);
  }

  return (
    <main className="min-h-screen text-neutral-950">
      <nav className="relative z-50 flex items-center justify-between border-b border-stone-100 bg-white px-6 py-4 md:px-10 lg:px-16">
        <Link href="/">
          <BrandLogo />
        </Link>
        <AuthActions variant="nav" />
      </nav>

      <div className="relative mx-auto max-w-[1500px] px-4 py-8 md:py-12 lg:px-10">
        {/* Background Swooshes */}
        <div className="absolute top-0 right-0 -z-10 w-full h-[600px] overflow-hidden pointer-events-none">
           <svg viewBox="0 0 1000 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute right-0 top-0 w-full h-full opacity-60">
              <path d="M400 -100 L1100 500 L1200 400 L500 -200 Z" fill="#e2f7eb"/>
              <path d="M500 -50 L1050 450 L1100 400 L550 -100 Z" fill="#bcf0d4"/>
           </svg>
        </div>

        <motion.section
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.08 }}
          className="grid gap-6"
        >
          <motion.div id="ai-course-search" variants={fadeUp} className="relative mx-auto w-full">
            <ProgramSearchPanel />
          </motion.div>
        </motion.section>

        <div className="mt-10">
          <CandidateEngineGate />
        </div>

        <section className="mt-14 mb-5">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#9a3f00]">
            Verified data workspace
          </p>
          <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-black leading-tight text-neutral-950">
                Search government and ranking records
              </h2>
              <p className="mt-2 max-w-2xl text-base font-semibold leading-7 text-stone-600">
                This is the data layer behind the experience: UGC, AISHE, UGC-DEB, and NIRF records with deduplication.
              </p>
            </div>
            <form className="w-full max-w-xl" onSubmit={onSubmit}>
              <div className="grid overflow-hidden rounded-xl border-2 border-neutral-950 bg-white sm:grid-cols-[1fr_auto] focus-within:ring-4 focus-within:ring-[#ddff5b]/40">
                <input
                  id="institution-search"
                  className="min-h-[58px] min-w-0 bg-transparent px-4 text-[16px] font-bold outline-none placeholder:text-stone-400"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by course, college, city..."
                />
                <button
                  className="min-h-[58px] bg-neutral-950 px-7 font-black text-[#ddff5b] transition hover:bg-stone-800"
                  type="submit"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.35 }}
          className="mb-6 grid gap-3 rounded-lg bg-neutral-950 p-3 text-white md:grid-cols-[1fr_1fr_1fr_auto] md:items-end"
          aria-label="Search filters"
        >
          <div>
            <label className="mb-2 block text-xs font-black uppercase text-yellow-200" htmlFor="source">
              Source
            </label>
            <select
              className="h-11 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 font-semibold outline-none"
              id="source"
              value={source}
              onChange={(event) => updateFilter(setSource, event.target.value)}
            >
              <option value="">All sources</option>
              <option value="ugc_aishe">UGC/AISHE</option>
              <option value="ugc_deb">UGC-DEB</option>
              <option value="nirf">NIRF</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-black uppercase text-yellow-200" htmlFor="type">
              Type
            </label>
            <select
              className="h-11 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 font-semibold outline-none"
              id="type"
              value={entityType}
              onChange={(event) => updateFilter(setEntityType, event.target.value)}
            >
              <option value="">All records</option>
              <option value="university">Universities</option>
              <option value="ugc_deb_programme">Programmes</option>
              <option value="nirf_ranking">NIRF rankings</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-black uppercase text-yellow-200" htmlFor="limit">
              Limit
            </label>
            <select
              className="h-11 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 font-semibold outline-none"
              id="limit"
              value={limit}
              onChange={(event) => updateFilter(setLimit, event.target.value)}
            >
              <option value="10">10 results</option>
              <option value="20">20 results</option>
              <option value="50">50 results</option>
              <option value="100">100 results</option>
            </select>
          </div>

          <label className="flex min-h-11 items-center gap-3 rounded-lg bg-neutral-800 px-3">
            <input
              className="peer sr-only"
              type="checkbox"
              checked={!dedupe}
              onChange={(event) => {
                setDedupe(!event.target.checked);
                setOffset(0);
              }}
            />
            <span
              className={`flex h-6 w-11 rounded-full p-0.5 transition ${
                dedupe ? "bg-neutral-600" : "bg-yellow-300"
              }`}
            >
              <span
                className={`h-5 w-5 rounded-full bg-white transition ${
                  dedupe ? "translate-x-0" : "translate-x-5"
                }`}
              />
            </span>
            <strong className="text-sm font-black">Show duplicate/raw entries</strong>
          </label>
        </motion.section>

        <section aria-live="polite">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 text-sm font-extrabold text-stone-500">{activeSummary}</p>
              <h2 className="text-2xl font-black leading-tight text-neutral-950 sm:text-4xl">
                {isLoading
                  ? "Searching records..."
                  : data
                    ? `${data.count} result${data.count === 1 ? "" : "s"} for "${data.query}"`
                    : "Start with a search"}
              </h2>
              {data?.results?.length ? (
                <p className="mt-2 text-sm font-bold text-stone-500">
                  Showing {pageStart}-{pageEnd} · Page {pageNumber}
                </p>
              ) : null}
            </div>
            <span
              className={`rounded-full border px-4 py-2 text-center text-sm font-black ${
                dedupe
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-stone-200 bg-white text-stone-500"
              }`}
            >
              {dedupe ? "Dedupe on" : "Dedupe off"}
            </span>
          </div>

          <AnimatePresence mode="wait">
            {error ? (
              <motion.div
                key="error"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: 8 }}
                className="mb-4 grid gap-1 rounded-lg border border-red-200 bg-white p-5"
              >
                <strong className="text-lg font-black text-red-700">
                  Could not reach the search API.
                </strong>
                <span className="text-stone-600">{error}</span>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {isLoading ? (
            <div className="grid gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <motion.div
                  className="h-40 overflow-hidden rounded-lg border border-stone-200 bg-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.04 }}
                  key={index}
                >
                  <div className="h-full animate-pulse bg-gradient-to-r from-white via-yellow-100 to-white" />
                </motion.div>
              ))}
            </div>
          ) : null}

          {!isLoading && data?.results?.length ? (
            <>
              <motion.div layout className="grid gap-4">
                <AnimatePresence>
                  {data.results.map((result, index) => (
                    <ResultCard
                      key={`${result.entity_type}-${result.id}`}
                      result={result}
                      index={index}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>

              <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-black text-neutral-950">
                    Page {pageNumber}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-stone-500">
                    {pagination?.has_next
                      ? `More records available after ${pageEnd}`
                      : "You are at the last available page"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex">
                  <button
                    className="rounded-full border border-stone-200 px-5 py-2.5 text-sm font-black text-neutral-950 transition enabled:hover:border-yellow-300 enabled:hover:bg-yellow-50 disabled:cursor-not-allowed disabled:opacity-45"
                    type="button"
                    disabled={!pagination?.has_previous || isLoading}
                    onClick={() => setOffset(pagination.previous_offset ?? 0)}
                  >
                    Previous
                  </button>
                  <button
                    className="rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-black text-yellow-300 transition enabled:hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-45"
                    type="button"
                    disabled={!pagination?.has_next || isLoading}
                    onClick={() => setOffset(pagination.next_offset ?? offset + numericLimit)}
                  >
                    Next {numericLimit}
                  </button>
                </div>
              </div>
            </>
          ) : null}

          {!isLoading && data && !data.results?.length && !error ? (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="grid gap-1 rounded-lg border border-stone-200 bg-white p-6"
            >
              <strong className="text-lg font-black text-neutral-950">
                No matching records found.
              </strong>
              <span className="text-stone-600">
                Try a shorter query, remove filters, or switch on raw entries.
              </span>
            </motion.div>
          ) : null}
        </section>
        <Footer />
      </div>
    </main>
  );
}
