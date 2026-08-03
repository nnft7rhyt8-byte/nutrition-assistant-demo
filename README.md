# NutriPilot v1.0 MVP

Interaktive Arbeitsversion eines Clinical Nutrition Workspace für klinische Ernährungsfachkräfte.

## Enthalten

- vollständige neue v1.0-Informationsarchitektur
- `Mein Arbeitstag` als priorisierter Arbeitsvorrat
- Konsilübersicht und Clinical Nutrition Workspace
- acht vorhandene fiktive Testpatienten
- vollständige Neuanlage weiterer Testpatienten und Konsile
- zentraler Assessment-Datenkern
- transparente Amputationskorrektur
- vorbereitete GLIM-Prüfung mit fachlicher Bestätigung
- Therapieplanung mit änderbarem Demovorschlag
- Clinical Timeline mit neuen Verlaufseinträgen
- Entlassungscheck und automatisch vorbereitete Clinical Note
- lokale Browser-Persistenz via `localStorage`
- lokaler JSON-Export und Zurücksetzen der Demodaten
- responsive Darstellung für Desktop und Tablet

## Wichtige Grenze dieser Version

Diese GitHub-Pages-Version ist eine echte interaktive MVP-Arbeitsversion, aber **kein klinisches Produktionssystem**. Die Daten liegen ausschließlich im Browser und die Website ist öffentlich erreichbar. Deshalb dürfen ausschließlich fiktive Testdaten eingegeben werden.

Für echte Patientendaten werden mindestens benötigt:

- geschützte Anmeldung und Rollen/Rechte
- serverseitige Datenbank und verschlüsselte Übertragung
- Mandanten- und Krankenhauskonzept
- Audit Trail und revisionssichere Änderungen
- Backups, Lösch- und Aufbewahrungskonzept
- Datenschutz- und Informationssicherheitsprüfung
- klinisch validiertes Regelwerk
- Schnittstellen zur Krankenhaus-IT

## GitHub Pages

Repository: `nnft7rhyt8-byte/nutrition-assistant-demo`

Nach Upload auf den Branch `main` startet `.github/workflows/deploy.yml` automatisch. In GitHub muss unter `Settings → Pages` als Quelle `GitHub Actions` gewählt sein.

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
