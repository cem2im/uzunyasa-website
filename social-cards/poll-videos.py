#!/usr/bin/env python3
import json, os, time, subprocess, sys

os.chdir("/home/clawdbot/.openclaw/workspace-uzunyasa/website/social-cards")
API_KEY = os.environ["XAI_API_KEY"]

REQUESTS = {
    "bg-01": "ec3b4588-d4bb-8633-c1ac-53b039d31b16",
    "bg-02": "0079ba2e-ba46-f938-8806-dafaeb640f83",
    "bg-03": "90fc2f31-d381-3eef-1608-7b38c672ad90",
    "bg-04": "8d61c0e8-8586-4be8-bf8b-206117023a80",
    "bg-05": "4d42d5ca-0c10-b123-ee43-6e5aacc63f9a",
    "bg-06": "89e8382b-bfd0-4a3c-6d3f-96ef182e6208",
}

TOTAL = len(REQUESTS)
MAX_ATTEMPTS = 80  # ~6-7 minutes

for attempt in range(1, MAX_ATTEMPTS + 1):
    done = 0
    for bg, rid in REQUESTS.items():
        mp4_path = f"reel-viral-kas/{bg}.mp4"
        if os.path.exists(mp4_path) and os.path.getsize(mp4_path) > 1000:
            done += 1
            continue

        result = subprocess.run(
            ["curl", "-s", "-H", f"Authorization: Bearer {API_KEY}",
             f"https://api.x.ai/v1/videos/{rid}"],
            capture_output=True, text=True
        )
        try:
            resp = json.loads(result.stdout)
        except json.JSONDecodeError:
            print(f"[{bg}] Bad response: {result.stdout[:200]}")
            continue

        status = resp.get("status") or resp.get("state") or "unknown"

        if status in ("completed", "succeeded"):
            # Try multiple paths for the video URL
            url = None
            if "data" in resp:
                d = resp["data"]
                if isinstance(d, dict):
                    url = d.get("video", {}).get("url") or d.get("url")
                elif isinstance(d, list) and len(d) > 0:
                    url = d[0].get("url")
            if not url:
                url = resp.get("video", {}).get("url") if isinstance(resp.get("video"), dict) else None
            if not url:
                url = resp.get("url")
            
            if url:
                print(f"[{bg}] ✅ Downloading...")
                subprocess.run(["curl", "-s", "-L", "-o", mp4_path, url])
                size = os.path.getsize(mp4_path) if os.path.exists(mp4_path) else 0
                print(f"[{bg}] Downloaded: {size} bytes")
                done += 1
            else:
                print(f"[{bg}] Completed but no URL found. Keys: {list(resp.keys())}")
                with open(f"reel-viral-kas/{bg}-debug.json", "w") as f:
                    json.dump(resp, f, indent=2)
                done += 1
        elif status in ("failed", "error"):
            print(f"[{bg}] ❌ FAILED: {json.dumps(resp)[:200]}")
            done += 1
        else:
            print(f"[{bg}] ⏳ {status} (attempt {attempt})")

    if done >= TOTAL:
        print(f"\n🎉 All {TOTAL} videos processed!")
        break

    print(f"--- {done}/{TOTAL} done, waiting 5s (attempt {attempt}/{MAX_ATTEMPTS}) ---")
    sys.stdout.flush()
    time.sleep(5)

# Final report
print("\n=== RESULTS ===")
for bg in sorted(REQUESTS.keys()):
    mp4_path = f"reel-viral-kas/{bg}.mp4"
    if os.path.exists(mp4_path):
        size = os.path.getsize(mp4_path)
        print(f"{'✅' if size > 1000 else '⚠️'} {bg}.mp4 — {size:,} bytes")
    else:
        print(f"❌ {bg}.mp4 — MISSING")
