# Spin-up harness for Challenge-04.
#
# Emulates an attacker's package being pulled in during `npm install` and shows
# its postinstall hook harvesting secrets from the machine.
#
#   docker build -t northwind-c04 -f simulate/Dockerfile .
#   docker run --rm northwind-c04
#
FROM node:20-slim

WORKDIR /challenge

COPY simulate ./simulate

RUN chmod +x ./simulate/run.sh

CMD ["bash", "./simulate/run.sh"]
