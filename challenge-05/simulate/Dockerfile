# Spin-up harness for Challenge-05.
#
# Runs the vulnerable templater service and uploads a malicious YAML template,
# showing it run attacker code on the server during parsing.
#
#   docker build -t templater-c05 -f simulate/Dockerfile .
#   docker run --rm templater-c05
#
FROM python:3.12-slim

WORKDIR /challenge

COPY app ./app
COPY simulate ./simulate

RUN pip install --no-cache-dir -r app/requirements.txt \
    && chmod +x ./simulate/run.sh

CMD ["bash", "./simulate/run.sh"]
