# Northport Ledger

- `app/actions.ts` with `loginAction`, `transferFunds`, and related Server Actions
- client-driven login and dashboard flow
- in-memory datastore in `lib/db.ts`
- Next.js app router + Tailwind setup

It intentionally does **not** execute payload content. Instead, it detects and blocks suspicious serialization patterns for demonstration and review.

## Quick Start

```bash
git clone https://github.com/spbavarva/source-code-review-challenges.git
cd "source-code-review-challenges/challenge-02"
npm install
npm run dev
```

Open `http://localhost:3000`.

Demo credentials:

- `ops_admin / vault2026`

## Safe Probe Demo

The endpoint below accepts multipart request bodies shaped like your RSC probe and returns a training verdict:

- `POST /api/training/rsc-probe`


Use the above mentioned endpoint to test the vulnerability.