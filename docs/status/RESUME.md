# Resume

Last verified main: 8a9fb15f23cc7061c2cd157df816eba26f0cca3a. PR #7 merged with browser CI. Branch feat/trusted-sdk-evidence adds pinned isolated SDK harness. Verify exact-head CI, reviews and protections before merge. Reproduce npm ci && npm test; cd sdk-integration && npm ci --ignore-scripts && npm audit --audit-level=high && node --test interop.test.mjs. Next: fix any actual SDK failures, extend response validation and storage CLI, reconcile acceptance. Release deferred.
