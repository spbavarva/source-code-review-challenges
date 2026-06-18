#!/usr/bin/env python3
"""
templater - internal service for shared report templates.

Other teams upload a YAML "report template"; the service parses it, checks that
it has the fields the dashboard needs, and saves it so reports can be rendered
later. Templates are uploaded by other employees, so the input is not trusted.
"""
import os

import yaml
from flask import Flask, request, jsonify

app = Flask(__name__)

TEMPLATE_DIR = os.environ.get("TEMPLATE_DIR", "/tmp/report-templates")
REQUIRED_FIELDS = ("title", "owner", "widgets")


@app.post("/templates/import")
def import_template():
    raw = request.get_data()

    template = yaml.load(raw, Loader=yaml.Loader)

    if not isinstance(template, dict):
        return jsonify(error="template must be a YAML mapping"), 400

    missing = [f for f in REQUIRED_FIELDS if f not in template]
    if missing:
        return jsonify(error=f"missing fields: {', '.join(missing)}"), 400

    os.makedirs(TEMPLATE_DIR, exist_ok=True)
    dest = os.path.join(TEMPLATE_DIR, f"{template['title']}.yml")
    with open(dest, "w") as fh:
        yaml.safe_dump(template, fh)

    return jsonify(status="imported", fields=list(template.keys()))


@app.get("/healthz")
def healthz():
    return jsonify(status="ok")


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000)
