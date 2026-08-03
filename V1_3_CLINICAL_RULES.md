# NutriPilot v1.3 – klinischer Regelkern

## 1. Aussagearten

Jede angezeigte Aussage muss einer Kategorie zugeordnet sein:

- **Patientendatum:** direkt dokumentierte Information mit Herkunft und Status.
- **Deterministische Berechnung:** reproduzierbare Formel, beispielsweise BMI, Gewichtsverlust oder Versorgungslücke.
- **Leitlinienregel:** publizierte Empfehlung mit Quelle, Version, Geltungsbereich und Anwendbarkeitsprüfung.
- **Lokaler Klinikstandard:** erst nach klinikspezifischer Freigabe als solcher zu kennzeichnen.
- **NutriPilot-MVP-Regel:** Produkt-/Workflowregel, noch keine medizinische Leitlinie.
- **Fachliche Interpretation erforderlich:** Schluss ist nicht algorithmisch zwingend.
- **Anwendungsgrenze:** der Fall wird nicht oder nur im Spezialmodus unterstützt.

## 2. Transparente Schlusskette

Die Oberfläche verwendet bewusst nicht die pauschale Behauptung „medizinisch logisch bewiesen“. Sie zeigt stattdessen:

1. Beobachtung
2. Datenstatus und Herkunft
3. Regeltyp
4. konkrete Regel und Quelle
5. Anwendbarkeit
6. zulässigen fachlichen Schluss
7. Auswirkung
8. Grenze und Unsicherheit
9. fachliche Bestätigung

## 3. Ernährungsweg

Der Ernährungsweg wird getrennt vom Nährstoffbedarf geprüft:

- Ist die orale Zufuhr sicher?
- Ist der Gastrointestinaltrakt funktionell und zugänglich?
- Ist enterale Ernährung möglich und toleriert?
- Welche Bedarfsdeckung wird tatsächlich erreicht?
- Welche Ziele und Präferenzen sind dokumentiert?
- Besteht eine klare PN-Indikation?

## 4. Parenterale Ernährung

### Indikationsmodell

PN wird im MVP fachlich geprüft, wenn mindestens ein Ernährungsrisiko beziehungsweise eine Mangelernährungssituation dokumentiert ist und zusätzlich:

- oral und/oder enteral unzureichend oder unsicher ist, oder
- der Gastrointestinaltrakt nicht funktionell, nicht zugänglich oder perforiert/undicht ist.

Bei funktionellem und zugänglichem Gastrointestinaltrakt wird enterale Ernährung vor PN priorisiert. Bei begrenzter enteraler Toleranz kann supplementäre PN geprüft werden.

### PN-Teamgate

Eine PN-Planungsansicht ist nur freigabefähig, wenn dokumentiert sind:

- fachlich bestätigte Indikation
- Beteiligung des Ernährungsteams
- ärztliche Entscheidung
- pharmazeutische Prüfung
- Pflege-/Zugangsprüfung
- venöser Zugangsweg
- Patientenwille/Einwilligung
- Kalium, Phosphat und Magnesium
- Glukose und Triglyzeride
- Nieren-, Leber- und Volumenstatus

### Mengen und Zusammensetzung

NutriPilot zeigt Gesamtbedarf, dokumentierte Gesamtdeckung und eine rechnerische Versorgungslücke. Diese Lücke ist keine PN-Verordnung. Die konkrete Zusammensetzung, Makronährstoffverteilung, Elektrolyte, Vitamine, Spurenelemente, Insulin/Medikamente, Beutelwahl und Infusionsgeschwindigkeit bleiben qualifizierten Fachpersonen und lokalen Standards vorbehalten.

### Einleitung

Bei nicht refeedinggefährdeten Erwachsenen kann als sichtbarer Leitlinienhinweis eine progressive Einleitung dargestellt werden. Die Anwendung kennzeichnet die NICE-Angabe „gewöhnlich höchstens 50 % des geschätzten Gesamtbedarfs in den ersten 24–48 Stunden“ ausdrücklich als Teamorientierung, nicht als automatische Verordnung. Bei Refeeding-Risiko wird keine automatische PN-Startmenge freigegeben.

### Monitoring

Der PN-Monitoringplan enthält unter anderem:

- gesamte Nährstoffzufuhr aus allen Wegen
- tatsächlich verabreichtes Volumen
- Flüssigkeitsbilanz und Gewicht
- Na, K, Harnstoff, Kreatinin
- Glukose
- Magnesium und Phosphat
- Leberwerte einschließlich INR
- Zugangs-/Katheterkomplikationen
- tägliche Indikations- und Deeskalationsprüfung

## 5. Anwendungsgrenzen

Keine allgemeine automatische Freigabe für:

- Pädiatrie
- Schwangerschaft
- seltene Stoffwechselerkrankungen
- komplexe Intensivtherapie
- kombiniertes schweres Organversagen
- autonome Elektrolyt-, Insulin-, Arzneimittel- oder Mikronährstoffdosierung

## 6. Vor klinischem Einsatz

Jede Regel benötigt eine fachliche Ownerin oder einen Owner, Version, Quelle, Zielpopulation, Ein-/Ausschlusskriterien, Testfälle, Änderungsverlauf und dokumentierte Freigabe. Die Routen- und PN-Logik muss durch Ernährungsmedizin, Diätetik, Pharmazie, Pflege und ärztlichen Dienst gemeinsam validiert werden.
