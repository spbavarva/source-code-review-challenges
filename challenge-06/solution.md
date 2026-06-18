# Challenge-06 - Solution

The service reads the role out of a token but never checks the token's signature.
So anyone can make their own token, set `role` to `admin`, and be treated as an
admin. This is the same class of bug as the 2026 pac4j-jwt flaw (CVE-2026-29000,
CVSS 10.0), where forged tokens let attackers impersonate any user.

## The bug - JWT signature not verified

In `app/src/TokenService.java`, `parse` splits the token, decodes the payload,
and reads the claims:

```java
String[] parts = token.split("\\.");
String payloadJson = new String(
        Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
String subject = field(payloadJson, "sub");
String role = field(payloadJson, "role");
return new User(subject, role);
```

`parts[2]` is the signature, and it is never looked at. The class even has a
`sign` method (used by `issue`), so it looks security-aware, but `parse` never
calls it to verify the token. The signature is the only thing that proves the
server made the token, and it is ignored.

So the role is whatever the caller put in the payload. The payload is just
base64 - anyone can read it and rewrite it.

## The forged token

An attacker base64url-encodes their own payload and appends any signature:

```
header  = {"alg":"HS256","typ":"JWT"}
payload = {"sub":"mallory","role":"admin"}
token   = base64url(header).base64url(payload).anything
```

They never need the signing secret. `simulate/forge.sh` builds exactly this.

## Proof of concept

```bash
cd challenge-06
docker build -t gatekeeper-c06 -f simulate/Dockerfile .
docker run --rm gatekeeper-c06
```

The harness starts the API, then sends a token with `role: admin` and a fake
signature. You will see the server return the admin panel, even though no valid
signature was ever provided.

## The fix

1. **Verify the signature before trusting any claim.** Recompute the HMAC over
   `header.payload` with the secret and compare it (constant-time) to `parts[2]`;
   reject the token if it does not match.
2. **Pin the algorithm.** Decide `HS256` server-side. Never trust the `alg` in
   the header, and never accept `alg: none`.
3. **Prefer a vetted JWT library** that verifies by default, and keep it updated.

## References

- CVE-2026-29000 - pac4j-jwt authentication bypass (forge tokens, impersonate
  any user): https://arcticwolf.com/resources/blog/cve-2026-29000/
- CVE-2025-61152 - python-jose accepts `alg=none` without signature
  verification: https://github.com/advisories/GHSA-28pv-f4g7-364j
- JWT Signature is not Verified (Invicti):
  https://www.invicti.com/web-vulnerability-scanner/vulnerabilities/jwt-signature-is-not-verified
