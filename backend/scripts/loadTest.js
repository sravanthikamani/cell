/* eslint-disable no-console */
const target = process.env.LOAD_TEST_URL || "http://localhost:5000";
const endpoint = process.env.LOAD_TEST_PATH || "/api/catalog";
const concurrency = Math.max(1, Number(process.env.LOAD_TEST_CONCURRENCY || 10));
const durationSec = Math.max(5, Number(process.env.LOAD_TEST_DURATION || 20));
const timeoutMs = Math.max(1000, Number(process.env.LOAD_TEST_TIMEOUT_MS || 10000));

const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), durationSec * 1000);

let total = 0;
let ok = 0;
let failed = 0;
let totalMs = 0;
let minMs = Number.POSITIVE_INFINITY;
let maxMs = 0;

function nowMs() {
  return Number(process.hrtime.bigint()) / 1e6;
}

async function hit() {
  const url = `${target}${endpoint}`;
  const started = nowMs();
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "cache-control": "no-cache" },
    });
    const elapsed = nowMs() - started;
    total += 1;
    totalMs += elapsed;
    minMs = Math.min(minMs, elapsed);
    maxMs = Math.max(maxMs, elapsed);
    if (res.ok) ok += 1;
    else failed += 1;
  } catch {
    const elapsed = nowMs() - started;
    total += 1;
    totalMs += elapsed;
    minMs = Math.min(minMs, elapsed);
    maxMs = Math.max(maxMs, elapsed);
    failed += 1;
  }
}

async function worker() {
  while (!controller.signal.aborted) {
    await hit();
  }
}

async function run() {
  console.log(`Load test target: ${target}${endpoint}`);
  console.log(`Concurrency: ${concurrency}, Duration: ${durationSec}s`);
  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.allSettled(workers);
  clearTimeout(timer);

  const avg = total ? totalMs / total : 0;
  const rps = total / durationSec;
  console.log("----- Result -----");
  console.log(`Requests: ${total}`);
  console.log(`Success: ${ok}`);
  console.log(`Failed: ${failed}`);
  console.log(`RPS: ${rps.toFixed(2)}`);
  console.log(`Latency avg/min/max (ms): ${avg.toFixed(1)} / ${minMs.toFixed(1)} / ${maxMs.toFixed(1)}`);
}

run().catch((err) => {
  console.error("Load test failed:", err.message);
  process.exitCode = 1;
});
