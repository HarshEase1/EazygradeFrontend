"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const EAZYGRAD_LOGO_URL =
  "https://framerusercontent.com/images/czlTrRfNKMvHap0TW60cYEGcglI.png?width=414&height=87";

function fieldValue(course: any, key: string) {
  if (key === "idealStudent") return course?.ideal_student || "";
  return course?.[key] || "";
}

function CandidateCard({ candidate, index }: { candidate: any, index: number }) {
  return (
    <article className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm shadow-amber-950/5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase text-amber-800">#{index + 1}</p>
          <h3 className="mt-1 text-xl font-black text-neutral-950">{candidate.name}</h3>
          <p className="mt-1 text-sm font-bold text-stone-600">
            {[candidate.city, candidate.state].filter(Boolean).join(", ") || "Location not added"}
          </p>
        </div>
        <div className="rounded-lg bg-neutral-950 px-4 py-3 text-center text-sm font-black text-[#ddff5b]">
          {candidate.match_percentage}% match
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full border border-stone-200 bg-[#fbfff0] px-3 py-1.5 text-xs font-black text-stone-700">
          {candidate.current_education_status}
        </span>
        <span className="rounded-full border border-stone-200 bg-[#fbfff0] px-3 py-1.5 text-xs font-black text-stone-700">
          {candidate.current_stream}
        </span>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-800">
          {candidate.recommendation_type.replaceAll("_", " ")}
        </span>
      </div>

      <div className="mt-4 grid gap-2">
        {candidate.reasons.slice(0, 4).map((reason) => (
          <p className="rounded-lg border border-stone-200 bg-[#fbfff0] px-3 py-2 text-sm font-semibold text-stone-700" key={reason}>
            {reason}
          </p>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <a
          className="rounded-lg bg-[#ddff5b] px-4 py-2 text-sm font-black text-neutral-950 transition hover:bg-[#ccee45] flex items-center gap-1.5"
          href={`mailto:${candidate.email}`}
        >
          <i className="fa-solid fa-envelope text-xs" />
          Contact candidate
        </a>
        <span className="rounded-lg border border-stone-200 px-4 py-2 text-sm font-black text-stone-600">
          {candidate.email}
        </span>
      </div>
    </article>
  );
}

export default function VendorCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editCourse, setEditCourse] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadCourseMatches() {
      try {
        const response = await fetch(`/api/vendors/courses/${params.courseId}/matches`, {
          cache: "no-store",
        });
        const payload = await response.json();

        if (response.status === 401 || response.status === 404) {
          router.replace(response.status === 401 ? "/vendors" : "/vendors/dashboard");
          return;
        }

        if (!response.ok) {
          throw new Error(payload.detail || "Could not load course matches.");
        }

        if (isActive) {
          setCourse(payload.course);
          setEditCourse(payload.course);
          setMatches(payload.matches || []);
          setAnalysis(payload.analysis || null);
        }
      } catch (loadError) {
        if (isActive) {
          setError(loadError.message || "Could not load course matches.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadCourseMatches();

    return () => {
      isActive = false;
    };
  }, [params.courseId, router]);

  function updateEditField(key, value) {
    setEditCourse((current) => ({ ...current, [key]: value }));
  }

  async function saveCourse() {
    setIsSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/vendors/courses/${params.courseId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course: {
            ...editCourse,
            ideal_student: fieldValue(editCourse, "idealStudent"),
          },
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.detail || "Could not update course.");
      }

      setCourse(payload.course);
      setEditCourse(payload.course);
      setIsEditing(false);
    } catch (saveError) {
      setError(saveError.message || "Could not update course.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteCourse() {
    setIsDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/vendors/courses/${params.courseId}`, {
        method: "DELETE",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.detail || "Could not delete course.");
      }

      router.replace("/vendors/dashboard");
    } catch (deleteError) {
      setError(deleteError.message || "Could not delete course.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#e2f7eb_0,#fffaf0_340px,#ffffff_860px)] text-neutral-950">
      <div className="mx-auto max-w-[1120px] px-4 py-6">
        <nav className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link className="inline-flex" href="/vendors/dashboard">
            <img
              alt="EazyGrad"
              className="h-auto w-[150px] sm:w-[168px]"
              height="87"
              src={EAZYGRAD_LOGO_URL}
              width="414"
            />
          </Link>
          <Link
            className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-black text-neutral-950 shadow-sm transition hover:border-[#ddff5b] hover:bg-[#fbfff0] flex items-center gap-1.5"
            href="/vendors/dashboard"
          >
            <i className="fa-solid fa-chart-line text-xs" />
            Dashboard
          </Link>
        </nav>

        {isLoading ? (
          <section className="mt-8 h-64 overflow-hidden rounded-lg border border-stone-200 bg-white">
            <div className="h-full animate-pulse bg-gradient-to-r from-white via-[#ddff5b]/20 to-white" />
          </section>
        ) : null}

        {error ? (
          <section className="mt-8 rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-black text-red-700">
            {error}
          </section>
        ) : null}

        {!isLoading && course ? (
          <div className="mt-8 grid gap-6">
            <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-xl shadow-amber-950/5 sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-black uppercase text-amber-800">Course matching</p>
                  <h1 className="mt-2 text-4xl font-black leading-tight text-neutral-950">
                    {course.title}
                  </h1>
                  <p className="mt-3 text-sm font-bold text-stone-600">
                    {[course.level, course.mode, course.duration].filter(Boolean).join(" / ")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="rounded-lg border border-stone-200 px-4 py-2 text-sm font-black text-neutral-950 transition hover:border-[#ddff5b] hover:bg-[#fbfff0] flex items-center gap-1.5"
                    type="button"
                    onClick={() => setIsEditing((current) => !current)}
                  >
                    <i className={`fa-solid ${isEditing ? "fa-xmark" : "fa-pen-to-square"} text-xs`} />
                    {isEditing ? "Close edit" : "Edit"}
                  </button>
                  <button
                    className="rounded-lg border border-red-200 px-4 py-2 text-sm font-black text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 flex items-center gap-1.5"
                    type="button"
                    disabled={isDeleting}
                    onClick={deleteCourse}
                  >
                    <i className="fa-solid fa-trash-can text-xs text-red-500" />
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </section>

            {isEditing ? (
              <section className="grid gap-4 rounded-lg border border-stone-200 bg-white p-5 md:grid-cols-2">
                {["title", "level", "mode", "duration", "subjects", "syllabus", "fees", "seats"].map((field) => (
                  <label className="grid gap-2 text-sm font-black text-neutral-950" key={field}>
                    {field.replaceAll("_", " ")}
                    <textarea
                      className="min-h-12 rounded-lg border border-stone-200 bg-white px-3 py-3 text-sm font-semibold text-neutral-950 outline-none focus:border-neutral-950 focus:ring-4 focus:ring-[#ddff5b]/40"
                      value={fieldValue(editCourse, field)}
                      onChange={(event) => updateEditField(field, event.target.value)}
                    />
                  </label>
                ))}
                <label className="grid gap-2 text-sm font-black text-neutral-950 md:col-span-2">
                  best fit student
                  <textarea
                    className="min-h-24 rounded-lg border border-stone-200 bg-white px-3 py-3 text-sm font-semibold text-neutral-950 outline-none focus:border-neutral-950 focus:ring-4 focus:ring-[#ddff5b]/40"
                    value={fieldValue(editCourse, "idealStudent")}
                    onChange={(event) => updateEditField("idealStudent", event.target.value)}
                  />
                </label>
                <div className="md:col-span-2">
                  <button
                    className="rounded-lg bg-neutral-950 px-5 py-3 text-sm font-black text-[#ddff5b] transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60 flex items-center gap-1.5"
                    type="button"
                    disabled={isSaving}
                    onClick={saveCourse}
                  >
                    {isSaving ? (
                      <i className="fa-solid fa-circle-notch fa-spin text-xs" />
                    ) : (
                      <i className="fa-solid fa-check text-xs" />
                    )}
                    {isSaving ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </section>
            ) : null}

            <section className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-lg border border-stone-200 bg-white p-5">
                <p className="text-xs font-black uppercase text-stone-500">Subjects</p>
                <p className="mt-3 text-sm font-semibold leading-7 text-stone-700">
                  {course.subjects}
                </p>
              </div>
              <div className="rounded-lg border border-stone-200 bg-white p-5">
                <p className="text-xs font-black uppercase text-stone-500">Syllabus</p>
                <p className="mt-3 text-sm font-semibold leading-7 text-stone-700">
                  {course.syllabus}
                </p>
              </div>
            </section>

            <section className="rounded-lg border border-stone-200 bg-white p-5">
              <p className="text-xs font-black uppercase text-amber-800">DeepSeek analysis</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-stone-700">
                {analysis?.summary || analysis?.message || "Candidate ranking is ready."}
              </p>
              {analysis?.error ? (
                <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold leading-5 text-red-700">
                  {analysis.error}
                </p>
              ) : null}
              {analysis?.contact_priority?.length ? (
                <div className="mt-4 grid gap-2">
                  {analysis.contact_priority.map((item) => (
                    <p
                      className="rounded-lg border border-lime-200 bg-lime-50 px-3 py-2 text-sm font-bold text-lime-950"
                      key={item}
                    >
                      {item}
                    </p>
                  ))}
                </div>
              ) : null}
              {analysis?.notes?.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {analysis.notes.map((note) => (
                    <span
                      className="rounded-full border border-stone-200 bg-[#fffaf0] px-3 py-1.5 text-xs font-black text-stone-700"
                      key={note}
                    >
                      {note}
                    </span>
                  ))}
                </div>
              ) : null}
            </section>

            <section className="grid gap-4">
              <div>
                <p className="text-xs font-black uppercase text-amber-800">Top candidates</p>
                <h2 className="mt-1 text-3xl font-black text-neutral-950">
                  {matches.length} ranked candidate{matches.length === 1 ? "" : "s"}
                </h2>
              </div>
              {matches.length ? (
                matches.map((candidate, index) => (
                  <CandidateCard candidate={candidate} index={index} key={candidate.id} />
                ))
              ) : (
                <div className="rounded-lg border border-stone-200 bg-white p-6 text-sm font-bold text-stone-600">
                  No strong candidate matches yet.
                </div>
              )}
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}
