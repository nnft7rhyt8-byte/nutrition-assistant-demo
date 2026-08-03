import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardList,
  Clock3,
  Download,
  FileText,
  Filter,
  HeartPulse,
  Home,
  Hospital,
  LayoutGrid,
  ListChecks,
  MoreHorizontal,
  Plus,
  RefreshCcw,
  Save,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
  Users,
  Utensils,
  X,
} from "lucide-react";
import "./styles.css";

const STORAGE_KEY = "nutripilot-v1-patients";
const APP_VERSION = "1.0 MVP";

const AMPUTATION_SEGMENTS = [
  { label: "Keine Amputation", percent: 0 },
  { label: "Hand", percent: 0.7 },
  { label: "Unterarm inkl. Hand", percent: 2.3 },
  { label: "Gesamter Arm", percent: 5.0 },
  { label: "Fuß", percent: 1.5 },
  { label: "Unterschenkel inkl. Fuß", percent: 5.9 },
  { label: "Oberschenkelamputation", percent: 11.0 },
  { label: "Gesamtes Bein / Hüftexartikulation", percent: 16.0 },
];

const DEMO_PATIENTS = [
  makePatient({
    id: "P-001245",
    patientNumber: "1002458",
    firstName: "Maria",
    lastName: "Schmidt",
    birthDate: "1944-03-18",
    sex: "weiblich",
    station: "3B Geriatrie",
    room: "12",
    admissionDate: "2026-08-02",
    dischargeDate: "2026-08-09",
    priority: 97,
    consultStatus: "Neu",
    caseStatus: "Konsil prüfen",
    scenario: "Geriatrie",
    screening: 4,
    reason: "Gewichtsverlust · Aufnahme unter 50 %",
    nextStep: "Assessment ergänzen",
    assessment: {
      weight: 58,
      height: 162,
      weight1m: 61,
      weight3m: 65.2,
      intakePercent: 42,
      intakeDays: 8,
      proteinPercent: 45,
      fluidMl: 1050,
      appetite: "deutlich vermindert",
      swallowing: "nicht sicher beurteilt",
      muscleReduced: "unknown",
      inflammation: "unknown",
      edema: false,
      ascites: false,
      amputation: { present: false, label: "Keine Amputation", percent: 0, bilateral: false },
      notes: "Mobilität eingeschränkt. Gewichtsverlauf bei Patientin bzw. Angehörigen bestätigen.",
    },
  }),
  makePatient({
    id: "P-001246",
    patientNumber: "1002461",
    firstName: "Hans",
    lastName: "Becker",
    birthDate: "1950-11-04",
    sex: "männlich",
    station: "2A Innere",
    room: "08",
    admissionDate: "2026-08-03",
    priority: 94,
    consultStatus: "Sicherheitscheck",
    caseStatus: "Refeeding prüfen",
    scenario: "Refeeding",
    screening: 5,
    reason: "Sehr geringe Aufnahme · Elektrolyte offen",
    nextStep: "Refeeding-Sicherheitscheck",
    assessment: {
      weight: 52.4,
      height: 174,
      weight1m: 57.8,
      weight3m: 61.2,
      intakePercent: 18,
      intakeDays: 11,
      proteinPercent: 20,
      fluidMl: 800,
      appetite: "kaum vorhanden",
      swallowing: "unauffällig",
      muscleReduced: "yes",
      inflammation: "unknown",
      edema: false,
      ascites: false,
      amputation: { present: false, label: "Keine Amputation", percent: 0, bilateral: false },
      notes: "Sicherheitsprüfung vor Therapieeskalation erforderlich.",
    },
  }),
  makePatient({
    id: "P-001238",
    patientNumber: "1002387",
    firstName: "Eva",
    lastName: "Koch",
    birthDate: "1957-02-21",
    sex: "weiblich",
    station: "4C Onkologie",
    room: "21",
    admissionDate: "2026-08-01",
    dischargeDate: "2026-08-12",
    priority: 86,
    consultStatus: "Assessment",
    caseStatus: "Daten ergänzen",
    scenario: "Onkologie",
    screening: 4,
    reason: "Tumorerkrankung · Muskelstatus offen",
    nextStep: "Muskelstatus erheben",
    assessment: {
      weight: 61,
      height: 168,
      weight1m: 63.5,
      weight3m: 67,
      intakePercent: 55,
      intakeDays: 6,
      proteinPercent: 50,
      fluidMl: 1450,
      appetite: "vermindert",
      swallowing: "unauffällig",
      muscleReduced: "unknown",
      inflammation: "yes",
      edema: false,
      ascites: false,
      amputation: { present: false, label: "Keine Amputation", percent: 0, bilateral: false },
      notes: "Muskelstatus und funktionelle Einschränkungen im Patientenkontakt ergänzen.",
    },
  }),
  makePatient({
    id: "P-001231",
    patientNumber: "1002314",
    firstName: "Ali",
    lastName: "Demir",
    birthDate: "1968-09-09",
    sex: "männlich",
    station: "5A Chirurgie",
    room: "14",
    admissionDate: "2026-07-27",
    dischargeDate: "2026-08-08",
    priority: 78,
    consultStatus: "GLIM",
    caseStatus: "Bewertung bestätigen",
    scenario: "Amputation",
    screening: 3,
    reason: "Unterschenkelamputation · BMI-Korrektur",
    nextStep: "Berechnungsbasis bestätigen",
    assessment: {
      weight: 79.5,
      height: 181,
      weight1m: 81,
      weight3m: 84,
      intakePercent: 70,
      intakeDays: 4,
      proteinPercent: 65,
      fluidMl: 1800,
      appetite: "leicht vermindert",
      swallowing: "unauffällig",
      muscleReduced: "unknown",
      inflammation: "yes",
      edema: false,
      ascites: false,
      amputation: { present: true, label: "Unterschenkel inkl. Fuß", percent: 5.9, bilateral: false },
      notes: "Beobachtetes Gewicht und Segmentkorrektur transparent dokumentieren.",
    },
  }),
  makePatient({
    id: "P-001219",
    patientNumber: "1002193",
    firstName: "Petra",
    lastName: "Lang",
    birthDate: "1952-05-16",
    sex: "weiblich",
    station: "3B Geriatrie",
    room: "17",
    admissionDate: "2026-07-30",
    dischargeDate: "2026-08-06",
    priority: 72,
    consultStatus: "Monitoring",
    caseStatus: "Verlauf heute",
    scenario: "Dysphagie",
    screening: 4,
    reason: "Kostform angepasst · Verträglichkeit prüfen",
    nextStep: "Verlauf dokumentieren",
    assessment: {
      weight: 63.2,
      height: 158,
      weight1m: 64,
      weight3m: 67.5,
      intakePercent: 62,
      intakeDays: 5,
      proteinPercent: 58,
      fluidMl: 1300,
      appetite: "wechselnd",
      swallowing: "Kostform angepasst",
      muscleReduced: "yes",
      inflammation: "no",
      edema: false,
      ascites: false,
      amputation: { present: false, label: "Keine Amputation", percent: 0, bilateral: false },
      notes: "Verträglichkeit und tatsächliche Aufnahme heute evaluieren.",
    },
    therapy: {
      energyGoal: 1700,
      proteinGoal: 76,
      fluidGoal: 1600,
      measures: "Konsistenzadaptierte Kost, proteinreiche Zwischenmahlzeiten, Trinkmenge begleiten.",
      nextReview: "2026-08-04",
      confirmed: true,
    },
  }),
  makePatient({
    id: "P-001211",
    patientNumber: "1002115",
    firstName: "Jürgen",
    lastName: "Wolf",
    birthDate: "1961-01-30",
    sex: "männlich",
    station: "6B Neurologie",
    room: "04",
    admissionDate: "2026-07-31",
    priority: 70,
    consultStatus: "Therapie",
    caseStatus: "Maßnahmen abstimmen",
    scenario: "Dysphagie",
    screening: 4,
    reason: "Schlaganfall · Schluckstörung",
    nextStep: "Therapieplan bestätigen",
    assessment: {
      weight: 76.8,
      height: 178,
      weight1m: 78,
      weight3m: 80,
      intakePercent: 48,
      intakeDays: 5,
      proteinPercent: 42,
      fluidMl: 1250,
      appetite: "vermindert",
      swallowing: "Dysphagie bestätigt",
      muscleReduced: "no",
      inflammation: "yes",
      edema: false,
      ascites: false,
      amputation: { present: false, label: "Keine Amputation", percent: 0, bilateral: false },
      notes: "Abstimmung mit Logopädie und Pflege erforderlich.",
    },
  }),
  makePatient({
    id: "P-001203",
    patientNumber: "1002039",
    firstName: "Lena",
    lastName: "Müller",
    birthDate: "1955-07-07",
    sex: "weiblich",
    station: "4C Onkologie",
    room: "09",
    admissionDate: "2026-07-23",
    dischargeDate: "2026-08-05",
    priority: 64,
    consultStatus: "Entlassung",
    caseStatus: "Bericht prüfen",
    scenario: "Homecare",
    screening: 3,
    reason: "Ambulante Weiterbetreuung vorbereiten",
    nextStep: "Entlassungsbericht freigeben",
    assessment: {
      weight: 56.7,
      height: 165,
      weight1m: 57.4,
      weight3m: 61.2,
      intakePercent: 68,
      intakeDays: 4,
      proteinPercent: 62,
      fluidMl: 1500,
      appetite: "verbessert",
      swallowing: "unauffällig",
      muscleReduced: "yes",
      inflammation: "yes",
      edema: false,
      ascites: false,
      amputation: { present: false, label: "Keine Amputation", percent: 0, bilateral: false },
      notes: "Ambulante ernährungstherapeutische Weiterbetreuung einplanen.",
    },
    therapy: {
      energyGoal: 1750,
      proteinGoal: 74,
      fluidGoal: 1700,
      measures: "Energie- und proteinangereicherte Kost, Trinknahrung nach Verträglichkeit, ambulante Verlaufskontrolle.",
      nextReview: "2026-08-12",
      confirmed: true,
    },
  }),
  makePatient({
    id: "P-001198",
    patientNumber: "1001982",
    firstName: "Sabine",
    lastName: "Krämer",
    birthDate: "1971-12-02",
    sex: "weiblich",
    station: "2A Innere",
    room: "19",
    admissionDate: "2026-07-29",
    priority: 58,
    consultStatus: "Dokumentation",
    caseStatus: "Clinical Note offen",
    scenario: "Adipositas + Mangelernährung",
    screening: 3,
    reason: "Hoher BMI · signifikanter Gewichtsverlust",
    nextStep: "Dokumentation prüfen",
    assessment: {
      weight: 93.4,
      height: 164,
      weight1m: 96,
      weight3m: 104.5,
      intakePercent: 45,
      intakeDays: 7,
      proteinPercent: 40,
      fluidMl: 1600,
      appetite: "deutlich vermindert",
      swallowing: "unauffällig",
      muscleReduced: "yes",
      inflammation: "yes",
      edema: false,
      ascites: false,
      amputation: { present: false, label: "Keine Amputation", percent: 0, bilateral: false },
      notes: "Gewichtsverlust trotz erhöhtem BMI in der Beurteilung sichtbar halten.",
    },
  }),
];

function makePatient(input) {
  const now = new Date().toISOString();
  const base = {
    id: `P-${Date.now()}`,
    patientNumber: "",
    firstName: "",
    lastName: "",
    birthDate: "",
    sex: "divers",
    station: "",
    room: "",
    admissionDate: isoDate(),
    dischargeDate: "",
    priority: 50,
    consultStatus: "Neu",
    caseStatus: "Konsil prüfen",
    scenario: "Neuaufnahme",
    screening: "",
    reason: "",
    nextStep: "Assessment beginnen",
    assessment: {
      weight: "",
      height: "",
      weight1m: "",
      weight3m: "",
      intakePercent: "",
      intakeDays: "",
      proteinPercent: "",
      fluidMl: "",
      appetite: "nicht erhoben",
      swallowing: "nicht erhoben",
      muscleReduced: "unknown",
      inflammation: "unknown",
      edema: false,
      ascites: false,
      amputation: { present: false, label: "Keine Amputation", percent: 0, bilateral: false },
      notes: "",
    },
    glim: { confirmed: false, confirmedAt: "", severity: "noch offen" },
    therapy: {
      energyGoal: "",
      proteinGoal: "",
      fluidGoal: "",
      measures: "",
      nextReview: "",
      confirmed: false,
    },
    discharge: { recommendations: "", completed: false, completedAt: "" },
    timeline: [
      {
        id: `E-${Date.now()}`,
        date: isoDate(),
        time: currentTime(),
        type: "Konsil",
        title: "Ernährungsmedizinisches Konsil angelegt",
        text: "Fall wurde in NutriPilot aufgenommen.",
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  const merged = {
    ...base,
    ...input,
    assessment: { ...base.assessment, ...(input.assessment || {}) },
    glim: { ...base.glim, ...(input.glim || {}) },
    therapy: { ...base.therapy, ...(input.therapy || {}) },
    discharge: { ...base.discharge, ...(input.discharge || {}) },
  };

  if (!input.timeline) {
    merged.timeline = [
      {
        id: `E-${merged.id}-1`,
        date: merged.admissionDate || isoDate(),
        time: "09:00",
        type: "Konsil",
        title: "Konsil eingegangen",
        text: merged.reason || "Ernährungsfachliche Einschätzung angefordert.",
      },
      {
        id: `E-${merged.id}-2`,
        date: isoDate(),
        time: "08:15",
        type: "Arbeitsvorrat",
        title: merged.nextStep,
        text: "NutriPilot hat den nächsten Arbeitsschritt vorbereitet.",
      },
    ];
  }
  return merged;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isoDate(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function currentTime() {
  return new Date().toTimeString().slice(0, 5);
}

function formatDate(value) {
  if (!value) return "–";
  return new Intl.DateTimeFormat("de-DE").format(new Date(`${value}T12:00:00`));
}

function ageFromBirthDate(value) {
  if (!value) return "–";
  const birth = new Date(`${value}T12:00:00`);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
  if (beforeBirthday) age -= 1;
  return age;
}

function fullName(patient) {
  return `${patient.firstName} ${patient.lastName}`.trim();
}

function initials(patient) {
  return `${patient.firstName?.[0] || ""}${patient.lastName?.[0] || ""}`.toUpperCase();
}

function number(value) {
  const parsed = Number(String(value).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function assessmentMetrics(patient) {
  const a = patient.assessment;
  const observedWeight = number(a.weight);
  const heightM = number(a.height) / 100;
  const segmentPercent = a.amputation?.present
    ? number(a.amputation.percent) * (a.amputation.bilateral ? 2 : 1)
    : 0;
  const correctedWeight = segmentPercent > 0 && segmentPercent < 100
    ? observedWeight / (1 - segmentPercent / 100)
    : observedWeight;
  const observedBmi = observedWeight > 0 && heightM > 0 ? observedWeight / heightM ** 2 : 0;
  const correctedBmi = correctedWeight > 0 && heightM > 0 ? correctedWeight / heightM ** 2 : 0;
  const historicWeight = number(a.weight3m) || number(a.weight1m);
  const weightLoss = historicWeight > 0 && observedWeight > 0
    ? ((historicWeight - observedWeight) / historicWeight) * 100
    : 0;
  return { observedWeight, correctedWeight, observedBmi, correctedBmi, weightLoss, segmentPercent };
}

function glimEvaluation(patient) {
  const a = patient.assessment;
  const m = assessmentMetrics(patient);
  const bmiValue = a.amputation?.present ? m.correctedBmi : m.observedBmi;
  const phenotypic = [
    {
      label: "Gewichtsverlust",
      state: m.weightLoss >= 5 ? "yes" : m.weightLoss > 0 ? "no" : "open",
      value: m.weightLoss > 0 ? `${m.weightLoss.toFixed(1)} %` : "nicht beurteilbar",
      source: "Assessment · Gewichtsverlauf",
    },
    {
      label: "Niedriger BMI",
      state: bmiValue > 0 ? (bmiValue < 20 ? "yes" : "no") : "open",
      value: bmiValue > 0 ? `${bmiValue.toFixed(1)} kg/m²` : "nicht beurteilbar",
      source: a.amputation?.present ? "korrigierte Berechnungsbasis" : "beobachtetes Gewicht",
    },
    {
      label: "Reduzierte Muskelmasse",
      state: a.muscleReduced === "yes" ? "yes" : a.muscleReduced === "no" ? "no" : "open",
      value: answerLabel(a.muscleReduced),
      source: "Assessment · Muskelstatus",
    },
  ];
  const etiologic = [
    {
      label: "Reduzierte Aufnahme",
      state: number(a.intakePercent) > 0 ? (number(a.intakePercent) < 50 ? "yes" : "no") : "open",
      value: number(a.intakePercent) > 0 ? `${number(a.intakePercent)} %` : "nicht erhoben",
      source: "Assessment · Nahrungsaufnahme",
    },
    {
      label: "Entzündung / Krankheitslast",
      state: a.inflammation === "yes" ? "yes" : a.inflammation === "no" ? "no" : "open",
      value: answerLabel(a.inflammation),
      source: "Assessment · klinischer Kontext",
    },
  ];
  const phenotypeYes = phenotypic.some((item) => item.state === "yes");
  const etiologyYes = etiologic.some((item) => item.state === "yes");
  const hasOpen = [...phenotypic, ...etiologic].some((item) => item.state === "open");

  let status = "Kein vollständiger Nachweis";
  let tone = "neutral";
  let explanation = "Die derzeit dokumentierten Kriterien ergeben noch keine vollständige Kriterienkombination.";
  if (phenotypeYes && etiologyYes) {
    status = "Fachliche Bestätigung erforderlich";
    tone = "positive";
    explanation = "Mindestens ein phänotypisches und ein ätiologisches Kriterium sind im Demo-Regelwerk erfüllt.";
  } else if (hasOpen) {
    status = "Daten unvollständig";
    tone = "warning";
    explanation = "Mindestens ein entscheidungsrelevantes Kriterium ist noch nicht beurteilbar.";
  }
  return { phenotypic, etiologic, phenotypeYes, etiologyYes, status, tone, explanation };
}

function answerLabel(value) {
  if (value === "yes") return "ja";
  if (value === "no") return "nein";
  return "offen";
}

function App() {
  const [patients, setPatients] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : clone(DEMO_PATIENTS);
    } catch {
      return clone(DEMO_PATIENTS);
    }
  });
  const [view, setView] = useState("today");
  const [activePatientId, setActivePatientId] = useState(null);
  const [workspaceTab, setWorkspaceTab] = useState("overview");
  const [query, setQuery] = useState("");
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
  }, [patients]);

  const activePatient = patients.find((patient) => patient.id === activePatientId) || null;

  function notify(message) {
    setToast(message);
    window.clearTimeout(window.__nutriToast);
    window.__nutriToast = window.setTimeout(() => setToast(""), 2200);
  }

  function navigate(nextView) {
    setView(nextView);
    if (nextView !== "workspace") setActivePatientId(null);
  }

  function openPatient(patient, tab = "overview") {
    setActivePatientId(patient.id);
    setWorkspaceTab(tab);
    setView("workspace");
  }

  function updatePatient(patientId, updater, message) {
    setPatients((current) =>
      current.map((patient) => {
        if (patient.id !== patientId) return patient;
        const next = typeof updater === "function" ? updater(clone(patient)) : { ...patient, ...updater };
        next.updatedAt = new Date().toISOString();
        return next;
      })
    );
    if (message) notify(message);
  }

  function createPatient(form) {
    const id = `P-${Date.now()}`;
    const patient = makePatient({
      id,
      patientNumber: form.patientNumber || `NP-${String(Date.now()).slice(-6)}`,
      firstName: form.firstName,
      lastName: form.lastName,
      birthDate: form.birthDate,
      sex: form.sex,
      station: form.station,
      room: form.room,
      admissionDate: form.admissionDate,
      dischargeDate: form.dischargeDate,
      reason: form.reason,
      screening: form.screening,
      priority: form.priority,
      scenario: form.scenario || "Neuaufnahme",
      consultStatus: "Neu",
      caseStatus: "Konsil prüfen",
      nextStep: "Assessment beginnen",
    });
    setPatients((current) => [patient, ...current]);
    setShowNewPatient(false);
    setActivePatientId(patient.id);
    setWorkspaceTab("overview");
    setView("workspace");
    notify("Patient und Konsil wurden angelegt");
  }

  function resetDemoData() {
    if (!window.confirm("Alle lokal erfassten Änderungen und neuen Testpatienten löschen?")) return;
    setPatients(clone(DEMO_PATIENTS));
    navigate("today");
    notify("Demo-Daten wurden zurückgesetzt");
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(patients, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `nutripilot-export-${isoDate()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    notify("Lokaler Datenexport erstellt");
  }

  return (
    <div className="app-shell">
      <Sidebar view={view} navigate={navigate} />
      <div className="app-main">
        <Topbar
          view={view}
          query={query}
          setQuery={setQuery}
          onAdd={() => setShowNewPatient(true)}
          onExport={exportData}
        />
        <div className="safety-banner">
          <ShieldCheck size={15} />
          <span><b>Testbetrieb:</b> Daten werden nur in diesem Browser gespeichert. Keine echten Patientendaten eingeben.</span>
          <button onClick={resetDemoData}><RefreshCcw size={14} /> Demo zurücksetzen</button>
        </div>
        <main className="content">
          {view === "today" && <TodayDashboard patients={patients} openPatient={openPatient} onAdd={() => setShowNewPatient(true)} />}
          {view === "consults" && <ConsultsView patients={patients} openPatient={openPatient} query={query} />}
          {view === "patients" && <PatientsView patients={patients} openPatient={openPatient} query={query} onAdd={() => setShowNewPatient(true)} />}
          {view === "search" && <SearchView patients={patients} openPatient={openPatient} query={query} setQuery={setQuery} />}
          {view === "workspace" && activePatient && (
            <PatientWorkspace
              patient={activePatient}
              tab={workspaceTab}
              setTab={setWorkspaceTab}
              back={() => navigate("today")}
              updatePatient={updatePatient}
              notify={notify}
            />
          )}
        </main>
      </div>
      {showNewPatient && <NewPatientDialog onClose={() => setShowNewPatient(false)} onCreate={createPatient} />}
      {toast && <div className="toast"><Check size={16} /> {toast}</div>}
    </div>
  );
}

function Sidebar({ view, navigate }) {
  const items = [
    ["today", CalendarDays, "Mein Arbeitstag"],
    ["consults", ClipboardList, "Konsile"],
    ["patients", Users, "Ernährungsfälle"],
    ["search", Search, "Suche"],
  ];
  return (
    <aside className="sidebar">
      <button className="brand" onClick={() => navigate("today")}>
        <span className="brand-mark">N</span>
        <span><b>NutriPilot</b><small>Clinical Nutrition</small></span>
      </button>
      <nav>
        {items.map(([id, Icon, label]) => (
          <button key={id} className={`nav-item ${view === id ? "active" : ""}`} onClick={() => navigate(id)}>
            <Icon size={19} /><span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-spacer" />
      <div className="version-card">
        <Sparkles size={16} />
        <div><b>NutriPilot {APP_VERSION}</b><span>Lokale Arbeitsversion</span></div>
      </div>
      <div className="profile-card">
        <span className="profile-avatar">LB</span>
        <div><b>Laura Becker</b><span>Ernährungsfachkraft</span></div>
      </div>
    </aside>
  );
}

function Topbar({ view, query, setQuery, onAdd, onExport }) {
  const titleMap = {
    today: "Mein Arbeitstag",
    consults: "Konsile",
    patients: "Ernährungsfälle",
    search: "Suche",
    workspace: "Clinical Nutrition Workspace",
  };
  return (
    <header className="topbar">
      <div>
        <h1>{titleMap[view]}</h1>
        <p>Arbeitsvorrat, Entscheidungen und Verlauf in einem klinischen Workspace.</p>
      </div>
      <div className="top-actions">
        <label className="global-search">
          <Search size={16} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Patient, Station oder Konsil" />
        </label>
        <button className="icon-button" onClick={onExport} title="Lokale Daten exportieren"><Download size={18} /></button>
        <button className="icon-button" title="Benachrichtigungen"><Bell size={18} /></button>
        <button className="primary-button" onClick={onAdd}><Plus size={17} /> Neuer Patient</button>
      </div>
    </header>
  );
}

function TodayDashboard({ patients, openPatient, onAdd }) {
  const active = [...patients].filter((patient) => !patient.discharge.completed).sort((a, b) => b.priority - a.priority);
  const urgent = active.filter((patient) => patient.priority >= 85);
  const monitoring = active.filter((patient) => patient.consultStatus === "Monitoring");
  const discharge = active.filter((patient) => patient.consultStatus === "Entlassung");
  const focus = active[0];

  return (
    <div className="dashboard-grid">
      <section className="dashboard-main">
        <div className="welcome-card">
          <div>
            <span className="eyebrow">Dienstag · 4. August 2026</span>
            <h2>Guten Morgen, Laura.</h2>
            <p>NutriPilot zeigt nicht alle Daten gleichzeitig, sondern die nächsten klinischen Arbeitsschritte.</p>
            <div className="welcome-actions">
              <button className="primary-button" onClick={() => focus && openPatient(focus)}><Sparkles size={17} /> Wichtigsten Fall öffnen</button>
              <button className="secondary-button" onClick={onAdd}><Plus size={17} /> Patient aufnehmen</button>
            </div>
          </div>
          {focus && (
            <button className="focus-card" onClick={() => openPatient(focus)}>
              <span className="focus-label">Jetzt zuerst</span>
              <div className="patient-line"><Avatar patient={focus} /><div><b>{fullName(focus)}</b><span>{focus.station} · Zimmer {focus.room}</span></div></div>
              <p>{focus.reason}</p>
              <div className="focus-next"><span>{focus.nextStep}</span><ChevronRight size={17} /></div>
            </button>
          )}
        </div>

        <div className="metric-grid">
          <MetricCard icon={ClipboardList} value={active.length} label="aktive Fälle" note="gesamter Arbeitsvorrat" />
          <MetricCard icon={AlertTriangle} value={urgent.length} label="hohe Aufmerksamkeit" note="Priorität ab 85" tone="danger" />
          <MetricCard icon={Activity} value={monitoring.length} label="Verläufe heute" note="Monitoring fällig" tone="blue" />
          <MetricCard icon={FileText} value={discharge.length} label="Entlassungen" note="Abschluss vorbereiten" tone="green" />
        </div>

        <section className="panel worklist-panel">
          <div className="panel-heading">
            <div><span className="eyebrow">Arbeitsvorrat</span><h3>Nach Handlungsbedarf sortiert</h3></div>
            <span className="soft-badge"><Filter size={14} /> Automatisch priorisiert</span>
          </div>
          <div className="worklist">
            {active.slice(0, 6).map((patient, index) => (
              <WorkItem key={patient.id} patient={patient} rank={index + 1} onClick={() => openPatient(patient)} />
            ))}
          </div>
        </section>
      </section>

      <aside className="dashboard-rail">
        <section className="panel copilot-card">
          <div className="copilot-title"><span><Sparkles size={18} /></span><div><b>NutriPilot Fokus</b><small>transparent begründet</small></div></div>
          {urgent.slice(0, 3).map((patient) => (
            <button className="copilot-task" key={patient.id} onClick={() => openPatient(patient)}>
              <span className="task-dot danger" />
              <div><b>{fullName(patient)}</b><span>{patient.nextStep}</span></div>
              <ChevronRight size={15} />
            </button>
          ))}
          {!urgent.length && <p className="empty-copy">Keine hoch priorisierten Fälle.</p>}
        </section>
        <section className="panel schedule-card">
          <div className="panel-heading compact"><div><span className="eyebrow">Heute</span><h3>Arbeitsblöcke</h3></div><Clock3 size={18} /></div>
          <ScheduleItem time="08:00" title="Neue Konsile prüfen" text={`${active.filter((p) => p.consultStatus === "Neu").length} offene Konsile`} />
          <ScheduleItem time="10:30" title="Patientenkontakte" text="Assessment und Verlauf" />
          <ScheduleItem time="13:00" title="Therapieabstimmung" text="interprofessionelle Rückfragen" />
          <ScheduleItem time="15:00" title="Dokumentation" text="Entlassungen und Clinical Notes" />
        </section>
      </aside>
    </div>
  );
}

function ConsultsView({ patients, openPatient, query }) {
  const filtered = filterPatients(patients, query);
  return (
    <section className="panel list-page">
      <div className="page-intro">
        <div><span className="eyebrow">Konsil-Workspace</span><h2>Eingehende Aufträge verstehen und starten</h2><p>Vorhandene Informationen, Lücken und der nächste Schritt bleiben in einer Arbeitsliste zusammen.</p></div>
        <span className="count-pill">{filtered.length} Konsile</span>
      </div>
      <div className="consult-table">
        <div className="table-header"><span>Priorität</span><span>Patient</span><span>Kontext</span><span>Status</span><span>Nächster Schritt</span><span /></div>
        {filtered.map((patient) => (
          <button className="table-row" key={patient.id} onClick={() => openPatient(patient)}>
            <span><PriorityBadge value={patient.priority} /></span>
            <span className="table-patient"><Avatar patient={patient} /><span><b>{fullName(patient)}</b><small>{patient.patientNumber} · {ageFromBirthDate(patient.birthDate)} Jahre</small></span></span>
            <span><b>{patient.station}</b><small>{patient.reason}</small></span>
            <span><StatusBadge status={patient.consultStatus} /></span>
            <span><b>{patient.nextStep}</b><small>{patient.caseStatus}</small></span>
            <span><ChevronRight size={18} /></span>
          </button>
        ))}
      </div>
    </section>
  );
}

function PatientsView({ patients, openPatient, query, onAdd }) {
  const filtered = filterPatients(patients, query);
  return (
    <div>
      <div className="page-intro standalone">
        <div><span className="eyebrow">Clinical Nutrition Workspace</span><h2>Aktive und abgeschlossene Ernährungsfälle</h2><p>Ein Patient kann über den gesamten Aufenthalt hinweg in einem konsistenten Fall bearbeitet werden.</p></div>
        <button className="primary-button" onClick={onAdd}><Plus size={17} /> Neuer Patient</button>
      </div>
      <div className="patient-card-grid">
        {filtered.map((patient) => <PatientCard key={patient.id} patient={patient} onClick={() => openPatient(patient)} />)}
      </div>
    </div>
  );
}

function SearchView({ patients, openPatient, query, setQuery }) {
  const filtered = filterPatients(patients, query);
  return (
    <section className="search-page">
      <div className="search-hero">
        <Search size={25} />
        <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, Patientennummer, Station, Konsilgrund oder Status" />
      </div>
      <p className="result-count">{query ? `${filtered.length} Treffer` : "Alle Fälle"}</p>
      <div className="search-results">
        {filtered.map((patient) => (
          <button key={patient.id} className="search-result" onClick={() => openPatient(patient)}>
            <Avatar patient={patient} />
            <div><b>{fullName(patient)}</b><span>{patient.patientNumber} · {patient.station} · Zimmer {patient.room}</span><small>{patient.reason}</small></div>
            <StatusBadge status={patient.consultStatus} />
            <ChevronRight size={18} />
          </button>
        ))}
      </div>
    </section>
  );
}

function PatientWorkspace({ patient, tab, setTab, back, updatePatient, notify }) {
  const tabs = [
    ["overview", "Fallüberblick"],
    ["assessment", "Assessment"],
    ["glim", "GLIM"],
    ["therapy", "Therapie"],
    ["timeline", "Verlauf"],
    ["discharge", "Entlassung"],
  ];
  const metrics = assessmentMetrics(patient);

  return (
    <div className="workspace-page">
      <button className="back-link" onClick={back}><ArrowLeft size={16} /> Zurück zum Arbeitstag</button>
      <section className="patient-header">
        <Avatar patient={patient} large />
        <div className="patient-title">
          <span className="eyebrow">{patient.patientNumber} · {patient.scenario}</span>
          <h2>{fullName(patient)}, {ageFromBirthDate(patient.birthDate)} Jahre</h2>
          <p><Hospital size={14} /> {patient.station} · Zimmer {patient.room} <span /> Aufnahme {formatDate(patient.admissionDate)}</p>
        </div>
        <div className="patient-header-actions"><StatusBadge status={patient.consultStatus} /><button className="icon-button"><MoreHorizontal size={18} /></button></div>
      </section>

      <nav className="workspace-tabs">
        {tabs.map(([id, label]) => <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}>{label}</button>)}
      </nav>

      <div className="workspace-layout">
        <section className="workspace-content">
          {tab === "overview" && <CaseOverview patient={patient} metrics={metrics} setTab={setTab} />}
          {tab === "assessment" && <AssessmentEditor patient={patient} updatePatient={updatePatient} setTab={setTab} />}
          {tab === "glim" && <GlimWorkspace patient={patient} updatePatient={updatePatient} />}
          {tab === "therapy" && <TherapyWorkspace patient={patient} updatePatient={updatePatient} notify={notify} />}
          {tab === "timeline" && <TimelineWorkspace patient={patient} updatePatient={updatePatient} />}
          {tab === "discharge" && <DischargeWorkspace patient={patient} updatePatient={updatePatient} />}
        </section>
        <aside className="workspace-aside"><CopilotPanel patient={patient} tab={tab} metrics={metrics} setTab={setTab} /></aside>
      </div>
    </div>
  );
}

function CaseOverview({ patient, metrics, setTab }) {
  const glim = glimEvaluation(patient);
  const completeness = assessmentCompleteness(patient);
  return (
    <div className="stack">
      <section className="panel overview-hero">
        <div className="overview-copy">
          <span className="eyebrow">Aktueller Ernährungsfall</span>
          <h2>{patient.reason}</h2>
          <p>Alle relevanten Informationen, Entscheidungen und offenen Schritte werden im selben Fall fortgeschrieben.</p>
        </div>
        <div className="next-action-card">
          <span>Nächster sinnvoller Schritt</span>
          <b>{patient.nextStep}</b>
          <button className="primary-button" onClick={() => setTab(nextTabForPatient(patient))}>Jetzt bearbeiten <ChevronRight size={16} /></button>
        </div>
      </section>

      <div className="summary-grid">
        <SummaryCard icon={ListChecks} label="Assessment" value={`${completeness}% vollständig`} note={completeness < 100 ? "Offene Daten gezielt ergänzen" : "Datenkern vollständig"} />
        <SummaryCard icon={Scale} label="Gewicht / BMI" value={metrics.observedWeight ? `${metrics.observedWeight.toFixed(1)} kg · ${metrics.observedBmi.toFixed(1)}` : "noch offen"} note={patient.assessment.amputation?.present ? `Korrigierter BMI ${metrics.correctedBmi.toFixed(1)}` : "beobachtete Berechnungsbasis"} />
        <SummaryCard icon={BadgeCheck} label="GLIM" value={patient.glim.confirmed ? "fachlich bestätigt" : glim.status} note={patient.glim.confirmed ? `Schweregrad: ${patient.glim.severity}` : "Datengrundlage nachvollziehbar"} />
        <SummaryCard icon={Utensils} label="Therapie" value={patient.therapy.confirmed ? "Plan aktiv" : "Entscheidung offen"} note={patient.therapy.nextReview ? `Kontrolle ${formatDate(patient.therapy.nextReview)}` : "Kontrollzeitpunkt festlegen"} />
      </div>

      <section className="panel patient-story">
        <div className="panel-heading"><div><span className="eyebrow">In 30 Sekunden erfassbar</span><h3>Klinische Zusammenfassung</h3></div><StatusBadge status={patient.caseStatus} /></div>
        <div className="story-grid">
          <StoryBlock title="Bekannt" items={[`NRS-2002: ${patient.screening || "offen"}`, patient.assessment.weight ? `Gewicht ${patient.assessment.weight} kg` : "Gewicht fehlt", patient.assessment.height ? `Größe ${patient.assessment.height} cm` : "Größe fehlt", `Aufnahme ${patient.assessment.intakePercent || "offen"} %`]} tone="positive" />
          <StoryBlock title="Noch zu klären" items={missingAssessmentItems(patient)} tone="warning" />
          <StoryBlock title="Aktive Entscheidung" items={[patient.nextStep, patient.therapy.confirmed ? "Therapieplan aktiv" : "Therapieentscheidung offen", patient.dischargeDate ? `Entlassung geplant: ${formatDate(patient.dischargeDate)}` : "Entlassdatum nicht bekannt"]} tone="neutral" />
        </div>
      </section>
    </div>
  );
}

function AssessmentEditor({ patient, updatePatient, setTab }) {
  const a = patient.assessment;
  const metrics = assessmentMetrics(patient);
  const setAssessment = (patch) => updatePatient(patient.id, (draft) => {
    draft.assessment = { ...draft.assessment, ...patch };
    draft.consultStatus = "Assessment";
    draft.caseStatus = "Daten werden ergänzt";
    draft.nextStep = "Assessment vervollständigen";
    return draft;
  });

  const setAmputation = (patch) => setAssessment({ amputation: { ...a.amputation, ...patch } });

  return (
    <div className="stack">
      <section className="panel form-panel">
        <div className="panel-heading">
          <div><span className="eyebrow">Zentraler Datenkern</span><h2>Assessment</h2><p>Einmal erfassen, danach für GLIM, Therapie, Verlauf und Dokumentation weiterverwenden.</p></div>
          <CompletenessRing value={assessmentCompleteness(patient)} />
        </div>

        <FormSection title="Anthropometrie" icon={Scale} description="Beobachtete Werte und transparente Korrekturen">
          <div className="form-grid three">
            <Field label="Aktuelles Gewicht (kg)"><input type="number" step="0.1" value={a.weight} onChange={(e) => setAssessment({ weight: e.target.value })} /></Field>
            <Field label="Körpergröße (cm)"><input type="number" value={a.height} onChange={(e) => setAssessment({ height: e.target.value })} /></Field>
            <ReadOnlyMetric label="Beobachteter BMI" value={metrics.observedBmi ? metrics.observedBmi.toFixed(1) : "–"} />
            <Field label="Gewicht vor 1 Monat (kg)"><input type="number" step="0.1" value={a.weight1m} onChange={(e) => setAssessment({ weight1m: e.target.value })} /></Field>
            <Field label="Gewicht vor 3 Monaten (kg)"><input type="number" step="0.1" value={a.weight3m} onChange={(e) => setAssessment({ weight3m: e.target.value })} /></Field>
            <ReadOnlyMetric label="Gewichtsverlust" value={metrics.weightLoss ? `${metrics.weightLoss.toFixed(1)} %` : "–"} />
          </div>

          <div className="amputation-box">
            <label className="switch-line"><input type="checkbox" checked={Boolean(a.amputation?.present)} onChange={(e) => setAmputation({ present: e.target.checked })} /><span><b>Amputation / fehlendes Körpersegment berücksichtigen</b><small>Die Berechnungsbasis bleibt sichtbar und muss fachlich bestätigt werden.</small></span></label>
            {a.amputation?.present && (
              <div className="form-grid three inset-form">
                <Field label="Segment"><select value={a.amputation.label} onChange={(e) => { const segment = AMPUTATION_SEGMENTS.find((item) => item.label === e.target.value); setAmputation({ label: segment.label, percent: segment.percent }); }}>{AMPUTATION_SEGMENTS.slice(1).map((item) => <option key={item.label}>{item.label}</option>)}</select></Field>
                <Field label="Ausprägung"><select value={a.amputation.bilateral ? "bilateral" : "einseitig"} onChange={(e) => setAmputation({ bilateral: e.target.value === "bilateral" })}><option value="einseitig">einseitig</option><option value="bilateral">beidseitig</option></select></Field>
                <ReadOnlyMetric label="Segmentanteil" value={`${metrics.segmentPercent.toFixed(1)} %`} />
                <ReadOnlyMetric label="Korrigiertes Gewicht" value={metrics.correctedWeight ? `${metrics.correctedWeight.toFixed(1)} kg` : "–"} />
                <ReadOnlyMetric label="Korrigierter BMI" value={metrics.correctedBmi ? metrics.correctedBmi.toFixed(1) : "–"} />
                <div className="calculation-note"><b>Rechenweg</b><span>{metrics.observedWeight.toFixed(1)} kg ÷ (1 − {metrics.segmentPercent.toFixed(1)} %) = {metrics.correctedWeight.toFixed(1)} kg</span></div>
              </div>
            )}
          </div>
        </FormSection>

        <FormSection title="Aufnahme" icon={Utensils} description="Aktuelle Energie-, Protein- und Flüssigkeitsaufnahme">
          <div className="form-grid three">
            <Field label="Nahrungsaufnahme (%)"><input type="number" min="0" max="100" value={a.intakePercent} onChange={(e) => setAssessment({ intakePercent: e.target.value })} /></Field>
            <Field label="Dauer der Einschränkung (Tage)"><input type="number" min="0" value={a.intakeDays} onChange={(e) => setAssessment({ intakeDays: e.target.value })} /></Field>
            <Field label="Proteinaufnahme (%)"><input type="number" min="0" max="100" value={a.proteinPercent} onChange={(e) => setAssessment({ proteinPercent: e.target.value })} /></Field>
            <Field label="Flüssigkeit (ml/Tag)"><input type="number" min="0" value={a.fluidMl} onChange={(e) => setAssessment({ fluidMl: e.target.value })} /></Field>
            <Field label="Appetit"><select value={a.appetite} onChange={(e) => setAssessment({ appetite: e.target.value })}><option>nicht erhoben</option><option>gut</option><option>leicht vermindert</option><option>vermindert</option><option>deutlich vermindert</option><option>kaum vorhanden</option><option>verbessert</option><option>wechselnd</option></select></Field>
            <Field label="Schlucken / Kostform"><input value={a.swallowing} onChange={(e) => setAssessment({ swallowing: e.target.value })} /></Field>
          </div>
        </FormSection>

        <FormSection title="Klinische Einordnung" icon={Stethoscope} description="Nur fachlich bestätigte Informationen übernehmen">
          <div className="form-grid two">
            <Field label="Reduzierte Muskelmasse"><select value={a.muscleReduced} onChange={(e) => setAssessment({ muscleReduced: e.target.value })}><option value="unknown">noch offen</option><option value="yes">ja</option><option value="no">nein</option></select></Field>
            <Field label="Entzündung / Krankheitslast"><select value={a.inflammation} onChange={(e) => setAssessment({ inflammation: e.target.value })}><option value="unknown">noch offen</option><option value="yes">ja</option><option value="no">nein</option></select></Field>
            <label className="check-card"><input type="checkbox" checked={Boolean(a.edema)} onChange={(e) => setAssessment({ edema: e.target.checked })} /><span><b>Ödeme vorhanden</b><small>Gewichtsinterpretation prüfen</small></span></label>
            <label className="check-card"><input type="checkbox" checked={Boolean(a.ascites)} onChange={(e) => setAssessment({ ascites: e.target.checked })} /><span><b>Aszites vorhanden</b><small>Gewichtsinterpretation prüfen</small></span></label>
          </div>
          <Field label="Ernährungsfachliche Notiz"><textarea value={a.notes} onChange={(e) => setAssessment({ notes: e.target.value })} placeholder="Beobachtungen, Datenherkunft und offene Fragen" /></Field>
        </FormSection>

        <div className="form-footer">
          <span><Save size={15} /> Änderungen werden automatisch lokal gespeichert.</span>
          <button className="primary-button" onClick={() => setTab("glim")}>GLIM-Auswertung öffnen <ChevronRight size={16} /></button>
        </div>
      </section>
    </div>
  );
}

function GlimWorkspace({ patient, updatePatient }) {
  const evaluation = glimEvaluation(patient);
  function confirm() {
    updatePatient(patient.id, (draft) => {
      draft.glim.confirmed = true;
      draft.glim.confirmedAt = new Date().toISOString();
      draft.consultStatus = "Therapie";
      draft.caseStatus = "Therapie planen";
      draft.nextStep = "Therapieplan festlegen";
      draft.timeline.unshift({ id: `E-${Date.now()}`, date: isoDate(), time: currentTime(), type: "GLIM", title: "GLIM-Bewertung fachlich bestätigt", text: `Schweregrad: ${draft.glim.severity}.` });
      return draft;
    }, "GLIM-Bewertung wurde bestätigt");
  }
  return (
    <div className="stack">
      <section className="panel diagnostic-panel">
        <div className="diagnostic-header">
          <div><span className="eyebrow">Automatisch vorbereitet · fachlich zu bestätigen</span><h2>GLIM-Bewertung</h2><p>NutriPilot verwendet ausschließlich den aktuellen Assessmentstand und zeigt die Herkunft jedes Kriteriums.</p></div>
          <div className={`evaluation-card ${evaluation.tone}`}><span>Prüfstatus</span><b>{patient.glim.confirmed ? "Bestätigt" : evaluation.status}</b><small>{patient.glim.confirmedAt ? `am ${new Date(patient.glim.confirmedAt).toLocaleString("de-DE")}` : "keine autonome Diagnose"}</small></div>
        </div>
        <div className="rule-warning"><AlertTriangle size={17} /><div><b>Demo-Regelwerk, noch nicht klinisch freigegeben</b><span>Schwellenwerte und Schweregrade müssen vor einem klinischen Einsatz leitlinienbasiert validiert werden.</span></div></div>
        <div className="criteria-grid">
          <CriteriaCard title="Phänotypische Kriterien" items={evaluation.phenotypic} />
          <CriteriaCard title="Ätiologische Kriterien" items={evaluation.etiologic} />
        </div>
        <div className={`evaluation-summary ${evaluation.tone}`}>
          <div><BadgeCheck size={22} /><span><b>{evaluation.status}</b><small>{evaluation.explanation}</small></span></div>
          <label>Schweregrad<select value={patient.glim.severity} onChange={(e) => updatePatient(patient.id, (draft) => { draft.glim.severity = e.target.value; return draft; })}><option>noch offen</option><option>moderat</option><option>schwer</option></select></label>
          <button className="primary-button" disabled={!evaluation.phenotypeYes || !evaluation.etiologyYes} onClick={confirm}>{patient.glim.confirmed ? <><Check size={16} /> Bestätigt</> : "Fachlich bestätigen"}</button>
        </div>
      </section>
    </div>
  );
}

function TherapyWorkspace({ patient, updatePatient }) {
  const t = patient.therapy;
  const metrics = assessmentMetrics(patient);
  const weightBasis = patient.assessment.amputation?.present ? metrics.correctedWeight : metrics.observedWeight;
  const setTherapy = (patch) => updatePatient(patient.id, (draft) => {
    draft.therapy = { ...draft.therapy, ...patch };
    draft.consultStatus = "Therapie";
    draft.caseStatus = "Therapieentscheidung offen";
    draft.nextStep = "Therapieplan bestätigen";
    return draft;
  });
  function adoptDemoSuggestion() {
    if (!weightBasis) return;
    setTherapy({
      energyGoal: Math.round((weightBasis * 30) / 50) * 50,
      proteinGoal: Math.round(weightBasis * 1.2),
      fluidGoal: Math.round((weightBasis * 30) / 50) * 50,
      measures: t.measures || "Energie- und proteinangepasste Kostform; orale Ergänzung nach Verträglichkeit; Aufnahme und Zielerreichung im Verlauf prüfen.",
      nextReview: t.nextReview || isoDate(new Date(Date.now() + 2 * 86400000)),
    });
  }
  function confirmPlan() {
    updatePatient(patient.id, (draft) => {
      draft.therapy.confirmed = true;
      draft.consultStatus = "Monitoring";
      draft.caseStatus = "Therapie aktiv";
      draft.nextStep = "Verlauf kontrollieren";
      draft.timeline.unshift({ id: `E-${Date.now()}`, date: isoDate(), time: currentTime(), type: "Therapie", title: "Therapieplan bestätigt", text: draft.therapy.measures || "Therapiemaßnahmen wurden festgelegt." });
      return draft;
    }, "Therapieplan wurde aktiviert");
  }
  return (
    <section className="panel therapy-panel">
      <div className="therapy-header">
        <div><span className="eyebrow">Vorschlag statt Autopilot</span><h2>Therapieplanung</h2><p>NutriPilot bereitet Parameter und Dokumentation vor. Die Entscheidung bleibt vollständig bei der Fachkraft.</p></div>
        <div className="therapy-state"><span>Status</span><b>{t.confirmed ? "Plan aktiv" : "Entscheidung offen"}</b><small>Gewichtsbasis: {weightBasis ? `${weightBasis.toFixed(1)} kg` : "offen"}</small></div>
      </div>
      <div className="suggestion-strip"><Sparkles size={18} /><div><b>Demovorschlag vorbereiten</b><span>Rechnerischer Platzhalter, nicht klinisch freigegeben. Jeder Wert bleibt änderbar.</span></div><button className="secondary-button" onClick={adoptDemoSuggestion}>Vorschlag übernehmen</button></div>
      <div className="form-grid three therapy-fields">
        <Field label="Energieziel (kcal/Tag)"><input type="number" value={t.energyGoal} onChange={(e) => setTherapy({ energyGoal: e.target.value })} /></Field>
        <Field label="Proteinziel (g/Tag)"><input type="number" value={t.proteinGoal} onChange={(e) => setTherapy({ proteinGoal: e.target.value })} /></Field>
        <Field label="Flüssigkeitsziel (ml/Tag)"><input type="number" value={t.fluidGoal} onChange={(e) => setTherapy({ fluidGoal: e.target.value })} /></Field>
      </div>
      <Field label="Ziele und Maßnahmen"><textarea value={t.measures} onChange={(e) => setTherapy({ measures: e.target.value })} placeholder="Konkrete, überprüfbare Maßnahmen formulieren" /></Field>
      <div className="form-grid two">
        <Field label="Nächste Verlaufskontrolle"><input type="date" value={t.nextReview} onChange={(e) => setTherapy({ nextReview: e.target.value })} /></Field>
        <div className="source-card"><BookOpen size={18} /><div><b>Transparenz</b><span>Vor klinischem Einsatz werden hier freigegebene Regelwerke und Quellen je Vorschlag angezeigt.</span></div></div>
      </div>
      <div className="form-footer"><span>{t.confirmed ? "Änderungen am aktiven Plan werden nachvollziehbar fortgeschrieben." : "Plan erst nach fachlicher Prüfung aktivieren."}</span><button className="primary-button" disabled={!t.energyGoal || !t.proteinGoal || !t.measures} onClick={confirmPlan}>{t.confirmed ? "Änderungen bestätigen" : "Therapieplan bestätigen"}</button></div>
    </section>
  );
}

function TimelineWorkspace({ patient, updatePatient }) {
  const [entry, setEntry] = useState({ type: "Verlauf", weight: "", intake: "", text: "" });
  function addEntry(event) {
    event.preventDefault();
    if (!entry.text.trim()) return;
    updatePatient(patient.id, (draft) => {
      draft.timeline.unshift({
        id: `E-${Date.now()}`,
        date: isoDate(),
        time: currentTime(),
        type: entry.type,
        title: entry.type === "Verlauf" ? "Verlaufskontrolle dokumentiert" : entry.type,
        text: `${entry.text}${entry.weight ? ` · Gewicht ${entry.weight} kg` : ""}${entry.intake ? ` · Aufnahme ${entry.intake} %` : ""}`,
      });
      if (entry.weight) draft.assessment.weight = entry.weight;
      if (entry.intake) draft.assessment.intakePercent = entry.intake;
      draft.caseStatus = "Verlauf aktualisiert";
      draft.nextStep = draft.dischargeDate ? "Entlassung vorbereiten" : "Nächste Kontrolle planen";
      return draft;
    }, "Verlaufseintrag wurde gespeichert");
    setEntry({ type: "Verlauf", weight: "", intake: "", text: "" });
  }
  return (
    <div className="timeline-layout">
      <section className="panel timeline-panel">
        <div className="panel-heading"><div><span className="eyebrow">Clinical Timeline</span><h2>Was hat sich wann verändert?</h2><p>Messwerte, Entscheidungen und Maßnahmen erscheinen in einem gemeinsamen Verlauf.</p></div><Activity size={22} /></div>
        <div className="timeline-list">
          {patient.timeline.map((item) => (
            <div className="timeline-event" key={item.id}>
              <div className="timeline-date"><b>{formatDate(item.date)}</b><span>{item.time}</span></div>
              <div className="timeline-marker"><i /></div>
              <div className="timeline-copy"><span>{item.type}</span><b>{item.title}</b><p>{item.text}</p></div>
            </div>
          ))}
        </div>
      </section>
      <form className="panel quick-entry" onSubmit={addEntry}>
        <span className="eyebrow">Neuer Verlaufseintrag</span><h3>Nur die Veränderung dokumentieren</h3>
        <Field label="Ereignistyp"><select value={entry.type} onChange={(e) => setEntry({ ...entry, type: e.target.value })}><option>Verlauf</option><option>Patientenkontakt</option><option>Therapieänderung</option><option>Teamabstimmung</option><option>Dokumentation</option></select></Field>
        <div className="form-grid two"><Field label="Gewicht (optional)"><input type="number" step="0.1" value={entry.weight} onChange={(e) => setEntry({ ...entry, weight: e.target.value })} /></Field><Field label="Aufnahme % (optional)"><input type="number" value={entry.intake} onChange={(e) => setEntry({ ...entry, intake: e.target.value })} /></Field></div>
        <Field label="Beobachtung / Entscheidung"><textarea required value={entry.text} onChange={(e) => setEntry({ ...entry, text: e.target.value })} placeholder="Was hat sich verändert und was folgt daraus?" /></Field>
        <button className="primary-button full" type="submit"><Plus size={16} /> Verlauf speichern</button>
      </form>
    </div>
  );
}

function DischargeWorkspace({ patient, updatePatient }) {
  const metrics = assessmentMetrics(patient);
  const d = patient.discharge;
  const summary = `Bei ${fullName(patient)} erfolgte die ernährungsfachliche Betreuung aufgrund von ${patient.reason.toLowerCase()}. Der letzte dokumentierte Ernährungsstatus umfasst ein Gewicht von ${patient.assessment.weight || "–"} kg${metrics.observedBmi ? ` (BMI ${metrics.observedBmi.toFixed(1)} kg/m²)` : ""}. Die zuletzt dokumentierte Nahrungsaufnahme beträgt ${patient.assessment.intakePercent || "–"} %. ${patient.therapy.confirmed ? `Aktiver Therapieplan: ${patient.therapy.measures}` : "Ein abschließend bestätigter Therapieplan liegt noch nicht vor."}`;
  function complete() {
    updatePatient(patient.id, (draft) => {
      draft.discharge.completed = true;
      draft.discharge.completedAt = new Date().toISOString();
      draft.consultStatus = "Abgeschlossen";
      draft.caseStatus = "Ernährungsfall abgeschlossen";
      draft.nextStep = "Keine offene Aufgabe";
      draft.timeline.unshift({ id: `E-${Date.now()}`, date: isoDate(), time: currentTime(), type: "Entlassung", title: "Ernährungsfall abgeschlossen", text: draft.discharge.recommendations || "Entlassungsinformationen wurden fachlich bestätigt." });
      return draft;
    }, "Ernährungsfall wurde abgeschlossen");
  }
  return (
    <div className="discharge-layout">
      <section className="panel discharge-check">
        <div className="panel-heading"><div><span className="eyebrow">Abschluss-Workspace</span><h2>Entlassung sicher vorbereiten</h2><p>NutriPilot fasst den strukturierten Fall zusammen und macht fehlende Abschlussinformationen sichtbar.</p></div><FileText size={23} /></div>
        <ChecklistItem done={Boolean(patient.assessment.weight)} title="Aktueller Ernährungsstatus" text="Gewicht und Aufnahme dokumentiert" />
        <ChecklistItem done={patient.glim.confirmed} title="Fachliche Bewertung" text="GLIM-Bewertung bestätigt" />
        <ChecklistItem done={patient.therapy.confirmed} title="Aktive Maßnahmen" text="Therapieplan fachlich bestätigt" />
        <ChecklistItem done={Boolean(d.recommendations)} title="Weiterbehandlung" text="Empfehlungen und Nachsorge formuliert" />
        <Field label="Empfehlungen und offene Ziele"><textarea value={d.recommendations} onChange={(e) => updatePatient(patient.id, (draft) => { draft.discharge.recommendations = e.target.value; return draft; })} placeholder="Was muss nach der Entlassung weitergeführt oder kontrolliert werden?" /></Field>
        <div className="form-footer"><span>{patient.dischargeDate ? `Geplante Entlassung: ${formatDate(patient.dischargeDate)}` : "Entlassdatum nicht hinterlegt"}</span><button className="primary-button" disabled={!d.recommendations || !patient.therapy.confirmed} onClick={complete}>{d.completed ? <><Check size={16} /> Abgeschlossen</> : "Fall abschließen"}</button></div>
      </section>
      <section className="document-preview">
        <div className="document-toolbar"><span>Automatisch erzeugte Clinical Note</span><button className="secondary-button" onClick={() => window.print()}><Download size={15} /> Drucken / PDF</button></div>
        <article className="clinical-note">
          <div className="note-header"><div><b>NutriPilot</b><span>Clinical Nutrition</span></div><div><b>{fullName(patient)}</b><span>{patient.patientNumber}</span></div></div>
          <h1>Ernährungsmedizinische Abschlussinformation</h1>
          <p className="note-meta">Station {patient.station} · Aufnahme {formatDate(patient.admissionDate)} · Entlassung {formatDate(patient.dischargeDate)}</p>
          <h3>Zusammenfassung</h3><p>{summary}</p>
          <h3>Weiterbehandlung und Empfehlungen</h3><p>{d.recommendations || "Noch nicht ergänzt."}</p>
          <h3>Nachvollziehbarkeit</h3><p>Diese Vorschau wurde aus den strukturierten Assessment-, Therapie- und Verlaufsdaten vorbereitet und muss vor Übernahme fachlich geprüft werden.</p>
          <div className="signature-line"><span>Laura Becker · Ernährungsfachkraft</span><small>{d.completedAt ? new Date(d.completedAt).toLocaleString("de-DE") : "noch nicht freigegeben"}</small></div>
        </article>
      </section>
    </div>
  );
}

function CopilotPanel({ patient, tab, metrics, setTab }) {
  const completeness = assessmentCompleteness(patient);
  const evaluation = glimEvaluation(patient);
  const messages = {
    overview: { title: patient.nextStep, text: `Der Fall ist zu ${completeness} % strukturiert erfasst. NutriPilot zeigt zuerst die fehlenden entscheidungsrelevanten Daten.` },
    assessment: { title: completeness === 100 ? "Assessment prüfbereit" : "Assessment gezielt ergänzen", text: missingAssessmentItems(patient).join(" · ") || "Keine offensichtliche Datenlücke im MVP-Datensatz." },
    glim: { title: evaluation.status, text: evaluation.explanation },
    therapy: { title: patient.therapy.confirmed ? "Therapieplan aktiv" : "Fachliche Entscheidung offen", text: "Vorschläge bleiben transparent, änderbar und werden nicht autonom aktiviert." },
    timeline: { title: "Veränderung statt Wiederholung", text: "Dokumentiere nur neue Beobachtungen, Entscheidungen und deren Konsequenzen." },
    discharge: { title: patient.discharge.completed ? "Fall abgeschlossen" : "Abschluss vorbereiten", text: "Die Clinical Note entsteht aus den bereits bestätigten strukturierten Daten." },
  };
  const message = messages[tab];
  return (
    <section className="panel copilot-panel">
      <div className="copilot-title"><span><Sparkles size={18} /></span><div><b>NutriPilot Copilot</b><small>kontextbezogen, nicht autonom</small></div></div>
      <div className="copilot-highlight"><span>Jetzt relevant</span><b>{message.title}</b><p>{message.text}</p></div>
      <div className="copilot-facts">
        <Fact label="Assessment" value={`${completeness}%`} />
        <Fact label="Gewichtsverlust" value={metrics.weightLoss ? `${metrics.weightLoss.toFixed(1)} %` : "offen"} />
        <Fact label="GLIM" value={patient.glim.confirmed ? "bestätigt" : "offen"} />
        <Fact label="Therapie" value={patient.therapy.confirmed ? "aktiv" : "offen"} />
      </div>
      {tab === "overview" && <button className="secondary-button full" onClick={() => setTab(nextTabForPatient(patient))}>Nächsten Schritt öffnen <ChevronRight size={15} /></button>}
      <div className="copilot-safety"><ShieldCheck size={15} /><span>Keine autonome Diagnose oder Therapie. Jede klinische Entscheidung wird bestätigt.</span></div>
    </section>
  );
}

function NewPatientDialog({ onClose, onCreate }) {
  const [form, setForm] = useState({
    patientNumber: "",
    firstName: "",
    lastName: "",
    birthDate: "",
    sex: "weiblich",
    station: "",
    room: "",
    admissionDate: isoDate(),
    dischargeDate: "",
    reason: "",
    screening: "",
    priority: 70,
    scenario: "Neuaufnahme",
  });
  function update(key, value) { setForm((current) => ({ ...current, [key]: value })); }
  function submit(event) {
    event.preventDefault();
    onCreate({ ...form, priority: number(form.priority), screening: form.screening === "" ? "" : number(form.screening) });
  }
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form className="modal" onSubmit={submit}>
        <div className="modal-header"><div><span className="eyebrow">Patientenaufnahme</span><h2>Neuen Ernährungsfall anlegen</h2><p>Patient, Behandlungskontext und Konsilanlass werden gemeinsam aufgenommen.</p></div><button type="button" className="icon-button" onClick={onClose}><X size={19} /></button></div>
        <div className="modal-scroll">
          <FormSection title="Patient" icon={UserRound} description="Für die öffentliche Demo ausschließlich fiktive Daten verwenden">
            <div className="form-grid two">
              <Field label="Vorname *"><input required value={form.firstName} onChange={(e) => update("firstName", e.target.value)} /></Field>
              <Field label="Nachname *"><input required value={form.lastName} onChange={(e) => update("lastName", e.target.value)} /></Field>
              <Field label="Geburtsdatum *"><input required type="date" value={form.birthDate} onChange={(e) => update("birthDate", e.target.value)} /></Field>
              <Field label="Geschlecht"><select value={form.sex} onChange={(e) => update("sex", e.target.value)}><option>weiblich</option><option>männlich</option><option>divers</option><option>keine Angabe</option></select></Field>
              <Field label="Patientennummer"><input value={form.patientNumber} onChange={(e) => update("patientNumber", e.target.value)} placeholder="wird sonst automatisch erzeugt" /></Field>
            </div>
          </FormSection>
          <FormSection title="Aufenthalt" icon={Hospital} description="Aktueller klinischer Kontext">
            <div className="form-grid two">
              <Field label="Station *"><input required value={form.station} onChange={(e) => update("station", e.target.value)} placeholder="z. B. 3B Geriatrie" /></Field>
              <Field label="Zimmer"><input value={form.room} onChange={(e) => update("room", e.target.value)} /></Field>
              <Field label="Aufnahmedatum"><input type="date" value={form.admissionDate} onChange={(e) => update("admissionDate", e.target.value)} /></Field>
              <Field label="Geplante Entlassung"><input type="date" value={form.dischargeDate} onChange={(e) => update("dischargeDate", e.target.value)} /></Field>
            </div>
          </FormSection>
          <FormSection title="Konsil" icon={ClipboardList} description="Warum braucht dieser Patient ernährungsfachliche Aufmerksamkeit?">
            <Field label="Konsilanlass *"><textarea required value={form.reason} onChange={(e) => update("reason", e.target.value)} placeholder="Screening, klinischer Anlass und konkrete Fragestellung" /></Field>
            <div className="form-grid three">
              <Field label="NRS-2002"><input type="number" min="0" max="7" value={form.screening} onChange={(e) => update("screening", e.target.value)} /></Field>
              <Field label="Priorität"><select value={form.priority} onChange={(e) => update("priority", e.target.value)}><option value="50">normal</option><option value="70">heute</option><option value="85">hoch</option><option value="95">sofort prüfen</option></select></Field>
              <Field label="Kontext"><select value={form.scenario} onChange={(e) => update("scenario", e.target.value)}><option>Neuaufnahme</option><option>Geriatrie</option><option>Onkologie</option><option>Refeeding</option><option>Dysphagie</option><option>Amputation</option><option>Homecare</option></select></Field>
            </div>
          </FormSection>
        </div>
        <div className="modal-footer"><span><ShieldCheck size={15} /> Nur fiktive Testdaten</span><div><button type="button" className="secondary-button" onClick={onClose}>Abbrechen</button><button type="submit" className="primary-button"><Plus size={16} /> Patient und Konsil anlegen</button></div></div>
      </form>
    </div>
  );
}

function filterPatients(patients, query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return patients;
  return patients.filter((patient) => [fullName(patient), patient.patientNumber, patient.station, patient.room, patient.reason, patient.consultStatus, patient.caseStatus, patient.scenario].join(" ").toLowerCase().includes(normalized));
}

function assessmentCompleteness(patient) {
  const a = patient.assessment;
  const required = [a.weight, a.height, a.weight3m || a.weight1m, a.intakePercent, a.intakeDays, a.appetite !== "nicht erhoben" ? a.appetite : "", a.swallowing !== "nicht erhoben" ? a.swallowing : "", a.muscleReduced !== "unknown" ? a.muscleReduced : "", a.inflammation !== "unknown" ? a.inflammation : ""];
  return Math.round((required.filter((value) => value !== "" && value !== null && value !== undefined).length / required.length) * 100);
}

function missingAssessmentItems(patient) {
  const a = patient.assessment;
  const items = [];
  if (!a.weight || !a.height) items.push("Gewicht und Größe ergänzen");
  if (!a.weight3m && !a.weight1m) items.push("Gewichtsverlauf erheben");
  if (!a.intakePercent) items.push("Aufnahme quantifizieren");
  if (a.muscleReduced === "unknown") items.push("Muskelstatus einordnen");
  if (a.inflammation === "unknown") items.push("Entzündung / Krankheitslast einordnen");
  return items.length ? items : ["Keine offensichtliche Datenlücke"];
}

function nextTabForPatient(patient) {
  if (assessmentCompleteness(patient) < 100) return "assessment";
  if (!patient.glim.confirmed) return "glim";
  if (!patient.therapy.confirmed) return "therapy";
  if (patient.consultStatus === "Entlassung" || patient.dischargeDate) return "discharge";
  return "timeline";
}

function Avatar({ patient, large = false }) { return <span className={`patient-avatar ${large ? "large" : ""}`}>{initials(patient)}</span>; }
function MetricCard({ icon: Icon, value, label, note, tone = "default" }) { return <div className={`metric-card ${tone}`}><span className="metric-icon"><Icon size={20} /></span><div><b>{value}</b><span>{label}</span><small>{note}</small></div></div>; }
function SummaryCard({ icon: Icon, label, value, note }) { return <div className="summary-card"><span><Icon size={19} /></span><small>{label}</small><b>{value}</b><p>{note}</p></div>; }
function ScheduleItem({ time, title, text }) { return <div className="schedule-item"><b>{time}</b><span><strong>{title}</strong><small>{text}</small></span></div>; }
function WorkItem({ patient, rank, onClick }) { return <button className="work-item" onClick={onClick}><span className="work-rank">{rank}</span><Avatar patient={patient} /><span className="work-patient"><b>{fullName(patient)}</b><small>{patient.station} · Zimmer {patient.room}</small></span><span className="work-reason"><b>{patient.reason}</b><small>{patient.caseStatus}</small></span><StatusBadge status={patient.consultStatus} /><span className="work-next">{patient.nextStep}<ChevronRight size={16} /></span></button>; }
function PatientCard({ patient, onClick }) { return <button className="patient-card" onClick={onClick}><div className="patient-card-top"><Avatar patient={patient} /><PriorityBadge value={patient.priority} /></div><span className="eyebrow">{patient.scenario}</span><h3>{fullName(patient)}</h3><p>{patient.station} · Zimmer {patient.room}</p><div className="patient-card-reason">{patient.reason}</div><div className="patient-card-footer"><StatusBadge status={patient.consultStatus} /><span>{patient.nextStep}<ChevronRight size={15} /></span></div></button>; }
function PriorityBadge({ value }) { const tone = value >= 90 ? "critical" : value >= 80 ? "high" : value >= 65 ? "medium" : "normal"; return <span className={`priority-badge ${tone}`}>{value}</span>; }
function StatusBadge({ status }) { const key = String(status).toLowerCase().replaceAll(" ", "-"); return <span className={`status-badge status-${key}`}>{status}</span>; }
function Fact({ label, value }) { return <div className="fact-row"><span>{label}</span><b>{value}</b></div>; }
function Field({ label, children }) { return <label className="field"><span>{label}</span>{children}</label>; }
function ReadOnlyMetric({ label, value }) { return <div className="readonly-metric"><span>{label}</span><b>{value}</b><small>automatisch berechnet</small></div>; }
function FormSection({ title, icon: Icon, description, children }) { return <section className="form-section"><div className="form-section-title"><span><Icon size={18} /></span><div><h3>{title}</h3><p>{description}</p></div></div>{children}</section>; }
function CompletenessRing({ value }) { return <div className="completeness"><div style={{ "--value": `${value * 3.6}deg` }}><span>{value}%</span></div><small>Assessment</small></div>; }
function StoryBlock({ title, items, tone }) { return <div className={`story-block ${tone}`}><h4>{title}</h4>{items.map((item) => <div key={item}><Check size={14} /><span>{item}</span></div>)}</div>; }
function CriteriaCard({ title, items }) { return <section className="criteria-card"><h3>{title}</h3>{items.map((item) => <div className="criterion" key={item.label}><span className={`criterion-state ${item.state}`}>{item.state === "yes" ? "✓" : item.state === "no" ? "–" : "?"}</span><div><b>{item.label}</b><strong>{item.value}</strong><small>{item.source}</small></div></div>)}</section>; }
function ChecklistItem({ done, title, text }) { return <div className={`checklist-item ${done ? "done" : "open"}`}><span>{done ? <Check size={16} /> : <Clock3 size={16} />}</span><div><b>{title}</b><small>{text}</small></div><strong>{done ? "bereit" : "offen"}</strong></div>; }

createRoot(document.getElementById("root")).render(<App />);
