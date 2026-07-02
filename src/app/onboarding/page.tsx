"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AuthActions from "../components/AuthActions";

const EAZYGRAD_LOGO_URL =
  "https://framerusercontent.com/images/czlTrRfNKMvHap0TW60cYEGcglI.png?width=414&height=87";

const initialForm = {
  phone: "",
  city: "",
  state: "",
  country: "India",

  current_activity_type: "unsure",
  current_education_status: "unsure",
  current_stream: "unsure",

  study_mode_preference: "any",
  relocation_preference: "unsure",
  preferred_states: "",
  preferred_cities: "",

  interested_subjects: "",
  disliked_subjects: "",
  skills: "",
  hobbies: "",
  target_careers: "",

  max_annual_budget: "",
  weekly_study_hours: "",

  maths_comfort: "",
  english_comfort: "",
  computer_comfort: "",
  communication_comfort: "",

  needs_scholarship: false,
  open_to_education_loan: false,
  wants_fast_job: false,
  wants_government_job: false,
  wants_abroad_option: false,
  wants_business_or_startup: false,

  career_goal_text: "",
};

const initialAcademicRecord = {
  level: "class_12",
  status: "appearing",
  board_or_university: "",
  institution_name: "",
  stream: "unsure",
  passing_year: "",
  percentage: "",
  cgpa: "",
  max_cgpa: "10",
  is_primary: true,
};

const initialWorkExperience = {
  work_type: "",
  industry: "",
  role_title: "",
  company_or_brand_name: "",
  start_year: "",
  end_year: "",
  is_current: true,
  experience_years: "",
  monthly_income_range: "",
  skills_used: "",
  tools_used: "",
  description: "",
  proof_url: "",
};

const activityOptions = [
  ["student", "School student"],
  ["college_student", "College student"],
  ["employed", "Working professional"],
  ["self_employed", "Self-employed"],
  ["freelancer", "Freelancer"],
  ["business_owner", "Business owner"],
  ["content_creator", "Content creator / YouTuber"],
  ["family_business", "Family business"],
  ["unemployed", "Career gap / unemployed"],
  ["homemaker", "Homemaker / restart"],
  ["unsure", "Unsure"],
];

const educationOptions = [
  ["class_10", "Class 10"],
  ["class_11", "Class 11"],
  ["class_12", "Class 12"],
  ["class_12_passed", "Class 12 passed"],
  ["diploma", "Diploma"],
  ["ug", "Undergraduate"],
  ["graduate", "Graduate"],
  ["working", "Working professional"],
  ["unsure", "Unsure"],
];

const streamOptions = [
  ["pcm", "Science PCM"],
  ["pcb", "Science PCB"],
  ["pcmb", "Science PCMB"],
  ["commerce", "Commerce"],
  ["arts", "Arts"],
  ["vocational", "Vocational"],
  ["other", "Other"],
  ["unsure", "Unsure"],
];

const academicLevelOptions = [
  ["class_10", "Class 10"],
  ["class_11", "Class 11"],
  ["class_12", "Class 12"],
  ["diploma", "Diploma"],
  ["ug", "Undergraduate / Graduation"],
  ["pg", "Postgraduate"],
];

const workTypeOptions = [
  ["full_time_job", "Full-time job"],
  ["part_time_job", "Part-time job"],
  ["internship", "Internship"],
  ["freelance", "Freelancing"],
  ["self_employed", "Self-employed"],
  ["business", "Business"],
  ["family_business", "Family business"],
  ["youtube_creator", "YouTube / Creator"],
  ["consultant", "Consultant"],
  ["other", "Other"],
];

const industryOptions = [
  "Information Technology",
  "Education",
  "Healthcare",
  "Finance",
  "Banking",
  "Marketing",
  "Sales",
  "Media",
  "Content Creation",
  "Design",
  "Retail",
  "Manufacturing",
  "Family Business",
  "Freelancing",
  "Government",
  "Other",
];

const incomeRangeOptions = [
  ["", "Prefer not to say"],
  ["0-10000", "₹0 - ₹10,000/month"],
  ["10000-25000", "₹10,000 - ₹25,000/month"],
  ["25000-50000", "₹25,000 - ₹50,000/month"],
  ["50000-100000", "₹50,000 - ₹1,00,000/month"],
  ["100000-plus", "₹1,00,000+/month"],
];

const streamSubjectPresets = {
  pcm: ["Mathematics", "Physics", "Chemistry", "English", "Computer Science"],
  pcb: ["Physics", "Chemistry", "Biology", "English", "Physical Education"],
  pcmb: ["Mathematics", "Physics", "Chemistry", "Biology", "English"],
  commerce: ["Accountancy", "Business Studies", "Economics", "English", "Mathematics"],
  arts: ["English", "History", "Political Science", "Geography", "Economics"],
  vocational: [
    "English",
    "Vocational Subject",
    "Applied Mathematics",
    "Computer Applications",
    "General Studies",
  ],
  other: ["English", "Subject 1", "Subject 2", "Subject 3", "Subject 4"],
  unsure: ["English", "Subject 1", "Subject 2", "Subject 3", "Subject 4"],
};

const subjectSuggestions = [
  "Computer Science",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Accountancy",
  "Commerce",
  "Economics",
  "Business Studies",
  "Psychology",
  "Design",
  "English",
  "Political Science",
  "History",
  "Geography",
  "Physical Education",
];

const careerSuggestions = [
  "Software Engineer",
  "Data Analyst",
  "Doctor",
  "Chartered Accountant",
  "Product Designer",
  "Civil Services",
  "Business Analyst",
  "Teacher",
  "Lawyer",
  "Entrepreneur",
  "Marketing Manager",
  "Research Scientist",
  "Digital Marketer",
  "Content Creator",
  "Business Owner",
];

const documentLabels = {
  class_10_marksheet: "Class 10 marksheet",
  class_12_marksheet: "Class 12 marksheet",
  undergraduate_marksheet: "Undergraduate marksheet",
  graduation_marksheet: "Graduation marksheet",
};

const documentRequirements = {
  class_12_passed: [["class_10_marksheet"], ["class_12_marksheet"]],
  ug: [["class_10_marksheet"], ["class_12_marksheet"]],
  graduate: [
    ["class_10_marksheet"],
    ["class_12_marksheet"],
    ["undergraduate_marksheet", "graduation_marksheet"],
  ],
  working: [
    ["class_10_marksheet"],
    ["class_12_marksheet"],
    ["undergraduate_marksheet", "graduation_marksheet"],
  ],
};

const selectClass =
  "min-h-12 rounded-xl border border-stone-200 bg-white px-3 text-sm font-bold text-neutral-900 outline-none transition focus:border-neutral-950 focus:ring-4 focus:ring-[#ddff5b]/40";
const inputClass =
  "min-h-12 rounded-xl border border-stone-200 bg-white px-3 text-sm font-bold text-neutral-900 outline-none transition placeholder:text-stone-400 focus:border-neutral-950 focus:ring-4 focus:ring-[#ddff5b]/40";
const cardClass = "rounded-2xl border border-stone-200 bg-white p-4";
const mutedCardClass = "rounded-2xl border border-stone-200 bg-[#fbfff0] p-4";

function splitList(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function listText(value) {
  return Array.isArray(value) ? value.join(", ") : value || "";
}

function toNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const number = Number(value);
  return Number.isNaN(number) ? null : number;
}

function clampComfort(value) {
  if (value === "") {
    return "";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return "";
  }

  return String(Math.min(5, Math.max(1, number)));
}

function calculateSubjectPercentage(marksObtained, maxMarks) {
  const marks = toNumber(marksObtained);
  const max = toNumber(maxMarks);

  if (marks === null || max === null || max <= 0) {
    return "";
  }

  const percentage = (marks / max) * 100;

  if (percentage < 0) {
    return "";
  }

  return String(Math.min(100, percentage).toFixed(2));
}

function calculateOverallPercentage(subjects) {
  let totalMarks = 0;
  let totalMaxMarks = 0;

  for (const subject of subjects) {
    const marks = toNumber(subject.marks_obtained);
    const max = toNumber(subject.max_marks);

    if (marks !== null && max !== null && max > 0) {
      totalMarks += marks;
      totalMaxMarks += max;
    }
  }

  if (totalMaxMarks <= 0) {
    return "";
  }

  return String(((totalMarks / totalMaxMarks) * 100).toFixed(2));
}

function createSubjectRowsForStream(stream, existingSubjects = []) {
  const presetSubjects = streamSubjectPresets[stream] || streamSubjectPresets.unsure;

  return presetSubjects.map((subjectName) => {
    const existing = existingSubjects.find(
      (subject) =>
        String(subject.subject_name || "").trim().toLowerCase() ===
        subjectName.toLowerCase(),
    );

    return {
      subject_name: subjectName,
      marks_obtained: existing?.marks_obtained || "",
      max_marks: existing?.max_marks || "100",
      percentage: existing?.percentage || "",
      grade: existing?.grade || "",
    };
  });
}

function isStudentActivity(activityType) {
  return ["student", "college_student"].includes(activityType);
}

function isWorkActivity(activityType) {
  return [
    "employed",
    "self_employed",
    "freelancer",
    "business_owner",
    "content_creator",
    "family_business",
  ].includes(activityType);
}

function shouldAskWorkExperience(form) {
  return isWorkActivity(form.current_activity_type);
}

function shouldAskSubjectMarks(form) {
  return ["student", "college_student"].includes(form.current_activity_type);
}

function isGraduateLike(form) {
  return (
    ["graduate", "working", "ug"].includes(form.current_education_status) ||
    [
      "employed",
      "self_employed",
      "freelancer",
      "business_owner",
      "content_creator",
      "family_business",
      "unemployed",
      "homemaker",
    ].includes(form.current_activity_type)
  );
}

function getDefaultAcademicLevelForForm(form) {
  if (isGraduateLike(form)) {
    return "ug";
  }

  if (form.current_education_status === "diploma") {
    return "diploma";
  }

  return "class_12";
}

function getCompletionItems(form, academicRecord, subjectScores, workExperience) {
  const hasSubjectMarks = subjectScores.some(
    (subject) =>
      subject.subject_name &&
      (subject.marks_obtained || subject.percentage || subject.grade),
  );

  const baseItems = [
    form.city,
    form.state,
    form.country,
    form.current_activity_type !== "unsure",
    form.current_education_status !== "unsure",
  ];

  const academicItems = [
    academicRecord.level,
    academicRecord.status,
    academicRecord.board_or_university,
    academicRecord.institution_name,
    academicRecord.passing_year,
    academicRecord.percentage || academicRecord.cgpa,
  ];

  const subjectItems = [form.current_stream !== "unsure", hasSubjectMarks];

  const workItems = [
    workExperience.work_type,
    workExperience.industry,
    workExperience.role_title,
    workExperience.company_or_brand_name,
    workExperience.experience_years,
    workExperience.skills_used,
    workExperience.description,
  ];

  const goalItems = [
    form.target_careers,
    form.interested_subjects,
    form.disliked_subjects,
    form.skills,
    form.career_goal_text,
  ];

  const preferenceItems = [
    form.study_mode_preference !== "any",
    form.relocation_preference !== "unsure",
    form.preferred_states || form.preferred_cities,
    form.max_annual_budget,
    form.weekly_study_hours,
  ];

  if (isStudentActivity(form.current_activity_type)) {
    return [
      ...baseItems,
      ...academicItems,
      ...subjectItems,
      ...goalItems,
      ...preferenceItems,
    ];
  }

  if (shouldAskWorkExperience(form)) {
    return [
      ...baseItems,
      ...academicItems,
      ...workItems,
      ...goalItems,
      ...preferenceItems,
    ];
  }

  return [...baseItems, ...academicItems, ...goalItems, ...preferenceItems];
}

function fieldPayload(form) {
  return {
    phone: form.phone,
    city: form.city,
    state: form.state,
    country: form.country || "India",

    current_activity_type: form.current_activity_type,
    current_education_status: form.current_education_status,
    current_stream: form.current_stream,

    study_mode_preference: form.study_mode_preference,
    relocation_preference: form.relocation_preference,
    preferred_states: splitList(form.preferred_states),
    preferred_cities: splitList(form.preferred_cities),

    interested_subjects: splitList(form.interested_subjects),
    disliked_subjects: splitList(form.disliked_subjects),
    skills: splitList(form.skills),
    hobbies: splitList(form.hobbies),
    target_careers: splitList(form.target_careers),

    max_annual_budget: form.max_annual_budget ? Number(form.max_annual_budget) : null,
    weekly_study_hours: form.weekly_study_hours ? Number(form.weekly_study_hours) : null,

    maths_comfort: form.maths_comfort ? Number(form.maths_comfort) : null,
    english_comfort: form.english_comfort ? Number(form.english_comfort) : null,
    computer_comfort: form.computer_comfort ? Number(form.computer_comfort) : null,
    communication_comfort: form.communication_comfort
      ? Number(form.communication_comfort)
      : null,

    needs_scholarship: form.needs_scholarship,
    open_to_education_loan: form.open_to_education_loan,
    wants_fast_job: form.wants_fast_job,
    wants_government_job: form.wants_government_job,
    wants_abroad_option: form.wants_abroad_option,
    wants_business_or_startup: form.wants_business_or_startup,

    career_goal_text: form.career_goal_text,
  };
}

function formatApiError(data, fallback) {
  if (data?.detail) {
    return data.detail;
  }

  if (!data || typeof data !== "object") {
    return fallback;
  }

  const messages = Object.entries(data)
    .flatMap(([field, value]) => {
      const list = Array.isArray(value) ? value : [value];
      return list.map((item) => `${field}: ${String(item)}`);
    })
    .join(" ");

  return messages || fallback;
}

async function parseApiResponse(response, fallback) {
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : { detail: await response.text() };

  if (!response.ok) {
    throw new Error(formatApiError(data, fallback));
  }

  return data;
}

function apiErrorMessage(error, fallback) {
  if (error?.message === "Failed to fetch") {
    return `${fallback} The local app API could not be reached. Restart the frontend dev server and try again.`;
  }

  if (error?.name === "NotReadableError") {
    return `${fallback} The selected file could not be read. Choose it again, or move it to a local folder like Downloads/Desktop if it is coming from iCloud, Google Drive, or an external location.`;
  }

  return error?.message || fallback;
}

async function readFileAsBase64(file) {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = "";

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return globalThis.btoa(binary);
}

function groupLabel(group) {
  return group.map((type) => documentLabels[type] || type).join(" or ");
}

function Field({ label, children }) {
  return (
    <label className="grid gap-2 text-sm font-black text-neutral-950">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <button
      className={`min-h-11 rounded-xl border px-4 text-left text-sm font-black transition ${
        checked
          ? "border-neutral-950 bg-neutral-950 text-[#ddff5b]"
          : "border-stone-200 bg-white text-stone-700 hover:border-[#ddff5b] hover:bg-[#fbfff0]"
      }`}
      type="button"
      onClick={() => onChange(!checked)}
    >
      {label}
    </button>
  );
}

function MultiSelectChips({ label, options, value, onChange, placeholder = "Add another" }) {
  const selected = splitList(value);
  const selectedKeys = new Set(selected.map((item) => item.toLowerCase()));
  const [customValue, setCustomValue] = useState("");

  function commit(nextSelected) {
    onChange(nextSelected.join(", "));
  }

  function toggle(option) {
    if (selectedKeys.has(option.toLowerCase())) {
      commit(selected.filter((item) => item.toLowerCase() !== option.toLowerCase()));
      return;
    }

    commit([...selected, option]);
  }

  function addCustom() {
    const trimmed = customValue.trim();

    if (!trimmed || selectedKeys.has(trimmed.toLowerCase())) {
      setCustomValue("");
      return;
    }

    commit([...selected, trimmed]);
    setCustomValue("");
  }

  return (
    <div className="grid gap-2 text-sm font-black text-neutral-950">
      <span>{label}</span>
      <div className="flex min-h-12 flex-wrap gap-2 rounded-xl border border-stone-200 bg-white p-3">
        {options.map((option) => {
          const isSelected = selectedKeys.has(option.toLowerCase());

          return (
            <button
              className={`rounded-full border px-3 py-2 text-xs font-black transition ${
                isSelected
                  ? "border-neutral-950 bg-neutral-950 text-[#ddff5b]"
                  : "border-stone-200 bg-white text-stone-700 hover:border-[#ddff5b] hover:bg-[#fbfff0]"
              }`}
              key={option}
              type="button"
              onClick={() => toggle(option)}
            >
              {option}
            </button>
          );
        })}
      </div>
      <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto]">
        <input
          className={inputClass}
          value={customValue}
          onChange={(event) => setCustomValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addCustom();
            }
          }}
          placeholder={placeholder}
        />
        <button
          className="min-h-12 rounded-xl bg-[#ddff5b] px-4 text-sm font-black text-neutral-950 transition hover:bg-[#ccee45]"
          type="button"
          onClick={addCustom}
        >
          Add
        </button>
      </div>
    </div>
  );
}

function StepPill({ number, active, done, label, onClick }) {
  return (
    <button
      className={`rounded-full border px-3 py-2 text-xs font-black transition ${
        active
          ? "border-neutral-950 bg-neutral-950 text-[#ddff5b]"
          : done
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-stone-200 bg-white text-stone-600"
      }`}
      type="button"
      onClick={onClick}
    >
      {number}. {label}
    </button>
  );
}

export default function OnboardingPage() {
  const router = useRouter();

  const [form, setForm] = useState(initialForm);
  const [academicRecord, setAcademicRecord] = useState(initialAcademicRecord);
  const [subjectScores, setSubjectScores] = useState(createSubjectRowsForStream("unsure"));
  const [workExperience, setWorkExperience] = useState(initialWorkExperience);

  const [documents, setDocuments] = useState([]);
  const [documentFiles, setDocumentFiles] = useState({});
  const [fileInputVersion, setFileInputVersion] = useState(0);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const askWorkExperience = shouldAskWorkExperience(form);
  const askSubjectMarks = shouldAskSubjectMarks(form);
  const totalSteps = askWorkExperience ? 6 : 5;

  const goalsStep = askWorkExperience ? 4 : 3;
  const documentsStep = askWorkExperience ? 5 : 4;
  const reviewStep = askWorkExperience ? 6 : 5;

  const completion = useMemo(() => {
    const items = getCompletionItems(form, academicRecord, subjectScores, workExperience);

    if (!items.length) {
      return 0;
    }

    const filled = items.filter(
      (value) =>
        value !== null &&
        value !== undefined &&
        value !== "" &&
        value !== false &&
        !(Array.isArray(value) && value.length === 0),
    ).length;

    return Math.round((filled / items.length) * 100);
  }, [form, academicRecord, subjectScores, workExperience]);

  const requiredDocumentGroups = useMemo(
    () => documentRequirements[form.current_education_status] || [],
    [form.current_education_status],
  );

  const uploadedDocumentTypes = useMemo(
    () => new Set(documents.map((document) => document.document_type)),
    [documents],
  );

  const missingDocumentGroups = useMemo(
    () =>
      requiredDocumentGroups.filter(
        (group) => !group.some((type) => uploadedDocumentTypes.has(type)),
      ),
    [requiredDocumentGroups, uploadedDocumentTypes],
  );

  useEffect(() => {
    async function loadProfile() {
      try {
        const [profileResponse, documentsResponse] = await Promise.all([
          fetch("/api/candidate/profile", { cache: "no-store" }),
          fetch("/api/candidate/documents", { cache: "no-store" }),
        ]);

        if (profileResponse.status === 401 || documentsResponse.status === 401) {
          router.replace("/login");
          return;
        }

        const profile = await parseApiResponse(profileResponse, "Could not load profile.");
        const docs = await parseApiResponse(documentsResponse, "Could not load documents.");

        if (
          profile.is_onboarding_completed ||
          Number(profile.profile_completion_percentage || 0) >= 100
        ) {
          router.replace("/");
          return;
        }

        setForm({
          ...initialForm,
          ...profile,
          preferred_states: listText(profile.preferred_states),
          preferred_cities: listText(profile.preferred_cities),
          interested_subjects: listText(profile.interested_subjects),
          disliked_subjects: listText(profile.disliked_subjects),
          skills: listText(profile.skills),
          hobbies: listText(profile.hobbies),
          target_careers: listText(profile.target_careers),
          max_annual_budget: profile.max_annual_budget || "",
          weekly_study_hours: profile.weekly_study_hours || "",
          maths_comfort: profile.maths_comfort || "",
          english_comfort: profile.english_comfort || "",
          computer_comfort: profile.computer_comfort || "",
          communication_comfort: profile.communication_comfort || "",
        });

        setDocuments(Array.isArray(docs) ? docs : []);

        const primaryAcademicRecord =
          profile.academic_records?.find((record) => record.is_primary) ||
          profile.academic_records?.[0];

        if (primaryAcademicRecord) {
          setAcademicRecord({
            ...initialAcademicRecord,
            ...primaryAcademicRecord,
            passing_year: primaryAcademicRecord.passing_year || "",
            percentage: primaryAcademicRecord.percentage || "",
            cgpa: primaryAcademicRecord.cgpa || "",
            max_cgpa: primaryAcademicRecord.max_cgpa || "10",
          });

          if (primaryAcademicRecord.subject_scores?.length) {
            setSubjectScores(
              primaryAcademicRecord.subject_scores.map((subject) => ({
                subject_name: subject.subject_name || "",
                marks_obtained: subject.marks_obtained || "",
                max_marks: subject.max_marks || "100",
                percentage: subject.percentage || "",
                grade: subject.grade || "",
              })),
            );
          }
        } else {
          setAcademicRecord((current) => ({
            ...current,
            level: getDefaultAcademicLevelForForm(profile),
            stream: profile.current_stream || "unsure",
          }));
          setSubjectScores(createSubjectRowsForStream(profile.current_stream || "unsure"));
        }

        const currentWork = profile.work_experiences?.find((work) => work.is_current) ||
          profile.work_experiences?.[0];

        if (currentWork) {
          setWorkExperience({
            ...initialWorkExperience,
            ...currentWork,
            start_year: currentWork.start_year || "",
            end_year: currentWork.end_year || "",
            experience_years: currentWork.experience_years || "",
            skills_used: listText(currentWork.skills_used),
            tools_used: listText(currentWork.tools_used),
          });
        }
      } catch (loadError) {
        setError(apiErrorMessage(loadError, "Could not load onboarding."));
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  function updateField(name, value) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function updateWorkField(name, value) {
    setWorkExperience((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function updateAcademicField(name, value) {
    setAcademicRecord((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleActivityChange(value) {
    setForm((current) => {
      const next = {
        ...current,
        current_activity_type: value,
      };

      if (value === "student" && current.current_education_status === "unsure") {
        next.current_education_status = "class_12";
      }

      if (value === "college_student" && current.current_education_status === "unsure") {
        next.current_education_status = "ug";
      }

      if (
        [
          "employed",
          "self_employed",
          "freelancer",
          "business_owner",
          "content_creator",
          "family_business",
        ].includes(value) &&
        current.current_education_status === "unsure"
      ) {
        next.current_education_status = "graduate";
      }

      return next;
    });

    setAcademicRecord((current) => ({
      ...current,
      level:
        value === "student"
          ? "class_12"
          : value === "college_student"
            ? "ug"
            : isWorkActivity(value)
              ? "ug"
              : current.level,
    }));
  }

  function handleEducationStatusChange(value) {
    setForm((current) => ({
      ...current,
      current_education_status: value,
    }));

    setAcademicRecord((current) => ({
      ...current,
      level:
        value === "graduate" || value === "working" || value === "ug"
          ? "ug"
          : value === "diploma"
            ? "diploma"
            : "class_12",
    }));
  }

  function handleStreamChange(value) {
    setForm((current) => ({
      ...current,
      current_stream: value,
    }));

    setAcademicRecord((current) => ({
      ...current,
      stream: value,
    }));

    setSubjectScores((current) => createSubjectRowsForStream(value, current));
  }

  function updateSubjectScore(index, name, value) {
    setSubjectScores((current) => {
      const nextSubjects = current.map((subject, subjectIndex) => {
        if (subjectIndex !== index) {
          return subject;
        }

        const updatedSubject = {
          ...subject,
          [name]: value,
        };

        if (name === "marks_obtained" || name === "max_marks") {
          updatedSubject.percentage = calculateSubjectPercentage(
            name === "marks_obtained" ? value : updatedSubject.marks_obtained,
            name === "max_marks" ? value : updatedSubject.max_marks,
          );
        }

        return updatedSubject;
      });

      const overallPercentage = calculateOverallPercentage(nextSubjects);

      if (overallPercentage) {
        setAcademicRecord((currentAcademicRecord) => ({
          ...currentAcademicRecord,
          percentage: overallPercentage,
        }));
      }

      return nextSubjects;
    });
  }

  function addSubjectScore() {
    setSubjectScores((current) => [
      ...current,
      {
        subject_name: "",
        marks_obtained: "",
        max_marks: "100",
        percentage: "",
        grade: "",
      },
    ]);
  }

  function removeSubjectScore(index) {
    setSubjectScores((current) =>
      current.filter((_, subjectIndex) => subjectIndex !== index),
    );
  }

  function onboardingPayload() {
    const payload: Record<string, any> = {
      academic_record: {
        level: academicRecord.level,
        status: academicRecord.status,
        board_or_university: academicRecord.board_or_university,
        institution_name: academicRecord.institution_name,
        stream: form.current_stream,
        passing_year: academicRecord.passing_year
          ? Number(academicRecord.passing_year)
          : null,
        percentage: academicRecord.percentage ? Number(academicRecord.percentage) : null,
        cgpa: academicRecord.cgpa ? Number(academicRecord.cgpa) : null,
        max_cgpa: academicRecord.max_cgpa ? Number(academicRecord.max_cgpa) : null,
        is_primary: true,
      },
      city: form.city,
      state: form.state,
      country: form.country,
      phone: form.phone,
      current_activity_type: form.current_activity_type,
      current_education_status: form.current_education_status,
      target_careers: splitList(form.target_careers),
      preferred_states: splitList(form.preferred_states),
      preferred_cities: splitList(form.preferred_cities),
      preferred_modes: Object.entries((form as any).preferred_modes)
        .filter(([, selected]) => selected)
        .map(([mode]) => mode),
      preferred_levels: Object.entries((form as any).preferred_levels)
        .filter(([, selected]) => selected)
        .map(([level]) => level),
      max_annual_budget: form.max_annual_budget ? Number(form.max_annual_budget) : null,
      disliked_subjects: splitList(form.disliked_subjects),
      academic_subjects: subjectScores
        .filter((subject) => {
          const hasSubject = String(subject.subject_name || "").trim();
          const hasMarks = subject.marks_obtained || subject.percentage || subject.grade;
          return hasSubject && hasMarks;
        })
        .map((subject) => ({
          subject_name: String(subject.subject_name || "").trim(),
          marks_obtained: subject.marks_obtained ? Number(subject.marks_obtained) : null,
          max_marks: subject.max_marks ? Number(subject.max_marks) : null,
          percentage: subject.percentage ? Number(subject.percentage) : null,
          grade: subject.grade || "",
        })),
    };

    if (shouldAskWorkExperience(form)) {
      payload.work_experience = {
        work_type: workExperience.work_type,
        industry: workExperience.industry,
        role_title: workExperience.role_title,
        company_or_brand_name: workExperience.company_or_brand_name,
        start_year: workExperience.start_year ? Number(workExperience.start_year) : null,
        end_year: workExperience.end_year ? Number(workExperience.end_year) : null,
        is_current: workExperience.is_current,
        experience_years: workExperience.experience_years
          ? Number(workExperience.experience_years)
          : null,
        monthly_income_range: workExperience.monthly_income_range,
        skills_used: splitList(workExperience.skills_used),
        tools_used: splitList(workExperience.tools_used),
        description: workExperience.description,
        proof_url: workExperience.proof_url,
      };
    }

    return payload;
  }

  async function saveProfile(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/candidate/onboarding", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(onboardingPayload()),
      });

      const data = await parseApiResponse(response, "Could not save profile.");

      if (data.is_onboarding_completed) {
        setMessage("Profile saved. Your profile is complete.");
      } else {
        setMessage("Profile saved. Complete remaining steps to improve recommendations.");
      }

      router.push("/");
    } catch (saveError) {
      setError(apiErrorMessage(saveError, "Could not save profile."));
    } finally {
      setSaving(false);
    }
  }

  async function uploadDocument(event, type) {
    event.preventDefault();

    const documentFile = documentFiles[type];

    if (!documentFile) {
      setError("Choose a document to upload.");
      return;
    }

    setUploading(true);
    setError("");
    setMessage("");

    try {
      const fileData = await readFileAsBase64(documentFile);

      const response = await fetch("/api/candidate/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          document_type: type,
          filename: documentFile.name,
          content_type: documentFile.type || "application/octet-stream",
          file_data: fileData,
        }),
      });

      const data = await parseApiResponse(response, "Could not upload document.");

      setDocuments((current) => [data, ...current]);
      setDocumentFiles((current) => ({ ...current, [type]: null }));
      setMessage("Document uploaded.");
    } catch (uploadError) {
      setError(apiErrorMessage(uploadError, "Could not upload document."));
    } finally {
      setDocumentFiles((current) => ({ ...current, [type]: null }));
      setFileInputVersion((current) => current + 1);
      setUploading(false);
    }
  }

  function goNext() {
    setStep((current) => Math.min(totalSteps, current + 1));
  }

  function goBack() {
    setStep((current) => Math.max(1, current - 1));
  }

  function renderStepControls() {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 pt-5">
        <button
          className="rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-black text-stone-700 transition hover:border-[#ddff5b] hover:bg-[#fbfff0] disabled:cursor-not-allowed disabled:opacity-40"
          disabled={step === 1}
          type="button"
          onClick={goBack}
        >
          Back
        </button>

        {step < totalSteps ? (
          <button
            className="rounded-xl bg-neutral-950 px-5 py-3 text-sm font-black text-white transition hover:bg-neutral-800"
            type="button"
            onClick={goNext}
          >
            Continue
          </button>
        ) : (
          <button
            className="rounded-xl bg-neutral-950 px-5 py-3 text-sm font-black text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={saving}
            type="submit"
          >
            {saving ? "Saving..." : "Save profile"}
          </button>
        )}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#e2f7eb_0,#fffaf0_340px,#ffffff_860px)] text-neutral-950">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6">
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

        <section className="grid gap-6 py-8 lg:grid-cols-[1fr_340px] lg:items-start">
          <form
            className="rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl shadow-amber-950/10 sm:p-7"
            onSubmit={saveProfile}
          >
            <div className="flex flex-col gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="rounded-full bg-neutral-950 px-3 py-1.5 text-xs font-black uppercase text-[#ddff5b]">
                  Candidate onboarding
                </span>
                <h1 className="mt-5 text-3xl font-black leading-none text-neutral-950 sm:text-5xl">
                  Build your admission profile.
                </h1>
              </div>

              <div className="min-w-40 rounded-xl border border-emerald-100 bg-[#fbfff0] p-3">
                <div className="text-xs font-black uppercase text-amber-800">
                  Completion
                </div>
                <div className="mt-1 text-3xl font-black">{completion}%</div>
                <div className="mt-2 h-2 rounded-full bg-white">
                  <div
                    className="h-2 rounded-full bg-neutral-950"
                    style={{ width: `${Math.min(completion, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <p className="py-10 text-sm font-bold text-stone-600">Loading profile...</p>
            ) : (
              <div className="mt-6 grid gap-6">
                <div className="flex flex-wrap gap-2">
                  <StepPill
                    number={1}
                    label="Situation"
                    active={step === 1}
                    done={step > 1}
                    onClick={() => setStep(1)}
                  />
                  <StepPill
                    number={2}
                    label="Education"
                    active={step === 2}
                    done={step > 2}
                    onClick={() => setStep(2)}
                  />
                  {askWorkExperience ? (
                    <StepPill
                      number={3}
                      label="Work"
                      active={step === 3}
                      done={step > 3}
                      onClick={() => setStep(3)}
                    />
                  ) : null}
                  <StepPill
                    number={goalsStep}
                    label="Goals"
                    active={step === goalsStep}
                    done={step > goalsStep}
                    onClick={() => setStep(goalsStep)}
                  />
                  <StepPill
                    number={documentsStep}
                    label="Documents"
                    active={step === documentsStep}
                    done={step > documentsStep}
                    onClick={() => setStep(documentsStep)}
                  />
                  <StepPill
                    number={reviewStep}
                    label="Review"
                    active={step === reviewStep}
                    done={step > reviewStep}
                    onClick={() => setStep(reviewStep)}
                  />
                </div>

                {step === 1 ? (
                  <div className={mutedCardClass}>
                    <h2 className="text-xl font-black text-neutral-950">
                      Step 1: Current situation
                    </h2>
                    <p className="mt-1 text-sm font-bold text-stone-600">
                      This decides which questions we ask next.
                    </p>

                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                      <Field label="Phone">
                        <input
                          className={inputClass}
                          value={form.phone}
                          onChange={(event) => updateField("phone", event.target.value)}
                          placeholder="9876543210"
                        />
                      </Field>

                      <Field label="City">
                        <input
                          className={inputClass}
                          value={form.city}
                          onChange={(event) => updateField("city", event.target.value)}
                          placeholder="Udaipur"
                        />
                      </Field>

                      <Field label="State">
                        <input
                          className={inputClass}
                          value={form.state}
                          onChange={(event) => updateField("state", event.target.value)}
                          placeholder="Rajasthan"
                        />
                      </Field>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                      <Field label="Country">
                        <input
                          className={inputClass}
                          value={form.country}
                          onChange={(event) => updateField("country", event.target.value)}
                          placeholder="India"
                        />
                      </Field>

                      <Field label="What are you currently doing?">
                        <select
                          className={selectClass}
                          value={form.current_activity_type}
                          onChange={(event) => handleActivityChange(event.target.value)}
                        >
                          {activityOptions.map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </Field>

                      <Field label="Current education status">
                        <select
                          className={selectClass}
                          value={form.current_education_status}
                          onChange={(event) =>
                            handleEducationStatusChange(event.target.value)
                          }
                        >
                          {educationOptions.map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                  </div>
                ) : null}

                {step === 2 ? (
                  <div className="grid gap-6">
                    <div className={mutedCardClass}>
                      <h2 className="text-xl font-black text-neutral-950">
                        Step 2: Academic details
                      </h2>
                      <p className="mt-1 text-sm font-bold text-stone-600">
                        For students we use school subjects. For graduates or working users we use highest qualification.
                      </p>

                      <div className="mt-4 grid gap-4 md:grid-cols-3">
                        <Field label="Academic level">
                          <select
                            className={selectClass}
                            value={academicRecord.level}
                            onChange={(event) =>
                              updateAcademicField("level", event.target.value)
                            }
                          >
                            {academicLevelOptions.map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </Field>

                        <Field label="Result status">
                          <select
                            className={selectClass}
                            value={academicRecord.status}
                            onChange={(event) =>
                              updateAcademicField("status", event.target.value)
                            }
                          >
                            <option value="appearing">Appearing</option>
                            <option value="passed">Passed</option>
                            <option value="result_awaited">Result awaited</option>
                            <option value="failed">Failed</option>
                          </select>
                        </Field>

                        <Field label="Passing year">
                          <input
                            className={inputClass}
                            type="number"
                            value={academicRecord.passing_year}
                            onChange={(event) =>
                              updateAcademicField("passing_year", event.target.value)
                            }
                            placeholder="2026"
                          />
                        </Field>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-3">
                        <Field label={isGraduateLike(form) ? "University" : "Board / University"}>
                          <input
                            className={inputClass}
                            value={academicRecord.board_or_university}
                            onChange={(event) =>
                              updateAcademicField(
                                "board_or_university",
                                event.target.value,
                              )
                            }
                            placeholder="CBSE / RBSE / University name"
                          />
                        </Field>

                        <Field label={isGraduateLike(form) ? "College / Institute" : "School / College"}>
                          <input
                            className={inputClass}
                            value={academicRecord.institution_name}
                            onChange={(event) =>
                              updateAcademicField("institution_name", event.target.value)
                            }
                            placeholder="School, college, or university"
                          />
                        </Field>

                        <Field label="Overall percentage">
                          <input
                            className={inputClass}
                            max="100"
                            min="0"
                            type="number"
                            value={academicRecord.percentage}
                            onChange={(event) =>
                              updateAcademicField("percentage", event.target.value)
                            }
                            placeholder="Auto from subject marks or enter manually"
                          />
                        </Field>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-3">
                        <Field label="CGPA">
                          <input
                            className={inputClass}
                            type="number"
                            value={academicRecord.cgpa}
                            onChange={(event) =>
                              updateAcademicField("cgpa", event.target.value)
                            }
                            placeholder="8.2"
                          />
                        </Field>

                        <Field label="Max CGPA">
                          <input
                            className={inputClass}
                            type="number"
                            value={academicRecord.max_cgpa}
                            onChange={(event) =>
                              updateAcademicField("max_cgpa", event.target.value)
                            }
                            placeholder="10"
                          />
                        </Field>

                        <Field label="Stream / background">
                          <select
                            className={selectClass}
                            value={form.current_stream}
                            onChange={(event) => handleStreamChange(event.target.value)}
                          >
                            {streamOptions.map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </Field>
                      </div>
                    </div>

                    {askSubjectMarks ? (
                      <div className={cardClass}>
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <h2 className="text-xl font-black text-neutral-950">
                              Subject-wise marks
                            </h2>
                            <p className="mt-1 text-sm font-bold text-stone-600">
                              Required for checking Maths, Physics, Biology, Computer, Commerce, and English eligibility.
                            </p>
                          </div>

                          <button
                            className="rounded-xl bg-[#ddff5b] px-4 py-2 text-sm font-black text-neutral-950 transition hover:bg-[#ccee45]"
                            type="button"
                            onClick={addSubjectScore}
                          >
                            Add subject
                          </button>
                        </div>

                        <div className="mt-4 grid gap-3">
                          {subjectScores.map((subject, index) => (
                            <div
                              className="grid gap-3 rounded-xl border border-stone-200 bg-stone-50 p-3 md:grid-cols-[minmax(0,1.4fr)_1fr_1fr_1fr_auto]"
                              key={`${subject.subject_name}-${index}`}
                            >
                              <select
                                className={selectClass}
                                value={subject.subject_name}
                                onChange={(event) =>
                                  updateSubjectScore(index, "subject_name", event.target.value)
                                }
                              >
                                <option value="">Select subject</option>
                                {[
                                  ...(streamSubjectPresets[form.current_stream] || []),
                                  ...subjectSuggestions,
                                ]
                                  .filter((value, optionIndex, array) => array.indexOf(value) === optionIndex)
                                  .map((subjectOption) => (
                                    <option key={subjectOption} value={subjectOption}>
                                      {subjectOption}
                                    </option>
                                  ))}
                              </select>

                              <input
                                className={inputClass}
                                type="number"
                                value={subject.marks_obtained}
                                onChange={(event) =>
                                  updateSubjectScore(index, "marks_obtained", event.target.value)
                                }
                                placeholder="Marks"
                              />

                              <input
                                className={inputClass}
                                type="number"
                                value={subject.max_marks}
                                onChange={(event) =>
                                  updateSubjectScore(index, "max_marks", event.target.value)
                                }
                                placeholder="Max"
                              />

                              <input
                                className={`${inputClass} ${
                                  subject.marks_obtained && subject.max_marks
                                    ? "bg-stone-100 text-stone-500"
                                    : ""
                                }`}
                                type="number"
                                value={subject.percentage}
                                onChange={(event) =>
                                  updateSubjectScore(index, "percentage", event.target.value)
                                }
                                placeholder="Auto %"
                                readOnly={Boolean(subject.marks_obtained && subject.max_marks)}
                              />

                              <button
                                className="rounded-xl border border-red-200 bg-red-50 px-3 text-sm font-black text-red-700"
                                type="button"
                                onClick={() => removeSubjectScore(index)}
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {step === 3 && askWorkExperience ? (
                  <div className={cardClass}>
                    <h2 className="text-xl font-black text-neutral-950">
                      Step 3: Work / business details
                    </h2>
                    <p className="mt-1 text-sm font-bold text-stone-600">
                      This helps us recommend courses for career switch, promotion, business growth, or skill upgrade.
                    </p>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <Field label="Work type">
                        <select
                          className={selectClass}
                          value={workExperience.work_type}
                          onChange={(event) =>
                            updateWorkField("work_type", event.target.value)
                          }
                        >
                          <option value="">Select work type</option>
                          {workTypeOptions.map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </Field>

                      <Field label="Industry">
                        <select
                          className={selectClass}
                          value={workExperience.industry}
                          onChange={(event) =>
                            updateWorkField("industry", event.target.value)
                          }
                        >
                          <option value="">Select industry</option>
                          {industryOptions.map((industry) => (
                            <option key={industry} value={industry}>
                              {industry}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <Field label="Role / title">
                        <input
                          className={inputClass}
                          value={workExperience.role_title}
                          onChange={(event) =>
                            updateWorkField("role_title", event.target.value)
                          }
                          placeholder="Software developer, Sales executive, Video editor"
                        />
                      </Field>

                      <Field label="Company / brand / business name">
                        <input
                          className={inputClass}
                          value={workExperience.company_or_brand_name}
                          onChange={(event) =>
                            updateWorkField(
                              "company_or_brand_name",
                              event.target.value,
                            )
                          }
                          placeholder="Company, channel, agency, shop, business"
                        />
                      </Field>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                      <Field label="Start year">
                        <input
                          className={inputClass}
                          type="number"
                          value={workExperience.start_year}
                          onChange={(event) =>
                            updateWorkField("start_year", event.target.value)
                          }
                          placeholder="2022"
                        />
                      </Field>

                      <Field label="Experience years">
                        <input
                          className={inputClass}
                          type="number"
                          value={workExperience.experience_years}
                          onChange={(event) =>
                            updateWorkField("experience_years", event.target.value)
                          }
                          placeholder="2"
                        />
                      </Field>

                      <Field label="Income range">
                        <select
                          className={selectClass}
                          value={workExperience.monthly_income_range}
                          onChange={(event) =>
                            updateWorkField(
                              "monthly_income_range",
                              event.target.value,
                            )
                          }
                        >
                          {incomeRangeOptions.map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <Field label="Skills used">
                        <input
                          className={inputClass}
                          value={workExperience.skills_used}
                          onChange={(event) =>
                            updateWorkField("skills_used", event.target.value)
                          }
                          placeholder="Sales, editing, Python, teaching"
                        />
                      </Field>

                      <Field label="Tools used">
                        <input
                          className={inputClass}
                          value={workExperience.tools_used}
                          onChange={(event) =>
                            updateWorkField("tools_used", event.target.value)
                          }
                          placeholder="Excel, Canva, Premiere Pro, Python"
                        />
                      </Field>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <Field label="Portfolio / proof URL">
                        <input
                          className={inputClass}
                          value={workExperience.proof_url}
                          onChange={(event) =>
                            updateWorkField("proof_url", event.target.value)
                          }
                          placeholder="LinkedIn, YouTube, portfolio, website"
                        />
                      </Field>

                      <div className="grid gap-2 text-sm font-black text-neutral-950">
                        <span>Current work?</span>
                        <Toggle
                          label={workExperience.is_current ? "Currently active" : "Not current"}
                          checked={workExperience.is_current}
                          onChange={(value) => updateWorkField("is_current", value)}
                        />
                      </div>
                    </div>

                    <Field label="Describe your work">
                      <textarea
                        className={`${inputClass} mt-4 min-h-28 py-3 leading-6`}
                        value={workExperience.description}
                        onChange={(event) =>
                          updateWorkField("description", event.target.value)
                        }
                        placeholder="What do you do, what kind of clients/users/customers do you work with, and why do you want to study further?"
                      />
                    </Field>
                  </div>
                ) : null}

                {step === goalsStep ? (
                  <div className="grid gap-6">
                    <div className={cardClass}>
                      <h2 className="text-xl font-black text-neutral-950">
                        Step {goalsStep}: Goals and preferences
                      </h2>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <Field label="Career targets">
                          <input
                            className={inputClass}
                            list="career-suggestions"
                            value={form.target_careers}
                            onChange={(event) =>
                              updateField("target_careers", event.target.value)
                            }
                            placeholder="Data analyst, software engineer"
                          />
                        </Field>

                        <Field label="Preferred states">
                          <input
                            className={inputClass}
                            value={form.preferred_states}
                            onChange={(event) =>
                              updateField("preferred_states", event.target.value)
                            }
                            placeholder="Rajasthan, Delhi, Karnataka"
                          />
                        </Field>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <Field label="Preferred cities">
                          <input
                            className={inputClass}
                            value={form.preferred_cities}
                            onChange={(event) =>
                              updateField("preferred_cities", event.target.value)
                            }
                            placeholder="Udaipur, Jaipur, Delhi"
                          />
                        </Field>

                        <Field label="Annual budget">
                          <input
                            className={inputClass}
                            min="0"
                            type="number"
                            value={form.max_annual_budget}
                            onChange={(event) =>
                              updateField("max_annual_budget", event.target.value)
                            }
                            placeholder="250000"
                          />
                        </Field>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <Field label="Study mode">
                          <select
                            className={selectClass}
                            value={form.study_mode_preference}
                            onChange={(event) =>
                              updateField("study_mode_preference", event.target.value)
                            }
                          >
                            <option value="regular">Regular</option>
                            <option value="online">Online</option>
                            <option value="distance">Distance</option>
                            <option value="hybrid">Hybrid</option>
                            <option value="any">Any</option>
                          </select>
                        </Field>

                        <Field label="Relocation">
                          <select
                            className={selectClass}
                            value={form.relocation_preference}
                            onChange={(event) =>
                              updateField("relocation_preference", event.target.value)
                            }
                          >
                            <option value="same_city">Same city</option>
                            <option value="same_state">Same state</option>
                            <option value="anywhere_india">Anywhere in India</option>
                            <option value="online_only">Online only</option>
                            <option value="unsure">Unsure</option>
                          </select>
                        </Field>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <Field label="Study hours per week">
                          <input
                            className={inputClass}
                            min="0"
                            type="number"
                            value={form.weekly_study_hours}
                            onChange={(event) =>
                              updateField("weekly_study_hours", event.target.value)
                            }
                            placeholder="20"
                          />
                        </Field>

                        <Field label="Maths comfort">
                          <input
                            className={inputClass}
                            max="5"
                            min="1"
                            type="number"
                            value={form.maths_comfort}
                            onChange={(event) =>
                              updateField(
                                "maths_comfort",
                                clampComfort(event.target.value),
                              )
                            }
                            placeholder="1-5"
                          />
                        </Field>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-3">
                        <Field label="English comfort">
                          <input
                            className={inputClass}
                            max="5"
                            min="1"
                            type="number"
                            value={form.english_comfort}
                            onChange={(event) =>
                              updateField(
                                "english_comfort",
                                clampComfort(event.target.value),
                              )
                            }
                            placeholder="1-5"
                          />
                        </Field>

                        <Field label="Computer comfort">
                          <input
                            className={inputClass}
                            max="5"
                            min="1"
                            type="number"
                            value={form.computer_comfort}
                            onChange={(event) =>
                              updateField(
                                "computer_comfort",
                                clampComfort(event.target.value),
                              )
                            }
                            placeholder="1-5"
                          />
                        </Field>

                        <Field label="Communication comfort">
                          <input
                            className={inputClass}
                            max="5"
                            min="1"
                            type="number"
                            value={form.communication_comfort}
                            onChange={(event) =>
                              updateField(
                                "communication_comfort",
                                clampComfort(event.target.value),
                              )
                            }
                            placeholder="1-5"
                          />
                        </Field>
                      </div>
                    </div>

                    <div className={cardClass}>
                      <div className="grid gap-4">
                        <MultiSelectChips
                          label="Interested subjects"
                          options={subjectSuggestions}
                          value={form.interested_subjects}
                          onChange={(value) => updateField("interested_subjects", value)}
                          placeholder="Add another subject"
                        />

                        <MultiSelectChips
                          label="Disliked subjects"
                          options={subjectSuggestions}
                          value={form.disliked_subjects}
                          onChange={(value) => updateField("disliked_subjects", value)}
                          placeholder="Add disliked subject"
                        />

                        <MultiSelectChips
                          label="Skills"
                          options={[
                            "Coding",
                            "Communication",
                            "Sales",
                            "Design",
                            "Video Editing",
                            "Teaching",
                            "Writing",
                            "Excel",
                            "Marketing",
                            "Leadership",
                          ]}
                          value={form.skills}
                          onChange={(value) => updateField("skills", value)}
                          placeholder="Add skill"
                        />

                        <MultiSelectChips
                          label="Hobbies"
                          options={[
                            "Reading",
                            "Gaming",
                            "Design",
                            "Content Creation",
                            "Teaching",
                            "Sports",
                            "Writing",
                            "Business",
                            "Coding",
                            "Public Speaking",
                          ]}
                          value={form.hobbies}
                          onChange={(value) => updateField("hobbies", value)}
                          placeholder="Add hobby"
                        />
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                          ["needs_scholarship", "Need scholarship"],
                          ["open_to_education_loan", "Open to loan"],
                          ["wants_fast_job", "Fast job priority"],
                          ["wants_government_job", "Government job"],
                          ["wants_abroad_option", "Abroad option"],
                          ["wants_business_or_startup", "Business or startup"],
                        ].map(([name, label]) => (
                          <Toggle
                            key={name}
                            checked={form[name]}
                            label={label}
                            onChange={(value) => updateField(name, value)}
                          />
                        ))}
                      </div>

                      <Field label="Career goal / confusion">
                        <textarea
                          className={`${inputClass} mt-4 min-h-28 py-3 leading-6`}
                          value={form.career_goal_text}
                          onChange={(event) =>
                            updateField("career_goal_text", event.target.value)
                          }
                          placeholder="I want a practical CS degree with strong placement options, but I am confused between BCA and B.Tech."
                        />
                      </Field>

                      <datalist id="career-suggestions">
                        {careerSuggestions.map((suggestion) => (
                          <option key={suggestion} value={suggestion} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                ) : null}

                {step === documentsStep ? (
                  <div className={cardClass}>
                    <h2 className="text-xl font-black text-neutral-950">
                      Step {documentsStep}: Documents
                    </h2>
                    <p className="mt-1 text-sm font-bold text-stone-600">
                      Upload documents when available. This improves final admission readiness.
                    </p>

                    <div className="mt-4 grid gap-4">
                      {requiredDocumentGroups.length ? (
                        requiredDocumentGroups.map((group) => {
                          const satisfiedType = group.find((type) =>
                            uploadedDocumentTypes.has(type),
                          );

                          return (
                            <div
                              className="rounded-xl border border-stone-200 bg-[#fbfff0] p-3"
                              key={group.join("-")}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h3 className="text-sm font-black text-neutral-950">
                                    {groupLabel(group)}
                                  </h3>
                                  <p className="mt-1 text-xs font-bold text-stone-600">
                                    {satisfiedType ? "Uploaded" : "Required"}
                                  </p>
                                </div>
                                <span
                                  className={`rounded-full px-2.5 py-1 text-xs font-black ${
                                    satisfiedType
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-neutral-950 text-[#ddff5b]"
                                  }`}
                                >
                                  {satisfiedType ? "Done" : "Missing"}
                                </span>
                              </div>

                              {!satisfiedType ? (
                                <div className="mt-3 grid gap-3">
                                  {group.map((uploadType) => (
                                    <div className="grid gap-2" key={uploadType}>
                                      {group.length > 1 ? (
                                        <p className="text-xs font-black text-stone-700">
                                          {documentLabels[uploadType]}
                                        </p>
                                      ) : null}
                                      <input
                                        className="block w-full rounded-xl border border-dashed border-stone-300 bg-white p-3 text-sm font-bold text-stone-700 file:mr-3 file:rounded-full file:border-0 file:bg-neutral-950 file:px-4 file:py-2 file:text-sm file:font-black file:text-[#ddff5b]"
                                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                                        key={`${uploadType}-${fileInputVersion}`}
                                        onChange={(event) =>
                                          setDocumentFiles((current) => ({
                                            ...current,
                                            [uploadType]: event.target.files?.[0] || null,
                                          }))
                                        }
                                        type="file"
                                      />
                                      <button
                                        className="min-h-11 rounded-xl bg-[#ddff5b] px-4 text-sm font-black text-neutral-950 transition hover:bg-[#ccee45] disabled:cursor-not-allowed disabled:opacity-60"
                                        disabled={uploading}
                                        onClick={(event) => uploadDocument(event, uploadType)}
                                        type="button"
                                      >
                                        {uploading
                                          ? "Uploading..."
                                          : `Upload ${documentLabels[uploadType]}`}
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          );
                        })
                      ) : (
                        <p className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-3 text-sm font-bold leading-6 text-stone-600">
                          No required documents for this status yet. You can still save your profile.
                        </p>
                      )}

                      {missingDocumentGroups.length ? (
                        <p className="text-xs font-bold leading-5 text-stone-600">
                          Missing: {missingDocumentGroups.map(groupLabel).join(", ")}
                        </p>
                      ) : requiredDocumentGroups.length ? (
                        <p className="text-xs font-bold leading-5 text-emerald-700">
                          Required documents are complete.
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {step === reviewStep ? (
                  <div className={cardClass}>
                    <h2 className="text-xl font-black text-neutral-950">
                      Step {reviewStep}: Review
                    </h2>

                    <div className="mt-4 grid gap-3 text-sm font-bold text-stone-700">
                      <p>
                        <span className="text-neutral-950">Current activity:</span>{" "}
                        {form.current_activity_type}
                      </p>
                      <p>
                        <span className="text-neutral-950">Education:</span>{" "}
                        {form.current_education_status}
                      </p>
                      <p>
                        <span className="text-neutral-950">Academic level:</span>{" "}
                        {academicRecord.level}
                      </p>
                      <p>
                        <span className="text-neutral-950">Overall score:</span>{" "}
                        {academicRecord.percentage || academicRecord.cgpa || "Not added"}
                      </p>
                      <p>
                        <span className="text-neutral-950">Goals:</span>{" "}
                        {form.target_careers || "Not added"}
                      </p>
                      <p>
                        <span className="text-neutral-950">Completion:</span>{" "}
                        {completion}%
                      </p>
                    </div>

                    <p className="mt-4 rounded-xl border border-emerald-100 bg-[#fbfff0] px-4 py-3 text-sm font-bold text-emerald-950">
                      Save this profile first. Then generate recommendations from the home/search page.
                    </p>
                  </div>
                ) : null}

                {error ? (
                  <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                    {error}
                  </p>
                ) : null}

                {message ? (
                  <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
                    {message}
                  </p>
                ) : null}

                {renderStepControls()}
              </div>
            )}
          </form>

          <aside className="grid gap-5">
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xl shadow-amber-950/10">
              <h2 className="text-xl font-black text-neutral-950">Profile status</h2>
              <div className="mt-4 grid gap-3 text-sm font-bold text-stone-600">
                <p>Step: {step} / {totalSteps}</p>
                <p>Completion: {completion}%</p>
                <p>Documents uploaded: {documents.length}</p>
                {askWorkExperience ? (
                  <p>Work details required for this profile type.</p>
                ) : (
                  <p>Work details not required for this profile type.</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-neutral-950 p-5 text-white shadow-xl shadow-amber-950/10">
              <h2 className="text-xl font-black">Uploaded</h2>
              <div className="mt-4 grid gap-3">
                {documents.length ? (
                  documents.slice(0, 5).map((document) => (
                    <a
                      className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm font-bold text-stone-200 transition hover:border-[#ddff5b] hover:text-[#ddff5b]"
                      href={document.file_url}
                      key={document.id}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {document.original_filename || document.document_type}
                    </a>
                  ))
                ) : (
                  <p className="text-sm font-semibold leading-6 text-stone-400">
                    No documents uploaded yet.
                  </p>
                )}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
