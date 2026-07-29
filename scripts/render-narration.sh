#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="${RUNNER_TEMP:-/tmp}/aionos-narration"
VOICE="${NARRATION_VOICE:-en-US-MarkNeural}"
TTS_ATTEMPTS="${NARRATION_TTS_ATTEMPTS:-3}"
OUTPUT="${1:-$ROOT/exports/narration.wav}"
mkdir -p "$WORK"
mkdir -p "$(dirname "$OUTPUT")"
rm -f "$WORK"/*

if ! [[ "$TTS_ATTEMPTS" =~ ^[1-9][0-9]*$ ]]; then
  printf 'NARRATION_TTS_ATTEMPTS must be a positive integer (received %q)\n' "$TTS_ATTEMPTS" >&2
  exit 2
fi

synthesize() {
  local text="$1" destination="$2" attempt

  # edge-tts occasionally completes without returning audio. Treat both that
  # condition and other transient service errors as retryable, and never pass a
  # partial response to ffmpeg.
  for ((attempt=1; attempt<=TTS_ATTEMPTS; attempt++)); do
    rm -f "$destination"
    if edge-tts --voice "$VOICE" --rate=+6% --text "$text" --write-media "$destination" >&2 \
      && [[ -s "$destination" ]] \
      && ffprobe -v error -show_entries format=duration -of csv=p=0 "$destination" >/dev/null; then
      return 0
    fi

    printf 'edge-tts attempt %d/%d failed%s\n' \
      "$attempt" "$TTS_ATTEMPTS" \
      "$([[ $attempt -lt $TTS_ATTEMPTS ]] && printf '; retrying narration scene')" >&2
    (( attempt < TTS_ATTEMPTS )) && sleep $((attempt * 2))
  done

  printf 'edge-tts could not synthesize narration with %s after %d attempts\n' \
    "$VOICE" "$TTS_ATTEMPTS" >&2
  return 1
}

scene_count="$(jq '.scenes | length' "$ROOT/data/story.json")"
for ((i=0; i<scene_count; i++)); do
  text="$(jq -r ".scenes[$i].narration" "$ROOT/data/story.json")"
  duration="$(jq -r ".scenes[$i].duration" "$ROOT/data/story.json")"
  raw="$WORK/raw-$(printf '%02d' "$i").audio"
  fitted="$WORK/scene-$(printf '%02d' "$i").wav"

  synthesize "$text" "$raw"
  spoken="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$raw")"
  tempo="$(awk -v spoken="$spoken" -v slot="$duration" 'BEGIN { safe=slot-0.20; ratio=spoken/safe; print (ratio>1 ? ratio : 1) }')"
  ffmpeg -hide_banner -loglevel error -y -i "$raw" \
    -af "atempo=$tempo,apad=pad_dur=$duration,atrim=duration=$duration" \
    -ar 48000 -ac 2 "$fitted"
done

list="$WORK/concat.txt"
: > "$list"
for wav in "$WORK"/scene-*.wav; do printf "file '%s'\n" "$wav" >> "$list"; done
ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i "$list" -c:a pcm_s16le "$OUTPUT"
printf '%s\n' "$OUTPUT"
