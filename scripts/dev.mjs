import { spawn } from "node:child_process";

const processes = [
  ["backend", "node", ["backend/src/server.mjs"]],
  ["frontend", "node", ["frontend/server.mjs"]],
];

const children = processes.map(([name, command, args]) => {
  const child = spawn(command, args, {
    stdio: ["ignore", "pipe", "pipe"],
    shell: process.platform === "win32",
  });

  child.stdout.on("data", (chunk) => {
    process.stdout.write(`[${name}] ${chunk}`);
  });

  child.stderr.on("data", (chunk) => {
    process.stderr.write(`[${name}] ${chunk}`);
  });

  child.on("exit", (code) => {
    if (code && !shuttingDown) {
      process.exitCode = code;
      shutdown();
    }
  });

  return child;
});

let shuttingDown = false;

function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) child.kill();
  }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
