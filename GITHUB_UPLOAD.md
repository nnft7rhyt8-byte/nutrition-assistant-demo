# NutriPilot v1.2 auf GitHub Pages aktualisieren

## Einfacher Web-Upload

Im Repository `nnft7rhyt8-byte/nutrition-assistant-demo`:

1. `Add file` → `Upload files`
2. Aus dem Update-Paket gemeinsam hochladen:
   - `src`
   - `index.html`
   - `package.json`
   - `vite.config.js`
   - `README.md`
   - `V1_2_CLINICAL_RULES.md`
   - `V1_2_TESTREPORT.md`
3. Vorhandene Dateien ersetzen lassen.
4. Die alte Datei `V1_1_CLINICAL_RULES.md` im Repository bei Bedarf löschen.
5. Commit-Nachricht: `NutriPilot v1.2 Explainable Therapy`
6. `Commit changes`
7. Unter `Actions` den Workflow `Deploy NutriPilot to GitHub Pages` abwarten.

Die vorhandene `.github/workflows/deploy.yml` muss beim Update nicht erneut hochgeladen werden.

Demo nach erfolgreichem Deploy:

`https://nnft7rhyt8-byte.github.io/nutrition-assistant-demo/`

## Empfohlene Abnahme

### Layout

- Desktop: Initialen in allen Avataren zentriert
- Notebook: Arbeitsliste ohne Überlappungen
- Tablet Hoch-/Querformat: Workspace ohne abgeschnittene Inhalte
- Smartphone: Bottom-Navigation, Sticky-Tabs, keine horizontale Seitenscrollleiste

### Therapie-Copilot

- Maria Schmidt: Schlucksicherheit blockiert die Übernahme
- Hans Becker: Refeeding-Sicherheitsstopp wegen offener Elektrolyte
- Eva Koch: onkologischer Zielkorridor und Herleitung sichtbar
- Ali Demir: Amputationskorrektur muss bestätigt werden
- Petra Lang: Dysphagiehinweis und bestätigte Kostform sichtbar
- Jürgen Wolf: fehlender Schluckplan blockiert
- Lena Müller: onkologischer Entlassungskontext
- Sabine Krämer: keine scheinpräzise kg-Automatik bei Adipositas/Mangelernährungsrisiko

Ausschließlich fiktive Testdaten verwenden.
