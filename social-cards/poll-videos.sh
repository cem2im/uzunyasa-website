#!/bin/bash
set -e
cd /home/clawdbot/.openclaw/workspace-uzunyasa/website/social-cards

declare -A REQUESTS
REQUESTS[bg-01]="ec3b4588-d4bb-8633-c1ac-53b039d31b16"
REQUESTS[bg-02]="0079ba2e-ba46-f938-8806-dafaeb640f83"
REQUESTS[bg-03]="90fc2f31-d381-3eef-1608-7b38c672ad90"
REQUESTS[bg-04]="8d61c0e8-8586-4be8-bf8b-206117023a80"
REQUESTS[bg-05]="4d42d5ca-0c10-b123-ee43-6e5aacc63f9a"
REQUESTS[bg-06]="89e8382b-bfd0-4a3c-6d3f-96ef182e6208"

DONE=0
TOTAL=6
MAX_ATTEMPTS=60  # 5 minutes max

for attempt in $(seq 1 $MAX_ATTEMPTS); do
  DONE=0
  for bg in bg-01 bg-02 bg-03 bg-04 bg-05 bg-06; do
    # Skip if already downloaded
    if [ -f "reel-viral-kas/${bg}.mp4" ]; then
      DONE=$((DONE + 1))
      continue
    fi
    
    rid="${REQUESTS[$bg]}"
    resp=$(curl -s -H "Authorization: Bearer $XAI_API_KEY" "https://api.x.ai/v1/videos/${rid}")
    status=$(echo "$resp" | jq -r '.status // .state // "unknown"')
    
    if [ "$status" = "completed" ] || [ "$status" = "succeeded" ]; then
      # Try to extract video URL from various possible response formats
      url=$(echo "$resp" | jq -r '.data.video.url // .video.url // .data[0].url // .url // empty' 2>/dev/null)
      if [ -z "$url" ] || [ "$url" = "null" ]; then
        echo "[$bg] Completed but can't find URL. Response: $resp"
        # Save response for debugging
        echo "$resp" > "reel-viral-kas/${bg}-response.json"
        DONE=$((DONE + 1))
        continue
      fi
      echo "[$bg] Downloading from $url"
      curl -s -L -o "reel-viral-kas/${bg}.mp4" "$url"
      echo "[$bg] Downloaded successfully"
      DONE=$((DONE + 1))
    elif [ "$status" = "failed" ] || [ "$status" = "error" ]; then
      echo "[$bg] FAILED: $resp"
      echo "$resp" > "reel-viral-kas/${bg}-error.json"
      DONE=$((DONE + 1))
    else
      echo "[$bg] Status: $status (attempt $attempt)"
    fi
  done
  
  if [ "$DONE" -eq "$TOTAL" ]; then
    echo "All $TOTAL videos processed!"
    break
  fi
  
  echo "--- $DONE/$TOTAL done, waiting 5s (attempt $attempt/$MAX_ATTEMPTS) ---"
  sleep 5
done

# Check results
echo ""
echo "=== RESULTS ==="
for bg in bg-01 bg-02 bg-03 bg-04 bg-05 bg-06; do
  if [ -f "reel-viral-kas/${bg}.mp4" ]; then
    size=$(stat -c%s "reel-viral-kas/${bg}.mp4" 2>/dev/null || echo "0")
    echo "✅ ${bg}.mp4 — ${size} bytes"
  else
    echo "❌ ${bg}.mp4 — MISSING"
  fi
done
