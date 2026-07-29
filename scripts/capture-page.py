#!/usr/bin/env python3
"""Launch the film in a headed Chromium window while ffmpeg captures the display."""
import json
import os
from pathlib import Path

from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parent.parent
story = json.loads((root / "data/story.json").read_text(encoding="utf-8"))
duration_ms = round(sum(scene["duration"] for scene in story["scenes"]) * 1000)
url = os.environ.get("RENDER_URL", "http://127.0.0.1:8080")

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(
        headless=False,
        args=["--autoplay-policy=no-user-gesture-required", "--hide-scrollbars", "--window-position=0,0"],
    )
    context = browser.new_context(viewport={"width": 1920, "height": 1080})
    page = context.new_page()
    page.goto(url, wait_until="networkidle")
    # The native checkbox is visually replaced by the switch control, so a
    # pointer-based Playwright action cannot interact with it. Update the
    # control through the DOM and emit the same event as a user interaction.
    page.locator("#narrationToggle").evaluate(
        """toggle => {
            toggle.checked = false;
            toggle.dispatchEvent(new Event('change', { bubbles: true }));
        }"""
    )
    page.locator("#startCard").click()
    page.wait_for_timeout(duration_ms + 750)
    browser.close()
