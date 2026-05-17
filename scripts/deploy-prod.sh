#!/usr/bin/env bash
# Sepnexus production deploy / upgrade script.
#
# Run on the VPS, AS ROOT, after you've pushed the changes you want live to
# the next-rebuild branch:
#
#   ssh root@srv844822.hstgr.cloud
#   cd /root/sepnexus-web
#   bash scripts/deploy-prod.sh
#
# Idempotent. Pulls the latest commits, rebuilds + restarts the container,
# waits for /api/health to return 200, then backfills any unnumbered paid
# invoices. Bails on the first error.

set -euo pipefail

APP_DIR=/root/sepnexus-web
HEALTH_URL=${HEALTH_URL:-https://sepnexus.com/api/health}
BRANCH=${BRANCH:-next-rebuild}

cd "$APP_DIR"

echo "▶ Current commit:"
git --no-pager log -1 --oneline
PREV_SHA=$(git rev-parse HEAD)

echo "▶ Fetching origin..."
git fetch origin --tags --prune
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

echo "▶ New commit:"
git --no-pager log -1 --oneline
NEW_SHA=$(git rev-parse HEAD)

if [ "$PREV_SHA" = "$NEW_SHA" ]; then
  echo "↻ No changes — nothing to deploy."
  exit 0
fi

echo "▶ Diff summary:"
git --no-pager log --oneline "$PREV_SHA..$NEW_SHA"

# Show migrations being added so the operator knows what's about to apply.
echo "▶ New migrations in this update:"
git diff --name-only --diff-filter=A "$PREV_SHA" "$NEW_SHA" -- drizzle/ | grep '\.sql$' || echo "  (none)"

echo "▶ Building + restarting container (migrations run automatically on boot)..."
docker compose up -d --build

echo "▶ Waiting for /api/health to return 200..."
for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15; do
  if curl -fsS -o /dev/null "$HEALTH_URL"; then
    echo "  ✓ healthy after ${i}0s"
    break
  fi
  sleep 10
  if [ "$i" = "15" ]; then
    echo "  ✗ never returned 200. Tail logs: docker logs -n 100 sepnexus-web"
    exit 1
  fi
done

# Backfill any paid invoices that don't have a Sepnexus invoice_number yet.
# Safe to re-run — the script skips already-numbered rows.
echo "▶ Backfilling any unnumbered paid invoices..."
docker exec -i sepnexus-web sh -c \
  'cd /app && node -e "require(\"./drizzle\")" >/dev/null 2>&1 || true; npx -y tsx scripts/backfill-invoice-numbers.ts' \
  2>&1 | tail -20 || echo "  (skip — tsx not in runtime image; run from your laptop instead)"

echo ""
echo "✓ Deploy complete."
echo "  Old: $PREV_SHA"
echo "  New: $NEW_SHA"
echo ""
echo "Verify:"
echo "  - https://sepnexus.com/                       (homepage)"
echo "  - https://sepnexus.com/admin                  (admin)"
echo "  - https://sepnexus.com/api/health             (200)"
echo "  - https://sepnexus.com/dashboard              (customer dash)"
echo "  - https://sepnexus.com/dashboard/billing      (\"Payment method\" card visible)"
echo ""
echo "If anything looks wrong: docker logs -n 200 sepnexus-web"
