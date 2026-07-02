"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const EAZYGRAD_LOGO_URL =
  "https://framerusercontent.com/images/czlTrRfNKMvHap0TW60cYEGcglI.png?width=414&height=87";

const COURSE_LEVELS = [
  "Certificate",
  "Diploma",
  "Undergraduate",
  "Postgraduate",
  "Professional",
];

const initialCourse = {
  title: "",
  level: "Postgraduate",
  mode: "Online",
  duration: "",
  subjects: "",
  seats: "",
  fees: "",
  syllabus: "",
  idealStudent: "",
};

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="min-h-12 rounded-lg border border-stone-200 bg-white px-3 text-sm font-semibold text-neutral-950 outline-none transition placeholder:text-stone-400 focus:border-neutral-950 focus:ring-4 focus:ring-[#ddff5b]/40"
    />
  );
}

function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="min-h-12 rounded-lg border border-stone-200 bg-white px-3 text-sm font-semibold text-neutral-950 outline-none transition focus:border-neutral-950 focus:ring-4 focus:ring-[#ddff5b]/40"
    />
  );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="min-h-28 resize-y rounded-lg border border-stone-200 bg-white px-3 py-3 text-sm font-semibold leading-6 text-neutral-950 outline-none transition placeholder:text-stone-400 focus:border-neutral-950 focus:ring-4 focus:ring-[#ddff5b]/40"
    />
  );
}

function Field({ label, children }: { label: React.ReactNode, children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-black text-neutral-950">
      {label}
      {children}
    </label>
  );
}

function StatusPill({ children, tone = "neutral" }: { children: React.ReactNode, tone?: "neutral" | "good" | "warn" | "dark" }) {
  const classes = {
    neutral: "border-stone-200 bg-white text-stone-700",
    good: "border-emerald-200 bg-emerald-50 text-emerald-800",
    warn: "border-amber-200 bg-amber-50 text-amber-950",
    dark: "border-neutral-950 bg-neutral-950 text-[#ddff5b]",
  };

  return (
    <span className={`rounded-full border px-3 py-1.5 text-xs font-black ${classes[tone]}`}>
      {children}
    </span>
  );
}

function CourseCard({ course }: { course: any }) {
  return (
    <Link
      className="block rounded-lg border border-stone-200 bg-white p-4 shadow-sm shadow-amber-950/5 transition hover:border-[#ddff5b] hover:shadow-xl hover:shadow-amber-950/10"
      href={`/vendors/courses/${course.id}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="break-words text-xl font-black text-neutral-950">{course.title}</h2>
          <p className="mt-2 text-sm font-bold text-stone-600">
            {[course.level, course.mode, course.duration].filter(Boolean).join(" / ")}
          </p>
        </div>
        <StatusPill tone="dark">{course.seats ? `${course.seats} seats` : "Course"}</StatusPill>
      </div>

      <div className="mt-4 grid gap-3">
        <p className="text-sm font-bold leading-6 text-stone-700">{course.subjects}</p>
        <div className="rounded-lg border border-stone-200 bg-[#fffaf0] p-3">
          <p className="text-xs font-black uppercase text-stone-500">Syllabus</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-stone-700">
            {course.syllabus}
          </p>
        </div>
        {course.ideal_student ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-xs font-black uppercase text-emerald-800">Best fit student</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-emerald-900">
              {course.ideal_student}
            </p>
          </div>
        ) : null}
      </div>
    </Link>
  );
}

function AddCourseModal({
  course,
  error,
  isSaving,
  onClose,
  onSave,
  onUpdate,
}: {
  course: any;
  error: string;
  isSaving: boolean;
  onClose: () => void;
  onSave: () => void;
  onUpdate: (key: string, value: string) => void;
}) {
  const canSave = course.title && course.subjects && course.syllabus;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-neutral-950/45 px-3 py-6">
      <section className="max-h-[92vh] w-full max-w-3xl overflow-auto rounded-lg border border-stone-200 bg-white p-4 shadow-2xl shadow-neutral-950/20 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase text-amber-800">Add course</p>
            <h2 className="mt-1 text-2xl font-black text-neutral-950">
              Add one more course
            </h2>
          </div>
          <button
            className="rounded-lg border border-stone-200 px-3 py-2 text-sm font-black text-neutral-950 transition hover:border-red-300 hover:bg-red-50"
            type="button"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Course name">
            <TextInput
              value={course.title}
              onChange={(event) => onUpdate("title", event.target.value)}
              placeholder="MBA in Business Analytics"
            />
          </Field>
          <Field label="Level">
            <SelectInput
              value={course.level}
              onChange={(event) => onUpdate("level", event.target.value)}
            >
              {COURSE_LEVELS.map((level) => (
                <option key={level}>{level}</option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Study mode">
            <SelectInput
              value={course.mode}
              onChange={(event) => onUpdate("mode", event.target.value)}
            >
              <option>On campus</option>
              <option>Online</option>
              <option>Hybrid</option>
              <option>Distance learning</option>
            </SelectInput>
          </Field>
          <Field label="Duration">
            <TextInput
              value={course.duration}
              onChange={(event) => onUpdate("duration", event.target.value)}
              placeholder="2 years"
            />
          </Field>
          <Field label="Seats available">
            <TextInput
              value={course.seats}
              onChange={(event) => onUpdate("seats", event.target.value)}
              placeholder="120"
            />
          </Field>
          <Field label="Fees">
            <TextInput
              value={course.fees}
              onChange={(event) => onUpdate("fees", event.target.value)}
              placeholder="INR 1.8L per year"
            />
          </Field>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Main subjects">
            <TextArea
              value={course.subjects}
              onChange={(event) => onUpdate("subjects", event.target.value)}
              placeholder="Marketing, finance, analytics, business communication"
            />
          </Field>
          <Field label="Syllabus outline">
            <TextArea
              value={course.syllabus}
              onChange={(event) => onUpdate("syllabus", event.target.value)}
              placeholder="Semester wise topics, practical work, projects, and internships."
            />
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Best fit student profile">
            <TextArea
              value={course.idealStudent}
              onChange={(event) => onUpdate("idealStudent", event.target.value)}
              placeholder="Students with relevant subjects, interests, or career goals."
            />
          </Field>
        </div>

        {error ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex justify-end gap-2">
          <button
            className="rounded-lg border border-stone-200 px-5 py-3 text-sm font-black text-neutral-950 transition hover:border-[#ddff5b]"
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="rounded-lg bg-neutral-950 px-5 py-3 text-sm font-black text-[#ddff5b] transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-45 flex items-center gap-1.5"
            type="button"
            disabled={!canSave || isSaving}
            onClick={onSave}
          >
            {isSaving ? (
              <i className="fa-solid fa-circle-notch fa-spin text-xs" />
            ) : (
              <i className="fa-solid fa-check text-xs" />
            )}
            {isSaving ? "Saving..." : "Save course"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default function VendorDashboardPage() {
  const router = useRouter();
  const [vendor, setVendor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [newCourse, setNewCourse] = useState(initialCourse);
  const [courseError, setCourseError] = useState("");
  const [isSavingCourse, setIsSavingCourse] = useState(false);

  const courses = vendor?.courses || [];
  const location = useMemo(
    () => [vendor?.city, vendor?.state].filter(Boolean).join(", "),
    [vendor],
  );

  useEffect(() => {
    let isActive = true;

    async function loadDashboard() {
      try {
        const response = await fetch("/api/vendors/profile", {
          cache: "no-store",
        });
        const payload = await response.json();

        if (response.status === 401 || response.status === 404) {
          router.replace("/vendors");
          return;
        }

        if (!response.ok) {
          throw new Error(payload.detail || "Could not load vendor dashboard.");
        }

        if (isActive) {
          setVendor(payload.vendor);
        }
      } catch (loadError) {
        if (isActive) {
          setError(loadError.message || "Could not load vendor dashboard.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isActive = false;
    };
  }, [router]);

  async function logout() {
    setIsLoggingOut(true);

    try {
      await fetch("/api/vendors/logout", { method: "POST" });
    } finally {
      router.replace("/login");
    }
  }

  function updateNewCourse(key, value) {
    setNewCourse((current) => ({ ...current, [key]: value }));
  }

  async function saveCourse() {
    setIsSavingCourse(true);
    setCourseError("");

    try {
      const response = await fetch("/api/vendors/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ course: newCourse }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.detail || "Could not save course.");
      }

      setVendor(payload.vendor);
      setNewCourse(initialCourse);
      setIsCourseModalOpen(false);
    } catch (saveError) {
      setCourseError(saveError.message || "Could not save course.");
    } finally {
      setIsSavingCourse(false);
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#e2f7eb_0,#fffaf0_340px,#ffffff_860px)] text-neutral-950">
      <div className="mx-auto max-w-[1180px] px-4 py-6">
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
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-black text-neutral-950 shadow-sm transition hover:border-[#ddff5b] hover:bg-[#fbfff0] flex items-center gap-1.5"
              type="button"
              onClick={() => setIsCourseModalOpen(true)}
            >
              <i className="fa-solid fa-plus text-xs" />
              Add more course
            </button>
            <button
              className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-black text-red-600 shadow-sm transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 flex items-center gap-1.5"
              type="button"
              disabled={isLoggingOut}
              onClick={logout}
            >
              <i className="fa-solid fa-arrow-right-from-bracket text-xs text-red-500" />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </nav>

        {isLoading ? (
          <section className="mt-8 grid gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                className="h-28 overflow-hidden rounded-lg border border-stone-200 bg-white"
                key={index}
              >
                <div className="h-full animate-pulse bg-gradient-to-r from-white via-[#ddff5b]/20 to-white" />
              </div>
            ))}
          </section>
        ) : null}

        {error ? (
          <section className="mt-8 rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-black text-red-700">
            {error}
          </section>
        ) : null}

        {!isLoading && vendor ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
            <aside className="self-start rounded-lg border border-stone-200 bg-white p-5 shadow-xl shadow-amber-950/5">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-neutral-950 text-2xl font-black text-[#ddff5b]">
                  {vendor.image_url ? (
                    <img alt="" className="h-full w-full object-cover" src={vendor.image_url} />
                  ) : (
                    vendor.name.slice(0, 1).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <h1 className="break-words text-2xl font-black leading-tight text-neutral-950">
                    {vendor.name}
                  </h1>
                  <p className="mt-1 text-sm font-bold text-stone-600">
                    {vendor.provider_type}
                  </p>
                </div>
              </div>

              <p className="mt-5 text-sm font-semibold leading-6 text-stone-700">
                {vendor.description}
              </p>

              <div className="mt-5 grid gap-2">
                <StatusPill tone={vendor.is_email_verified ? "good" : "warn"}>
                  {vendor.is_email_verified ? (
                    <span className="flex items-center gap-1.5">
                      <i className="fa-solid fa-circle-check text-emerald-600" />
                      Email verified
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <i className="fa-solid fa-circle-exclamation text-amber-600" />
                      Email pending
                    </span>
                  )}
                </StatusPill>
                <p className="break-words text-sm font-bold text-stone-600 flex items-center gap-1.5">
                  <i className="fa-solid fa-envelope text-stone-400 w-4 text-center" />
                  {vendor.official_email}
                </p>
                <p className="text-sm font-bold text-stone-600 flex items-center gap-1.5">
                  <i className="fa-solid fa-location-dot text-stone-400 w-4 text-center" />
                  {location || "Location not added"}
                </p>
                {vendor.website ? (
                  <a
                    className="break-words text-sm font-black text-neutral-950 underline decoration-[#ddff5b] decoration-2 underline-offset-4 flex items-center gap-1.5"
                    href={vendor.website}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <i className="fa-solid fa-globe text-stone-400 w-4 text-center" />
                    {vendor.website}
                  </a>
                ) : null}
              </div>
            </aside>

            <section className="grid gap-5">
              <div className="flex flex-col gap-3 rounded-lg border border-stone-200 bg-white p-5 shadow-xl shadow-amber-950/5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-black uppercase text-amber-800">
                    Vendor dashboard
                  </p>
                  <h2 className="mt-1 text-3xl font-black text-neutral-950">
                    {courses.length} course{courses.length === 1 ? "" : "s"} listed
                  </h2>
                </div>
                <button
                  className="rounded-lg bg-neutral-950 px-5 py-3 text-sm font-black text-[#ddff5b] transition hover:bg-stone-800 flex items-center gap-1.5"
                  type="button"
                  onClick={() => setIsCourseModalOpen(true)}
                >
                  <i className="fa-solid fa-plus text-xs" />
                  Add more course
                </button>
              </div>

              {courses.length ? (
                <div className="grid gap-4">
                  {courses.map((course) => (
                    <CourseCard course={course} key={course.id} />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-stone-200 bg-white p-6 text-sm font-bold text-stone-600">
                  No courses added yet.
                </div>
              )}
            </section>
          </div>
        ) : null}

        {isCourseModalOpen ? (
          <AddCourseModal
            course={newCourse}
            error={courseError}
            isSaving={isSavingCourse}
            onClose={() => {
              setIsCourseModalOpen(false);
              setCourseError("");
            }}
            onSave={saveCourse}
            onUpdate={updateNewCourse}
          />
        ) : null}
      </div>
    </main>
  );
}
