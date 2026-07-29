# AIONOS × Woven — Many Agents. One Governed Fabric

A cinematic, browser-based five-minute demonstration showing how AIONOS manages an ensemble of cutting-edge operational agents and connects them through UniStack, UniScale, UniWeave, annotation intelligence and a governed interface for Woven's autonomous mobility ecosystem.

## What the demo contains

1. **Agent ensemble** — HR Ground Ops, Last Mile Best Practices, NX Hero Traffic Control, Procurement Control Tower, UniFleet, Warehouse Vision and Driver Dashcam Intelligence.
2. **UniStack 1** — agent registration, permissions, data lineage, policy, human approvals, observability and audit evidence.
3. **UniScale** — market visibility, brand scores, narrative intelligence, next-best communication and compliant claims.
4. **UniWeave** — customer-centric orchestration for a self-driving mobility journey.
5. **Video + audio annotation** — the structured labels, ontology, mathematical logic and human validation used to build reliable agents.
6. **UniStack 2** — one no-code interface connecting agent management, data management, mathematical intelligence and frontier autonomous systems.

The narrative is aligned to the strategic storyline of a single AIONOS control plane governing agents, data, workflows, experiences, market signals and resilience.

## Run locally

A local web server is required because the story configuration is loaded from JSON.

```bash
python -m http.server 8080
```

Open `http://localhost:8080`.

## Deploy to GitHub Pages

1. Create an empty GitHub repository.
2. Upload the complete contents of this folder to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Choose the `main` branch and `/ (root)`, then save.
6. Open the generated GitHub Pages URL.

## Narration

The experience uses the browser's native Speech Synthesis API so the narration can run directly on GitHub Pages without an external service. The voice menu prioritizes high-quality installed English voices such as Microsoft Aria, Microsoft Guy, Google English or Samantha.

For a final production film, record the script in `narration/voiceover-script.md` with a professional voice artist and use the included render guide.

## Controls

- **Space** — play/pause
- **Right arrow** — next scene
- **Home** — restart
- Use the toggles for narration and captions.
- Use the voice selector to choose the strongest available voice.

## Editing the story

All scene titles, narration, outcomes, durations and active agent states are editable in:

`data/story.json`

The original long-form recordings were transformed into accelerated, web-optimized 720p clips in `assets/media/` to keep the complete experience under five minutes.

## Rights and distribution

The video assets in this repository were supplied for this demonstration. Confirm that you have the necessary rights and permissions before publishing the repository or making it publicly accessible.

## Render a narrated MP4 with GitHub Actions

The **Render narrated film** workflow first generates and validates scene-aligned narration with Microsoft Edge TTS's US English `en-US-MarkNeural` voice. The render job starts only after that narration job succeeds, then captures the page at 1920×1080 and mixes the generated narration into an H.264/AAC MP4. The workflow fails rather than substituting a different voice if Mark is unavailable.

1. Open the repository's **Actions** tab.
2. Select **Render narrated film**.
3. Choose **Run workflow**.
4. When the job finishes, download the **AIONOS-Woven-narrated-film** artifact.

The workflow also runs after relevant page, story, media, or rendering files are pushed to `main`. Rendered artifacts are retained for 14 days. The MP4 itself is intentionally excluded from Git because it is a generated export.
