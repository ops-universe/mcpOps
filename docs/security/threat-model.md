# Threat model

Server descriptions, commands, annotations and results are untrusted. Risks: injection, privilege escalation, oversized JSON, malformed responses, secret exposure and SSRF. The core accepts bounded JSON and never spawns, installs or contacts servers. Unknown revisions and methods are rejected by the partial inspector. No live compatibility claim. Future authorization must bind server, operation and arguments.
