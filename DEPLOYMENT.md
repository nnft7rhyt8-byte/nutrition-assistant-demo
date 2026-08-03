# NutriPilot auf GitHub Pages veröffentlichen

Repository: `nutrition-assistant-demo`

## 1. Dateien hochladen

Den gesamten Inhalt dieses Ordners in das GitHub-Repository hochladen.

Die erste Ebene muss so aussehen:

```text
.github/
src/
.gitignore
DEPLOYMENT.md
README.md
index.html
package.json
vite.config.js
```

Wichtig: Nicht den äußeren Ordner `nutripilot-repository-ready` hochladen, sondern dessen Inhalt.

## 2. GitHub Pages konfigurieren

Im Repository:

1. `Settings`
2. `Pages`
3. unter `Build and deployment`
4. bei `Source` auswählen: `GitHub Actions`

## 3. Workflow starten

Ein Commit auf `main` startet automatisch:

`Deploy NutriPilot to GitHub Pages`

Alternativ:

1. `Actions`
2. Workflow auswählen
3. `Run workflow`

## 4. Öffentliche Adresse

```text
https://nnft7rhyt8-byte.github.io/nutrition-assistant-demo/
```

## 5. Häufige Fehler

### Leere Seite

In `vite.config.js` muss stehen:

```js
base: "/nutrition-assistant-demo/"
```

### Lockfile-Fehler

Der Workflow verwendet bewusst keinen npm-Cache und benötigt deshalb keine `package-lock.json`.

### Workflow wird nicht erkannt

Die Datei muss exakt hier liegen:

```text
.github/workflows/deploy.yml
```
