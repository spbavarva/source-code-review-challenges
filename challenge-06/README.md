# Challenge-06 - Gatekeeper Accounts API

`gatekeeper` is a small internal accounts API written in Java. Users log in, get
a token, and send it on every request:

```
Authorization: Bearer <token>
```

The token is a JWT-style string (`header.payload.signature`). The payload says
who the user is and what role they have. Users with the `admin` role get the
admin panel; everyone else gets standard access.

## What's in here

- `app/src/TokenService.java` - issues and reads tokens (the review target)
- `app/src/Server.java` - the HTTP API that gates `/account` on the token
- `app/src/User.java` - a small data holder
- `simulate/` - a local harness to run things (⚠️ **spoiler** - see note below)

## Expected behavior

- Only this server can issue valid tokens, because only it knows the signing
  secret used for the signature.
- A user's role comes from a token the server signed. A normal user should not be
  able to give themselves the `admin` role.

## Goal

Review `app/src/TokenService.java` and decide whether someone who is not an admin
(or not even a real user) could call `/account` and be treated as `admin`. Could
an attacker craft their own token?

No environment setup is required. This is a source-code review exercise.

> ⚠️ **Spoiler warning:** `simulate/` and `solution.md` contain the answer.
> `simulate/` is a Dockerized harness that forges an admin token and shows the
> impact. Try to find the issue by reading `TokenService.java` first; only open
> `simulate/` once you want to confirm your finding.
