"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const SELECTED_PROGRAMME_STORAGE_KEY = "eazygrad_selected_programme";

function Icon({ name, className = "h-4 w-4" }) {
  const iconClasses = {
    calendar: "fa-solid fa-calendar",
    check: "fa-solid fa-check",
    external: "fa-solid fa-arrow-up-right-from-square",
    graduation: "fa-solid fa-graduation-cap",
    search: "fa-solid fa-magnifying-glass",
    shield: "fa-solid fa-shield-halved",
    warning: "fa-solid fa-triangle-exclamation",
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
    calendar:
      "M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1.25A2.75 2.75 0 0 1 22 6.75v12.5A2.75 2.75 0 0 1 19.25 22H4.75A2.75 2.75 0 0 1 2 19.25V6.75A2.75 2.75 0 0 1 4.75 4H6V3a1 1 0 0 1 1-1Zm13 8H4v9.25c0 .41.34.75.75.75h14.5c.41 0 .75-.34.75-.75V10Z",
    check:
      "M9.55 17.4a1 1 0 0 1-1.42 0l-4-4a1 1 0 1 1 1.42-1.42l3.29 3.3 9.6-9.6a1 1 0 0 1 1.42 1.41L9.55 17.4Z",
    external:
      "M14 3a1 1 0 1 0 0 2h3.59l-8.3 8.3a1 1 0 0 0 1.42 1.4L19 6.42V10a1 1 0 1 0 2 0V4a1 1 0 0 0-1-1h-6ZM5.75 5A2.75 2.75 0 0 0 3 7.75v10.5A2.75 2.75 0 0 0 5.75 21h10.5A2.75 2.75 0 0 0 19 18.25V14a1 1 0 1 0-2 0v4.25c0 .41-.34.75-.75.75H5.75a.75.75 0 0 1-.75-.75V7.75c0-.41.34-.75.75-.75H10a1 1 0 1 0 0-2H5.75Z",
    graduation:
      "M12.45 2.1a1 1 0 0 0-.9 0l-9 4.2a1 1 0 0 0 0 1.8l9 4.2a1 1 0 0 0 .9 0L20 8.78V14a1 1 0 1 0 2 0V7.2a1 1 0 0 0-.58-.9l-8.97-4.2ZM6 11.16v3.34C6 16.99 8.69 19 12 19s6-2.01 6-4.5v-3.34l-4.7 2.2a3 3 0 0 1-2.6 0L6 11.16Z",
    search:
      "M10.5 3a7.5 7.5 0 0 0 0 15 7.46 7.46 0 0 0 4.6-1.57l3.23 3.24a1 1 0 0 0 1.42-1.42l-3.24-3.23A7.5 7.5 0 0 0 10.5 3Zm0 2a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11Z",
    shield:
      "M11.6 2.08a1 1 0 0 1 .8 0l7 3A1 1 0 0 1 20 6v5.25c0 4.72-2.84 8.1-7.66 10.65a1 1 0 0 1-.93 0C6.66 19.35 4 15.97 4 11.25V6a1 1 0 0 1 .6-.92l7-3Zm4.1 7.62a1 1 0 0 0-1.4-1.4L11 11.58 9.7 10.3a1 1 0 0 0-1.4 1.4l2 2a1 1 0 0 0 1.4 0l4-4Z",
    warning:
      "M10.29 3.86a2 2 0 0 1 3.42 0l8 13.5A2 2 0 0 1 20 20.4H4a2 2 0 0 1-1.71-3.03l8-13.5ZM12 8a1 1 0 0 0-1 1v4a1 1 0 1 0 2 0V9a1 1 0 0 0-1-1Zm0 8a1.15 1.15 0 1 0 0 2.3 1.15 1.15 0 0 0 0-2.3Z",
  };

  return (
    <svg aria-hidden="true" className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d={paths[name]} />
    </svg>
  );
}

function googleSearchUrl(query) {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function estimateAdmissionTimeline(programme) {
  const mode = `${programme?.mode || ""}`.toLowerCase();

  if (mode.includes("online") || mode.includes("distance") || mode.includes("odl")) {
    return {
      window: "Likely July-August 2026, with another possible January-February 2027 intake",
      note:
        "Many online and distance programmes run rolling or twice-yearly admission cycles. Confirm the exact date from the university admission page.",
    };
  }

  return {
    window: "Likely July-September 2026 for the next full academic intake",
    note:
      "Regular programmes usually follow fixed academic-year admissions. Entrance tests or merit lists may shift the final deadline.",
  };
}

function buildAdmissionSteps(programme, profile) {
  const steps = [
    "Verify recognition, eligibility, fees, and admission deadline on the official university page.",
    "Keep identity proof, marksheets, photo, and category or work-experience documents ready if applicable.",
    "Compare total fee, exam requirement, refund policy, and learning format before paying.",
  ];

  if (Number(profile?.profile_completion_percentage || 0) < 100) {
    steps.unshift("Complete your EazyGrad profile so counselling and eligibility checks are more accurate.");
  }

  if (`${programme?.mode || ""}`.toLowerCase().includes("online")) {
    steps.push("Check LMS access, live-class schedule, exam mode, and whether recordings are available.");
  }

  return steps;
}

export default function SelectedProgrammePage() {
  const router = useRouter();
  const [programme, setProgramme] = useState(null);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadPage() {
      try {
        let sessionResponse = await fetch("/api/auth/me", { cache: "no-store" });

        if (sessionResponse.status === 401) {
          await fetch("/api/auth/refresh", { method: "POST" });
          sessionResponse = await fetch("/api/auth/me", { cache: "no-store" });
        }

        if (!sessionResponse.ok) {
          router.replace("/");
          return;
        }

        const storedProgramme = window.sessionStorage.getItem(SELECTED_PROGRAMME_STORAGE_KEY);

        if (!storedProgramme) {
          setError("Select a programme from search first.");
          return;
        }

        const parsedProgramme = JSON.parse(storedProgramme);
        const profileResponse = await fetch("/api/candidate/profile", { cache: "no-store" });
        const profilePayload = profileResponse.ok ? await profileResponse.json() : null;

        if (isActive) {
          setProgramme(parsedProgramme);
          setProfile(profilePayload);
        }
      } catch {
        if (isActive) {
          setError("Could not load programme details.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadPage();

    return () => {
      isActive = false;
    };
  }, [router]);

  const timeline = useMemo(() => estimateAdmissionTimeline(programme), [programme]);
  const admissionSteps = useMemo(() => buildAdmissionSteps(programme, profile), [programme, profile]);
  const profileCompletion = Number(profile?.profile_completion_percentage || 0);
  const profileIncomplete = profileCompletion < 100;
  const searchQueries = programme
    ? [
        `${programme.program_name} ${programme.provider} admission 2026`,
        `${programme.provider} ${programme.program_name} eligibility fees`,
        `${programme.provider} online distance programme recognition`,
      ]
    : [];

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#e2f7eb_0,#fffaf0_330px,#ffffff_900px)] text-neutral-950">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <nav className="flex items-center justify-between gap-4">
          <Link className="text-sm font-black text-neutral-950 underline-offset-4 hover:underline flex items-center gap-1.5" href="/">
            <i className="fa-solid fa-chevron-left text-xs" />
            Back to search
          </Link>
          {profileIncomplete ? (
            <Link
              className="rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-black text-[#ddff5b] flex items-center gap-1.5 hover:bg-neutral-800 transition"
              href="/onboarding"
            >
              <i className="fa-solid fa-user-pen text-xs" />
              Complete profile
            </Link>
          ) : null}
        </nav>

        {isLoading ? (
          <section className="mt-8 rounded-lg border border-stone-200 bg-white p-8 text-sm font-black text-stone-600">
            Loading programme details...
          </section>
        ) : null}

        {error ? (
          <section className="mt-8 rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-black text-red-700">
            {error}
          </section>
        ) : null}

        {!isLoading && programme ? (
          <div className="mt-8 grid gap-6">
            <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-xl shadow-amber-950/5 sm:p-7">
              <p className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-amber-700">
                <Icon className="h-4 w-4" name="graduation" />
                Programme details
              </p>
              <h1 className="mt-3 text-4xl font-black leading-tight text-neutral-950 sm:text-5xl">
                {programme.program_name}
              </h1>
              <p className="mt-3 text-lg font-bold text-stone-700">{programme.provider}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {[programme.degree_type, programme.mode, programme.duration, programme.fee_range]
                  .filter(Boolean)
                  .map((value) => (
                    <span
                      className="rounded-full border border-stone-200 bg-[#fffaf0] px-4 py-2 text-sm font-black text-stone-700"
                      key={value}
                    >
                      {value}
                    </span>
                  ))}
              </div>
            </section>

            {profileIncomplete ? (
              <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-950">
                <p className="inline-flex items-center gap-2 text-sm font-black uppercase">
                  <Icon className="h-4 w-4" name="warning" />
                  Profile incomplete
                </p>
                <p className="mt-2 text-sm font-semibold leading-6">
                  Your profile is {profileCompletion}% complete. Complete it to get a sharper
                  eligibility and admission-readiness check.
                </p>
              </section>
            ) : (
              <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
                <p className="inline-flex items-center gap-2 text-sm font-black uppercase">
                  <Icon className="h-4 w-4" name="check" />
                  Profile ready
                </p>
                <p className="mt-2 text-sm font-semibold leading-6">
                  Your profile is complete. This programme can now be reviewed against your
                  academic background, documents, mode preference, and career goals.
                </p>
              </section>
            )}

            <section className="grid gap-4 lg:grid-cols-3">
              <article className="rounded-lg border border-stone-200 bg-white p-5">
                <p className="inline-flex items-center gap-2 text-sm font-black uppercase text-amber-700">
                  <Icon className="h-4 w-4" name="shield" />
                  Match reasoning
                </p>
                <p className="mt-3 text-sm font-semibold leading-6 text-stone-700">
                  {programme.reason}
                </p>
                {programme.watch_out ? (
                  <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-950">
                    {programme.watch_out}
                  </p>
                ) : null}
              </article>

              <article className="rounded-lg border border-stone-200 bg-white p-5">
                <p className="inline-flex items-center gap-2 text-sm font-black uppercase text-amber-700">
                  <Icon className="h-4 w-4" name="calendar" />
                  Admission timing
                </p>
                <p className="mt-3 text-lg font-black leading-7 text-neutral-950">{timeline.window}</p>
                <p className="mt-3 text-sm font-semibold leading-6 text-stone-700">{timeline.note}</p>
              </article>

              <article className="rounded-lg border border-stone-200 bg-white p-5">
                <p className="inline-flex items-center gap-2 text-sm font-black uppercase text-amber-700">
                  <Icon className="h-4 w-4" name="search" />
                  Google research
                </p>
                <div className="mt-3 grid gap-2">
                  {searchQueries.map((searchQuery) => (
                    <a
                      className="flex items-center justify-between gap-3 rounded-lg border border-stone-200 bg-[#fffaf0] px-3 py-2 text-sm font-black text-neutral-950 transition hover:border-neutral-950"
                      href={googleSearchUrl(searchQuery)}
                      key={searchQuery}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {searchQuery}
                      <Icon className="h-4 w-4 shrink-0" name="external" />
                    </a>
                  ))}
                </div>
              </article>
            </section>

            <section className="rounded-lg border border-stone-200 bg-white p-5">
              <p className="text-sm font-black uppercase text-amber-700">How to take admission</p>
              <div className="mt-4 grid gap-3">
                {admissionSteps.map((step, index) => (
                  <p
                    className="rounded-lg border border-stone-200 bg-[#fffaf0] px-4 py-3 text-sm font-semibold leading-6 text-stone-700"
                    key={step}
                  >
                    <span className="mr-2 font-black text-neutral-950">#{index + 1}</span>
                    {step}
                  </p>
                ))}
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}
