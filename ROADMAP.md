# Roadmap

Implementation SHA 1539f126256a509431f50d55d6d02c93bcc6b8db; actual post-merge CI https://github.com/ops-universe/mcpOps/actions/runs/45652117947 passed all four jobs. Core 46/46 (job 139339095409), Chromium 6/6 (139339095459), SDK 4/4 (139339095171), website build and base-path checks (139339095485). All dependency audits reported zero vulnerabilities. SDK log confirms modern era, server/discover, tools/list and tools/call each HTTP 200, inspection and responseInspection true, one synthetic invocation. Exact-head PR #11 runs 45651969220 and 45651963168 passed all eight returned checks. Previous browser clone HTTP 403 and discovery validator regression resolved on actual main.

- [x] 1 — Foundation: locked builds, core and website CI, base-path checks.
- [x] 2 — Protocol: pinned legacy handshake, modern request and complete-response subsets; malformed, incompatible, duplicate and mismatched responses rejected; bounded nested closed-world schemas.
- [x] 3 — Registry: explicit inventory registration, duplicate and execution-config rejection, private trusted-root storage, restart, traversal and unsafe directory CLI regressions.
- [x] 4 — Governance: default deny, trusted policy, nested argument validation, high-risk review, bound single-use approvals, expiry, policy/inventory invalidation and cross-ledger rejection.
- [x] 5 — Harness: deterministic mock fixtures, malformed responses, timeout, cancellation, isolation and actual synthetic SDK exchange.
- [x] 6 — Security: heuristic inspection/redaction, wildcard and undeclared permission denial, inherited-key and schema rejection, unsafe snapshot rejection and dependency audits.
- [x] 7 — CLI/dashboard: offline validation, governance simulation, response inspection, persistent registry CLI, explicit untrusted snapshot import/export, evidence clearing, keyboard and accessibility browser acceptance; locked local browser runner.
- [x] 8 — Trusted SDK: pinned 2.4.0 client/server, explicit authorization, actual discovery/list/call request and response inspection, ID correlation, foreign endpoint and unknown-tool denial.
- [ ] 9 — Developer Preview / public release (deferred by owner).

## Scope
Trusted local account and parent directory; offline inspector and explicit synthetic snapshots, no automatic browser persistence; approvals are simulation-only, permissions declarative and security findings heuristic. Bounded closed-world schema profile, supported protocol subsets and complete-result responses only; no full MCP conformance, arbitrary server execution, external network or third-party interoperability. SDK 2.4.0 fixed synthetic in-process HTTP only. Dependency audits are point-in-time evidence, not security certification. Developer Preview and public release deferred.
