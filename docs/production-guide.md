# Production Guide

## Recommended final treatment

- Keep the film between **4:35 and 4:55**.
- Use a premium, restrained electronic score at -24 to -20 LUFS beneath narration.
- Use the AIONOS/Woven palette: deep navy, white, cyan/teal and controlled red accents.
- Keep the original application interfaces readable; avoid aggressive zooms that blur the UI.
- Use the browser demo for client presentations and the narration script for a professionally rendered master film.

## Recording a master version

1. Open the site in Chrome or Edge at 1920×1080.
2. Choose the best installed narration voice or disable narration and play a professionally recorded voice track.
3. Enter full screen.
4. Capture at 30 fps using OBS, ScreenFlow or a comparable recorder.
5. Mix narration at approximately -16 LUFS integrated and duck the soundtrack by 8–12 dB under speech.
6. Export H.264, 1080p, 12–18 Mbps.

## Optional static render

The clips are already ordered in `assets/media`. A silent rough cut can be generated with `scripts/render-silent-preview.sh`. Replace or mix in a professional voiceover during final editing.
