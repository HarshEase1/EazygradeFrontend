"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AuthActions from "../components/AuthActions";

const EAZYGRAD_LOGO_URL =
  "https://framerusercontent.com/images/czlTrRfNKMvHap0TW60cYEGcglI.png?width=414&height=87";
const SELECTED_PROGRAMME_STORAGE_KEY = "eazygrad_selected_programme";

const PIPELINE_SECTIONS = [
  ["profile", "Profile", "Candidate inputs, documents, goals, subjects, and preferences."],
  ["eligibility", "Eligibility", "Qualification, stream, subjects, percentage, and documents."],
  ["course_filter", "Course filter", "Immediate, likely, future-path, and rejected programme filtering."],
  ["scoring", "Scoring", "Eligibility, career, academics, interests, location, and source trust."],
  ["ranking", "Ranking", "Final order of programmes by match percentage and score."],
  ["ai_analysis", "AI analysis", "Candidate explanation and next actions."],
];

const statusLabels = {
  eligible: "Eligible",
  likely_eligible: "Likely eligible",
  not_eligible: "Not eligible",
  insufficient_data: "Needs marks/details",
  future_path: "Future path",
};

const recommendationLabels = {
  strong_recommendation: "Strong",
  good_option: "Good option",
  backup_option: "Backup",
  future_path: "Future path",
  not_recommended: "Not recommended",
};

const statusClasses = {
  eligible: "border-emerald-200 bg-emerald-50 text-emerald-800",
  likely_eligible: "border-lime-200 bg-lime-50 text-lime-900",
  not_eligible: "border-red-200 bg-red-50 text-red-700",
  insufficient_data: "border-sky-200 bg-sky-50 text-sky-800",
  future_path: "border-violet-200 bg-violet-50 text-violet-800",
};

function compactLabel(value) {
  return String(value || "").replaceAll("_", " ");
}

function formatList(value, fallback = "Not specified") {
  if (Array.isArray(value) && value.length) return value.join(", ");
  return value || fallback;
}

function countBy(items, getter) {
  return items.reduce((accumulator, item) => {
    const key = getter(item) || "unknown";
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});
}

async function parseError(response, fallback) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const payload = await response.json();
    return payload.detail || payload.error || fallback;
  }
  return fallback;
}

function AnalysisWaitingPanel() {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl shadow-amber-950/10 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase text-amber-800">
            Preparing recommendation report
          </p>
          <h2 className="mt-2 text-2xl font-black leading-tight text-neutral-950 sm:text-4xl">
            Waiting while EazyGrade checks your profile.
          </h2>
          <p className="mt-3 max-w-2xl text-sm font-bold leading-6 text-stone-600">
            We are checking eligibility, matching courses, ranking options, and preparing the
            explanation. Please keep this page open.
          </p>
        </div>
        <span className="rounded-full bg-[#ddff5b] px-4 py-2 text-sm font-black text-neutral-950">
          Running
        </span>
      </div>

      <div className="mt-6 grid gap-4">
        {["Profile check", "Eligibility check", "Course matching", "Report summary"].map(
          (label) => (
            <div
              className="overflow-hidden rounded-xl border border-stone-200 bg-[#fbfff0] p-4"
              key={label}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-black text-neutral-950">{label}</p>
                <span className="text-xs font-black uppercase text-stone-500">Waiting</span>
              </div>
              <div className="mt-4 h-3 animate-pulse rounded-full bg-gradient-to-r from-white via-[#ddff5b] to-white" />
              <div className="mt-3 h-3 w-2/3 animate-pulse rounded-full bg-stone-100" />
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function recommendationToSelectedProgramme(item) {
  const programme = item.programme || {};

  return {
    program_name: programme.program_name,
    provider: programme.hei_name,
    degree_type: programme.level,
    duration: programme.year ? `${programme.year}` : "Not listed",
    fee_range: "Verify on official university website",
    mode: programme.mode,
    source: "ugc_deb",
    source_id: programme.id,
    match_percentage: item.match_percentage,
    reason:
      item.positive_factors?.[0] ||
      `${programme.program_name} is recommended from your candidate eligibility analysis.`,
    watch_out: item.negative_factors?.[0] || "",
    eligibility: item.eligibility,
    recommendation_type: item.recommendation_type,
    saved_at: new Date().toISOString(),
  };
}

function RecommendationCard({ item, onOpen }) {
  const programme = item.programme || {};
  const eligibility = item.eligibility || {};
  const status = eligibility.eligibility_status;

  return (
    <button
      className="rounded-xl border border-stone-200 bg-white p-5 text-left shadow-sm shadow-amber-950/5 transition hover:-translate-y-0.5 hover:border-neutral-950 focus:outline-none focus:ring-4 focus:ring-[#ddff5b]/40"
      type="button"
      onClick={() => onOpen(item)}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <span
              className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-black ${
                statusClasses[status] || "border-stone-200 bg-stone-50 text-stone-700"
              }`}
            >
              {statusLabels[status] || compactLabel(status)}
            </span>
            <span className="inline-flex rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-black text-stone-700">
              {recommendationLabels[item.recommendation_type] ||
                compactLabel(item.recommendation_type)}
            </span>
          </div>
          <h2 className="mt-3 break-words text-xl font-black leading-tight text-neutral-950">
            #{item.rank} {programme.program_name}
          </h2>
          <p className="mt-2 text-sm font-bold leading-6 text-stone-600">
            {[programme.hei_name, programme.state].filter(Boolean).join(", ")}
          </p>
        </div>
        <div className="rounded-lg bg-neutral-950 px-3 py-2 text-center text-sm font-black text-[#ddff5b]">
          {item.match_percentage}% match
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-sm font-bold text-stone-700">
        <p>{[programme.level, programme.mode, programme.year].filter(Boolean).join(" / ")}</p>
        {item.positive_factors?.[0] ? <p>{item.positive_factors[0]}</p> : null}
        {item.negative_factors?.[0] ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-900">
            <span className="font-black">Watch out: </span>
            {item.negative_factors[0]}
          </div>
        ) : null}
      </div>
    </button>
  );
}

function SectionDetails({ sectionKey, data, recommendations }) {
  const profile = data?.profile_snapshot || {};
  const section = data?.sections?.[sectionKey] || {};
  const top = recommendations[0];
  const eligibilityCounts = countBy(
    recommendations,
    (item) => item.eligibility?.eligibility_status,
  );
  const filterCounts = countBy(recommendations, (item) => item.filter_status);
  const typeCounts = countBy(recommendations, (item) => item.recommendation_type);

  if (sectionKey === "profile") {
    return (
      <div className="grid gap-3 text-sm font-bold leading-6 text-stone-700 sm:grid-cols-2">
        <p><strong className="text-neutral-950">Education:</strong> {compactLabel(profile.education_status)}</p>
        <p><strong className="text-neutral-950">Stream:</strong> {compactLabel(profile.stream)}</p>
        <p><strong className="text-neutral-950">Mode:</strong> {compactLabel(profile.study_mode)}</p>
        <p><strong className="text-neutral-950">Location:</strong> {[profile.city, profile.state].filter(Boolean).join(", ") || "Not specified"}</p>
        <p><strong className="text-neutral-950">Career goals:</strong> {formatList(profile.target_careers)}</p>
        <p><strong className="text-neutral-950">Subjects:</strong> {formatList(profile.interested_subjects)}</p>
        <p><strong className="text-neutral-950">Documents:</strong> {formatList(profile.documents, "No uploaded documents detected")}</p>
        <p><strong className="text-neutral-950">Ready:</strong> {section.is_ready ? "Yes" : "Needs profile/documents"}</p>
      </div>
    );
  }

  if (sectionKey === "eligibility") {
    return (
      <div className="grid gap-3">
        <p className="text-sm font-bold text-stone-700">
          Checked {section.programme_count || 0} programmes against qualification,
          stream, required subjects, percentage, and document readiness.
        </p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(eligibilityCounts).map(([key, count]) => (
            <span className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-black text-stone-700" key={key}>
              {statusLabels[key] || compactLabel(key)}: {count}
            </span>
          ))}
        </div>
        {top?.eligibility?.passed_rules?.slice(0, 4).map((rule) => (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800" key={rule}>
            {rule}
          </p>
        ))}
        {top?.eligibility?.warnings?.slice(0, 2).map((warning) => (
          <p className="rounded-lg bg-lime-50 px-3 py-2 text-sm font-bold text-lime-950" key={warning}>
            {warning}
          </p>
        ))}
      </div>
    );
  }

  if (sectionKey === "course_filter") {
    return (
      <div className="grid gap-3">
        <p className="text-sm font-bold text-stone-700">
          Kept {section.candidate_count || 0} candidates after applying stage,
          career, study-mode, location, and disliked-subject filters.
        </p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(filterCounts).map(([key, count]: [string, any]) => (
            <span className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-black text-stone-700" key={key}>
              {compactLabel(key)}: {count as React.ReactNode}
            </span>
          ))}
        </div>
        {recommendations.slice(0, 4).flatMap((item) =>
          (item.filter_reasons || []).slice(0, 2).map((reason: string) => (
            <p className="rounded-lg bg-lime-50 px-3 py-2 text-sm font-bold text-lime-950" key={`${item.id}-${reason}`}>
              {item.programme?.program_name}: {reason}
            </p>
          )),
        )}
      </div>
    );
  }

  if (sectionKey === "scoring") {
    const breakdown = top?.score_breakdown || {};
    const llm = section.llm || {};
    return (
      <div className="grid gap-3">
        <p className="text-sm font-bold text-stone-700">
          Scored {section.scored_count || 0} programmes using the 100-point formula.
        </p>
        <p
          className={`rounded-lg px-3 py-2 text-sm font-bold ${
            llm.used_for_scoring
              ? "bg-emerald-50 text-emerald-800"
              : "bg-stone-100 text-stone-700"
          }`}
        >
          LLM weight: 10 points. {llm.message || (llm.used_for_scoring
            ? `${llm.provider || "LLM"} scored ${llm.scored_programme_count || 0} programmes.`
            : "OpenAI did not score this run.")}
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          {Object.entries(breakdown).map(([key, value]: [string, any]) => (
            <div className="rounded-lg border border-stone-200 bg-white p-3" key={key}>
              <p className="text-xs font-black uppercase text-stone-500">{compactLabel(key)}</p>
              <p className="mt-1 text-2xl font-black text-neutral-950">{value as React.ReactNode}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (sectionKey === "ranking") {
    return (
      <div className="grid gap-3">
        <p className="text-sm font-bold text-stone-700">
          Ranked {section.recommendation_count || recommendations.length} final recommendations.
        </p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(typeCounts).map(([key, count]: [string, any]) => (
            <span className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-black text-stone-700" key={key}>
              {recommendationLabels[key] || compactLabel(key)}: {count as React.ReactNode}
            </span>
          ))}
        </div>
        {recommendations.slice(0, 5).map((item) => (
          <p className="rounded-lg bg-white px-3 py-2 text-sm font-bold text-stone-700" key={item.id}>
            #{item.rank} {item.programme?.program_name} - {item.match_percentage}% match
          </p>
        ))}
      </div>
    );
  }

  const explanation = data?.ai_explanation || {};
  return (
    <div className="grid gap-3">
      <p className="text-sm font-bold leading-6 text-stone-700">
        {explanation.summary || "AI-style analysis is ready."}
      </p>
      {(explanation.next_steps || []).map((step) => (
        <p className="rounded-lg bg-white px-3 py-2 text-sm font-bold text-stone-700" key={step}>
          {step}
        </p>
      ))}
    </div>
  );
}

export default function EligibilityPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [recommendationType, setRecommendationType] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadError, setDownloadError] = useState("");
  const [downloading, setDownloading] = useState(false);

  const visibleRecommendations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return (data?.recommendations || []).filter((item) => {
      const programme = item.programme || {};
      const searchable = [
        programme.program_name,
        programme.hei_name,
        programme.state,
        programme.mode,
        programme.level,
        item.filter_status,
        item.recommendation_type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const statusMatches = status ? item.eligibility?.eligibility_status === status : true;
      const typeMatches = recommendationType
        ? item.recommendation_type === recommendationType
        : true;

      return statusMatches && typeMatches && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [data, query, recommendationType, status]);

  const summary = useMemo(() => {
    const counts = countBy(data?.recommendations || [], (item) => item.eligibility?.eligibility_status);
    return [
      `${counts.eligible || 0} eligible`,
      `${counts.likely_eligible || 0} likely`,
      `${counts.future_path || 0} future path`,
    ].join(" / ");
  }, [data]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAnalysis() {
      setLoading(true);
      setError("");

      try {
        let response = await fetch("/api/recommendations/analysis?limit=100", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (response.status === 401) {
          await fetch("/api/auth/refresh", { method: "POST" });
          response = await fetch("/api/recommendations/analysis?limit=100", {
            cache: "no-store",
            signal: controller.signal,
          });
        }

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.detail || payload.error || "Could not load analysis.");
        }

        setData(payload);
      } catch (loadError) {
        if (loadError.name !== "AbortError") {
          setError(loadError.message || "Could not load analysis.");
          setData(null);
        }
      } finally {
        setLoading(false);
      }
    }

    loadAnalysis();

    return () => controller.abort();
  }, [router]);

  async function downloadReport() {
    setDownloading(true);
    setDownloadError("");

    try {
      let response = await fetch("/api/recommendations/analysis/report/pdf", {
        cache: "no-store",
      });

      if (response.status === 401) {
        await fetch("/api/auth/refresh", { method: "POST" });
        response = await fetch("/api/recommendations/analysis/report/pdf", {
          cache: "no-store",
        });
      }

      if (!response.ok) {
        throw new Error(await parseError(response, "Could not download report."));
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "eazygrad-recommendation-report.pdf";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (downloadFailure) {
      setDownloadError(downloadFailure.message || "Could not download report.");
    } finally {
      setDownloading(false);
    }
  }

  function openRecommendation(item) {
    window.sessionStorage.setItem(
      SELECTED_PROGRAMME_STORAGE_KEY,
      JSON.stringify(recommendationToSelectedProgramme(item)),
    );
    router.push("/programmes/selected");
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#e2f7eb_0,#fffaf0_340px,#ffffff_780px)] text-neutral-950">
      <div className="mx-auto max-w-[1180px] px-4 py-6">
        <nav className="flex items-center justify-between gap-4">
          <Link className="inline-flex" href="/">
            <img
              alt="EazyGrad"
              className="h-auto w-[150px] sm:w-[168px]"
              height="87"
              src={EAZYGRAD_LOGO_URL}
              width="414"
            />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              className="rounded-full border border-stone-200 bg-white/80 px-4 py-2 text-sm font-black text-stone-700 shadow-sm transition hover:border-[#ddff5b] hover:bg-[#fbfff0] flex items-center gap-1.5"
              href="/"
            >
              <i className="fa-solid fa-magnifying-glass text-xs" />
              Search
            </Link>
            <AuthActions />
          </div>
        </nav>

        <section className="py-8">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl shadow-amber-950/10 sm:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-black uppercase text-amber-800">
                  Full candidate analysis
                </p>
                <h1 className="mt-2 text-3xl font-black leading-tight text-neutral-950 sm:text-5xl">
                  Profile to AI recommendation report.
                </h1>
                <p className="mt-3 text-sm font-bold text-stone-600">{summary}</p>
                {data?.cached ? (
                  <p className="mt-2 text-xs font-black uppercase text-emerald-700">
                    Cached for this profile
                  </p>
                ) : null}
              </div>
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_170px_190px] lg:w-[700px]">
                <input
                  className="min-h-12 rounded-xl border border-stone-200 bg-white px-4 text-sm font-bold text-neutral-950 outline-none transition placeholder:text-stone-400 focus:border-neutral-950 focus:ring-4 focus:ring-[#ddff5b]/40"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Filter by programme, university, state..."
                />
                <select
                  className="min-h-12 rounded-xl border border-stone-200 bg-white px-4 text-sm font-bold text-neutral-950 outline-none transition focus:border-neutral-950 focus:ring-4 focus:ring-[#ddff5b]/40"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                >
                  <option value="">All eligibility</option>
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <option value={key} key={key}>{label}</option>
                  ))}
                </select>
                <select
                  className="min-h-12 rounded-xl border border-stone-200 bg-white px-4 text-sm font-bold text-neutral-950 outline-none transition focus:border-neutral-950 focus:ring-4 focus:ring-[#ddff5b]/40"
                  value={recommendationType}
                  onChange={(event) => setRecommendationType(event.target.value)}
                >
                  <option value="">All types</option>
                  {Object.entries(recommendationLabels).map(([key, label]) => (
                    <option value={key} key={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm font-bold text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <AnalysisWaitingPanel />
        ) : null}

        {!loading && data ? (
          <div className="grid gap-5">
            <div className="grid gap-3">
              {PIPELINE_SECTIONS.map(([key, label, detail]) => {
                const section = data.sections?.[key] || {};
                const isComplete = section.status === "completed";
                return (
                  <details
                    className="rounded-xl border border-stone-200 bg-[#fbfff0] p-4 open:bg-[#f4ffd1]/30"
                    key={key}
                    open={key === "ranking"}
                  >
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-neutral-950">{label}</p>
                        <p className="mt-1 text-xs font-bold leading-5 text-stone-600">{detail}</p>
                      </div>
                      <span
                        className={`rounded-full border px-3 py-1.5 text-xs font-black ${
                          isComplete
                            ? "border-neutral-950 bg-neutral-950 text-[#ddff5b]"
                            : "border-stone-200 bg-white text-stone-500"
                        }`}
                      >
                        {section.status || "pending"}
                      </span>
                    </summary>
                    <div className="mt-4 border-t border-emerald-100 pt-4">
                      <SectionDetails
                        sectionKey={key}
                        data={data}
                        recommendations={data.recommendations || []}
                      />
                    </div>
                  </details>
                );
              })}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase text-amber-800">Ranked recommendations</p>
                <h2 className="mt-1 text-2xl font-black text-neutral-950">
                  {visibleRecommendations.length} programme matches
                </h2>
              </div>
            </div>

            {visibleRecommendations.length ? (
              <div className="grid gap-4">
                {visibleRecommendations.map((item) => (
                  <RecommendationCard
                    item={item}
                    key={`${item.programme?.id}-${item.rank}`}
                    onOpen={openRecommendation}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-stone-200 bg-white p-6 text-sm font-bold text-stone-600">
                No recommendations matched these filters.
              </div>
            )}
          </div>
        ) : null}

        {!loading && data ? (
          <div className="sticky bottom-0 mt-8 border-t border-stone-200 bg-white/95 py-4 backdrop-blur">
            <div className="mx-auto flex max-w-[1180px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-stone-600">
                  Download the PDF report with profile summary, section logic, ranking, and next steps.
                </p>
                {downloadError ? (
                  <p className="mt-1 text-sm font-bold text-red-700">{downloadError}</p>
                ) : null}
              </div>
              <button
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-neutral-950 px-5 text-sm font-black text-[#ddff5b] transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60 gap-2"
                type="button"
                disabled={downloading}
                onClick={downloadReport}
              >
                {downloading ? (
                  <i className="fa-solid fa-circle-notch fa-spin text-sm" />
                ) : (
                  <i className="fa-solid fa-file-pdf text-sm" />
                )}
                {downloading ? "Preparing PDF..." : "Download report PDF"}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
