exports.handler = async function(event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "374239874623074623";
  const ROLES = ["Mod", "Beta", "Dev", "Content Creator"];

  // Use Netlify's built-in key-value store (no package needed)
  const { NetlifyKV } = process.env.NETLIFY ? require("@netlify/functions") : {};
  
  // Simpler approach: use process.env to store state as a JSON env var
  // Actually use a free JSONBin as the backend instead
  const BIN_ID = process.env.JSONBIN_ID;
  const BIN_KEY = process.env.JSONBIN_KEY;

  const DEFAULT = { Mod: true, Beta: true, Dev: true, "Content Creator": true };

  if (!BIN_ID || !BIN_KEY) {
    // No bin configured yet, return defaults
    return { statusCode: 200, headers, body: JSON.stringify(DEFAULT) };
  }

  if (event.httpMethod === "GET") {
    try {
      const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
        headers: { "X-Master-Key": BIN_KEY }
      });
      const data = await res.json();
      return { statusCode: 200, headers, body: JSON.stringify(data.record) };
    } catch {
      return { statusCode: 200, headers, body: JSON.stringify(DEFAULT) };
    }
  }

  if (event.httpMethod === "POST") {
    let body;
    try { body = JSON.parse(event.body); } catch { return { statusCode: 400, headers, body: '{"error":"Bad JSON"}' }; }
    if (body.password !== ADMIN_PASSWORD) return { statusCode: 401, headers, body: '{"error":"Unauthorized"}' };

    const newStates = {};
    ROLES.forEach(r => { newStates[r] = body.states?.[r] !== false; });

    await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Master-Key": BIN_KEY },
      body: JSON.stringify(newStates)
    });

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, states: newStates }) };
  }

  return { statusCode: 405, headers, body: "Method not allowed" };
};
