# NutriPilot v1.2 – klinischer Regelkern und Nachvollziehbarkeit

## Architektur

### 1. Strukturierte Patientendaten

Alle Schlüsse verwenden ausschließlich dokumentierte Assessmentdaten. Fehlende Angaben bleiben offen; sie werden nicht geschätzt oder durch die Erklärungsschicht ergänzt.

### 2. Deterministische Berechnung

- beobachtetes und gegebenenfalls segmentkorrigiertes Gewicht
- BMI und korrigierter BMI
- Gewichtsverlust
- Energie-, Protein- und gegebenenfalls Flüssigkeitskorridore
- Refeeding-Risikokriterien
- Sicherheits- und Vollständigkeitsprüfungen

### 3. Versionierte Regel- und Leitlinienbasis

- DGEM Geriatrie 2025
- ESPEN Geriatrie 2022
- ESPEN Onkologie 2021
- ESPEN polymorbide internistische Krankenhauspatienten 2024
- NICE CG32, zuletzt aktualisiert 2017
- separat ausgewiesene lokale NutriPilot-MVP-Regeln

### 4. Erklärbare Schlusskette

Jede Empfehlung zeigt:

1. verwendete Beobachtung
2. angewendete Regel
3. medizinische Schlussfolgerung
4. Konsequenz für Therapie oder Datenerhebung
5. zugehörige Quelle

### 5. Human-in-the-loop

- Vorschlag übernehmen
- Strategievariante auswählen
- manuell anpassen
- mit Grund ablehnen
- final fachlich bestätigen
- Entscheidung mit Kontext in der Clinical Timeline protokollieren

## Datenstatus

Jede Entscheidungsgrundlage besitzt einen sichtbaren Status:

- **bestätigt**: verwendbare strukturierte Information
- **mit Vorbehalt**: verwendbar, aber klinisch eingeschränkt zu interpretieren
- **offen**: fehlt, ist unklar oder verhindert eine sichere Übernahme

Die Oberfläche zeigt **Datenvollständigkeit**, nicht eine vorgetäuschte KI-Konfidenz.

## Automatisierte Zielkorridore

### Ältere beziehungsweise geriatrische Patienten

- Energie: 27–30 kcal/kg/Tag als MVP-Korridor für kranke ältere Personen
- Protein:
  - 1,0–1,2 g/kg/Tag ohne dokumentiertes Merkmal für höheren Bedarf
  - 1,2–1,5 g/kg/Tag bei Entzündung, reduzierter Muskelmasse oder relevantem Gewichtsverlust

### Onkologischer Kontext

- Energie: 25–30 kcal/kg/Tag
- Protein: 1,0–1,5 g/kg/Tag

### Allgemeiner erwachsener Krankenhausfall

- breiter allgemeiner Korridor innerhalb der NICE-Orientierung
- vor klinischer Freigabe nach Diagnosegruppen zu differenzieren

### Adipositas mit gleichzeitigem Mangelernährungsrisiko

- keine automatische scheinpräzise kg-basierte Zielzahl
- geeignete Gewichts- und Berechnungsbasis individuell festlegen

## Refeeding-Logik

Die Oberfläche legt jedes verwendete Kriterium einzeln offen. Weil das Demo-Assessment die orale Aufnahme als Prozentwert erfasst, werden Grenzwerte für „kaum/keine Aufnahme“ als **MVP-Näherung** gekennzeichnet und müssen vor klinischem Einsatz gegen einen freigegebenen lokalen Standard validiert werden.

Ein Sicherheitsstopp erfolgt insbesondere bei erhöhtem Risiko und fehlendem oder auffälligem Kalium-, Phosphat- oder Magnesiumstatus.

## Sicherheitsstopps

Eine quantitative Übernahme wird insbesondere blockiert bei:

- fehlender Gewichtsbasis
- unbestätigter Amputationskorrektur
- erhöhtem Refeeding-Risiko mit fehlendem oder auffälligem Elektrolytstatus
- ungeklärter Schlucksicherheit
- Dysphagie ohne bestätigten Kostform-/Schluckplan

Warnhinweise erscheinen unter anderem bei:

- Ödemen oder Aszites
- Flüssigkeitsrestriktion
- eingeschränkter oder ungeklärter Organfunktion
- Adipositas mit Mangelernährungsrisiko

## Stufenlogik der Empfehlung

1. Sicherheit und offene Voraussetzungen
2. orale Ernährung optimieren
3. ergänzende Trinknahrung prüfen
4. bei ausbleibender Zielerreichung interprofessionelle Eskalation prüfen
5. Monitoringparameter, Kontrollintervall und Eskalationsauslöser gemeinsam festlegen

## Bewusste Ausschlüsse

- autonome Diagnose und Therapie
- Medikamenten- und Elektrolytdosierungen
- parenterale Ernährung
- komplexe Intensivtherapie
- Pädiatrie
- vollständige nephrologische oder hepatologische Regelwerke

## Vor realem klinischem Einsatz

Jede Regel benötigt mindestens:

- fachliche Ownerin beziehungsweise fachlichen Owner
- konkrete Quelle und Version
- Zielpopulation
- Ein- und Ausschlusskriterien
- Evidenz- oder Empfehlungsgrad
- fachliche Prüfung der deutschen Darstellung
- Tests mit Grenz- und Fehlerszenarien
- Freigabe und Änderungs-/Versionshistorie
