#!/usr/bin/env node
'use strict';

/*
 * Tiny stand-in for the "attacker's server". Listens on localhost, records the
 * first thing it receives to .sink-output, and exits. Lab use only.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '.sink-output');

const server = http.createServer((req, res) => {
  let body = '';
  req.on('data', (chunk) => (body += chunk));
  req.on('end', () => {
    let pretty = body;
    try {
      pretty = JSON.stringify(JSON.parse(body), null, 2);
    } catch (_) {}
    fs.writeFileSync(OUT, pretty);
    res.writeHead(200);
    res.end('ok');
    server.close();
    process.exit(0);
  });
});

server.listen(9999, '127.0.0.1');
