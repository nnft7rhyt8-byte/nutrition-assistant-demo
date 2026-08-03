# NutriPilot v0.6.0

React/Vite-Konzeptprototyp für den klinischen Ernährungsworkflow.

## Neu in v0.6

- NRS-2002 vollständig zweistufig:
  - Vorscreening mit vier Fragen
  - Hauptscreening mit Ernährungsstatus, Krankheitsschwere und Alterszuschlag
  - transparenter Gesamtscore
- Assessment als zentrale Datendrehscheibe
- GLIM ohne erneute Eingaben
- automatische GLIM-Auswertung aus Assessmentdaten
- transparente Quellen der einzelnen Kriterien
- Fortschrittsanzeige und offene Datenerhebungen
- Maßnahmen und Entlassung übernehmen Assessmentdaten

## Deployment

GitHub Pages wird über `.github/workflows/deploy.yml` gebaut.

1. Inhalt dieses Ordners in das Repository hochladen.
2. `Settings → Pages → Source: GitHub Actions`.
3. Workflow abwarten.
4. Demo öffnen:
   `https://nnft7rhyt8-byte.github.io/nutrition-assistant-demo/`

## Klinischer Status

Konzeptprototyp, noch nicht klinisch validiert, nicht für echte Patientendaten oder autonome Entscheidungen.
