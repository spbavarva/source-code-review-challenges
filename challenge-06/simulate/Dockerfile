# Spin-up harness for Challenge-06.
#
# Compiles and runs the gatekeeper API, then sends a hand-forged admin token to
# show it accepted without a valid signature.
#
#   docker build -t gatekeeper-c06 -f simulate/Dockerfile .
#   docker run --rm gatekeeper-c06
#
FROM eclipse-temurin:21-jdk

WORKDIR /challenge

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

COPY app ./app
COPY simulate ./simulate

RUN javac -d app/out app/src/*.java && chmod +x simulate/run.sh

CMD ["bash", "./simulate/run.sh"]
