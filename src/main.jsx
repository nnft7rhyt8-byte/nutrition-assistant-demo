import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  LayoutDashboard, ClipboardList, Activity, BookOpen, BarChart3, Plus,
  Search, Bell, ChevronRight, Check, AlertTriangle, Calculator, Scale,
  FileText, HeartPulse, Clock3, Building2, UserRound, Stethoscope,
  CircleDot, ArrowLeft, Sparkles, Hospital, Utensils, ShieldCheck
} from "lucide-react";
import "./styles.css";

const SEGMENTS = [
  { id: "none", label: "Keine Amputation", percent: 0 },
  { id: "hand", label: "Hand", percent: 0.7 },
  { id: "forearm", label: "Unterarm inkl. Hand", percent: 2.3 },
  { id: "arm", label: "Gesamter Arm", percent: 5.0 },
  { id: "foot", label: "Fuß", percent: 1.5 },
  { id: "belowKnee", label: "Unterschenkel inkl. Fuß", percent: 5.9 },
  { id: "aboveKnee", label: "Oberschenkelamputation", percent: 11.0 },
  { id: "leg", label: "Gesamtes Bein / Hüftexartikulation", percent: 16.0 }
];

const PHASES = [
  ["consult", "Konsil"],
  ["assessment", "Assessment"],
  ["glim", "GLIM"],
  ["plan", "Maßnahmen"],
  ["monitor", "Monitoring"],
  ["discharge", "Entlassung"]
];

const CONSULTS = [
  {
    id: "K-2026-001245", patient: "Maria Schmidt", initials: "MS", age: 82,
    station: "3B Geriatrie", room: "12", requested: "Heute 09:12",
    reason: "NRS-2002: 4 · Gewichtsverlust · Aufnahme <50 %",
    status: "Neu", priority: "Sofort", score: 97, scenario: "Geriatrie",
    alert: "Gewichtsverlust 11 % in 3 Monaten"
  },
  {
    id: "K-2026-001246", patient: "Hans Becker", initials: "HB", age: 76,
    station: "2A Innere", room: "08", requested: "Heute 08:44",
    reason: "NRS-2002: 5 · Refeeding-Risiko",
    status: "Assessment läuft", priority: "Hoch", score: 91, scenario: "Refeeding",
    alert: "Elektrolyte und Thiamin prüfen"
  },
  {
    id: "K-2026-001238", patient: "Eva Koch", initials: "EK", age: 69,
    station: "4C Onkologie", room: "21", requested: "Gestern 15:20",
    reason: "Tumorerkrankung · Aufnahme vermindert",
    status: "GLIM offen", priority: "Hoch", score: 84, scenario: "Onkologie",
    alert: "Muskelmasse noch nicht erhoben"
  },
  {
    id: "K-2026-001231", patient: "Ali Demir", initials: "AD", age: 58,
    station: "5A Chirurgie", room: "14", requested: "Gestern 11:05",
    reason: "Unterschenkelamputation · BMI-Bewertung",
    status: "Therapie läuft", priority: "Mittel", score: 72, scenario: "Amputation",
    alert: "Gewichtsbasis dokumentieren"
  },
  {
    id: "K-2026-001219", patient: "Petra Lang", initials: "PL", age: 74,
    station: "3B Geriatrie", room: "17", requested: "02.08. 13:10",
    reason: "Dysphagie · Kostform prüfen",
    status: "Monitoring", priority: "Mittel", score: 66, scenario: "Dysphagie",
    alert: "Verträglichkeit heute evaluieren"
  },
  {
    id: "K-2026-001203", patient: "Lena Müller", initials: "LM", age: 71,
    station: "4C Onkologie", room: "09", requested: "01.08. 10:30",
    reason: "Entlassung · ambulante Nachsorge",
    status: "Bericht offen", priority: "Heute", score: 60, scenario: "Entlassung",
    alert: "Übergabe an Hausarzt und Homecare"
  }
];

const initialAssessment = {
  observedWeight: 58,
  heightCm: 162,
  weight1m: 61.0,
  weight3m: 65.2,
  weight6m: 66.0,
  intakePercent: 42,
  intakeDays: 8,
  appetite: "deutlich vermindert",
  proteinPercent: 45,
  fluidMl: 1050,
  swallowing: "nicht sicher beurteilt",
  nausea: false,
  vomiting: false,
  diarrhea: false,
  constipation: true,
  muscleMethod: "notMeasured",
  muscleReduced: null,
  inflammation: null,
  inflammationNote: "Akute Erkrankung; klinische Einordnung offen. CRP nur unterstützend.",
  mobility: "eingeschränkt",
  handgrip: "",
  livingSituation: "allein mit ambulanter Unterstützung",
  edema: false,
  ascites: false,
  amputation: { present: true, segment: "belowKnee", bilateral: false, needsWeightBasis: "observed" }
};

function App() {
  const [page, setPage] = useState("cockpit");
  const [selectedConsult, setSelectedConsult] = useState(CONSULTS[0]);
  const [phase, setPhase] = useState("consult");
  const [done, setDone] = useState(["consult"]);
  const [toast, setToast] = useState("");
  const [filter, setFilter] = useState("Alle");
  const [assessment, setAssessment] = useState(initialAssessment);

  const ampSegment = SEGMENTS.find(s => s.id === assessment.amputation.segment) || SEGMENTS[0];
  const missingPercent = assessment.amputation.present
    ? ampSegment.percent * (assessment.amputation.bilateral ? 2 : 1)
    : 0;
  const estimatedWeight = assessment.observedWeight / (1 - missingPercent / 100);
  const observedBmi = assessment.observedWeight / Math.pow(assessment.heightCm / 100, 2);
  const correctedBmi = estimatedWeight / Math.pow(assessment.heightCm / 100, 2);
  const needsWeight = assessment.amputation.needsWeightBasis === "corrected"
    ? estimatedWeight : assessment.observedWeight;

  const notify = m => {
    setToast(m);
    setTimeout(() => setToast(""), 1800);
  };

  const openConsult = consult => {
    setSelectedConsult(consult);
    setPage("workspace");
    setPhase("consult");
  };

  const completePhase = id => {
    setDone(v => v.includes(id) ? v : [...v, id]);
    const index = PHASES.findIndex(([key]) => key === id);
    if (index < PHASES.length - 1) setPhase(PHASES[index + 1][0]);
    notify(`${PHASES[index][1]} abgeschlossen`);
  };

  return (
    <div className="app">
      <Sidebar page={page} setPage={setPage}/>
      <div className="shell">
        <Topbar page={page}/>
        <main>
          <div className="clinical-banner">
            <div>
              <strong>NutriPilot v0.7 · Konsil-Workflow</strong>
              <span>Fachlich orientierter Konzeptprototyp, noch nicht klinisch validiert und nicht für echte Patientendaten.</span>
            </div>
            <div className="source-tag">Konsil → Assessment → GLIM → Therapie</div>
          </div>

          {page === "cockpit" && (
            <ConsultCockpit
              consults={CONSULTS}
              filter={filter}
              setFilter={setFilter}
              openConsult={openConsult}
            />
          )}

          {page === "workspace" && (
            <ConsultWorkspace
              consult={selectedConsult}
              phase={phase}
              setPhase={setPhase}
              done={done}
              completePhase={completePhase}
              assessment={assessment}
              setAssessment={setAssessment}
              ampSegment={ampSegment}
              missingPercent={missingPercent}
              estimatedWeight={estimatedWeight}
              observedBmi={observedBmi}
              correctedBmi={correctedBmi}
              needsWeight={needsWeight}
              back={() => setPage("cockpit")}
            />
          )}

          {page === "monitor" && <Monitoring/>}
          {page === "quality" && <Quality/>}
          {page === "knowledge" && <Knowledge/>}
        </main>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function Sidebar({page, setPage}) {
  const item = (id, icon, label) => (
    <button className={`nav-item ${page === id ? "active" : ""}`} onClick={() => setPage(id)}>
      {icon}<span>{label}</span>
    </button>
  );
  return (
    <aside className="sidebar">
      <div className="brand"><div className="logo">N</div><div><b>NutriPilot</b><small>Clinical Nutrition</small></div></div>
      {item("cockpit", <LayoutDashboard size={18}/>, "Konsil-Cockpit")}
      {item("workspace", <ClipboardList size={18}/>, "Konsil-Workspace")}
      <div className="nav-title">Versorgung</div>
      {item("monitor", <Activity size={18}/>, "Monitoring")}
      <div className="nav-title">Qualität & Wissen</div>
      {item("quality", <BarChart3 size={18}/>, "Qualitätsdashboard")}
      {item("knowledge", <BookOpen size={18}/>, "Leitlinien & Regeln")}
      <div className="profile"><div className="avatar">LB</div><div><b>Laura Becker</b><small>Ernährungsfachkraft</small></div></div>
    </aside>
  );
}

function Topbar({page}) {
  return (
    <header className="topbar">
      <div>
        <h1>{page === "cockpit" ? "Konsil-Cockpit" : "NutriPilot"}</h1>
        <p>{page === "cockpit" ? "Deine ernährungstherapeutische Arbeitsliste" : "Clinical Nutrition Workspace"}</p>
      </div>
      <div className="top-actions">
        <div className="search"><Search size={16}/><span>Konsil, Patient oder Station suchen</span></div>
        <button className="icon-button"><Bell size={18}/></button>
        <button className="primary"><Plus size={17}/> Neues Konsil</button>
      </div>
    </header>
  );
}

function ConsultCockpit({consults, filter, setFilter, openConsult}) {
  const filtered = filter === "Alle" ? consults : consults.filter(c => c.status === filter);
  const counts = {
    neu: consults.filter(c => c.status === "Neu").length,
    assessment: consults.filter(c => c.status.includes("Assessment")).length,
    monitoring: consults.filter(c => c.status === "Monitoring").length,
    discharge: consults.filter(c => c.status === "Bericht offen").length
  };

  return (
    <div className="cockpit-layout">
      <section>
        <div className="cockpit-hero">
          <div>
            <span className="eyebrow">Montag, 3. August</span>
            <h2>Guten Morgen, Laura.</h2>
            <p>Heute liegen sechs Konsile und Verlaufsthemen in deiner Arbeitsliste. NutriPilot priorisiert nach dokumentiertem Handlungsbedarf – du entscheidest.</p>
          </div>
          <div className="hero-score"><Sparkles size={20}/><b>Maria Schmidt zuerst</b><span>Gewichtsverlust, geringe Aufnahme, neues Konsil</span></div>
        </div>

        <div className="cockpit-kpis">
          <Kpi value={counts.neu} label="Neue Konsile" icon={<ClipboardList/>}/>
          <Kpi value={counts.assessment} label="Assessment offen" icon={<Stethoscope/>}/>
          <Kpi value={counts.monitoring} label="Monitoring heute" icon={<Activity/>}/>
          <Kpi value={counts.discharge} label="Entlassungsbericht" icon={<FileText/>}/>
        </div>

        <div className="card consult-list-card">
          <div className="card-toolbar">
            <div><h3>Konsile & Aufgaben</h3><p>Priorisiert nach aktuellem fachlichem Handlungsbedarf</p></div>
            <div className="filter-tabs">
              {["Alle","Neu","Assessment läuft","Monitoring","Bericht offen"].map(f => (
                <button key={f} className={filter === f ? "active" : ""} onClick={() => setFilter(f)}>{f}</button>
              ))}
            </div>
          </div>
          <div className="consult-list">
            {filtered.map(c => <ConsultRow key={c.id} consult={c} onClick={() => openConsult(c)}/>)}
          </div>
        </div>
      </section>

      <aside className="card daily-copilot">
        <div className="copilot-head"><Sparkles size={18}/><div><b>NutriPilot heute</b><span>Prioritäten und offene Übergaben</span></div></div>
        <CopilotTask number="1" title="Maria Schmidt übernehmen" text="Neues Konsil, NRS 4, Gewichtsverlust 11 %." urgency="red"/>
        <CopilotTask number="2" title="Hans Becker absichern" text="Refeeding-Sicherheitscheck noch offen." urgency="amber"/>
        <CopilotTask number="3" title="Petra Lang evaluieren" text="Verträglichkeit und Kostform heute prüfen." urgency="blue"/>
        <div className="day-summary">
          <b>Dein Tag auf einen Blick</b>
          <span>6 Konsile</span><span>2 hohe Sicherheitsprioritäten</span><span>1 Entlassung</span>
        </div>
      </aside>
    </div>
  );
}

function ConsultRow({consult, onClick}) {
  return (
    <button className="consult-row" onClick={onClick}>
      <div className="consult-avatar">{consult.initials}</div>
      <div className="consult-main">
        <div><b>{consult.patient}, {consult.age}</b><span className={`status-chip ${statusClass(consult.status)}`}>{consult.status}</span></div>
        <small><Building2 size={12}/>{consult.station} · Zimmer {consult.room}</small>
        <p>{consult.reason}</p>
      </div>
      <div className="consult-alert"><AlertTriangle size={15}/><span>{consult.alert}</span></div>
      <div className="consult-score"><b>{consult.score}</b><span>Priorität</span></div>
      <ChevronRight size={19}/>
    </button>
  );
}

function statusClass(status) {
  if (status === "Neu") return "new";
  if (status.includes("Assessment")) return "assessment";
  if (status.includes("GLIM")) return "glim";
  if (status === "Monitoring") return "monitor";
  if (status === "Bericht offen") return "discharge";
  return "active";
}

function Kpi({value,label,icon}) {
  return <div className="card cockpit-kpi"><div>{icon}</div><b>{value}</b><span>{label}</span></div>
}

function CopilotTask({number,title,text,urgency}) {
  return <div className={`copilot-task ${urgency}`}><span>{number}</span><div><b>{title}</b><p>{text}</p></div></div>
}

function ConsultWorkspace(props) {
  const {
    consult, phase, setPhase, done, completePhase, assessment, setAssessment,
    ampSegment, missingPercent, estimatedWeight, observedBmi, correctedBmi,
    needsWeight, back
  } = props;

  return (
    <>
      <button className="back-link" onClick={back}><ArrowLeft size={16}/> Zurück zum Konsil-Cockpit</button>
      <div className="consult-header">
        <div className="consult-avatar large">{consult.initials}</div>
        <div className="consult-identity">
          <span className="eyebrow">Konsil {consult.id}</span>
          <h2>{consult.patient}, {consult.age} Jahre</h2>
          <p>{consult.station} · Zimmer {consult.room} · angefordert {consult.requested}</p>
        </div>
        <div className="consult-header-meta">
          <span className={`status-chip ${statusClass(consult.status)}`}>{consult.status}</span>
          <b>Priorität {consult.score}</b>
        </div>
      </div>

      <div className="workspace-layout">
        <aside className="card phase-nav">
          <h3>Konsil-Workflow</h3>
          <div className="progress"><span style={{width:`${done.length / PHASES.length * 100}%`}}/></div>
          <small>{done.length} von {PHASES.length} Schritten abgeschlossen</small>
          <div className="phase-list">
            {PHASES.map(([id,label],index) => (
              <button key={id} className={`phase-button ${phase===id?"active":""} ${done.includes(id)?"done":""}`} onClick={() => setPhase(id)}>
                <span>{done.includes(id)?<Check size={14}/>:index+1}</span>
                <div><b>{label}</b><small>{phase===id?"In Bearbeitung":done.includes(id)?"Abgeschlossen":"Offen"}</small></div>
              </button>
            ))}
          </div>
        </aside>

        <section className="card workspace">
          {phase === "consult" && <ConsultOverview consult={consult} onComplete={() => completePhase("consult")}/>}
          {phase === "assessment" && <Assessment
            assessment={assessment} setAssessment={setAssessment}
            missingPercent={missingPercent} estimatedWeight={estimatedWeight}
            correctedBmi={correctedBmi} needsWeight={needsWeight}
            onComplete={() => completePhase("assessment")}
          />}
          {phase === "glim" && <GLIM assessment={assessment} correctedBmi={correctedBmi} onComplete={() => completePhase("glim")}/>}
          {phase === "plan" && <Plan assessment={assessment} needsWeight={needsWeight} onComplete={() => completePhase("plan")}/>}
          {phase === "monitor" && <Monitoring compact onComplete={() => completePhase("monitor")}/>}
          {phase === "discharge" && <Discharge assessment={assessment} correctedBmi={correctedBmi} onComplete={() => completePhase("discharge")}/>}
        </section>

        <aside className="card copilot">
          <div className="card-title"><HeartPulse size={17}/><h3>NutriPilot</h3></div>
          <div className="insight"><b>Aktueller Schritt</b><p>{PHASES.find(([id])=>id===phase)?.[1]}</p></div>
          {phase === "consult" && <div className="insight warning"><b>29 Daten bereits vorhanden</b><p>Pflege, Arzt und KIS haben Screening, Stammdaten, Diagnosen, Medikamente und Labor bereitgestellt.</p></div>}
          {phase === "assessment" && <div className="insight warning"><b>Nur ergänzen, nicht doppelt erfassen</b><p>NutriPilot markiert vorhandene Klinikdaten und hebt ausschließlich fehlende ernährungsfachliche Angaben hervor.</p></div>}
          {phase === "glim" && <div className="insight"><b>Automatische Auswertung</b><p>GLIM verwendet ausschließlich Assessmentdaten. Änderungen erfolgen an der Datenquelle, nicht in der Auswertung.</p></div>}
          <div className="insight"><b>Fachliche Kontrolle</b><p>Alle Vorschläge bleiben nachvollziehbar und müssen durch die Ernährungsfachkraft bestätigt werden.</p></div>
        </aside>
      </div>
    </>
  );
}

function ConsultOverview({consult,onComplete}) {
  const available = ["NRS-2002 Score 4","Aktuelles Gewicht 58,0 kg","Körpergröße 162 cm","Diagnosen","Medikation","Laborwerte","Pflegebericht","Vitalwerte"];
  const missing = ["Gewichtsverlauf ergänzen","Nahrungsaufnahme quantifizieren","Muskelmasse beurteilen","Krankheitslast fachlich einordnen"];
  return (
    <div className="phase-content">
      <PhaseHeader title="Konsil übernehmen" subtitle="Vorhandene Klinikdaten prüfen und den ernährungsfachlichen Arbeitsauftrag bestätigen."/>
      <div className="consult-reason">
        <div><ClipboardList size={20}/><div><b>Grund des Konsils</b><p>{consult.reason}</p></div></div>
        <span>{consult.scenario}</span>
      </div>
      <div className="data-availability">
        <section>
          <h3><ShieldCheck size={17}/> Bereits aus Kliniksystemen vorhanden</h3>
          {available.map(x => <div className="data-line available" key={x}><Check size={15}/><span>{x}</span><small>übernommen</small></div>)}
        </section>
        <section>
          <h3><CircleDot size={17}/> Ernährungsfachlich noch erforderlich</h3>
          {missing.map(x => <div className="data-line missing" key={x}><CircleDot size={14}/><span>{x}</span><small>offen</small></div>)}
        </section>
      </div>
      <div className="handover-box">
        <b>Konsilauftrag</b>
        <p>Ernährungsassessment ergänzen, diagnostische Einordnung durchführen, Therapiebedarf bewerten und dokumentieren.</p>
      </div>
      <PhaseActions onComplete={onComplete} label="Konsil übernehmen"/>
    </div>
  );
}

function Assessment({assessment,setAssessment,missingPercent,estimatedWeight,correctedBmi,needsWeight,onComplete}) {
  const update = (key,value) => setAssessment({...assessment,[key]:value});
  const updateAmp = (key,value) => setAssessment({...assessment,amputation:{...assessment.amputation,[key]:value}});
  const weightLoss3m = ((assessment.weight3m-assessment.observedWeight)/assessment.weight3m)*100;
  const completeChecks = [
    assessment.observedWeight>0, assessment.heightCm>0, assessment.weight3m>0,
    assessment.intakePercent>=0, assessment.intakeDays>0,
    assessment.muscleMethod!=="notMeasured" && assessment.muscleReduced!==null,
    assessment.inflammation!==null
  ];
  const completion = Math.round(completeChecks.filter(Boolean).length/completeChecks.length*100);
  const modules = [
    ["Anthropometrie", true],
    ["Nahrungsaufnahme", true],
    ["GI & Schlucken", true],
    ["Muskelstatus", assessment.muscleMethod!=="notMeasured" && assessment.muscleReduced!==null],
    ["Krankheitslast", assessment.inflammation!==null],
    ["Sozial & Funktion", true]
  ];

  return (
    <div className="phase-content">
      <PhaseHeader title="Assessment ergänzen" subtitle="Bereits vorhandene Klinikdaten werden übernommen; die Ernährungsfachkraft ergänzt nur fehlende oder zu präzisierende Angaben."/>
      <div className="assessment-overview">
        <div><b>{completion}% vollständig</b><span>GLIM-relevante Datenerhebung</span><div className="progress"><span style={{width:`${completion}%`}}/></div></div>
        <div className="module-status-grid">{modules.map(([name,ok])=><div className={ok?"done":"open"} key={name}><span>{ok?<Check size={13}/>:<CircleDot size={13}/>}</span><b>{name}</b><small>{ok?"vollständig":"offen"}</small></div>)}</div>
      </div>

      <AssessmentSection title="Anthropometrie & Gewichtsverlauf" source="Gewicht und Größe aus Pflege übernommen">
        <div className="form-grid">
          <ReadOnlyField label="Aktuelles Gewicht" value={`${assessment.observedWeight.toFixed(1)} kg`} source="Pflege · heute 07:40"/>
          <ReadOnlyField label="Körpergröße" value={`${assessment.heightCm} cm`} source="Stammdaten"/>
          <Field label="Gewicht vor 1 Monat (kg)"><input type="number" step="0.1" value={assessment.weight1m} onChange={e=>update("weight1m",Number(e.target.value))}/></Field>
          <Field label="Gewicht vor 3 Monaten (kg)"><input type="number" step="0.1" value={assessment.weight3m} onChange={e=>update("weight3m",Number(e.target.value))}/></Field>
          <Field label="Gewicht vor 6 Monaten (kg)"><input type="number" step="0.1" value={assessment.weight6m} onChange={e=>update("weight6m",Number(e.target.value))}/></Field>
          <ReadOnlyField label="Berechneter Gewichtsverlust" value={`${weightLoss3m.toFixed(1)} % in 3 Monaten`} source="automatisch"/>
        </div>
      </AssessmentSection>

      <AssessmentSection title="Nahrungsaufnahme" source="Pflegehinweis vorhanden, fachliche Quantifizierung erforderlich">
        <div className="form-grid">
          <Field label="Energieaufnahme (% des Bedarfs)"><input type="number" value={assessment.intakePercent} onChange={e=>update("intakePercent",Number(e.target.value))}/></Field>
          <Field label="Dauer der Reduktion (Tage)"><input type="number" value={assessment.intakeDays} onChange={e=>update("intakeDays",Number(e.target.value))}/></Field>
          <Field label="Proteinaufnahme (% des Ziels)"><input type="number" value={assessment.proteinPercent} onChange={e=>update("proteinPercent",Number(e.target.value))}/></Field>
          <Field label="Flüssigkeit (ml/Tag)"><input type="number" value={assessment.fluidMl} onChange={e=>update("fluidMl",Number(e.target.value))}/></Field>
          <Field label="Appetit"><select value={assessment.appetite} onChange={e=>update("appetite",e.target.value)}><option>normal</option><option>leicht vermindert</option><option>deutlich vermindert</option><option>kein Appetit</option></select></Field>
          <Field label="Schlucken"><select value={assessment.swallowing} onChange={e=>update("swallowing",e.target.value)}><option>unauffällig</option><option>nicht sicher beurteilt</option><option>auffällig – Logopädie einbeziehen</option></select></Field>
        </div>
      </AssessmentSection>

      <AssessmentSection title="Muskelstatus & Krankheitslast" source="Ernährungsfachliche Ergänzung">
        <div className="form-grid">
          <Field label="Muskelmassen-Messmethode"><select value={assessment.muscleMethod} onChange={e=>update("muscleMethod",e.target.value)}><option value="notMeasured">Nicht erhoben</option><option value="bia">BIA</option><option value="dxa">DXA</option><option value="ct">CT-basiert</option><option value="anthropometry">Validierte Anthropometrie</option></select></Field>
          <Field label="Muskelmasse reduziert?"><select value={assessment.muscleReduced===null?"unknown":assessment.muscleReduced?"yes":"no"} disabled={assessment.muscleMethod==="notMeasured"} onChange={e=>update("muscleReduced",e.target.value==="unknown"?null:e.target.value==="yes")}><option value="unknown">Nicht beurteilbar</option><option value="yes">Ja</option><option value="no">Nein</option></select></Field>
          <Field label="Krankheitslast / Entzündung"><select value={assessment.inflammation===null?"unknown":assessment.inflammation?"yes":"no"} onChange={e=>update("inflammation",e.target.value==="unknown"?null:e.target.value==="yes")}><option value="unknown">Noch offen</option><option value="yes">Kriterium erfüllt</option><option value="no">Nicht erfüllt</option></select></Field>
          <Field label="Klinische Begründung"><textarea value={assessment.inflammationNote} onChange={e=>update("inflammationNote",e.target.value)}/></Field>
        </div>
      </AssessmentSection>

      <div className="module">
        <div className="module-head"><div><Scale size={19}/><div><h3>Amputation / fehlende Körpersegmente</h3><p>Transparente Schätzhilfe für BMI und Gewichtsinterpretation.</p></div></div><label className="switch"><input type="checkbox" checked={assessment.amputation.present} onChange={e=>updateAmp("present",e.target.checked)}/><span/></label></div>
        {assessment.amputation.present && <>
          <div className="form-grid">
            <Field label="Fehlendes Körpersegment"><select value={assessment.amputation.segment} onChange={e=>updateAmp("segment",e.target.value)}>{SEGMENTS.filter(s=>s.id!=="none").map(s=><option key={s.id} value={s.id}>{s.label} · {s.percent}%</option>)}</select></Field>
            <Field label="Seite / Anzahl"><select value={assessment.amputation.bilateral?"bilateral":"unilateral"} onChange={e=>updateAmp("bilateral",e.target.value==="bilateral")}><option value="unilateral">Einseitig</option><option value="bilateral">Beidseitig</option></select></Field>
          </div>
          <div className="amputation-results">
            <Metric label="Gemessen" value={`${assessment.observedWeight.toFixed(1)} kg`}/>
            <Metric label="Fehlender Anteil" value={`${missingPercent.toFixed(1)} %`}/>
            <Metric label="Schätzgewicht" value={`${estimatedWeight.toFixed(1)} kg`}/>
            <Metric label="Korrigierter BMI" value={`${correctedBmi.toFixed(1)} kg/m²`}/>
          </div>
          <div className="formula"><Calculator size={17}/><div><b>Berechnung nachvollziehbar</b><code>WtE = {assessment.observedWeight.toFixed(1)} ÷ (1 − {(missingPercent/100).toFixed(3)}) = {estimatedWeight.toFixed(1)} kg</code><p>Schätzung; klinische Beurteilung bleibt erforderlich.</p></div></div>
        </>}
      </div>

      <div className="module">
        <h3>Gewichtsbasis für Maßnahmenentwurf</h3>
        <div className="choice-grid">
          <label className={assessment.amputation.needsWeightBasis==="observed"?"choice active":"choice"}><input type="radio" checked={assessment.amputation.needsWeightBasis==="observed"} onChange={()=>updateAmp("needsWeightBasis","observed")}/><b>Gemessenes Gewicht</b><span>{assessment.observedWeight.toFixed(1)} kg</span><small>Aktive Auswahl</small></label>
          <label className={assessment.amputation.needsWeightBasis==="corrected"?"choice active":"choice"}><input type="radio" checked={assessment.amputation.needsWeightBasis==="corrected"} onChange={()=>updateAmp("needsWeightBasis","corrected")}/><b>Korrigiertes Schätzgewicht</b><span>{estimatedWeight.toFixed(1)} kg</span><small>Nur mit Begründung</small></label>
        </div>
        <div className="basis-result">Verwendete Gewichtsbasis: <b>{needsWeight.toFixed(1)} kg</b></div>
      </div>
      <PhaseActions onComplete={onComplete} label="Assessment abschließen"/>
    </div>
  );
}

function AssessmentSection({title,source,children}) {
  return <section className="assessment-section"><div className="section-title"><h3>{title}</h3><span>{source}</span></div>{children}</section>
}

function ReadOnlyField({label,value,source}) {
  return <div className="readonly-field"><span>{label}</span><b>{value}</b><small><Check size={12}/> {source}</small></div>
}

function GLIM({assessment,correctedBmi,onComplete}) {
  const weightLoss3m=((assessment.weight3m-assessment.observedWeight)/assessment.weight3m)*100;
  const weightState=weightLoss3m>5?"yes":"no";
  const bmiState=correctedBmi<22?"yes":"no";
  const muscleState=assessment.muscleReduced===null?"unknown":assessment.muscleReduced?"yes":"no";
  const intakeState=((assessment.intakePercent<50&&assessment.intakeDays>7)||(assessment.intakePercent<100&&assessment.intakeDays>14))?"yes":"no";
  const inflammationState=assessment.inflammation===null?"unknown":assessment.inflammation?"yes":"no";
  const diagnosis=[weightState,bmiState,muscleState].includes("yes") && [intakeState,inflammationState].includes("yes");
  const stage=diagnosis?(weightLoss3m>10||correctedBmi<20?"Stage 2 – schwer":"Stage 1 – moderat"):"Keine Einstufung";
  return (
    <div className="phase-content">
      <PhaseHeader title="Diagnostische Bewertung · GLIM" subtitle="Vollständig automatisch aus den Daten des Assessments – keine erneute Eingabe."/>
      <div className="glim-origin"><b><Sparkles size={15}/> Aus Assessment berechnet</b><span>Änderungen werden ausschließlich an der ursprünglichen Datenquelle vorgenommen.</span></div>
      <div className="glim-grid">
        <div className="module">
          <h3>Phänotypische Kriterien</h3>
          <AutoCriterion state={weightState} title="Gewichtsverlust" value={`${weightLoss3m.toFixed(1)} % in 3 Monaten`} source="Assessment · Gewichtsverlauf"/>
          <AutoCriterion state={bmiState} title="Niedriger BMI" value={`${correctedBmi.toFixed(1)} kg/m² · Grenzwert ≥70 Jahre: <22`} source="Assessment · Anthropometrie"/>
          <AutoCriterion state={muscleState} title="Muskelmasse" value={muscleState==="unknown"?"Noch nicht erhoben":assessment.muscleReduced?"Reduziert":"Nicht reduziert"} source={`Assessment · ${assessment.muscleMethod}`}/>
        </div>
        <div className="module">
          <h3>Ätiologische Kriterien</h3>
          <AutoCriterion state={intakeState} title="Reduzierte Aufnahme" value={`${assessment.intakePercent} % seit ${assessment.intakeDays} Tagen`} source="Assessment · Nahrungsaufnahme"/>
          <AutoCriterion state={inflammationState} title="Krankheitslast / Entzündung" value={assessment.inflammation===null?"Noch nicht eingeordnet":assessment.inflammationNote} source="Assessment · klinische Einordnung"/>
        </div>
      </div>
      <div className={`result-panel ${diagnosis?"severe":""}`}><div><b>{diagnosis?"GLIM-Systematik erfüllt":"GLIM noch nicht vollständig"}</b><p>{diagnosis?`Automatisch abgeleiteter Schweregrad: ${stage}. Diagnose durch Fachkraft bestätigen.`:"Offene Daten bleiben sichtbar; bereits erfüllte Kriterien werden nicht erneut eingegeben."}</p></div><span>{stage}</span></div>
      <div className="audit-panel"><b>Warum dieses Ergebnis?</b><div><span>Gewichtsverlust</span><code>{weightLoss3m.toFixed(1)} % → erfüllt</code></div><div><span>Nahrungsaufnahme</span><code>{assessment.intakePercent} % / {assessment.intakeDays} Tage → erfüllt</code></div><div><span>Schweregrad</span><code>Gewichtsverlust >10 % in 6 Monaten → Stage 2</code></div></div>
      <PhaseActions onComplete={onComplete} label="Diagnose fachlich bestätigen"/>
    </div>
  );
}

function AutoCriterion({state,title,value,source}) {
  return <div className="auto-criterion"><span className={`criterion-state ${state}`}>{state==="yes"?"✓":state==="no"?"–":"?"}</span><div><b>{title}</b><strong>{value}</strong><small>{source}</small></div></div>
}

function Plan({assessment,needsWeight,onComplete}) {
  const energyLow=Math.round(needsWeight*25);
  const energyHigh=Math.round(needsWeight*30);
  const proposals=[
    ["Energieanreicherung","Ziel ≥75 % Bedarfsdeckung","Pflege / Küche"],
    ["Trinknahrung 2× täglich","Verträglichkeit und Aufnahme dokumentieren","Pflege"],
    ["Mahlzeitenprotokoll","Ausgangslage 42 % Bedarfsdeckung","Station 3B"],
    ["Refeeding-Sicherheitscheck","Elektrolyte und Thiamin ärztlich prüfen","Ärztlicher Dienst"],
    ["Evaluation in 48 Stunden","Zielerreichung und Verträglichkeit","Ernährungsfachkraft"]
  ];
  return (
    <div className="phase-content">
      <PhaseHeader title="Maßnahmenvorschlag" subtitle="Aus Assessment und diagnostischer Bewertung erzeugt – als prüfbarer Entwurf, nicht als autonome Therapieentscheidung."/>
      <div className="proposal-summary"><Sparkles size={19}/><div><b>NutriPilot hat 5 Maßnahmen vorbereitet</b><p>Gewichtsbasis {needsWeight.toFixed(1)} kg · Demo-Energiekorridor {energyLow}–{energyHigh} kcal/Tag</p></div></div>
      <div className="proposal-list">{proposals.map(([title,text,owner],i)=><label className="proposal-item" key={title}><input type="checkbox" defaultChecked/><span>{i+1}</span><div><b>{title}</b><p>{text}</p></div><small>{owner}</small></label>)}</div>
      <div className="safety-note"><AlertTriangle size={18}/><div><b>Sicherheitsrelevante Prüfung</b><p>Refeeding-Risiko bleibt eine separate klinische Sicherheitsbewertung mit ärztlicher Beteiligung.</p></div></div>
      <PhaseActions onComplete={onComplete} label="Maßnahmen bestätigen"/>
    </div>
  );
}

function Monitoring({compact=false,onComplete}) {
  return (
    <div className="phase-content">
      {!compact && <PhaseHeader title="Monitoring" subtitle="Gewicht, Bedarfsdeckung, Verträglichkeit und Therapieereignisse."/>}
      <div className="metrics">
        <Metric label="Aktuelles Gewicht" value="58,0 kg"/>
        <Metric label="Energieabdeckung" value="62 %"/>
        <Metric label="Proteinabdeckung" value="58 %"/>
        <Metric label="Unter Zielbereich" value="3 Tage" danger/>
      </div>
      <div className="module">
        <div className="chart-title"><h3>Gewicht und Energiebedarfsdeckung</h3><small>Linke Skala kg · rechte Skala %</small></div>
        <div className="legend"><span><i className="blue"/>Gewicht (kg)</span><span><i className="green"/>Energiebedarfsdeckung (%)</span><span><i className="dashed"/>Therapieziel 75 %</span></div>
        <svg className="chart" viewBox="0 0 700 270">
          <line x1="60" y1="205" x2="640" y2="205" className="gridline"/><line x1="60" y1="30" x2="60" y2="205" className="gridline"/><line x1="640" y1="30" x2="640" y2="205" className="gridline"/><line x1="60" y1="74" x2="640" y2="74" className="target"/>
          <text x="14" y="36">66 kg</text><text x="14" y="120">62 kg</text><text x="14" y="207">58 kg</text><text x="650" y="36">100 %</text><text x="650" y="78">75 %</text><text x="650" y="207">0 %</text>
          <polyline points="65,38 145,52 225,68 305,94 385,115 465,139 545,160 635,185" className="weight-line"/><polyline points="65,164 145,157 225,171 305,158 385,142 465,130 545,113 635,99" className="energy-line"/>
          <line x1="385" y1="30" x2="385" y2="205" className="event-line"/><circle cx="385" cy="142" r="6" className="event-dot"/><text x="330" y="22">Trinknahrung gestartet</text>
          <text x="60" y="238">03.08.</text><text x="245" y="238">05.08.</text><text x="425" y="238">07.08.</text><text x="585" y="238">09.08.</text>
        </svg>
        <div className="monitor-analysis"><Sparkles size={17}/><div><b>NutriPilot Verlaufshinweis</b><p>Die Bedarfsdeckung steigt seit Beginn der Trinknahrung, liegt aber weiterhin unter dem Therapieziel. Gewicht bleibt rückläufig; Evaluation innerhalb von 48 Stunden.</p></div></div>
      </div>
      {onComplete&&<PhaseActions onComplete={onComplete} label="Monitoring dokumentieren"/>}
    </div>
  );
}

function Discharge({assessment,correctedBmi,onComplete}) {
  return (
    <div className="phase-content">
      <PhaseHeader title="Entlassung & Übergabe" subtitle="Automatisch vorbereitete Zusammenfassung aus dem gesamten Konsilverlauf."/>
      <div className="discharge-timeline">
        {["Konsil übernommen","Assessment ergänzt","GLIM Stage 2 bestätigt","Therapie begonnen","Monitoring durchgeführt","Nachsorge vorbereitet"].map((x,i)=><div key={x}><span><Check size={13}/></span><b>{x}</b><small>{["03.08. 09:20","03.08. 10:05","03.08. 10:18","03.08. 11:00","05.08. 09:15","09.08. 14:00"][i]}</small></div>)}
      </div>
      <div className="document-preview">
        <div className="document-head"><FileText size={19}/><div><b>Entlassungsbericht · Entwurf</b><span>Aus strukturierten Daten erzeugt, fachlich zu prüfen</span></div></div>
        <p><b>Ernährungsstatus:</b> NRS-2002 positiv. GLIM-Systematik erfüllt, Stage 2 aufgrund eines Gewichtsverlusts von 11 % innerhalb von drei Monaten. Korrigierter BMI {correctedBmi.toFixed(1)} kg/m².</p>
        <p><b>Intervention:</b> Energieangereicherte Kost, Trinknahrung zweimal täglich, Mahlzeitenprotokoll und Verlaufskontrolle.</p>
        <p><b>Nachsorge:</b> Ambulante Ernährungstherapie, wöchentliche Gewichtskontrolle und Weiterführung der Maßnahmen nach ärztlicher Verordnung.</p>
      </div>
      <div className="form-grid">
        <Field label="Übergabe an"><select><option>Hausarzt + ambulante Ernährungsfachkraft</option><option>Homecare</option><option>Pflegeeinrichtung</option></select></Field>
        <Field label="Status"><select><option>Weiterer ernährungstherapeutischer Bedarf</option><option>Stabil</option><option>Abgeschlossen</option></select></Field>
      </div>
      <PhaseActions onComplete={onComplete} label="Konsil abschließen"/>
    </div>
  );
}

function Quality() {
  return <div className="card standalone"><PhaseHeader title="Qualitätsdashboard" subtitle="Demo-Kennzahlen zum Konsilprozess."/><div className="metrics"><Metric label="Konsile <24 h übernommen" value="91 %"/><Metric label="Assessment vollständig" value="87 %"/><Metric label="GLIM nachvollziehbar" value="97 %"/><Metric label="Offene Konsile" value="6" danger/></div></div>;
}

function Knowledge() {
  return <div className="card standalone"><PhaseHeader title="Leitlinien, Regeln & Grenzen" subtitle="Regeln werden versioniert und in jeder Auswertung nachvollziehbar gemacht."/><div className="knowledge"><article><b>NRS-2002</b><p>Das Screening wird in der Klinik bereits durch Pflege oder Behandlungsteam durchgeführt und als Eingangsdaten des Konsils übernommen.</p></article><article><b>GLIM</b><p>GLIM ist in NutriPilot eine automatische Auswertung des ernährungsfachlichen Assessments und keine zweite Eingabemaske.</p></article><article><b>Fachliche Entscheidung</b><p>Priorisierung, Diagnoseentwurf und Maßnahmenvorschläge müssen von qualifizierten Fachpersonen geprüft und bestätigt werden.</p></article></div></div>;
}

function PhaseHeader({title,subtitle}) { return <div className="phase-header"><div><h2>{title}</h2><p>{subtitle}</p></div><span className="status">v0.7 Demo</span></div> }
function Field({label,children}) { return <label className="field"><span>{label}</span>{children}</label> }
function Metric({label,value,danger}) { return <div className={`metric ${danger?"danger":""}`}><b>{value}</b><span>{label}</span></div> }
function PhaseActions({onComplete,label="Schritt abschließen"}) { return <div className="phase-actions"><button className="secondary"><FileText size={16}/> Entwurf speichern</button><button className="primary" onClick={onComplete}>{label}<ChevronRight size={16}/></button></div> }

createRoot(document.getElementById("root")).render(<App/>);
