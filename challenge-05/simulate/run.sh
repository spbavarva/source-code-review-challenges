#!/usr/bin/env bash
#
# Local harness for Challenge-05.
#
# Starts the vulnerable templater service, then runs exploit.py to upload a
# malicious YAML template. Because the service parses it with an unsafe loader,
# the command in payload.yml runs on the server during parsing.
#
# Everything stays on localhost.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP="$(cd "$HERE/../app" && pwd)"
WORK="$(mktemp -d)"

# Sandbox HOME into the throwaway dir so the lab never touches real dotfiles
# when run as a bare script outside Docker.
export HOME="$WORK/home"
mkdir -p "$HOME"
export TEMPLATE_DIR="$WORK/templates"

cleanup() {
  rm -rf "$WORK"
  rm -f /tmp/pwned.txt
  [ -n "${APP_PID:-}" ] && kill "$APP_PID" 2>/dev/null || true
}
trap cleanup EXIT

rm -f /tmp/pwned.txt

echo "==> starting the vulnerable templater service on 127.0.0.1:5000"
python3 "$APP/app.py" >/dev/null 2>&1 &
APP_PID=$!
sleep 2

python3 "$HERE/exploit.py"
