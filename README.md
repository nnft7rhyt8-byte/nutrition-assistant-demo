# NutriPilot v1.2 – Explainable Therapy MVP

Interaktive Arbeits- und Validierungsversion eines Clinical Nutrition Workspace für klinische Ernährungsfachkräfte.

## Leitidee von v1.2

NutriPilot zeigt nicht nur **was** vorgeschlagen wird, sondern **warum**. Die Ernährungsfachkraft erhält direkten Zugriff auf Patientendaten, Sicherheitsbedingungen, Regelwahl, Rechenweg, medizinische Schlusskette, Quellen und Monitoringplan.

> Patientendaten → Sicherheitsgate → passende Regelbasis → offener Rechenweg → medizinische Schlussfolgerung → prüfbarer Therapievorschlag → fachliche Bestätigung

## Neu in v1.2

### Plattformweite UX- und Responsive-Überarbeitung

- Initialen und Icons in sämtlichen runden Avataren exakt horizontal und vertikal zentriert
- vereinheitlichte Abstände, Status-Chips, Listenzeilen, Buttons und Fokuszustände
- stabilere Arbeitslisten und Fallkarten bei langen Texten
- responsive Therapieansicht für Desktop, Notebook, Tablet und Smartphone
- mobile Bottom-Navigation mit direktem Zugriff auf Arbeitstag, Konsile, Neuanlage, Fälle und Suche
- mobile Sticky-Navigation innerhalb des Patienten- und Therapie-Workspaces
- optimierte Touch-Ziele und Safe-Area-Unterstützung

### Nachvollziehbarer Therapie-Copilot

- direkt erreichbare **Entscheidungsgrundlage** mit Herkunft und klinischer Bedeutung jeder Information
- Datenstatus `bestätigt`, `mit Vorbehalt` oder `offen`
- sichtbares **Sicherheitsgate** vor quantitativer Übernahme
- Refeeding-Kriterien einzeln einsehbar; Näherungswerte werden als solche kenntlich gemacht
- medizinische Schlusskette in fünf Schritten:
  1. Befunde zusammenführen
  2. Sicherheitsgate anwenden
  3. passende Regelbasis wählen
  4. Interventionsstufe ableiten
  5. Monitoring festlegen
- vollständige Rechenwege für Gewichtsbasis, BMI, Gewichtsverlust, Energie, Protein und Flüssigkeit
- explizite Begründung für jeden Maßnahmenblock
- Quellenkarten mit Leitlinie, Version, Geltungsbereich und verwendeter Empfehlung
- lokale NutriPilot-Regeln separat von externen Leitlinien ausgewiesen
- Datenvollständigkeit statt irreführender „KI-Sicherheit“
- Audit-Einträge enthalten Regelkontext, Quellen und Datenvollständigkeit

## Enthaltene klinische Arbeitsbereiche

- Mein Arbeitstag als priorisierter Arbeitsvorrat
- Konsilübersicht und Clinical Nutrition Workspace
- acht fiktive Testpatienten
- Neuanlage weiterer fiktiver Patienten und Konsile
- Assessment als zentraler Datenkern
- transparente Amputationskorrektur
- vorbereitete GLIM-Prüfung mit fachlicher Bestätigung
- Explainable Therapy Copilot
- Clinical Timeline und Verlaufseinträge
- Entlassungscheck und vorbereitete Clinical Note
- lokale Browser-Persistenz und Migration vorhandener v1.0-/v1.1-Demodaten
- lokaler JSON-Export und Zurücksetzen der Demodaten

## Fachliche Wissensbasis im Demo-MVP

Der Regelkern nutzt ausgewählte, in der Oberfläche sichtbare Orientierungen aus:

- DGEM S3-Leitlinie Klinische Ernährung und Hydrierung im Alter, 2025
- ESPEN practical guideline: Clinical nutrition and hydration in geriatrics, 2022
- ESPEN practical guideline: Clinical Nutrition in cancer, 2021
- ESPEN practical guideline für polymorbide internistische Krankenhauspatienten, 2024
- NICE CG32 Nutrition support for adults, zuletzt aktualisiert 2017

Die Implementierung ist ein **validierbarer MVP-Regelkern**. Sie deckt nicht alle Diagnosen, Ein- und Ausschlusskriterien, lokalen Standards oder klinischen Sonderlagen ab.

## Sicherheitsprinzipien

- keine erfundenen Patientendaten
- keine autonome Diagnose- oder Therapieentscheidung
- quantitative Übernahme wird bei kritischen Datenlücken blockiert
- fehlende Organfunktion oder Flüssigkeitsbesonderheiten werden sichtbar gemacht
- bei Adipositas mit Mangelernährungsrisiko keine scheinpräzise kg-basierte Automatik
- Parenteralia, Medikamenten- und Elektrolytdosierungen, Pädiatrie und komplexe Intensivtherapie sind ausgeschlossen
- jede Empfehlung muss von einer Ernährungsfachkraft geprüft und bestätigt werden

## Wichtige Grenze dieser Version

Diese GitHub-Pages-Version ist eine interaktive Test- und Validierungsversion, **kein klinisches Produktionssystem**. Sie speichert Daten ausschließlich im Browser und ist öffentlich erreichbar. Ausschließlich fiktive Testdaten verwenden.

Die als KI-gestützt beschriebene Erklärung wird in diesem öffentlichen MVP lokal und reproduzierbar aus strukturierten Daten, Berechnungen und Regeln erzeugt. Es wird kein externes generatives KI-Modell mit Patientendaten aufgerufen.

## Für echte Patientendaten erforderlich

- geschützte Anmeldung, Rollen und Rechte
- serverseitige Datenbank und verschlüsselte Übertragung
- Mandanten- und Krankenhauskonzept
- vollständiger, revisionssicherer Audit Trail
- Backup-, Lösch- und Aufbewahrungskonzept
- Datenschutz- und Informationssicherheitsprüfung
- vollständig versioniertes und klinisch freigegebenes Regelwerk
- Risikomanagement und Prüfung der Medizinprodukte-Eigenschaft
- Schnittstellen zur Krankenhaus-IT
- geschützter KI-Service ohne API-Schlüssel im Browser

## GitHub Pages

Repository: `nnft7rhyt8-byte/nutrition-assistant-demo`

Nach Upload auf `main` startet `.github/workflows/deploy.yml` automatisch.

Demo-URL:

`https://nnft7rhyt8-byte.github.io/nutrition-assistant-demo/`

## Lokal testen

```bash
npm install
npm run dev
```

Produktionsbuild:

```bash
npm run build
```
