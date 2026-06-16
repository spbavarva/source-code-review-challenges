# Spin-up harness for Challenge-03.
#
# This image emulates how GitHub's runner executes the vulnerable workflow
# against an untrusted contributor PR, so you can watch the impact locally.
#
#   docker build -t specstream-c03 -f simulate/Dockerfile .
#   docker run --rm specstream-c03
#
FROM node:20-slim

WORKDIR /challenge

# Bring in the base project and the simulation harness.
COPY app ./app
COPY simulate ./simulate

RUN chmod +x ./simulate/run.sh

CMD ["bash", "./simulate/run.sh"]
