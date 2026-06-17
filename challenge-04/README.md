# Challenge-04 - Northwind Metrics Collector

`metrics-collector` is a small internal Node.js CLI used inside Northwind to gather build
metrics and ship them to the company dashboard. It is not published publicly - it runs on
developer laptops and on CI runners, both of which hold cloud credentials and npm tokens.

The team is about to roll it out more widely and wants a review of its **dependency setup**
before they do.

## What's in here

- `app/package.json` - the project's dependencies
- `app/.npmrc` - the npm registry configuration
- `app/src/index.js` - the CLI itself (small, not the point of the review)
- `simulate/` - a local harness to run things (⚠️ **spoiler** - see note below)

## Expected behavior

- `npm install` should pull only the dependencies the team intended.
- Internal packages (the `@northwind/*` ones) should come from Northwind's **private**
  registry, never from the public internet.
- Installing the project on a laptop or CI runner should not expose cloud credentials or
  npm tokens to anyone outside the company.

## Goal

Review the dependency setup (`app/package.json` and `app/.npmrc`). Decide whether someone
**outside** Northwind could get their own code to run on a developer's machine or a CI
runner just by the team running `npm install`.

No real npm registry is required - this is a source-code review exercise.

> ⚠️ **Spoiler warning:** `simulate/` and `solution.md` contain the answer. `simulate/` is
> a Dockerized harness that stands in for "what the attacker published" and shows the
> impact. Try to find the issue by reading `app/package.json` and `app/.npmrc` first; only
> open `simulate/` once you want to confirm your finding.
