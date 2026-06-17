#!/usr/bin/env bash
#
# Local harness for Challenge-04.
#
# It emulates what happens when the team runs `npm install` and one of the
# @northwind/* packages resolves to an attacker's package on PUBLIC npm instead
# of Northwind's private registry (dependency confusion).
#
# It is NOT a real registry. We stand in the attacker's package directly so you
# can watch its postinstall hook fire and harvest secrets.
#
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"; [ -n "${SINK_PID:-}" ] && kill "$SINK_PID" 2>/dev/null || true' EXIT

# Sandbox HOME into the throwaway dir so the lab NEVER touches the real
# ~/.npmrc or ~/.aws/credentials when run as a bare script outside Docker.
export HOME="$WORK/home"
mkdir -p "$HOME"

echo "==> seeding the kind of secrets found on a dev laptop / CI runner"
export NPM_TOKEN="npm_FAKEtoken_do_not_use_AAAA1111"
export AWS_ACCESS_KEY_ID="AKIAFAKE000DONOTUSE"
export EXFIL_SINK="http://127.0.0.1:9999/collect"
mkdir -p "$HOME/.aws"
printf '[default]\naws_access_key_id=AKIAFAKE000DONOTUSE\naws_secret_access_key=FAKE/secret/key/do-not-use\n' > "$HOME/.aws/credentials"
printf '//registry.npmjs.org/:_authToken=npm_FAKEtoken_do_not_use_AAAA1111\n' > "$HOME/.npmrc"

echo "==> starting local exfil listener on 127.0.0.1:9999 (stands in for attacker server)"
node "$HERE/sink.js" &
SINK_PID=$!
sleep 1

echo "==> setting up a throwaway project and running 'npm install <attacker package>'"
echo "    (in reality npm would fetch this from public npm because @northwind"
echo "     is not pinned to the private registry in .npmrc)"
cp -R "$HERE/attacker-package" "$WORK/attacker-package"
( cd "$WORK" \
  && npm init -y >/dev/null 2>&1 \
  && npm install ./attacker-package --no-audit --no-fund 2>&1 | grep -v '^npm warn' || true )

echo ""
echo "==> what the attacker's listener received:"
cat "$HERE/.sink-output" 2>/dev/null || echo "(nothing captured)"
echo ""
echo "==> If you see the fake NPM_TOKEN / AWS keys / .npmrc above, an outside"
echo "    package just ran code on this machine during 'npm install'."
