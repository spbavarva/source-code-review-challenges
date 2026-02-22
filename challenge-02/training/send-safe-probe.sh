#!/usr/bin/env bash
set -euo pipefail

HOST="${1:-http://localhost:3000}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FIELD0="$(tr -d '\n' < "${SCRIPT_DIR}/field0-safe.json")"

curl -i -X POST "${HOST}/api/training/rsc-probe" \
  -H "Next-Action: x" \
  -H "X-Nextjs-Request-Id: demo-training" \
  -H "X-Nextjs-Html-Request-Id: demo-training-html" \
  --form-string "0=${FIELD0}" \
  --form-string "1=\"\$@0\"" \
  --form-string "2=[]"
