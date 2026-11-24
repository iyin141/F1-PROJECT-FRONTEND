#!/usr/bin/env bash
# Performance budgets: race hub LCP under 2.5 s on simulated 4G (Lighthouse), telemetry lab interaction (Playwright).
# Needs a mock-mode production build first. Run on CI or the VM, not the dev PC:
#   NEXT_PUBLIC_API_MODE=mock npm run build && scripts/perf.sh
set -euo pipefail
npx --yes @lhci/cli@0.15.x autorun --config=lighthouse/lighthouserc.json
npx playwright test e2e/perf.spec.ts
