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
  ExternalLink,
  FileText,
  Filter,
  HeartPulse,
  Home,
  Hospital,
  Info,
  LayoutGrid,
  ListChecks,
  Calculator,
  Database,
  GitBranch,
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

const STORAGE_KEY = "nutripilot-v1.2-patients";
const LEGACY_STORAGE_KEYS = ["nutripilot-v1.1-patients", "nutripilot-v1-patients"];
const APP_VERSION = "v1.2 Explainable Therapy";


const GUIDELINES = {
  dgemGeriatrics2025: {
    id: "DGEM-GER-2025",
    title: "DGEM S3-Leitlinie Klinische Ernährung und Hydrierung im Alter",
    version: "2025",
    recommendation: "Empfehlungen 1–2 sowie 28 und 31",
    url: "https://www.dgem.de/sites/default/files/PDFs/Leitlinien/S3-Leitlinien/0701_AktErn-LL-2025-02-0119_Online-PDF_watermarked.pdf",
    note: "Orientierung: 30 kcal/kg/Tag, bei kranken älteren Personen häufig 27–30 kcal/kg/Tag. Protein mindestens 1,0 g/kg/Tag, bei Krankheit häufig 1,2–1,5 g/kg/Tag; immer individuell anpassen.",
    scope: "Ältere und geriatrische Personen; orale Ernährung und Trinknahrung.",
  },
  espenGeriatrics2022: {
    id: "ESPEN-GER-2022",
    title: "ESPEN practical guideline: Clinical nutrition and hydration in geriatrics",
    version: "2022",
    recommendation: "Recommendations 1–2",
    url: "https://www.espen.org/files/ESPEN-Guidelines/ESPEN_practical_guideline_Clinical_nutrition_and_hydration_in_geriatrics.pdf",
    note: "30 kcal/kg/Tag als allgemeiner Richtwert; mindestens 1,0 g Protein/kg/Tag. 1,2–1,5 g/kg/Tag werden bei akuter oder chronischer Krankheit häufig vorgeschlagen.",
    scope: "Ältere Personen in allen Versorgungssettings.",
  },
  espenCancer2021: {
    id: "ESPEN-ONK-2021",
    title: "ESPEN practical guideline: Clinical Nutrition in cancer",
    version: "2021",
    recommendation: "Recommendations B2-1 und B2-2",
    url: "https://www.espen.org/files/ESPEN-Guidelines/ESPEN-practical-guideline-clinical-nutrition-in-cancer.pdf",
    note: "Wenn nicht individuell gemessen: 25–30 kcal/kg/Tag; Protein über 1,0 g/kg/Tag und wenn möglich bis 1,5 g/kg/Tag.",
    scope: "Erwachsene Patientinnen und Patienten mit Tumorerkrankung.",
  },
  espenPolymorbid2024: {
    id: "ESPEN-POLY-2024",
    title: "ESPEN practical guideline: Nutritional support for polymorbid medical inpatients",
    version: "2024",
    recommendation: "Practical guideline",
    url: "https://www.espen.org/files/ESPEN-Guidelines/ESPEN-practical-guideline-Nutritional-support-for-polymorbid-medical-inpatients.pdf",
    note: "Unterstützt die individualisierte Ernährungstherapie bei polymorbiden internistischen Krankenhauspatienten und betont Verlaufskontrolle sowie Anpassung.",
    scope: "Polymorbide erwachsene internistische Krankenhauspatienten.",
  },
  niceNutrition2017: {
    id: "NICE-CG32-2017",
    title: "NICE CG32 – Nutrition support for adults",
    version: "zuletzt aktualisiert 2017",
    recommendation: "1.4.2, 1.4.6–1.4.8 und 1.6.6",
    url: "https://www.nice.org.uk/guidance/cg32/chapter/Recommendations",
    note: "Allgemeine Orientierung 25–35 kcal/kg/Tag, 0,8–1,5 g Protein/kg/Tag und 30–35 ml Flüssigkeit/kg/Tag; enthält explizite Kriterien für ein hohes Refeeding-Risiko.",
    scope: "Erwachsene mit Mangelernährung oder Risiko für Mangelernährung.",
  },
};

const LOCAL_RULES = {
  safetyGate: {
    id: "NP-SAFETY-01",
    title: "NutriPilot Sicherheitsgate",
    note: "Quantitative Übernahme wird blockiert, wenn Gewichtsbasis, Refeeding-Sicherheit oder sichere orale Zufuhr nicht ausreichend geklärt sind.",
  },
  oralFirst: {
    id: "NP-ORAL-01",
    title: "Orale Ernährung zuerst, sofern sicher und realistisch",
    note: "Kostform, Anreicherung, Zwischenmahlzeiten, Unterstützung und Präferenzen werden vor einer Eskalation strukturiert geprüft.",
  },
  deficitEscalation: {
    id: "NP-STEP-01",
    title: "Stufenlogik bei Bedarfsunterdeckung",
    note: "Bei voraussichtlich unzureichender oraler Zielerreichung werden ergänzende Trinknahrung und anschließend eine interprofessionelle Eskalationsprüfung vorgeschlagen.",
  },
};

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
      renalStatus: "unknown",
      liverStatus: "unknown",
      cardiacStatus: "unknown",
      fluidRestriction: false,
      allergies: "",
      potassiumStatus: "unknown",
      phosphateStatus: "unknown",
      magnesiumStatus: "unknown",
      alcoholRisk: false,
      highRiskMedication: false,
      swallowPlanConfirmed: false,
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
      monitoringPlan: "",
      weightBasisConfirmed: false,
      recommendationStatus: "draft",
      recommendationReason: "",
      recommendationAlternative: "standard",
      recommendationGeneratedAt: "",
      recommendationAcceptedAt: "",
      confirmedAt: "",
      confirmedBy: "",
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

  if (merged.therapy.confirmed && merged.therapy.recommendationStatus === "draft") {
    merged.therapy.recommendationStatus = "confirmed";
    merged.therapy.confirmedAt = merged.therapy.confirmedAt || merged.updatedAt;
    merged.therapy.confirmedBy = merged.therapy.confirmedBy || "Ernährungsfachkraft";
  }

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

function roundTo(value, step = 5) {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value / step) * step;
}

function uniqueGuidelines(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function therapyRecommendation(patient, alternative = patient.therapy?.recommendationAlternative || "standard") {
  const a = patient.assessment || {};
  const metrics = assessmentMetrics(patient);
  const age = Number(ageFromBirthDate(patient.birthDate)) || 0;
  const weightBasis = a.amputation?.present ? metrics.correctedWeight : metrics.observedWeight;
  const bmi = a.amputation?.present ? metrics.correctedBmi : metrics.observedBmi;
  const intakePercent = number(a.intakePercent);
  const intakeDays = number(a.intakeDays);
  const scenario = String(patient.scenario || "").toLowerCase();
  const station = String(patient.station || "").toLowerCase();
  const swallowing = String(a.swallowing || "").toLowerCase();
  const labStates = [a.potassiumStatus, a.phosphateStatus, a.magnesiumStatus];
  const unknownLabs = labStates.some((value) => !value || value === "unknown");
  const lowLabs = labStates.some((value) => value === "low");

  const majorRefeedingCriteria = [
    { label: "BMI < 16 kg/m²", met: bmi > 0 && bmi < 16, actual: bmi > 0 ? bmi.toFixed(1) : "offen" },
    { label: "Gewichtsverlust > 15 % in 3–6 Monaten", met: metrics.weightLoss > 15, actual: `${metrics.weightLoss.toFixed(1)} %` },
    { label: "Kaum/keine Aufnahme > 10 Tage", met: intakeDays > 10 && intakePercent <= 10, actual: `${intakePercent || "offen"} % über ${intakeDays || "–"} Tage`, proxy: true },
    { label: "Kalium, Phosphat oder Magnesium erniedrigt", met: lowLabs, actual: lowLabs ? "mindestens ein Wert erniedrigt" : unknownLabs ? "nicht vollständig dokumentiert" : "kein erniedrigter Status dokumentiert" },
  ];
  const minorRefeedingCriteria = [
    { label: "BMI < 18,5 kg/m²", met: bmi > 0 && bmi < 18.5, actual: bmi > 0 ? bmi.toFixed(1) : "offen" },
    { label: "Gewichtsverlust > 10 % in 3–6 Monaten", met: metrics.weightLoss > 10, actual: `${metrics.weightLoss.toFixed(1)} %` },
    { label: "Sehr geringe Aufnahme > 5 Tage", met: intakeDays > 5 && intakePercent <= 25, actual: `${intakePercent || "offen"} % über ${intakeDays || "–"} Tage`, proxy: true },
    { label: "Alkoholanamnese oder relevante Medikation", met: Boolean(a.alcoholRisk || a.highRiskMedication), actual: a.alcoholRisk || a.highRiskMedication ? "ja" : "nein" },
  ];
  const majorRefeedingCount = majorRefeedingCriteria.filter((item) => item.met).length;
  const minorRefeedingCount = minorRefeedingCriteria.filter((item) => item.met).length;
  const refeedingRisk = scenario.includes("refeeding") || majorRefeedingCount >= 1 || minorRefeedingCount >= 2;

  const swallowUnclear = swallowing.includes("nicht sicher") || swallowing.includes("nicht erhoben") || swallowing.trim() === "";
  const dysphagia = swallowing.includes("dysphag") || swallowing.includes("kostform") || swallowing.includes("schluckstörung") || swallowing.includes("püriert");
  const swallowPlanReady = !dysphagia || swallowing.includes("kostform angepasst") || Boolean(a.swallowPlanConfirmed);

  const safetyChecks = [];
  safetyChecks.push({
    key: "weight",
    status: weightBasis > 0 ? "ok" : "block",
    title: "Verwendbare Gewichtsbasis",
    detail: weightBasis > 0 ? `${weightBasis.toFixed(1)} kg (${a.amputation?.present ? "segmentkorrigiert" : "beobachtet"})` : "Gewicht fehlt; quantitative Zielwerte sind nicht berechenbar.",
    source: "Assessment · Anthropometrie",
    action: weightBasis > 0 ? "keine" : "Gewicht beziehungsweise geeignete Ersatzgröße erfassen",
  });
  if (a.amputation?.present) {
    safetyChecks.push({
      key: "amputation",
      status: patient.therapy?.weightBasisConfirmed ? "ok" : "block",
      title: "Amputationskorrektur bestätigen",
      detail: patient.therapy?.weightBasisConfirmed
        ? `Korrigierte Gewichtsbasis ${metrics.correctedWeight.toFixed(1)} kg wurde fachlich bestätigt.`
        : `Segment ${a.amputation.label}, ${metrics.segmentPercent.toFixed(1)} %. Die Verwendung des korrigierten Gewichts muss bestätigt werden.`,
      source: "NutriPilot Berechnung · Segmentkorrektur",
      action: patient.therapy?.weightBasisConfirmed ? "keine" : "Rechenweg und Segment fachlich bestätigen",
    });
  }
  safetyChecks.push({
    key: "refeeding",
    status: refeedingRisk ? (unknownLabs || lowLabs ? "block" : "warning") : "ok",
    title: "Refeeding-Sicherheit",
    detail: refeedingRisk
      ? unknownLabs
        ? `Erhöhtes Risiko (${majorRefeedingCount} Haupt- / ${minorRefeedingCount} Nebenkriterien); Kalium, Phosphat und Magnesium sind nicht vollständig dokumentiert.`
        : lowLabs
          ? `Erhöhtes Risiko (${majorRefeedingCount} Haupt- / ${minorRefeedingCount} Nebenkriterien) und mindestens ein auffälliger Elektrolytstatus.`
          : `Erhöhtes Risiko (${majorRefeedingCount} Haupt- / ${minorRefeedingCount} Nebenkriterien); Elektrolytstatus dokumentiert, vorsichtiger Aufbau und enges Monitoring erforderlich.`
      : "Kein hohes Risiko aus den aktuell dokumentierten Kriterien abgeleitet.",
    source: "NICE CG32 · 1.4.6–1.4.8",
    action: refeedingRisk ? "interprofessionelle Refeeding-Steuerung und lokalen Standard anwenden" : "keine",
  });
  safetyChecks.push({
    key: "swallow",
    status: swallowUnclear || !swallowPlanReady ? "block" : dysphagia ? "warning" : "ok",
    title: "Sichere orale Zufuhr",
    detail: swallowUnclear
      ? "Schlucksicherheit ist nicht ausreichend geklärt."
      : !swallowPlanReady
        ? "Dysphagie ist dokumentiert, aber Kostform beziehungsweise Schluckplan ist noch nicht bestätigt."
        : dysphagia
          ? "Kostform/Schluckplan ist berücksichtigt und muss regelmäßig reevaluiert werden."
          : "Keine dokumentierte Einschränkung der Schlucksicherheit.",
    source: "Assessment · Schluckstatus / NICE CG32 · 1.6.6",
    action: swallowUnclear || !swallowPlanReady ? "Schlucksicherheit und Kostform klären" : "Verträglichkeit beobachten",
  });
  if (a.edema || a.ascites) {
    safetyChecks.push({
      key: "fluidweight",
      status: "warning",
      title: "Gewicht durch Flüssigkeit beeinflusst",
      detail: "Ödeme oder Aszites können Gewicht und Verlauf verfälschen; Trockengewicht beziehungsweise alternative Verlaufsparameter prüfen.",
      source: "Assessment · klinischer Volumenstatus",
      action: "Gewicht nicht isoliert als Verlaufskriterium verwenden",
    });
  }
  if (a.fluidRestriction || [a.renalStatus, a.cardiacStatus].includes("impaired")) {
    safetyChecks.push({
      key: "fluid",
      status: "warning",
      title: "Flüssigkeitsziel individualisieren",
      detail: "Eine Restriktion oder Organfunktionsstörung ist dokumentiert; kein automatisches Flüssigkeitsziel übernehmen.",
      source: "Assessment · Organ-/Volumenstatus",
      action: "Flüssigkeitsziel interprofessionell festlegen",
    });
  }
  if (a.renalStatus === "unknown" || a.liverStatus === "unknown") {
    safetyChecks.push({
      key: "organs",
      status: "warning",
      title: "Organfunktion noch nicht vollständig eingeordnet",
      detail: "Nieren- und/oder Leberfunktion fehlen als bestätigte Information. Protein- und Flüssigkeitsziele müssen klinisch gegengeprüft werden.",
      source: "Assessment · Therapiesicherheit",
      action: "Organfunktion prüfen oder bewusste fachliche Abweichung dokumentieren",
    });
  }

  const sources = [];
  let energyPerKg = [25, 35];
  let proteinPerKg = [0.8, 1.5];
  let ruleLabel = "Allgemeiner erwachsener Krankenhausfall";
  let ruleReason = "Kein spezifischer geriatrischer oder onkologischer Kontext wurde sicher erkannt; daher wird nur der breite allgemeine NICE-Korridor gezeigt.";
  let targetMode = "numeric";

  const isOncology = scenario.includes("onkologie") || station.includes("onkologie") || scenario.includes("tumor") || scenario.includes("cancer");
  const isGeriatric = age >= 65 || scenario.includes("geriatr") || scenario.includes("dysphag");

  if (isOncology) {
    energyPerKg = [25, 30];
    proteinPerKg = [1.0, 1.5];
    ruleLabel = "Onkologischer Kontext";
    ruleReason = "Tumorerkrankung beziehungsweise onkologischer Versorgungskontext ist dokumentiert.";
    sources.push(GUIDELINES.espenCancer2021);
  } else if (isGeriatric) {
    energyPerKg = [27, 30];
    const higherProteinNeed = a.inflammation === "yes" || a.muscleReduced === "yes" || metrics.weightLoss >= 5;
    proteinPerKg = higherProteinNeed ? [1.2, 1.5] : [1.0, 1.2];
    ruleLabel = "Älterer beziehungsweise geriatrischer Patient";
    ruleReason = higherProteinNeed
      ? "Alter plus Krankheitslast, reduzierte Muskelmasse oder relevanter Gewichtsverlust sprechen für den höheren Protein-Korridor."
      : "Alter beziehungsweise geriatrischer Kontext ist dokumentiert; derzeit kein bestätigtes Merkmal für den höheren Protein-Korridor.";
    sources.push(GUIDELINES.dgemGeriatrics2025, GUIDELINES.espenGeriatrics2022);
  } else {
    sources.push(GUIDELINES.niceNutrition2017, GUIDELINES.espenPolymorbid2024);
  }

  if (refeedingRisk || dysphagia) sources.push(GUIDELINES.niceNutrition2017);
  if (scenario.includes("adipositas") || bmi >= 30) {
    targetMode = "individual";
    ruleLabel = "Adipositas mit möglicher Mangelernährung";
    ruleReason = "Ein hoher BMI schließt Mangelernährung nicht aus; eine geeignete Berechnungsbasis muss individuell festgelegt werden.";
    safetyChecks.push({
      key: "obesity",
      status: "warning",
      title: "Keine scheinpräzise kg-basierte Automatik",
      detail: "Bei Adipositas und gleichzeitigem Mangelernährungsrisiko muss die geeignete Berechnungsbasis individuell festgelegt werden.",
      source: "NutriPilot Anwendungsgrenze",
      action: "Gewichtsbasis und Zielsetzung individuell dokumentieren",
    });
  }

  const blocked = safetyChecks.some((item) => item.status === "block");
  const warnings = safetyChecks.filter((item) => item.status === "warning");
  const fluidAutoAllowed = !a.fluidRestriction && a.renalStatus !== "impaired" && a.cardiacStatus !== "impaired";

  const targetValues = targetMode === "numeric" && weightBasis > 0 ? {
    energyLow: roundTo(weightBasis * energyPerKg[0], 25),
    energyHigh: roundTo(weightBasis * energyPerKg[1], 25),
    proteinLow: roundTo(weightBasis * proteinPerKg[0], 1),
    proteinHigh: roundTo(weightBasis * proteinPerKg[1], 1),
    fluidLow: fluidAutoAllowed ? roundTo(weightBasis * 30, 50) : null,
    fluidHigh: fluidAutoAllowed ? roundTo(weightBasis * 35, 50) : null,
  } : {
    energyLow: null,
    energyHigh: null,
    proteinLow: null,
    proteinHigh: null,
    fluidLow: null,
    fluidHigh: null,
  };

  const selected = {
    energy: targetValues.energyLow == null ? null : alternative === "vorsichtig" ? targetValues.energyLow : roundTo((targetValues.energyLow + targetValues.energyHigh) / 2, 25),
    protein: targetValues.proteinLow == null ? null : alternative === "protein" ? targetValues.proteinHigh : alternative === "vorsichtig" ? targetValues.proteinLow : roundTo((targetValues.proteinLow + targetValues.proteinHigh) / 2, 1),
    fluid: targetValues.fluidLow == null ? null : alternative === "vorsichtig" ? targetValues.fluidLow : roundTo((targetValues.fluidLow + targetValues.fluidHigh) / 2, 50),
  };

  const safetyMeasures = [];
  if (refeedingRisk) safetyMeasures.push("Refeeding-Risiko vor einer Steigerung interprofessionell absichern; Kalium, Phosphat und Magnesium dokumentieren und nach lokalem Standard überwachen.");
  if (swallowUnclear) safetyMeasures.push("Vor oraler Therapie Schlucksicherheit fachlich klären.");
  if (dysphagia && swallowPlanReady) safetyMeasures.push("Bestätigte Kostform und Flüssigkeitskonsistenz konsequent umsetzen; regelmäßige Re-Evaluation mit Logopädie/Pflege.");
  if (a.amputation?.present) safetyMeasures.push("Segmentkorrektur, Rechenweg und verwendete Gewichtsbasis in der Dokumentation sichtbar halten.");
  if (!safetyMeasures.length) safetyMeasures.push("Aktuelle Datenbasis und Verträglichkeit vor Aktivierung des Plans prüfen.");

  const oralMeasures = [];
  if (isGeriatric) oralMeasures.push("Orale Ernährung priorisieren: energie- und proteinangereicherte Mahlzeiten, kleine häufige Portionen und bedarfsgerechte Essunterstützung.");
  else oralMeasures.push("Kostform an Bedarf, Symptome, Präferenzen und tatsächliche Aufnahme anpassen; Energie- und Proteindichte gezielt erhöhen.");
  if (isOncology) oralMeasures.push("Ernährungsrelevante Symptome wie Übelkeit, frühe Sättigung, Geschmacksveränderungen oder Fatigue erfassen und Maßnahmen daran ausrichten.");
  if (dysphagia) oralMeasures.push("Nur die bestätigte dysphagiegerechte Kostform und Flüssigkeitskonsistenz verwenden.");
  if (intakePercent > 0 && intakePercent < 75) oralMeasures.push(`Die dokumentierte Aufnahme von ${intakePercent} % liegt unter dem vereinbarten Mindestziel; Anreicherung und Zwischenmahlzeiten priorisieren.`);

  const onsMeasures = [];
  if (intakePercent > 0 && intakePercent < 75) onsMeasures.push("Medizinische Trinknahrung ergänzend prüfen, wenn optimierte Mahlzeiten die Ernährungsziele voraussichtlich nicht erreichen und die orale Zufuhr sicher ist.");
  else onsMeasures.push("Trinknahrung nur bei absehbarer Bedarfsunterdeckung oder unzureichender Zielerreichung ergänzen.");
  if (isGeriatric && intakePercent > 0 && intakePercent < 75) onsMeasures.push("Menge individuell am geschätzten Energie- und Proteindefizit ausrichten; Akzeptanz und tatsächlich konsumierte Menge dokumentieren.");

  const escalationMeasures = [];
  if (intakePercent > 0 && intakePercent < 50) escalationMeasures.push("Wenn die orale Zielerreichung trotz Optimierung nicht realistisch ist, enterale Ernährung im Ernährungsteam und ärztlich prüfen.");
  else escalationMeasures.push("Bei ausbleibender Zielerreichung innerhalb des festgelegten Kontrollfensters Eskalationsbedarf neu bewerten.");
  escalationMeasures.push("Parenterale Ernährung, Elektrolytdosierungen und komplexe Intensivtherapie sind nicht Bestandteil der automatischen v1.2-Empfehlung.");

  const reviewDays = refeedingRisk || intakePercent < 50 ? 1 : 2;
  const monitoring = [
    { parameter: "Tatsächliche Energie- und Proteinaufnahme", interval: "täglich", trigger: "unter 75 % des vereinbarten Ziels" },
    { parameter: "Verträglichkeit / gastrointestinale Symptome", interval: "täglich", trigger: "neue oder zunehmende Beschwerden" },
    { parameter: "Gewicht beziehungsweise geeigneter Verlaufsparameter", interval: a.edema || a.ascites ? "individuell" : "2× pro Woche", trigger: "unerwartete Veränderung oder Flüssigkeitsverschiebung" },
    { parameter: "Therapie- und Zielerreichung", interval: `in ${reviewDays} Tag${reviewDays === 1 ? "" : "en"}`, trigger: "Ziel nicht erreichbar oder klinische Verschlechterung" },
  ];
  if (refeedingRisk) monitoring.unshift({ parameter: "Kalium, Phosphat, Magnesium und klinischer Status", interval: "engmaschig nach lokalem Refeeding-Standard", trigger: "Abfall, Symptome oder Volumenüberlastung" });
  if (dysphagia) monitoring.push({ parameter: "Schlucksicherheit und Akzeptanz der Kostform", interval: "regelmäßig bis stabil", trigger: "Husten, Verschlucken, reduzierte Aufnahme oder Atemwegsinfekt" });

  const evidence = [
    { domain: "Anthropometrie", label: "Gewichtsbasis", value: weightBasis > 0 ? `${weightBasis.toFixed(1)} kg${a.amputation?.present ? " korrigiert" : " beobachtet"}` : "offen", state: weightBasis > 0 ? "confirmed" : "open", source: a.amputation?.present ? "Assessment + Berechnung" : "Assessment", meaning: "Basis der kg-bezogenen Zielkorridore" },
    { domain: "Anthropometrie", label: "BMI", value: bmi > 0 ? `${bmi.toFixed(1)} kg/m²` : "offen", state: bmi > 0 ? (a.edema || a.ascites ? "warning" : "confirmed") : "open", source: "NutriPilot Berechnung", meaning: a.edema || a.ascites ? "durch Volumenstatus eingeschränkt interpretierbar" : "Teil der Risiko- und Plausibilitätsprüfung" },
    { domain: "Verlauf", label: "Gewichtsverlust", value: metrics.weightLoss > 0 ? `${metrics.weightLoss.toFixed(1)} %` : "nicht berechenbar", state: metrics.weightLoss > 0 ? "confirmed" : "open", source: "Assessment · aktuelles/3-Monats-Gewicht", meaning: metrics.weightLoss >= 5 ? "klinisch relevanter Verlust als Therapiesignal" : "derzeit kein deutlicher Verlust aus den Daten" },
    { domain: "Aufnahme", label: "Nahrungsaufnahme", value: intakePercent > 0 ? `${intakePercent} % über ${intakeDays || "–"} Tage` : "offen", state: intakePercent > 0 ? (intakePercent < 50 ? "warning" : "confirmed") : "open", source: "Assessment · Aufnahme", meaning: intakePercent > 0 && intakePercent < 75 ? "Bedarfsunterdeckung wahrscheinlich" : "Aufnahme nicht deutlich reduziert dokumentiert" },
    { domain: "Körperzusammensetzung", label: "Muskelstatus", value: answerLabel(a.muscleReduced), state: a.muscleReduced === "unknown" ? "open" : a.muscleReduced === "yes" ? "warning" : "confirmed", source: "Assessment · Muskelstatus", meaning: a.muscleReduced === "yes" ? "höheren Proteinbedarf fachlich prüfen" : "beeinflusst Protein-Korridor" },
    { domain: "Krankheitslast", label: "Entzündung", value: answerLabel(a.inflammation), state: a.inflammation === "unknown" ? "open" : a.inflammation === "yes" ? "warning" : "confirmed", source: "Assessment · klinischer Kontext", meaning: a.inflammation === "yes" ? "erhöhter Bedarf beziehungsweise Katabolie möglich" : "beeinflusst Protein-Korridor" },
    { domain: "Sicherheit", label: "Schluckstatus", value: a.swallowing || "offen", state: swallowUnclear || !swallowPlanReady ? "open" : dysphagia ? "warning" : "confirmed", source: "Assessment · Schlucken/Kostform", meaning: swallowUnclear || !swallowPlanReady ? "orale Empfehlung noch nicht sicher freigebbar" : "orale Zufuhr kann unter dokumentierten Bedingungen geplant werden" },
    { domain: "Sicherheit", label: "Refeeding", value: refeedingRisk ? `${majorRefeedingCount} Haupt- / ${minorRefeedingCount} Nebenkriterien` : "kein hohes Risiko abgeleitet", state: refeedingRisk ? (unknownLabs || lowLabs ? "open" : "warning") : "confirmed", source: "NICE CG32 + Assessment", meaning: refeedingRisk ? "Aufbau und Monitoring müssen gesondert gesteuert werden" : "kein Refeeding-Sicherheitsmodus aus den aktuellen Daten" },
    { domain: "Sicherheit", label: "Organ-/Volumenstatus", value: `${a.renalStatus || "unknown"} / ${a.liverStatus || "unknown"} / ${a.cardiacStatus || "unknown"}`, state: [a.renalStatus, a.liverStatus, a.cardiacStatus].includes("unknown") ? "open" : [a.renalStatus, a.liverStatus, a.cardiacStatus].includes("impaired") ? "warning" : "confirmed", source: "Assessment · Therapiesicherheit", meaning: "begrenzt Protein- und Flüssigkeitsautomatik" },
  ];

  const verifiedEvidence = evidence.filter((item) => item.state === "confirmed").length;
  const openEvidence = evidence.filter((item) => item.state === "open").length;
  const decisionCompleteness = Math.round((verifiedEvidence / evidence.length) * 100);
  const dataQuality = blocked ? "nicht freigegeben" : openEvidence >= 3 ? "eingeschränkt" : warnings.length >= 2 ? "mit Vorbehalten" : "gut nachvollziehbar";

  const calculations = [
    {
      label: "Gewichtsbasis",
      formula: a.amputation?.present
        ? `${metrics.observedWeight.toFixed(1)} kg ÷ (1 − ${(metrics.segmentPercent / 100).toFixed(3)})`
        : `${metrics.observedWeight.toFixed(1)} kg beobachtetes Gewicht`,
      result: weightBasis > 0 ? `${weightBasis.toFixed(1)} kg` : "nicht berechenbar",
      rationale: a.amputation?.present ? "Segmentkorrektur; vor Verwendung fachlich zu bestätigen" : "keine Segmentkorrektur dokumentiert",
      source: a.amputation?.present ? "NutriPilot Segmentregel · noch klinisch zu validieren" : "Assessment",
    },
    {
      label: "BMI",
      formula: `${weightBasis > 0 ? weightBasis.toFixed(1) : "?"} kg ÷ (${number(a.height) / 100 || "?"} m)²`,
      result: bmi > 0 ? `${bmi.toFixed(1)} kg/m²` : "nicht berechenbar",
      rationale: a.edema || a.ascites ? "nur eingeschränkt interpretierbar wegen Flüssigkeitseinlagerung" : "Plausibilitäts- und Risikoparameter",
      source: "Standardformel",
    },
    {
      label: "Gewichtsverlust",
      formula: number(a.weight3m) > 0 ? `(${number(a.weight3m).toFixed(1)} − ${metrics.observedWeight.toFixed(1)}) ÷ ${number(a.weight3m).toFixed(1)} × 100` : "3-Monats-Gewicht fehlt",
      result: metrics.weightLoss > 0 ? `${metrics.weightLoss.toFixed(1)} %` : "nicht berechenbar",
      rationale: "Verlaufssignal; beobachtetes Gewicht wird verwendet",
      source: "Assessment",
    },
    {
      label: "Energie-Korridor",
      formula: targetMode === "numeric" && weightBasis > 0 ? `${weightBasis.toFixed(1)} kg × ${energyPerKg[0]}–${energyPerKg[1]} kcal/kg` : "individuelle Berechnungsbasis erforderlich",
      result: targetValues.energyLow == null ? "nicht automatisch berechnet" : `${targetValues.energyLow}–${targetValues.energyHigh} kcal/Tag`,
      rationale: ruleLabel,
      source: uniqueGuidelines(sources).map((item) => item.id).join(", ") || "individuelle Festlegung",
    },
    {
      label: "Protein-Korridor",
      formula: targetMode === "numeric" && weightBasis > 0 ? `${weightBasis.toFixed(1)} kg × ${proteinPerKg[0].toFixed(1)}–${proteinPerKg[1].toFixed(1)} g/kg` : "individuelle Berechnungsbasis erforderlich",
      result: targetValues.proteinLow == null ? "nicht automatisch berechnet" : `${targetValues.proteinLow}–${targetValues.proteinHigh} g/Tag`,
      rationale: ruleReason,
      source: uniqueGuidelines(sources).map((item) => item.id).join(", ") || "individuelle Festlegung",
    },
    {
      label: "Flüssigkeits-Korridor",
      formula: fluidAutoAllowed && weightBasis > 0 ? `${weightBasis.toFixed(1)} kg × 30–35 ml/kg` : "Automatik wegen Restriktion/Organstatus deaktiviert",
      result: targetValues.fluidLow == null ? "individuell festlegen" : `${targetValues.fluidLow}–${targetValues.fluidHigh} ml/Tag`,
      rationale: fluidAutoAllowed ? "allgemeine Orientierung, klinischen Volumenstatus prüfen" : "Sicherheitsbedingte Individualisierung",
      source: "NICE-CG32-2017",
    },
  ];

  const findings = [
    metrics.weightLoss >= 5 ? `${metrics.weightLoss.toFixed(1)} % Gewichtsverlust` : null,
    intakePercent > 0 ? `${intakePercent} % dokumentierte Aufnahme` : null,
    a.muscleReduced === "yes" ? "reduzierte Muskelmasse" : null,
    a.inflammation === "yes" ? "Entzündung/Krankheitslast" : null,
    dysphagia ? "Schluckstörung beziehungsweise angepasste Kostform" : null,
  ].filter(Boolean);

  const interventionConclusion = blocked
    ? "Zunächst Sicherheitslücken schließen; noch keine übernehmbare quantitative Empfehlung."
    : intakePercent > 0 && intakePercent < 50
      ? "Orale Optimierung plus ergänzende Trinknahrung prüfen; bei unrealistischer Zielerreichung Eskalation interprofessionell bewerten."
      : intakePercent > 0 && intakePercent < 75
        ? "Orale Optimierung und ergänzende Trinknahrung abhängig vom Defizit und der Akzeptanz prüfen."
        : "Orale Strategie fortführen und Zielerreichung kontrollieren; Eskalation nur bei ausbleibendem Erfolg.";

  const reasoningSteps = [
    {
      id: "findings",
      title: "Befunde zusammenführen",
      observation: findings.length ? findings.join(" · ") : "Entscheidungsrelevante Befunde sind noch unvollständig.",
      rule: "Patientendaten werden ohne Ergänzung oder Schätzung aus dem Assessment übernommen.",
      conclusion: findings.length ? "Es bestehen ernährungsmedizinisch relevante Belastungsfaktoren." : "Die Datenbasis reicht noch nicht für eine belastbare Einordnung.",
      consequence: findings.length ? "Therapiebedarf und Dringlichkeit fachlich prüfen." : "Assessment vervollständigen.",
      source: "Patientendaten",
      tone: findings.length ? "warning" : "open",
    },
    {
      id: "safety",
      title: "Sicherheitsgate anwenden",
      observation: safetyChecks.filter((item) => item.status !== "ok").map((item) => item.title).join(" · ") || "Keine offenen Sicherheitsbedingung erkannt.",
      rule: `${LOCAL_RULES.safetyGate.id}: Gewichtsbasis, Refeeding und sichere orale Zufuhr werden vor Zielwerten geprüft.`,
      conclusion: blocked ? "Mindestens eine kritische Voraussetzung ist offen." : warnings.length ? "Keine Blockade, aber fachliche Vorbehalte bestehen." : "Sicherheitsgate passiert.",
      consequence: blocked ? "Übernahme sperren und offene Daten bearbeiten." : "Zielkorridor darf als Entwurf angezeigt werden.",
      source: refeedingRisk ? "NICE-CG32-2017 + NutriPilot Sicherheitsregel" : "NutriPilot Sicherheitsregel",
      tone: blocked ? "block" : warnings.length ? "warning" : "ok",
    },
    {
      id: "context",
      title: "Passende Regelbasis wählen",
      observation: `${ruleLabel}; ${ruleReason}`,
      rule: `Kontextspezifische Leitlinien haben Vorrang vor dem breiten allgemeinen Korridor.`,
      conclusion: targetMode === "individual" ? "Keine automatische kg-basierte Zielzahl." : `${energyPerKg[0]}–${energyPerKg[1]} kcal/kg und ${proteinPerKg[0].toFixed(1)}–${proteinPerKg[1].toFixed(1)} g Protein/kg als prüfbarer Korridor.`,
      consequence: "Rechenweg offenlegen und Auswahl der Fachkraft ermöglichen.",
      source: uniqueGuidelines(sources).map((item) => item.id).join(", ") || "individuelle Festlegung",
      tone: targetMode === "individual" ? "warning" : "ok",
    },
    {
      id: "intervention",
      title: "Interventionsstufe ableiten",
      observation: `${intakePercent || "offene"} % Aufnahme; Schluckstatus: ${a.swallowing || "offen"}.`,
      rule: `${LOCAL_RULES.oralFirst.id} und ${LOCAL_RULES.deficitEscalation.id}.`,
      conclusion: interventionConclusion,
      consequence: "Maßnahmen in Sicherheit, orale Optimierung, Trinknahrung und Eskalation trennen.",
      source: isGeriatric ? "DGEM-GER-2025 + NutriPilot Stufenregel" : "NICE-CG32-2017 + NutriPilot Stufenregel",
      tone: blocked ? "block" : intakePercent > 0 && intakePercent < 75 ? "warning" : "ok",
    },
    {
      id: "monitoring",
      title: "Wirksamkeit überprüfbar machen",
      observation: refeedingRisk || intakePercent < 50 ? "Hoher kurzfristiger Kontrollbedarf." : "Regulärer kurzfristiger Kontrollbedarf.",
      rule: "Jede Therapieentscheidung benötigt Parameter, Intervall und Eskalationsauslöser.",
      conclusion: `Nächste fachliche Prüfung in ${reviewDays} Tag${reviewDays === 1 ? "" : "en"}.`,
      consequence: "Monitoringplan gemeinsam mit der Therapie übernehmen.",
      source: "NICE-CG32-2017 + NutriPilot Monitoringregel",
      tone: refeedingRisk || intakePercent < 50 ? "warning" : "ok",
    },
  ];

  const explanation = blocked
    ? `${fullName(patient)}: ${findings.length ? findings.join(", ") : "unvollständige klinische Datengrundlage"}. Weil mindestens eine sicherheitskritische Voraussetzung offen ist, zeigt NutriPilot die fachliche Herleitung, sperrt aber die Übernahme quantitativer Zielwerte.`
    : `${fullName(patient)}: ${findings.length ? findings.join(", ") : "begrenzte klinische Datengrundlage"}. Daraus wird der Kontext „${ruleLabel}“ gewählt. Der sichtbare Korridor und die stufenweise Empfehlung sind ein prüfbarer Entwurf; die Ernährungsfachkraft bestätigt oder verändert jeden Schritt.`;

  return {
    blocked,
    refeedingRisk,
    refeedingCriteria: { major: majorRefeedingCriteria, minor: minorRefeedingCriteria, majorCount: majorRefeedingCount, minorCount: minorRefeedingCount },
    dysphagia,
    swallowPlanReady,
    safetyChecks,
    warnings,
    dataQuality,
    decisionCompleteness,
    evidence,
    reasoningSteps,
    calculations,
    targetMode,
    ruleLabel,
    ruleReason,
    weightBasis,
    energyPerKg,
    proteinPerKg,
    targets: targetValues,
    selected,
    measures: [
      { id: "safety", title: "Priorität 1 · Sicherheit", why: "Diese Punkte müssen vor oder parallel zur Ernährungstherapie geklärt sein.", items: safetyMeasures },
      { id: "oral", title: "Priorität 2 · Orale Ernährung optimieren", why: "Die orale Zufuhr bleibt erste Wahl, sofern sie sicher, akzeptiert und realistisch bedarfsdeckend ist.", items: oralMeasures },
      { id: "ons", title: "Priorität 3 · Trinknahrung prüfen", why: "Ergänzung ist plausibel, wenn das Defizit mit Mahlzeiten allein voraussichtlich nicht geschlossen wird.", items: onsMeasures },
      { id: "escalation", title: "Priorität 4 · Eskalation prüfen", why: "Bei ausbleibender Zielerreichung muss der Applikationsweg fachlich neu bewertet werden.", items: escalationMeasures },
    ],
    monitoring,
    sources: uniqueGuidelines(sources),
    explanation,
    recommendedReviewDate: isoDate(new Date(Date.now() + reviewDays * 86400000)),
  };
}


function recommendationMeasuresText(recommendation) {
  return recommendation.measures
    .map((group) => `${group.title}: ${group.items.join(" ")}`)
    .join("\n\n");
}

function recommendationMonitoringText(recommendation) {
  return recommendation.monitoring
    .map((item) => `${item.parameter}: ${item.interval}; Eskalation bei ${item.trigger}.`)
    .join("\n");
}

function App() {
  const [patients, setPatients] = useState(() => {
    try {
      const legacyStored = LEGACY_STORAGE_KEYS.map((key) => localStorage.getItem(key)).find(Boolean);
      const stored = localStorage.getItem(STORAGE_KEY) || legacyStored;
      const source = stored ? JSON.parse(stored) : clone(DEMO_PATIENTS);
      return source.map((patient) => makePatient(patient));
    } catch {
      return clone(DEMO_PATIENTS).map((patient) => makePatient(patient));
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
      <MobileNav view={view} navigate={navigate} onAdd={() => setShowNewPatient(true)} />
      {showNewPatient && <NewPatientDialog onClose={() => setShowNewPatient(false)} onCreate={createPatient} />}
      {toast && <div className="toast"><Check size={16} /> {toast}</div>}
    </div>
  );
}

function MobileNav({ view, navigate, onAdd }) {
  const activeView = view === "workspace" ? "patients" : view;
  const NavButton = ({ id, icon: Icon, label }) => (
    <button className={activeView === id ? "active" : ""} onClick={() => navigate(id)} aria-current={activeView === id ? "page" : undefined}>
      <Icon size={19} /><span>{label}</span>
    </button>
  );
  return (
    <nav className="mobile-nav" aria-label="Mobile Hauptnavigation">
      <NavButton id="today" icon={CalendarDays} label="Heute" />
      <NavButton id="consults" icon={ClipboardList} label="Konsile" />
      <button className="mobile-add" onClick={onAdd} aria-label="Neuen Patienten aufnehmen"><Plus size={21} /><span>Neu</span></button>
      <NavButton id="patients" icon={Users} label="Fälle" />
      <NavButton id="search" icon={Search} label="Suche" />
    </nav>
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
          {tab === "therapy" && <TherapyWorkspace patient={patient} updatePatient={updatePatient} notify={notify} setTab={setTab} />}
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

        <FormSection title="Therapiesicherheit" icon={ShieldCheck} description="Sicherheitsrelevante Angaben für den Therapie-Copilot">
          <div className="form-grid three">
            <Field label="Kalium"><select value={a.potassiumStatus} onChange={(e) => setAssessment({ potassiumStatus: e.target.value })}><option value="unknown">nicht dokumentiert</option><option value="normal">unauffällig</option><option value="low">erniedrigt</option><option value="high">erhöht</option></select></Field>
            <Field label="Phosphat"><select value={a.phosphateStatus} onChange={(e) => setAssessment({ phosphateStatus: e.target.value })}><option value="unknown">nicht dokumentiert</option><option value="normal">unauffällig</option><option value="low">erniedrigt</option><option value="high">erhöht</option></select></Field>
            <Field label="Magnesium"><select value={a.magnesiumStatus} onChange={(e) => setAssessment({ magnesiumStatus: e.target.value })}><option value="unknown">nicht dokumentiert</option><option value="normal">unauffällig</option><option value="low">erniedrigt</option><option value="high">erhöht</option></select></Field>
            <Field label="Nierenfunktion"><select value={a.renalStatus} onChange={(e) => setAssessment({ renalStatus: e.target.value })}><option value="unknown">noch offen</option><option value="normal">unauffällig</option><option value="impaired">eingeschränkt</option></select></Field>
            <Field label="Leberfunktion"><select value={a.liverStatus} onChange={(e) => setAssessment({ liverStatus: e.target.value })}><option value="unknown">noch offen</option><option value="normal">unauffällig</option><option value="impaired">eingeschränkt</option></select></Field>
            <Field label="Herz-/Volumenstatus"><select value={a.cardiacStatus} onChange={(e) => setAssessment({ cardiacStatus: e.target.value })}><option value="unknown">noch offen</option><option value="normal">unauffällig</option><option value="impaired">eingeschränkt</option></select></Field>
          </div>
          <div className="form-grid two">
            <label className="check-card"><input type="checkbox" checked={Boolean(a.fluidRestriction)} onChange={(e) => setAssessment({ fluidRestriction: e.target.checked })} /><span><b>Flüssigkeitsrestriktion</b><small>Automatisches Flüssigkeitsziel wird deaktiviert</small></span></label>
            <label className="check-card"><input type="checkbox" checked={Boolean(a.swallowPlanConfirmed)} onChange={(e) => setAssessment({ swallowPlanConfirmed: e.target.checked })} /><span><b>Kostform / Schluckplan bestätigt</b><small>Für Dysphagie-Fälle erforderlich</small></span></label>
            <label className="check-card"><input type="checkbox" checked={Boolean(a.alcoholRisk)} onChange={(e) => setAssessment({ alcoholRisk: e.target.checked })} /><span><b>Alkoholanamnese relevant</b><small>Refeeding-Risiko berücksichtigen</small></span></label>
            <label className="check-card"><input type="checkbox" checked={Boolean(a.highRiskMedication)} onChange={(e) => setAssessment({ highRiskMedication: e.target.checked })} /><span><b>Refeeding-relevante Medikation</b><small>z. B. Insulin, Chemotherapie, Antazida oder Diuretika</small></span></label>
          </div>
          <Field label="Allergien / Unverträglichkeiten"><input value={a.allergies} onChange={(e) => setAssessment({ allergies: e.target.value })} placeholder="Keine bekannt / bitte konkret dokumentieren" /></Field>
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

function TherapyWorkspace({ patient, updatePatient, notify, setTab }) {
  const t = patient.therapy;
  const [alternative, setAlternative] = useState(t.recommendationAlternative || "standard");
  const [showEditor, setShowEditor] = useState(Boolean(t.energyGoal || t.measures || t.confirmed));
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState(t.recommendationReason || "");
  const recommendation = useMemo(() => therapyRecommendation(patient, alternative), [patient, alternative]);

  useEffect(() => {
    setAlternative(patient.therapy.recommendationAlternative || "standard");
    setRejectReason(patient.therapy.recommendationReason || "");
  }, [patient.id]);

  function jumpTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function patchTherapy(patch, message) {
    updatePatient(patient.id, (draft) => {
      draft.therapy = { ...draft.therapy, ...patch };
      draft.consultStatus = "Therapie";
      draft.caseStatus = draft.therapy.confirmed ? "Therapie aktiv" : "Therapieentscheidung offen";
      draft.nextStep = draft.therapy.confirmed ? "Verlauf kontrollieren" : "Therapieplan bestätigen";
      return draft;
    }, message);
  }

  function editTherapy(patch) {
    patchTherapy({
      ...patch,
      recommendationStatus: t.recommendationStatus === "accepted" || t.recommendationStatus === "confirmed" ? "adapted" : t.recommendationStatus,
    });
  }

  function chooseAlternative(value) {
    setAlternative(value);
    patchTherapy({ recommendationAlternative: value, recommendationStatus: t.recommendationStatus === "rejected" ? "draft" : t.recommendationStatus });
  }

  function confirmWeightBasis(checked) {
    patchTherapy({ weightBasisConfirmed: checked, recommendationStatus: "draft" }, checked ? "Gewichtsbasis wurde bestätigt" : "Bestätigung der Gewichtsbasis wurde aufgehoben");
  }

  function adoptRecommendation() {
    if (recommendation.blocked) {
      if (notify) notify("Offene Sicherheitsprüfungen verhindern die Übernahme");
      return;
    }
    updatePatient(patient.id, (draft) => {
      const rec = therapyRecommendation(draft, alternative);
      draft.therapy = {
        ...draft.therapy,
        energyGoal: rec.selected.energy ?? draft.therapy.energyGoal,
        proteinGoal: rec.selected.protein ?? draft.therapy.proteinGoal,
        fluidGoal: rec.selected.fluid ?? draft.therapy.fluidGoal,
        measures: recommendationMeasuresText(rec),
        monitoringPlan: recommendationMonitoringText(rec),
        nextReview: rec.recommendedReviewDate,
        recommendationStatus: "accepted",
        recommendationReason: "",
        recommendationAlternative: alternative,
        recommendationGeneratedAt: new Date().toISOString(),
        recommendationAcceptedAt: new Date().toISOString(),
        confirmed: false,
      };
      draft.consultStatus = "Therapie";
      draft.caseStatus = "Therapieentwurf übernommen";
      draft.nextStep = "Therapieentwurf prüfen und bestätigen";
      draft.timeline.unshift({
        id: `E-${Date.now()}`,
        date: isoDate(),
        time: currentTime(),
        type: "Therapie-Copilot",
        title: "Nachvollziehbarer Therapieentwurf übernommen",
        text: `Strategie: ${alternative}. Regelkontext: ${rec.ruleLabel}. Quellen: ${rec.sources.map((source) => source.id).join(", ") || "individuelle Festlegung"}. Datenbasis ${rec.decisionCompleteness} %. Noch nicht fachlich bestätigt.`,
      });
      return draft;
    }, "Therapieentwurf wurde übernommen");
    setShowEditor(true);
    setRejectMode(false);
  }

  function rejectRecommendation() {
    if (!rejectReason.trim()) {
      if (notify) notify("Bitte Ablehnungsgrund dokumentieren");
      return;
    }
    updatePatient(patient.id, (draft) => {
      draft.therapy.recommendationStatus = "rejected";
      draft.therapy.recommendationReason = rejectReason.trim();
      draft.therapy.recommendationGeneratedAt = new Date().toISOString();
      draft.caseStatus = "Therapieempfehlung abgelehnt";
      draft.nextStep = "Individuellen Therapieplan erstellen";
      draft.timeline.unshift({
        id: `E-${Date.now()}`,
        date: isoDate(),
        time: currentTime(),
        type: "Therapie-Copilot",
        title: "Therapieempfehlung fachlich abgelehnt",
        text: rejectReason.trim(),
      });
      return draft;
    }, "Ablehnung wurde dokumentiert");
    setRejectMode(false);
    setShowEditor(true);
  }

  function confirmPlan() {
    if (recommendation.blocked) {
      if (notify) notify("Sicherheitsprüfungen müssen zuerst abgeschlossen werden");
      return;
    }
    if (!t.energyGoal || !t.proteinGoal || !t.measures) {
      if (notify) notify("Energie, Protein und Maßnahmen müssen fachlich festgelegt sein");
      return;
    }
    updatePatient(patient.id, (draft) => {
      const wasConfirmed = draft.therapy.confirmed;
      const rec = therapyRecommendation(draft, draft.therapy.recommendationAlternative || "standard");
      draft.therapy.confirmed = true;
      draft.therapy.confirmedAt = new Date().toISOString();
      draft.therapy.confirmedBy = "Laura Becker";
      draft.therapy.recommendationStatus = "confirmed";
      draft.consultStatus = "Monitoring";
      draft.caseStatus = "Therapie aktiv";
      draft.nextStep = "Verlauf kontrollieren";
      draft.timeline.unshift({
        id: `E-${Date.now()}`,
        date: isoDate(),
        time: currentTime(),
        type: "Therapie",
        title: wasConfirmed ? "Therapieplan fachlich aktualisiert" : "Therapieplan fachlich bestätigt",
        text: `Energie ${draft.therapy.energyGoal} kcal/Tag, Protein ${draft.therapy.proteinGoal} g/Tag${draft.therapy.fluidGoal ? `, Flüssigkeit ${draft.therapy.fluidGoal} ml/Tag` : ""}. Regelkontext: ${rec.ruleLabel}. Quellenbasis: ${rec.sources.map((source) => source.id).join(", ") || "individuelle Festlegung"}.`,
      });
      return draft;
    }, "Therapieplan wurde fachlich bestätigt");
  }

  const strategyLabels = {
    vorsichtig: "unterer Zielkorridor",
    standard: "Mittelwert des Korridors",
    protein: "Protein am oberen Korridor",
  };
  const statusLabel = recommendation.blocked
    ? "Sicherheitsstopp"
    : t.confirmed
      ? "Fachlich bestätigt"
      : t.recommendationStatus === "accepted"
        ? "Entwurf übernommen"
        : t.recommendationStatus === "adapted"
          ? "Fachlich angepasst"
          : t.recommendationStatus === "rejected"
            ? "Abgelehnt"
            : "Vorschlag zur Prüfung";

  return (
    <div className="stack therapy-copilot-workspace">
      <section className="panel therapy-copilot-hero">
        <div className="therapy-copilot-head">
          <div>
            <span className="eyebrow">Patientendaten → Sicherheitslogik → Leitlinie → Rechenweg → Empfehlung</span>
            <h2>Nachvollziehbarer Therapie-Copilot</h2>
            <p>Jeder medizinische Schluss ist bis zur verwendeten Patienteneingabe, Regel und Quelle zurückverfolgbar. NutriPilot erzeugt einen prüfbaren Entwurf – keine autonome Therapieentscheidung.</p>
            <div className="therapy-hero-actions">
              <button className="primary-button" onClick={() => jumpTo("therapy-basis")}><Database size={16} /> Entscheidungsgrundlage öffnen</button>
              <button className="secondary-button" onClick={() => jumpTo("therapy-reasoning")}><GitBranch size={16} /> Medizinische Herleitung</button>
              <button className="secondary-button" onClick={() => jumpTo("therapy-calculations")}><Calculator size={16} /> Rechenweg</button>
            </div>
          </div>
          <div className={`recommendation-status ${recommendation.blocked ? "blocked" : t.confirmed ? "confirmed" : "draft"}`}>
            <span>Status</span>
            <b>{statusLabel}</b>
            <small>Datenbasis: {recommendation.decisionCompleteness} % · {recommendation.dataQuality}</small>
          </div>
        </div>
        <div className="ai-summary-card">
          <span className="ai-summary-icon"><Sparkles size={21} /></span>
          <div>
            <b>Medizinisch-logische Zusammenfassung</b>
            <p>{recommendation.explanation}</p>
            <small>v1.2: reproduzierbare Regel- und Erklärungsschicht. Fehlende Werte werden nicht erfunden und bleiben sichtbar offen.</small>
          </div>
        </div>
      </section>

      <nav className="therapy-section-nav" aria-label="Bereiche des Therapie-Copiloten">
        <button onClick={() => jumpTo("therapy-basis")}><Database size={15} /> Datenbasis</button>
        <button onClick={() => jumpTo("therapy-safety")}><ShieldCheck size={15} /> Sicherheit</button>
        <button onClick={() => jumpTo("therapy-reasoning")}><GitBranch size={15} /> Herleitung</button>
        <button onClick={() => jumpTo("therapy-calculations")}><Calculator size={15} /> Rechenweg</button>
        <button onClick={() => jumpTo("therapy-plan")}><Utensils size={15} /> Empfehlung</button>
        <button onClick={() => jumpTo("therapy-sources")}><BookOpen size={15} /> Quellen</button>
      </nav>

      <section className="panel decision-basis-panel anchor-section" id="therapy-basis">
        <div className="panel-heading">
          <div><span className="eyebrow">Direkter Zugriff auf die Entscheidungsgrundlage</span><h3>Welche Patientendaten fließen in die Empfehlung ein?</h3><p>Status, Herkunft und medizinische Bedeutung jeder Information sind sichtbar. Offene Daten werden nicht stillschweigend ersetzt.</p></div>
          <button className="secondary-button" onClick={() => setTab("assessment")}>Assessment bearbeiten</button>
        </div>
        <div className="evidence-grid">
          {recommendation.evidence.map((item) => <EvidenceCard key={`${item.domain}-${item.label}`} item={item} />)}
        </div>
        {patient.assessment.amputation?.present && (
          <label className={`weight-basis-confirm ${t.weightBasisConfirmed ? "confirmed" : "open"}`}>
            <input type="checkbox" checked={Boolean(t.weightBasisConfirmed)} onChange={(event) => confirmWeightBasis(event.target.checked)} />
            <span><b>Korrigierte Gewichtsbasis fachlich bestätigen</b><small>{assessmentMetrics(patient).observedWeight.toFixed(1)} kg ÷ (1 − {(assessmentMetrics(patient).segmentPercent / 100).toFixed(3)}) = {assessmentMetrics(patient).correctedWeight.toFixed(1)} kg. Segment und Berechnungsbasis sind vor Nutzung klinisch zu prüfen.</small></span>
          </label>
        )}
      </section>

      <section className="panel safety-gate-panel anchor-section" id="therapy-safety">
        <div className="panel-heading">
          <div><span className="eyebrow">Vor jeder quantitativen Empfehlung</span><h3>Sicherheitsprüfung</h3><p>Kritische Lücken stoppen die Übernahme. Warnungen bleiben als fachliche Vorbehalte neben dem Vorschlag sichtbar.</p></div>
          <span className={`gate-summary ${recommendation.blocked ? "blocked" : "ready"}`}>{recommendation.blocked ? "Übernahme gesperrt" : `${recommendation.warnings.length} Hinweise`}</span>
        </div>
        <div className="safety-check-grid">
          {recommendation.safetyChecks.map((check) => <SafetyCheckCard key={check.key} check={check} />)}
        </div>
        {recommendation.refeedingRisk && <RefeedingCriteriaPanel criteria={recommendation.refeedingCriteria} />}
        {recommendation.blocked && (
          <div className="safety-stop-banner"><AlertTriangle size={20} /><div><b>NutriPilot gibt noch keinen übernehmbaren Therapieplan frei.</b><span>Die medizinische Herleitung bleibt einsehbar; quantitative Werte können erst nach Abschluss der rot markierten Voraussetzungen übernommen werden.</span></div><button className="secondary-button" onClick={() => setTab("assessment")}>Offene Daten bearbeiten</button></div>
        )}
      </section>

      <section className="panel reasoning-panel anchor-section" id="therapy-reasoning">
        <div className="panel-heading">
          <div><span className="eyebrow">Medizinisch logisch nachvollziehbare Schlüsse</span><h3>Von der Beobachtung zur Empfehlung</h3><p>Jede Stufe zeigt: Beobachtung → angewandte Regel → fachlicher Schluss → konkrete Auswirkung.</p></div>
          <span className="logic-badge"><GitBranch size={14} /> {recommendation.reasoningSteps.length} prüfbare Schritte</span>
        </div>
        <div className="reasoning-flow">
          {recommendation.reasoningSteps.map((step, index) => <ReasoningStep key={step.id} step={step} index={index + 1} />)}
        </div>
      </section>

      <section className="panel calculation-panel anchor-section" id="therapy-calculations">
        <div className="panel-heading">
          <div><span className="eyebrow">Keine Zahl ohne Rechenweg</span><h3>Berechnungen und verwendete Gewichtsbasis</h3><p>Ausgangswert, Formel, Ergebnis, Begründung und Quelle werden gemeinsam angezeigt.</p></div>
        </div>
        <div className="calculation-grid">
          {recommendation.calculations.map((item) => <CalculationTraceCard key={item.label} item={item} />)}
        </div>
      </section>

      <section className="panel target-corridor-panel anchor-section" id="therapy-targets">
        <div className="panel-heading">
          <div><span className="eyebrow">Zielkorridor statt Scheinpräzision</span><h3>Quantitative Orientierung</h3><p>{recommendation.targetMode === "individual" ? "Die automatische kg-basierte Berechnung ist für diesen Fall bewusst deaktiviert." : `${recommendation.energyPerKg[0]}–${recommendation.energyPerKg[1]} kcal/kg und ${recommendation.proteinPerKg[0].toFixed(1)}–${recommendation.proteinPerKg[1].toFixed(1)} g Protein/kg. Kontextwahl: ${recommendation.ruleReason}`}</p></div>
          <div className="strategy-switch" aria-label="Therapiestrategie">
            {[
              ["vorsichtig", "Unterer Korridor"],
              ["standard", "Korridormitte"],
              ["protein", "Protein-Fokus"],
            ].map(([value, label]) => <button key={value} className={alternative === value ? "active" : ""} onClick={() => chooseAlternative(value)}>{label}</button>)}
          </div>
        </div>
        <div className="target-range-grid">
          <TargetRangeCard label="Energie" unit="kcal/Tag" low={recommendation.targets.energyLow} high={recommendation.targets.energyHigh} selected={recommendation.selected.energy} note={recommendation.targetMode === "individual" ? "Berechnungsbasis individuell festlegen" : strategyLabels[alternative]} />
          <TargetRangeCard label="Protein" unit="g/Tag" low={recommendation.targets.proteinLow} high={recommendation.targets.proteinHigh} selected={recommendation.selected.protein} note={recommendation.targetMode === "individual" ? "Organfunktion und geeignete Gewichtsbasis berücksichtigen" : strategyLabels[alternative]} />
          <TargetRangeCard label="Flüssigkeit" unit="ml/Tag" low={recommendation.targets.fluidLow} high={recommendation.targets.fluidHigh} selected={recommendation.selected.fluid} note={patient.assessment.fluidRestriction || patient.assessment.renalStatus === "impaired" || patient.assessment.cardiacStatus === "impaired" ? "Automatik aus Sicherheitsgründen deaktiviert" : "klinischen Volumenstatus prüfen"} />
        </div>
      </section>

      <section className="panel staged-plan-panel anchor-section" id="therapy-plan">
        <div className="panel-heading"><div><span className="eyebrow">Empfehlung mit explizitem Warum</span><h3>Priorisierter Maßnahmenplan</h3><p>Jede Maßnahmenstufe zeigt nicht nur was vorgeschlagen wird, sondern warum sie aus diesem Fall folgt.</p></div></div>
        <div className="recommendation-groups">
          {recommendation.measures.map((group, index) => <RecommendationGroup key={group.id} group={group} index={index + 1} />)}
        </div>
      </section>

      <section className="panel monitoring-plan-panel">
        <div className="panel-heading"><div><span className="eyebrow">Therapie ohne Monitoring ist unvollständig</span><h3>Vorgeschlagener Kontrollplan</h3><p>Parameter, Intervall und Eskalationsauslöser werden gemeinsam in den Verlauf übernommen.</p></div><span className="review-date">Nächste Prüfung: {formatDate(recommendation.recommendedReviewDate)}</span></div>
        <div className="monitoring-table">
          <div className="monitoring-row header"><b>Parameter</b><b>Intervall</b><b>Eskalation</b></div>
          {recommendation.monitoring.map((item) => <div className="monitoring-row" key={item.parameter}><span>{item.parameter}</span><b>{item.interval}</b><small>{item.trigger}</small></div>)}
        </div>
      </section>

      <section className="panel source-evidence-panel anchor-section" id="therapy-sources">
        <div className="panel-heading"><div><span className="eyebrow">Versionierte Wissensbasis</span><h3>Fachliche Quellen dieses Vorschlags</h3><p>Jeder Korridor und jede Sicherheitsregel wird mit Geltungsbereich und konkretem Empfehlungsabschnitt dargestellt.</p></div></div>
        <div className="source-list">
          {recommendation.sources.length ? recommendation.sources.map((source) => <GuidelineSource key={source.id} source={source} />) : <div className="empty-source">Für diesen individualisierten Fall wurde noch keine automatische Quellenregel ausgewählt.</div>}
        </div>
        <div className="local-rule-list">
          {Object.values(LOCAL_RULES).map((rule) => <div className="local-rule-card" key={rule.id}><span>{rule.id}</span><div><b>{rule.title}</b><p>{rule.note}</p></div></div>)}
        </div>
      </section>

      <section className="panel recommendation-actions-panel">
        <div className="recommendation-actions-copy">
          <span className="eyebrow">Fachliche Entscheidung</span>
          <h3>Vorschlag übernehmen, anpassen oder ablehnen</h3>
          <p>Die Entscheidung sowie Regelkontext, Quellen und Datenstand werden in der Clinical Timeline dokumentiert.</p>
        </div>
        <div className="recommendation-action-buttons">
          <button className="primary-button" disabled={recommendation.blocked} onClick={adoptRecommendation}><Check size={16} /> Vorschlag übernehmen</button>
          <button className="secondary-button" onClick={() => setShowEditor(true)}>Manuell anpassen</button>
          <button className="danger-outline-button" onClick={() => setRejectMode((value) => !value)}>Ablehnen</button>
        </div>
        {t.recommendationStatus === "rejected" && <div className="rejection-history"><b>Dokumentierter Ablehnungsgrund</b><span>{t.recommendationReason}</span></div>}
        {rejectMode && (
          <div className="rejection-editor">
            <Field label="Fachlicher Ablehnungsgrund"><textarea value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} placeholder="Warum ist dieser Vorschlag für den konkreten Patienten nicht geeignet?" /></Field>
            <div><button className="secondary-button" onClick={() => setRejectMode(false)}>Abbrechen</button><button className="danger-button" onClick={rejectRecommendation}>Ablehnung dokumentieren</button></div>
          </div>
        )}
      </section>

      {showEditor && (
        <section className="panel therapy-editor-panel">
          <div className="panel-heading">
            <div><span className="eyebrow">Fachlich editierbarer Therapieplan</span><h3>Bestätigte Zielwerte und Maßnahmen</h3><p>Übernommene Werte bleiben vollständig änderbar. Abweichungen werden als Anpassung gekennzeichnet.</p></div>
            <span className={`edit-status status-${t.recommendationStatus}`}>{t.recommendationStatus || "draft"}</span>
          </div>
          <div className="form-grid three therapy-fields">
            <Field label="Energieziel (kcal/Tag)"><input type="number" value={t.energyGoal} onChange={(event) => editTherapy({ energyGoal: event.target.value })} /></Field>
            <Field label="Proteinziel (g/Tag)"><input type="number" value={t.proteinGoal} onChange={(event) => editTherapy({ proteinGoal: event.target.value })} /></Field>
            <Field label="Flüssigkeitsziel (ml/Tag)"><input type="number" value={t.fluidGoal} onChange={(event) => editTherapy({ fluidGoal: event.target.value })} placeholder={patient.assessment.fluidRestriction ? "individuell" : ""} /></Field>
          </div>
          <Field label="Ziele und Maßnahmen"><textarea className="large-textarea" value={t.measures} onChange={(event) => editTherapy({ measures: event.target.value })} placeholder="Konkrete, priorisierte und überprüfbare Maßnahmen" /></Field>
          <Field label="Monitoringplan"><textarea value={t.monitoringPlan} onChange={(event) => editTherapy({ monitoringPlan: event.target.value })} placeholder="Parameter, Intervall und Eskalationskriterien" /></Field>
          <div className="form-grid two">
            <Field label="Nächste Verlaufskontrolle"><input type="date" value={t.nextReview} onChange={(event) => editTherapy({ nextReview: event.target.value })} /></Field>
            <div className="approval-card"><ShieldCheck size={20} /><div><b>Human-in-the-loop</b><span>Die Fachkraft übernimmt die klinische Verantwortung und bestätigt den finalen Plan.</span></div></div>
          </div>
          <div className="form-footer">
            <span>{t.confirmedAt ? `Zuletzt bestätigt am ${new Date(t.confirmedAt).toLocaleString("de-DE")} durch ${t.confirmedBy || "Fachkraft"}.` : "Noch nicht fachlich bestätigt."}</span>
            <button className="primary-button" disabled={recommendation.blocked || !t.energyGoal || !t.proteinGoal || !t.measures} onClick={confirmPlan}>{t.confirmed ? "Änderungen bestätigen" : "Therapieplan fachlich bestätigen"}</button>
          </div>
        </section>
      )}
    </div>
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
  const therapyRec = therapyRecommendation(patient);
  const messages = {
    overview: { title: patient.nextStep, text: `Der Fall ist zu ${completeness} % strukturiert erfasst. NutriPilot zeigt zuerst die fehlenden entscheidungsrelevanten Daten.` },
    assessment: { title: completeness === 100 ? "Assessment prüfbereit" : "Assessment gezielt ergänzen", text: missingAssessmentItems(patient).join(" · ") || "Keine offensichtliche Datenlücke im MVP-Datensatz." },
    glim: { title: evaluation.status, text: evaluation.explanation },
    therapy: { title: therapyRec.blocked ? "Sicherheitsprüfung offen" : patient.therapy.confirmed ? "Therapieplan aktiv" : "Leitlinienentwurf prüfbereit", text: therapyRec.blocked ? therapyRec.safetyChecks.filter((item) => item.status === "block").map((item) => item.title).join(" · ") : therapyRec.explanation },
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
              <Field label="Kontext"><select value={form.scenario} onChange={(e) => update("scenario", e.target.value)}><option>Neuaufnahme</option><option>Geriatrie</option><option>Onkologie</option><option>Refeeding</option><option>Dysphagie</option><option>Amputation</option><option>Homecare</option><option>Adipositas + Mangelernährung</option></select></Field>
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
function EvidenceCard({ item }) {
  const stateLabel = item.state === "confirmed" ? "bestätigt" : item.state === "warning" ? "mit Vorbehalt" : "offen";
  const stateIcon = item.state === "confirmed" ? <Check size={14} /> : item.state === "warning" ? <AlertTriangle size={14} /> : <Clock3 size={14} />;
  return (
    <article className={`evidence-card evidence-${item.state}`}>
      <div className="evidence-top"><span>{item.domain}</span><small>{stateIcon}{stateLabel}</small></div>
      <h4>{item.label}</h4>
      <b>{item.value}</b>
      <p>{item.meaning}</p>
      <footer><Database size={13} /> {item.source}</footer>
    </article>
  );
}

function SafetyCheckCard({ check }) {
  const icon = check.status === "ok" ? <Check size={16} /> : check.status === "block" ? <AlertTriangle size={16} /> : <Clock3 size={16} />;
  const label = check.status === "ok" ? "geprüft" : check.status === "block" ? "offen – stoppt Übernahme" : "fachlich prüfen";
  return (
    <article className={`safety-check-card ${check.status}`}>
      <span className="safety-check-icon">{icon}</span>
      <div><b>{check.title}</b><p>{check.detail}</p><small>{label}</small><div className="safety-meta"><span><BookOpen size={12} /> {check.source}</span><span><ChevronRight size={12} /> {check.action}</span></div></div>
    </article>
  );
}

function RefeedingCriteriaPanel({ criteria }) {
  return (
    <div className="refeeding-criteria-panel">
      <div className="refeeding-head"><AlertTriangle size={17} /><div><b>Warum wurde Refeeding-Risiko abgeleitet?</b><span>NICE CG32: ein Hauptkriterium oder mindestens zwei Nebenkriterien. Prozentwerte zur Aufnahme dienen im Demo-MVP als transparent gekennzeichnete Näherung.</span></div></div>
      <div className="refeeding-columns">
        <div><h4>Hauptkriterien · erfüllt {criteria.majorCount}</h4>{criteria.major.map((item) => <CriterionTrace key={item.label} item={item} />)}</div>
        <div><h4>Nebenkriterien · erfüllt {criteria.minorCount}</h4>{criteria.minor.map((item) => <CriterionTrace key={item.label} item={item} />)}</div>
      </div>
    </div>
  );
}

function CriterionTrace({ item }) {
  return <div className={`criterion-trace ${item.met ? "met" : "not-met"}`}><span>{item.met ? <Check size={13} /> : "–"}</span><div><b>{item.label}{item.proxy ? " · Demo-Näherung" : ""}</b><small>Patientenwert: {item.actual}</small></div></div>;
}

function ReasoningStep({ step, index }) {
  return (
    <article className={`reasoning-step reasoning-${step.tone}`}>
      <span className="reasoning-number">{index}</span>
      <div className="reasoning-main">
        <div className="reasoning-title"><h4>{step.title}</h4><small>{step.source}</small></div>
        <div className="reasoning-cells">
          <div><span>Beobachtung</span><p>{step.observation}</p></div>
          <div><span>Angewandte Regel</span><p>{step.rule}</p></div>
          <div><span>Fachlicher Schluss</span><p>{step.conclusion}</p></div>
          <div><span>Auswirkung</span><p>{step.consequence}</p></div>
        </div>
      </div>
    </article>
  );
}

function CalculationTraceCard({ item }) {
  return (
    <article className="calculation-trace-card">
      <div className="calculation-card-head"><span><Calculator size={16} /></span><h4>{item.label}</h4></div>
      <div className="formula-box"><small>Formel / Ausgangswerte</small><code>{item.formula}</code></div>
      <div className="calculation-result"><small>Ergebnis</small><b>{item.result}</b></div>
      <p>{item.rationale}</p>
      <footer><BookOpen size={12} /> {item.source}</footer>
    </article>
  );
}

function TargetRangeCard({ label, unit, low, high, selected, note }) {
  const hasRange = low !== null && low !== undefined && high !== null && high !== undefined;
  return <article className="target-range-card"><span>{label}</span><b>{hasRange ? `${low}–${high}` : "individuell"}</b><small>{hasRange ? unit : "keine automatische Zahl"}</small><div><strong>{selected ? `Vorschlag ${selected} ${unit}` : "Fachlich festlegen"}</strong><p>{note}</p></div></article>;
}
function RecommendationGroup({ group, index }) {
  return <article className={`recommendation-group group-${group.id}`}><span className="recommendation-index">{index}</span><div><h4>{group.title}</h4><div className="recommendation-why"><Info size={14} /><span><b>Warum:</b> {group.why}</span></div>{group.items.map((item) => <p key={item}><Check size={14} />{item}</p>)}</div></article>;
}
function GuidelineSource({ source }) {
  return <a className="guideline-source" href={source.url} target="_blank" rel="noreferrer"><span><BookOpen size={18} /></span><div><b>{source.title}</b><small>{source.id} · {source.recommendation} · Version {source.version}</small><p>{source.note}</p><em>Geltungsbereich: {source.scope}</em></div><ExternalLink size={16} /></a>;
}

createRoot(document.getElementById("root")).render(<App />);
