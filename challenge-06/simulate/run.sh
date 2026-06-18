#!/usr/bin/env bash
#
# Local harness for Challenge-06.
#
# Starts the gatekeeper API, then runs forge.sh to send a hand-forged admin
# token. Because the service never verifies the signature, the forged token is
# accepted and the caller gets admin access.
#
# Everything stays on localhost.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"

# Sandbox HOME so the lab never touches real dotfiles when run as a bare script.
export HOME="$(mktemp -d)"

OUT="$ROOT/app/out"
if [ ! -e "$OUT/Server.class" ]; then
  echo "==> compiling the gatekeeper service"
  mkdir -p "$OUT"
  javac -d "$OUT" "$ROOT/app/src"/*.java
fi

echo "==> starting the gatekeeper service on 127.0.0.1:8080"
java -cp "$OUT" Server >/dev/null 2>&1 &
SRV_PID=$!
trap 'kill "$SRV_PID" 2>/dev/null || true' EXIT
sleep 1

bash "$HERE/forge.sh"
