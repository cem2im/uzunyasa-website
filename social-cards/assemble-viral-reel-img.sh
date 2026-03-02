#!/bin/bash
# Usage: bash assemble-viral-reel-img.sh <reel-name>
# Creates reel from PNG backgrounds with Ken Burns zoom effect + text overlay

set -e
REEL_NAME="$1"
DIR="$(dirname "$0")/reel-viral-${REEL_NAME}"
OUT_DIR="$(dirname "$0")/../social-posts"
OUT="$OUT_DIR/reel-viral-${REEL_NAME}.mp4"
SLIDE_DUR=3.6
FADE_DUR=0.4
NUM_SLIDES=6

mkdir -p "$OUT_DIR"
echo "🎬 Assembling reel (image BG): $REEL_NAME"

# Step 1: Create video clips from each PNG bg + slide overlay with Ken Burns
for i in $(seq 1 $NUM_SLIDES); do
  IDX=$(printf "%02d" $i)
  SLIDE="$DIR/slide-${IDX}.png"
  BG_PNG="$DIR/bg-${IDX}.png"
  BG_VID="$DIR/bg-${IDX}.mp4"
  COMP="$DIR/comp-${IDX}.mp4"

  if [ -f "$BG_PNG" ]; then
    # Create Ken Burns zoom video from static image (slow zoom in)
    ZOOM_START="1.0"
    ZOOM_END="1.12"
    # Scale image to fully cover 9:16 frame (crop excess)
    ffmpeg -y -loop 1 -i "$BG_PNG" \
      -vf "scale=2160:3840:force_original_aspect_ratio=increase,crop=2160:3840,zoompan=z='${ZOOM_START}+(${ZOOM_END}-${ZOOM_START})*on/(${SLIDE_DUR}*30)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=$(($(echo "$SLIDE_DUR * 30" | bc | cut -d. -f1))):s=1080x1920:fps=30,format=yuv420p" \
      -c:v libx264 -t $SLIDE_DUR -r 30 -preset fast -pix_fmt yuv420p \
      "$BG_VID" 2>/dev/null
    echo "   🎥 Ken Burns BG $IDX"
  elif [ -f "$BG_VID" ]; then
    echo "   🎥 Using existing video BG $IDX"
  else
    echo "   ⚠️ No BG for $IDX, dark fallback"
    ffmpeg -y -f lavfi -i "color=c=0x0a1628:s=1080x1920:d=${SLIDE_DUR}:r=30" \
      -c:v libx264 -pix_fmt yuv420p -preset ultrafast \
      "$BG_VID" 2>/dev/null
  fi

  # Composite slide overlay on top
  ffmpeg -y -i "$BG_VID" -loop 1 -i "$SLIDE" \
    -filter_complex "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920[bg];[bg][1:v]overlay=0:0:shortest=0[out]" \
    -map "[out]" -c:v libx264 -t $SLIDE_DUR -r 30 -pix_fmt yuv420p -preset fast \
    "$COMP" 2>/dev/null
  echo "   ✅ Comp $IDX"

  # Cleanup intermediate bg video
  [ -f "$BG_PNG" ] && rm -f "$BG_VID"
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

# Cleanup
rm -f "$DIR"/comp-*.mp4

DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$OUT")
SIZE=$(du -h "$OUT" | cut -f1)

echo ""
echo "✅ Reel hazır: $REEL_NAME"
echo "   📁 $OUT"
echo "   ⏱️  ${DURATION}s"
echo "   💾 $SIZE"
