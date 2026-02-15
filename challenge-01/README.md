# Challenge-01

This repository contains a minimal backend service used to enforce usage limits for a SaaS-style feature.

The service tracks per-user credits and allows users to perform an action that consumes credits.  
Credits are intended to limit how frequently a user can perform the action.

The codebase includes:
- A simple API layer
- A quota management module
- An in-memory datastore used to simulate persistence

### Expected Behavior

- Each user has a fixed number of credits.
- Performing an action should consume one credit.
- Once credits are exhausted, further actions should not be allowed.
- The system exposes helper endpoints used by a client to check availability and perform actions.

### Goal

Review the source code under `src/` and reason about whether the system correctly enforces usage limits under all conditions.

No environment setup or execution is required. This is a source-code review exercise.
