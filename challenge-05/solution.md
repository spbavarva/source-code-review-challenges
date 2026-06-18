# Challenge-05 - Solution

The service parses an uploaded YAML template with an unsafe loader, so anyone who
can upload a template can run code on the server. This is the same bug behind the
2025-26 PyYAML attacks (Docling CVE-2026-24009, MS-SWIFT CVE-2025-50460).

## The bug - Unsafe YAML deserialization

In `app/app.py` the upload is parsed like this:

```python
template = yaml.load(raw, Loader=yaml.Loader)
```

`yaml.Loader` (the full loader) does more than read data. It can build arbitrary
Python objects described by special YAML tags. So a template like this:

```yaml
!!python/object/apply:os.system
- "id"
```

makes PyYAML call `os.system("id")` while it is parsing. The attacker chose what
runs, just by uploading a template.

The later checks (`isinstance(template, dict)`, required fields) do not help. The
command runs during `yaml.load`, before any of that validation. The request may
even get rejected with a 400, but the code already executed.

Note: `yaml.FullLoader` is not a safe fix either - that was the exact loader in
MS-SWIFT (CVE-2025-50460). Only `safe_load` / `SafeLoader` is safe.

## Proof of concept

```bash
cd challenge-05
docker build -t templater-c05 -f simulate/Dockerfile .
docker run --rm templater-c05
```

The exact exploit is in `simulate/payload.yml`. The harness starts the service,
then `simulate/exploit.py` uploads that payload. You will see `id` run on the
server (its `uid=... gid=...` output), proving code execution just from uploading
a template. Swap `id` in the payload for any command. Everything stays on
localhost.

## The fix

1. **Use `yaml.safe_load`** (or `SafeLoader`) for any YAML you did not create:

   ```python
   template = yaml.safe_load(raw)
   ```

2. **Validate after parsing** - safe_load gives plain dicts/lists, then check the
   shape and fields.
3. **Treat config files as untrusted** when they can come from users, uploads, or
   another repo.

## References

- CVE-2026-24009 - Docling RCE via unsafe PyYAML loader:
  https://www.oligo.security/blog/docling-rce-a-shadow-vulnerability-introduced-via-pyyaml-cve-2026-24009
- CVE-2025-50460 - MS-SWIFT RCE via unsafe PyYAML deserialization:
  https://github.com/advisories/GHSA-fm6c-f59h-7mmg
