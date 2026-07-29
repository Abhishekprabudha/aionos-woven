#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="${RUNNER_TEMP:-/tmp}/aionos-narration"
VOICE="${NARRATION_VOICE:-en-US-MarkNeural}"
OUTPUT="${1:-$ROOT/exports/narration.wav}"
mkdir -p "$WORK"
mkdir -p "$(dirname "$OUTPUT")"
rm -f "$WORK"/*

scene_count="$(jq '.scenes | length' "$ROOT/data/story.json")"
for ((i=0; i<scene_count; i++)); do
  text="$(jq -r ".scenes[$i].narration" "$ROOT/data/story.json")"
  duration="$(jq -r ".scenes[$i].duration" "$ROOT/data/story.json")"
  raw="$WORK/raw-$(printf '%02d' "$i").mp3"
  fitted="$WORK/scene-$(printf '%02d' "$i").wav"

  edge-tts --voice "$VOICE" --rate=+6% --text "$text" --write-media "$raw" >&2
  spoken="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$raw")"
  tempo="$(awk -v spoken="$spoken" -v slot="$duration" 'BEGIN { safe=slot-0.20; ratio=spoken/safe; print ratio>1 ? ratio : 1 }')"
  ffmpeg -hide_banner -loglevel error -y -i "$raw" \
    -af "atempo=$tempo,apad=pad_dur=$duration,atrim=duration=$duration" \
    -ar 48000 -ac 2 "$fitted"
done

list="$WORK/concat.txt"
: > "$list"
for wav in "$WORK"/scene-*.wav; do printf "file '%s'\n" "$wav" >> "$list"; done
ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i "$list" -c:a pcm_s16le "$OUTPUT"
printf '%s\n' "$OUTPUT"
