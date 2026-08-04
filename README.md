# NutriPilot v1.4 – Therapieplan & Export

Lauffähige React/Vite-MVP-Version des Clinical Nutrition Workspace.

## Kernänderungen v1.4

- Therapieplan ist als zentrales Arbeitsergebnis hervorgehoben.
- Eigener globaler Bereich **Therapiepläne** für alle offenen und aktiven Pläne.
- Im Patientenfall heißt der Hauptbereich nun **Therapieplan**.
- Empfohlene Therapie, Zielwerte, Route, priorisierte Maßnahmen und Reevaluation stehen sofort oben.
- Direkter Zugriff auf Entscheidungsgrundlage, Sicherheitsgate, medizinische Herleitung, Rechenweg und Quellen.
- Professioneller Therapieplan-Export:
  - druckoptimierte A4-Ansicht / PDF über den Browser,
  - eigenständige HTML-Therapieplandatei,
  - Clinical Note als Zwischenablage oder Textdatei.
- Export enthält medizinische Entscheidungsgrundlage, Quellen, Erfolgskriterien, Anpassungs- und Eskalationsregeln.
- Therapieansicht nutzt die volle Arbeitsbreite; Desktop-, Tablet- und Mobilansicht wurden ergänzt.

## Wichtiger Status

Test- und Validierungsversion. Keine echten Patientendaten in die öffentliche GitHub-Pages-Demo eingeben. Empfehlungen sind fachlich zu prüfen und zu bestätigen.

## Start

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
