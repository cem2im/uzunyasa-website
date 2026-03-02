#!/bin/bash
# Usage: bash assemble-viral-reel.sh <reel-name>
# Composites slide PNGs over background videos, then concatenates

set -e
REEL_NAME="$1"
DIR="$(dirname "$0")/reel-viral-${REEL_NAME}"
OUT="$(dirname "$0")/../social-posts/reel-viral-${REEL_NAME}.mp4"
SLIDE_DUR=4.0
FADE_DUR=0.4
NUM_SLIDES=6

echo "🎬 Assembling reel: $REEL_NAME"

# Step 1: Composite each slide PNG over background video
for i in $(seq 1 $NUM_SLIDES); do
  IDX=$(printf "%02d" $i)
  SLIDE="$DIR/slide-${IDX}.png"
  BG="$DIR/bg-${IDX}.mp4"
  COMP="$DIR/comp-${IDX}.mp4"
  
  if [ ! -f "$BG" ]; then
    echo "   ⚠️ No BG for slide $IDX, using dark fallback"
    ffmpeg -y -loop 1 -i "$SLIDE" \
      -vf "scale=1080:1920,format=yuv420p" \
      -c:v libx264 -t $SLIDE_DUR -r 30 -preset ultrafast \
      "$COMP" 2>/dev/null
  else
    # Get BG duration
    BG_DUR=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$BG" 2>/dev/null)
    
    ffmpeg -y -i "$BG" -loop 1 -i "$SLIDE" \
      -filter_complex "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setpts=PTS-STARTPTS[bg];[bg][1:v]overlay=0:0:shortest=0[out]" \
      -map "[out]" -c:v libx264 -t $SLIDE_DUR -r 30 -pix_fmt yuv420p -preset fast \
      "$COMP" 2>/dev/null
  fi
  echo "   ✅ Comp $IDX"
done

# Step 2: Concatenate with xfade
echo "   🔗 Concatenating with xfade..."

FILTER=""
CURRENT="[0:v]"
CUM=$SLIDE_DUR

for i in $(seq 1 $((NUM_SLIDES - 1))); do
  OFFSET=$(echo "$CUM - $FADE_DUR" | bc)
  NEXT="[$i:v]"
  if [ $i -eq $((NUM_SLIDES - 1)) ]; then
    FILTER="${FILTER}${CURRENT}${NEXT}xfade=transition=fade:duration=${FADE_DUR}:offset=${OFFSET},format=yuv420p[outv]"
  else
    OUT_L="[v${i}]"
    FILTER="${FILTER}${CURRENT}${NEXT}xfade=transition=fade:duration=${FADE_DUR}:offset=${OFFSET}${OUT_L};"
    CURRENT="$OUT_L"
  fi
  CUM=$(echo "$CUM + $SLIDE_DUR - $FADE_DUR" | bc)
done

INPUTS=""
for i in $(seq 1 $NUM_SLIDES); do
  IDX=$(printf "%02d" $i)
  INPUTS="$INPUTS -i $DIR/comp-${IDX}.mp4"
done

ffmpeg -y $INPUTS \
  -filter_complex "$FILTER" \
  -map "[outv]" -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p \
  -movflags +faststart "$OUT" 2>/dev/null

# Cleanup comp files
rm -f "$DIR"/comp-*.mp4

DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$OUT")
SIZE=$(du -h "$OUT" | cut -f1)

echo ""
echo "✅ Reel hazır: $REEL_NAME"
echo "   📁 $OUT"
echo "   ⏱️  ${DURATION}s"
echo "   💾 $SIZE"
