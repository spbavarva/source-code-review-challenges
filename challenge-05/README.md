# Challenge-05 - Templater Report Service

`templater` is a small internal Python service. Teams upload a YAML "report
template" describing the widgets they want, and the service parses it, checks it
has the fields the dashboard needs, and saves it so reports can be rendered
later.

Templates are uploaded by other employees, so the input arriving at the service
is not trusted. The team wants a review of the import path before they open it up
to more teams.

## What's in here

- `app/app.py` - the service, with the `/templates/import` endpoint (the review target)
- `app/requirements.txt` - dependencies
- `app/templates/quarterly.yml` - an example of a legitimate template
- `simulate/` - a local harness to run things (⚠️ **spoiler** - see note below)

## Expected behavior

- A user POSTs a YAML template to `/templates/import`.
- The service reads the template, confirms it has the required fields
  (`title`, `owner`, `widgets`), and stores it.
- Uploading a template should never let the uploader run code on the server.

## Goal

Review `app/app.py` and decide whether someone who can upload a template could do
more than just store a report definition. Could a crafted template get their own
code to run on the server?

No environment setup is required. This is a source-code review exercise.

> ⚠️ **Spoiler warning:** `simulate/` and `solution.md` contain the answer.
> `simulate/` is a Dockerized harness that uploads a malicious template and shows
> the impact. Try to find the issue by reading `app/app.py` first; only open
> `simulate/` once you want to confirm your finding.
