// netlify/functions/app-states.js
// Reads and writes application open/closed states using Netlify Blobs
// so every visitor sees the same state.

import { getStore } from "@netlify/blobs";

const BLOB_KEY = "chow_app_states";

// Default: all open
const DEFAULT_STATES = { Mod: true, Beta: true, Dev: true, "Content Creator": true };

export default async function handler(req) {
  const store = getStore("chow-admin");

  // ── GET: return current states ──
  if (req.method === "GET") {
    try {
      const raw = await store.get(BLOB_KEY, { type: "json" });
      return new Response(JSON.stringify(raw ?? DEFAULT_STATES), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-store",
        },
      });
    } catch {
      return new Response(JSON.stringify(DEFAULT_STATES), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
  }

  // ── POST: update states (requires password) ──
  if (req.method === "POST") {
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
    }

    // Password check  (keep this secret — set ADMIN_PASSWORD in Netlify env vars)
    const envPass = process.env.ADMIN_PASSWORD || "374239874623074623";
    if (body.password !== envPass) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    // Validate payload
    const validRoles = ["Mod", "Beta", "Dev", "Content Creator"];
    const newStates = {};
    for (const role of validRoles) {
      newStates[role] = body.states?.[role] !== false; // default true
    }

    await store.setJSON(BLOB_KEY, newStates);

    return new Response(JSON.stringify({ ok: true, states: newStates }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  // OPTIONS (CORS preflight)
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  return new Response("Method not allowed", { status: 405 });
}

export const config = { path: "/api/app-states" };
