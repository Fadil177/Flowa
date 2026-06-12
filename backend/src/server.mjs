import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadDb, saveDb, updateDb } from "./store.mjs";

const port = Number(process.env.PORT || 4000);

function send(res, status, payload) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,PUT,DELETE,OPTIONS",
    "access-control-allow-headers": "content-type",
  });
  res.end(JSON.stringify(payload));
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf-8"));
}

function withProgress(db) {
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

function pickDailyChallenge(db) {
  const attemptedIds = new Set(db.runs.map((run) => run.challengeId));
  return (
    db.challenges.find((challenge) => challenge.difficulty <= 2 && !attemptedIds.has(challenge.id)) ||
    db.challenges.find((challenge) => challenge.difficulty <= 3) ||
    db.challenges[0]
  );
}

async function route(req, res) {
  if (req.method === "OPTIONS") {
    send(res, 204, {});
    return;
  }

  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  const path = url.pathname.replace(/^\/api/, "") || "/";

  try {
    if (req.method === "GET" && path === "/health") {
      send(res, 200, { ok: true, name: "flowa-backend" });
      return;
    }

    if (req.method === "GET" && path === "/bootstrap") {
      const db = await loadDb();
      send(res, 200, {
        profile: db.profile,
        dailyChallenge: pickDailyChallenge(db),
        challenges: db.challenges,
        breathingExercises: db.breathingExercises,
        affirmations: db.affirmations,
        articles: db.articles,
        quiz: db.quiz,
        journal: db.journal,
        runs: db.runs,
        progress: withProgress(db),
      });
      return;
    }

    if (req.method === "PUT" && path === "/profile") {
      const body = await readBody(req);
      const profile = await updateDb((db) => {
        db.profile = { ...db.profile, ...body, onboarded: true };
        return db.profile;
      });
      send(res, 200, profile);
      return;
    }

    if (req.method === "POST" && path === "/challenge-runs") {
      const body = await readBody(req);
      const run = await updateDb((db) => {
        const challenge = db.challenges.find((item) => item.id === body.challengeId);
        if (!challenge) throw new Error("Challenge not found");
        const nextRun = {
          id: randomUUID(),
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
        db.runs.unshift(nextRun);
        return nextRun;
      });
      send(res, 201, run);
      return;
    }

    const completeMatch = path.match(/^\/challenge-runs\/([^/]+)\/complete$/);
    if (req.method === "PUT" && completeMatch) {
      const body = await readBody(req);
      const run = await updateDb((db) => {
        const existing = db.runs.find((item) => item.id === completeMatch[1]);
        if (!existing) throw new Error("Run not found");
        existing.status = body.didIt ? "completed" : "tried";
        existing.afterTension = Number(body.afterTension || existing.beforeTension);
        existing.reflection = {
          blocker: body.blocker || "",
          comparison: body.comparison || "",
          learned: body.learned || "",
          wentWell: body.wentWell || "",
          difficult: body.difficult || "",
          nextTime: body.nextTime || "",
        };
        existing.completedAt = new Date().toISOString();
        db.journal.unshift({
          id: randomUUID(),
          runId: existing.id,
          challengeTitle: existing.challengeTitle,
          beforeTension: existing.beforeTension,
          afterTension: existing.afterTension,
          note: existing.reflection.learned || existing.reflection.wentWell || "Ich habe ehrlich reflektiert.",
          createdAt: existing.completedAt,
        });
        return existing;
      });
      send(res, 200, run);
      return;
    }

    if (req.method === "POST" && path === "/journal") {
      const body = await readBody(req);
      const entry = await updateDb((db) => {
        const nextEntry = {
          id: randomUUID(),
          challengeTitle: body.challengeTitle || "Freier Eintrag",
          beforeTension: Number(body.beforeTension || 0),
          afterTension: Number(body.afterTension || 0),
          note: body.note || "",
          createdAt: new Date().toISOString(),
        };
        db.journal.unshift(nextEntry);
        return nextEntry;
      });
      send(res, 201, entry);
      return;
    }

    if (req.method === "GET" && path === "/export") {
      const db = await loadDb();
      send(res, 200, db);
      return;
    }

    if (req.method === "DELETE" && path === "/personal-data") {
      const db = await loadDb();
      db.runs = [];
      db.journal = [];
      db.profile = { ...db.profile, onboarded: false };
      await saveDb(db);
      send(res, 200, { ok: true });
      return;
    }

    send(res, 404, { error: "Route not found" });
  } catch (error) {
    send(res, 400, { error: error.message || "Request failed" });
  }
}

export const server = createServer(route);

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  server.listen(port, () => {
    console.log(`Flowa backend running at http://localhost:${port}/api`);
  });
}
