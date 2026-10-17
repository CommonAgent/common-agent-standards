#!/usr/bin/env bash
# Render the site of the Common Agent Specification and publish it to
# gs://commonagent-site, the bucket behind https://commonagent.net.
#
#   site/deploy.sh draft [--dry-run]           the main branch, at /draft/
#   site/deploy.sh v0.26.0-draft [--dry-run]   that tag, at /0.26.0-draft/ and at the root
#
# The GitHub Actions workflow runs this on every push to main and on every tag.
# It can also be run by hand from a checkout, with gcloud signed in to an
# account that may write the bucket and clear the CDN.
#
# The staging folder mirrors the bucket: the root pages at its top, a tagged
# version under /<version>/, the main branch under /draft/. The contrast gate
# checks every page in it before anything is uploaded, and --dry-run stops
# there. The upload adds and replaces files and never deletes any, so the copies
# of earlier versions stay where they are.
set -euo pipefail

MODE="${1:-}"
DRY="${2:-}"
BUCKET="${BUCKET:-gs://commonagent-site}"
URLMAP="${URLMAP:-commonagent-lb}"
PROJECT="${PROJECT:?PROJECT names the Google Cloud project that holds the bucket}"
GCLOUD="${GCLOUD:-gcloud}"

usage() { echo "usage: site/deploy.sh draft|v<version> [--dry-run]" >&2; exit 2; }
[ -n "$MODE" ] || usage
[ -z "$DRY" ] || [ "$DRY" = "--dry-run" ] || usage

HERE="$(cd "$(dirname "$0")" && pwd)"
REPO="$(dirname "$HERE")"
# On Windows (Git Bash) node needs Windows paths; elsewhere this is a no-op.
win() { cygpath -m "$1" 2>/dev/null || echo "$1"; }
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT
OUT="$(win "$STAGE")"
TOOLS="$(win "$HERE/tools")"

[ -d "$HERE/tools/node_modules/marked" ] || (cd "$HERE/tools" && npm ci --no-audit --no-fund)

# The base is passed without a leading slash so that Git Bash does not turn it
# into a Windows path; the builder adds the slashes.
case "$MODE" in
  draft)
    node "$TOOLS/build-spec.mjs" --out "$OUT/draft" --base draft --ref main --draft
    ;;
  v[0-9]*)
    VERSION="${MODE#v}"
    AT="$(git -C "$REPO" describe --tags --exact-match HEAD 2>/dev/null || true)"
    if [ "$AT" != "$MODE" ]; then
      echo "deploy refused: HEAD is not the tag $MODE. Check the tag out first." >&2
      exit 1
    fi
    node "$TOOLS/build-spec.mjs" --out "$OUT" --ref "$MODE" --expect-version "$VERSION"
    # The sitemap lists the root pages only, so it is written before the
    # version's own copy is added to the staging folder.
    node "$TOOLS/build-sitemap.mjs" "$OUT" "https://commonagent.net"
    node "$TOOLS/build-spec.mjs" --out "$OUT/$VERSION" --base "$VERSION" --ref "$MODE" --expect-version "$VERSION"
    ;;
  *) usage ;;
esac

# Every piece of text on every page must clear 4.5:1 in both themes.
if ! node "$TOOLS/contrast-gate.mjs" --root "$OUT"; then
  echo "deploy refused: text below 4.5:1 contrast (listed above)." >&2
  exit 1
fi

if [ "$DRY" = "--dry-run" ]; then
  echo "dry run: built and checked $MODE; nothing was uploaded."
  exit 0
fi

"$GCLOUD" storage rsync -r "$OUT" "$BUCKET" --cache-control="public, max-age=300" --project "$PROJECT"
"$GCLOUD" compute url-maps invalidate-cdn-cache "$URLMAP" --path "/*" --project "$PROJECT" --async
echo "deployed $MODE to $BUCKET"
