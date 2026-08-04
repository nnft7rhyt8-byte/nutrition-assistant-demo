# NutriPilot v1.4 auf GitHub Pages aktualisieren

## Updatepaket

Im bestehenden Repository `nutrition-assistant-demo` über **Add file → Upload files** hochladen:

- `src/`
- `index.html`
- `package.json`
- `vite.config.js`
- `README.md`
- `V1_4_THERAPY_PLAN.md`
- optional `design/`

Vorhandene Dateien ersetzen und anschließend **Commit changes** wählen.

Der bereits vorhandene GitHub-Actions-Workflow baut und veröffentlicht die App automatisch.

## Nach dem Deployment prüfen

1. Seitenleiste enthält **Therapiepläne**.
2. Auf Mobilgeräten ist **Therapie** in der unteren Navigation sichtbar.
3. Ein Fall öffnet den Tab **Therapieplan**.
4. Der empfohlene Plan steht als erster großer Block oben.
5. **PDF / Drucken** öffnet die A4-Druckansicht.
6. **Therapieplan-Datei** lädt eine HTML-Datei herunter.
7. **Clinical Note** kopiert den Plan oder lädt bei fehlender Clipboard-Berechtigung eine Textdatei.
8. Die Entscheidungsgrundlage ist mit einem Klick erreichbar.

Keine echten Patientendaten in die öffentliche Demo eingeben.
