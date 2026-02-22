# Northport Ledger (Safe RSC Training Lab)

This project is a **safe training clone** of the original challenge architecture:

- `app/actions.ts` with `loginAction`, `transferFunds`, and related Server Actions
- client-driven login and dashboard flow
- in-memory datastore in `lib/db.ts`
- Next.js app router + Tailwind setup

It intentionally does **not** execute payload content. Instead, it detects and blocks suspicious serialization patterns for demonstration and review.

## Quick Start

```bash
cd "/Users/sneh/Downloads/code review chal/new for codex/rsc-flight-training-safe"
npm install
npm run dev
```

Open `http://localhost:3000`.

Demo credentials:

- `ops_admin / vault2026`

## Safe Probe Demo

The endpoint below accepts multipart request bodies shaped like your RSC probe and returns a training verdict:

- `POST /api/training/rsc-probe`

Run:

```bash
cd "/Users/sneh/Downloads/code review chal/new for codex/rsc-flight-training-safe"
./training/send-safe-probe.sh
```

Expected result: HTTP `422` with JSON indicating the payload was blocked and listing detection reasons.

The script sends the same multipart structure (`0`, `1`, `2` fields with Next.js headers), but targets the dedicated training endpoint and blocks suspicious patterns.

## Notes

- Use this for internal review training and defensive walkthroughs.
- No remote command execution path is implemented in this project.
