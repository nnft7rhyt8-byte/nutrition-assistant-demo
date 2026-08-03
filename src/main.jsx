import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Home, Users, Route, ClipboardCheck, Activity, BookOpen, BarChart3,
  Plus, Search, Bell, ChevronRight, Check, AlertTriangle, Calculator,
  Scale, Stethoscope, FileText, HeartPulse
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
  ["admission", "Aufnahme"],
  ["screening", "Screening"],
  ["assessment", "Assessment"],
  ["glim", "GLIM"],
  ["plan", "Maßnahmen"],
  ["monitor", "Monitoring"],
  ["discharge", "Entlassung"]
];

function App() {
  const [page, setPage] = useState("journey");
  const [phase, setPhase] = useState("screening");
  const [done, setDone] = useState(["admission"]);
  const [toast, setToast] = useState("");

  const [nrs, setNrs] = useState({
    prescreen: { bmiLow: false, weightLoss: true, intakeReduced: true, severeDisease: false },
    nutritionScore: 2,
    diseaseScore: 1,
    age: 82
  });

  const [assessment, setAssessment] = useState({
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
    chewing: "unauffällig",
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
    amputation: {
      present: true,
      segment: "belowKnee",
      bilateral: false,
      needsWeightBasis: "observed"
    }
  });

  const ampSegment = SEGMENTS.find(s => s.id === assessment.amputation.segment) || SEGMENTS[0];
  const missingPercent = assessment.amputation.present
    ? ampSegment.percent * (assessment.amputation.bilateral ? 2 : 1)
    : 0;
  const estimatedWeight = assessment.observedWeight / (1 - missingPercent / 100);
  const observedBmi = assessment.observedWeight / Math.pow(assessment.heightCm / 100, 2);
  const correctedBmi = estimatedWeight / Math.pow(assessment.heightCm / 100, 2);
  const needsWeight = assessment.amputation.needsWeightBasis === "corrected" ? estimatedWeight : assessment.observedWeight;

  const notify = (m) => {
    setToast(m);
    setTimeout(() => setToast(""), 1800);
  };

  const completePhase = (id) => {
    setDone(v => v.includes(id) ? v : [...v, id]);
    const i = PHASES.findIndex(([key]) => key === id);
    if (i < PHASES.length - 1) setPhase(PHASES[i + 1][0]);
    notify(`${PHASES[i][1]} abgeschlossen`);
  };

  return (
    <div className="app">
      <Sidebar page={page} setPage={setPage} />
      <div className="shell">
        <Topbar />
        <main>
          <div className="clinical-banner">
            <div>
              <strong>Fachlich fundierter Konzeptprototyp – noch nicht klinisch validiert</strong>
              <span>Geltungsbereich: erwachsene, nicht intensivpflichtige stationäre Patienten. Keine Verwendung mit echten Patientendaten.</span>
            </div>
            <div className="source-tag">NRS-2002 · GLIM 2025 · zentrale Datenerfassung</div>
          </div>

          {page === "journey" && (
            <Journey
              phase={phase}
              setPhase={setPhase}
              done={done}
              completePhase={completePhase}
              nrs={nrs}
              setNrs={setNrs}
              assessment={assessment}
              setAssessment={setAssessment}
              ampSegment={ampSegment}
              missingPercent={missingPercent}
              estimatedWeight={estimatedWeight}
              observedBmi={observedBmi}
              correctedBmi={correctedBmi}
              needsWeight={needsWeight}
            />
          )}
          {page === "monitor" && <Monitoring />}
          {page === "quality" && <Quality />}
          {page === "knowledge" && <Knowledge />}
        </main>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function Sidebar({ page, setPage }) {
  const item = (id, icon, label) => (
    <button className={`nav-item ${page === id ? "active" : ""}`} onClick={() => setPage(id)}>
      {icon}<span>{label}</span>
    </button>
  );
  return (
    <aside className="sidebar">
      <div className="brand"><div className="logo">N</div><div><b>NutriPilot</b><small>Clinical Nutrition</small></div></div>
      {item("journey", <Route size={18}/>, "Patientenreise")}
      <div className="nav-title">Arbeitsbereich</div>
      {item("journey", <Users size={18}/>, "Patienten-Workspace")}
      {item("monitor", <Activity size={18}/>, "Monitoring")}
      <div className="nav-title">Qualität & Wissen</div>
      {item("quality", <BarChart3 size={18}/>, "Qualitätsdashboard")}
      {item("knowledge", <BookOpen size={18}/>, "Leitlinien & Regeln")}
      <div className="profile"><div className="avatar">LB</div><div><b>Laura Becker</b><small>Ernährungsfachkraft</small></div></div>
    </aside>
  );
}

function Topbar() {
  return (
    <header className="topbar">
      <div><h1>NutriPilot</h1><p>Clinical Nutrition Workspace</p></div>
      <div className="top-actions">
        <div className="search"><Search size={16}/><span>Patient, Zimmer oder Aufgabe</span></div>
        <button className="icon-button"><Bell size={18}/></button>
        <button className="primary"><Plus size={17}/> Neuer Eintrag</button>
      </div>
    </header>
  );
}

function Journey(props) {
  const {
    phase, setPhase, done, completePhase, nrs, setNrs, assessment, setAssessment,
    ampSegment, missingPercent, estimatedWeight, observedBmi, correctedBmi, needsWeight
  } = props;
  const progress = Math.round(done.length / PHASES.length * 100);

  return (
    <>
      <div className="patient-head">
        <div className="patient-avatar">MS</div>
        <div><h2>Maria Schmidt, 82 Jahre</h2><p>Station 3B · Zimmer 12 · Aufnahme 03.08.2026</p></div>
        <span className="priority">Hohe Priorität</span>
      </div>

      <div className="journey-layout">
        <aside className="card phase-nav">
          <h3>Patientenreise</h3>
          <div className="progress"><span style={{width: `${progress}%`}} /></div>
          <small>{done.length} von 7 Phasen abgeschlossen</small>
          <div className="phase-list">
            {PHASES.map(([id, label], index) => (
              <button key={id}
                className={`phase-button ${phase === id ? "active" : ""} ${done.includes(id) ? "done" : ""}`}
                onClick={() => setPhase(id)}>
                <span>{done.includes(id) ? <Check size={14}/> : index + 1}</span>
                <div><b>{label}</b><small>{phase === id ? "In Bearbeitung" : done.includes(id) ? "Abgeschlossen" : "Offen"}</small></div>
              </button>
            ))}
          </div>
        </aside>

        <section className="card workspace">
          {phase === "admission" && <SimplePhase title="1. Aufnahme" subtitle="Basisdaten und erste Ernährungshinweise erfassen." onComplete={() => completePhase("admission")} />}
          {phase === "screening" && <Screening nrs={nrs} setNrs={setNrs} onComplete={() => completePhase("screening")} />}
          {phase === "assessment" && (
            <Assessment
              assessment={assessment} setAssessment={setAssessment}
              ampSegment={ampSegment} missingPercent={missingPercent}
              estimatedWeight={estimatedWeight} observedBmi={observedBmi}
              correctedBmi={correctedBmi} needsWeight={needsWeight}
              onComplete={() => completePhase("assessment")}
            />
          )}
          {phase === "glim" && <GLIM assessment={assessment} correctedBmi={correctedBmi} onComplete={() => completePhase("glim")} />}
          {phase === "plan" && <Plan needsWeight={needsWeight} assessment={assessment} onComplete={() => completePhase("plan")} />}
          {phase === "monitor" && <Monitoring compact onComplete={() => completePhase("monitor")} />}
          {phase === "discharge" && <Discharge assessment={assessment} correctedBmi={correctedBmi} onComplete={() => completePhase("discharge")} />}
        </section>

        <aside className="card copilot">
          <div className="card-title"><HeartPulse size={17}/><h3>NutriPilot Begleitung</h3></div>
          <div className="insight"><b>Aktuelle Phase</b><p>{PHASES.find(([id]) => id === phase)?.[1]}</p></div>
          {phase === "screening" && <div className="insight warning"><b>Zweistufiges NRS-2002</b><p>Vier Fragen bilden nur das Vorscreening. Bei mindestens einem Ja wird das Hauptscreening mit Ernährungsstatus, Krankheitsschwere und Alterszuschlag geöffnet.</p></div>}
          {phase === "assessment" && <div className="insight warning"><b>Zentrale Datenquelle</b><p>Alles, was hier erfasst wird, fließt automatisch in GLIM, Maßnahmen, Monitoring und Entlassung ein.</p></div>}
          {phase === "glim" && <div className="insight"><b>Keine Doppeleingabe</b><p>GLIM wertet ausschließlich bereits dokumentierte Assessmentdaten aus. Offene Kriterien führen zurück zur Datenerhebung.</p></div>}
          <div className="insight"><b>Fachkraft entscheidet</b><p>NutriPilot berechnet und erklärt. Diagnose und Therapie werden fachlich bestätigt.</p></div>
        </aside>
      </div>
    </>
  );
}

function SimplePhase({ title, subtitle, onComplete }) {
  return (
    <div className="phase-content">
      <PhaseHeader title={title} subtitle={subtitle}/>
      <div className="form-grid">
        <Field label="Aufnahmedatum"><input defaultValue="03.08.2026"/></Field>
        <Field label="Station / Zimmer"><input defaultValue="3B / 12"/></Field>
        <Field label="Aufnahmeanlass"><input defaultValue="Allgemeinzustand verschlechtert"/></Field>
        <Field label="Erste Hinweise"><textarea defaultValue="Appetit vermindert; Gewichtsverlust berichtet."/></Field>
      </div>
      <PhaseActions onComplete={onComplete}/>
    </div>
  );
}

function Screening({ nrs, setNrs, onComplete }) {
  const pre = nrs.prescreen;
  const prePositive = Object.values(pre).some(Boolean);
  const agePoint = nrs.age >= 70 ? 1 : 0;
  const total = nrs.nutritionScore + nrs.diseaseScore + agePoint;
  const updatePre = (key, value) => setNrs({...nrs, prescreen: {...pre, [key]: value}});

  return (
    <div className="phase-content">
      <PhaseHeader title="2. NRS-2002 Screening" subtitle="Zweistufiges Risikoscreening für erwachsene Krankenhauspatienten; keine Diagnose."/>
      <div className="workflow-note"><b>Schritt 1: Vorscreening</b><span>Mindestens eine Ja-Antwort öffnet das Hauptscreening. Bei viermal Nein wird entsprechend Klinikprozess erneut gescreent.</span></div>

      <div className="nrs-prescreen">
        <YesNoRow label="BMI unter 20,5 kg/m²?" value={pre.bmiLow} onChange={v=>updatePre("bmiLow",v)} />
        <YesNoRow label="Gewichtsverlust innerhalb der letzten 3 Monate?" value={pre.weightLoss} onChange={v=>updatePre("weightLoss",v)} />
        <YesNoRow label="Verminderte Nahrungsaufnahme in der letzten Woche?" value={pre.intakeReduced} onChange={v=>updatePre("intakeReduced",v)} />
        <YesNoRow label="Schwere Erkrankung / Intensivbehandlung?" value={pre.severeDisease} onChange={v=>updatePre("severeDisease",v)} />
      </div>

      <div className={`prescreen-result ${prePositive ? "positive" : "negative"}`}>
        <b>{prePositive ? "Vorscreening positiv" : "Vorscreening unauffällig"}</b>
        <span>{prePositive ? "Mindestens eine Frage wurde mit Ja beantwortet. Hauptscreening erforderlich." : "Alle Fragen wurden mit Nein beantwortet. Wiederholung nach Klinikstandard."}</span>
      </div>

      {prePositive && <>
        <div className="workflow-note main-screen"><b>Schritt 2: Hauptscreening</b><span>Score = beeinträchtigter Ernährungsstatus + Krankheitsschwere + Alterszuschlag ab 70 Jahren.</span></div>
        <div className="score-grid">
          <ScoreSelector
            title="Beeinträchtigter Ernährungsstatus"
            value={nrs.nutritionScore}
            onChange={v=>setNrs({...nrs,nutritionScore:v})}
            options={[
              ["0","Normaler Ernährungsstatus"],
              ["1","Leicht: z. B. >5 % Gewichtsverlust in 3 Monaten oder Aufnahme 50–75 %"],
              ["2","Moderat: z. B. >5 % Gewichtsverlust in 2 Monaten / BMI 18,5–20,5 + Beeinträchtigung / Aufnahme 25–60 %"],
              ["3","Schwer: z. B. >5 % Gewichtsverlust in 1 Monat / BMI <18,5 + Beeinträchtigung / Aufnahme 0–25 %"]
            ]}
          />
          <ScoreSelector
            title="Krankheitsschwere / erhöhter Bedarf"
            value={nrs.diseaseScore}
            onChange={v=>setNrs({...nrs,diseaseScore:v})}
            options={[
              ["0","Kein zusätzlicher Punkt"],
              ["1","Leicht: z. B. chronische Erkrankung mit akuter Komplikation"],
              ["2","Moderat: z. B. große abdominale Operation, Schlaganfall, schwere Pneumonie"],
              ["3","Schwer: z. B. Intensivbehandlung / APACHE II >10"]
            ]}
          />
        </div>

        <div className="nrs-calculation">
          <CalcItem label="Ernährungsstatus" value={nrs.nutritionScore}/>
          <span>+</span><CalcItem label="Krankheitsschwere" value={nrs.diseaseScore}/>
          <span>+</span><CalcItem label={`Alter ${nrs.age} Jahre`} value={agePoint}/>
          <span>=</span><CalcItem label="Gesamtscore" value={total} strong/>
        </div>

        <div className={`result-panel ${total >= 3 ? "severe" : ""}`}>
          <div><b>{total >= 3 ? "Ernährungsrisiko vorhanden" : "Kein Ernährungsrisiko nach NRS-2002"}</b>
          <p>{total >= 3 ? "Score ≥3: vollständiges Ernährungsassessment und individueller Versorgungsplan erforderlich." : "Erneutes Screening entsprechend Klinikprozess."}</p></div>
          <span>{total} Punkte</span>
        </div>
      </>}

      <PhaseActions onComplete={onComplete}/>
    </div>
  );
}

function YesNoRow({label,value,onChange}) {
  return <div className="yesno-row"><b>{label}</b><div><button className={value ? "selected yes" : ""} onClick={()=>onChange(true)}>Ja</button><button className={!value ? "selected no" : ""} onClick={()=>onChange(false)}>Nein</button></div></div>
}
function ScoreSelector({title,value,onChange,options}) {
  return <div className="score-selector"><h3>{title}</h3>{options.map(([score,text])=><label key={score} className={value===Number(score)?"selected":""}><input type="radio" checked={value===Number(score)} onChange={()=>onChange(Number(score))}/><span className="score-number">{score}</span><span>{text}</span></label>)}</div>
}
function CalcItem({label,value,strong}) { return <div className={`calc-item ${strong?"strong":""}`}><b>{value}</b><small>{label}</small></div>}

function Assessment({ assessment, setAssessment, ampSegment, missingPercent, estimatedWeight, observedBmi, correctedBmi, needsWeight, onComplete }) {
  const update = (key, value) => setAssessment({...assessment, [key]: value});
  const updateAmp = (key, value) => setAssessment({...assessment, amputation:{...assessment.amputation,[key]:value}});
  const weightLoss3m = ((assessment.weight3m-assessment.observedWeight)/assessment.weight3m)*100;
  const completionItems = [
    assessment.observedWeight>0, assessment.heightCm>0, assessment.weight3m>0,
    assessment.intakePercent>=0, assessment.intakeDays>0,
    assessment.muscleMethod!=="notMeasured" && assessment.muscleReduced!==null,
    assessment.inflammation!==null
  ];
  const completion = Math.round(completionItems.filter(Boolean).length/completionItems.length*100);
  const missing = [];
  if(assessment.muscleMethod==="notMeasured" || assessment.muscleReduced===null) missing.push("Muskelmasse");
  if(assessment.inflammation===null) missing.push("Krankheitslast / Entzündung");

  return (
    <div className="phase-content">
      <PhaseHeader title="3. Ernährungsassessment" subtitle="Zentrale Datenerfassung: Diese Angaben werden anschließend automatisch in GLIM, Maßnahmen, Monitoring und Entlassung verwendet."/>
      <div className="assessment-progress"><div><b>Assessment {completion}% vollständig</b><span>{missing.length ? `Offen: ${missing.join(", ")}` : "Alle GLIM-relevanten Daten erhoben"}</span></div><div className="progress"><span style={{width:`${completion}%`}}/></div></div>

      <AssessmentSection title="Anthropometrie & Gewichtsverlauf">
        <div className="form-grid">
          <Field label="Aktuell gemessenes Gewicht (kg)"><input type="number" step="0.1" value={assessment.observedWeight} onChange={e=>update("observedWeight",Number(e.target.value))}/></Field>
          <Field label="Körpergröße (cm)"><input type="number" value={assessment.heightCm} onChange={e=>update("heightCm",Number(e.target.value))}/></Field>
          <Field label="Gewicht vor 1 Monat (kg)"><input type="number" step="0.1" value={assessment.weight1m} onChange={e=>update("weight1m",Number(e.target.value))}/></Field>
          <Field label="Gewicht vor 3 Monaten (kg)"><input type="number" step="0.1" value={assessment.weight3m} onChange={e=>update("weight3m",Number(e.target.value))}/></Field>
          <Field label="Gewicht vor 6 Monaten (kg)"><input type="number" step="0.1" value={assessment.weight6m} onChange={e=>update("weight6m",Number(e.target.value))}/></Field>
          <Field label="Berechneter Gewichtsverlust"><input readOnly value={`${weightLoss3m.toFixed(1)} % in 3 Monaten`}/></Field>
          <Field label="Ödeme"><select value={assessment.edema?"yes":"no"} onChange={e=>update("edema",e.target.value==="yes")}><option value="no">Nein</option><option value="yes">Ja – Gewichtsinterpretation eingeschränkt</option></select></Field>
          <Field label="Aszites"><select value={assessment.ascites?"yes":"no"} onChange={e=>update("ascites",e.target.value==="yes")}><option value="no">Nein</option><option value="yes">Ja – Gewichtsinterpretation eingeschränkt</option></select></Field>
        </div>
      </AssessmentSection>

      <AssessmentSection title="Nahrungsaufnahme & Symptome">
        <div className="form-grid">
          <Field label="Energieaufnahme (% des Bedarfs)"><input type="number" value={assessment.intakePercent} onChange={e=>update("intakePercent",Number(e.target.value))}/></Field>
          <Field label="Dauer der Reduktion (Tage)"><input type="number" value={assessment.intakeDays} onChange={e=>update("intakeDays",Number(e.target.value))}/></Field>
          <Field label="Proteinaufnahme (% des Ziels)"><input type="number" value={assessment.proteinPercent} onChange={e=>update("proteinPercent",Number(e.target.value))}/></Field>
          <Field label="Flüssigkeitsaufnahme (ml/Tag)"><input type="number" value={assessment.fluidMl} onChange={e=>update("fluidMl",Number(e.target.value))}/></Field>
          <Field label="Appetit"><select value={assessment.appetite} onChange={e=>update("appetite",e.target.value)}><option>normal</option><option>leicht vermindert</option><option>deutlich vermindert</option><option>kein Appetit</option></select></Field>
          <Field label="Schlucken"><select value={assessment.swallowing} onChange={e=>update("swallowing",e.target.value)}><option>unauffällig</option><option>nicht sicher beurteilt</option><option>auffällig – Abklärung erforderlich</option></select></Field>
        </div>
        <div className="symptom-row">
          {["nausea","vomiting","diarrhea","constipation"].map(k=><label key={k}><input type="checkbox" checked={assessment[k]} onChange={e=>update(k,e.target.checked)}/>{({nausea:"Übelkeit",vomiting:"Erbrechen",diarrhea:"Durchfall",constipation:"Obstipation"})[k]}</label>)}
        </div>
      </AssessmentSection>

      <AssessmentSection title="Muskelmasse, Funktion & Krankheitslast">
        <div className="form-grid">
          <Field label="Muskelmassen-Messmethode"><select value={assessment.muscleMethod} onChange={e=>{update("muscleMethod",e.target.value); if(e.target.value==="notMeasured") update("muscleReduced",null)}}><option value="notMeasured">Nicht erhoben</option><option value="bia">BIA</option><option value="dxa">DXA</option><option value="ct">CT-basierte Messung</option><option value="anthropometry">Validierte Anthropometrie</option></select></Field>
          <Field label="Muskelmasse reduziert?"><select value={assessment.muscleReduced===null?"unknown":assessment.muscleReduced?"yes":"no"} onChange={e=>update("muscleReduced",e.target.value==="unknown"?null:e.target.value==="yes")} disabled={assessment.muscleMethod==="notMeasured"}><option value="unknown">Nicht beurteilbar</option><option value="yes">Ja – Referenzwert unterschritten</option><option value="no">Nein</option></select></Field>
          <Field label="Mobilität"><select value={assessment.mobility} onChange={e=>update("mobility",e.target.value)}><option>uneingeschränkt</option><option>eingeschränkt</option><option>überwiegend bettlägerig</option></select></Field>
          <Field label="Handkraft (optional, funktionell)"><input value={assessment.handgrip} onChange={e=>update("handgrip",e.target.value)} placeholder="Messwert und Einheit"/></Field>
          <Field label="Krankheitslast / Entzündung"><select value={assessment.inflammation===null?"unknown":assessment.inflammation?"yes":"no"} onChange={e=>update("inflammation",e.target.value==="unknown"?null:e.target.value==="yes")}><option value="unknown">Noch nicht klinisch eingeordnet</option><option value="yes">Kriterium erfüllt</option><option value="no">Kriterium nicht erfüllt</option></select></Field>
          <Field label="Begründung / klinischer Kontext"><textarea value={assessment.inflammationNote} onChange={e=>update("inflammationNote",e.target.value)}/></Field>
        </div>
      </AssessmentSection>

      <div className="module">
        <div className="module-head"><div><Scale size={19}/><div><h3>Amputation / fehlende Körpersegmente</h3><p>Korrektur als transparente Schätzhilfe für BMI und Gewichtsinterpretation.</p></div></div><label className="switch"><input type="checkbox" checked={assessment.amputation.present} onChange={e=>updateAmp("present",e.target.checked)}/><span/></label></div>
        {assessment.amputation.present && <>
          <div className="form-grid">
            <Field label="Fehlendes Körpersegment"><select value={assessment.amputation.segment} onChange={e=>updateAmp("segment",e.target.value)}>{SEGMENTS.filter(s=>s.id!=="none").map(s=><option key={s.id} value={s.id}>{s.label} · {s.percent}%</option>)}</select></Field>
            <Field label="Seite / Anzahl"><select value={assessment.amputation.bilateral?"bilateral":"unilateral"} onChange={e=>updateAmp("bilateral",e.target.value==="bilateral")}><option value="unilateral">Einseitig</option><option value="bilateral">Beidseitig</option></select></Field>
          </div>
          <div className="amputation-results"><Metric label="Gemessenes Gewicht" value={`${assessment.observedWeight.toFixed(1)} kg`}/><Metric label="Fehlender Anteil" value={`${missingPercent.toFixed(1)} %`}/><Metric label="Geschätztes Vollgewicht" value={`${estimatedWeight.toFixed(1)} kg`}/><Metric label="Korrigierter BMI" value={`${correctedBmi.toFixed(1)} kg/m²`}/></div>
          <div className="formula"><Calculator size={17}/><div><b>Berechnung</b><code>WtE = {assessment.observedWeight.toFixed(1)} ÷ (1 − {(missingPercent/100).toFixed(3)}) = {estimatedWeight.toFixed(1)} kg</code><p>Schätzwert; klinische Beurteilung und alternative Körperzusammensetzungsdaten bleiben erforderlich.</p></div></div>
        </>}
      </div>

      <div className="module">
        <h3>Gewichtsbasis für Bedarfsberechnung</h3>
        <div className="choice-grid">
          <label className={assessment.amputation.needsWeightBasis==="observed"?"choice active":"choice"}><input type="radio" checked={assessment.amputation.needsWeightBasis==="observed"} onChange={()=>updateAmp("needsWeightBasis","observed")}/><b>Gemessenes Gewicht</b><span>{assessment.observedWeight.toFixed(1)} kg</span><small>Aktive Standardauswahl</small></label>
          <label className={assessment.amputation.needsWeightBasis==="corrected"?"choice active":"choice"}><input type="radio" checked={assessment.amputation.needsWeightBasis==="corrected"} onChange={()=>updateAmp("needsWeightBasis","corrected")}/><b>Korrigiertes Schätzgewicht</b><span>{estimatedWeight.toFixed(1)} kg</span><small>Nur mit fachlicher Begründung</small></label>
        </div>
        <div className="basis-result">Für den Maßnahmenentwurf verwendete Gewichtsbasis: <b>{needsWeight.toFixed(1)} kg</b></div>
      </div>
      <PhaseActions onComplete={onComplete}/>
    </div>
  );
}

function AssessmentSection({title,children}) { return <section className="assessment-section"><h3>{title}</h3>{children}</section> }

function GLIM({ assessment, correctedBmi, onComplete }) {
  const weightLoss3m=((assessment.weight3m-assessment.observedWeight)/assessment.weight3m)*100;
  const weightState=weightLoss3m>5?"yes":"no";
  const bmiState=correctedBmi<22?"yes":"no";
  const muscleState=assessment.muscleReduced===null?"unknown":assessment.muscleReduced?"yes":"no";
  const intakeMet=(assessment.intakePercent<50 && assessment.intakeDays>7) || (assessment.intakePercent<100 && assessment.intakeDays>14);
  const intakeState=intakeMet?"yes":"no";
  const inflammationState=assessment.inflammation===null?"unknown":assessment.inflammation?"yes":"no";
  const pheno=[weightState,bmiState,muscleState].filter(x=>x==="yes").length;
  const aetio=[intakeState,inflammationState].filter(x=>x==="yes").length;
  const diagnosis=pheno>=1&&aetio>=1;
  const severeWeight=weightLoss3m>10;
  const severeBmi=correctedBmi<20;
  const severeMuscle=assessment.muscleReduced===true && assessment.muscleMethod!=="notMeasured";
  const stage=diagnosis?(severeWeight||severeBmi||severeMuscle?"Stage 2 – schwer":"Stage 1 – moderat"):"Keine Einstufung";
  const open=[];
  if(muscleState==="unknown") open.push("Muskelmasse");
  if(inflammationState==="unknown") open.push("Krankheitslast / Entzündung");

  return (
    <div className="phase-content">
      <PhaseHeader title="4. GLIM – automatische Auswertung" subtitle="Keine erneute Dateneingabe: NutriPilot liest die zuvor erhobenen Assessmentdaten."/>
      <div className="glim-origin"><b>Datenquelle: Ernährungsassessment</b><span>Änderungen erfolgen im Assessment und werden hier unmittelbar neu berechnet.</span></div>
      <div className="glim-grid">
        <div className="module">
          <h3>Phänotypische Kriterien</h3>
          <AutoCriterion state={weightState} title="Unbeabsichtigter Gewichtsverlust" value={`${weightLoss3m.toFixed(1)} % in 3 Monaten`} source="Assessment · Gewichtsverlauf"/>
          <AutoCriterion state={bmiState} title="Niedriger BMI" value={`${correctedBmi.toFixed(1)} kg/m²; Grenzwert bei ≥70 Jahren <22`} source="Assessment · Anthropometrie / Amputationskorrektur"/>
          <AutoCriterion state={muscleState} title="Reduzierte Muskelmasse" value={muscleState==="unknown"?"Nicht erhoben":assessment.muscleReduced?"Referenzwert unterschritten":"Nicht reduziert"} source={`Assessment · ${assessment.muscleMethod}`}/>
        </div>
        <div className="module">
          <h3>Ätiologische Kriterien</h3>
          <AutoCriterion state={intakeState} title="Reduzierte Nahrungsaufnahme" value={`${assessment.intakePercent} % des Bedarfs seit ${assessment.intakeDays} Tagen`} source="Assessment · Nahrungsaufnahme"/>
          <AutoCriterion state={inflammationState} title="Krankheitslast / Entzündung" value={assessment.inflammation===null?"Noch nicht klinisch eingeordnet":assessment.inflammationNote} source="Assessment · klinische Einordnung"/>
        </div>
      </div>
      <div className={`result-panel ${diagnosis?"severe":""}`}><div><b>{diagnosis?"GLIM-Systematik erfüllt":"GLIM-Systematik noch nicht erfüllt"}</b><p>{diagnosis?`Mindestens 1 phänotypisches + 1 ätiologisches Kriterium. Automatisch abgeleiteter Schweregrad: ${stage}. Fachliche Bestätigung erforderlich.`:"Erforderliche Kriterien sind noch nicht vollständig erfüllt."}</p>{open.length>0&&<p><b>Offene Erhebung:</b> {open.join(", ")}</p>}</div><span>{stage}</span></div>
      <div className="glim-rule"><b>Warum?</b><code>Gewichtsverlust {weightLoss3m.toFixed(1)} % → {weightState==="yes"?"erfüllt":"nicht erfüllt"}</code><code>Aufnahme {assessment.intakePercent} % / {assessment.intakeDays} Tage → {intakeState==="yes"?"erfüllt":"nicht erfüllt"}</code><span>GLIM bestätigt die Systematik; Diagnose und Ursache werden durch die Fachkraft bestätigt.</span></div>
      <PhaseActions onComplete={onComplete}/>
    </div>
  );
}
function AutoCriterion({state,title,value,source}) { return <div className="auto-criterion"><span className={`criterion-state ${state}`}>{state==="yes"?"✓":state==="no"?"–":"?"}</span><div><b>{title}</b><strong>{value}</strong><small>{source}</small></div></div> }

function Plan({ needsWeight, assessment, onComplete }) {
  const energyLow = Math.round(needsWeight * 25);
  const energyHigh = Math.round(needsWeight * 30);
  return (
    <div className="phase-content">
      <PhaseHeader title="5. Maßnahmenplan" subtitle="Ziele, Interventionen, Verantwortung und Evaluation dokumentieren."/>
      <div className="amputation-results">
        <Metric label="Gewichtsbasis" value={`${needsWeight.toFixed(1)} kg`}/>
        <Metric label="Demo-Energiekorridor" value={`${energyLow}–${energyHigh} kcal`}/>
        <Metric label="Evaluation" value="in 48 h"/>
        <Metric label="Status" value="Aus Assessment erzeugt"/>
      </div>
      <div className="module">
        <Criterion state="yes" title="Energieanreicherung" note="Ziel ≥75 % Bedarfsdeckung"/>
        <Criterion state="yes" title="Trinknahrung 2× täglich" note="Verträglichkeit überwachen"/>
        <Criterion state="yes" title="Mahlzeitenprotokoll" note={`Ausgangslage: ${assessment.intakePercent} % Bedarfsdeckung seit ${assessment.intakeDays} Tagen`}/>
        <Criterion state="unknown" title="Refeeding-Sicherheitscheck" note="Ärztliche Prüfung offen"/>
      </div>
      <PhaseActions onComplete={onComplete}/>
    </div>
  );
}

function Monitoring({ compact = false, onComplete }) {
  return (
    <div className="phase-content">
      {!compact && <PhaseHeader title="Monitoring" subtitle="Gewicht und Bedarfsdeckung mit getrennten Skalen und sichtbarer Legende."/>}
      <div className="metrics">
        <Metric label="Aktuelles Gewicht" value="58,0 kg"/>
        <Metric label="Energieabdeckung" value="62 %"/>
        <Metric label="Proteinabdeckung" value="58 %"/>
        <Metric label="Unter Zielbereich" value="3 Tage" danger/>
      </div>
      <div className="module">
        <div className="chart-title"><h3>Gewicht und Energiebedarfsdeckung</h3><small>Linke Skala kg · rechte Skala %</small></div>
        <div className="legend">
          <span><i className="blue"/>Gewicht (kg)</span>
          <span><i className="green"/>Energiebedarfsdeckung (%)</span>
          <span><i className="dashed"/>Therapieziel 75 %</span>
        </div>
        <svg className="chart" viewBox="0 0 700 250">
          <line x1="60" y1="205" x2="640" y2="205" className="gridline"/>
          <line x1="60" y1="30" x2="60" y2="205" className="gridline"/>
          <line x1="640" y1="30" x2="640" y2="205" className="gridline"/>
          <line x1="60" y1="74" x2="640" y2="74" className="target"/>
          <text x="14" y="36">66 kg</text><text x="14" y="120">62 kg</text><text x="14" y="207">58 kg</text>
          <text x="650" y="36">100 %</text><text x="650" y="78">75 %</text><text x="650" y="207">0 %</text>
          <polyline points="65,38 145,52 225,68 305,94 385,115 465,139 545,160 635,185" className="weight-line"/>
          <polyline points="65,164 145,157 225,171 305,158 385,142 465,130 545,113 635,99" className="energy-line"/>
          <text x="60" y="232">03.08.</text><text x="245" y="232">05.08.</text><text x="425" y="232">07.08.</text><text x="585" y="232">09.08.</text>
        </svg>
      </div>
      {onComplete && <PhaseActions onComplete={onComplete}/>}
    </div>
  );
}

function Discharge({ assessment, correctedBmi, onComplete }) {
  return (
    <div className="phase-content">
      <PhaseHeader title="7. Entlassung & Übergabe" subtitle="Status, Maßnahmen, Gewichtsbasis und Nachsorge transparent übergeben."/>
      <div className="form-grid">
        <Field label="Status bei Entlassung"><select><option>Verbessert, weiterer Bedarf</option></select></Field>
        <Field label="Nachsorge"><select><option>Ambulante Ernährungstherapie</option></select></Field>
        <Field label="Fortzuführende Maßnahmen"><textarea defaultValue="Trinknahrung, energieangereicherte Kost, Gewichtskontrolle."/></Field>
        <Field label="Automatisch übernommener Ernährungsstatus"><textarea readOnly value={`Aufnahme ${assessment.intakePercent} % des Bedarfs seit ${assessment.intakeDays} Tagen; korrigierter BMI ${correctedBmi.toFixed(1)} kg/m²; laufende Maßnahmen und Verlauf siehe Bericht.`}/></Field>
      </div>
      <PhaseActions onComplete={onComplete}/>
    </div>
  );
}

function Quality() {
  return <div className="card standalone"><PhaseHeader title="Qualitätsdashboard" subtitle="Demo-Kennzahlen für Screening, Assessment und Dokumentation."/><div className="metrics"><Metric label="Screeningquote" value="94 %"/><Metric label="Assessment <24 h" value="87 %"/><Metric label="Dokumentation vollständig" value="97 %"/><Metric label="Offene Fälle" value="7" danger/></div></div>;
}

function Knowledge() {
  return (
    <div className="card standalone">
      <PhaseHeader title="Leitlinien, Regeln & methodische Grenzen" subtitle="Quellen werden versioniert und für jede Berechnung sichtbar gemacht."/>
      <div className="knowledge">
        <article><b>Amputationskorrigiertes Schätzgewicht</b><p>Formel WtE = Wto/(1−P). Segmentwerte sind konfigurierbare klinische Orientierungswerte. Das Ergebnis ist eine Schätzung, kein direkt gemessener Wert.</p></article>
        <article><b>BMI bei Amputation</b><p>Academy of Nutrition and Dietetics: Derzeit existiert kein validiertes allgemeines BMI-Instrument für Menschen mit Amputation; klinisches Urteil ist erforderlich.</p></article>
        <article><b>Bedarfsberechnung</b><p>Gemessenes und korrigiertes Gewicht werden getrennt angeboten. Die Fachkraft dokumentiert, welche Gewichtsbasis für Energie und Protein verwendet wird.</p></article>
      </div>
    </div>
  );
}

function PhaseHeader({ title, subtitle }) {
  return <div className="phase-header"><div><h2>{title}</h2><p>{subtitle}</p></div><span className="status">Demo</span></div>;
}
function Field({ label, children }) { return <label className="field"><span>{label}</span>{children}</label>; }
function Metric({ label, value, danger }) { return <div className={`metric ${danger ? "danger" : ""}`}><b>{value}</b><span>{label}</span></div>; }
function PhaseActions({ onComplete }) { return <div className="phase-actions"><button className="secondary"><FileText size={16}/> Entwurf speichern</button><button className="primary" onClick={onComplete}>Phase abschließen <ChevronRight size={16}/></button></div>; }
function Criterion({ state, title, note }) {
  return <div className="criterion"><span className={`criterion-state ${state}`}>{state === "yes" ? "✓" : state === "no" ? "–" : "?"}</span><div><b>{title}</b><small>{note}</small></div></div>;
}

createRoot(document.getElementById("root")).render(<App/>);
