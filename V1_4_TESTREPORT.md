# NutriPilot v1.4 – technischer Prüfbericht

## Bestandene statische Prüfungen

- JSX/JavaScript wurde mit dem TypeScript-Parser ohne Syntaxfehler geprüft.
- CSS wurde mit `tinycss2` ohne Parsingfehler geprüft.
- Globaler Bereich `Therapiepläne` vorhanden.
- Therapieplan-Hero als erstes Element der Therapieansicht vorhanden.
- Direkter Link zur Entscheidungsgrundlage vorhanden.
- A4-Druck-/PDF-Export vorhanden.
- HTML-Therapieplanexport vorhanden.
- Clinical-Note-Export mit Clipboard-Fallback vorhanden.
- Therapieansicht nutzt die volle Workspace-Breite.
- Mobile Navigation enthält einen direkten Therapie-Einstieg.

## Build-Hinweis

Ein vollständiges lokales `npm install` war in der Ausführungsumgebung nicht möglich, weil das interne Paket-Repository `lucide-react` nicht bereitstellte. Der Produktionsbuild erfolgt nach dem Upload über den vorhandenen GitHub-Actions-Workflow.

## Manuelle Abnahme nach Deployment

- Safari Desktop
- Chrome Desktop
- iPad Portrait und Landscape
- iPhone 390 px
- Android Chrome 360 px
- Browserdruck auf A4 und „Als PDF sichern“
- Pop-up-Blocker-Hinweis beim PDF-Export
