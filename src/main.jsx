
import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  LayoutGrid, ClipboardList, Activity, FileText, BookOpen, BarChart3,
  Search, Bell, Plus, ChevronRight, ArrowLeft, Sparkles, AlertTriangle,
  Check, Clock3, Building2, UserRound, Stethoscope, Scale, Utensils,
  Dumbbell, ShieldCheck, HeartPulse, Home, Pill, ThermometerSun,
  Droplets, Waves, Brain, ScanLine, CircleDot, CalendarDays, Filter,
  MoreHorizontal, Download, Send, ListChecks, BadgeCheck
} from "lucide-react";
import "./styles.css";

const CONSULTS = [
  {id:"K-2026-001245",patient:"Maria Schmidt",initials:"MS",age:82,station:"3B Geriatrie",room:"12",status:"Neu",priority:97,scenario:"Geriatrie",nrs:4,reason:"Gewichtsverlust · Aufnahme <50 %",next:"Assessment ergänzen",tone:"red"},
  {id:"K-2026-001246",patient:"Hans Becker",initials:"HB",age:76,station:"2A Innere",room:"08",status:"Sicherheitscheck",priority:94,scenario:"Refeeding",nrs:5,reason:"Sehr geringe Aufnahme · Elektrolyte offen",next:"Refeeding prüfen",tone:"red"},
  {id:"K-2026-001238",patient:"Eva Koch",initials:"EK",age:69,station:"4C Onkologie",room:"21",status:"Assessment",priority:86,scenario:"Onkologie",nrs:4,reason:"Tumorerkrankung · Muskelstatus offen",next:"Muskelmasse erfassen",tone:"amber"},
  {id:"K-2026-001231",patient:"Ali Demir",initials:"AD",age:58,station:"5A Chirurgie",room:"14",status:"GLIM",priority:78,scenario:"Amputation",nrs:3,reason:"Unterschenkelamputation · BMI-Korrektur",next:"Diagnose bestätigen",tone:"violet"},
  {id:"K-2026-001219",patient:"Petra Lang",initials:"PL",age:74,station:"3B Geriatrie",room:"17",status:"Monitoring",priority:72,scenario:"Dysphagie",nrs:4,reason:"Kostform angepasst · Verträglichkeit prüfen",next:"Verlauf dokumentieren",tone:"blue"},
  {id:"K-2026-001211",patient:"Jürgen Wolf",initials:"JW",age:65,station:"6B Neurologie",room:"04",status:"Therapie",priority:70,scenario:"Dysphagie",nrs:4,reason:"Schlaganfall · Schluckstörung",next:"Maßnahmen abstimmen",tone:"blue"},
  {id:"K-2026-001203",patient:"Lena Müller",initials:"LM",age:71,station:"4C Onkologie",room:"09",status:"Entlassung",priority:64,scenario:"Homecare",nrs:3,reason:"Ambulante Weiterbetreuung vorbereiten",next:"Bericht freigeben",tone:"green"},
  {id:"K-2026-001198",patient:"Sabine Krämer",initials:"SK",age:55,station:"2A Innere",room:"19",status:"Dokumentation",priority:58,scenario:"Adipositas + Mangelernährung",nrs:3,reason:"Hoher BMI · signifikanter Gewichtsverlust",next:"Clinical Note prüfen",tone:"slate"}
];

const initialAssessment = {
  weight:58.0,height:162,weight1m:61.0,weight3m:65.2,weight6m:66.0,
  intakePercent:42,intakeDays:8,proteinPercent:45,fluidMl:1050,
  appetite:"deutlich vermindert",swallowing:"nicht sicher beurteilt",
  nausea:false,vomiting:false,diarrhea:false,constipation:true,
  muscleMethod:"notMeasured",muscleReduced:null,inflammation:null,
  inflammationNote:"Akute Erkrankung; klinische Einordnung noch offen.",
  mobility:"eingeschränkt",living:"allein mit ambulanter Unterstützung",
  edema:false,ascites:false,refeeding:"open",
  amputation:{present:true,segmentPercent:5.9,label:"Unterschenkel inkl. Fuß",basis:"observed"}
};

const SECTIONS = [
  {id:"anthro",label:"Anthropometrie",icon:Scale},
  {id:"intake",label:"Aufnahme",icon:Utensils},
  {id:"muscle",label:"Muskelstatus",icon:Dumbbell},
  {id:"clinical",label:"Klinischer Kontext",icon:Stethoscope},
  {id:"refeeding",label:"Refeeding",icon:ShieldCheck},
  {id:"social",label:"Funktion & Sozial",icon:Home}
];

function App(){
  const [page,setPage]=useState("cockpit");
  const [selected,setSelected]=useState(CONSULTS[0]);
  const [workspaceTab,setWorkspaceTab]=useState("overview");
  const [assessment,setAssessment]=useState(initialAssessment);
  const [toast,setToast]=useState("");
  const [filter,setFilter]=useState("Alle");

  const notify=(m)=>{setToast(m);setTimeout(()=>setToast(""),1800)};
  const openConsult=(c)=>{setSelected(c);setWorkspaceTab("overview");setPage("workspace")};

  return <div className="app">
    <Sidebar page={page} setPage={setPage}/>
    <div className="shell">
      <Topbar page={page}/>
      <main>
        {page==="cockpit" && <Cockpit consults={CONSULTS} filter={filter} setFilter={setFilter} openConsult={openConsult}/>}
        {page==="workspace" && <Workspace consult={selected} tab={workspaceTab} setTab={setWorkspaceTab} assessment={assessment} setAssessment={setAssessment} back={()=>setPage("cockpit")} notify={notify}/>}
        {page==="today" && <TodayView consults={CONSULTS} openConsult={openConsult}/>}
        {page==="documents" && <Documents/>}
        {page==="quality" && <Quality/>}
        {page==="knowledge" && <Knowledge/>}
      </main>
    </div>
    {toast && <div className="toast">{toast}</div>}
  </div>
}

function Sidebar({page,setPage}){
  const nav=(id,icon,label)=><button className={`nav-item ${page===id?"active":""}`} onClick={()=>setPage(id)}>{icon}<span>{label}</span></button>;
  return <aside className="sidebar">
    <div className="brand"><div className="logo">N</div><div><b>NutriPilot</b><small>Clinical Nutrition</small></div></div>
    {nav("cockpit",<LayoutGrid size={19}/>,"Konsile")}
    {nav("today",<CalendarDays size={19}/>,"Heute")}
    {nav("documents",<FileText size={19}/>,"Dokumentation")}
    <div className="nav-title">Qualität</div>
    {nav("quality",<BarChart3 size={19}/>,"Versorgungsqualität")}
    {nav("knowledge",<BookOpen size={19}/>,"Leitlinien")}
    <div className="profile"><div className="avatar">LB</div><div><b>Laura Becker</b><small>Ernährungsfachkraft</small></div></div>
  </aside>
}

function Topbar({page}){
  const title={cockpit:"Konsil-Cockpit",workspace:"Konsil-Workspace",today:"Mein Tag",documents:"Dokumentation",quality:"Versorgungsqualität",knowledge:"Leitlinien & Regeln"}[page];
  return <header className="topbar">
    <div><h1>{title}</h1><p>Mehr Zeit für Patienten. Mehr Sicherheit im Ablauf.</p></div>
    <div className="top-actions">
      <div className="search"><Search size={16}/><span>Konsil, Patient oder Station</span></div>
      <button className="icon-button"><Bell size={18}/></button>
      <button className="primary"><Plus size={17}/> Konsil</button>
    </div>
  </header>
}

function Cockpit({consults,filter,setFilter,openConsult}){
  const filtered=filter==="Alle"?consults:consults.filter(c=>c.status===filter);
  const critical=consults.filter(c=>c.priority>=90).length;
  return <div className="cockpit">
    <section className="cockpit-main">
      <div className="hero">
        <div>
          <span className="eyebrow">Montag · 3. August</span>
          <h2>Guten Morgen, Laura.</h2>
          <p>NutriPilot bündelt neue Konsile, offene Assessments, Sicherheitsprüfungen und Verlaufskontrollen in einer Arbeitsliste.</p>
        </div>
        <div className="hero-focus">
          <Sparkles size={20}/>
          <small>Heute zuerst</small>
          <b>Maria Schmidt</b>
          <span>Neues Konsil · NRS 4 · 11 % Gewichtsverlust</span>
          <button onClick={()=>openConsult(consults[0])}>Konsil öffnen <ChevronRight size={15}/></button>
        </div>
      </div>

      <div className="stats-row">
        <Stat value={consults.length} label="aktive Konsile" icon={<ClipboardList/>}/>
        <Stat value={critical} label="hohe Priorität" icon={<AlertTriangle/>}/>
        <Stat value={2} label="Monitoring heute" icon={<Activity/>}/>
        <Stat value={1} label="Entlassung offen" icon={<FileText/>}/>
      </div>

      <div className="board card">
        <div className="board-head">
          <div><h3>Arbeitsliste</h3><p>Nach fachlichem Handlungsbedarf sortiert</p></div>
          <div className="filters">
            {["Alle","Neu","Assessment","GLIM","Monitoring","Entlassung"].map(f=><button key={f} className={filter===f?"active":""} onClick={()=>setFilter(f)}>{f}</button>)}
          </div>
        </div>
        <div className="consult-grid">
          {filtered.map(c=><ConsultCard key={c.id} consult={c} onClick={()=>openConsult(c)}/>)}
        </div>
      </div>
    </section>

    <aside className="right-rail">
      <div className="card rail-card">
        <div className="rail-title"><Sparkles size={18}/><div><b>NutriPilot Prioritäten</b><small>fachlich begründet</small></div></div>
        <PriorityItem tone="red" title="Maria Schmidt übernehmen" text="Neue Anforderung mit hohem Risiko."/>
        <PriorityItem tone="red" title="Hans Becker absichern" text="Refeeding-Sicherheitsprüfung offen."/>
        <PriorityItem tone="blue" title="Petra Lang evaluieren" text="Verträglichkeit heute dokumentieren."/>
      </div>
      <div className="card rail-card">
        <div className="rail-title"><Clock3 size={18}/><div><b>Heute geplant</b><small>7:30–16:00</small></div></div>
        <TimelineMini time="08:00" text="Konsilrunde Geriatrie"/>
        <TimelineMini time="10:30" text="Onkologie Assessment"/>
        <TimelineMini time="13:00" text="Verlaufskontrollen"/>
        <TimelineMini time="15:00" text="Entlassungsberichte"/>
      </div>
    </aside>
  </div>
}

function ConsultCard({consult,onClick}){
  return <button className={`consult-card tone-${consult.tone}`} onClick={onClick}>
    <div className="consult-top">
      <div className="consult-avatar">{consult.initials}</div>
      <span className="priority-score">{consult.priority}</span>
    </div>
    <span className="scenario">{consult.scenario}</span>
    <h3>{consult.patient}, {consult.age}</h3>
    <p className="station"><Building2 size={13}/>{consult.station} · Zimmer {consult.room}</p>
    <p className="reason">{consult.reason}</p>
    <div className="consult-bottom"><span className="status-pill">{consult.status}</span><span>{consult.next}<ChevronRight size={14}/></span></div>
  </button>
}

function Workspace({consult,tab,setTab,assessment,setAssessment,back,notify}){
  return <div>
    <button className="back" onClick={back}><ArrowLeft size={16}/> Zurück zum Cockpit</button>
    <div className="patient-bar">
      <div className="consult-avatar large">{consult.initials}</div>
      <div>
        <span className="eyebrow">{consult.id} · {consult.scenario}</span>
        <h2>{consult.patient}, {consult.age} Jahre</h2>
        <p>{consult.station} · Zimmer {consult.room} · NRS {consult.nrs}</p>
      </div>
      <div className="patient-actions"><span className="status-pill">{consult.status}</span><button className="secondary"><MoreHorizontal size={17}/></button></div>
    </div>

    <div className="workspace-tabs">
      {[
        ["overview","Konsil"],
        ["assessment","Assessment"],
        ["glim","Diagnostik"],
        ["plan","Therapie"],
        ["monitor","Verlauf"],
        ["documentation","Dokumentation"]
      ].map(([id,label])=><button key={id} className={tab===id?"active":""} onClick={()=>setTab(id)}>{label}</button>)}
    </div>

    <div className="workspace-grid">
      <section className="workspace-center">
        {tab==="overview" && <ConsultOverview consult={consult} assessment={assessment} setTab={setTab}/>}
        {tab==="assessment" && <AssessmentWorkspace assessment={assessment} setAssessment={setAssessment} setTab={setTab}/>}
        {tab==="glim" && <GlIMDashboard assessment={assessment} notify={notify}/>}
        {tab==="plan" && <TherapyPlanner assessment={assessment} notify={notify}/>}
        {tab==="monitor" && <ClinicalTimeline/>}
        {tab==="documentation" && <Documentation consult={consult} assessment={assessment} notify={notify}/>}
      </section>
      <aside className="workspace-rail">
        <CopilotPanel tab={tab} assessment={assessment}/>
      </aside>
    </div>
  </div>
}

function ConsultOverview({consult,assessment,setTab}){
  const existing=["NRS-2002 Score 4","Gewicht 58,0 kg","Größe 162 cm","Diagnosen","Medikation","Labor","Pflegebericht","Vitalwerte"];
  const missing=["Gewichtsverlauf bestätigen","Aufnahme quantifizieren","Muskelstatus erheben","Entzündung einordnen"];
  return <div className="overview-layout">
    <div className="card consult-summary">
      <div className="section-head"><div><span className="eyebrow">Konsilauftrag</span><h2>Ernährungsfachliche Einschätzung</h2></div><span className="status-pill">Neu</span></div>
      <div className="reason-banner"><AlertTriangle size={18}/><div><b>{consult.reason}</b><span>Pflege und ärztlicher Dienst bitten um Assessment, GLIM-Bewertung und Therapieempfehlung.</span></div></div>
      <div className="two-columns">
        <DataBox title="Bereits vorhanden" icon={<BadgeCheck/>} items={existing} tone="green"/>
        <DataBox title="Noch erforderlich" icon={<CircleDot/>} items={missing} tone="amber"/>
      </div>
      <div className="next-step">
        <div><b>29 von 38 Informationen liegen bereits vor.</b><span>Du ergänzt nur die ernährungsfachlich fehlenden Angaben.</span></div>
        <button className="primary" onClick={()=>setTab("assessment")}>Assessment fortsetzen <ChevronRight size={16}/></button>
      </div>
    </div>

    <div className="info-cards">
      <InfoCard icon={<Stethoscope/>} title="Hauptdiagnose" value="Akute Verschlechterung des Allgemeinzustands"/>
      <InfoCard icon={<Pill/>} title="Medikation" value="7 aktive Medikamente"/>
      <InfoCard icon={<ThermometerSun/>} title="Entzündung" value="klinische Einordnung offen"/>
      <InfoCard icon={<Home/>} title="Wohnsituation" value={assessment.living}/>
    </div>
  </div>
}

function AssessmentWorkspace({assessment,setAssessment,setTab}){
  const [section,setSection]=useState("anthro");
  const update=(k,v)=>setAssessment({...assessment,[k]:v});
  const weightLoss=((assessment.weight3m-assessment.weight)/assessment.weight3m)*100;
  const completion=71;

  return <div className="assessment-layout">
    <aside className="assessment-nav card">
      <div className="assessment-progress">
        <span>Assessment</span><b>{completion}%</b>
        <div className="progress"><i style={{width:`${completion}%`}}/></div>
        <small>2 GLIM-relevante Angaben offen</small>
      </div>
      {SECTIONS.map(s=>{
        const Icon=s.icon;
        const open=(s.id==="muscle"&&assessment.muscleMethod==="notMeasured")||(s.id==="clinical"&&assessment.inflammation===null)||(s.id==="refeeding"&&assessment.refeeding==="open");
        return <button key={s.id} className={section===s.id?"active":""} onClick={()=>setSection(s.id)}>
          <Icon size={17}/><span>{s.label}</span><small className={open?"open":"done"}>{open?"offen":"✓"}</small>
        </button>
      })}
    </aside>

    <section className="card assessment-panel">
      {section==="anthro" && <>
        <PanelHeader title="Anthropometrie & Gewichtsverlauf" source="Pflege + Ernährungsanamnese"/>
        <div className="form-grid">
          <ReadOnlyField label="Aktuelles Gewicht" value={`${assessment.weight.toFixed(1)} kg`} source="Pflege · heute 07:40"/>
          <ReadOnlyField label="Körpergröße" value={`${assessment.height} cm`} source="Stammdaten"/>
          <Field label="Gewicht vor 1 Monat (kg)"><input type="number" step="0.1" value={assessment.weight1m} onChange={e=>update("weight1m",Number(e.target.value))}/></Field>
          <Field label="Gewicht vor 3 Monaten (kg)"><input type="number" step="0.1" value={assessment.weight3m} onChange={e=>update("weight3m",Number(e.target.value))}/></Field>
          <Field label="Gewicht vor 6 Monaten (kg)"><input type="number" step="0.1" value={assessment.weight6m} onChange={e=>update("weight6m",Number(e.target.value))}/></Field>
          <ReadOnlyField label="Gewichtsverlust" value={`${weightLoss.toFixed(1)} % in 3 Monaten`} source="automatisch"/>
        </div>
        <div className="special-card">
          <div className="special-head"><Scale size={18}/><div><b>Amputation berücksichtigt</b><span>{assessment.amputation.label}</span></div></div>
          <div className="metric-row"><Metric label="Gemessen" value="58,0 kg"/><Metric label="Fehlender Anteil" value="5,9 %"/><Metric label="Schätzgewicht" value="61,6 kg"/><Metric label="Korrigierter BMI" value="23,5"/></div>
        </div>
      </>}

      {section==="intake" && <>
        <PanelHeader title="Nahrungsaufnahme" source="Pflegehinweis + fachliche Quantifizierung"/>
        <div className="form-grid">
          <Field label="Energieaufnahme (% Bedarf)"><input type="number" value={assessment.intakePercent} onChange={e=>update("intakePercent",Number(e.target.value))}/></Field>
          <Field label="Dauer (Tage)"><input type="number" value={assessment.intakeDays} onChange={e=>update("intakeDays",Number(e.target.value))}/></Field>
          <Field label="Proteinaufnahme (% Ziel)"><input type="number" value={assessment.proteinPercent} onChange={e=>update("proteinPercent",Number(e.target.value))}/></Field>
          <Field label="Flüssigkeit (ml/Tag)"><input type="number" value={assessment.fluidMl} onChange={e=>update("fluidMl",Number(e.target.value))}/></Field>
          <Field label="Appetit"><select value={assessment.appetite} onChange={e=>update("appetite",e.target.value)}><option>normal</option><option>leicht vermindert</option><option>deutlich vermindert</option><option>kein Appetit</option></select></Field>
          <Field label="Schlucken"><select value={assessment.swallowing} onChange={e=>update("swallowing",e.target.value)}><option>unauffällig</option><option>nicht sicher beurteilt</option><option>auffällig</option></select></Field>
        </div>
        <div className="intake-visual">
          <div><span>Dokumentierte Bedarfsdeckung</span><b>{assessment.intakePercent}%</b></div>
          <div className="bar"><i style={{width:`${assessment.intakePercent}%`}}/></div>
          <small>seit {assessment.intakeDays} Tagen unter dem Bedarf</small>
        </div>
      </>}

      {section==="muscle" && <>
        <PanelHeader title="Muskelstatus" source="ernährungsfachliche Erhebung"/>
        <div className="empty-state">
          <Dumbbell size={32}/>
          <h3>Muskelmasse noch nicht beurteilt</h3>
          <p>Für das GLIM-Kriterium ist eine dokumentierte Messmethode mit geeignetem Referenzwert erforderlich.</p>
        </div>
        <div className="form-grid">
          <Field label="Messmethode"><select value={assessment.muscleMethod} onChange={e=>update("muscleMethod",e.target.value)}><option value="notMeasured">Nicht erhoben</option><option value="bia">BIA</option><option value="dxa">DXA</option><option value="ct">CT-basiert</option><option value="anthropometry">Validierte Anthropometrie</option></select></Field>
          <Field label="Ergebnis"><select value={assessment.muscleReduced===null?"unknown":assessment.muscleReduced?"yes":"no"} disabled={assessment.muscleMethod==="notMeasured"} onChange={e=>update("muscleReduced",e.target.value==="unknown"?null:e.target.value==="yes")}><option value="unknown">Nicht beurteilbar</option><option value="yes">Reduziert</option><option value="no">Nicht reduziert</option></select></Field>
        </div>
      </>}

      {section==="clinical" && <>
        <PanelHeader title="Klinischer Kontext" source="Arztbrief, Labor, fachliche Einordnung"/>
        <div className="form-grid">
          <Field label="Krankheitslast / Entzündung"><select value={assessment.inflammation===null?"unknown":assessment.inflammation?"yes":"no"} onChange={e=>update("inflammation",e.target.value==="unknown"?null:e.target.value==="yes")}><option value="unknown">Noch offen</option><option value="yes">Kriterium erfüllt</option><option value="no">Nicht erfüllt</option></select></Field>
          <Field label="Klinische Begründung"><textarea value={assessment.inflammationNote} onChange={e=>update("inflammationNote",e.target.value)}/></Field>
        </div>
        <div className="warning-box"><AlertTriangle size={17}/><div><b>CRP nicht isoliert bewerten</b><span>Laborwerte unterstützen die klinische Einordnung, ersetzen sie aber nicht.</span></div></div>
      </>}

      {section==="refeeding" && <>
        <PanelHeader title="Refeeding-Sicherheitscheck" source="separater Sicherheitsworkflow"/>
        <div className="safety-grid">
          <SafetyItem label="Sehr geringe Aufnahme" state="yes"/>
          <SafetyItem label="Relevanter Gewichtsverlust" state="yes"/>
          <SafetyItem label="Elektrolyte geprüft" state="open"/>
          <SafetyItem label="Thiamin berücksichtigt" state="open"/>
        </div>
        <div className="warning-box strong"><ShieldCheck size={18}/><div><b>Ärztliche Mitprüfung erforderlich</b><span>NutriPilot dokumentiert den Sicherheitsstatus, trifft aber keine autonome Refeeding-Entscheidung.</span></div></div>
      </>}

      {section==="social" && <>
        <PanelHeader title="Funktion & Sozial" source="Pflege + Patientengespräch"/>
        <div className="form-grid">
          <Field label="Mobilität"><select value={assessment.mobility} onChange={e=>update("mobility",e.target.value)}><option>uneingeschränkt</option><option>eingeschränkt</option><option>überwiegend bettlägerig</option></select></Field>
          <Field label="Wohnsituation"><input value={assessment.living} onChange={e=>update("living",e.target.value)}/></Field>
        </div>
      </>}

      <div className="panel-actions"><button className="secondary">Zwischenspeichern</button><button className="primary" onClick={()=>setTab("glim")}>Zur diagnostischen Bewertung <ChevronRight size={16}/></button></div>
    </section>
  </div>
}

function GlIMDashboard({assessment,notify}){
  const heightM=assessment.height/100;
  const correctedWeight=assessment.weight/(1-0.059);
  const bmi=correctedWeight/(heightM*heightM);
  const loss=((assessment.weight3m-assessment.weight)/assessment.weight3m)*100;
  const pheno=[
    {label:"Gewichtsverlust",state:"yes",value:`${loss.toFixed(1)} % in 3 Monaten`,source:"Assessment · Anthropometrie"},
    {label:"Niedriger BMI",state:bmi<22?"yes":"no",value:`${bmi.toFixed(1)} kg/m²`,source:"Assessment · korrigierter BMI"},
    {label:"Muskelmasse",state:assessment.muscleReduced===null?"open":assessment.muscleReduced?"yes":"no",value:assessment.muscleReduced===null?"nicht erhoben":assessment.muscleReduced?"reduziert":"nicht reduziert",source:"Assessment · Muskelstatus"}
  ];
  const aetio=[
    {label:"Reduzierte Aufnahme",state:(assessment.intakePercent<50&&assessment.intakeDays>7)?"yes":"no",value:`${assessment.intakePercent} % seit ${assessment.intakeDays} Tagen`,source:"Assessment · Aufnahme"},
    {label:"Krankheitslast / Entzündung",state:assessment.inflammation===null?"open":assessment.inflammation?"yes":"no",value:assessment.inflammation===null?"offen":assessment.inflammationNote,source:"Assessment · klinischer Kontext"}
  ];
  return <div className="diagnostic">
    <div className="diagnostic-head">
      <div><span className="eyebrow">Automatische Auswertung</span><h2>GLIM Diagnoseübersicht</h2><p>Keine erneute Eingabe. Alle Kriterien stammen aus dem Assessment.</p></div>
      <div className="stage-card"><small>Vorläufiger Schweregrad</small><b>Stage 2</b><span>schwere Mangelernährung</span></div>
    </div>
    <div className="criteria-columns">
      <CriteriaGroup title="Phänotypisch" items={pheno}/>
      <CriteriaGroup title="Ätiologisch" items={aetio}/>
    </div>
    <div className="diagnosis-result">
      <div><BadgeCheck size={24}/><div><b>GLIM-Systematik erfüllt</b><span>Mindestens ein phänotypisches und ein ätiologisches Kriterium sind erfüllt.</span></div></div>
      <button className="primary" onClick={()=>notify("Diagnose fachlich bestätigt")}>Fachlich bestätigen</button>
    </div>
    <div className="explain-card">
      <h3>Warum Stage 2?</h3>
      <div><span>Gewichtsverlust</span><code>{loss.toFixed(1)} % in 3 Monaten</code><b>schwere Ausprägung</b></div>
      <div><span>BMI</span><code>{bmi.toFixed(1)} kg/m²</code><b>nicht erfüllt</b></div>
      <div><span>Aufnahme</span><code>{assessment.intakePercent} % / {assessment.intakeDays} Tage</code><b>erfüllt</b></div>
    </div>
  </div>
}

function TherapyPlanner({assessment,notify}){
  const proposals=[
    {title:"Energieanreicherung",detail:"Ziel: mindestens 75 % Bedarfsdeckung",owner:"Pflege / Küche",priority:"hoch"},
    {title:"Trinknahrung 2× täglich",detail:"Verträglichkeit und tatsächliche Aufnahme dokumentieren",owner:"Pflege",priority:"hoch"},
    {title:"Mahlzeitenprotokoll",detail:"3 Tage strukturiert erfassen",owner:"Station 3B",priority:"mittel"},
    {title:"Refeeding-Sicherheitscheck",detail:"Elektrolyte und Thiamin ärztlich prüfen",owner:"Ärztlicher Dienst",priority:"sicherheit"},
    {title:"Evaluation in 48 Stunden",detail:"Gewicht, Aufnahme und Verträglichkeit",owner:"Ernährungsfachkraft",priority:"mittel"}
  ];
  return <div className="therapy">
    <div className="therapy-head"><div><span className="eyebrow">Aus Assessment erzeugt</span><h2>Therapieplanung</h2><p>NutriPilot schlägt Maßnahmen vor. Laura prüft, ändert und bestätigt.</p></div><div className="therapy-target"><small>Aktuelle Aufnahme</small><b>{assessment.intakePercent}%</b><span>Ziel ≥75 %</span></div></div>
    <div className="therapy-list">{proposals.map((p,i)=><label key={p.title} className={`therapy-item priority-${p.priority}`}><input type="checkbox" defaultChecked/><span>{i+1}</span><div><b>{p.title}</b><p>{p.detail}</p></div><small>{p.owner}</small></label>)}</div>
    <div className="therapy-footer"><button className="secondary">Maßnahme ergänzen</button><button className="primary" onClick={()=>notify("Therapieplan bestätigt")}>Therapieplan bestätigen</button></div>
  </div>
}

function ClinicalTimeline(){
  const events=[
    {date:"03.08.",time:"09:12",type:"Konsil",title:"Konsil angefordert",text:"NRS 4, Gewichtsverlust und geringe Aufnahme"},
    {date:"03.08.",time:"10:05",type:"Assessment",title:"Assessment ergänzt",text:"Aufnahme 42 %, Gewichtsverlust 11 %"},
    {date:"03.08.",time:"10:18",type:"GLIM",title:"Stage 2 bestätigt",text:"schwere Mangelernährung"},
    {date:"03.08.",time:"11:00",type:"Therapie",title:"Trinknahrung gestartet",text:"2× täglich, energieangereicherte Kost"},
    {date:"05.08.",time:"09:15",type:"Monitoring",title:"Aufnahme verbessert",text:"62 % Bedarfsdeckung, Gewicht weiter rückläufig"}
  ];
  return <div className="timeline-page">
    <div className="section-head"><div><span className="eyebrow">Clinical Timeline</span><h2>Verlauf & Therapieereignisse</h2></div><button className="secondary"><Plus size={16}/> Verlaufseintrag</button></div>
    <div className="metric-row"><Metric label="Gewicht" value="58,0 kg"/><Metric label="Energie" value="62 %"/><Metric label="Protein" value="58 %"/><Metric label="Verträglichkeit" value="gut"/></div>
    <div className="chart-card">
      <div className="chart-head"><div><h3>Gewicht und Energiebedarfsdeckung</h3><span>linke Skala kg · rechte Skala %</span></div></div>
      <div className="legend"><span><i className="blue"/>Gewicht (kg)</span><span><i className="green"/>Energie (%)</span><span><i className="dashed"/>Ziel 75 %</span></div>
      <svg viewBox="0 0 720 260">
        <line x1="60" y1="205" x2="650" y2="205" className="gridline"/><line x1="60" y1="30" x2="60" y2="205" className="gridline"/><line x1="650" y1="30" x2="650" y2="205" className="gridline"/><line x1="60" y1="75" x2="650" y2="75" className="target"/>
        <text x="14" y="36">66 kg</text><text x="14" y="120">62 kg</text><text x="14" y="207">58 kg</text>
        <text x="660" y="36">100 %</text><text x="660" y="79">75 %</text><text x="660" y="207">0 %</text>
        <polyline points="65,38 150,55 235,76 320,101 405,124 490,148 575,168 645,185" className="weight-line"/>
        <polyline points="65,165 150,158 235,171 320,156 405,140 490,126 575,108 645,94" className="energy-line"/>
        <line x1="405" y1="30" x2="405" y2="205" className="event-line"/><circle cx="405" cy="140" r="6" className="event-dot"/><text x="345" y="22">Trinknahrung begonnen</text>
      </svg>
      <div className="analysis-strip"><Sparkles size={17}/><div><b>Verlaufshinweis</b><span>Die Bedarfsdeckung steigt, bleibt jedoch unter Ziel. Gewicht ist weiterhin rückläufig. Evaluation innerhalb von 48 Stunden empfohlen.</span></div></div>
    </div>
    <div className="event-list">{events.map(e=><div className="event" key={e.title}><div className="event-date"><b>{e.date}</b><span>{e.time}</span></div><div className="event-dot-wrap"><i/></div><div><small>{e.type}</small><b>{e.title}</b><p>{e.text}</p></div></div>)}</div>
  </div>
}

function Documentation({consult,assessment,notify}){
  return <div className="documentation">
    <div className="section-head"><div><span className="eyebrow">Automatisch vorbereitet</span><h2>Clinical Note</h2><p>Aus Konsil, Assessment, Diagnose und Verlauf erzeugt.</p></div><div className="doc-actions"><button className="secondary"><Download size={16}/> PDF</button><button className="primary" onClick={()=>notify("Dokumentation freigegeben")}><Send size={16}/> Freigeben</button></div></div>
    <div className="doc-shell">
      <aside className="doc-nav"><button className="active">Konsilbericht</button><button>Verlaufsnotiz</button><button>Entlassungsbericht</button><button>Übergabe Homecare</button></aside>
      <article className="document">
        <div className="document-header"><div><b>NutriPilot Clinical Nutrition</b><span>Konsilbericht · Entwurf</span></div><span>{consult.id}</span></div>
        <h1>Ernährungsmedizinisches Konsil</h1>
        <p><b>Patient:</b> {consult.patient}, {consult.age} Jahre · {consult.station} · Zimmer {consult.room}</p>
        <h3>Anlass</h3><p>{consult.reason}. Das Konsil wurde nach positivem NRS-2002-Screening angefordert.</p>
        <h3>Assessment</h3><p>Aktuelles Gewicht 58,0 kg. Unbeabsichtigter Gewichtsverlust von 11 % innerhalb von drei Monaten. Energieaufnahme derzeit etwa {assessment.intakePercent} % des Bedarfs seit {assessment.intakeDays} Tagen. Muskelmasse noch nicht abschließend erhoben.</p>
        <h3>Diagnostische Einordnung</h3><p>Die GLIM-Systematik ist erfüllt. Vorläufige Einstufung: Stage 2 – schwere Mangelernährung aufgrund des ausgeprägten Gewichtsverlusts. Fachlich bestätigt.</p>
        <h3>Maßnahmen</h3><p>Energieangereicherte Kost, Trinknahrung zweimal täglich, Mahlzeitenprotokoll und Verlaufskontrolle innerhalb von 48 Stunden. Refeeding-Sicherheitscheck mit ärztlicher Mitprüfung.</p>
        <div className="doc-sign"><span>Laura Becker</span><small>Ernährungsfachkraft · digital freizugeben</small></div>
      </article>
    </div>
  </div>
}

function CopilotPanel({tab,assessment}){
  const content={
    overview:["Konsil übernehmen","29 Informationen liegen bereits vor. Vier Angaben müssen ergänzt werden."],
    assessment:["Assessment vervollständigen","Muskelstatus und Entzündung sind noch offen."],
    glim:["Diagnose prüfen","Gewichtsverlust und reduzierte Aufnahme erfüllen die GLIM-Systematik."],
    plan:["Maßnahmen abstimmen","Refeeding-Sicherheitscheck benötigt ärztliche Mitprüfung."],
    monitor:["Verlauf bewerten","Aufnahme verbessert sich, Gewicht bleibt rückläufig."],
    documentation:["Dokumentation freigeben","Der Konsilbericht wurde aus strukturierten Daten vorbereitet."]
  }[tab];
  return <div className="card copilot-panel">
    <div className="copilot-title"><Sparkles size={18}/><div><b>NutriPilot</b><span>kontextbezogene Begleitung</span></div></div>
    <div className="copilot-highlight"><small>Nächster sinnvoller Schritt</small><b>{content[0]}</b><p>{content[1]}</p></div>
    <div className="copilot-fact"><span>Aktuelle Aufnahme</span><b>{assessment.intakePercent}%</b></div>
    <div className="copilot-fact"><span>GLIM-relevante Lücken</span><b>2</b></div>
    <div className="copilot-note"><ShieldCheck size={16}/><span>NutriPilot unterstützt. Diagnose und Therapie bleiben fachliche Entscheidungen.</span></div>
  </div>
}

function TodayView({consults,openConsult}){
  return <div className="today-page">
    <div className="hero compact"><div><span className="eyebrow">Mein Tag</span><h2>7:30–16:00 Uhr</h2><p>Konsile, Verlaufskontrollen und Dokumentation in einer Tagesansicht.</p></div></div>
    <div className="today-columns">
      <div className="card"><h3>Vormittag</h3>{consults.slice(0,4).map(c=><button className="today-item" onClick={()=>openConsult(c)} key={c.id}><span>{c.priority}</span><div><b>{c.patient}</b><small>{c.next}</small></div><ChevronRight size={15}/></button>)}</div>
      <div className="card"><h3>Nachmittag</h3>{consults.slice(4).map(c=><button className="today-item" onClick={()=>openConsult(c)} key={c.id}><span>{c.priority}</span><div><b>{c.patient}</b><small>{c.next}</small></div><ChevronRight size={15}/></button>)}</div>
    </div>
  </div>
}

function Documents(){return <div className="card placeholder"><FileText size={34}/><h2>Dokumentationszentrale</h2><p>Konsilberichte, Verlaufsnotizen, Entlassungsberichte und Übergaben werden hier gebündelt.</p></div>}
function Quality(){return <div className="quality-page"><div className="section-head"><div><span className="eyebrow">Qualität</span><h2>Versorgungsqualität</h2></div></div><div className="stats-row"><Stat value="91%" label="Konsile <24 h"/><Stat value="87%" label="Assessment vollständig"/><Stat value="97%" label="GLIM nachvollziehbar"/><Stat value="94%" label="Berichte vollständig"/></div></div>}
function Knowledge(){return <div className="card placeholder"><BookOpen size={34}/><h2>Leitlinien & Regeln</h2><p>Versionierte Regeln, Quellen und methodische Grenzen werden hier nachvollziehbar hinterlegt.</p></div>}

function Stat({value,label,icon}){return <div className="card stat">{icon&&<div>{icon}</div>}<b>{value}</b><span>{label}</span></div>}
function PriorityItem({tone,title,text}){return <div className={`priority-item ${tone}`}><i/><div><b>{title}</b><span>{text}</span></div></div>}
function TimelineMini({time,text}){return <div className="timeline-mini"><b>{time}</b><span>{text}</span></div>}
function DataBox({title,icon,items,tone}){return <div className={`data-box ${tone}`}><h3>{icon}{title}</h3>{items.map(i=><div key={i}><Check size={14}/><span>{i}</span></div>)}</div>}
function InfoCard({icon,title,value}){return <div className="card info-card"><span>{icon}</span><small>{title}</small><b>{value}</b></div>}
function PanelHeader({title,source}){return <div className="panel-head"><div><span className="eyebrow">{source}</span><h2>{title}</h2></div></div>}
function Field({label,children}){return <label className="field"><span>{label}</span>{children}</label>}
function ReadOnlyField({label,value,source}){return <div className="readonly-field"><span>{label}</span><b>{value}</b><small><Check size={12}/>{source}</small></div>}
function Metric({label,value}){return <div className="metric"><b>{value}</b><span>{label}</span></div>}
function SafetyItem({label,state}){return <div className={`safety-item ${state}`}><span>{state==="yes"?<Check size={14}/>:<CircleDot size={14}/>}</span><b>{label}</b><small>{state==="yes"?"erfüllt":"offen"}</small></div>}
function CriteriaGroup({title,items}){return <div className="card criteria-group"><h3>{title}</h3>{items.map(i=><div className="criterion" key={i.label}><span className={`criterion-state ${i.state}`}>{i.state==="yes"?"✓":i.state==="no"?"–":"?"}</span><div><b>{i.label}</b><strong>{i.value}</strong><small>{i.source}</small></div></div>)}</div>}

createRoot(document.getElementById("root")).render(<App/>);
