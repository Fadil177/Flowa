import assert from "node:assert/strict";
import { server } from "../src/server.mjs";

const port = 4099;
const baseUrl = `http://localhost:${port}/api`;

await new Promise((resolve) => server.listen(port, resolve));

try {
  const health = await fetch(`${baseUrl}/health`).then((res) => res.json());
  assert.equal(health.ok, true);

  const bootstrap = await fetch(`${baseUrl}/bootstrap`).then((res) => res.json());
  assert.ok(bootstrap.challenges.length >= 5);
  assert.ok(bootstrap.articles.length >= 3);

  const run = await fetch(`${baseUrl}/challenge-runs`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      challengeId: bootstrap.dailyChallenge.id,
      beforeTension: 6,
      mood: "nervoes",
      expectation: "Es koennte holprig werden.",
      smallSuccess: "Ich versuche es.",
    }),
  }).then((res) => res.json());
  assert.ok(run.id);

  const completed = await fetch(`${baseUrl}/challenge-runs/${run.id}/complete`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      didIt: true,
      afterTension: 3,
      learned: "Es war weniger schlimm als gedacht.",
      wentWell: "Ich bin geblieben.",
    }),
  }).then((res) => res.json());
  assert.equal(completed.status, "completed");

  const after = await fetch(`${baseUrl}/bootstrap`).then((res) => res.json());
  assert.ok(after.progress.challengesAttempted >= 1);
  console.log("Smoke test passed");
} finally {
  await new Promise((resolve) => server.close(resolve));
}
