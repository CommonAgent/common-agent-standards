#!/usr/bin/env bash
# Render the site of a standard whose folder has a site/ with a builder, check
# it, and (when publishing is switched on) upload it.
#
#   tools/render-site.sh <id> draft [--dry-run]               the main branch, at /draft/
#   tools/render-site.sh <id> <id>-v<version> [--dry-run]     that tag, at /<version>/ and at the root
#
# <id> is a standards.json entry. common-agent has its own script,
# common-agent/site/deploy.sh, because commonagent.net also carries the suite's
# front page; this script renders the others (messaging, naming, processes, rfp, sow, mandate, reputations and collab):
#
#   1. copies the hand-written pages of <folder>/site (everything but tools/)
#      into the staging folder,
#   2. writes spec.html beside them with <folder>/site/tools/build-spec.mjs,
#   3. moves every root-relative link under the base (/draft/ or /<version>/)
#      and marks the draft noindex,
#   4. writes sitemap.xml and robots.txt for the root copy,
#   5. runs the contrast gate over every page, and
#   6. uploads, only without --dry-run and only with BUCKET, URLMAP, PROJECT
#      and HOSTS set (the workflow sets them from repository variables).
#
# The upload adds and replaces files and never deletes any, so the copies of
# earlier versions, and any file put in a bucket by hand, stay where they are.
# /media/ in a bucket is kept for hand-uploaded files such as videos, as on
# commonagent.net: the upload skips it, and a rendered site that has a media/
# folder of its own is refused before anything is uploaded.
#
# KEEP=<folder> keeps a copy of the staging folder. Nothing in the working tree
# is changed.
set -euo pipefail

ID="${1:-}"; MODE="${2:-}"; DRY="${3:-}"
usage() { echo "usage: tools/render-site.sh <id> draft|<id>-v<version> [--dry-run]" >&2; exit 2; }
[ -n "$ID" ] && [ -n "$MODE" ] || usage
[ -z "$DRY" ] || [ "$DRY" = "--dry-run" ] || usage

REPO="$(cd "$(dirname "$0")/.." && pwd)"
win() { cygpath -m "$1" 2>/dev/null || echo "$1"; }
FOLDER="$(node -e 'const s=require(process.argv[1]).standards.find(x=>x.id===process.argv[2]); if(!s||!s.builder) process.exit(1); console.log(s.folder)' "$(win "$REPO/standards.json")" "$ID")" \
  || { echo "render refused: $ID has no builder in standards.json" >&2; exit 2; }
SITE="$REPO/$FOLDER/site"
TOOLS="$SITE/tools"
[ -d "$TOOLS/node_modules/marked" ] || (cd "$TOOLS" && npm ci --no-audit --no-fund)

STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT
OUT="$(win "$STAGE")"

render() { # render <dest folder> <base path without slashes, or empty> <draft 0|1>
  local dest="$1" base="$2" draft="$3"
  mkdir -p "$dest"
  # Only the site's own files: the tools, dotfiles, Markdown and scripts stay in
  # the repository.
  (cd "$SITE" && find . \( -path ./tools -o -name '.?*' -o -name '*.md' -o -name '*.sh' -o -name '*.mjs' \) -prune -o -type f -print) | while read -r f; do
    mkdir -p "$dest/$(dirname "$f")"; cp "$SITE/$f" "$dest/$f"
  done
  rm -f "$dest/spec.html"
  node "$(win "$TOOLS/build-spec.mjs")" --out "$(win "$dest")" >/dev/null
  node - "$(win "$dest")" "$base" "$draft" <<'JS'
const { readdirSync, readFileSync, writeFileSync, statSync } = require("node:fs");
const { join } = require("node:path");
const [dest, base, draft] = process.argv.slice(2);
const walk = (d) => readdirSync(d).flatMap((f) => statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]);
for (const p of walk(dest).filter((f) => f.endsWith(".html"))) {
  let s = readFileSync(p, "utf8");
  if (base) s = s.replace(/(\s(?:href|src)=")\/(?!\/)/g, `$1/${base}/`);
  if (draft === "1" && !/<meta name="robots"/.test(s)) s = s.replace(/(<meta name="viewport"[^>]*>)/, `$1\n  <meta name="robots" content="noindex">`);
  writeFileSync(p, s);
}
JS
}

case "$MODE" in
  draft)
    render "$STAGE/draft" draft 1
    ;;
  "$ID"-v*)
    VERSION="${MODE#"$ID"-v}"
    if ! git -C "$REPO" tag --points-at HEAD | grep -qx "$MODE"; then
      echo "render refused: HEAD is not the tag $MODE. Check the tag out first." >&2; exit 1
    fi
    render "$STAGE" "" 0
    HOST="$(node -e 'const s=require(process.argv[1]).standards.find(x=>x.id===process.argv[2]); console.log(new URL(s.site).origin)' "$(win "$REPO/standards.json")" "$ID")"
    node "$(win "$TOOLS/build-sitemap.mjs")" "$OUT" "$HOST" --out "$OUT"
    render "$STAGE/$VERSION" "$VERSION" 0
    ;;
  *) usage ;;
esac

if [ -e "$STAGE/media" ] || [ -e "$STAGE/draft/media" ]; then
  echo "render refused: the rendered site has a media/ folder; /media/ in the bucket holds hand-uploaded files." >&2; exit 1
fi

if ! node "$(win "$TOOLS/contrast-gate.mjs")" --root "$OUT"; then
  echo "render refused: text below 4.5:1 contrast (listed above)." >&2; exit 1
fi

if [ -n "${KEEP:-}" ]; then mkdir -p "$KEEP" && cp -r "$STAGE"/. "$KEEP"/; echo "kept a copy in $KEEP"; fi

if [ "$DRY" = "--dry-run" ]; then
  echo "dry run: rendered and checked $ID $MODE; nothing was uploaded."; exit 0
fi
: "${BUCKET:?BUCKET names the bucket}" "${URLMAP:?URLMAP names the load balancer}" "${PROJECT:?PROJECT names the Google Cloud project}" "${HOSTS:?HOSTS lists the hosts}"
GCLOUD="${GCLOUD:-gcloud}"
"$GCLOUD" storage rsync -r "$OUT" "$BUCKET" --exclude='^media/' --cache-control="public, max-age=300" --project "$PROJECT"
# A JSON-LD context must be served as application/ld+json, which the rsync
# does not guess from the .jsonld extension, so each one is uploaded again with
# that content type.
(cd "$STAGE" && find . -name '*.jsonld' -not -path './media/*') | while read -r f; do
  rel="${f#./}"
  "$GCLOUD" storage cp "$(win "$STAGE/$rel")" "$BUCKET/$rel" --content-type="application/ld+json" --cache-control="public, max-age=300" --project "$PROJECT"
done
for h in $HOSTS; do
  "$GCLOUD" compute url-maps invalidate-cdn-cache "$URLMAP" --path "/*" --host "$h" --project "$PROJECT" --async
done
echo "published $ID $MODE to $BUCKET"
