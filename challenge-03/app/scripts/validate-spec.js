#!/usr/bin/env node
'use strict';

/**
 * Specstream OpenAPI spec validator
 *
 * Walks every *.json file under ./specs and performs some light structural
 * validation so we can give contributors quick feedback on their PRs
 *
 */

const fs = require('fs');
const path = require('path');

const SPECS_DIR = path.join(__dirname, '..', 'specs');

function listSpecFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.json'))
    .map((name) => path.join(dir, name));
}

function validateSpec(filePath) {
  const errors = [];
  let doc;

  try {
    doc = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    return [`not valid JSON: ${err.message}`];
  }

  if (typeof doc.openapi !== 'string') {
    errors.push('missing "openapi" version string');
  }

  if (!doc.info || typeof doc.info.title !== 'string') {
    errors.push('missing "info.title"');
  }

  if (!doc.paths || typeof doc.paths !== 'object') {
    errors.push('missing "paths" object');
  }

  return errors;
}

function main() {
  const files = listSpecFiles(SPECS_DIR);

  if (files.length === 0) {
    console.log('No specs found to validate.');
    return;
  }

  let failed = 0;

  for (const file of files) {
    const rel = path.relative(process.cwd(), file);
    const errors = validateSpec(file);

    if (errors.length === 0) {
      console.log(`PASS  ${rel}`);
    } else {
      failed += 1;
      console.log(`FAIL  ${rel}`);
      for (const error of errors) {
        console.log(`      - ${error}`);
      }
    }
  }

  if (failed > 0) {
    console.error(`\n${failed} spec(s) failed validation.`);
    process.exit(1);
  }

  console.log('\nAll specs valid.');
}

main();
