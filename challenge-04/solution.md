# Challenge-04 - Solution

The dependency setup lets an outsider run code on any machine that installs this project.
The `@northwind/*` packages in `app/package.json` aren't pinned to the private registry in
`app/.npmrc`, and a malicious `postinstall` hook is how the code actually runs. This is the
same class of bug behind the 2025-26 npm supply-chain attacks (Shai-Hulud).

## The bug - Dependency confusion

`package.json` depends on internal packages:

```json
"@northwind/metrics-core": "^2.0.0",
"@northwind/dashboard-client": "^1.4.0"
```

These only exist on Northwind's private registry. But `.npmrc` never tells npm where the
`@northwind` scope lives - it only sets the **public** registry:

```ini
registry=https://registry.npmjs.org/
```

The line that should be there is missing:

```ini
@northwind:registry=https://npm.internal.northwind.dev/
```

Without it, npm looks up `@northwind/metrics-core` on **public npm**. If an attacker has
published a package under that name (the `@northwind` scope is unclaimed publicly), npm
happily installs the attacker's version instead of the real internal one. Everyone running
`npm install` - laptops and CI runners - pulls attacker code.

## Why install = game over

Once the attacker package gets installed, npm runs that package's **lifecycle scripts
automatically during `npm install`**, before any of your own code runs:

```json
"scripts": { "postinstall": "node steal.js" }
```

So the attacker gets code execution just from `npm install`. On a dev laptop or CI runner
that means reading `~/.npmrc` (npm token), `~/.aws/credentials`, `.env`, and environment
variables, then shipping them out.

## Proof of concept

```bash
cd challenge-04
docker build -t northwind-c04 -f simulate/Dockerfile .
docker run --rm northwind-c04
```

The harness seeds fake secrets, then installs a stand-in attacker package whose postinstall
harvests them. You'll see the (fake) npm token and AWS keys captured by the local listener.
Everything stays on localhost.

## The fix

1. **Pin internal scopes to the private registry** in `.npmrc`:
   `@northwind:registry=https://npm.internal.northwind.dev/`
2. **Claim your scope/names on public npm** so nobody can squat them.
3. **Commit a lockfile** (`package-lock.json`) and install with `npm ci` so versions and
   sources are fixed, not re-resolved each time.
4. **Disable install scripts** where you can: `npm ci --ignore-scripts`.

## References

- Alex Birsan - Dependency Confusion:
  https://medium.com/@alex.birsan/dependency-confusion-4a5d60fec610
- Shai-Hulud npm worm (2025-26 npm supply-chain campaigns).
