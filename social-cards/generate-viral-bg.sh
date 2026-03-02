#!/bin/bash
# Usage: bash generate-viral-bg.sh <reel-name> <prompt1> <prompt2> ... <prompt6>
# Generates 6 background videos via Grok Imagine Video API

set -e
REEL_NAME="$1"
shift
DIR="$(dirname "$0")/reel-viral-${REEL_NAME}"

echo "🎬 Generating backgrounds for: $REEL_NAME"

i=1
for PROMPT in "$@"; do
  IDX=$(printf "%02d" $i)
  echo "   🎨 BG $IDX: Submitting..."
  
  # Submit video generation
  RESPONSE=$(curl -s "https://api.x.ai/v1/videos/generations" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $XAI_API_KEY" \
    -d "{\"model\":\"grok-imagine-video\",\"prompt\":\"$PROMPT\",\"n\":1}")
  
  REQUEST_ID=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('request_id',''))" 2>/dev/null)
  
  if [ -z "$REQUEST_ID" ]; then
    echo "   ❌ BG $IDX: Failed to submit"
    echo "   Response: $RESPONSE"
    i=$((i+1))
    continue
  fi
  
  echo "   ⏳ BG $IDX: Polling (ID: $REQUEST_ID)..."
  
  # Poll for completion (max 120 seconds)
  for attempt in $(seq 1 24); do
    sleep 5
    POLL=$(curl -s "https://api.x.ai/v1/videos/${REQUEST_ID}" \
      -H "Authorization: Bearer $XAI_API_KEY")
    
    STATUS=$(echo "$POLL" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('status',''))" 2>/dev/null)
    
    if [ "$STATUS" = "completed" ] || [ "$STATUS" = "complete" ]; then
      VIDEO_URL=$(echo "$POLL" | python3 -c "
import sys, json
d = json.load(sys.stdin)
data = d.get('data', d)
if isinstance(data, dict):
    v = data.get('video', data)
    print(v.get('url', ''))
elif isinstance(data, list) and len(data) > 0:
    print(data[0].get('url', ''))
" 2>/dev/null)
      
      if [ -n "$VIDEO_URL" ]; then
        curl -sL "$VIDEO_URL" -o "$DIR/bg-${IDX}.mp4"
        echo "   ✅ BG $IDX: Downloaded"
        break
      fi
    fi
    
    if [ "$STATUS" = "failed" ]; then
      echo "   ❌ BG $IDX: Generation failed"
      break
    fi
  done
  
  i=$((i+1))
done

echo "🎉 Backgrounds done for: $REEL_NAME"
