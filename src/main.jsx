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
  const [phase, setPhase] = useState("assessment");
  const [done, setDone] = useState(["admission", "screening"]);
  const [toast, setToast] = useState("");
  const [amputation, setAmputation] = useState({
    present: true,
    segment: "belowKnee",
    bilateral: false,
    observedWeight: 58,
    heightCm: 162,
    needsWeightBasis: "observed"
  });

  const selected = SEGMENTS.find(s => s.id === amputation.segment) || SEGMENTS[0];
  const missingPercent = amputation.present
    ? selected.percent * (amputation.bilateral ? 2 : 1)
    : 0;
  const estimatedWeight = missingPercent < 100
    ? amputation.observedWeight / (1 - missingPercent / 100)
    : amputation.observedWeight;
  const observedBmi = amputation.observedWeight / Math.pow(amputation.heightCm / 100, 2);
  const correctedBmi = estimatedWeight / Math.pow(amputation.heightCm / 100, 2);
  const needsWeight = amputation.needsWeightBasis === "corrected" ? estimatedWeight : amputation.observedWeight;

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
            <div className="source-tag">GLIM · NRS-2002 · Segmentkorrektur</div>
          </div>

          {page === "journey" && (
            <Journey
              phase={phase}
              setPhase={setPhase}
              done={done}
              completePhase={completePhase}
              amputation={amputation}
              setAmputation={setAmputation}
              selected={selected}
              missingPercent={missingPercent}
              estimatedWeight={estimatedWeight}
              observedBmi={observedBmi}
              correctedBmi={correctedBmi}
              needsWeight={needsWeight}
              setPage={setPage}
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
    phase, setPhase, done, completePhase, amputation, setAmputation,
    selected, missingPercent, estimatedWeight, observedBmi, correctedBmi,
    needsWeight, setPage
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
              <button
                key={id}
                className={`phase-button ${phase === id ? "active" : ""} ${done.includes(id) ? "done" : ""}`}
                onClick={() => setPhase(id)}
              >
                <span>{done.includes(id) ? <Check size={14}/> : index + 1}</span>
                <div><b>{label}</b><small>{phase === id ? "In Bearbeitung" : done.includes(id) ? "Abgeschlossen" : "Offen"}</small></div>
              </button>
            ))}
          </div>
        </aside>

        <section className="card workspace">
          {phase === "admission" && <SimplePhase title="1. Aufnahme" subtitle="Basisdaten und erste Ernährungshinweise erfassen." onComplete={() => completePhase("admission")} />}
          {phase === "screening" && <Screening onComplete={() => completePhase("screening")} />}
          {phase === "assessment" && (
            <Assessment
              amputation={amputation}
              setAmputation={setAmputation}
              selected={selected}
              missingPercent={missingPercent}
              estimatedWeight={estimatedWeight}
              observedBmi={observedBmi}
              correctedBmi={correctedBmi}
              needsWeight={needsWeight}
              onComplete={() => completePhase("assessment")}
            />
          )}
          {phase === "glim" && <GLIM correctedBmi={correctedBmi} onComplete={() => completePhase("glim")} />}
          {phase === "plan" && <Plan needsWeight={needsWeight} onComplete={() => completePhase("plan")} />}
          {phase === "monitor" && <Monitoring compact onComplete={() => completePhase("monitor")} />}
          {phase === "discharge" && <Discharge onComplete={() => completePhase("discharge")} />}
        </section>

        <aside className="card copilot">
          <div className="card-title"><HeartPulse size={17}/><h3>NutriPilot Begleitung</h3></div>
          <div className="insight">
            <b>Aktuelle Phase</b>
            <p>{PHASES.find(([id]) => id === phase)?.[1]}</p>
          </div>
          {phase === "assessment" && (
            <>
              <div className="insight warning">
                <b>Amputation berücksichtigt</b>
                <p>Für BMI und Gewichtsinterpretation wird zusätzlich ein amputationskorrigiertes Schätzgewicht angezeigt.</p>
              </div>
              <div className="insight">
                <b>Keine automatische Bedarfsentscheidung</b>
                <p>Das Gewicht für Energie und Protein wird von der Fachkraft separat ausgewählt und dokumentiert.</p>
              </div>
            </>
          )}
          <div className="insight">
            <b>Transparenz</b>
            <p>Berechnung, Segmentanteil und verwendete Gewichtsbasis bleiben sichtbar und nachvollziehbar.</p>
          </div>
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

function Screening({ onComplete }) {
  return (
    <div className="phase-content">
      <PhaseHeader title="2. NRS-2002 Screening" subtitle="Risikoscreening; ein positives Ergebnis ist noch keine Diagnose."/>
      <div className="form-grid">
        <Field label="BMI <20,5 kg/m²?"><select><option>Nein</option><option>Ja</option></select></Field>
        <Field label="Gewichtsverlust in 3 Monaten?"><select><option>Ja</option><option>Nein</option></select></Field>
        <Field label="Nahrungsaufnahme vermindert?"><select><option>Ja</option><option>Nein</option></select></Field>
        <Field label="Schwere Erkrankung / Intensiv?"><select><option>Nein</option><option>Ja</option></select></Field>
      </div>
      <div className="result-panel"><div><b>NRS-2002: 4 Punkte</b><p>Ernährungsrisiko vorhanden – vollständiges Assessment erforderlich.</p></div><span>Positiv</span></div>
      <PhaseActions onComplete={onComplete}/>
    </div>
  );
}

function Assessment({ amputation, setAmputation, selected, missingPercent, estimatedWeight, observedBmi, correctedBmi, needsWeight, onComplete }) {
  const update = (key, value) => setAmputation({...amputation, [key]: value});
  return (
    <div className="phase-content">
      <PhaseHeader title="3. Ernährungsassessment" subtitle="Gewichtsverlauf, Aufnahme, Körperzusammensetzung und besondere Einflussfaktoren erfassen."/>
      <div className="form-grid">
        <Field label="Aktuell gemessenes Gewicht (kg)">
          <input type="number" step="0.1" value={amputation.observedWeight} onChange={e => update("observedWeight", Number(e.target.value))}/>
        </Field>
        <Field label="Körpergröße (cm)">
          <input type="number" value={amputation.heightCm} onChange={e => update("heightCm", Number(e.target.value))}/>
        </Field>
        <Field label="Gewicht vor 3 Monaten"><input defaultValue="65,2 kg"/></Field>
        <Field label="Energieaufnahme"><input defaultValue="<50 % seit 8 Tagen"/></Field>
      </div>

      <div className="module">
        <div className="module-head">
          <div><Scale size={19}/><div><h3>Amputation / fehlende Körpersegmente</h3><p>Korrektur als Schätzhilfe für BMI und Gewichtsinterpretation.</p></div></div>
          <label className="switch"><input type="checkbox" checked={amputation.present} onChange={e => update("present", e.target.checked)}/><span/></label>
        </div>

        {amputation.present && (
          <>
            <div className="form-grid">
              <Field label="Fehlendes Körpersegment">
                <select value={amputation.segment} onChange={e => update("segment", e.target.value)}>
                  {SEGMENTS.filter(s => s.id !== "none").map(s => <option key={s.id} value={s.id}>{s.label} · {s.percent}%</option>)}
                </select>
              </Field>
              <Field label="Seite / Anzahl">
                <select value={amputation.bilateral ? "bilateral" : "unilateral"} onChange={e => update("bilateral", e.target.value === "bilateral")}>
                  <option value="unilateral">Einseitig</option>
                  <option value="bilateral">Beidseitig</option>
                </select>
              </Field>
            </div>

            <div className="amputation-results">
              <Metric label="Gemessenes Gewicht" value={`${amputation.observedWeight.toFixed(1)} kg`}/>
              <Metric label="Fehlender Anteil" value={`${missingPercent.toFixed(1)} %`}/>
              <Metric label="Geschätztes Vollgewicht" value={`${estimatedWeight.toFixed(1)} kg`}/>
              <Metric label="Korrigierter BMI" value={`${correctedBmi.toFixed(1)} kg/m²`}/>
            </div>

            <div className="formula">
              <Calculator size={17}/>
              <div>
                <b>Transparente Berechnung</b>
                <code>WtE = Wto ÷ (1 − P) = {amputation.observedWeight.toFixed(1)} ÷ (1 − {(missingPercent/100).toFixed(3)}) = {estimatedWeight.toFixed(1)} kg</code>
                <p>WtE = geschätztes Vollgewicht, Wto = beobachtetes Gewicht, P = Anteil des fehlenden Segments.</p>
              </div>
            </div>

            <div className="comparison">
              <div><small>Unkorrigierter BMI</small><b>{observedBmi.toFixed(1)} kg/m²</b></div>
              <ChevronRight/>
              <div><small>Amputationskorrigierter BMI</small><b>{correctedBmi.toFixed(1)} kg/m²</b></div>
            </div>

            <div className="caution">
              <AlertTriangle size={18}/>
              <div><b>Methodische Grenze</b><p>Die Segmentkorrektur ist eine klinische Schätzung; es gibt laut Academy derzeit kein allgemein validiertes BMI-Instrument für Menschen mit Amputation. Klinisches Urteil und alternative Körperzusammensetzungsdaten bleiben wichtig.</p></div>
            </div>
          </>
        )}
      </div>

      <div className="module">
        <div className="module-head"><div><Stethoscope size={19}/><div><h3>Gewichtsbasis für Bedarfsberechnung</h3><p>Bewusst getrennt vom BMI festlegen.</p></div></div></div>
        <div className="choice-grid">
          <label className={amputation.needsWeightBasis === "observed" ? "choice active" : "choice"}>
            <input type="radio" name="basis" checked={amputation.needsWeightBasis === "observed"} onChange={() => update("needsWeightBasis", "observed")}/>
            <b>Gemessenes Gewicht</b><span>{amputation.observedWeight.toFixed(1)} kg</span><small>Standardauswahl im Prototyp</small>
          </label>
          <label className={amputation.needsWeightBasis === "corrected" ? "choice active" : "choice"}>
            <input type="radio" name="basis" checked={amputation.needsWeightBasis === "corrected"} onChange={() => update("needsWeightBasis", "corrected")}/>
            <b>Korrigiertes Schätzgewicht</b><span>{estimatedWeight.toFixed(1)} kg</span><small>Nur nach fachlicher Begründung</small>
          </label>
        </div>
        <div className="basis-result">Aktiv verwendete Gewichtsbasis: <b>{needsWeight.toFixed(1)} kg</b></div>
      </div>

      <PhaseActions onComplete={onComplete}/>
    </div>
  );
}

function GLIM({ correctedBmi, onComplete }) {
  const bmiMet = correctedBmi < 22;
  return (
    <div className="phase-content">
      <PhaseHeader title="4. GLIM-Diagnostik" subtitle="Alle fünf Kriterien prüfen; Schweregrad ausschließlich aus phänotypischen Kriterien ableiten."/>
      <div className="glim-grid">
        <div className="module">
          <h3>Phänotypische Kriterien</h3>
          <Criterion state="yes" title="Gewichtsverlust" note="11 % innerhalb von 3 Monaten"/>
          <Criterion state={bmiMet ? "yes" : "no"} title="Niedriger BMI" note={`Amputationskorrigierter BMI ${correctedBmi.toFixed(1)} kg/m²; Grenzwert bei ≥70 Jahren <22`}/>
          <Criterion state="unknown" title="Reduzierte Muskelmasse" note="Nicht erhoben; Messmethode erforderlich"/>
        </div>
        <div className="module">
          <h3>Ätiologische Kriterien</h3>
          <Criterion state="yes" title="Reduzierte Aufnahme" note="<50 % des Bedarfs seit 8 Tagen"/>
          <Criterion state="unknown" title="Beeinträchtigte Assimilation" note="Nicht dokumentiert"/>
          <Criterion state="unknown" title="Krankheitslast / Entzündung" note="Klinisch beurteilen; CRP nur unterstützend"/>
        </div>
      </div>
      <div className="result-panel severe"><div><b>GLIM-Systematik erfüllt</b><p>Regelbasiert Stage 2 – schwere Mangelernährung aufgrund von 11 % Gewichtsverlust in drei Monaten; fachlich zu bestätigen.</p></div><span>Stage 2</span></div>
      <PhaseActions onComplete={onComplete}/>
    </div>
  );
}

function Plan({ needsWeight, onComplete }) {
  const energyLow = Math.round(needsWeight * 25);
  const energyHigh = Math.round(needsWeight * 30);
  return (
    <div className="phase-content">
      <PhaseHeader title="5. Maßnahmenplan" subtitle="Ziele, Interventionen, Verantwortung und Evaluation dokumentieren."/>
      <div className="amputation-results">
        <Metric label="Gewichtsbasis" value={`${needsWeight.toFixed(1)} kg`}/>
        <Metric label="Demo-Energiekorridor" value={`${energyLow}–${energyHigh} kcal`}/>
        <Metric label="Evaluation" value="in 48 h"/>
        <Metric label="Status" value="Entwurf"/>
      </div>
      <div className="module">
        <Criterion state="yes" title="Energieanreicherung" note="Ziel ≥75 % Bedarfsdeckung"/>
        <Criterion state="yes" title="Trinknahrung 2× täglich" note="Verträglichkeit überwachen"/>
        <Criterion state="yes" title="Mahlzeitenprotokoll" note="3 Tage vollständig"/>
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

function Discharge({ onComplete }) {
  return (
    <div className="phase-content">
      <PhaseHeader title="7. Entlassung & Übergabe" subtitle="Status, Maßnahmen, Gewichtsbasis und Nachsorge transparent übergeben."/>
      <div className="form-grid">
        <Field label="Status bei Entlassung"><select><option>Verbessert, weiterer Bedarf</option></select></Field>
        <Field label="Nachsorge"><select><option>Ambulante Ernährungstherapie</option></select></Field>
        <Field label="Fortzuführende Maßnahmen"><textarea defaultValue="Trinknahrung, energieangereicherte Kost, Gewichtskontrolle."/></Field>
        <Field label="Amputationshinweis"><textarea defaultValue="Unterschenkelamputation; BMI wurde zusätzlich mit Segmentkorrektur interpretiert."/></Field>
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
