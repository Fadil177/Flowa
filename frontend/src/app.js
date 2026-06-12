const API_URL = localStorage.getItem("flowa_api_url") || "http://localhost:4000/api";
const STATIC_DB_KEY = "flowa_static_db";

const state = {
  view: "dashboard",
  auth: localStorage.getItem("flowa_auth") !== "false",
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
  ["dashboard", "⌂", "Heute"],
  ["challenges", "☷", "Challenges"],
  ["learn", "≋", "Meditation"],
  ["journal", "☁", "Mindset"],
  ["progress", "◌", "Fortschritt"],
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

function challengeIcon(challenge) {
  const tags = `${challenge.path} ${challenge.tags.join(" ")}`.toLowerCase();
  if (tags.includes("telefon")) return "📞";
  if (tags.includes("einkaufen")) return "🛒";
  if (tags.includes("gruppe") || tags.includes("beruf") || tags.includes("schule")) return "❓";
  if (tags.includes("selbst")) return "🌟";
  return "💬";
}

function difficultyName(value) {
  if (value <= 1) return "Leicht";
  if (value === 2) return "Einfach";
  if (value === 3) return "Mittel";
  if (value === 4) return "Mutig";
  return "Stark";
}

function xpFor(challenge) {
  return 10 + challenge.difficulty * 15;
}

function dateTrail() {
  const today = new Date();
  return Array.from({ length: 14 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (13 - index));
    return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit" }).format(date);
  });
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
    <main class="phone-shell">
      <section class="content">
        ${renderView()}
      </section>
      <nav class="bottom-nav" aria-label="Hauptnavigation">
        ${navItems
          .map(
            ([id, icon, label]) => `
              <button class="tab-button ${state.view === id ? "active" : ""}" data-view="${id}">
                <span class="nav-icon">${icon}</span>
                <span>${label}</span>
              </button>
            `,
          )
          .join("")}
      </nav>
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
    <header class="home-header">
      <h1>Flowa</h1>
      <div class="header-actions">
        <span class="streak-pill">♨ ${progress.challengesAttempted} Tage</span>
        <button class="icon-button" data-view="progress" aria-label="Einstellungen">⚙</button>
      </div>
    </header>

    <section class="hero-card">
      <p class="hero-eyebrow">Flowas Affirmation für dich</p>
      <div class="speech-bubble">„${escapeHtml(affirmations[new Date().getDate() % affirmations.length])}”</div>
      <div class="aquarium">
        <div class="fish-scene" aria-label="Flowa Fisch">
          <img src="assets/flowa-fish.svg" alt="">
        </div>
        <span class="plant plant-a"></span>
        <span class="plant plant-b"></span>
        <span class="bubble bubble-a"></span>
        <span class="bubble bubble-b"></span>
      </div>
    </section>

    <section class="level-card">
      <div class="level-number">${Math.max(1, Math.min(9, Math.ceil(progress.couragePoints / 2) || 4))}</div>
      <div class="level-copy">
        <span>Mut-Level:</span>
        <strong>${progress.couragePoints > 8 ? "Flow-Meister" : "Fortgeschrittener"}</strong>
        <small>Nächstes: Flow-Meister</small>
      </div>
      <div class="xp-badge">⚡<strong>${Math.max(770, progress.couragePoints * 55)}</strong><span>XP</span></div>
      <div class="level-bar"><span style="width:${Math.min(92, 46 + progress.couragePoints * 4)}%"></span></div>
    </section>

    <section class="today-section">
      <h2>✧ Heutige Challenge</h2>
      ${challengeCard(dailyChallenge, true)}
    </section>
  `;
}

function metric(label, value) {
  return `<section class="metric"><strong>${value}</strong><span>${label}</span></section>`;
}

function renderChallenges() {
  const completedIds = new Set(state.data.runs.filter((run) => run.status === "completed").map((run) => run.challengeId));
  return `
    <header class="page-header">
      <h1>Challenges</h1>
      <p>${state.data.challenges.length} Challenges · ${completedIds.size} erledigt</p>
    </header>
    <section class="history-card">
      <p>Verlauf</p>
      <div class="date-strip">
        ${dateTrail().map((date) => `<button>${date}</button>`).join("")}
      </div>
      <small>Noch keine Challenge heute erledigt.</small>
    </section>
    <div class="filter-row">
      ${["Alle", "Level 1", "Level 2", "Level 3", "Level 4", "Level 5"].map((label, index) => `<button class="${index === 0 ? "active" : ""}">${label}</button>`).join("")}
    </div>
    <div class="challenge-list">
      ${state.data.challenges.map(challengeCard).join("")}
    </div>
  `;
}

function challengeCard(challenge, isHero = false) {
  const completed = state.data.runs.some((run) => run.challengeId === challenge.id && run.status === "completed");
  return `
    <button class="challenge-card ${isHero ? "featured" : ""}" data-start-challenge="${challenge.id}">
      <span class="challenge-icon">${challengeIcon(challenge)}</span>
      <span class="challenge-body">
        <span class="challenge-heading">
          <strong>${escapeHtml(challenge.title)}</strong>
          ${completed ? `<em>✓</em>` : ""}
        </span>
        <p>${escapeHtml(challenge.prompt)}</p>
        <span class="challenge-meta">
          ${difficultyDots(challenge.difficulty)}
          <span>${difficultyName(challenge.difficulty)}</span>
          <b>+${xpFor(challenge)} XP</b>
        </span>
      </span>
      <span class="chevron">›</span>
    </button>
  `;
}

function renderJournal() {
  return `
    <header class="page-header">
      <h1>Mindset</h1>
      <p>Sanfte Gedanken, Wissen und dein Erfolgstagebuch.</p>
    </header>
    <section class="mindset-card">
      <span>💭</span>
      <h2>Ich darf stottern und trotzdem sprechen.</h2>
      <p>Mut bedeutet nicht, keine Angst zu haben. Mut bedeutet, freundlich mit dir weiterzugehen.</p>
    </section>
    <section class="section-stack">
      <div class="section-title">
        <h2>Wissen</h2>
      </div>
      ${state.data.articles.slice(0, 3).map(articleCard).join("")}
    </section>
    <section class="section-stack">
      <div class="section-title">
        <h2>Erfolgstagebuch</h2>
        <button class="tiny-button" data-new-journal>Eintrag</button>
      </div>
      ${state.data.journal.length ? state.data.journal.map(journalEntry).join("") : `<div class="empty">Noch keine Einträge. Nach deiner ersten Reflexion erscheint hier dein Erfolg.</div>`}
    </section>
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
    <header class="page-header calm">
      <h1>Ruhe & Fokus</h1>
      <p>Dein persönlicher Safe Space – atme, komme an, bereite dich vor.</p>
    </header>
    <section class="calm-intro">
      <p>Kein Druck. Keine Bewertung.</p>
      <p>Diese Übungen sind für Momente, in denen du zur Ruhe kommen möchtest – vor Gesprächen, bei innerer Anspannung oder einfach so.</p>
    </section>
    <div class="segmented">
      <button class="active">🧘 Meditation</button>
      <button>🌬️ Atemübungen</button>
    </div>
    <section class="section-stack">
      <div class="section-title calm-title">
        <span>🧘</span>
        <div>
          <h2>Geführte Meditationen</h2>
          <p>Kurze, fokussierte Übungen – speziell für Momente vor oder nach Gesprächen.</p>
        </div>
      </div>
      ${[
        { icon: "🧘", title: "Body Scan", text: "Eine vollständige geführte Körperreise – du entspannst jeden Teil deines Körpers von Kopf bis Fuß.", tags: ["Entspannung", "Körper"] },
        { icon: "🌲", title: "Wald Meditation", text: "Eine tiefe Visualisierung – du gehst durch einen ruhigen Wald und wirst innerlich stiller mit jedem Schritt.", tags: ["Visualisierung", "Natur"] },
        { icon: "💬", title: "Ruhe vor Gesprächen", text: "Bereite dich innerlich auf ein Gespräch, Telefonat oder Meeting vor – mit tiefer Ruhe und echtem Selbstvertrauen.", tags: ["Vorbereitung", "Sprechen"] },
      ].map(meditationCard).join("")}
      ${state.data.breathingExercises.map(breathingCard).join("")}
    </section>
  `;
}

function renderProgress() {
  const { progress } = state.data;
  return `
    <header class="page-header">
      <h1>Fortschritt</h1>
    </header>
    <section class="progress-level">
      <div class="streak-pill">♨ ${progress.challengesAttempted} Tage</div>
      <div class="level-card compact">
        <div class="level-number">4</div>
        <div class="level-copy">
          <span>Mut-Level:</span>
          <strong>Fortgeschrittener</strong>
          <small>Nächstes: Flow-Meister</small>
        </div>
        <div class="xp-badge">⚡<strong>${Math.max(770, progress.couragePoints * 55)}</strong><span>XP</span></div>
      </div>
    </section>
    <section class="stats-grid">
      ${metric("Challenges erledigt", progress.challengesCompleted || 13)}
      ${metric("Gesamt XP", Math.max(770, progress.couragePoints * 55))}
      ${metric("Ø Anspannung vorher", progress.averageBefore || "5.6")}
      ${metric("Ø Anspannung nachher", progress.averageAfter || "4.8")}
    </section>
    <section class="insight-card">
      <p>Deine Anspannung sinkt im Durchschnitt um ${progress.tensionDelta || "0.8"} Punkte!</p>
      <strong>Das zeigt: Je öfter du dich traust, desto leichter wird es.</strong>
    </section>
    <a class="calendar-link" href="#">
      <span>Kalender</span>
      <strong>Challenge-Verlauf ansehen</strong>
    </a>
    <section class="week-card">
      <h2>Letzte 7 Tage</h2>
      <div class="week-row">${["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => `<span>${day}</span>`).join("")}</div>
    </section>
    <section class="section-stack">
      <div class="section-title"><h2>Datenschutz</h2></div>
      <p class="fine-print">Deine Reflexionen bleiben in diesem MVP lokal in der Backend-JSON-Datei oder in der GitHub-Pages-Demo im Browser-Speicher.</p>
      <button class="tiny-button" data-export>Export</button>
      <button class="tiny-button danger" data-delete>Persönliche Daten löschen</button>
    </section>
  `;
}

function articleCard(article) {
  return `
    <article class="info-card">
      <span class="challenge-icon">📘</span>
      <div>
        <h3>${escapeHtml(article.title)}</h3>
        <p>${escapeHtml(article.body)}</p>
        <div class="tag-row"><span>${article.minutes} Min.</span><span>${article.category}</span></div>
      </div>
    </article>
  `;
}

function meditationCard(item) {
  return `
    <article class="info-card">
      <span class="challenge-icon">${item.icon}</span>
      <div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.text)}</p>
        <div class="tag-row"><span>5 Min.</span>${item.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
      </div>
    </article>
  `;
}

function breathingCard(exercise) {
  return `
    <button class="info-card as-button" data-open-breathing="${exercise.id}">
      <span class="challenge-icon">🌬️</span>
      <span>
        <strong>${escapeHtml(exercise.title)}</strong>
        <p>${exercise.steps.slice(0, 2).map(escapeHtml).join(" ")}</p>
        <span class="tag-row"><span>${exercise.duration}</span><span>Atemübung</span></span>
      </span>
    </button>
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
