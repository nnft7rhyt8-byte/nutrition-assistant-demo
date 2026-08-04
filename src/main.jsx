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

const STORAGE_KEY = "nutripilot-v1.4-patients";
const LEGACY_STORAGE_KEYS = ["nutripilot-v1.3-patients", "nutripilot-v1.2.1-patients", "nutripilot-v1.2-patients", "nutripilot-v1.1-patients", "nutripilot-v1-patients"];
const APP_VERSION = "v1.4 Therapieplan & Export";


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
  niceParenteral2017: {
    id: "NICE-CG32-PN-2017",
    title: "NICE CG32 – Parenteral nutrition in hospital and the community",
    version: "zuletzt aktualisiert 2017",
    recommendation: "1.4.1–1.5.5 und 1.8.1–1.9.7",
    url: "https://www.nice.org.uk/guidance/cg32/chapter/Recommendations",
    note: "Indikation, progressive Einleitung, Monitoring, Zugangsweg und multidisziplinäre Versorgung der parenteralen Ernährung.",
    scope: "Erwachsene mit Mangelernährung oder Risiko, wenn oral/enteral unzureichend oder unsicher ist oder der Gastrointestinaltrakt nicht funktionell, nicht zugänglich oder undicht ist.",
    type: "Leitlinienregel",
    status: "publiziert",
  },
  espenHPN2023: {
    id: "ESPEN-HPN-2023",
    title: "ESPEN practical guideline: Home parenteral nutrition",
    version: "2023",
    recommendation: "Practical guideline",
    url: "https://www.espen.org/guidelines/espen-practical-guidelines-pdf-versions",
    note: "Versorgungsstruktur, Training, Kathetermanagement, Monitoring und langfristige Betreuung bei parenteraler Ernährung zu Hause.",
    scope: "Erwachsene mit geplanter oder bestehender parenteraler Ernährung im häuslichen Setting.",
    type: "Leitlinienregel",
    status: "publiziert",
  },
  espenCIF2023: {
    id: "ESPEN-CIF-2023",
    title: "ESPEN guideline on chronic intestinal failure in adults",
    version: "2023",
    recommendation: "Scientific guideline",
    url: "https://www.espen.org/guidelines-home/espen-guidelines",
    note: "Spezialisierte Versorgung bei chronischem Darmversagen einschließlich parenteraler Ernährung und Langzeitmonitoring.",
    scope: "Erwachsene mit chronischem Darmversagen.",
    type: "Leitlinienregel",
    status: "publiziert",
  },
  espenICU2023: {
    id: "ESPEN-ICU-2023",
    title: "ESPEN practical and partially revised guideline: Clinical nutrition in the intensive care unit",
    version: "2023",
    recommendation: "Practical guideline",
    url: "https://www.espen.org/guidelines/espen-practical-guidelines-pdf-versions",
    note: "Spezialisierte Ernährungstherapie in der Intensivmedizin; in NutriPilot v1.3 nur als Fachkontext, nicht als autonomer Dosierungsalgorithmus.",
    scope: "Kritisch kranke erwachsene Intensivpatientinnen und -patienten.",
    type: "Leitlinienregel",
    status: "publiziert",
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
  routeSelection: {
    id: "NP-ROUTE-01",
    title: "Transparente Auswahl des Ernährungswegs",
    note: "Oral, enteral, parenteral oder kombiniert werden anhand dokumentierter Schlucksicherheit, GI-Funktion, erreichter Bedarfsdeckung und Therapieziel verglichen.",
    type: "NutriPilot-MVP-Regel",
    status: "Demo – fachlich zu validieren",
  },
  parenteralGate: {
    id: "NP-PN-01",
    title: "Parenterale Ernährung: Indikations- und Teamgate",
    note: "Eine PN-Planungsansicht wird erst freigabefähig, wenn Indikation, Refeeding-Sicherheit, Zugangsweg, ärztliche Entscheidung, Pharmazie- und Ernährungsteamprüfung dokumentiert sind.",
    type: "NutriPilot-MVP-Regel",
    status: "Demo – fachlich zu validieren",
  },
  unsupportedContext: {
    id: "NP-SCOPE-01",
    title: "Nicht oder nur spezialisiert unterstützter Kontext",
    note: "Pädiatrie, Schwangerschaft, seltene Stoffwechselerkrankungen und komplexe Intensiv-/Organversagenssituationen erhalten keine allgemeine automatische Zielwertfreigabe.",
    type: "NutriPilot-Anwendungsgrenze",
    status: "verbindliche Sicherheitsgrenze im MVP",
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

  makePatient({
    id: "P-001251",
    patientNumber: "1002519",
    firstName: "Monika",
    lastName: "Weber",
    birthDate: "1964-05-12",
    sex: "weiblich",
    station: "5A Viszeralchirurgie",
    room: "07",
    admissionDate: "2026-08-02",
    dischargeDate: "2026-08-16",
    priority: 92,
    consultStatus: "Therapie",
    caseStatus: "PN-Indikation prüfen",
    scenario: "Postoperativer Ileus · Parenterale Ernährung",
    screening: 5,
    reason: "Postoperativer Ileus · orale und enterale Zufuhr derzeit nicht möglich",
    nextStep: "PN-Plan interprofessionell bestätigen",
    assessment: {
      weight: 64.2,
      height: 169,
      weight1m: 66.8,
      weight3m: 69.5,
      intakePercent: 0,
      intakeDays: 6,
      proteinPercent: 0,
      fluidMl: 900,
      appetite: "nicht beurteilbar",
      swallowing: "unauffällig",
      muscleReduced: "yes",
      inflammation: "yes",
      edema: false,
      ascites: false,
      renalStatus: "normal",
      liverStatus: "normal",
      cardiacStatus: "normal",
      fluidRestriction: false,
      potassiumStatus: "normal",
      phosphateStatus: "normal",
      magnesiumStatus: "normal",
      glucoseStatus: "normal",
      triglycerideStatus: "normal",
      giTractStatus: "nonfunctional",
      enteralFeasible: "no",
      enteralTolerance: "intolerant",
      expectedNutritionDuration: 10,
      venousAccess: "PICC",
      pnIndicationConfirmed: true,
      pnSpecialistReview: true,
      pnPhysicianApproval: true,
      pnPharmacyReview: true,
      pnNursingReview: true,
      patientConsent: "yes",
      patientGoal: "Komplikationsarme Überbrückung bis zur Wiederherstellung der gastrointestinalen Passage.",
      preferences: "Möglichst früh wieder enteral/oral, sobald medizinisch vertretbar.",
      implementationBarriers: "Postoperativer Ileus; derzeit keine enterale Toleranz.",
      amputation: { present: false, label: "Keine Amputation", percent: 0, bilateral: false },
      notes: "PN als zeitlich begrenzte Überbrückung; tägliche Prüfung der enteralen Perspektive.",
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
      patientGoal: "",
      preferences: "",
      implementationBarriers: "",
      giTractStatus: "unknown",
      enteralFeasible: "unknown",
      enteralTolerance: "unknown",
      expectedNutritionDuration: "",
      venousAccess: "unknown",
      glucoseStatus: "unknown",
      triglycerideStatus: "unknown",
      pnIndicationConfirmed: false,
      pnSpecialistReview: false,
      pnPhysicianApproval: false,
      pnPharmacyReview: false,
      pnNursingReview: false,
      patientConsent: "unknown",
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
      routeDecision: "",
      successCriteria: "",
      adaptationCriteria: "",
      escalationCriteria: "",
      professionalFeedback: "",
      professionalFeedbackReason: "",
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

function therapyRecommendation(patient, alternative = patient.therapy?.recommendationAlternative || "standard", assessmentOverride = {}) {
  const a = { ...(patient.assessment || {}), ...assessmentOverride };
  const simulatedPatient = { ...patient, assessment: a };
  const metrics = assessmentMetrics(simulatedPatient);
  const age = Number(ageFromBirthDate(patient.birthDate)) || 0;
  const weightBasis = a.amputation?.present ? metrics.correctedWeight : metrics.observedWeight;
  const bmi = a.amputation?.present ? metrics.correctedBmi : metrics.observedBmi;
  const hasIntake = a.intakePercent !== "" && a.intakePercent !== null && a.intakePercent !== undefined;
  const intakePercent = hasIntake ? number(a.intakePercent) : 0;
  const intakeDays = number(a.intakeDays);
  const screening = number(patient.screening);
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
  const oralSafe = !swallowUnclear && swallowPlanReady;

  const unsupportedContext = age > 0 && age < 18 || scenario.includes("pädi") || scenario.includes("schwanger") || scenario.includes("stoffwechselerkrank");
  const specialistContext = scenario.includes("intensiv") || station.includes("intensiv") || (a.renalStatus === "impaired" && a.liverStatus === "impaired");

  const giStatus = a.giTractStatus || "unknown";
  const giNonFunctional = ["nonfunctional", "inaccessible", "leaking"].includes(giStatus);
  const giFunctional = giStatus === "functional";
  const enteralFeasible = a.enteralFeasible || "unknown";
  const enteralTolerance = a.enteralTolerance || "unknown";
  const expectedDuration = number(a.expectedNutritionDuration);
  const nutritionRisk = screening >= 3 || (bmi > 0 && bmi < 18.5) || metrics.weightLoss >= 5 || (hasIntake && intakePercent < 75 && intakeDays >= 5);
  const oralEnteralInadequate = hasIntake && intakePercent < 75;

  let pnStatus = "insufficient";
  let pnLabel = "PN-Indikation nicht abschließend beurteilbar";
  let pnRationale = "GI-Funktion, enterale Machbarkeit oder tatsächliche Bedarfsdeckung sind noch nicht vollständig dokumentiert.";
  if (!nutritionRisk) {
    pnStatus = "not_indicated";
    pnLabel = "Keine PN-Indikation aus den aktuellen Daten";
    pnRationale = "Es ist aktuell weder eine relevante Mangelernährung/Risikosituation noch eine unzureichende Versorgung dokumentiert.";
  } else if (giNonFunctional) {
    pnStatus = "indicated";
    pnLabel = "Parenterale Ernährung fachlich prüfen";
    pnRationale = "Der Gastrointestinaltrakt ist als nicht funktionell, nicht zugänglich oder undicht dokumentiert; oral/enteral ist damit nicht ausreichend nutzbar.";
  } else if (oralEnteralInadequate && (enteralFeasible === "no" || enteralTolerance === "intolerant")) {
    pnStatus = "indicated";
    pnLabel = "Parenterale Ernährung fachlich prüfen";
    pnRationale = "Orale/enterale Bedarfsdeckung ist unzureichend und eine enterale Versorgung ist nicht möglich oder nicht toleriert.";
  } else if (oralEnteralInadequate && enteralTolerance === "limited") {
    pnStatus = "supplementary";
    pnLabel = "Supplementäre PN prüfen";
    pnRationale = "Enterale Ernährung ist möglich, erreicht den Bedarf aber voraussichtlich nicht vollständig.";
  } else if (giFunctional && enteralFeasible === "yes" && oralEnteralInadequate) {
    pnStatus = "not_first_line";
    pnLabel = "Enterale Ernährung vor PN priorisieren";
    pnRationale = "Der Gastrointestinaltrakt ist funktionell und enterale Ernährung ist möglich; PN ist daher nicht die erste Eskalationsstufe.";
  } else if (!oralEnteralInadequate) {
    pnStatus = "not_indicated";
    pnLabel = "PN derzeit nicht erforderlich";
    pnRationale = "Die dokumentierte orale/enterale Bedarfsdeckung ist derzeit nicht klar unzureichend.";
  }

  const pnRequired = ["indicated", "supplementary"].includes(pnStatus);
  const pnPrerequisites = [
    { key: "indication", label: "Indikation fachlich bestätigt", ready: Boolean(a.pnIndicationConfirmed), owner: "Ernährungsfachkraft / ärztlicher Dienst" },
    { key: "specialist", label: "Ernährungsteam eingebunden", ready: Boolean(a.pnSpecialistReview), owner: "Ernährungsteam" },
    { key: "physician", label: "Ärztliche Entscheidung dokumentiert", ready: Boolean(a.pnPhysicianApproval), owner: "Ärztlicher Dienst" },
    { key: "pharmacy", label: "Pharmazeutische Prüfung dokumentiert", ready: Boolean(a.pnPharmacyReview), owner: "Krankenhausapotheke" },
    { key: "nursing", label: "Zugangs-/Pflegeprüfung dokumentiert", ready: Boolean(a.pnNursingReview), owner: "Pflege / Nutrition Support Nurse" },
    { key: "access", label: "Venöser Zugangsweg geklärt", ready: Boolean(a.venousAccess && a.venousAccess !== "unknown"), owner: "Ärztlicher Dienst / Pflege" },
    { key: "consent", label: "Patientenwille / Einwilligung dokumentiert", ready: a.patientConsent === "yes", owner: "Behandlungsteam" },
    { key: "electrolytes", label: "Kalium, Phosphat, Magnesium dokumentiert", ready: !unknownLabs && !lowLabs, owner: "Ärztlicher Dienst / Labor" },
    { key: "metabolic", label: "Glukose und Triglyzeride eingeordnet", ready: [a.glucoseStatus, a.triglycerideStatus].every((value) => value && value !== "unknown"), owner: "Ärztlicher Dienst / Labor" },
    { key: "organs", label: "Nieren-, Leber- und Volumenstatus eingeordnet", ready: [a.renalStatus, a.liverStatus, a.cardiacStatus].every((value) => value && value !== "unknown"), owner: "Behandlungsteam" },
  ];
  const pnOpenPrerequisites = pnPrerequisites.filter((item) => !item.ready);
  const pnReady = !pnRequired || pnOpenPrerequisites.length === 0;

  const safetyChecks = [];
  safetyChecks.push({
    key: "scope",
    status: unsupportedContext ? "block" : specialistContext ? "warning" : "ok",
    title: unsupportedContext ? "Kontext außerhalb des v1.3-Regelwerks" : specialistContext ? "Spezialisiertes Setting erforderlich" : "Anwendungsbereich",
    detail: unsupportedContext ? "Für diesen Kontext erzeugt NutriPilot keine quantitative Empfehlung." : specialistContext ? "Zielwerte und Route dürfen nur als interprofessioneller Spezialentwurf verwendet werden." : "Erwachsener klinischer Ernährungskontext im MVP-Anwendungsbereich.",
    source: LOCAL_RULES.unsupportedContext.id,
    action: unsupportedContext ? "Spezialteam einbeziehen" : specialistContext ? "fachärztliche und pharmazeutische Prüfung" : "keine",
  });
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
      detail: patient.therapy?.weightBasisConfirmed ? `Korrigierte Gewichtsbasis ${metrics.correctedWeight.toFixed(1)} kg wurde fachlich bestätigt.` : `Segment ${a.amputation.label}, ${metrics.segmentPercent.toFixed(1)} %. Die Verwendung des korrigierten Gewichts muss bestätigt werden.`,
      source: "Deterministische Berechnung · Segmentkorrektur",
      action: patient.therapy?.weightBasisConfirmed ? "keine" : "Rechenweg und Segment fachlich bestätigen",
    });
  }
  safetyChecks.push({
    key: "refeeding",
    status: refeedingRisk ? (unknownLabs || lowLabs ? "block" : "warning") : "ok",
    title: "Refeeding-Sicherheit",
    detail: refeedingRisk ? unknownLabs ? `Erhöhtes Risiko (${majorRefeedingCount} Haupt- / ${minorRefeedingCount} Nebenkriterien); Elektrolyte nicht vollständig dokumentiert.` : lowLabs ? "Erhöhtes Risiko und mindestens ein auffälliger Elektrolytstatus." : "Erhöhtes Risiko; vorsichtiger Aufbau und engmaschiges Monitoring erforderlich." : "Kein hohes Risiko aus den aktuell dokumentierten Kriterien abgeleitet.",
    source: "NICE CG32 · 1.4.6–1.4.8",
    action: refeedingRisk ? "lokalen Refeeding-Standard und Spezialwissen anwenden" : "keine",
  });
  safetyChecks.push({
    key: "swallow",
    status: oralSafe ? (dysphagia ? "warning" : "ok") : "warning",
    title: "Sichere orale Zufuhr",
    detail: oralSafe ? dysphagia ? "Bestätigte Kostform/Schluckplan berücksichtigen und re-evaluieren." : "Keine dokumentierte Einschränkung der Schlucksicherheit." : "Orale Zufuhr ist nicht sicher freigebbar; die Route muss enteral oder parenteral beurteilt werden.",
    source: "Assessment · Schluckstatus / NICE CG32 · 1.3.3, 1.6.6, 1.7.1",
    action: oralSafe ? "Verträglichkeit beobachten" : "Schluckdiagnostik und alternativen Ernährungsweg prüfen",
  });
  if (a.edema || a.ascites) safetyChecks.push({ key: "fluidweight", status: "warning", title: "Gewicht durch Flüssigkeit beeinflusst", detail: "Ödeme oder Aszites können Gewicht und Verlauf verfälschen.", source: "Assessment · Volumenstatus", action: "Trockengewicht oder alternative Verlaufsparameter prüfen" });
  if (a.fluidRestriction || [a.renalStatus, a.cardiacStatus].includes("impaired")) safetyChecks.push({ key: "fluid", status: "warning", title: "Flüssigkeitsziel individualisieren", detail: "Restriktion oder Organfunktionsstörung ist dokumentiert.", source: "Assessment · Organ-/Volumenstatus", action: "Flüssigkeitsziel interprofessionell festlegen" });
  if ([a.renalStatus, a.liverStatus, a.cardiacStatus].includes("unknown")) safetyChecks.push({ key: "organs", status: "warning", title: "Organfunktion noch nicht vollständig eingeordnet", detail: "Protein-, Flüssigkeits- und PN-Planung müssen klinisch gegengeprüft werden.", source: "Assessment · Therapiesicherheit", action: "Organfunktion prüfen" });
  if (pnRequired && !pnReady) safetyChecks.push({ key: "pn", status: "block", title: "PN-Teamgate noch offen", detail: `${pnOpenPrerequisites.length} Voraussetzung${pnOpenPrerequisites.length === 1 ? "" : "en"} für eine freigabefähige PN-Planung fehlen.`, source: `${LOCAL_RULES.parenteralGate.id} + NICE CG32 1.8.1–1.8.3`, action: "Indikation, Team, Labor, Zugangsweg und Patientenwille vollständig dokumentieren" });
  const routeResolvable = oralSafe || (giFunctional && enteralFeasible === "yes") || pnRequired;
  if (!routeResolvable) safetyChecks.push({ key: "route", status: "block", title: "Ernährungsweg nicht ausreichend geklärt", detail: "Orale Zufuhr ist nicht sicher und enterale beziehungsweise parenterale Machbarkeit ist noch nicht beurteilbar.", source: `${LOCAL_RULES.routeSelection.id} + NICE CG32 1.3.3`, action: "GI-Funktion, enterale Machbarkeit und PN-Indikation erfassen" });

  const sources = [];
  let energyPerKg = [25, 35];
  let proteinPerKg = [0.8, 1.5];
  let ruleLabel = "Allgemeiner erwachsener Krankenhausfall";
  let ruleReason = "Kein spezifischer geriatrischer oder onkologischer Kontext wurde sicher erkannt; deshalb wird nur ein breiter allgemeiner Korridor gezeigt.";
  let targetMode = "numeric";
  const isOncology = scenario.includes("onkologie") || station.includes("onkologie") || scenario.includes("tumor") || scenario.includes("cancer");
  const isGeriatric = age >= 65 || scenario.includes("geriatr") || scenario.includes("dysphag");
  const isHomePN = scenario.includes("home") && pnRequired || scenario.includes("kurzdarm") || scenario.includes("darmversagen");

  if (isOncology) {
    energyPerKg = [25, 30]; proteinPerKg = [1.0, 1.5]; ruleLabel = "Onkologischer Kontext"; ruleReason = "Tumorerkrankung beziehungsweise onkologischer Versorgungskontext ist dokumentiert."; sources.push({ ...GUIDELINES.espenCancer2021, applicability: "anwendbar", applicabilityReason: "Onkologischer Kontext dokumentiert." });
  } else if (isGeriatric) {
    energyPerKg = [27, 30];
    const higherProteinNeed = a.inflammation === "yes" || a.muscleReduced === "yes" || metrics.weightLoss >= 5;
    proteinPerKg = higherProteinNeed ? [1.2, 1.5] : [1.0, 1.2];
    ruleLabel = "Älterer beziehungsweise geriatrischer Patient";
    ruleReason = higherProteinNeed ? "Alter plus Krankheitslast, reduzierte Muskelmasse oder relevanter Gewichtsverlust sprechen für den höheren Protein-Korridor." : "Geriatrischer Kontext ohne bestätigtes Merkmal für den höheren Protein-Korridor.";
    sources.push({ ...GUIDELINES.dgemGeriatrics2025, applicability: "anwendbar", applicabilityReason: "Alter/geriatrischer Kontext dokumentiert." }, { ...GUIDELINES.espenGeriatrics2022, applicability: "anwendbar", applicabilityReason: "Alter/geriatrischer Kontext dokumentiert." });
  } else {
    sources.push({ ...GUIDELINES.niceNutrition2017, applicability: "bedingt anwendbar", applicabilityReason: "Allgemeiner Erwachsenenkorridor; diagnose- und situationsspezifische Prüfung erforderlich." }, { ...GUIDELINES.espenPolymorbid2024, applicability: "bedingt anwendbar", applicabilityReason: "Nur bei polymorbidem internistischem Kontext vollständig passend." });
  }
  if (pnRequired || pnStatus === "not_first_line") sources.push({ ...GUIDELINES.niceParenteral2017, applicability: "anwendbar", applicabilityReason: "Ernährungsweg und PN-Indikation werden geprüft." });
  if (isHomePN) sources.push({ ...GUIDELINES.espenHPN2023, applicability: "bedingt anwendbar", applicabilityReason: "Nur bei geplanter häuslicher PN relevant." }, { ...GUIDELINES.espenCIF2023, applicability: scenario.includes("darmversagen") || scenario.includes("kurzdarm") ? "anwendbar" : "nicht beurteilbar", applicabilityReason: "Chronisches Darmversagen muss diagnostisch bestätigt sein." });
  if (specialistContext) sources.push({ ...GUIDELINES.espenICU2023, applicability: "bedingt anwendbar", applicabilityReason: "Intensiv-/Spezialkontext erkannt; v1.3 übernimmt keine ICU-Dosierungslogik." });

  if (scenario.includes("adipositas") || bmi >= 30) {
    targetMode = "individual";
    ruleLabel = "Adipositas mit möglicher Mangelernährung";
    ruleReason = "Ein hoher BMI schließt Mangelernährung nicht aus; die geeignete Berechnungsbasis muss individuell festgelegt werden.";
    safetyChecks.push({ key: "obesity", status: "warning", title: "Keine scheinpräzise kg-basierte Automatik", detail: "Gewichtsbasis und Zielsetzung müssen individuell festgelegt werden.", source: "NutriPilot Anwendungsgrenze", action: "individuelle Berechnungsbasis dokumentieren" });
  }
  if (unsupportedContext) targetMode = "individual";

  const blocked = safetyChecks.some((item) => item.status === "block");
  const warnings = safetyChecks.filter((item) => item.status === "warning");
  const fluidAutoAllowed = !a.fluidRestriction && a.renalStatus !== "impaired" && a.cardiacStatus !== "impaired";
  const targetValues = targetMode === "numeric" && weightBasis > 0 ? {
    energyLow: roundTo(weightBasis * energyPerKg[0], 25), energyHigh: roundTo(weightBasis * energyPerKg[1], 25),
    proteinLow: roundTo(weightBasis * proteinPerKg[0], 1), proteinHigh: roundTo(weightBasis * proteinPerKg[1], 1),
    fluidLow: fluidAutoAllowed ? roundTo(weightBasis * 30, 50) : null, fluidHigh: fluidAutoAllowed ? roundTo(weightBasis * 35, 50) : null,
  } : { energyLow: null, energyHigh: null, proteinLow: null, proteinHigh: null, fluidLow: null, fluidHigh: null };
  const selected = {
    energy: targetValues.energyLow == null ? null : alternative === "vorsichtig" ? targetValues.energyLow : roundTo((targetValues.energyLow + targetValues.energyHigh) / 2, 25),
    protein: targetValues.proteinLow == null ? null : alternative === "protein" ? targetValues.proteinHigh : alternative === "vorsichtig" ? targetValues.proteinLow : roundTo((targetValues.proteinLow + targetValues.proteinHigh) / 2, 1),
    fluid: targetValues.fluidLow == null ? null : alternative === "vorsichtig" ? targetValues.fluidLow : roundTo((targetValues.fluidLow + targetValues.fluidHigh) / 2, 50),
  };

  const coverage = hasIntake ? Math.max(0, Math.min(100, intakePercent)) : 0;
  const energyGap = selected.energy && hasIntake ? roundTo(selected.energy * (1 - coverage / 100), 25) : null;
  const proteinGap = selected.protein && hasIntake ? roundTo(selected.protein * (1 - coverage / 100), 1) : null;
  const initialCeiling = selected.energy ? roundTo(selected.energy * 0.5, 25) : null;
  const provisionalPnEnergy = pnRequired && energyGap != null && initialCeiling != null && !refeedingRisk ? Math.min(energyGap, initialCeiling) : null;
  const accessOrientation = expectedDuration > 0 && expectedDuration < 14 ? "Peripherer Zugang kann bei kurzer voraussichtlicher Dauer fachlich geprüft werden; Osmolarität, pH und Kompatibilität bleiben pharmazeutisch/ärztlich zu entscheiden." : expectedDuration >= 14 ? "Zentraler Zugang beziehungsweise PICC fachlich prüfen; der konkrete Zugang ist interprofessionell festzulegen." : "Voraussichtliche Dauer dokumentieren, bevor ein Zugangsweg vorgeschlagen wird.";

  let routeDecision = { route: "oral", label: "Orale Strategie", rationale: "Orale Ernährung ist sicher und die Bedarfsdeckung kann zunächst hier optimiert werden.", tone: "ok" };
  if (unsupportedContext) routeDecision = { route: "specialist", label: "Spezialteam erforderlich", rationale: "Der Kontext liegt außerhalb des allgemeinen v1.3-Regelwerks.", tone: "block" };
  else if (pnStatus === "indicated") routeDecision = { route: "parenteral", label: "Parenterale Ernährung prüfen", rationale: pnRationale, tone: pnReady ? "warning" : "block" };
  else if (pnStatus === "supplementary") routeDecision = { route: "combination", label: "Enteral/oral plus supplementäre PN prüfen", rationale: pnRationale, tone: "warning" };
  else if (!oralSafe && giFunctional && enteralFeasible === "yes") routeDecision = { route: "enteral", label: "Enterale Ernährung priorisieren", rationale: "Orale Zufuhr ist nicht sicher, der Gastrointestinaltrakt ist funktionell und enteral zugänglich.", tone: "warning" };
  else if (oralEnteralInadequate && giFunctional && enteralFeasible === "yes") routeDecision = { route: "enteral", label: "Enterale Eskalation prüfen", rationale: "Orale Zielerreichung ist unzureichend; enterale Ernährung ist möglich.", tone: "warning" };
  else if (!oralSafe) routeDecision = { route: "open", label: "Ernährungsweg noch offen", rationale: "Orale Zufuhr ist nicht sicher und GI-/Zugangsstatus reicht für eine sichere Routenwahl noch nicht aus.", tone: "block" };

  const safetyMeasures = [];
  if (refeedingRisk) safetyMeasures.push("Refeeding-Risiko unabhängig vom Ernährungsweg nach lokal freigegebenem Standard steuern; NutriPilot berechnet keine Elektrolytdosierungen.");
  if (!oralSafe) safetyMeasures.push("Orale Zufuhr nicht als freigegeben behandeln; Schluckdiagnostik und alternative Route dokumentieren.");
  if (a.amputation?.present) safetyMeasures.push("Segmentkorrektur, Rechenweg und Gewichtsbasis sichtbar halten.");
  if (!safetyMeasures.length) safetyMeasures.push("Datenstand, Verträglichkeit und Patientenwillen vor Aktivierung prüfen.");

  const routeMeasures = [
    `Vorgeschlagener Ernährungsweg: ${routeDecision.label}.`,
    `Begründung: ${routeDecision.rationale}`,
    a.patientGoal ? `Dokumentiertes Patientenziel: ${a.patientGoal}` : "Patientenziel vor finaler Entscheidung ergänzen.",
    a.preferences ? `Präferenzen/Umsetzbarkeit berücksichtigen: ${a.preferences}` : "Präferenzen und Umsetzbarkeit erheben.",
  ];
  const oralMeasures = [];
  if (oralSafe) {
    oralMeasures.push(isGeriatric ? "Energie- und proteinangereicherte Mahlzeiten, kleine häufige Portionen und Essunterstützung prüfen." : "Kostform, Energie-/Proteindichte, Symptome und Präferenzen gezielt optimieren.");
    if (intakePercent > 0 && intakePercent < 75) oralMeasures.push(`Dokumentierte Bedarfsdeckung ${intakePercent} %: Defizit sichtbar machen und ergänzende Trinknahrung abhängig von Sicherheit und Akzeptanz prüfen.`);
  } else oralMeasures.push("Keine automatische orale Maßnahme, solange Schlucksicherheit/Kostform nicht fachlich freigegeben ist.");

  const enteralMeasures = [];
  if (giFunctional && enteralFeasible === "yes") enteralMeasures.push("Enterale Ernährung als bevorzugte nicht-orale Route prüfen, wenn orale Aufnahme unsicher oder unzureichend ist.");
  else if (giNonFunctional || enteralFeasible === "no") enteralMeasures.push("Enterale Ernährung ist nach aktuellem Datensatz nicht nutzbar; Begründung und tägliche Re-Evaluation dokumentieren.");
  else enteralMeasures.push("GI-Funktion, Zugänglichkeit und enterale Toleranz vervollständigen, bevor die Route festgelegt wird.");

  const pnMeasures = [];
  if (pnRequired) {
    pnMeasures.push(`${pnLabel}: ${pnRationale}`);
    pnMeasures.push(refeedingRisk ? "Kein automatischer Startwert: Refeeding-Protokoll und fachärztliche Steuerung haben Vorrang." : "Progressive Einleitung; NICE nennt gewöhnlich höchstens 50 % des geschätzten Gesamtbedarfs in den ersten 24–48 Stunden. Alle oralen, enteralen, parenteralen und intravenösen Quellen müssen gemeinsam bilanziert werden.");
    pnMeasures.push(`Planungsorientierung: geschätzte aktuelle Deckung ${coverage} %, verbleibende Lücke ${energyGap ?? "offen"} kcal und ${proteinGap ?? "offen"} g Protein. ${provisionalPnEnergy ? `Vorläufige PN-Energie zur Teamprüfung maximal ${provisionalPnEnergy} kcal/Tag im Startfenster.` : "Keine automatische PN-Menge freigegeben."}`);
    pnMeasures.push(accessOrientation);
    pnMeasures.push("Makronährstoffverteilung, Elektrolyte, Mikronährstoffe, Insulin/Medikamente und konkrete Produkt-/Beutelwahl ausschließlich durch qualifiziertes Ernährungsteam, ärztlichen Dienst und Krankenhausapotheke festlegen.");
  } else pnMeasures.push(`${pnLabel}. ${pnRationale}`);

  const reviewDays = refeedingRisk || pnRequired || intakePercent < 50 ? 1 : 2;
  const monitoring = [
    { parameter: "Gesamte Nährstoffzufuhr aus allen Wegen", interval: "täglich initial, bei Stabilität reduzieren", trigger: "Zielunter- oder Überdeckung / Routenwechsel", source: "NICE CG32 1.4.1 und Tabelle 1" },
    { parameter: "Tatsächlich verabreichtes Volumen", interval: "täglich initial", trigger: "Abweichung von Plan oder Unterbrechung", source: "NICE CG32 Tabelle 1" },
    { parameter: "Gewicht und Flüssigkeitsbilanz", interval: a.edema || a.ascites || pnRequired ? "täglich/klinisch angepasst" : "2× pro Woche", trigger: "Volumenüberlastung, Dehydratation oder unerwartete Änderung", source: "NICE CG32 Monitoring" },
    { parameter: "Therapie- und Zielerreichung", interval: `in ${reviewDays} Tag${reviewDays === 1 ? "" : "en"}`, trigger: "Ziel nicht erreichbar oder klinische Verschlechterung", source: "NutriPilot Monitoringregel" },
  ];
  if (pnRequired) monitoring.push(
    { parameter: "Na, K, Harnstoff, Kreatinin", interval: "Basis, täglich bis stabil, dann 1–2×/Woche", trigger: "Abweichung / veränderter Flüssigkeits- oder Nierenstatus", source: "NICE CG32 Tabelle 2" },
    { parameter: "Glukose", interval: "Basis, 1–2×/Tag bis stabil, dann wöchentlich", trigger: "Hypo-/Hyperglykämie", source: "NICE CG32 Tabelle 2" },
    { parameter: "Magnesium und Phosphat", interval: refeedingRisk ? "Basis und täglich bei Refeeding-Risiko" : "Basis, anschließend nach Stabilität", trigger: "Abfall oder klinische Refeeding-Zeichen", source: "NICE CG32 Tabelle 2" },
    { parameter: "Leberwerte inkl. INR", interval: "Basis, 2×/Woche bis stabil, dann wöchentlich", trigger: "zunehmende Auffälligkeit", source: "NICE CG32 Tabelle 2" },
    { parameter: "Zugang / Katheterkomplikationen", interval: "bei jeder Versorgung nach lokalem Standard", trigger: "Schmerz, Rötung, Fieber, Okklusion oder Leckage", source: "lokaler Katheterstandard + Nutrition Support Team" },
  );

  const evidence = [
    { domain: "Anthropometrie", label: "Gewichtsbasis", value: weightBasis > 0 ? `${weightBasis.toFixed(1)} kg${a.amputation?.present ? " korrigiert" : " beobachtet"}` : "offen", state: weightBasis > 0 ? "confirmed" : "open", source: a.amputation?.present ? "Assessment + Berechnung" : "Assessment", meaning: "Basis der kg-bezogenen Korridore" },
    { domain: "Verlauf", label: "Gewichtsverlust", value: metrics.weightLoss > 0 ? `${metrics.weightLoss.toFixed(1)} %` : "nicht berechenbar", state: metrics.weightLoss > 0 ? "confirmed" : "open", source: "Assessment", meaning: metrics.weightLoss >= 5 ? "relevantes Verlaufssignal" : "kein deutlicher Verlust dokumentiert" },
    { domain: "Aufnahme", label: "Orale/enterale Bedarfsdeckung", value: hasIntake ? `${coverage} % über ${intakeDays || "–"} Tage` : "offen", state: !hasIntake ? "open" : coverage < 75 ? "warning" : "confirmed", source: "Assessment · Aufnahme", meaning: coverage < 75 ? "Versorgungslücke wahrscheinlich" : "keine klare Unterdeckung dokumentiert" },
    { domain: "Ernährungsweg", label: "Gastrointestinaltrakt", value: giStatusLabel(giStatus), state: giStatus === "unknown" ? "open" : giNonFunctional ? "warning" : "confirmed", source: "Assessment · Ernährungsweg", meaning: "entscheidet mit über enterale versus parenterale Strategie" },
    { domain: "Ernährungsweg", label: "Enterale Machbarkeit/Toleranz", value: `${yesNoUnknown(enteralFeasible)} / ${enteralToleranceLabel(enteralTolerance)}`, state: enteralFeasible === "unknown" || enteralTolerance === "unknown" ? "open" : enteralFeasible === "no" || enteralTolerance === "intolerant" ? "warning" : "confirmed", source: "Assessment · Ernährungsweg", meaning: "begründet Routenwahl und PN-Indikation" },
    { domain: "Sicherheit", label: "Schluckstatus", value: a.swallowing || "offen", state: oralSafe ? (dysphagia ? "warning" : "confirmed") : "open", source: "Assessment", meaning: oralSafe ? "orale Route grundsätzlich planbar" : "orale Route nicht freigabefähig" },
    { domain: "Sicherheit", label: "Refeeding", value: refeedingRisk ? `${majorRefeedingCount} Haupt- / ${minorRefeedingCount} Nebenkriterien` : "kein hohes Risiko abgeleitet", state: refeedingRisk ? (unknownLabs || lowLabs ? "open" : "warning") : "confirmed", source: "NICE CG32 + Assessment", meaning: "beeinflusst Start und Monitoring aller Ernährungswege" },
    { domain: "Patientenzentrierung", label: "Ziel und Präferenzen", value: a.patientGoal || "offen", state: a.patientGoal ? "confirmed" : "open", source: "Assessment · Patientenziel", meaning: "prüft Passung und Umsetzbarkeit" },
    { domain: "PN-Sicherheit", label: "Interprofessionelles PN-Gate", value: pnRequired ? `${pnPrerequisites.length - pnOpenPrerequisites.length}/${pnPrerequisites.length} Voraussetzungen erfüllt` : "derzeit nicht erforderlich", state: pnRequired ? (pnReady ? "confirmed" : "open") : "confirmed", source: "NICE CG32 + lokaler PN-Workflow", meaning: "verhindert unvollständige PN-Freigabe" },
  ];
  const verifiedEvidence = evidence.filter((item) => item.state === "confirmed").length;
  const openEvidence = evidence.filter((item) => item.state === "open").length;
  const decisionCompleteness = Math.round((verifiedEvidence / evidence.length) * 100);
  const dataQuality = blocked ? "nicht freigegeben" : openEvidence >= 3 ? "eingeschränkt" : warnings.length >= 2 ? "mit Vorbehalten" : "gut nachvollziehbar";

  const calculations = [
    { label: "Gewichtsbasis", formula: a.amputation?.present ? `${metrics.observedWeight.toFixed(1)} kg ÷ (1 − ${(metrics.segmentPercent / 100).toFixed(3)})` : `${metrics.observedWeight.toFixed(1)} kg beobachtetes Gewicht`, result: weightBasis > 0 ? `${weightBasis.toFixed(1)} kg` : "nicht berechenbar", rationale: a.amputation?.present ? "Segmentkorrektur; fachlich zu bestätigen" : "keine Segmentkorrektur", source: a.amputation?.present ? "Deterministische Berechnung" : "Assessment" },
    { label: "BMI", formula: `${weightBasis > 0 ? weightBasis.toFixed(1) : "?"} kg ÷ (${number(a.height) / 100 || "?"} m)²`, result: bmi > 0 ? `${bmi.toFixed(1)} kg/m²` : "nicht berechenbar", rationale: a.edema || a.ascites ? "eingeschränkt interpretierbar" : "Risiko-/Plausibilitätsparameter", source: "Standardformel" },
    { label: "Energie-Korridor", formula: targetMode === "numeric" && weightBasis > 0 ? `${weightBasis.toFixed(1)} kg × ${energyPerKg[0]}–${energyPerKg[1]} kcal/kg` : "individuelle Berechnungsbasis erforderlich", result: targetValues.energyLow == null ? "nicht automatisch berechnet" : `${targetValues.energyLow}–${targetValues.energyHigh} kcal/Tag`, rationale: ruleLabel, source: uniqueGuidelines(sources).map((item) => item.id).join(", ") || "individuelle Festlegung" },
    { label: "Protein-Korridor", formula: targetMode === "numeric" && weightBasis > 0 ? `${weightBasis.toFixed(1)} kg × ${proteinPerKg[0].toFixed(1)}–${proteinPerKg[1].toFixed(1)} g/kg` : "individuelle Berechnungsbasis erforderlich", result: targetValues.proteinLow == null ? "nicht automatisch berechnet" : `${targetValues.proteinLow}–${targetValues.proteinHigh} g/Tag`, rationale: ruleReason, source: uniqueGuidelines(sources).map((item) => item.id).join(", ") || "individuelle Festlegung" },
    { label: "Versorgungslücke", formula: selected.energy ? `${selected.energy} kcal × (1 − ${coverage}/100)` : "Zielwert oder Bedarfsdeckung offen", result: energyGap == null ? "nicht berechenbar" : `${energyGap} kcal/Tag und ${proteinGap} g Protein/Tag`, rationale: "Planungsgröße aus dokumentierter Gesamtdeckung; keine PN-Verordnung", source: "Deterministische Berechnung" },
    { label: "PN-Startorientierung", formula: refeedingRisk ? "keine Automatik – Refeeding-Protokoll" : selected.energy ? `min(Versorgungslücke, 50 % von ${selected.energy} kcal Gesamtbedarf)` : "Zielwert offen", result: provisionalPnEnergy ? `${provisionalPnEnergy} kcal/Tag zur Teamprüfung` : "nicht automatisch freigegeben", rationale: "NICE: progressive Einleitung, gewöhnlich höchstens 50 % des geschätzten Bedarfs in 24–48 h; alle Quellen gemeinsam bilanzieren", source: "NICE-CG32-PN-2017 · 1.4.1, 1.4.4, 1.8.2" },
  ];

  const findings = [metrics.weightLoss >= 5 ? `${metrics.weightLoss.toFixed(1)} % Gewichtsverlust` : null, `${coverage} % Bedarfsdeckung`, a.muscleReduced === "yes" ? "reduzierte Muskelmasse" : null, a.inflammation === "yes" ? "Krankheitslast/Entzündung" : null, giNonFunctional ? `GI-Trakt ${giStatusLabel(giStatus)}` : null, !oralSafe ? "orale Zufuhr nicht sicher freigegeben" : null].filter(Boolean);
  const reasoningSteps = [
    { id: "findings", title: "Patientendaten bewerten", observation: findings.join(" · ") || "Datenbasis unvollständig.", ruleType: "Patientendatum + deterministische Berechnung", rule: "Nur dokumentierte Werte werden verwendet; fehlende Angaben bleiben offen.", conclusion: findings.length ? "Es bestehen ernährungstherapeutisch relevante Faktoren." : "Keine belastbare Einordnung möglich.", consequence: findings.length ? "Therapiebedarf, Route und Dringlichkeit prüfen." : "Assessment vervollständigen.", limitation: "Der Schluss beschreibt Relevanz, nicht automatisch eine konkrete Therapie.", source: "Assessment", tone: findings.length ? "warning" : "open" },
    { id: "safety", title: "Sicherheits- und Anwendungsgrenzen prüfen", observation: safetyChecks.filter((item) => item.status !== "ok").map((item) => item.title).join(" · ") || "Keine offene Sicherheitsbedingung erkannt.", ruleType: "Leitlinienregel + lokale Sicherheitsregel", rule: `${LOCAL_RULES.safetyGate.id}, ${LOCAL_RULES.unsupportedContext.id} und NICE CG32 Refeeding/Route.`, conclusion: blocked ? "Mindestens eine Voraussetzung verhindert die Freigabe." : warnings.length ? "Der Entwurf ist nur mit Vorbehalten nutzbar." : "Sicherheitsgate passiert.", consequence: blocked ? "Offene Voraussetzung bearbeiten; keine quantitative Übernahme." : "Korridore und Route als Entwurf anzeigen.", limitation: "NutriPilot ersetzt keine ärztliche oder pharmazeutische Sicherheitsentscheidung.", source: "NICE-CG32-2017 + lokale Regeln", tone: blocked ? "block" : warnings.length ? "warning" : "ok" },
    { id: "context", title: "Regelkontext und Anwendbarkeit wählen", observation: `${ruleLabel}; ${ruleReason}`, ruleType: "Leitlinienregel", rule: "Kontextspezifische Leitlinien werden bevorzugt; jede Quelle erhält eine sichtbare Anwendbarkeitsbewertung.", conclusion: targetMode === "individual" ? "Keine automatische kg-basierte Zielzahl." : `${energyPerKg[0]}–${energyPerKg[1]} kcal/kg und ${proteinPerKg[0].toFixed(1)}–${proteinPerKg[1].toFixed(1)} g Protein/kg als prüfbarer Korridor.`, consequence: "Rechenweg und Unsicherheit offenlegen.", limitation: "Korridore sind keine Produkt- oder Infusionsverordnung.", source: uniqueGuidelines(sources).map((item) => item.id).join(", ") || "individuelle Festlegung", tone: targetMode === "individual" ? "warning" : "ok" },
    { id: "route", title: "Ernährungsweg ableiten", observation: `Orale Sicherheit: ${oralSafe ? "ja" : "nein/offen"}; GI-Trakt: ${giStatusLabel(giStatus)}; enteral: ${yesNoUnknown(enteralFeasible)} / ${enteralToleranceLabel(enteralTolerance)}; Deckung: ${coverage} %.`, ruleType: "Leitlinienregel + NutriPilot-Routenmodell", rule: `${LOCAL_RULES.routeSelection.id}; NICE CG32 1.6.6, 1.7.1 und 1.8.1.`, conclusion: routeDecision.label, consequence: routeDecision.rationale, limitation: "Die endgültige Route ist eine interprofessionelle Entscheidung unter Einbezug von Nutzen, Risiken und Patientenwillen.", source: "NICE-CG32-2017 / NICE-CG32-PN-2017", tone: routeDecision.tone },
    { id: "pn", title: "Parenterale Ernährung separat prüfen", observation: `${pnLabel}; ${pnPrerequisites.length - pnOpenPrerequisites.length}/${pnPrerequisites.length} PN-Voraussetzungen erfüllt.`, ruleType: "Leitlinienregel + lokaler Workflow", rule: `NICE CG32 1.8.1–1.8.3 und ${LOCAL_RULES.parenteralGate.id}.`, conclusion: pnStatus === "indicated" ? "PN ist nach dokumentierten Kriterien fachlich zu prüfen." : pnStatus === "supplementary" ? "Supplementäre PN kann fachlich geprüft werden." : "Keine PN-Freigabe aus den aktuellen Daten.", consequence: pnRequired ? pnReady ? "PN-Planungsentwurf darf interprofessionell geprüft werden." : "Teamgate schließen, bevor Mengen übernommen werden." : "Andere Route priorisieren beziehungsweise Daten vervollständigen.", limitation: "Keine autonome Beutel-, Elektrolyt-, Insulin-, Mikronährstoff- oder Katheterverordnung.", source: "NICE-CG32-PN-2017", tone: pnRequired ? pnReady ? "warning" : "block" : "ok" },
    { id: "monitoring", title: "Erfolg und Sicherheit überprüfbar machen", observation: pnRequired || refeedingRisk || coverage < 50 ? "Hoher kurzfristiger Kontrollbedarf." : "Regulärer kurzfristiger Kontrollbedarf.", ruleType: "Leitlinienregel + Monitoringregel", rule: "Indikation, Route, Risiken, Nutzen und Ziele regelmäßig überprüfen; bei PN klinisches und laborchemisches Monitoring nach Stabilität anpassen.", conclusion: `Nächste fachliche Prüfung in ${reviewDays} Tag${reviewDays === 1 ? "" : "en"}.`, consequence: "Monitoringplan und Eskalationskriterien gemeinsam übernehmen.", limitation: "Lokale Labor- und Katheterstandards bleiben verbindlich.", source: "NICE CG32 1.5.1–1.5.5", tone: pnRequired || refeedingRisk || coverage < 50 ? "warning" : "ok" },
  ];

  const alternatives = [
    { route: "oral", suitable: oralSafe, title: "Orale Ernährung", why: oralSafe ? "Schlucksicherheit ist ausreichend dokumentiert." : "Nicht geeignet, solange die Schlucksicherheit nicht geklärt ist.", changeWhen: "Schluckstatus, Aufnahme oder Akzeptanz verändern sich." },
    { route: "enteral", suitable: giFunctional && enteralFeasible === "yes", title: "Enterale Ernährung", why: giFunctional && enteralFeasible === "yes" ? "GI-Trakt funktionell und enterale Versorgung möglich." : giNonFunctional ? "Nicht geeignet, weil der GI-Trakt aktuell nicht funktionell/nutzbar ist." : "Machbarkeit oder Toleranz noch nicht ausreichend dokumentiert.", changeWhen: "GI-Funktion, Zugang oder Toleranz ändern sich." },
    { route: "parenteral", suitable: pnRequired, title: "Parenterale Ernährung", why: pnRationale, changeWhen: "Orale/enterale Versorgung wieder ausreichend toleriert wird oder die Indikation entfällt." },
    { route: "combination", suitable: pnStatus === "supplementary", title: "Kombinierte Versorgung", why: pnStatus === "supplementary" ? "Enterale Versorgung ist möglich, aber voraussichtlich nicht bedarfsdeckend." : "Nur bei dokumentierter verbleibender Versorgungslücke sinnvoll.", changeWhen: "Bedarfsdeckung aus oral/enteral steigt oder fällt." },
  ];

  const explanation = blocked ? `${fullName(patient)}: Die Herleitung ist sichtbar, aber mindestens eine sicherheitskritische oder organisatorische Voraussetzung ist offen. NutriPilot sperrt die quantitative Übernahme.` : `${fullName(patient)}: Aus ${findings.join(", ")} wird der Kontext „${ruleLabel}“ und der Ernährungsweg „${routeDecision.label}“ als prüfbarer Entwurf abgeleitet. Jede Regel, Anwendbarkeit, Grenze und Alternative bleibt direkt einsehbar.`;

  return {
    blocked, supportLevel: unsupportedContext ? "not-supported" : specialistContext ? "specialist-only" : "supported",
    refeedingRisk, refeedingCriteria: { major: majorRefeedingCriteria, minor: minorRefeedingCriteria, majorCount: majorRefeedingCount, minorCount: minorRefeedingCount },
    dysphagia, swallowPlanReady, oralSafe, safetyChecks, warnings, dataQuality, decisionCompleteness, evidence, reasoningSteps, calculations,
    targetMode, ruleLabel, ruleReason, weightBasis, energyPerKg, proteinPerKg, targets: targetValues, selected,
    routeDecision, alternatives,
    pn: { status: pnStatus, label: pnLabel, rationale: pnRationale, required: pnRequired, ready: pnReady, prerequisites: pnPrerequisites, openPrerequisites: pnOpenPrerequisites, coverage, energyGap, proteinGap, provisionalPnEnergy, accessOrientation, expectedDuration, venousAccess: a.venousAccess || "unknown" },
    decisionTrace: [
      { id: "basis", label: "1 · Datenbasis", value: `${verifiedEvidence}/${evidence.length} Angaben bestätigt`, detail: openEvidence ? `${openEvidence} entscheidungsrelevante Angaben offen` : "keine offene Kerndatenkarte", tone: openEvidence ? "warning" : "ok", target: "therapy-basis" },
      { id: "safety", label: "2 · Sicherheit", value: blocked ? "Freigabe gesperrt" : warnings.length ? `${warnings.length} Vorbehalte` : "passiert", detail: blocked ? safetyChecks.filter((item) => item.status === "block").map((item) => item.title).join(" · ") : "keine kritische Blockade", tone: blocked ? "block" : warnings.length ? "warning" : "ok", target: "therapy-safety" },
      { id: "rule", label: "3 · Regelkontext", value: ruleLabel, detail: ruleReason, tone: targetMode === "individual" ? "warning" : "ok", target: "therapy-reasoning" },
      { id: "route", label: "4 · Ernährungsweg", value: routeDecision.label, detail: routeDecision.rationale, tone: routeDecision.tone, target: "therapy-route" },
      { id: "result", label: "5 · Therapieentwurf", value: blocked ? "nur Sicherheits-/Klärungsplan" : "prüfbarer Entwurf", detail: pnRequired ? pnLabel : "Maßnahmen und Monitoring zur fachlichen Bestätigung", tone: blocked ? "block" : "ok", target: "therapy-plan" },
    ],
    reviewLevel: blocked ? "Nicht freigabefähig" : openEvidence >= 3 ? "Eingeschränkte Entscheidungsgrundlage" : warnings.length ? "Plausibel mit Vorbehalten" : "Plausible Entscheidungsgrundlage",
    criticalGaps: safetyChecks.filter((item) => item.status === "block"),
    measures: [
      { id: "safety", title: "Priorität 1 · Sicherheit und Anwendungsgrenzen", why: "Vor einer quantitativen Therapie müssen sicherheitsrelevante Voraussetzungen geklärt sein.", rule: `${LOCAL_RULES.safetyGate.id} · ${LOCAL_RULES.unsupportedContext.id}`, basedOn: safetyChecks.filter((item) => item.status !== "ok").map((item) => item.title).length ? safetyChecks.filter((item) => item.status !== "ok").map((item) => item.title) : ["keine kritische Sicherheitslücke erkannt"], expected: "Sichere, fachlich prüfbare Ausgangslage.", reassess: "Bei neuen Laborwerten, klinischer Verschlechterung oder Routenwechsel.", items: safetyMeasures },
      { id: "route", title: "Priorität 2 · Ernährungsweg und Patientenziel", why: "Die geeignete Route folgt nicht allein aus dem Bedarf, sondern aus Schlucksicherheit, GI-Funktion, erreichter Deckung, Ziel und Präferenzen.", rule: `${LOCAL_RULES.routeSelection.id} · NICE CG32 1.3.3, 1.7.1, 1.8.1`, basedOn: [`Schluckstatus: ${a.swallowing || "offen"}`, `GI: ${giStatusLabel(giStatus)}`, `Deckung: ${coverage} %`, a.patientGoal ? `Ziel: ${a.patientGoal}` : "Patientenziel offen"], expected: "Passender, begründeter und akzeptierter Ernährungsweg.", reassess: "Wenn sich GI-Funktion, Schlucken, Toleranz, Ziel oder Deckung verändern.", items: routeMeasures },
      { id: "oral", title: "Priorität 3 · Orale/enterale Optionen optimal nutzen", why: "Ein funktioneller GI-Trakt und eine sichere Route sollen genutzt werden, bevor invasivere Wege unnötig gewählt werden.", rule: `${LOCAL_RULES.oralFirst.id} · NICE CG32 1.6.6 und 1.7.1`, basedOn: [`oral sicher: ${oralSafe ? "ja" : "nein/offen"}`, `enteral machbar: ${yesNoUnknown(enteralFeasible)}`], expected: "Bedarfsdeckung mit dem sichersten und physiologisch geeigneten Weg verbessern.", reassess: "Bei <75 % Zielerreichung, Intoleranz oder klinischer Änderung.", items: [...oralMeasures, ...enteralMeasures] },
      { id: "pn", title: "Priorität 4 · Parenterale Ernährung", why: "PN wird separat indiziert und nicht automatisch aus einem Energiebedarf abgeleitet.", rule: `${LOCAL_RULES.parenteralGate.id} · NICE CG32 1.8.1–1.8.3`, basedOn: [pnLabel, `GI: ${giStatusLabel(giStatus)}`, `enteral: ${yesNoUnknown(enteralFeasible)} / ${enteralToleranceLabel(enteralTolerance)}`, `${pnPrerequisites.length - pnOpenPrerequisites.length}/${pnPrerequisites.length} Teamvoraussetzungen`], expected: pnRequired ? "Versorgungslücke sicher überbrücken und täglich die Rückkehr zu oral/enteral prüfen." : "PN nur bei klarer Indikation einsetzen.", reassess: "Täglich hinsichtlich Indikation, Deckung, Komplikationen und Möglichkeit oral/enteral zu steigern.", items: pnMeasures },
      { id: "monitoring", title: "Priorität 5 · Erfolg, Komplikationen und Deeskalation", why: "Professionelle Ernährungstherapie definiert vor Beginn, woran Erfolg, Anpassung und Abbruch erkannt werden.", rule: "NICE CG32 1.5.1–1.5.5 + NutriPilot Monitoringregel", basedOn: [`Kontrollfenster ${reviewDays} Tag${reviewDays === 1 ? "" : "e"}`, pnRequired ? "PN-Monitoring erforderlich" : "Standardmonitoring"], expected: "Wirksamkeit und Sicherheit objektiv bewerten.", reassess: "Bei Zielverfehlung, metabolischer Auffälligkeit, Katheterproblem oder klinischer Änderung.", items: ["Erfolgskriterien vor Aktivierung dokumentieren.", "Anpassungs- und Eskalationskriterien gemeinsam mit dem Plan speichern.", "Bei ausreichender oral/enteraler Toleranz PN schrittweise reduzieren und beenden."] },
    ],
    monitoring, sources: uniqueGuidelines(sources), explanation, recommendedReviewDate: isoDate(new Date(Date.now() + reviewDays * 86400000)),
  };
}

function giStatusLabel(value) {
  return ({ unknown: "offen", functional: "funktionell", nonfunctional: "nicht funktionell", inaccessible: "nicht zugänglich", leaking: "perforiert/undicht" })[value] || value || "offen";
}
function enteralToleranceLabel(value) {
  return ({ unknown: "offen", adequate: "ausreichend toleriert", limited: "nur begrenzt toleriert", intolerant: "nicht toleriert", not_tried: "noch nicht versucht" })[value] || value || "offen";
}
function yesNoUnknown(value) {
  return value === "yes" ? "ja" : value === "no" ? "nein" : "offen";
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


function safeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function therapyPlanHeadline(recommendation) {
  if (recommendation.blocked) return "Sicherheitsvoraussetzungen klären, bevor der Therapieplan aktiviert wird.";
  const route = String(recommendation.routeDecision?.label || "").toLowerCase();
  if (route.includes("parenter")) return "Parenterale Ernährung interprofessionell planen und die Versorgungslücke sicher schließen.";
  if (route.includes("enteral")) return "Enterale Ernährung bedarfsgerecht aufbauen und engmaschig reevaluieren.";
  if (route.includes("komb")) return "Kombinierte Ernährungstherapie zielgerichtet aufbauen und täglich anpassen.";
  return "Orale Ernährung optimieren, proteinreich fortifizieren und die Zielerreichung aktiv überwachen.";
}

function therapyPlanStatus(patient, recommendation) {
  if (recommendation.blocked) return "Nicht freigabefähig";
  if (patient.therapy.confirmed) return "Fachlich bestätigt";
  if (["accepted", "adapted"].includes(patient.therapy.recommendationStatus)) return "In fachlicher Bearbeitung";
  return "Fachlich zu prüfen";
}

function therapyPlanText(patient, recommendation) {
  const therapy = patient.therapy || {};
  const energy = therapy.energyGoal || recommendation.selected.energy || "individuell";
  const protein = therapy.proteinGoal || recommendation.selected.protein || "individuell";
  const fluid = therapy.fluidGoal || recommendation.selected.fluid || "individuell";
  const measures = therapy.measures || recommendationMeasuresText(recommendation);
  const monitoring = therapy.monitoringPlan || recommendationMonitoringText(recommendation);
  const sources = recommendation.sources.map((source) => `${source.id} (${source.version})`).join(", ") || "individuelle fachliche Festlegung";
  return `NUTRIPILOT THERAPIEPLAN\n\nPatient: ${fullName(patient)}\nPatientennummer: ${patient.patientNumber}\nStation/Zimmer: ${patient.station} / ${patient.room}\nStatus: ${therapyPlanStatus(patient, recommendation)}\nErstellt: ${new Date().toLocaleString("de-DE")}\n\nEMPFOHLENE THERAPIE\n${therapyPlanHeadline(recommendation)}\n\nTHERAPIEZIELE\nEnergie: ${energy} kcal/Tag\nProtein: ${protein} g/Tag\nFlüssigkeit: ${fluid} ml/Tag\nErnährungsweg: ${therapy.routeDecision || recommendation.routeDecision.label}\n\nMASSNAHMEN\n${measures}\n\nMONITORING UND REEVALUATION\n${monitoring}\nNächste Prüfung: ${formatDate(therapy.nextReview || recommendation.recommendedReviewDate)}\n\nERFOLGSKRITERIEN\n${therapy.successCriteria || "Vor fachlicher Bestätigung konkret festlegen."}\n\nANPASSUNGSKRITERIEN\n${therapy.adaptationCriteria || "Bei Unverträglichkeit, metabolischer Auffälligkeit oder Zielverfehlung neu bewerten."}\n\nESKALATIONS-/ABBRUCHKRITERIEN\n${therapy.escalationCriteria || "Bei Nichterreichen, klinischer Verschlechterung oder Sicherheitsereignissen Route neu bewerten."}\n\nENTSCHEIDUNGSGRUNDLAGE\n${recommendation.explanation}\nDatenbasis: ${recommendation.decisionCompleteness} % (${recommendation.dataQuality})\nRegelkontext: ${recommendation.ruleLabel}\n\nQUELLEN\n${sources}\n\nHinweis: Durch eine Ernährungsfachkraft zu prüfen und zu bestätigen. Keine autonome Therapieentscheidung.`;
}

function therapyPlanHtml(patient, recommendation) {
  const therapy = patient.therapy || {};
  const energy = therapy.energyGoal || recommendation.selected.energy || "individuell";
  const protein = therapy.proteinGoal || recommendation.selected.protein || "individuell";
  const fluid = therapy.fluidGoal || recommendation.selected.fluid || "individuell";
  const route = therapy.routeDecision || recommendation.routeDecision.label;
  const groups = recommendation.measures.map((group, index) => `
    <section class="measure"><div class="number">${index + 1}</div><div><h3>${safeHtml(group.title.replace(/^Priorität \d+ · /, ""))}</h3><p>${safeHtml(group.items.join(" "))}</p><small><b>Begründung:</b> ${safeHtml(group.why)}<br><b>Regel:</b> ${safeHtml(group.rule)}<br><b>Reevaluation:</b> ${safeHtml(group.reassess)}</small></div></section>`).join("");
  const sourceList = recommendation.sources.map((source) => `<li><b>${safeHtml(source.id)}</b> · ${safeHtml(source.title)} · ${safeHtml(source.version)}</li>`).join("") || "<li>Individuelle fachliche Festlegung</li>";
  const evidence = recommendation.evidence.slice(0, 10).map((item) => `<tr><td>${safeHtml(item.label)}</td><td>${safeHtml(item.value)}</td><td>${safeHtml(item.statusLabel || item.status || "")}</td><td>${safeHtml(item.source || "Assessment")}</td></tr>`).join("");
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Therapieplan ${safeHtml(fullName(patient))}</title><style>
  @page{size:A4;margin:16mm}*{box-sizing:border-box}body{font-family:Inter,Arial,sans-serif;color:#17283c;margin:0;font-size:10.5pt;line-height:1.45}.header{display:flex;justify-content:space-between;gap:20px;border-bottom:3px solid #0b3558;padding-bottom:14px;margin-bottom:18px}.brand{font-size:22px;font-weight:800;color:#0b3558}.brand small{display:block;font-size:9px;font-weight:600;color:#658096;letter-spacing:.08em;text-transform:uppercase}.meta{text-align:right;font-size:9px;color:#566a7e}.hero{border:1px solid #a9c8df;border-radius:12px;padding:18px;background:#f5faff;margin-bottom:14px}.eyebrow{text-transform:uppercase;letter-spacing:.1em;font-size:8px;font-weight:800;color:#53728a}.hero h1{font-size:19px;line-height:1.2;margin:5px 0}.status{display:inline-block;padding:5px 9px;border-radius:999px;background:#fff1d7;color:#8b5b08;font-size:8px;font-weight:800}.targets{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:14px 0}.target{border:1px solid #dce7ef;border-radius:9px;padding:10px}.target small,.target b{display:block}.target small{font-size:7.5px;color:#718294;text-transform:uppercase}.target b{font-size:11px;margin-top:4px}.measure{display:grid;grid-template-columns:28px 1fr;gap:9px;border-bottom:1px solid #e4ebf0;padding:10px 0;break-inside:avoid}.number{width:25px;height:25px;border-radius:7px;background:#e8f3fa;color:#0b527f;display:flex;align-items:center;justify-content:center;font-weight:800}.measure h3{font-size:11px;margin:0 0 3px}.measure p{margin:0 0 4px}.measure small{font-size:8px;color:#607386}.section-title{font-size:13px;color:#0b3558;margin:18px 0 6px}.monitor{border:1px solid #dce7ef;border-radius:10px;padding:12px;background:#fbfcfd}.basis{border-left:4px solid #2a936c;padding:10px 12px;background:#f1faf6}.basis p{margin:4px 0}.table{width:100%;border-collapse:collapse;font-size:8px;margin-top:8px}.table th,.table td{border:1px solid #dfe7ed;padding:6px;text-align:left;vertical-align:top}.table th{background:#eef5f9}.footer{margin-top:20px;padding-top:10px;border-top:1px solid #dbe4ea;font-size:8px;color:#718294}.signature{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:36px}.signature div{border-top:1px solid #718294;padding-top:5px;font-size:8px}@media print{button{display:none}}
  </style></head><body>
  <header class="header"><div class="brand">NutriPilot<small>Clinical Nutrition · Therapieplan</small></div><div class="meta">${safeHtml(fullName(patient))}<br>${safeHtml(patient.patientNumber)} · ${safeHtml(patient.station)} · Zimmer ${safeHtml(patient.room)}<br>Erstellt ${safeHtml(new Date().toLocaleString("de-DE"))}</div></header>
  <section class="hero"><span class="eyebrow">Empfohlener Therapieplan</span><h1>${safeHtml(therapyPlanHeadline(recommendation))}</h1><span class="status">${safeHtml(therapyPlanStatus(patient, recommendation))}</span><div class="targets"><div class="target"><small>Energie</small><b>${safeHtml(energy)} kcal/Tag</b></div><div class="target"><small>Protein</small><b>${safeHtml(protein)} g/Tag</b></div><div class="target"><small>Flüssigkeit</small><b>${safeHtml(fluid)} ml/Tag</b></div><div class="target"><small>Ernährungsweg</small><b>${safeHtml(route)}</b></div></div></section>
  <h2 class="section-title">Priorisierte Maßnahmen</h2>${groups}
  <h2 class="section-title">Monitoring und Reevaluation</h2><section class="monitor"><b>Nächste fachliche Prüfung: ${safeHtml(formatDate(therapy.nextReview || recommendation.recommendedReviewDate))}</b><p>${safeHtml(therapy.monitoringPlan || recommendationMonitoringText(recommendation))}</p><p><b>Erfolg:</b> ${safeHtml(therapy.successCriteria || "Vor Bestätigung konkret festlegen.")}</p><p><b>Anpassung:</b> ${safeHtml(therapy.adaptationCriteria || "Bei Zielverfehlung oder Unverträglichkeit neu bewerten.")}</p><p><b>Eskalation/Abbruch:</b> ${safeHtml(therapy.escalationCriteria || "Bei Sicherheitsereignis oder klinischer Verschlechterung Route neu bewerten.")}</p></section>
  <h2 class="section-title">Medizinische Entscheidungsgrundlage</h2><section class="basis"><p><b>Fachlicher Schluss:</b> ${safeHtml(recommendation.explanation)}</p><p><b>Regelkontext:</b> ${safeHtml(recommendation.ruleLabel)} · ${safeHtml(recommendation.ruleReason)}</p><p><b>Datenqualität:</b> ${safeHtml(String(recommendation.decisionCompleteness))} % · ${safeHtml(recommendation.dataQuality)}</p></section>
  <table class="table"><thead><tr><th>Parameter</th><th>Wert</th><th>Status</th><th>Quelle</th></tr></thead><tbody>${evidence}</tbody></table>
  <h2 class="section-title">Quellen</h2><ul>${sourceList}</ul>
  <div class="signature"><div>Ernährungsfachkraft / Datum</div><div>Ärztliche / interprofessionelle Freigabe, falls erforderlich</div></div>
  <footer class="footer">NutriPilot ${safeHtml(APP_VERSION)} · Dieser Plan ist eine fachlich zu prüfende Entscheidungsunterstützung und keine autonome Therapieentscheidung.</footer>
  </body></html>`;
}

function downloadTextFile(filename, content, type = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function printTherapyPlan(patient, recommendation) {
  const popup = window.open("", "_blank");
  if (!popup) return false;
  popup.document.open();
  popup.document.write(therapyPlanHtml(patient, recommendation));
  popup.document.close();
  popup.focus();
  window.setTimeout(() => popup.print(), 350);
  return true;
}

function therapyPlanSlug(patient) {
  return `${patient.lastName || "patient"}-${patient.firstName || ""}-${isoDate()}`.toLowerCase().replace(/[^a-z0-9äöüß-]+/gi, "-");
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

  useEffect(() => {
    const openRules = () => navigate("rules");
    window.addEventListener("nutripilot-open-rules", openRules);
    return () => window.removeEventListener("nutripilot-open-rules", openRules);
  }, []);

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
          {view === "therapyPlans" && <TherapyPlansView patients={patients} openPatient={openPatient} query={query} />}
          {view === "search" && <SearchView patients={patients} openPatient={openPatient} query={query} setQuery={setQuery} />}
          {view === "rules" && <RulesRegistry />}
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
      <NavButton id="therapyPlans" icon={Utensils} label="Therapie" />
    </nav>
  );
}

function Sidebar({ view, navigate }) {
  const items = [
    ["today", CalendarDays, "Mein Arbeitstag"],
    ["consults", ClipboardList, "Konsile"],
    ["patients", Users, "Ernährungsfälle"],
    ["therapyPlans", Utensils, "Therapiepläne"],
    ["search", Search, "Suche"],
    ["rules", BookOpen, "Regel- & Quellenregister"],
  ];
  return (
    <aside className="sidebar">
      <button className="brand" onClick={() => navigate("today")}>
        <span className="brand-mark"><span className="avatar-glyph">N</span></span>
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
        <span className="profile-avatar"><span className="avatar-glyph">LB</span></span>
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
    therapyPlans: "Therapiepläne",
    search: "Suche",
    rules: "Regel- & Quellenregister",
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

        <ClinicalExcellencePanel patients={patients} openPatient={openPatient} />

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


function TherapyPlansView({ patients, openPatient, query }) {
  const filtered = filterPatients(patients, query).filter((patient) => !patient.discharge.completed);
  const confirmed = filtered.filter((patient) => patient.therapy.confirmed).length;
  const ready = filtered.filter((patient) => {
    const recommendation = therapyRecommendation(patient);
    return !recommendation.blocked && !patient.therapy.confirmed;
  }).length;
  return (
    <div className="therapy-plans-page">
      <section className="therapy-plans-intro panel">
        <div><span className="eyebrow">Zentrales Arbeitsergebnis</span><h2>Empfohlene und aktive Therapiepläne</h2><p>Jeder Fall führt zu einem prüfbaren Plan mit Zielwerten, Maßnahmen, medizinischer Herleitung, Monitoring und Export.</p></div>
        <div className="therapy-plan-kpis"><span><b>{filtered.length}</b> aktive Fälle</span><span><b>{ready}</b> prüfbereit</span><span><b>{confirmed}</b> bestätigt</span></div>
      </section>
      <div className="therapy-plan-card-grid">
        {filtered.map((patient) => {
          const recommendation = therapyRecommendation(patient);
          const therapy = patient.therapy;
          return <button className={`therapy-plan-card ${recommendation.blocked ? "blocked" : therapy.confirmed ? "confirmed" : "draft"}`} key={patient.id} onClick={() => openPatient(patient, "therapy")}>
            <div className="therapy-plan-card-head"><Avatar patient={patient} /><div><b>{fullName(patient)}</b><span>{patient.station} · Zimmer {patient.room}</span></div><StatusBadge status={therapyPlanStatus(patient, recommendation)} /></div>
            <h3>{therapyPlanHeadline(recommendation)}</h3>
            <div className="therapy-plan-mini-targets"><span><small>Energie</small><b>{therapy.energyGoal || recommendation.selected.energy || "individuell"}</b></span><span><small>Protein</small><b>{therapy.proteinGoal || recommendation.selected.protein || "individuell"}</b></span><span><small>Route</small><b>{therapy.routeDecision || recommendation.routeDecision.label}</b></span></div>
            <div className="therapy-plan-card-footer"><span>Datenbasis {recommendation.decisionCompleteness} %</span><span>Plan öffnen <ChevronRight size={15} /></span></div>
          </button>;
        })}
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
    ["therapy", "Therapieplan"],
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

      <div className={`workspace-layout ${tab === "therapy" ? "therapy-wide" : ""}`}>
        <section className="workspace-content">
          {tab === "overview" && <CaseOverview patient={patient} metrics={metrics} setTab={setTab} />}
          {tab === "assessment" && <AssessmentEditor patient={patient} updatePatient={updatePatient} setTab={setTab} />}
          {tab === "glim" && <GlimWorkspace patient={patient} updatePatient={updatePatient} />}
          {tab === "therapy" && <TherapyWorkspace patient={patient} updatePatient={updatePatient} notify={notify} setTab={setTab} />}
          {tab === "timeline" && <TimelineWorkspace patient={patient} updatePatient={updatePatient} />}
          {tab === "discharge" && <DischargeWorkspace patient={patient} updatePatient={updatePatient} />}
        </section>
        {tab !== "therapy" && <aside className="workspace-aside"><CopilotPanel patient={patient} tab={tab} metrics={metrics} setTab={setTab} /></aside>}
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
          <div className="form-grid two">
            <Field label="Patienten-/Behandlungsziel"><textarea value={a.patientGoal} onChange={(e) => setAssessment({ patientGoal: e.target.value })} placeholder="Was soll die Ernährungstherapie aus Sicht von Patient und Team erreichen?" /></Field>
            <Field label="Präferenzen und Umsetzbarkeit"><textarea value={a.preferences} onChange={(e) => setAssessment({ preferences: e.target.value })} placeholder="Kostpräferenzen, Akzeptanz, kulturelle Aspekte, Unterstützung" /></Field>
          </div>
          <Field label="Umsetzungsbarrieren"><input value={a.implementationBarriers} onChange={(e) => setAssessment({ implementationBarriers: e.target.value })} placeholder="z. B. Übelkeit, Fatigue, fehlende Unterstützung, Ileus" /></Field>
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

        <FormSection title="Ernährungsweg & parenterale Ernährung" icon={Hospital} description="Oral, enteral und parenteral getrennt prüfen – PN niemals allein aus einem Bedarf ableiten">
          <div className="form-grid three">
            <Field label="Gastrointestinaltrakt"><select value={a.giTractStatus} onChange={(e) => setAssessment({ giTractStatus: e.target.value })}><option value="unknown">noch offen</option><option value="functional">funktionell</option><option value="nonfunctional">nicht funktionell</option><option value="inaccessible">nicht zugänglich</option><option value="leaking">perforiert / undicht</option></select></Field>
            <Field label="Enterale Ernährung machbar"><select value={a.enteralFeasible} onChange={(e) => setAssessment({ enteralFeasible: e.target.value })}><option value="unknown">noch offen</option><option value="yes">ja</option><option value="no">nein</option></select></Field>
            <Field label="Enterale Toleranz"><select value={a.enteralTolerance} onChange={(e) => setAssessment({ enteralTolerance: e.target.value })}><option value="unknown">noch offen</option><option value="not_tried">noch nicht versucht</option><option value="adequate">ausreichend</option><option value="limited">begrenzt</option><option value="intolerant">nicht toleriert</option></select></Field>
            <Field label="Voraussichtliche Dauer (Tage)"><input type="number" min="0" value={a.expectedNutritionDuration} onChange={(e) => setAssessment({ expectedNutritionDuration: e.target.value })} /></Field>
            <Field label="Venöser Zugang"><select value={a.venousAccess} onChange={(e) => setAssessment({ venousAccess: e.target.value })}><option value="unknown">noch offen</option><option value="peripheral">peripher</option><option value="PICC">PICC</option><option value="central">zentralvenös</option><option value="port">Port</option><option value="planned">in Planung</option></select></Field>
            <Field label="Patientenwille / Einwilligung"><select value={a.patientConsent} onChange={(e) => setAssessment({ patientConsent: e.target.value })}><option value="unknown">noch offen</option><option value="yes">dokumentiert</option><option value="no">nicht gegeben / abgelehnt</option></select></Field>
            <Field label="Glukosestatus"><select value={a.glucoseStatus} onChange={(e) => setAssessment({ glucoseStatus: e.target.value })}><option value="unknown">nicht dokumentiert</option><option value="normal">unauffällig</option><option value="high">erhöht</option><option value="low">erniedrigt</option></select></Field>
            <Field label="Triglyzeride"><select value={a.triglycerideStatus} onChange={(e) => setAssessment({ triglycerideStatus: e.target.value })}><option value="unknown">nicht dokumentiert</option><option value="normal">unauffällig</option><option value="high">erhöht</option></select></Field>
          </div>
          <div className="form-grid two pn-team-checks">
            <label className="check-card"><input type="checkbox" checked={Boolean(a.pnIndicationConfirmed)} onChange={(e) => setAssessment({ pnIndicationConfirmed: e.target.checked })} /><span><b>PN-Indikation bestätigt</b><small>fachlich und ärztlich begründet</small></span></label>
            <label className="check-card"><input type="checkbox" checked={Boolean(a.pnSpecialistReview)} onChange={(e) => setAssessment({ pnSpecialistReview: e.target.checked })} /><span><b>Ernährungsteam beteiligt</b><small>Nutrition Support / Ernährungsmedizin</small></span></label>
            <label className="check-card"><input type="checkbox" checked={Boolean(a.pnPhysicianApproval)} onChange={(e) => setAssessment({ pnPhysicianApproval: e.target.checked })} /><span><b>Ärztliche Entscheidung</b><small>Indikation und Zugangsweg</small></span></label>
            <label className="check-card"><input type="checkbox" checked={Boolean(a.pnPharmacyReview)} onChange={(e) => setAssessment({ pnPharmacyReview: e.target.checked })} /><span><b>Pharmazie geprüft</b><small>Kompatibilität, Zusammensetzung, Mikronährstoffe</small></span></label>
            <label className="check-card"><input type="checkbox" checked={Boolean(a.pnNursingReview)} onChange={(e) => setAssessment({ pnNursingReview: e.target.checked })} /><span><b>Pflege-/Zugangsprüfung</b><small>Katheterversorgung und Monitoring</small></span></label>
          </div>
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
  const [whatIf, setWhatIf] = useState({ giTractStatus: "", enteralFeasible: "", swallowing: "", pnTeamReady: false });
  const recommendation = useMemo(() => therapyRecommendation(patient, alternative), [patient, alternative]);
  const simulatedOverrides = useMemo(() => {
    const patch = {};
    if (whatIf.giTractStatus) patch.giTractStatus = whatIf.giTractStatus;
    if (whatIf.enteralFeasible) patch.enteralFeasible = whatIf.enteralFeasible;
    if (whatIf.swallowing) patch.swallowing = whatIf.swallowing;
    if (whatIf.pnTeamReady) Object.assign(patch, { pnIndicationConfirmed: true, pnSpecialistReview: true, pnPhysicianApproval: true, pnPharmacyReview: true, pnNursingReview: true, patientConsent: "yes", venousAccess: patient.assessment.venousAccess === "unknown" ? "planned" : patient.assessment.venousAccess, glucoseStatus: patient.assessment.glucoseStatus === "unknown" ? "normal" : patient.assessment.glucoseStatus, triglycerideStatus: patient.assessment.triglycerideStatus === "unknown" ? "normal" : patient.assessment.triglycerideStatus });
    return patch;
  }, [whatIf, patient]);
  const simulated = useMemo(() => Object.keys(simulatedOverrides).length ? therapyRecommendation(patient, alternative, simulatedOverrides) : null, [patient, alternative, simulatedOverrides]);

  useEffect(() => { setAlternative(patient.therapy.recommendationAlternative || "standard"); setRejectReason(patient.therapy.recommendationReason || ""); setWhatIf({ giTractStatus: "", enteralFeasible: "", swallowing: "", pnTeamReady: false }); }, [patient.id]);
  function jumpTo(id) { document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }
  function patchTherapy(patch, message) { updatePatient(patient.id, (draft) => { draft.therapy = { ...draft.therapy, ...patch }; draft.consultStatus = "Therapie"; draft.caseStatus = draft.therapy.confirmed ? "Therapie aktiv" : "Therapieentscheidung offen"; draft.nextStep = draft.therapy.confirmed ? "Verlauf kontrollieren" : "Therapieplan bestätigen"; return draft; }, message); }
  function editTherapy(patch) { patchTherapy({ ...patch, recommendationStatus: t.recommendationStatus === "accepted" || t.recommendationStatus === "confirmed" ? "adapted" : t.recommendationStatus }); }
  function chooseAlternative(value) { setAlternative(value); patchTherapy({ recommendationAlternative: value, recommendationStatus: t.recommendationStatus === "rejected" ? "draft" : t.recommendationStatus }); }
  function confirmWeightBasis(checked) { patchTherapy({ weightBasisConfirmed: checked, recommendationStatus: "draft" }, checked ? "Gewichtsbasis wurde bestätigt" : "Bestätigung der Gewichtsbasis wurde aufgehoben"); }
  function adoptRecommendation() {
    if (recommendation.blocked) { notify?.("Offene Sicherheits- oder Teamprüfungen verhindern die Übernahme"); return; }
    updatePatient(patient.id, (draft) => {
      const rec = therapyRecommendation(draft, alternative);
      draft.therapy = { ...draft.therapy, energyGoal: rec.selected.energy ?? draft.therapy.energyGoal, proteinGoal: rec.selected.protein ?? draft.therapy.proteinGoal, fluidGoal: rec.selected.fluid ?? draft.therapy.fluidGoal, measures: recommendationMeasuresText(rec), monitoringPlan: recommendationMonitoringText(rec), nextReview: rec.recommendedReviewDate, routeDecision: rec.routeDecision.label, successCriteria: draft.therapy.successCriteria || "Ernährungsziel und Bedarfsdeckung im definierten Kontrollfenster messbar verbessern.", adaptationCriteria: draft.therapy.adaptationCriteria || "Bei Unverträglichkeit, metabolischer Auffälligkeit oder Zielverfehlung neu bewerten.", escalationCriteria: draft.therapy.escalationCriteria || "Route eskalieren oder deeskalieren, wenn die dokumentierten Kriterien erfüllt sind.", recommendationStatus: "accepted", recommendationReason: "", recommendationAlternative: alternative, recommendationGeneratedAt: new Date().toISOString(), recommendationAcceptedAt: new Date().toISOString(), confirmed: false };
      draft.consultStatus = "Therapie"; draft.caseStatus = "Therapieentwurf übernommen"; draft.nextStep = "Therapieentwurf prüfen und bestätigen";
      draft.timeline.unshift({ id: `E-${Date.now()}`, date: isoDate(), time: currentTime(), type: "Therapie-Copilot", title: "Transparenter Therapieentwurf übernommen", text: `Route: ${rec.routeDecision.label}. PN-Status: ${rec.pn.label}. Regelkontext: ${rec.ruleLabel}. Quellen: ${rec.sources.map((source) => source.id).join(", ") || "individuelle Festlegung"}. Datenbasis ${rec.decisionCompleteness} %. Noch nicht fachlich bestätigt.` });
      return draft;
    }, "Therapieentwurf wurde übernommen");
    setShowEditor(true); setRejectMode(false);
  }
  function rejectRecommendation() {
    if (!rejectReason.trim()) { notify?.("Bitte Ablehnungsgrund dokumentieren"); return; }
    updatePatient(patient.id, (draft) => { draft.therapy.recommendationStatus = "rejected"; draft.therapy.recommendationReason = rejectReason.trim(); draft.therapy.recommendationGeneratedAt = new Date().toISOString(); draft.caseStatus = "Therapieempfehlung abgelehnt"; draft.nextStep = "Individuellen Therapieplan erstellen"; draft.timeline.unshift({ id: `E-${Date.now()}`, date: isoDate(), time: currentTime(), type: "Therapie-Copilot", title: "Therapieempfehlung fachlich abgelehnt", text: rejectReason.trim() }); return draft; }, "Ablehnung wurde dokumentiert");
    setRejectMode(false); setShowEditor(true);
  }
  function confirmPlan() {
    if (recommendation.blocked) { notify?.("Sicherheits- und Teamprüfungen müssen zuerst abgeschlossen werden"); return; }
    if (!t.energyGoal || !t.proteinGoal || !t.measures || !t.successCriteria) { notify?.("Energie, Protein, Maßnahmen und Erfolgskriterien müssen fachlich festgelegt sein"); return; }
    updatePatient(patient.id, (draft) => { const wasConfirmed = draft.therapy.confirmed; const rec = therapyRecommendation(draft, draft.therapy.recommendationAlternative || "standard"); draft.therapy.confirmed = true; draft.therapy.confirmedAt = new Date().toISOString(); draft.therapy.confirmedBy = "Laura Becker"; draft.therapy.recommendationStatus = "confirmed"; draft.consultStatus = "Monitoring"; draft.caseStatus = "Therapie aktiv"; draft.nextStep = "Verlauf kontrollieren"; draft.timeline.unshift({ id: `E-${Date.now()}`, date: isoDate(), time: currentTime(), type: "Therapie", title: wasConfirmed ? "Therapieplan fachlich aktualisiert" : "Therapieplan fachlich bestätigt", text: `Route ${draft.therapy.routeDecision || rec.routeDecision.label}; Energie ${draft.therapy.energyGoal} kcal/Tag, Protein ${draft.therapy.proteinGoal} g/Tag${draft.therapy.fluidGoal ? `, Flüssigkeit ${draft.therapy.fluidGoal} ml/Tag` : ""}. PN: ${rec.pn.label}. Regelversion NutriPilot ${APP_VERSION}.` }); return draft; }, "Therapieplan wurde fachlich bestätigt");
  }
  function saveFeedback(value) { patchTherapy({ professionalFeedback: value }, "Fachliches Feedback wurde gespeichert"); }

  const strategyLabels = { vorsichtig: "unterer Zielkorridor", standard: "Mittelwert des Korridors", protein: "Protein am oberen Korridor" };
  const statusLabel = recommendation.blocked ? "Sicherheits-/Teamstopp" : t.confirmed ? "Fachlich bestätigt" : t.recommendationStatus === "accepted" ? "Entwurf übernommen" : t.recommendationStatus === "adapted" ? "Fachlich angepasst" : t.recommendationStatus === "rejected" ? "Abgelehnt" : "Vorschlag zur Prüfung";

  return <div className="stack therapy-copilot-workspace">
    <section className={`panel therapy-plan-primary ${recommendation.blocked ? "blocked" : t.confirmed ? "confirmed" : "draft"}`}>
      <div className="therapy-plan-primary-head">
        <span className="therapy-plan-primary-icon"><Sparkles size={22} /></span>
        <div className="therapy-plan-primary-title"><span className="eyebrow">Empfohlener Therapieplan</span><h2>{therapyPlanHeadline(recommendation)}</h2><p>{recommendation.explanation}</p></div>
        <div className={`recommendation-status ${recommendation.blocked ? "blocked" : t.confirmed ? "confirmed" : "draft"}`}><span>Status</span><b>{statusLabel}</b><small>Datenbasis: {recommendation.decisionCompleteness} % · {recommendation.dataQuality}</small><em>{recommendation.reviewLevel}</em></div>
      </div>

      <div className="therapy-plan-goals" aria-label="Therapieziele">
        <PlanGoal label="Zielkorridor Energie" value={`${t.energyGoal || recommendation.selected.energy || "individuell"} kcal/Tag`} tone="energy" />
        <PlanGoal label="Zielkorridor Protein" value={`${t.proteinGoal || recommendation.selected.protein || "individuell"} g/Tag`} tone="protein" />
        <PlanGoal label="Flüssigkeitsplan" value={`${t.fluidGoal || recommendation.selected.fluid || "individuell"} ml/Tag`} tone="fluid" />
        <PlanGoal label="Ernährungsweg" value={t.routeDecision || recommendation.routeDecision.label} tone="route" />
        <PlanGoal label="Reevaluation" value={formatDate(t.nextReview || recommendation.recommendedReviewDate)} tone="review" />
      </div>

      <div className="therapy-plan-primary-grid">
        <section className="therapy-plan-actions-preview">
          <div className="therapy-plan-subhead"><div><span className="eyebrow">Empfohlene Maßnahmen</span><h3>Priorisiert und direkt ausführbar</h3></div><button className="text-button" onClick={() => jumpTo("therapy-plan")}>Alle Details <ChevronRight size={14} /></button></div>
          {recommendation.measures.map((group, index) => <button className="therapy-plan-action-row" key={group.id} onClick={() => jumpTo("therapy-plan")}><span className="therapy-action-number">{index + 1}</span><div><b>{group.title.replace(/^Priorität \d+ · /, "")}</b><small>{group.items[0]}</small></div><span className={`therapy-action-priority ${index < 3 ? "high" : "normal"}`}>{index < 3 ? "Priorität 1" : "Priorität 2"}</span><ChevronRight size={15} /></button>)}
        </section>
        <aside className="therapy-decision-preview">
          <div className="therapy-plan-subhead"><div><span className="eyebrow">Direkter Zugriff</span><h3>Entscheidungsgrundlage</h3></div><Database size={18} /></div>
          <DecisionPreviewRow label="Anthropometrie" status={recommendation.weightBasis > 0 ? "bestätigt" : "offen"} tone={recommendation.weightBasis > 0 ? "ok" : "open"} />
          <DecisionPreviewRow label="Nahrungsaufnahme" status={patient.assessment.intakePercent !== "" ? "bestätigt" : "offen"} tone={patient.assessment.intakePercent !== "" ? "ok" : "open"} />
          <DecisionPreviewRow label="Refeeding-Risiko" status={recommendation.refeedingRisk ? "relevant" : "kein Hinweis"} tone={recommendation.refeedingRisk ? "warning" : "ok"} />
          <DecisionPreviewRow label="Dysphagie / Schlucken" status={recommendation.oralSafe ? "bestätigt" : "mit Vorbehalt"} tone={recommendation.oralSafe ? "ok" : "warning"} />
          <DecisionPreviewRow label="Datenqualität" status={`${recommendation.decisionCompleteness} %`} tone={recommendation.decisionCompleteness >= 80 ? "ok" : "warning"} />
          <button className="decision-preview-button" onClick={() => jumpTo("therapy-basis")}>Entscheidungsgrundlage öffnen <ChevronRight size={15} /></button>
        </aside>
      </div>

      <div className="therapy-plan-export-bar">
        <div><span className="eyebrow">Therapieplan exportieren</span><small>Professioneller Plan inklusive Zielwerten, Maßnahmen, Monitoring, Herleitung und Quellen.</small></div>
        <div className="therapy-export-actions">
          <button className="primary-button" onClick={() => { if (!printTherapyPlan(patient, recommendation)) notify?.("Pop-up wurde blockiert. Bitte Pop-ups für den PDF-Export erlauben."); }}><Download size={16} /> PDF / Drucken</button>
          <button className="secondary-button" onClick={() => { downloadTextFile(`therapieplan-${therapyPlanSlug(patient)}.html`, therapyPlanHtml(patient, recommendation), "text/html;charset=utf-8"); notify?.("Therapieplan als HTML exportiert"); }}><FileText size={16} /> Therapieplan-Datei</button>
          <button className="secondary-button" onClick={async () => { try { await navigator.clipboard.writeText(therapyPlanText(patient, recommendation)); notify?.("Clinical Note in die Zwischenablage kopiert"); } catch { downloadTextFile(`clinical-note-${therapyPlanSlug(patient)}.txt`, therapyPlanText(patient, recommendation)); notify?.("Clinical Note als Textdatei exportiert"); } }}><ExternalLink size={16} /> Clinical Note</button>
        </div>
      </div>
    </section>

    <nav className="therapy-section-nav" aria-label="Bereiche des Therapieplans"><button onClick={() => jumpTo("therapy-plan")}><Utensils size={15} /> Therapieplan</button><button onClick={() => jumpTo("therapy-basis")}><Database size={15} /> Datenbasis</button><button onClick={() => jumpTo("therapy-safety")}><ShieldCheck size={15} /> Sicherheit</button><button onClick={() => jumpTo("therapy-reasoning")}><GitBranch size={15} /> Herleitung</button><button onClick={() => jumpTo("therapy-route")}><Hospital size={15} /> Route & PN</button><button onClick={() => jumpTo("therapy-calculations")}><Calculator size={15} /> Rechenweg</button><button onClick={() => jumpTo("therapy-sources")}><BookOpen size={15} /> Quellen</button></nav>

    <section className="professional-briefing panel"><div><span className="eyebrow">60-Sekunden-Fallbriefing</span><h3>Was die Ernährungsfachkraft im Team souverän vertreten kann</h3></div><div className="briefing-grid"><BriefingFact label="Zentraler Ernährungsweg" value={recommendation.routeDecision.label} note={recommendation.routeDecision.rationale} /><BriefingFact label="Wichtigste Sicherheitsfrage" value={recommendation.criticalGaps[0]?.title || "keine Blockade"} note={recommendation.criticalGaps[0]?.detail || "Vorbehalte bleiben im Sicherheitsbereich sichtbar."} /><BriefingFact label="PN-Entscheidung" value={recommendation.pn.label} note={`${recommendation.pn.prerequisites.length - recommendation.pn.openPrerequisites.length}/${recommendation.pn.prerequisites.length} Voraussetzungen erfüllt`} /><BriefingFact label="Patientenziel" value={patient.assessment.patientGoal || "noch offen"} note={patient.assessment.preferences || "Präferenzen ergänzen"} /></div></section>

    <section className="decision-trace-overview" aria-label="Zusammenfassung des Entscheidungspfads">{recommendation.decisionTrace.map((step) => <button key={step.id} className={`decision-trace-step trace-${step.tone}`} onClick={() => jumpTo(step.target)}><span>{step.label}</span><b>{step.value}</b><small>{step.detail}</small><em>Details öffnen <ChevronRight size={13} /></em></button>)}</section>

    

    <section className="panel decision-basis-panel anchor-section" id="therapy-basis"><div className="panel-heading"><div><span className="eyebrow">Direkter Zugriff</span><h3>Welche Patientendaten werden verwendet?</h3><p>Wert, Herkunft, Status und konkrete Verwendung sind sichtbar. Offene Daten bleiben offen.</p></div>{patient.assessment.amputation?.present && <label className="weight-confirmation"><input type="checkbox" checked={Boolean(t.weightBasisConfirmed)} onChange={(event) => confirmWeightBasis(event.target.checked)} /><span><b>Segmentkorrigierte Gewichtsbasis bestätigen</b><small>vor kg-bezogenen Zielwerten erforderlich</small></span></label>}</div><div className="evidence-grid">{recommendation.evidence.map((item) => <EvidenceCard key={`${item.domain}-${item.label}`} item={item} />)}</div></section>

    <section className="panel safety-panel anchor-section" id="therapy-safety"><div className="panel-heading"><div><span className="eyebrow">Safety first</span><h3>Sicherheits- und Anwendungsprüfung</h3><p>Ein offener Stopppunkt verhindert die quantitative Übernahme, nicht aber die transparente Sicht auf Gründe und nächste Schritte.</p></div><span className={`safety-state ${recommendation.blocked ? "blocked" : "ready"}`}>{recommendation.blocked ? "Übernahme gesperrt" : "Entwurf prüfbar"}</span></div><div className="safety-check-grid">{recommendation.safetyChecks.map((check) => <SafetyCheckCard key={check.key} check={check} />)}</div>{recommendation.refeedingRisk && <RefeedingCriteriaPanel criteria={recommendation.refeedingCriteria} />}</section>

    <section className="panel reasoning-panel anchor-section" id="therapy-reasoning"><div className="panel-heading"><div><span className="eyebrow">Keine Blackbox</span><h3>Transparente Herleitung</h3><p>Beobachtung, Regeltyp, zulässiger Schluss, Auswirkung und Grenze werden getrennt dargestellt.</p></div></div><div className="reasoning-flow">{recommendation.reasoningSteps.map((step, index) => <ReasoningStep key={step.id} step={step} index={index + 1} />)}</div></section>

    <section className="panel route-pn-panel anchor-section" id="therapy-route"><div className="panel-heading"><div><span className="eyebrow">Oral · enteral · parenteral · kombiniert</span><h3>Ernährungsweg und parenterale Ernährung</h3><p>PN ist ein eigener, interprofessioneller Entscheidungsweg – nicht nur die nächste Stufe einer kcal-Rechnung.</p></div><span className={`route-status route-${recommendation.routeDecision.tone}`}>{recommendation.routeDecision.label}</span></div><div className="route-comparison">{recommendation.alternatives.map((item) => <RouteOptionCard key={item.route} item={item} active={recommendation.routeDecision.route === item.route || recommendation.routeDecision.route === "combination" && item.route === "combination"} />)}</div><div className={`pn-decision-card pn-${recommendation.pn.status}`}><div className="pn-decision-head"><div><span className="eyebrow">PN-Indikationsprüfung</span><h4>{recommendation.pn.label}</h4><p>{recommendation.pn.rationale}</p></div><span>{recommendation.pn.ready ? "Teamgate vollständig" : `${recommendation.pn.openPrerequisites.length} Punkte offen`}</span></div><div className="pn-kpi-grid"><Pnkpi label="Aktuelle Deckung" value={`${recommendation.pn.coverage} %`} /><Pnkpi label="Energielücke" value={recommendation.pn.energyGap == null ? "offen" : `${recommendation.pn.energyGap} kcal`} /><Pnkpi label="Proteinlücke" value={recommendation.pn.proteinGap == null ? "offen" : `${recommendation.pn.proteinGap} g`} /><Pnkpi label="Startorientierung" value={recommendation.pn.provisionalPnEnergy ? `${recommendation.pn.provisionalPnEnergy} kcal` : "keine Automatik"} /></div><div className="pn-prerequisites">{recommendation.pn.prerequisites.map((item) => <div key={item.key} className={item.ready ? "ready" : "open"}><span>{item.ready ? <Check size={14} /> : <Clock3 size={14} />}</span><div><b>{item.label}</b><small>{item.owner}</small></div></div>)}</div><div className="pn-access-note"><Hospital size={17} /><div><b>Zugangsorientierung – keine automatische Katheterentscheidung</b><p>{recommendation.pn.accessOrientation}</p></div></div></div></section>

    <section className="panel alternatives-panel"><div className="panel-heading"><div><span className="eyebrow">Professionelle Differenzialentscheidung</span><h3>Warum diese Strategie – und warum nicht die Alternative?</h3><p>Die Ernährungsfachkraft kann die Route gegenüber Team und Patient nachvollziehbar vertreten.</p></div></div><div className="alternative-reason-grid">{recommendation.alternatives.map((item) => <article key={item.route} className={item.suitable ? "suitable" : "limited"}><span>{item.suitable ? <Check size={15} /> : <AlertTriangle size={15} />}</span><div><h4>{item.title}</h4><p>{item.why}</p><small>Neu bewerten: {item.changeWhen}</small></div></article>)}</div></section>

    <section className="panel impact-preview-panel"><div className="panel-heading"><div><span className="eyebrow">Änderungsvorschau ohne Aktenänderung</span><h3>Was verändert sich, wenn …?</h3><p>Hypothesen werden separat simuliert und erst nach fachlicher Bestätigung in das Assessment übernommen.</p></div></div><div className="impact-controls"><Field label="GI-Status simulieren"><select value={whatIf.giTractStatus} onChange={(e) => setWhatIf({ ...whatIf, giTractStatus: e.target.value })}><option value="">unverändert</option><option value="functional">funktionell</option><option value="nonfunctional">nicht funktionell</option></select></Field><Field label="Enterale Machbarkeit"><select value={whatIf.enteralFeasible} onChange={(e) => setWhatIf({ ...whatIf, enteralFeasible: e.target.value })}><option value="">unverändert</option><option value="yes">ja</option><option value="no">nein</option></select></Field><Field label="Schluckstatus"><select value={whatIf.swallowing} onChange={(e) => setWhatIf({ ...whatIf, swallowing: e.target.value })}><option value="">unverändert</option><option value="unauffällig">unauffällig</option><option value="nicht sicher beurteilt">nicht sicher</option></select></Field><label className="check-card compact"><input type="checkbox" checked={whatIf.pnTeamReady} onChange={(e) => setWhatIf({ ...whatIf, pnTeamReady: e.target.checked })} /><span><b>PN-Teamgate simulieren</b><small>nur Vorschau</small></span></label></div>{simulated ? <div className="impact-result"><div><small>Aktuell</small><b>{recommendation.routeDecision.label}</b><span>{recommendation.pn.label}</span></div><ChevronRight size={22} /><div><small>Simulation</small><b>{simulated.routeDecision.label}</b><span>{simulated.pn.label}</span></div><p>{simulated.blocked ? "Simulation bleibt gesperrt: " + simulated.criticalGaps.map((item) => item.title).join(" · ") : "Simulation wäre als Entwurf prüfbar."}</p></div> : <div className="impact-empty">Wähle mindestens eine hypothetische Änderung.</div>}</section>

    <section className="panel calculation-trace-panel anchor-section" id="therapy-calculations"><div className="panel-heading"><div><span className="eyebrow">Deterministisch und reproduzierbar</span><h3>Rechenweg und Versorgungslücke</h3><p>Die PN-Lücke ist eine Planungsgröße. Sie ersetzt weder Beutelzusammensetzung noch pharmazeutische Prüfung.</p></div></div><div className="calculation-trace-grid">{recommendation.calculations.map((item) => <CalculationTraceCard key={item.label} item={item} />)}</div><div className="strategy-switch" aria-label="Therapiestrategie">{[["vorsichtig", "Unterer Korridor"], ["standard", "Korridormitte"], ["protein", "Protein-Fokus"]].map(([value, label]) => <button key={value} className={alternative === value ? "active" : ""} onClick={() => chooseAlternative(value)}>{label}</button>)}</div><div className="target-range-grid"><TargetRangeCard label="Energie" unit="kcal/Tag" low={recommendation.targets.energyLow} high={recommendation.targets.energyHigh} selected={recommendation.selected.energy} note={recommendation.targetMode === "individual" ? "individuell festlegen" : strategyLabels[alternative]} /><TargetRangeCard label="Protein" unit="g/Tag" low={recommendation.targets.proteinLow} high={recommendation.targets.proteinHigh} selected={recommendation.selected.protein} note={recommendation.targetMode === "individual" ? "individuell festlegen" : strategyLabels[alternative]} /><TargetRangeCard label="Flüssigkeit" unit="ml/Tag" low={recommendation.targets.fluidLow} high={recommendation.targets.fluidHigh} selected={recommendation.selected.fluid} note={patient.assessment.fluidRestriction ? "individuell" : "Volumenstatus prüfen"} /></div></section>

    <section className="panel staged-plan-panel anchor-section" id="therapy-plan"><div className="panel-heading"><div><span className="eyebrow">Vom Schluss zur überprüfbaren Maßnahme</span><h3>Priorisierter Therapie- und Monitoringplan</h3><p>Jede Stufe zeigt Regeltyp, Datengrundlage, Ziel und Neubewertung.</p></div></div><div className="recommendation-groups">{recommendation.measures.map((group, index) => <RecommendationGroup key={group.id} group={group} index={index + 1} />)}</div></section>

    <section className="panel monitoring-plan-panel"><div className="panel-heading"><div><span className="eyebrow">Ergebnisqualität</span><h3>Vorgeschlagener Kontrollplan</h3><p>Die professionelle Beraterin definiert nicht nur was getan wird, sondern woran Erfolg und Komplikationen erkannt werden.</p></div><span className="review-date">Nächste Prüfung: {formatDate(recommendation.recommendedReviewDate)}</span></div><div className="monitoring-table"><div className="monitoring-row header"><b>Parameter</b><b>Intervall</b><b>Eskalation / Quelle</b></div>{recommendation.monitoring.map((item) => <div className="monitoring-row" key={item.parameter}><span>{item.parameter}</span><b>{item.interval}</b><small>{item.trigger}<em>{item.source}</em></small></div>)}</div></section>

    <section className="panel source-evidence-panel anchor-section" id="therapy-sources"><div className="panel-heading"><div><span className="eyebrow">Versionierte Wissensbasis</span><h3>Quellen, Regeltypen und Anwendbarkeit</h3><p>Publizierte Leitlinie, deterministische Berechnung, lokaler Standard und MVP-Regel werden visuell getrennt.</p></div><button className="secondary-button" onClick={() => window.dispatchEvent(new CustomEvent("nutripilot-open-rules"))}><BookOpen size={15} /> Register</button></div><div className="source-list">{recommendation.sources.length ? recommendation.sources.map((source) => <GuidelineSource key={source.id} source={source} />) : <div className="empty-source">Keine automatische Quellenregel ausgewählt.</div>}</div><div className="local-rule-list">{Object.values(LOCAL_RULES).map((rule) => <div className="local-rule-card" key={rule.id}><span>{rule.id}</span><div><b>{rule.title}</b><p>{rule.note}</p><small>{rule.type || "NutriPilot-MVP-Regel"} · {rule.status || "zu validieren"}</small></div></div>)}</div></section>

    <section className="panel professional-feedback-panel"><div><span className="eyebrow">Fachliches Lernen ohne Blackbox-Selbstlernen</span><h3>Wie beurteilst du diesen Vorschlag?</h3><p>Feedback wird strukturiert gespeichert und verändert keine Regeln automatisch.</p></div><div className="feedback-buttons">{["fachlich plausibel", "richtig, aber unvollständig", "für diesen Fall nicht passend", "Regel nicht anwendbar", "Patientendaten unvollständig"].map((value) => <button key={value} className={t.professionalFeedback === value ? "active" : ""} onClick={() => saveFeedback(value)}>{value}</button>)}</div><Field label="Begründung / Verbesserung"><textarea value={t.professionalFeedbackReason || ""} onChange={(e) => editTherapy({ professionalFeedbackReason: e.target.value })} placeholder="Welche fachliche Information oder Regel fehlt?" /></Field></section>

    <section className="panel recommendation-actions-panel"><div className="recommendation-actions-copy"><span className="eyebrow">Fachliche Entscheidung</span><h3>Vorschlag übernehmen, anpassen oder ablehnen</h3><p>Datenstand, Regelversion, Route, PN-Status, Änderungen und Bestätigung werden auditierbar dokumentiert.</p></div><div className="recommendation-action-buttons"><button className="primary-button" disabled={recommendation.blocked} onClick={adoptRecommendation}><Check size={16} /> Vorschlag übernehmen</button><button className="secondary-button" onClick={() => setShowEditor(true)}>Manuell anpassen</button><button className="danger-outline-button" onClick={() => setRejectMode((value) => !value)}>Ablehnen</button></div>{t.recommendationStatus === "rejected" && <div className="rejection-history"><b>Dokumentierter Ablehnungsgrund</b><span>{t.recommendationReason}</span></div>}{rejectMode && <div className="rejection-editor"><Field label="Fachlicher Ablehnungsgrund"><textarea value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} placeholder="Warum ist dieser Vorschlag für den konkreten Patienten nicht geeignet?" /></Field><div><button className="secondary-button" onClick={() => setRejectMode(false)}>Abbrechen</button><button className="danger-button" onClick={rejectRecommendation}>Ablehnung dokumentieren</button></div></div>}</section>

    {showEditor && <section className="panel therapy-editor-panel"><div className="panel-heading"><div><span className="eyebrow">Fachlich editierbarer Therapieplan</span><h3>Bestätigte Zielwerte, Route und Erfolgskriterien</h3><p>Eine Therapie ist erst professionell, wenn Ziel, Messparameter, Anpassung und Eskalation definiert sind.</p></div><span className={`edit-status status-${t.recommendationStatus}`}>{t.recommendationStatus || "draft"}</span></div><div className="form-grid three therapy-fields"><Field label="Energieziel (kcal/Tag)"><input type="number" value={t.energyGoal} onChange={(event) => editTherapy({ energyGoal: event.target.value })} /></Field><Field label="Proteinziel (g/Tag)"><input type="number" value={t.proteinGoal} onChange={(event) => editTherapy({ proteinGoal: event.target.value })} /></Field><Field label="Flüssigkeitsziel (ml/Tag)"><input type="number" value={t.fluidGoal} onChange={(event) => editTherapy({ fluidGoal: event.target.value })} /></Field></div><Field label="Bestätigter Ernährungsweg"><input value={t.routeDecision || recommendation.routeDecision.label} onChange={(event) => editTherapy({ routeDecision: event.target.value })} /></Field><Field label="Ziele und Maßnahmen"><textarea className="large-textarea" value={t.measures} onChange={(event) => editTherapy({ measures: event.target.value })} /></Field><div className="form-grid three"><Field label="Erfolgskriterien"><textarea value={t.successCriteria} onChange={(e) => editTherapy({ successCriteria: e.target.value })} /></Field><Field label="Anpassungskriterien"><textarea value={t.adaptationCriteria} onChange={(e) => editTherapy({ adaptationCriteria: e.target.value })} /></Field><Field label="Eskalations-/Abbruchkriterien"><textarea value={t.escalationCriteria} onChange={(e) => editTherapy({ escalationCriteria: e.target.value })} /></Field></div><Field label="Monitoringplan"><textarea value={t.monitoringPlan} onChange={(event) => editTherapy({ monitoringPlan: event.target.value })} /></Field><div className="form-grid two"><Field label="Nächste Verlaufskontrolle"><input type="date" value={t.nextReview} onChange={(event) => editTherapy({ nextReview: event.target.value })} /></Field><div className="approval-card"><ShieldCheck size={20} /><div><b>Human-in-the-loop</b><span>Die Ernährungsfachkraft bestätigt den finalen Plan; PN bleibt interprofessionell.</span></div></div></div><div className="form-footer"><span>{t.confirmedAt ? `Zuletzt bestätigt am ${new Date(t.confirmedAt).toLocaleString("de-DE")} durch ${t.confirmedBy || "Fachkraft"}.` : "Noch nicht fachlich bestätigt."}</span><button className="primary-button" disabled={recommendation.blocked || !t.energyGoal || !t.proteinGoal || !t.measures || !t.successCriteria} onClick={confirmPlan}>{t.confirmed ? "Änderungen bestätigen" : "Therapieplan fachlich bestätigen"}</button></div></section>}
  </div>;
}



function PlanGoal({ label, value, tone }) {
  return <div className={`therapy-plan-goal ${tone}`}><span>{label}</span><b>{value}</b></div>;
}

function DecisionPreviewRow({ label, status, tone }) {
  return <div className="decision-preview-row"><span>{label}</span><b className={tone}>{status}</b></div>;
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


function ClinicalExcellencePanel({ patients, openPatient }) {
  const openBasis = patients.filter((patient) => therapyRecommendation(patient).decisionCompleteness < 70 && !patient.discharge.completed);
  const unconfirmed = patients.filter((patient) => patient.therapy.recommendationStatus === "accepted" && !patient.therapy.confirmed);
  const pnCases = patients.filter((patient) => therapyRecommendation(patient).pn.required && !patient.discharge.completed);
  const due = patients.filter((patient) => patient.therapy.nextReview && patient.therapy.nextReview <= isoDate() && !patient.discharge.completed);
  const focus = openBasis[0] || unconfirmed[0] || pnCases[0] || due[0];
  return <section className="clinical-excellence panel"><div className="clinical-excellence-head"><div><span className="eyebrow">Clinical Excellence</span><h3>Was macht die Beraterin am Standort sichtbar professionell?</h3><p>Vollständige Entscheidungsgrundlagen, begründete Routenwahl, definierte Ergebnisse und zuverlässig geschlossene Kontrollen.</p></div>{focus && <button className="secondary-button" onClick={() => openPatient(focus, "therapy")}>Nächsten Qualitätsfall öffnen <ChevronRight size={15} /></button>}</div><div className="excellence-metrics"><div><b>{openBasis.length}</b><span>Entscheidungsgrundlagen unter 70 %</span></div><div><b>{unconfirmed.length}</b><span>übernommene, unbestätigte Pläne</span></div><div><b>{pnCases.length}</b><span>aktive PN-Prüfungen</span></div><div><b>{due.length}</b><span>fällige Kontrollen</span></div></div></section>;
}

function RulesRegistry() {
  const guidelines = Object.values(GUIDELINES);
  const rules = Object.values(LOCAL_RULES);
  return <div className="stack rules-registry"><section className="panel rules-hero"><span className="eyebrow">Trust & Validation Release</span><h2>Regel- und Quellenregister</h2><p>Jede fachliche Aussage wird als publizierte Leitlinienregel, deterministische Berechnung, lokaler Klinikstandard, NutriPilot-MVP-Regel oder Anwendungsgrenze kenntlich gemacht.</p></section><section className="panel"><div className="panel-heading"><div><h3>Publizierte Quellen</h3><p>Version, Empfehlungsabschnitt, Geltungsbereich und Status.</p></div></div><div className="registry-grid">{guidelines.map((source) => <GuidelineSource key={source.id} source={{ ...source, applicability: "fallabhängig", applicabilityReason: "Die konkrete Anwendbarkeit wird im Patientenfall geprüft." }} />)}</div></section><section className="panel"><div className="panel-heading"><div><h3>Lokale NutriPilot-Regeln</h3><p>Diese Regeln strukturieren Workflow und Sicherheit, sind aber keine publizierten medizinischen Leitlinien.</p></div></div><div className="registry-rule-table">{rules.map((rule) => <div key={rule.id}><span>{rule.id}</span><b>{rule.title}</b><p>{rule.note}</p><small>{rule.type || "NutriPilot-MVP-Regel"} · {rule.status || "zu validieren"}</small></div>)}</div></section></div>;
}

function BriefingFact({ label, value, note }) { return <article className="briefing-fact"><span>{label}</span><b>{value}</b><p>{note}</p></article>; }
function RouteOptionCard({ item, active }) { return <article className={`route-option ${active ? "active" : ""} ${item.suitable ? "suitable" : "limited"}`}><div><span>{item.suitable ? <Check size={15} /> : <AlertTriangle size={15} />}</span><b>{item.title}</b></div><p>{item.why}</p><small>{active ? "aktuell vorgeschlagen" : "Alternative"}</small></article>; }
function Pnkpi({ label, value }) { return <div className="pn-kpi"><span>{label}</span><b>{value}</b></div>; }

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
              <Field label="Kontext"><select value={form.scenario} onChange={(e) => update("scenario", e.target.value)}><option>Neuaufnahme</option><option>Geriatrie</option><option>Onkologie</option><option>Refeeding</option><option>Dysphagie</option><option>Amputation</option><option>Homecare</option><option>Adipositas + Mangelernährung</option><option>Postoperativer Ileus · Parenterale Ernährung</option><option>Chronisches Darmversagen · Home PN</option><option>Intensivmedizin</option></select></Field>
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
  const required = [a.weight, a.height, a.weight3m || a.weight1m, a.intakePercent, a.intakeDays, a.appetite !== "nicht erhoben" ? a.appetite : "", a.swallowing !== "nicht erhoben" ? a.swallowing : "", a.muscleReduced !== "unknown" ? a.muscleReduced : "", a.inflammation !== "unknown" ? a.inflammation : "", a.patientGoal, a.giTractStatus !== "unknown" ? a.giTractStatus : ""];
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
  if (!a.patientGoal) items.push("Patienten-/Behandlungsziel dokumentieren");
  if (a.giTractStatus === "unknown") items.push("GI-Funktion für die Routenwahl einordnen");
  return items.length ? items : ["Keine offensichtliche Datenlücke"];
}

function nextTabForPatient(patient) {
  if (assessmentCompleteness(patient) < 100) return "assessment";
  if (!patient.glim.confirmed) return "glim";
  if (!patient.therapy.confirmed) return "therapy";
  if (patient.consultStatus === "Entlassung" || patient.dischargeDate) return "discharge";
  return "timeline";
}

function Avatar({ patient, large = false }) { return <span className={`patient-avatar ${large ? "large" : ""}`} aria-label={`Initialen ${initials(patient)}`}><span className="avatar-glyph">{initials(patient)}</span></span>; }
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
  return <article className={`reasoning-step reasoning-${step.tone}`}><span className="reasoning-number">{index}</span><div className="reasoning-main"><div className="reasoning-title"><h4>{step.title}</h4><small>{step.source}</small></div><div className="rule-type-badge">{step.ruleType || "Regel"}</div><div className="reasoning-cells"><div><span>Beobachtung</span><p>{step.observation}</p></div><div><span>Angewandte Regel</span><p>{step.rule}</p></div><div><span>Zulässiger fachlicher Schluss</span><p>{step.conclusion}</p></div><div><span>Konkrete Auswirkung</span><p>{step.consequence}</p></div></div><div className="reasoning-limit"><AlertTriangle size={13} /><span><b>Grenze des Schlusses:</b> {step.limitation || "Fachliche Bestätigung erforderlich."}</span></div></div></article>;
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
  return (
    <article className={`recommendation-group group-${group.id}`}>
      <span className="recommendation-index">{index}</span>
      <div>
        <div className="recommendation-group-title"><h4>{group.title}</h4><span>{group.rule}</span></div>
        <div className="recommendation-why"><Info size={14} /><span><b>Medizinischer Schluss:</b> {group.why}</span></div>
        <div className="recommendation-basis-row">
          <div><small>Beruht auf</small><p>{group.basedOn.join(" · ")}</p></div>
          <div><small>Erwartetes Ziel</small><p>{group.expected}</p></div>
          <div><small>Neu bewerten wenn</small><p>{group.reassess}</p></div>
        </div>
        <div className="recommendation-items">{group.items.map((item) => <p key={item}><Check size={14} />{item}</p>)}</div>
      </div>
    </article>
  );
}
function GuidelineSource({ source }) {
  return <a className="guideline-source" href={source.url} target="_blank" rel="noreferrer"><span><BookOpen size={18} /></span><div><div className="source-badges"><small>{source.type || "Leitlinienregel"}</small><small className={`applicability-${String(source.applicability || "fallabhängig").replaceAll(" ", "-")}`}>{source.applicability || "fallabhängig"}</small></div><b>{source.title}</b><small>{source.id} · {source.recommendation} · Version {source.version}</small><p>{source.note}</p><em>Geltungsbereich: {source.scope}</em>{source.applicabilityReason && <strong>Anwendbarkeit im Fall: {source.applicabilityReason}</strong>}</div><ExternalLink size={16} /></a>;
}

createRoot(document.getElementById("root")).render(<App />);
