# Firebase Local Emulator Suite (Firestore + Emulator UI).
# The emulators run on Java, firebase-tools on Node.
FROM node:24-trixie-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends openjdk-21-jre-headless \
  && rm -rf /var/lib/apt/lists/*

RUN npm install --global firebase-tools@15.36.0

WORKDIR /firebase

# "demo-" projects never connect to a real Firebase project.
CMD ["firebase", "emulators:start", "--project", "demo-famobi-analytics"]
