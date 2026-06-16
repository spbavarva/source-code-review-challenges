# Challenge-03 - Specstream

Specstream is a small open-source project that publishes a shared catalog of OpenAPI
specifications. The community contributes new and updated specs through pull requests.

To keep the catalog healthy, every incoming pull request is automatically validated by a
CI workflow. The workflow checks out the contribution, installs the project, runs the spec
validator, and posts a friendly status comment back on the PR.

The maintainers accept pull requests from **anyone**, including first-time external
contributors whose code has never been reviewed before it runs in CI.

## What's in here

- `.github/workflows/pr-validate.yml` - the CI workflow that runs on every pull request
- `app/` - the Node.js project the workflow installs and runs
  - `app/scripts/validate-spec.js` - the OpenAPI spec validator
  - `app/specs/` - the catalog of specs contributors add to
- `simulate/` - a local harness to run things (⚠️ **spoiler** - see note below)

## Expected behavior

- A contributor opens a PR that adds or edits a spec under `app/specs/`
- CI validates the proposed spec and reports whether it is well-formed
- CI holds repository secrets (a publish token, the GitHub token) so it can comment back and, on the main branch, publish the catalog
- An untrusted contributor should **not** be able to read those secrets or run their own code with the maintainer's privileges, no matter what their PR contains

## Goal

Review the workflow and the project it drives. Decide whether a malicious pull request
from an untrusted contributor can break out of "just validating a spec" and do something
the maintainers never intended.


> ⚠️ **Spoiler warning:** `simulate/` and `solution.md` contain the answer. The `simulate/`
> folder is a Dockerized harness that *emulates how GitHub's runner executes this workflow
> against a contributor PR* and demonstrates the impact. Try to find the issue by reading
> `.github/workflows/pr-validate.yml` and `app/` first; only open `simulate/` once you want
> to confirm your finding.
