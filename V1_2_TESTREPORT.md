# NutriPilot v1.2 – technischer und fachlogischer MVP-Testbericht

## Durchgeführte Prüfungen

- JSX/JavaScript-Syntax mit TypeScript 5.8 Parser: bestanden
- CSS-Parsing mit `tinycss2`: keine Parse-Fehler
- Regelkern für alle acht Demopatienten ausgeführt
- Persistenzmigration v1.0/v1.1 → v1.2 im Code geprüft
- Responsive-Regeln für Desktop, Notebook, Tablet und Smartphone ergänzt

## Regelkern-Ergebnisse der acht Testfälle

| Fall | Erwarteter zentraler Zustand | Ergebnis |
|---|---|---|
| Maria Schmidt | Schlucksicherheit offen | Übernahme blockiert |
| Hans Becker | Refeeding-Risiko + Elektrolyte offen | Übernahme blockiert |
| Eva Koch | onkologischer Kontext | Zielkorridor berechnet, keine Blockade |
| Ali Demir | Amputationskorrektur unbestätigt | Übernahme blockiert |
| Petra Lang | Dysphagie/Kostform berücksichtigt | Warnung, keine Blockade |
| Jürgen Wolf | Schluckplan offen | Übernahme blockiert |
| Lena Müller | onkologischer Kontext | Zielkorridor berechnet, keine Blockade |
| Sabine Krämer | Adipositas + Mangelernährungsrisiko | keine automatische kg-Zielzahl |

## Nachvollziehbarkeit

Für jeden Fall werden erzeugt:

- neun Karten zur Entscheidungsgrundlage
- Sicherheitsgate mit Status, Quelle und notwendiger Aktion
- fünf medizinische Herleitungsschritte
- sechs offene Rechenwege
- vier begründete Maßnahmenstufen
- Monitoringplan mit Intervall und Eskalationsauslöser
- Quellen- und lokale Regelkarten

## Noch offen

Ein vollständiger lokaler Vite-Produktionsbuild war in der Erstellungsumgebung nicht möglich, weil deren internes npm-Repository die benötigten Pakete nicht bereitstellte. Der Quellcode ist syntaktisch geprüft; der echte Produktionsbuild erfolgt über den vorhandenen GitHub-Actions-Workflow mit öffentlichem npm-Zugriff.

Vor Freigabe sind zusätzlich visuelle Browser-Abnahmen in Safari, Chrome, iOS Safari und Android Chrome erforderlich.
