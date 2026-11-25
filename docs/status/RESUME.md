# Resume

Main acbf255521df5bbd496abc43d60c32bc65165b1d; PR #10 merged. Post-merge CI 45561172871 failed browser harness retrieval (HTTP 403); other jobs passed. Branch fix/final-acceptance proposes local locked browser runner, actual SDK response inspection, explicit browser snapshots and adversarial approval tests. Verify exact-head CI and review gates before squash merge, then actual post-merge CI and reconcile all eight functional phases. SDK is in-process synthetic only; snapshot trust demoted; no arbitrary filesystem or execution. Release deferred.

PR #11 original head 4cd3eaa0: browser, core and website passed; SDK failed discovery validation in runs 45561590694 and 45561582280. Corrected final 2026-07-28 discovery structure and added regressions; new exact-head CI required. Reference: https://ts.sdk.modelcontextprotocol.io/v2/migration/support-2026-07-28 and https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/schema/2026-07-28/schema.json .
