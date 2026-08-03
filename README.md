# NutriPilot v1.3 – Trust, Clinical Excellence & Parenteral Nutrition

NutriPilot v1.3 ist eine interaktive Test- und Validierungsversion für den klinischen Ernährungsworkflow. Sie führt Konsil, Assessment, GLIM, transparente Therapieherleitung, Ernährungsweg, parenterale Ernährung, Monitoring, Dokumentation und Entlassung in einer Fallakte zusammen.

## Leitprinzip

NutriPilot behauptet nicht, dass jede lokale Produktregel eine medizinische Leitlinienempfehlung ist. In v1.3 werden Aussagen sichtbar getrennt in:

- Patientendatum
- deterministische Berechnung
- publizierte Leitlinienregel
- lokaler Klinikstandard
- NutriPilot-MVP-Regel
- fachliche Interpretation erforderlich
- Anwendungsgrenze

## Neu in v1.3

### Transparente Herleitung

Jeder Therapieschritt zeigt:

1. Beobachtung und Datenstatus
2. Regeltyp und konkrete Quelle
3. Anwendbarkeit auf den Patienten
4. zulässigen fachlichen Schluss
5. Auswirkung auf Therapie oder Datenerhebung
6. Grenze des Schlusses

### Parenterale Ernährung

PN ist als eigener interprofessioneller Entscheidungsweg integriert:

- dokumentierte GI-Funktion
- enterale Machbarkeit und Toleranz
- orale/enterale Bedarfsdeckung
- PN-Indikationsstatus
- zentrale oder periphere Zugangsorientierung
- Refeeding-Sicherheitsprüfung
- Glukose-, Triglyzerid-, Elektrolyt-, Organ- und Volumenstatus
- Ernährungsteam, ärztlicher Dienst, Pharmazie und Pflege als Teamgate
- Patientenwille und Behandlungsziel
- progressive Startorientierung als Leitlinienhinweis
- tägliche Prüfung von Indikation und Rückkehr zu oral/enteral
- klinisches und laborchemisches Monitoring

NutriPilot berechnet keine autonome Beutelzusammensetzung, Elektrolyt-, Insulin-, Medikamenten- oder Mikronährstoffdosierung und entscheidet keinen Katheterzugang autonom.

### Professional Excellence

- 60-Sekunden-Fallbriefing für Visite und Ernährungsteam
- „Warum diese Strategie – warum nicht die Alternative?“
- Änderungsvorschau ohne Änderung der Fallakte
- Patienten- und Behandlungsziele
- Erfolg-, Anpassungs-, Eskalations- und Abbruchkriterien
- strukturiertes fachliches Feedback
- Clinical-Excellence-Übersicht im Arbeitstag
- Regel- und Quellenregister
- Auditkontext mit Datenstand, Regelversion, Route und PN-Status

## Demo-Fälle

Die bestehenden acht Testpatienten bleiben erhalten. Zusätzlich enthält v1.3 einen neunten Testfall:

- **Monika Weber:** postoperativer Ileus, nicht funktioneller Gastrointestinaltrakt und interprofessionell vorbereitete parenterale Ernährung.

## Datenspeicherung

Die Anwendung speichert ausschließlich lokal im Browser (`localStorage`). Neue fiktive Patienten können aufgenommen und bestehende Testfälle bearbeitet werden.

## Wichtiger Status

Diese Version ist ein UX- und Clinical-Decision-Support-MVP zur fachlichen Validierung. Sie ist nicht für echte Patientendaten, autonome Diagnosen, autonome Therapieentscheidungen oder die klinische Verordnung parenteraler Ernährung freigegeben.

## Start

```bash
npm install
npm run dev
```

## GitHub Pages

Der vorhandene Workflow unter `.github/workflows/deploy.yml` baut und veröffentlicht die Anwendung bei einem Push auf `main`.
