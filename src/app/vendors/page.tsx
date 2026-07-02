"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const EAZYGRAD_LOGO_URL =
  "https://framerusercontent.com/images/czlTrRfNKMvHap0TW60cYEGcglI.png?width=414&height=87";

const PUBLIC_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.in",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "icloud.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "rediffmail.com",
  "zoho.com",
  "mail.com",
]);

const PROVIDER_TYPES = [
  "University",
  "College",
  "Institute",
  "Online course provider",
  "Training academy",
];

const COURSE_LEVELS = [
  "Certificate",
  "Diploma",
  "Undergraduate",
  "Postgraduate",
  "Professional",
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const initialProfile = {
  name: "",
  providerType: "University",
  website: "",
  city: "",
  state: "",
  contactName: "",
  contactPhone: "",
  description: "",
  imageUrl: "",
};

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

function profileFromVendor(vendor: any) {
  return {
    name: vendor?.name || "",
    providerType: vendor?.provider_type || "University",
    website: vendor?.website || "",
    city: vendor?.city || "",
    state: vendor?.state || "",
    contactName: vendor?.contact_name || "",
    contactPhone: vendor?.contact_phone || "",
    description: vendor?.description || "",
    imageUrl: vendor?.image_url || "",
  };
}

function courseFromVendorCourse(course: any) {
  return {
    id: course.id || Date.now(),
    title: course.title || "",
    level: course.level || "Postgraduate",
    mode: course.mode || "Online",
    duration: course.duration || "",
    subjects: course.subjects || "",
    seats: course.seats || "",
    fees: course.fees || "",
    syllabus: course.syllabus || "",
    idealStudent: course.ideal_student || "",
  };
}

function getEmailDomain(email: string) {
  return email.trim().split("@").pop()?.toLowerCase() || "";
}

function isWorkEmail(email: string) {
  const trimmed = email.trim().toLowerCase();
  const domain = getEmailDomain(trimmed);

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) && !PUBLIC_EMAIL_DOMAINS.has(domain);
}

function completionText(isVerified: boolean, profile: any, courses: any[]) {
  const score = [
    isVerified,
    profile.name && profile.description && profile.city && profile.state,
    courses.length > 0,
  ].filter(Boolean).length;

  if (score === 3) return "Ready for student matching";
  if (score === 2) return "Almost ready";
  if (score === 1) return "Started";
  return "Not started";
}

function Field({ label, children }: { label: React.ReactNode, children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-black text-neutral-950">
      {label}
      {children}
    </label>
  );
}

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
      className="min-h-32 resize-y rounded-lg border border-stone-200 bg-white px-3 py-3 text-sm font-semibold leading-6 text-neutral-950 outline-none transition placeholder:text-stone-400 focus:border-neutral-950 focus:ring-4 focus:ring-[#ddff5b]/40"
    />
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

function StepButton({ active, complete, children, onClick }: { active: boolean, complete: boolean, children: React.ReactNode, onClick: () => void }) {
  return (
    <button
      className={`rounded-lg border px-4 py-3 text-left transition ${
        active
          ? "border-neutral-950 bg-neutral-950 text-white shadow-lg shadow-amber-950/10"
          : complete
            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
            : "border-stone-200 bg-white text-stone-700 hover:border-[#ddff5b]"
      }`}
      type="button"
      onClick={onClick}
    >
      <span className="block text-xs font-black uppercase">
        {complete ? "Complete" : active ? "Open" : "Next"}
      </span>
      <strong className="mt-1 block text-sm font-black">{children}</strong>
    </button>
  );
}

function AuthPanel({ email, setEmail, isVerified, setIsVerified, onExistingVendor }: { email: string, setEmail: (email: string) => void, isVerified: boolean, setIsVerified: (isVerified: boolean) => void, onExistingVendor?: () => void }) {
  const [otpToken, setOtpToken] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const canSendOtp = isWorkEmail(email);

  async function sendOtp() {
    if (!canSendOtp) {
      setMessage("Please use your official institute email address.");
      return;
    }

    setIsSending(true);
    setMessage("");

    try {
      const response = await fetch("/api/vendors/otp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Could not send code.");
      }

      if (data.demo_login && data.has_profile) {
        setIsVerified(true);
        setMessage("Demo vendor logged in. Opening your dashboard.");
        onExistingVendor?.();
        return;
      }

      setOtpToken(data.otp_token);
      setEnteredOtp("");
      setIsVerified(false);
      setMessage(data.detail || "Code sent to your official email.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSending(false);
    }
  }

  async function verifyOtp() {
    setIsVerifying(true);
    setMessage("");

    try {
      const response = await fetch("/api/vendors/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp: enteredOtp,
          otp_token: otpToken,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Could not confirm code.");
      }

      setIsVerified(true);
      if (data.has_profile) {
        setMessage("Email confirmed. Opening your dashboard.");
        onExistingVendor?.();
        return;
      }

      setMessage(data.detail || "Email confirmed. You can continue.");
    } catch (error) {
      setIsVerified(false);
      setMessage(error.message);
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="rounded-lg border border-stone-200 bg-white p-4 shadow-xl shadow-amber-950/5 sm:p-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase text-amber-800">Step 1</p>
          <h2 className="mt-1 text-2xl font-black text-neutral-950">Vendor sign in</h2>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-stone-600">
            Institutes can join with an official email address. Public email addresses are blocked
            so student sharing remains tied to a real organisation.
          </p>
        </div>
        <StatusPill tone={isVerified ? "good" : "warn"}>
          {isVerified ? "Email confirmed" : "Email needed"}
        </StatusPill>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <Field label="Official email address">
          <TextInput
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setIsVerified(false);
              setOtpToken("");
              setMessage("");
            }}
            placeholder="admissions@yourinstitute.edu"
            type="email"
          />
        </Field>
        <button
          className="min-h-12 rounded-lg bg-neutral-950 px-5 text-sm font-black text-[#ddff5b] transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-45 flex items-center justify-center gap-1.5"
          type="button"
          disabled={!canSendOtp || isSending}
          onClick={sendOtp}
        >
          {isSending ? (
            <i className="fa-solid fa-circle-notch fa-spin text-xs" />
          ) : (
            <i className="fa-solid fa-paper-plane text-xs" />
          )}
          {isSending ? "Sending..." : "Send code"}
        </button>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <Field label="Six digit code">
          <TextInput
            value={enteredOtp}
            onChange={(event) => setEnteredOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="Enter code"
            inputMode="numeric"
          />
        </Field>
        <button
          className="min-h-12 rounded-lg border border-neutral-950 px-5 text-sm font-black text-neutral-950 transition hover:bg-[#fbfff0] hover:border-[#ddff5b] disabled:cursor-not-allowed disabled:opacity-45 flex items-center justify-center gap-1.5"
          type="button"
          disabled={!otpToken || enteredOtp.length !== 6 || isVerifying}
          onClick={verifyOtp}
        >
          {isVerifying ? (
            <i className="fa-solid fa-circle-notch fa-spin text-xs" />
          ) : (
            <i className="fa-solid fa-check text-xs" />
          )}
          {isVerifying ? "Checking..." : "Confirm"}
        </button>
      </div>

      <p className={`mt-4 text-sm font-bold ${canSendOtp ? "text-stone-600" : "text-red-700"}`}>
        {message || "Use institute domains only, for example .edu, .ac.in, or your organisation domain."}
      </p>
    </motion.section>
  );
}

function ProfilePanel({ profile, setProfile }: { profile: any, setProfile: React.Dispatch<React.SetStateAction<any>> }) {
  const isComplete = profile.name && profile.description && profile.city && profile.state;

  function updateProfile(key, value) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="rounded-lg border border-stone-200 bg-white p-4 shadow-xl shadow-amber-950/5 sm:p-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase text-amber-800">Step 2</p>
          <h2 className="mt-1 text-2xl font-black text-neutral-950">Institute profile</h2>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-stone-600">
            This profile helps EazyGrade show students who is requesting their profile and why the
            course provider is relevant.
          </p>
        </div>
        <StatusPill tone={isComplete ? "good" : "warn"}>
          {isComplete ? "Profile ready" : "Profile pending"}
        </StatusPill>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field label="Institute name">
          <TextInput
            value={profile.name}
            onChange={(event) => updateProfile("name", event.target.value)}
            placeholder="Eazy National University"
          />
        </Field>
        <Field label="Provider type">
          <SelectInput
            value={profile.providerType}
            onChange={(event) => updateProfile("providerType", event.target.value)}
          >
            {PROVIDER_TYPES.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Website">
          <TextInput
            value={profile.website}
            onChange={(event) => updateProfile("website", event.target.value)}
            placeholder="https://www.yourinstitute.edu"
          />
        </Field>
        <Field label="Profile image link">
          <TextInput
            value={profile.imageUrl}
            onChange={(event) => updateProfile("imageUrl", event.target.value)}
            placeholder="Logo or campus image link"
          />
        </Field>
        <Field label="City">
          <TextInput
            value={profile.city}
            onChange={(event) => updateProfile("city", event.target.value)}
            placeholder="Bengaluru"
          />
        </Field>
        <Field label="State">
          <TextInput
            value={profile.state}
            onChange={(event) => updateProfile("state", event.target.value)}
            placeholder="Karnataka"
          />
        </Field>
        <Field label="Contact person">
          <TextInput
            value={profile.contactName}
            onChange={(event) => updateProfile("contactName", event.target.value)}
            placeholder="Admissions manager"
          />
        </Field>
        <Field label="Contact phone">
          <TextInput
            value={profile.contactPhone}
            onChange={(event) => updateProfile("contactPhone", event.target.value)}
            placeholder="+91 98765 43210"
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Short description">
          <TextArea
            value={profile.description}
            onChange={(event) => updateProfile("description", event.target.value)}
            placeholder="Describe your institute, who you teach, and what outcomes students can expect."
          />
        </Field>
      </div>
    </motion.section>
  );
}

function CoursePanel({ course, setCourse, courses, setCourses }: { course: any, setCourse: React.Dispatch<React.SetStateAction<any>>, courses: any[], setCourses: React.Dispatch<React.SetStateAction<any[]>> }) {
  const canAddCourse = course.title && course.subjects && course.syllabus;

  function updateCourse(key, value) {
    setCourse((current) => ({ ...current, [key]: value }));
  }

  function addCourse() {
    if (!canAddCourse) return;
    setCourses((current) => [{ ...course, id: Date.now() }, ...current]);
    setCourse(initialCourse);
  }

  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="rounded-lg border border-stone-200 bg-white p-4 shadow-xl shadow-amber-950/5 sm:p-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase text-amber-800">Step 3</p>
          <h2 className="mt-1 text-2xl font-black text-neutral-950">Courses and syllabus</h2>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-stone-600">
            Add the courses your organisation provides. These subjects will later help match
            students whose profile, interests, and education goals are relevant.
          </p>
        </div>
        <StatusPill tone={courses.length ? "good" : "warn"}>
          {courses.length ? `${courses.length} course${courses.length === 1 ? "" : "s"}` : "Course needed"}
        </StatusPill>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field label="Course name">
          <TextInput
            value={course.title}
            onChange={(event) => updateCourse("title", event.target.value)}
            placeholder="MBA in Business Analytics"
          />
        </Field>
        <Field label="Level">
          <SelectInput value={course.level} onChange={(event) => updateCourse("level", event.target.value)}>
            {COURSE_LEVELS.map((level) => (
              <option key={level}>{level}</option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Study mode">
          <SelectInput value={course.mode} onChange={(event) => updateCourse("mode", event.target.value)}>
            <option>On campus</option>
            <option>Online</option>
            <option>Hybrid</option>
            <option>Distance learning</option>
          </SelectInput>
        </Field>
        <Field label="Duration">
          <TextInput
            value={course.duration}
            onChange={(event) => updateCourse("duration", event.target.value)}
            placeholder="2 years"
          />
        </Field>
        <Field label="Seats available">
          <TextInput
            value={course.seats}
            onChange={(event) => updateCourse("seats", event.target.value)}
            placeholder="120"
            inputMode="numeric"
          />
        </Field>
        <Field label="Fees">
          <TextInput
            value={course.fees}
            onChange={(event) => updateCourse("fees", event.target.value)}
            placeholder="INR 1.8L per year"
          />
        </Field>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Field label="Main subjects">
          <TextArea
            value={course.subjects}
            onChange={(event) => updateCourse("subjects", event.target.value)}
            placeholder="Marketing, finance, analytics, business communication"
          />
        </Field>
        <Field label="Syllabus outline">
          <TextArea
            value={course.syllabus}
            onChange={(event) => updateCourse("syllabus", event.target.value)}
            placeholder="Semester wise topics, practical work, projects, and internships."
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Best fit student profile">
          <TextArea
            value={course.idealStudent}
            onChange={(event) => updateCourse("idealStudent", event.target.value)}
            placeholder="Students with commerce, maths, business studies, data interest, or work experience."
          />
        </Field>
      </div>

      <button
        className="mt-5 min-h-12 rounded-lg bg-[#ddff5b] px-6 text-sm font-black text-neutral-950 transition hover:bg-[#ccee45] disabled:cursor-not-allowed disabled:opacity-45 flex items-center justify-center gap-1.5"
        type="button"
        disabled={!canAddCourse}
        onClick={addCourse}
      >
        <i className="fa-solid fa-plus text-xs" />
        Add course
      </button>

      {courses.length ? (
        <div className="mt-6 grid gap-3">
          {courses.map((item) => (
            <article
              className="rounded-lg border border-stone-200 bg-[#fbfff0] p-4"
              key={item.id}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-lg font-black text-neutral-950">{item.title}</h3>
                  <p className="mt-1 text-sm font-bold text-stone-600">
                    {item.level} / {item.mode} {item.duration ? `/ ${item.duration}` : ""}
                  </p>
                </div>
                <button
                  className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-black text-neutral-950 transition hover:border-red-300 hover:bg-red-50 flex items-center gap-1.5"
                  type="button"
                  onClick={() => setCourses((current) => current.filter((saved) => saved.id !== item.id))}
                >
                  <i className="fa-solid fa-trash-can text-xs text-red-500" />
                  Remove
                </button>
              </div>
              <p className="mt-3 text-sm font-semibold leading-6 text-stone-700">{item.subjects}</p>
            </article>
          ))}
        </div>
      ) : null}
    </motion.section>
  );
}

function PreviewPanel({ email, isVerified, profile, courses }: { email: string, isVerified: boolean, profile: any, courses: any[] }) {
  const profileImage = profile.imageUrl.trim();

  return (
    <aside className="sticky top-4 grid gap-4 self-start">
      <section className="rounded-lg border border-neutral-950 bg-neutral-950 p-4 text-white shadow-2xl shadow-amber-950/20 sm:p-5">
        <p className="text-xs font-black uppercase text-[#ddff5b]">Vendor preview</p>
        <div className="mt-4 flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-white text-2xl font-black text-neutral-950">
            {profileImage ? (
              <img alt="" className="h-full w-full object-cover" src={profileImage} />
            ) : (
              (profile.name || "E").slice(0, 1).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <h2 className="break-words text-xl font-black leading-tight">
              {profile.name || "Institute name"}
            </h2>
            <p className="mt-1 text-sm font-bold text-stone-300">
              {profile.providerType} {profile.city ? `/ ${profile.city}` : ""}
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm font-semibold leading-6 text-stone-300">
          {profile.description || "Your institute description will appear here for student profile sharing."}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <StatusPill tone={isVerified ? "good" : "warn"}>
            {isVerified ? "Email confirmed" : "Email pending"}
          </StatusPill>
          <StatusPill tone="dark">{courses.length} course{courses.length === 1 ? "" : "s"}</StatusPill>
        </div>
        <p className="mt-4 break-words text-xs font-bold text-stone-400">{email || "official email"}</p>
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-xl shadow-amber-950/5 sm:p-5">
        <p className="text-xs font-black uppercase text-amber-800">Student sharing later</p>
        <h3 className="mt-1 text-xl font-black text-neutral-950">How this helps EazyGrade</h3>
        <div className="mt-4 grid gap-3">
          {[
            "Collect verified demand from colleges, universities, institutes, and online providers.",
            "Show each vendor a clean profile before student data is shared.",
            "Use course subjects and syllabus to find students who are a meaningful fit.",
          ].map((item) => (
            <div className="rounded-lg border border-stone-200 bg-[#fffaf0] p-3 text-sm font-bold leading-6 text-stone-700" key={item}>
              {item}
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}

export default function VendorsPage() {
  const router = useRouter();
  const [isCheckingCandidate, setIsCheckingCandidate] = useState(true);
  const [activeStep, setActiveStep] = useState("auth");
  const [email, setEmail] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [profile, setProfile] = useState(initialProfile);
  const [course, setCourse] = useState(initialCourse);
  const [courses, setCourses] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  const profileComplete = Boolean(profile.name && profile.description && profile.city && profile.state);
  const courseComplete = courses.length > 0;
  const pageStatus = useMemo(
    () => completionText(isVerified, profile, courses),
    [courses, isVerified, profile],
  );

  useEffect(() => {
    let isActive = true;

    async function prepareVendorPage() {
      try {
        let response = await fetch("/api/auth/me", { cache: "no-store" });

        if (response.status === 401) {
          await fetch("/api/auth/refresh", { method: "POST" });
          response = await fetch("/api/auth/me", { cache: "no-store" });
        }

        if (response.ok) {
          router.replace("/");
          return;
        }

        const vendorResponse = await fetch("/api/vendors/profile", {
          cache: "no-store",
        });

        if (vendorResponse.ok) {
          router.replace("/vendors/dashboard");
          return;
        }
      } catch {
        // Logged-out vendor visitors can continue.
      } finally {
        if (isActive) {
          setIsCheckingCandidate(false);
        }
      }
    }

    prepareVendorPage();

    return () => {
      isActive = false;
    };
  }, [router]);

  function continueToNextStep() {
    if (activeStep === "auth" && isVerified) {
      setActiveStep("profile");
      return;
    }

    if (activeStep === "profile" && profileComplete) {
      setActiveStep("course");
    }
  }

  async function saveVendorProfile() {
    if (!isVerified || !profileComplete || !courseComplete) {
      setSaveError("Complete email, institute profile, and course details before saving.");
      return;
    }

    setIsSaving(true);
    setSaveError("");
    setSaveMessage("");

    try {
      const response = await fetch("/api/vendors/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          is_email_verified: isVerified,
          profile,
          courses,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Could not save vendor profile.");
      }

      setSaveMessage("Vendor profile saved. Courses are ready for future student matching.");
      router.push("/vendors/dashboard");
    } catch (error) {
      setSaveError(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  const canContinue =
    (activeStep === "auth" && isVerified) ||
    (activeStep === "profile" && profileComplete);

  const canSave = activeStep === "course" && isVerified && profileComplete && courseComplete;

  if (isCheckingCandidate) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#e2f7eb_0,#fffaf0_420px,#ffffff_900px)] text-neutral-950">
      <div className="mx-auto max-w-[1180px] px-3 pb-14 pt-4 sm:px-4 sm:pt-6">
        <nav className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between" aria-label="Vendor navigation">
          <Link className="inline-flex" href="/">
            <img
              alt="EazyGrad"
              className="h-auto w-[150px] sm:w-[168px]"
              height="87"
              src={EAZYGRAD_LOGO_URL}
              width="414"
            />
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone={pageStatus === "Ready for student matching" ? "good" : "warn"}>
              {pageStatus}
            </StatusPill>
          </div>
        </nav>

        <section className="grid gap-7 pb-8 lg:grid-cols-[1fr_420px] lg:items-end">
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <p className="mb-4 text-sm font-black uppercase text-amber-800">
              Vendor partner workspace
            </p>
            <h1 className="max-w-4xl text-[2.45rem] font-black leading-none text-neutral-950 sm:text-6xl lg:text-7xl">
              Let institutes request the right student profiles.
            </h1>
            <div className="mt-4 h-3 w-[min(360px,72%)] rounded-full bg-[#ddff5b]" />
            <p className="mt-6 max-w-2xl text-base leading-8 text-stone-700 sm:text-lg">
              A simple partner flow for universities, colleges, institutes, and online course
              providers to join EazyGrade, introduce themselves, and list the courses they want
              matched with students.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.08 }}
            className="grid gap-2 rounded-lg border border-stone-200 bg-white p-3 shadow-xl shadow-amber-950/5"
          >
            <StepButton
              active={activeStep === "auth"}
              complete={isVerified}
              onClick={() => setActiveStep("auth")}
            >
              Email sign in
            </StepButton>
            <StepButton
              active={activeStep === "profile"}
              complete={profileComplete}
              onClick={() => setActiveStep("profile")}
            >
              Institute profile
            </StepButton>
            <StepButton
              active={activeStep === "course"}
              complete={courses.length > 0}
              onClick={() => setActiveStep("course")}
            >
              Course details
            </StepButton>
          </motion.div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="grid gap-5">
            <AnimatePresence mode="wait">
              {activeStep === "auth" ? (
                <AuthPanel
                  key="auth"
                  email={email}
                  setEmail={setEmail}
                  isVerified={isVerified}
                  setIsVerified={setIsVerified}
                  onExistingVendor={() => router.push("/vendors/dashboard")}
                />
              ) : null}
              {activeStep === "profile" ? (
                <ProfilePanel key="profile" profile={profile} setProfile={setProfile} />
              ) : null}
              {activeStep === "course" ? (
                <CoursePanel
                  key="course"
                  course={course}
                  setCourse={setCourse}
                  courses={courses}
                  setCourses={setCourses}
                />
              ) : null}
            </AnimatePresence>

            <div className="flex flex-col gap-3 rounded-lg border border-stone-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-bold leading-6 text-stone-600">
                Move through each section to create a complete vendor profile for later candidate matching.
              </p>
              <div className="grid grid-cols-2 gap-2 sm:flex">
                <button
                  className="rounded-lg border border-stone-200 px-4 py-2 text-sm font-black text-neutral-950 transition hover:border-[#ddff5b] disabled:cursor-not-allowed disabled:opacity-45 flex items-center justify-center gap-1.5"
                  type="button"
                  disabled={activeStep === "auth"}
                  onClick={() => setActiveStep(activeStep === "course" ? "profile" : "auth")}
                >
                  <i className="fa-solid fa-arrow-left text-xs" />
                  Back
                </button>
                <button
                  className="rounded-lg bg-neutral-950 px-4 py-2 text-sm font-black text-[#ddff5b] transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-45 flex items-center justify-center gap-1.5"
                  type="button"
                  disabled={activeStep === "course" ? !canSave || isSaving : !canContinue}
                  onClick={activeStep === "course" ? saveVendorProfile : continueToNextStep}
                >
                  {activeStep === "course"
                    ? isSaving
                      ? "Saving..."
                      : "Ready"
                    : "Continue"}
                </button>
              </div>
            </div>
            {saveMessage ? (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-800">
                {saveMessage}
              </p>
            ) : null}
            {saveError ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700">
                {saveError}
              </p>
            ) : null}
          </div>

          <PreviewPanel email={email} isVerified={isVerified} profile={profile} courses={courses} />
        </div>
      </div>
    </main>
  );
}
