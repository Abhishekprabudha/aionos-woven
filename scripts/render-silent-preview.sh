#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LIST="$ROOT/exports/concat.txt"
: > "$LIST"
for f in "$ROOT"/assets/media/*.mp4; do
  printf "file '%s'\n" "$f" >> "$LIST"
done
ffmpeg -y -f concat -safe 0 -i "$LIST" -c copy "$ROOT/exports/AIONOS_Woven_silent_rough_cut.mp4"
echo "Created exports/AIONOS_Woven_silent_rough_cut.mp4"
