const API_URL = localStorage.getItem("flowa_api_url") || "http://localhost:4000/api";
const STATIC_DB_KEY = "flowa_static_db";

const state = {
  view: "dashboard",
  auth: localStorage.getItem("flowa_auth") === "true",
  data: null,
  selectedChallenge: null,
  modal: null,
  draft: {},
  onboarding: {
    mainGoal: "",
    situations: [],
    anxiety: 6,
    tone: "sanft",
    reminders: "weekly",
  },
  breathingTimer: null,
};

const app = document.querySelector("#app");

const navItems = [
  ["dashboard", "Heute"],
  ["challenges", "Mut"],
  ["journal", "Tagebuch"],
  ["learn", "Lernen"],
  ["progress", "Fortschritt"],
];

const goals = [
  "Ich moechte weniger vermeiden.",
  "Ich moechte mich selbst mehr akzeptieren.",
  "Ich moechte mutiger telefonieren.",
  "Ich moechte im Alltag mehr sprechen.",
  "Ich moechte besser mit Angst umgehen.",
  "Ich moechte meine Erfolge sehen.",
];

const situations = ["Smalltalk", "Telefonieren", "Einkaufen", "Gruppe", "Beruf", "Schule", "Fremde Menschen", "Name sagen"];

async function api(path, options = {}) {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      headers: { "content-type": "application/json", ...(options.headers || {}) },
      ...options,
    });

    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "API request failed");
    return payload;
  } catch (error) {
    return staticApi(path, options);
  }
}

async function loadStaticDb() {
  const stored = localStorage.getItem(STATIC_DB_KEY);
  if (stored) return JSON.parse(stored);

  const response = await fetch("data/seed.json");
  const seed = await response.json();
  localStorage.setItem(STATIC_DB_KEY, JSON.stringify(seed));
  return seed;
}

function saveStaticDb(db) {
  localStorage.setItem(STATIC_DB_KEY, JSON.stringify(db));
}

function staticId() {
  return crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function progressFor(db) {
  const completed = db.runs.filter((run) => run.status === "completed");
  const attempted = db.runs.filter((run) => run.status === "completed" || run.status === "tried");
  const totalBefore = completed.reduce((sum, run) => sum + Number(run.beforeTension || 0), 0);
  const totalAfter = completed.reduce((sum, run) => sum + Number(run.afterTension || 0), 0);
  const averageBefore = completed.length ? Math.round((totalBefore / completed.length) * 10) / 10 : 0;
  const averageAfter = completed.length ? Math.round((totalAfter / completed.length) * 10) / 10 : 0;

  return {
    challengesCompleted: completed.length,
    challengesAttempted: attempted.length,
    journalEntries: db.journal.length,
    couragePoints: attempted.length + db.journal.length,
    reflectionPoints: db.runs.filter((run) => run.reflection?.learned || run.reflection?.wentWell).length,
    averageBefore,
    averageAfter,
    tensionDelta: averageBefore && averageAfter ? Math.round((averageBefore - averageAfter) * 10) / 10 : 0,
    badges: [
      completed.length >= 1 ? "Erster mutiger Schritt" : null,
      db.journal.length >= 3 ? "Reflexionsroutine" : null,
      attempted.length >= 5 ? "Alltagsmut" : null,
    ].filter(Boolean),
  };
}

function dailyChallengeFor(db) {
  const attemptedIds = new Set(db.runs.map((run) => run.challengeId));
  return (
    db.challenges.find((challenge) => challenge.difficulty <= 2 && !attemptedIds.has(challenge.id)) ||
    db.challenges.find((challenge) => challenge.difficulty <= 3) ||
    db.challenges[0]
  );
}

async function readJsonBody(options) {
  return options.body ? JSON.parse(options.body) : {};
}

async function staticApi(path, options = {}) {
  const method = options.method || "GET";
  const db = await loadStaticDb();

  if (method === "GET" && path === "/bootstrap") {
    return {
      profile: db.profile,
      dailyChallenge: dailyChallengeFor(db),
      challenges: db.challenges,
      breathingExercises: db.breathingExercises,
      affirmations: db.affirmations,
      articles: db.articles,
      quiz: db.quiz,
      journal: db.journal,
      runs: db.runs,
      progress: progressFor(db),
    };
  }

  if (method === "PUT" && path === "/profile") {
    const body = await readJsonBody(options);
    db.profile = { ...db.profile, ...body, onboarded: true };
    saveStaticDb(db);
    return db.profile;
  }

  if (method === "POST" && path === "/challenge-runs") {
    const body = await readJsonBody(options);
    const challenge = db.challenges.find((item) => item.id === body.challengeId);
    const run = {
      id: staticId(),
      challengeId: challenge.id,
      challengeTitle: challenge.title,
      status: "started",
      beforeTension: Number(body.beforeTension || 1),
      mood: body.mood || "unsicher",
      expectation: body.expectation || "",
      smallSuccess: body.smallSuccess || "",
      reminder: body.reminder || challenge.successHint,
      createdAt: new Date().toISOString(),
    };
    db.runs.unshift(run);
    saveStaticDb(db);
    return run;
  }

  const completeMatch = path.match(/^\/challenge-runs\/([^/]+)\/complete$/);
  if (method === "PUT" && completeMatch) {
    const body = await readJsonBody(options);
    const run = db.runs.find((item) => item.id === completeMatch[1]);
    run.status = body.didIt ? "completed" : "tried";
    run.afterTension = Number(body.afterTension || run.beforeTension);
    run.reflection = {
      blocker: body.blocker || "",
      comparison: body.comparison || "",
      learned: body.learned || "",
      wentWell: body.wentWell || "",
      difficult: body.difficult || "",
      nextTime: body.nextTime || "",
    };
    run.completedAt = new Date().toISOString();
    db.journal.unshift({
      id: staticId(),
      runId: run.id,
      challengeTitle: run.challengeTitle,
      beforeTension: run.beforeTension,
      afterTension: run.afterTension,
      note: run.reflection.learned || run.reflection.wentWell || "Ich habe ehrlich reflektiert.",
      createdAt: run.completedAt,
    });
    saveStaticDb(db);
    return run;
  }

  if (method === "POST" && path === "/journal") {
    const body = await readJsonBody(options);
    const entry = {
      id: staticId(),
      challengeTitle: body.challengeTitle || "Freier Eintrag",
      beforeTension: Number(body.beforeTension || 0),
      afterTension: Number(body.afterTension || 0),
      note: body.note || "",
      createdAt: new Date().toISOString(),
    };
    db.journal.unshift(entry);
    saveStaticDb(db);
    return entry;
  }

  if (method === "GET" && path === "/export") return db;

  if (method === "DELETE" && path === "/personal-data") {
    db.runs = [];
    db.journal = [];
    db.profile = { ...db.profile, onboarded: false };
    saveStaticDb(db);
    return { ok: true };
  }

  throw new Error("Demo route not found");
}

async function load() {
  state.data = await api("/bootstrap");
  if (!state.data.profile.onboarded && state.auth) state.view = "onboarding";
  render();
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatDate(value) {
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function difficultyDots(value) {
  return `<div class="difficulty" aria-label="Schwierigkeit ${value} von 5">${[1, 2, 3, 4, 5]
    .map((step) => `<span class="dot ${step <= value ? "filled" : ""}"></span>`)
    .join("")}</div>`;
}

function render() {
  if (!state.auth) {
    renderLogin();
    return;
  }

  if (!state.data) {
    app.innerHTML = `<main class="login-page"><section class="login-card"><img class="logo" src="assets/flowa-logo.svg" alt="Flowa logo"><p>Flowa wird geladen...</p></section></main>`;
    return;
  }

  if (state.view === "onboarding") {
    renderOnboarding();
    return;
  }

  app.innerHTML = `
    <main class="main-layout">
      <aside class="sidebar">
        <div class="brand">
          <img src="assets/flowa-logo.svg" alt="Flowa logo">
          <span>Flowa</span>
        </div>
        <nav class="nav" aria-label="Hauptnavigation">
          ${navItems
            .map(
              ([id, label]) => `
                <button class="tab-button ${state.view === id ? "active" : ""}" data-view="${id}">
                  <span>${label.slice(0, 1)}</span>
                  <span>${label}</span>
                </button>
              `,
            )
            .join("")}
        </nav>
      </aside>
      <section class="content">
        ${renderView()}
      </section>
    </main>
    ${state.modal ? renderModal() : ""}
  `;

  bindCommonEvents();
}

function renderLogin() {
  app.innerHTML = `
    <main class="login-page">
      <section class="login-card">
        <img class="logo" src="assets/flowa-logo.svg" alt="Flowa logo">
        <h1>Welcome to Flowa<br>(Prototyp)</h1>
        <p>Sign in to continue</p>
        <button class="google-button" data-login>
          <span class="google-mark">G</span>
          <span>Continue with Google</span>
        </button>
        <div class="divider">or</div>
        <label class="field">
          <span>Email</span>
          <input class="input" value="demo@flowa.local" autocomplete="email">
        </label>
        <label class="field">
          <span>Password</span>
          <input class="input" type="password" value="flowa-demo" autocomplete="current-password">
        </label>
        <button class="primary" data-login>Sign in</button>
        <p><button class="ghost" type="button">Forgot password?</button></p>
        <p class="muted">Need an account? <button class="link-button" data-login>Sign up</button></p>
      </section>
    </main>
  `;

  app.querySelectorAll("[data-login]").forEach((button) => {
    button.addEventListener("click", async () => {
      localStorage.setItem("flowa_auth", "true");
      state.auth = true;
      await load();
    });
  });
}

function renderOnboarding() {
  const selected = state.onboarding;
  app.innerHTML = `
    <main class="onboarding-page">
      <section class="onboarding-panel">
        <div class="row">
          <img class="logo" src="assets/flowa-logo.svg" alt="Flowa logo">
          <div>
            <h1>Ein sanfter Start</h1>
            <p class="muted">Flowa passt Challenges an das an, was sich heute machbar anfuehlt.</p>
          </div>
        </div>
        <label class="field">
          <span>Was ist gerade dein wichtigstes Ziel?</span>
          <select class="select" data-onboarding="mainGoal">
            <option value="">Bitte waehlen</option>
            ${goals.map((goal) => `<option ${selected.mainGoal === goal ? "selected" : ""}>${goal}</option>`).join("")}
          </select>
        </label>
        <div class="field">
          <span>Welche Situationen sind schwierig?</span>
          <div class="option-grid">
            ${situations
              .map(
                (item) => `
                  <button class="option ${selected.situations.includes(item) ? "selected" : ""}" data-situation="${item}">
                    ${item}
                  </button>
                `,
              )
              .join("")}
          </div>
        </div>
        <label class="field">
          <span>Wie stark ist die Angst im Alltag?</span>
          <div class="range-wrap">
            <span>1</span>
            <input type="range" min="1" max="10" value="${selected.anxiety}" data-onboarding="anxiety">
            <strong>${selected.anxiety}</strong>
          </div>
        </label>
        <label class="field">
          <span>Welche Art Unterstuetzung fuehlt sich gut an?</span>
          <select class="select" data-onboarding="tone">
            ${["sanft", "ruhig", "direkt", "motivierend"].map((tone) => `<option ${selected.tone === tone ? "selected" : ""}>${tone}</option>`).join("")}
          </select>
        </label>
        <button class="primary" type="button" onclick="window.flowaSaveOnboarding()" data-save-onboarding>Flowa starten</button>
        <div class="safe-scroll-space" aria-hidden="true"></div>
      </section>
    </main>
  `;

  app.querySelectorAll("[data-situation]").forEach((button) => {
    button.addEventListener("click", () => {
      const value = button.dataset.situation;
      selected.situations = selected.situations.includes(value)
        ? selected.situations.filter((item) => item !== value)
        : [...selected.situations, value];
      renderOnboarding();
    });
  });

  app.querySelectorAll("[data-onboarding]").forEach((input) => {
    input.addEventListener("input", () => {
      const key = input.dataset.onboarding;
      selected[key] = key === "anxiety" ? Number(input.value) : input.value;
      if (key === "anxiety") renderOnboarding();
    });
  });

  app.querySelector("[data-save-onboarding]").addEventListener("pointerup", saveOnboarding);
  app.querySelector("[data-save-onboarding]").addEventListener("click", saveOnboarding);
}

async function saveOnboarding() {
  await api("/profile", {
    method: "PUT",
    body: JSON.stringify({
      ...state.onboarding,
      mainGoal: state.onboarding.mainGoal || goals[3],
      situations: state.onboarding.situations.length ? state.onboarding.situations : ["Smalltalk"],
    }),
  });
  state.view = "dashboard";
  await load();
}

window.flowaSaveOnboarding = saveOnboarding;

function renderView() {
  const renderers = {
    dashboard: renderDashboard,
    challenges: renderChallenges,
    journal: renderJournal,
    learn: renderLearn,
    progress: renderProgress,
  };
  return renderers[state.view]();
}

function renderDashboard() {
  const { dailyChallenge, progress, affirmations, breathingExercises } = state.data;
  return `
    <header class="topbar">
      <div>
        <h2>Heute ist ein kleiner Schritt genug.</h2>
        <p class="muted">${escapeHtml(state.data.profile.mainGoal)}</p>
      </div>
      <button class="secondary" data-open-breathing="${breathingExercises[0].id}">Atemanker</button>
    </header>
    <div class="grid two">
      <section class="panel soft">
        <div class="section-title">
          <h3>Tageschallenge</h3>
          <span class="badge">${dailyChallenge.level}</span>
        </div>
        <h3>${escapeHtml(dailyChallenge.title)}</h3>
        <p>${escapeHtml(dailyChallenge.prompt)}</p>
        <div class="chips">${dailyChallenge.tags.map((tag) => `<span class="chip">${tag}</span>`).join("")}</div>
        <p>${difficultyDots(dailyChallenge.difficulty)}</p>
        <button class="primary" data-start-challenge="${dailyChallenge.id}">Challenge vorbereiten</button>
      </section>
      <section class="panel coral">
        <div class="section-title">
          <h3>Heutiger Satz</h3>
          <span class="badge">Affirmation</span>
        </div>
        <p>${escapeHtml(affirmations[new Date().getDate() % affirmations.length])}</p>
        <button class="secondary" data-view="challenges">Mut-Bibliothek ansehen</button>
      </section>
    </div>
    <div class="grid three">
      ${metric("Versucht", progress.challengesAttempted)}
      ${metric("Tagebuch", progress.journalEntries)}
      ${metric("Mutpunkte", progress.couragePoints)}
    </div>
    <section class="panel amber">
      <div class="section-title">
        <h3>Letzter Fortschritt</h3>
        <button class="ghost" data-view="journal">Alle Eintraege</button>
      </div>
      ${state.data.journal.length ? journalEntry(state.data.journal[0]) : `<div class="empty">Noch kein Eintrag. Ein ehrlicher Versuch reicht fuer den Anfang.</div>`}
    </section>
  `;
}

function metric(label, value) {
  return `<section class="panel metric"><span class="muted">${label}</span><strong>${value}</strong></section>`;
}

function renderChallenges() {
  return `
    <header class="topbar">
      <div>
        <h2>Mut-Bibliothek</h2>
        <p class="muted">Waehle eine Situation, die ein kleines bisschen machbar wirkt.</p>
      </div>
    </header>
    <div class="challenge-list">
      ${state.data.challenges.map(challengeCard).join("")}
    </div>
  `;
}

function challengeCard(challenge) {
  return `
    <article class="card challenge-card">
      <div>
        <div class="section-title">
          <h3>${escapeHtml(challenge.title)}</h3>
          <span class="badge">${challenge.level}</span>
        </div>
        <p>${escapeHtml(challenge.prompt)}</p>
        <div class="chips">
          <span class="chip">${challenge.path}</span>
          <span class="chip">${challenge.duration}</span>
          ${challenge.tags.map((tag) => `<span class="chip">${tag}</span>`).join("")}
        </div>
      </div>
      <div>
        ${difficultyDots(challenge.difficulty)}
        <p><button class="secondary" data-start-challenge="${challenge.id}">Starten</button></p>
      </div>
    </article>
  `;
}

function renderJournal() {
  return `
    <header class="topbar">
      <div>
        <h2>Erfolgstagebuch</h2>
        <p class="muted">Hier sammelst du Gegenbeweise zu harten Gedanken.</p>
      </div>
      <button class="secondary" data-new-journal>Eintrag</button>
    </header>
    <div class="journal-list">
      ${state.data.journal.length ? state.data.journal.map(journalEntry).join("") : `<div class="empty">Noch keine Eintraege. Nach deiner ersten Reflexion erscheint hier dein Erfolg.</div>`}
    </div>
  `;
}

function journalEntry(entry) {
  return `
    <article class="card">
      <div class="section-title">
        <h3>${escapeHtml(entry.challengeTitle)}</h3>
        <span class="badge">${formatDate(entry.createdAt)}</span>
      </div>
      <p>${escapeHtml(entry.note)}</p>
      <div class="chips">
        <span class="chip">Vorher ${entry.beforeTension || "-"} / 10</span>
        <span class="chip">Nachher ${entry.afterTension || "-"} / 10</span>
      </div>
    </article>
  `;
}

function renderLearn() {
  return `
    <header class="topbar">
      <div>
        <h2>Lernen und Atmen</h2>
        <p class="muted">Kurze Impulse fuer Angst, Vermeidung und Selbstakzeptanz.</p>
      </div>
    </header>
    <div class="grid two">
      <section class="panel soft">
        <div class="section-title"><h3>Atemuebungen</h3></div>
        <div class="article-list">
          ${state.data.breathingExercises
            .map(
              (exercise) => `
                <article class="card">
                  <h3>${escapeHtml(exercise.title)}</h3>
                  <p>${exercise.duration}</p>
                  <button class="secondary" data-open-breathing="${exercise.id}">Oeffnen</button>
                </article>
              `,
            )
            .join("")}
        </div>
      </section>
      <section class="panel">
        <div class="section-title"><h3>Artikel</h3></div>
        <div class="article-list">
          ${state.data.articles
            .map(
              (article) => `
                <article class="card">
                  <div class="section-title">
                    <h3>${escapeHtml(article.title)}</h3>
                    <span class="badge">${article.minutes} min</span>
                  </div>
                  <p>${escapeHtml(article.body)}</p>
                  <span class="chip">${article.category}</span>
                </article>
              `,
            )
            .join("")}
        </div>
      </section>
    </div>
  `;
}

function renderProgress() {
  const { progress } = state.data;
  return `
    <header class="topbar">
      <div>
        <h2>Fortschritt ohne Druck</h2>
        <p class="muted">Gemessen wird Mut, Reflexion und Lernen, nicht fluessiges Sprechen.</p>
      </div>
      <button class="secondary" data-export>Export</button>
    </header>
    <div class="grid three">
      ${metric("Versuchte Challenges", progress.challengesAttempted)}
      ${metric("Reflexionspunkte", progress.reflectionPoints)}
      ${metric("Anspannung weniger", progress.tensionDelta)}
    </div>
    <section class="panel soft">
      <div class="section-title"><h3>Abzeichen</h3></div>
      <div class="chips">
        ${progress.badges.length ? progress.badges.map((badge) => `<span class="chip">${badge}</span>`).join("") : `<span class="chip">Erster Schritt wartet</span>`}
      </div>
    </section>
    <section class="panel coral">
      <div class="section-title"><h3>Datenschutz</h3></div>
      <p>Deine Reflexionen bleiben in diesem MVP lokal in der Backend-JSON-Datei oder in der GitHub-Pages-Demo im Browser-Speicher. Export und Loeschung sind vorbereitet.</p>
      <button class="secondary" data-delete>Persoenliche Daten loeschen</button>
    </section>
  `;
}

function renderModal() {
  if (state.modal === "challenge-prep") return renderChallengePrepModal();
  if (state.modal === "challenge-reflect") return renderChallengeReflectModal();
  if (state.modal === "breathing") return renderBreathingModal();
  if (state.modal === "journal") return renderJournalModal();
  return "";
}

function renderChallengePrepModal() {
  const challenge = state.selectedChallenge;
  return `
    <div class="modal-backdrop">
      <section class="modal-card">
        <div class="section-title">
          <h3>${escapeHtml(challenge.title)}</h3>
          <button class="ghost" data-close-modal>Schliessen</button>
        </div>
        <p>${escapeHtml(challenge.successHint)}</p>
        <label class="field">
          <span>Wie angespannt bist du gerade?</span>
          <div class="range-wrap">
            <span>1</span>
            <input type="range" min="1" max="10" value="${state.draft.beforeTension || 5}" data-draft="beforeTension">
            <strong>${state.draft.beforeTension || 5}</strong>
          </div>
        </label>
        <label class="field">
          <span>Wie fuehlst du dich?</span>
          <select class="select" data-draft="mood">
            ${["ruhig", "nervoes", "aengstlich", "motiviert", "unsicher", "stolz", "ueberfordert"].map((mood) => `<option ${state.draft.mood === mood ? "selected" : ""}>${mood}</option>`).join("")}
          </select>
        </label>
        <label class="field">
          <span>Was erwartest du?</span>
          <textarea class="textarea" data-draft="expectation">${escapeHtml(state.draft.expectation || "")}</textarea>
        </label>
        <label class="field">
          <span>Was waere heute ein kleiner Erfolg?</span>
          <textarea class="textarea" data-draft="smallSuccess">${escapeHtml(state.draft.smallSuccess || "")}</textarea>
        </label>
        <label class="field">
          <span>Welche Erinnerung nimmst du mit?</span>
          <input class="input" data-draft="reminder" value="${escapeHtml(state.draft.reminder || challenge.successHint)}">
        </label>
        <div class="modal-actions">
          <button class="secondary" data-open-breathing="${state.data.breathingExercises[0].id}">Kurz atmen</button>
          <button class="primary" data-save-prep>Ich versuche es</button>
        </div>
      </section>
    </div>
  `;
}

function renderChallengeReflectModal() {
  return `
    <div class="modal-backdrop">
      <section class="modal-card">
        <div class="section-title">
          <h3>Nach der Challenge</h3>
          <button class="ghost" data-close-modal>Schliessen</button>
        </div>
        <label class="field">
          <span>Hast du die Challenge gemacht?</span>
          <select class="select" data-draft="didIt">
            <option value="true">Ja, ich habe sie versucht</option>
            <option value="false">Nein, aber ich moechte ehrlich hinschauen</option>
          </select>
        </label>
        <label class="field">
          <span>Wie angespannt bist du jetzt?</span>
          <div class="range-wrap">
            <span>1</span>
            <input type="range" min="1" max="10" value="${state.draft.afterTension || 4}" data-draft="afterTension">
            <strong>${state.draft.afterTension || 4}</strong>
          </div>
        </label>
        <label class="field">
          <span>Wie war es im Vergleich zu deiner Erwartung?</span>
          <textarea class="textarea" data-draft="comparison">${escapeHtml(state.draft.comparison || "")}</textarea>
        </label>
        <label class="field">
          <span>Was hast du gelernt?</span>
          <textarea class="textarea" data-draft="learned">${escapeHtml(state.draft.learned || "")}</textarea>
        </label>
        <label class="field">
          <span>Was lief gut?</span>
          <textarea class="textarea" data-draft="wentWell">${escapeHtml(state.draft.wentWell || "")}</textarea>
        </label>
        <label class="field">
          <span>Was wuerdest du beim naechsten Mal anders machen?</span>
          <textarea class="textarea" data-draft="nextTime">${escapeHtml(state.draft.nextTime || "")}</textarea>
        </label>
        <div class="modal-actions">
          <button class="primary" data-save-reflection>Erfolg speichern</button>
        </div>
      </section>
    </div>
  `;
}

function renderBreathingModal() {
  const exercise = state.selectedExercise;
  const progress = state.breathingTimer?.progress || 0;
  return `
    <div class="modal-backdrop">
      <section class="modal-card">
        <div class="section-title">
          <h3>${escapeHtml(exercise.title)}</h3>
          <button class="ghost" data-close-modal>Schliessen</button>
        </div>
        <div class="timer" style="--progress: ${progress}%">
          <div class="timer-inner">${progress ? `${Math.round(progress)}%` : "Bereit"}</div>
        </div>
        <ol>
          ${exercise.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
        </ol>
        <div class="modal-actions">
          <button class="secondary" data-start-breathing>Start</button>
        </div>
      </section>
    </div>
  `;
}

function renderJournalModal() {
  return `
    <div class="modal-backdrop">
      <section class="modal-card">
        <div class="section-title">
          <h3>Freier Tagebucheintrag</h3>
          <button class="ghost" data-close-modal>Schliessen</button>
        </div>
        <label class="field">
          <span>Titel oder Situation</span>
          <input class="input" data-draft="challengeTitle" value="${escapeHtml(state.draft.challengeTitle || "")}">
        </label>
        <label class="field">
          <span>Was moechtest du festhalten?</span>
          <textarea class="textarea" data-draft="note">${escapeHtml(state.draft.note || "")}</textarea>
        </label>
        <div class="modal-actions">
          <button class="primary" data-save-journal>Speichern</button>
        </div>
      </section>
    </div>
  `;
}

function bindCommonEvents() {
  app.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      state.view = button.dataset.view;
      state.modal = null;
      render();
    });
  });

  app.querySelectorAll("[data-start-challenge]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedChallenge = state.data.challenges.find((challenge) => challenge.id === button.dataset.startChallenge);
      state.draft = { beforeTension: 5, mood: "nervoes", reminder: state.selectedChallenge.successHint };
      state.modal = "challenge-prep";
      render();
    });
  });

  app.querySelectorAll("[data-open-breathing]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedExercise = state.data.breathingExercises.find((exercise) => exercise.id === button.dataset.openBreathing);
      state.modal = "breathing";
      render();
    });
  });

  app.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", () => {
      state.modal = null;
      state.breathingTimer = null;
      render();
    });
  });

  app.querySelectorAll("[data-draft]").forEach((input) => {
    input.addEventListener("input", () => {
      const key = input.dataset.draft;
      state.draft[key] = input.type === "range" ? Number(input.value) : input.value;
      if (input.type === "range") render();
    });
  });

  const savePrep = app.querySelector("[data-save-prep]");
  if (savePrep) {
    savePrep.addEventListener("click", async () => {
      const run = await api("/challenge-runs", {
        method: "POST",
        body: JSON.stringify({
          challengeId: state.selectedChallenge.id,
          ...state.draft,
        }),
      });
      state.draft = { runId: run.id, afterTension: Math.max(1, Number(run.beforeTension) - 2), didIt: "true" };
      state.modal = "challenge-reflect";
      render();
    });
  }

  const saveReflection = app.querySelector("[data-save-reflection]");
  if (saveReflection) {
    saveReflection.addEventListener("click", async () => {
      await api(`/challenge-runs/${state.draft.runId}/complete`, {
        method: "PUT",
        body: JSON.stringify({ ...state.draft, didIt: state.draft.didIt !== "false" }),
      });
      state.modal = null;
      state.view = "journal";
      await load();
    });
  }

  const newJournal = app.querySelector("[data-new-journal]");
  if (newJournal) {
    newJournal.addEventListener("click", () => {
      state.draft = {};
      state.modal = "journal";
      render();
    });
  }

  const saveJournal = app.querySelector("[data-save-journal]");
  if (saveJournal) {
    saveJournal.addEventListener("click", async () => {
      await api("/journal", {
        method: "POST",
        body: JSON.stringify(state.draft),
      });
      state.modal = null;
      await load();
    });
  }

  const startBreathing = app.querySelector("[data-start-breathing]");
  if (startBreathing) {
    startBreathing.addEventListener("click", () => {
      runBreathingTimer();
    });
  }

  const exportButton = app.querySelector("[data-export]");
  if (exportButton) {
    exportButton.addEventListener("click", async () => {
      const payload = await api("/export");
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "flowa-export.json";
      anchor.click();
      URL.revokeObjectURL(url);
    });
  }

  const deleteButton = app.querySelector("[data-delete]");
  if (deleteButton) {
    deleteButton.addEventListener("click", async () => {
      await api("/personal-data", { method: "DELETE" });
      state.view = "dashboard";
      await load();
    });
  }
}

function runBreathingTimer() {
  const startedAt = Date.now();
  const duration = 60000;
  state.breathingTimer = { progress: 0 };

  const tick = () => {
    if (!state.breathingTimer || state.modal !== "breathing") return;
    state.breathingTimer.progress = Math.min(100, ((Date.now() - startedAt) / duration) * 100);
    render();
    if (state.breathingTimer.progress < 100) {
      setTimeout(tick, 1000);
    }
  };

  tick();
}

load().catch((error) => {
  app.innerHTML = `
    <main class="login-page">
      <section class="login-card">
        <img class="logo" src="assets/flowa-logo.svg" alt="Flowa logo">
        <h1>Flowa Backend nicht erreichbar</h1>
        <p>${escapeHtml(error.message)}</p>
        <p class="muted">Starte das Projekt mit npm run dev.</p>
      </section>
    </main>
  `;
});
