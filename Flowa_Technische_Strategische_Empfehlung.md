# Flowa - Technische und strategische Umsetzungsempfehlung

Stand: 10. Juni 2026

Grundlage dieses Dokuments ist der Produktplan `Flowa_Produktplan.md`. Die dort beschriebene Produktvision wird als verbindlich betrachtet: Flowa ist keine medizinische Therapie und soll Stottern nicht "wegmachen", sondern stotternde Menschen mental, emotional und praktisch im Alltag begleiten.

## 1. Verstaendnis der Produktidee

### Welches Problem wird geloest?

Flowa adressiert den mentalen und emotionalen Belastungskreislauf, der bei vielen stotternden Menschen rund um Sprechsituationen entsteht:

1. Eine Sprechsituation steht bevor.
2. Die innere Anspannung steigt.
3. Die Person erwartet, zu stottern oder negativ bewertet zu werden.
4. Die Situation wird vermieden oder nur unter grossem Stress durchgestanden.
5. Vermeidung fuehlt sich kurzfristig erleichternd an.
6. Langfristig steigt die Angst vor der naechsten Situation.

Das Kernproblem ist damit nicht nur das sicht- oder hoerbare Stottern, sondern die Kombination aus Angst, Scham, Vermeidungsverhalten, negativen Selbstgespraechen und einem Selbstbild, das stark vom Stottern gepraegt wird.

Flowa soll diesen Kreislauf durch kleine Alltagsschritte, Reflexion, Selbstakzeptanz und sichtbaren Fortschritt unterbrechen.

### Zielgruppe

Primaere Zielgruppe:

- stotternde Jugendliche und Erwachsene
- Menschen, die im Alltag mutiger sprechen moechten
- Menschen, die mentale Unterstuetzung bei Sprechsituationen suchen

Sekundaere Zielgruppe:

- Menschen in Logopaedie oder Therapie, die zusaetzlich im Alltag ueben moechten
- Menschen ohne Therapie, die niedrigschwellige erste Schritte suchen
- Eltern und Angehoerige
- Therapeutinnen und Therapeuten, die strukturierte Alltagsaufgaben begleiten moechten

### Konkreter Nutzen

Flowa schafft Nutzen durch:

- schrittweise Reduktion von Angst vor Sprechsituationen
- bewusste Konfrontation mit Alltagssituationen ohne Perfektionsdruck
- Sichtbarmachung von Erfolgen und Lernmomenten
- Aufbau selbstfreundlicher innerer Saetze
- Reflexion vor und nach herausfordernden Momenten
- langfristige Erinnerung an fruehere Erfolge
- niedrigschwellige Atem- und Entspannungsuebungen
- Wissensvermittlung ueber Stottern, Angst, Vermeidung und Selbstakzeptanz

Der wichtigste Nutzen ist nicht fluessigeres Sprechen, sondern mehr Handlungsfreiheit trotz Stottern.

### Beschriebene Kernfunktionen

- Onboarding mit Zielauswahl und persoenlichen Sprechsituationen
- Challenge-Bibliothek nach Schwierigkeit und Themenpfaden
- Challenge-Ablauf mit Vorbereitung, Durchfuehrung und Nachreflexion
- Anspannungsskala vor und nach Challenges
- Erfolgstagebuch mit Reflexionen und Lernmomenten
- Atem- und Meditationsuebungen
- Affirmationen und motivierende Selbstnachrichten
- Education-Bereich mit Artikeln, Videos, Audio, Quiz und Checklisten
- Fortschrittsuebersicht
- persoenliche Erinnerungen an fruehere Erfolge
- optionale spaetere Stimm- und Sprechuebungen
- moegliche Community-Funktionen
- moeglicher Therapeutinnen-Modus

### Annahmen

Da der Produktplan einige strategische Punkte offenlaesst, werden fuer diese Empfehlung folgende Annahmen getroffen:

- Flowa startet als mobile App, weil die Nutzung vor, waehrend und nach Alltagssituationen mobil stattfinden muss.
- Die erste Zielgruppe sind Jugendliche ab ca. 16 Jahren und Erwachsene.
- Nutzerinnen und Nutzer koennen anonym starten und spaeter optional ein Konto anlegen.
- Tagebuch- und Reflexionsdaten gelten als besonders sensibel.
- KI wird nicht im Hackathon-MVP, sondern erst in Version 2 fuer Zusammenfassungen und persoenliche Erfolgserinnerungen eingesetzt.
- Inhalte werden vor produktivem Launch fachlich von Logopaedie/Psychologie-nahen Expertinnen oder Experten geprueft.
- Die App darf keine Heilversprechen machen und keine medizinische Diagnose oder Therapie ersetzen.

### Offene Fragen und Risiken

Offene Fragen:

- Soll Flowa zuerst Jugendliche, Erwachsene oder beide Zielgruppen bedienen?
- Soll die App vollstaendig anonym nutzbar sein?
- Welche Inhalte werden fachlich geprueft und von wem?
- Soll es eine kostenlose Basisversion und eine Premiumversion geben?
- Wie stark darf KI persoenliche Reflexionen zusammenfassen oder interpretieren?
- Welche Daten sollen lokal, serverseitig oder verschluesselt gespeichert werden?

Wesentliche Risiken:

- Challenges koennten als Druck statt als Ermutigung empfunden werden.
- Gamification koennte falsche Leistungsanreize setzen.
- Ungepruefte Inhalte koennten fachlich zu oberflaechlich oder unpassend sein.
- Tagebucheintraege sind sehr sensibel und brauchen hohes Datenschutzniveau.
- KI koennte unpassende, wertende oder therapeutisch wirkende Antworten erzeugen.
- Die App darf nicht den Eindruck erwecken, Stottern heilen zu wollen.

## 2. Empfohlener Technologie-Stack

### Programmiersprache: TypeScript

Empfehlung: TypeScript fuer Frontend, Backend-Logik, Supabase Edge Functions und geteilte Typen.

Vorteile:

- einheitlicher Stack fuer App und Backend-nahe Logik
- hohe Entwicklungsgeschwindigkeit
- gute Typensicherheit
- breites Oekosystem fuer React Native, Supabase und KI-APIs

Nachteile:

- Typqualitaet muss diszipliniert gepflegt werden
- komplexe native Mobile-Themen koennen zusaetzliche Plattformkenntnisse erfordern

Kosten:

- keine direkten Lizenzkosten

Entwicklungsaufwand:

- niedrig bis mittel
- sehr gut fuer schnelle MVP-Entwicklung geeignet

Skalierbarkeit:

- gut, solange Backend-Logik sauber modularisiert wird

### Frontend: Expo React Native

Empfehlung: Expo React Native als mobile App fuer iOS und Android.

Begruendung:

Flowa ist ein alltagsnaher Begleiter. Die App muss vor einer Challenge, direkt nach einer Situation, unterwegs, beim Telefonieren oder in sozialen Momenten schnell erreichbar sein. Eine mobile App passt besser als eine reine Web-App.

Vorteile:

- ein Codebase fuer iOS und Android
- schneller Prototyp und schnelle Iteration
- gute Unterstuetzung fuer Push Notifications
- lokale Speicherung, SecureStore, Biometrie und Offline-Faehigkeit moeglich
- EAS Build und EAS Update vereinfachen Releases

Nachteile:

- App-Store-Review und Release-Prozess kosten Zeit
- bei sehr nativen Spezialfunktionen kann zusaetzlicher Aufwand entstehen
- Web-Version ist nicht automatisch perfekt

Kosten:

- Expo Free fuer Start und Hackathon ausreichend
- Expo Starter kostet laut Expo Pricing 19 USD pro Monat
- Apple Developer Account ca. 99 USD pro Jahr
- Google Play Developer Account einmalig ca. 25 USD

Entwicklungsaufwand:

- niedrig bis mittel fuer MVP
- mittel fuer produktionsreife App mit sauberem Offline- und Datenschutzkonzept

Skalierbarkeit:

- gut fuer Consumer-App
- spaeter durch native Module erweiterbar

### Backend: Supabase

Empfehlung: Supabase als Backend-Plattform mit Auth, Postgres, Row Level Security, Storage, Edge Functions und optional pgvector.

Begruendung:

Flowa braucht Nutzerkonten, sensible persoenliche Daten, strukturierte Journals, Challenge-Verlauf, Fortschrittsdaten und spaeter Aehnlichkeitssuche. Supabase bietet dafuer ein schnelles, aber solides Fundament.

Vorteile:

- Postgres als robuste relationale Datenbank
- Auth direkt integriert
- Row Level Security fuer Datenschutz zentral
- Edge Functions fuer KI- und Reminder-Logik
- pgvector fuer spaetere semantische Aehnlichkeitssuche
- gute Startup-Geschwindigkeit

Nachteile:

- Vendor Lock-in auf Supabase-Services
- Row Level Security muss sorgfaeltig modelliert und getestet werden
- Free-Tier-Projekte koennen fuer Produktion zu begrenzt sein

Kosten:

- Free-Plan fuer Prototypen ausreichend
- Supabase Free beinhaltet laut Supabase Docs u.a. 500 MB Datenbankgroesse pro Projekt, 50.000 Monthly Active Users, 1 GB Storage und 500.000 Edge Function Invocations
- produktiv wahrscheinlich Supabase Pro ab ca. 25 USD pro Monat plus Nutzung

Entwicklungsaufwand:

- niedrig fuer MVP
- mittel fuer sichere Produktionsarchitektur

Skalierbarkeit:

- gut fuer fruehe und mittlere Produktphase
- spaeter mit Read Replicas, groesserem Compute oder Migration auf eigenes Postgres erweiterbar

### Datenbank: Postgres mit Row Level Security und pgvector

Empfehlung: Postgres als zentrale Datenbank, mit RLS fuer Nutzerisolierung und pgvector fuer Version 2.

Wichtige Tabellen:

- `profiles`
- `onboarding_answers`
- `goals`
- `challenges`
- `challenge_paths`
- `challenge_runs`
- `reflection_answers`
- `journal_entries`
- `affirmations`
- `breathing_exercises`
- `education_articles`
- `quiz_questions`
- `badges`
- `reminders`
- `user_consents`
- `ai_summaries`
- `reflection_embeddings`
- `analytics_events_safe`

Vorteile:

- sehr passend fuer strukturierte Challenge- und Journal-Daten
- gute Auswertbarkeit fuer Fortschritt
- spaetere Aehnlichkeitssuche direkt in der Datenbank moeglich

Nachteile:

- Freitexte und sensible Reflexionen brauchen zusaetzliche Verschluesselungsstrategie
- Datenmodell muss von Anfang an ethisch und datenschutzfreundlich gestaltet werden

Kosten:

- in Supabase enthalten
- Kosten steigen mit Datenvolumen, Compute und Storage

Entwicklungsaufwand:

- mittel

Skalierbarkeit:

- hoch fuer die erwarteten MVP- und Growth-Anforderungen

### Hosting

Empfehlung:

- Mobile App: App Store und Google Play
- Backend: Supabase EU-Region
- optionale Marketing-Website oder Admin-Oberflaeche: Vercel

Vorteile:

- klare Trennung zwischen App, Backend und optionaler Web-Praesenz
- EU-Region ist fuer Datenschutz sinnvoll
- Vercel bietet sehr schnelle Deployments fuer Web/Admin

Nachteile:

- mehrere Plattformen muessen verwaltet werden
- Vercel ist fuer den MVP-Core nicht zwingend notwendig

Kosten:

- Vercel Hobby gratis
- Vercel Pro laut Pricing 20 USD pro Monat
- Supabase produktiv voraussichtlich ab ca. 25 USD pro Monat

Entwicklungsaufwand:

- niedrig

Skalierbarkeit:

- gut

### Authentifizierung

Empfehlung: Supabase Auth mit anonymem Einstieg, Magic Link oder OAuth und optionaler lokaler PIN/Biometrie.

Vorteile:

- niedrige Einstiegshuerde
- Nutzerinnen und Nutzer muessen nicht sofort ein Konto anlegen
- spaetere Synchronisierung ueber Account moeglich
- PIN/Biometrie schuetzt Tagebuchinhalte auf dem Geraet

Nachteile:

- Migration von anonymem Nutzer zu registriertem Account muss sauber geloest werden
- Account-Recovery muss datenschutzfreundlich gestaltet werden

Kosten:

- in Supabase enthalten
- Supabase Free/Pro hat grosszuegige MAU-Kontingente

Entwicklungsaufwand:

- niedrig bis mittel

Skalierbarkeit:

- gut

### KI-Komponenten

Empfehlung: KI erst ab Version 2, nicht als zwingender MVP-Bestandteil.

Sinnvolle KI-Funktionen:

- Zusammenfassung langer Reflexionen
- Erkennung wiederkehrender Muster
- Formulierung selbstfreundlicher Rueckblicke
- semantische Suche nach aehnlichen vergangenen Erfolgen
- Vorschlaege fuer naechste passende Challenges

Nicht empfohlene KI-Funktionen fuer den Start:

- therapeutische Beratung
- Diagnose
- Bewertung, ob jemand "gut" oder "schlecht" reflektiert hat
- offene Chatbot-Therapie

Technische Umsetzung:

- OpenAI API fuer kontrollierte Zusammenfassungen und Formulierungen
- Embeddings fuer aehnliche Situationen
- pgvector in Supabase fuer semantische Suche
- serverseitige Prompts in Supabase Edge Functions
- strikte Token- und Kostenlimits pro Nutzer

Vorteile:

- sehr starke Personalisierung moeglich
- persoenliche Erfolgserinnerungen werden deutlich wertvoller
- Reflexionen koennen niedrigschwelliger verarbeitet werden

Nachteile:

- Datenschutz- und Consent-Anforderungen steigen
- KI kann unpassend formulieren
- Kosten steigen mit Nutzung
- fachliche Guardrails sind notwendig

Kosten:

- OpenAI GPT-5.4 mini liegt laut OpenAI Pricing bei 0,75 USD pro 1M Input Tokens und 4,50 USD pro 1M Output Tokens
- fuer fruehe Nutzung grob 20 bis 200 USD pro Monat bei ca. 1.000 aktiven Nutzerinnen und Nutzern, je nach Umfang

Entwicklungsaufwand:

- mittel

Skalierbarkeit:

- gut, wenn KI asynchron, budgetiert und optional eingesetzt wird

### Deployment

Empfehlung:

- EAS Build fuer App-Builds
- EAS Update fuer kleinere App-Updates
- Supabase CLI fuer Datenbankmigrationen
- GitHub Actions fuer Tests, Linting und Migrationschecks

Vorteile:

- schneller Release-Prozess
- reproduzierbare Builds
- gute Teamfaehigkeit
- niedriger Ops-Aufwand

Nachteile:

- initiale CI/CD-Einrichtung braucht Sorgfalt
- App-Store-Releases bleiben langsamer als Web-Deployments

Kosten:

- anfangs gering
- Expo Free/Starter je nach Buildbedarf

Entwicklungsaufwand:

- niedrig bis mittel

Skalierbarkeit:

- gut

## 3. APIs und Datenquellen

Flowa benoetigt im MVP keine externen Inhaltsdatenquellen. Challenges, Education, Atemuebungen und Affirmationen sollten kuratiert und fachlich geprueft werden. Externe APIs werden vor allem fuer Infrastruktur, Push, Analytics, Fehlertracking, KI und spaeter Payments benoetigt.

### API-Bewertung nach Funktion

| Funktion | Benoetigte API | Anbieter | Beste Wahl | Kostenmodell | Free Tier | Integrationsaufwand | Risiken |
|---|---|---|---|---|---|---|---|
| Nutzerkonten | Auth API | Supabase, Firebase Auth, Clerk | Supabase Auth | in Supabase enthalten | grosszuegig fuer Start | niedrig | Account-Migration anonym zu registriert |
| Datenhaltung | Datenbank API | Supabase, Firebase, Neon | Supabase Postgres | Free/Pro/Usage | Free fuer MVP | niedrig bis mittel | RLS-Fehler, sensible Daten |
| Push-Erinnerungen | Push API | Expo Push, FCM, OneSignal | Expo Push + FCM/APNs | Expo/EAS, FCM ohne Kosten | ja | mittel | Erinnerungen duerfen keinen Druck erzeugen |
| Analytics | Product Analytics | PostHog, Amplitude, Firebase Analytics | PostHog EU Cloud | nutzungsbasiert | 1M Events/Monat laut PostHog | niedrig | keine Freitexte tracken |
| Error Tracking | Crash Reporting | Sentry, Firebase Crashlytics, PostHog | Sentry | Free/Team | Free fuer Start | niedrig | PII-Scrubbing noetig |
| KI-Zusammenfassung | LLM API | OpenAI, Anthropic, Google | OpenAI | Token-basiert | kein klassischer Free Tier | mittel | Halluzination, sensible Daten |
| Aehnlichkeitssuche | Embeddings + Vector DB | OpenAI + pgvector, Pinecone, Weaviate | OpenAI Embeddings + Supabase pgvector | Token/DB-Nutzung | gering fuer Start | mittel | falsche Aehnlichkeiten |
| Payments App | In-App Purchase API | RevenueCat, eigene StoreKit/Play Billing Integration | RevenueCat | bis Schwelle kostenlos, danach umsatzbasiert | ja | mittel | App-Store-Regeln |
| Web Payments | Payment API | Stripe, Paddle | Stripe | Transaktionsgebuehr | keine Fixkosten | mittel | steuerliche/regionale Anforderungen |
| Content Management | CMS API | Sanity, Strapi, Supabase Tables | Supabase Admin-Tabellen im Start | in Supabase enthalten | ja | niedrig | redaktionelle Workflows begrenzt |

### Priorisierung

#### APIs fuer MVP

1. Supabase Auth
2. Supabase Postgres
3. Expo Push Notifications
4. Firebase Cloud Messaging fuer Android Push
5. Apple Push Notification Service fuer iOS Push
6. PostHog EU Cloud fuer datensparsame Produktmetriken
7. Sentry fuer Crash/Error Tracking

Begruendung:

Diese APIs decken Nutzerkonten, Speicherung, Reminder, Stabilitaet und Produktlernen ab. Sie sind noetig, um den beschriebenen Kernloop produktnah zu testen.

#### APIs fuer Version 2

1. OpenAI API fuer Reflexionszusammenfassungen
2. OpenAI Embeddings fuer aehnliche Situationen
3. Supabase pgvector fuer semantische Suche
4. RevenueCat fuer Premium-Funktionen
5. Feature Flags ueber PostHog oder Supabase

Begruendung:

Version 2 fokussiert Personalisierung, intelligente Erfolgserinnerungen und Monetarisierung. KI sollte erst integriert werden, wenn der menschlich-kuratierte Kernloop funktioniert.

#### APIs fuer spaetere Skalierung

1. Moderationstools fuer Community
2. Customer Support Tool
3. Data Warehouse oder Reverse ETL
4. CRM/E-Mail Lifecycle Tool
5. Therapeutinnen-Portal mit rollenbasierter Freigabe

Begruendung:

Diese APIs werden erst relevant, wenn Flowa groessere Nutzergruppen, Premiumangebote, Fachpersonen oder Community-Funktionen bedient.

## 4. Systemarchitektur

### High-Level-Architektur

```text
[Expo React Native App]
  - Onboarding
  - Challenges
  - Vorher-/Nachher-Reflexion
  - Erfolgstagebuch
  - Atemuebungen
  - Affirmationen
  - Education
  - Fortschritt
  - lokale PIN/Biometrie
  - Offline Cache
        |
        v
[Supabase Auth + API]
  - anonyme Nutzer
  - Magic Link/OAuth
  - Row Level Security
  - Edge Functions
        |
        v
[Postgres Datenbank]
  - profiles
  - onboarding_answers
  - challenges
  - challenge_runs
  - reflections
  - journal_entries
  - affirmations
  - education_articles
  - reminders
  - badges
  - user_consents
  - ai_summaries
  - embeddings
        |
        +--> [Recommendation Engine]
        |     MVP: regelbasiert
        |     V2: regelbasiert + Embeddings
        |
        +--> [Kostenberechnungs-Engine]
        |     KI-Budget
        |     Premium-Limits
        |     API-Usage
        |
        +--> [Personalisierung]
        |     Ziele
        |     Angstniveau
        |     Challenge-Verlauf
        |     bevorzugte Tonalitaet
        |
        +--> [Analytics]
              PostHog Events ohne sensible Freitexte

[Externe Services]
  - OpenAI API
  - Expo Push / FCM / APNs
  - Sentry
  - RevenueCat
  - Stripe optional
```

### Frontend

Das Frontend ist eine Expo React Native App. Es bildet den gesamten Kernloop ab:

- Tageschallenge anzeigen
- Challenge vorbereiten
- Atemuebung anbieten
- Durchfuehrung begleiten
- Nachreflexion erfassen
- Erfolg speichern
- Fortschritt zeigen

Besonders wichtig:

- ruhige, wuerdevolle Sprache
- keine harten Fehlermeldungen bei nicht erledigten Challenges
- stabile Offline-Nutzung
- schneller Zugriff auf Atemanker und Tagebuch
- lokale Sperre fuer sensible Bereiche

### Backend

Das Backend liegt in Supabase und uebernimmt:

- Authentifizierung
- Autorisierung ueber Row Level Security
- Speicherung strukturierter Daten
- serverseitige KI-Aufrufe
- Reminder-Planung
- Export und Loeschung
- Kosten- und Nutzungslimits

### Suchlogik

MVP:

- Filter nach Challenge-Level
- Filter nach Situation, z.B. Telefonieren, Smalltalk, Beruf, Schule
- Filter nach Ziel aus Onboarding
- Ausschluss zu schwerer Challenges
- Wiederholung bereits versuchter Challenges als positiver Fortschritt

Version 2:

- semantische Suche nach aehnlichen Reflexionen
- Erkennung aehnlicher Situationen
- Erinnerungen an fruehere Erfolge bei hoher Anspannung

### Recommendation Engine

MVP-Regel:

Eine Challenge wird empfohlen, wenn:

- sie zum aktuellen Ziel passt
- sie maximal eine Schwierigkeit ueber dem zuletzt bewaeltigten Niveau liegt
- die Person aehnliche Situationen nicht zu haeufig abgebrochen hat
- sie mit der bevorzugten Unterstuetzungsart kompatibel ist
- sie keinen harten Streak-Druck erzeugt

Version 2:

- Embeddings fuer semantisch aehnliche Situationen
- KI-formulierte, aber stark begrenzte Erfolgserinnerungen
- Safety-Filter fuer Tonalitaet

### Kostenberechnungs-Engine

Die Kostenberechnungs-Engine ist vor allem fuer KI und Premium wichtig.

Sie sollte speichern:

- KI-Aufrufe pro Nutzer und Monat
- Tokenverbrauch
- genutzte Premium-Funktionen
- offene Budgets
- Rate Limits

Regel:

KI darf nie unkontrolliert bei jeder App-Interaktion laufen. Sie sollte nur bei explizitem Mehrwert eingesetzt werden, z.B. fuer Zusammenfassungen oder Erfolgserinnerungen.

### Personalisierung

Personalisierung basiert auf:

- Onboarding-Zielen
- schwierigen Sprechsituationen
- Angstniveau
- gewaehlter Tonalitaet: ruhig, direkt, motivierend, sanft
- Challenge-Verlauf
- Reflexionsmustern
- bevorzugten Affirmationen

Wichtig:

Personalisierung darf nicht bewertend wirken. Die App sollte nicht sagen: "Du bist nicht mutig genug", sondern: "Heute koennte ein kleinerer Schritt besser passen."

### Nutzerkonten

Empfohlenes Modell:

- anonymer Start
- lokale Nutzung moeglich
- optionaler Account fuer Sync und Backup
- spaetere Migration von anonymem Profil zu registriertem Konto
- Export- und Loeschfunktion
- lokale PIN/Biometrie fuer Tagebuch

### Analytics

Analytics muessen streng datensparsam sein.

Erlaubte Events:

- Challenge gestartet
- Challenge versucht
- Reflexion abgeschlossen
- Atemuebung gestartet
- Artikel gelesen
- Reminder aktiviert
- Onboarding abgeschlossen

Nicht tracken:

- Freitexte aus Tagebuch oder Reflexionen
- genaue persoenliche Inhalte
- Audioaufnahmen
- sensible Diagnosedaten

## 5. MVP-Planung

### Must Have

Diese Funktionen sind zwingend notwendig, weil ohne sie der Kernnutzen von Flowa nicht entsteht.

| Funktion | Begruendung |
|---|---|
| Onboarding mit Zielauswahl | Personalisierung beginnt mit Zielen, schwierigen Situationen und gewuenschter Unterstuetzung |
| Challenge-Bibliothek | Challenges sind der Kern des Produkts |
| Challenge-Ablauf mit Vorher-/Nachher-Reflexion | Der wichtigste Trainingsloop |
| Anspannungsskala | Macht Fortschritt sichtbar und ermoeglicht spaetere Erfolgserinnerungen |
| Erfolgstagebuch | Zentrales Gegenmittel gegen negative Selbstwahrnehmung |
| einfache Atemuebungen | Akute Regulation vor Sprechsituationen |
| Affirmationen | Aufbau selbstfreundlicher innerer Saetze |
| erste Education-Artikel | Verstaendnis fuer Angst, Vermeidung und Selbstakzeptanz |
| Fortschrittsuebersicht | Langfristige Motivation ohne Leistungsdruck |
| Datenschutz-Basics | Vertrauen ist bei persoenlichen Reflexionen zwingend |
| Export- und Loeschfunktion | Produktplan fordert Datenschutz und Kontrolle |

### Should Have

Diese Funktionen haben hohen Mehrwert, koennen aber nach dem ersten MVP folgen.

| Funktion | Begruendung |
|---|---|
| Level und Abzeichen | Motiviert, muss aber sensibel umgesetzt werden |
| Wochenziele | Foerdert Routine ohne taeglichen Druck |
| persoenliche Erinnerungen | Staerkt langfristige Begleitung |
| Quizfragen | Erhoeht Lernwirkung im Education-Bereich |
| Favoriten fuer Affirmationen | Verbessert Personalisierung |
| einfache aehnliche Erfolgserinnerungen | Sehr wertvoll, aber Datenbasis muss erst entstehen |

### Nice To Have

Diese Funktionen sind fuer spaetere Versionen geeignet.

| Funktion | Begruendung |
|---|---|
| Videos | hoeherer Produktionsaufwand |
| Audio-Meditationen | wertvoll, aber Inhalte muessen professionell produziert werden |
| KI-gestuetzte Reflexionszusammenfassungen | Datenschutz und Guardrails notwendig |
| adaptive Challenge-Empfehlungen | braucht Nutzungsdaten |
| Community | hohes Moderations- und Schutzrisiko |
| Therapeutinnen-Modus | eigenes Rollen- und Freigabemodell noetig |
| Stimmuebungen | fachlich sensibel, Gefahr falscher Heilversprechen |

## 6. Technische Risiken und Gegenmassnahmen

### API-Abhaengigkeiten

Risiko:

- OpenAI, Push-Anbieter, Supabase oder Analytics-Anbieter koennen Preise, Limits oder Verfuegbarkeit aendern.

Gegenmassnahmen:

- KI ueber eigene Backend-Abstraktion kapseln
- Recommendation Engine im MVP regelbasiert halten
- Push nicht als kritische Kernfunktion behandeln
- Datenmodell portabel in Postgres halten
- regelmaessige Exporte und Backups

### Kostenrisiken

Risiko:

- KI-Kosten koennen bei haeufigen Reflexionszusammenfassungen steigen.
- Analytics und Logging koennen bei vielen Events teuer werden.

Gegenmassnahmen:

- KI nur nach Opt-in und bei klarem Mehrwert
- monatliches KI-Budget pro Nutzer
- Tokenlimits pro Anfrage
- Caching von KI-Zusammenfassungen
- keine automatische KI bei jedem Tagebucheintrag
- Event-Tracking sparsam halten

### Datenschutz

Risiko:

- Flowa speichert sehr persoenliche Reflexionen, Angstwerte und Tagebucheintraege.

Gegenmassnahmen:

- Supabase Row Level Security fuer alle nutzerbezogenen Tabellen
- lokale PIN/Biometrie fuer Tagebuch
- keine Freitexte in Analytics oder Crash Logs
- Export- und Loeschfunktion
- klare Consent-Verwaltung fuer KI
- Verschluesselung sensibler Freitexte pruefen
- EU-Region fuer Backend und Analytics bevorzugen

### Skalierung

Risiko:

- Bei wachsender Nutzung koennen Datenbankabfragen, Push-Jobs und KI-Aufrufe langsam oder teuer werden.

Gegenmassnahmen:

- Indizes auf `user_id`, `created_at`, `challenge_id`, `difficulty`
- paginierte Tagebuchansichten
- asynchrone Jobs fuer Embeddings und Zusammenfassungen
- Rate Limits fuer KI
- Supabase Compute bei Bedarf skalieren

### Datenqualitaet

Risiko:

- Challenges oder Education-Inhalte koennten fachlich unpassend, beschämend oder zu pauschal sein.

Gegenmassnahmen:

- Inhalte durch Fachpersonen pruefen lassen
- Feedback von 3 bis 5 stotternden Personen bereits vor MVP-Finalisierung
- Tonalitaets-Review als eigener QA-Schritt
- keine Formulierungen wie "besiegen", "versagt" oder "endlich fluessig"

### Performance

Risiko:

- App wird traege, wenn Inhalte, Journal und Empfehlungen immer remote geladen werden.

Gegenmassnahmen:

- statische Inhalte lokal cachen
- Offline-Modus fuer Challenges und Tagebuchentwuerfe
- kleine API-Payloads
- serverseitige Pagination
- Hintergrund-Sync

## 7. Umsetzungs-Roadmap

### Phase 1: Hackathon MVP

Zeitrahmen: 3 bis 5 Tage

Ziele:

- Kernloop beweisen
- Feedbackfaehigen Prototyp erstellen
- keine komplexe KI
- keine Community
- keine Payments

Funktionen:

- Onboarding light
- 20 bis 30 Challenges
- Challenge-Auswahl
- Vorbereitung mit Anspannungsskala
- Nachreflexion
- Erfolgstagebuch
- 5 Atemuebungen
- 5 Education-Artikel
- einfache Fortschrittsanzeige
- lokale Speicherung oder Supabase-Basis

Technologien:

- Expo React Native
- TypeScript
- Supabase Free
- lokale Datenhaltung fuer schnellen Prototyp optional

Geschaetzter Aufwand:

- 1 Product/Design Tag
- 2 bis 4 Engineering Tage
- 1 Content/Review Tag

### Phase 2: Erste produktive Version

Zeitrahmen: 6 bis 10 Wochen

Ziele:

- produktionsreife App fuer erste Nutzerinnen und Nutzer
- Datenschutz und Vertrauen herstellen
- echte Nutzung ueber mehrere Wochen messen
- fachlich gepruefte Inhalte bereitstellen

Funktionen:

- vollstaendiges Onboarding
- Supabase Auth mit anonymem Start
- Challenge-System
- Reflexion und Tagebuch
- Atemuebungen und Affirmationen
- Education-Bereich
- Fortschrittsuebersicht
- sanfte Reminder
- Export und Loeschung
- lokale PIN/Biometrie
- Analytics ohne sensible Inhalte
- Crash/Error Tracking

Technologien:

- Expo React Native
- Supabase Pro
- PostHog EU Cloud
- Sentry
- Expo Push/FCM/APNs
- GitHub Actions

Geschaetzter Aufwand:

- 1 bis 2 Wochen Produktdesign und UX
- 4 bis 6 Wochen Entwicklung
- 1 bis 2 Wochen QA, Datenschutz, Beta-Test und App-Store-Vorbereitung

### Phase 3: Skalierung

Zeitrahmen: 3 bis 6 Monate nach MVP-Learnings

Ziele:

- Personalisierung vertiefen
- KI sicher integrieren
- Monetarisierung testen
- moegliche Fachpersonen- oder Community-Strategie validieren

Funktionen:

- KI-gestuetzte Reflexionszusammenfassungen
- intelligente Erfolgserinnerungen
- semantische Aehnlichkeitssuche
- adaptive Challenge-Pfade
- Premium-Funktionen via RevenueCat
- Content-Admin-Oberflaeche
- Therapeutinnen-Pilot
- Community nur nach Moderationskonzept

Technologien:

- OpenAI API
- pgvector
- Supabase Edge Functions
- RevenueCat
- Feature Flags
- optional Vercel fuer Admin

Geschaetzter Aufwand:

- 8 bis 16 Wochen je nach Umfang
- Community und Therapeutinnen-Modus separat planen

## 8. Finale Empfehlung

### Empfohlener Tech Stack

Flowa sollte als Expo React Native App mit TypeScript entwickelt werden. Das Backend sollte Supabase mit Postgres, Auth, Row Level Security, Edge Functions und spaeter pgvector verwenden. Fuer Analytics wird PostHog EU Cloud empfohlen, fuer Fehlertracking Sentry. Push Notifications laufen ueber Expo Push mit FCM und APNs. KI wird ab Version 2 ueber die OpenAI API integriert.

### Empfohlene APIs

MVP:

- Supabase Auth
- Supabase Postgres
- Supabase Edge Functions
- Expo Push Notifications
- Firebase Cloud Messaging
- Apple Push Notification Service
- PostHog EU Cloud
- Sentry

Version 2:

- OpenAI API
- OpenAI Embeddings
- Supabase pgvector
- RevenueCat

Spaeter:

- Stripe fuer Web-Zahlungen
- Moderations- und Supporttools
- optional CMS oder Admin-Portal

### Empfohlene Architektur

Die Architektur sollte zuerst einfach bleiben:

- Mobile App als primaerer Client
- Supabase als zentrales Backend
- Postgres als Wahrheit fuer Nutzer-, Challenge- und Fortschrittsdaten
- regelbasierte Recommendation Engine im MVP
- KI nur serverseitig, optional und budgetiert
- Analytics strikt ohne sensible Inhalte

Diese Architektur ist schnell umsetzbar, kostenguenstig und laesst langfristige Skalierung zu.

### Geschaetzte Infrastrukturkosten

Hackathon MVP:

- 0 bis 25 USD pro Monat

Erste produktive Version:

- Supabase Pro: ca. 25 USD pro Monat
- Vercel optional: 0 bis 20 USD pro Monat
- Expo Starter optional: 19 USD pro Monat
- Sentry optional Team: ca. 26 USD pro Monat, Free fuer Start moeglich
- PostHog: wahrscheinlich 0 USD im Free Tier bei frueher Nutzung

Realistische Summe fuer fruehe Produktion:

- ca. 50 bis 150 USD pro Monat
- plus Apple Developer Account und Google Play Developer Account

### Geschaetzte API-Kosten

MVP:

- KI: 0 USD, wenn noch nicht integriert
- Push: 0 USD bis sehr gering
- Analytics: 0 USD bei Free-Tier-Nutzung

Version 2 mit KI:

- grob 20 bis 200 USD pro Monat bei ca. 1.000 aktiven Nutzerinnen und Nutzern
- stark abhaengig von Reflexionslaenge, Anzahl KI-Funktionen und Tokenlimits

### Groesste Risiken

1. Datenschutz und Vertrauen
2. fachliche Qualitaet der Inhalte
3. falscher Ton durch Gamification oder KI
4. Challenges erzeugen Druck statt Mut
5. KI-Kosten und KI-Fehlformulierungen
6. unklare Positionierung zwischen Selbsthilfe, Therapieergaenzung und Wellness-App

### Wichtigste Erfolgsfaktoren

1. Ein wuerdevoller, sicherer Challenge-Reflexions-Loop
2. Kleine Schritte statt Leistungsdruck
3. Fachlich gepruefte Inhalte
4. Sehr gute Datenschutzkommunikation
5. Sichtbarer Fortschritt ohne Bewertung
6. Sanfte Personalisierung
7. KI nur dort, wo sie echten emotionalen Mehrwert schafft

## Schlussentscheidung

Flowa sollte nicht als KI-Chatbot und nicht als klassische Therapie-App starten. Die staerkste Produktposition ist:

> Ein mobiler, wuerdevoller Alltagsbegleiter fuer stotternde Menschen, der Mut, Selbstakzeptanz und positive Erfahrungen trainiert.

Der MVP sollte deshalb radikal auf den Kern fokussieren:

- Challenge vorbereiten
- mutigen Schritt versuchen
- danach reflektieren
- Erfolg speichern
- spaeter daran erinnert werden

Wenn dieser Loop fuer Betroffene spuerbar hilfreich ist, kann Flowa darauf sehr gut skalieren: mit mehr Inhalten, intelligenteren Empfehlungen, KI-gestuetzten Rueckblicken, Premium-Funktionen und spaeter moeglicher Zusammenarbeit mit Fachpersonen.

## Quellen fuer Preis- und Plattformannahmen

- Supabase Pricing/Billing Docs: https://supabase.com/docs/guides/platform/billing-on-supabase
- Vercel Pricing: https://vercel.com/pricing
- Expo Pricing: https://expo.dev/pricing
- OpenAI API Pricing: https://openai.com/api/pricing/
- Firebase Cloud Messaging: https://firebase.google.com/products/cloud-messaging
- PostHog Pricing: https://posthog.com/pricing
- Sentry Pricing: https://sentry.io/pricing/
- RevenueCat Pricing: https://www.revenuecat.com/pricing/
- Stripe Pricing: https://stripe.com/pricing
