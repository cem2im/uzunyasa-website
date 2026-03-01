#!/bin/bash
set -e

DIR="$(dirname "$0")/reel-okuryazarlik"
OUT="$(dirname "$0")/../social-posts/reel-saglik-okuryazarligi.mp4"

SLIDE_DUR=3.3
FADE_DUR=0.5
NUM_SLIDES=8

echo "🎬 Reel oluşturuluyor: Sağlık Okuryazarlığı"
echo "   Slayt süresi: ${SLIDE_DUR}s | Fade: ${FADE_DUR}s | Slaytlar: ${NUM_SLIDES}"

# Step 1: Convert each slide PNG to a video clip
for i in $(seq 1 $NUM_SLIDES); do
  IDX=$(printf "%02d" $i)
  echo "   📸 Slayt $IDX → video clip"
  ffmpeg -y -loop 1 -i "$DIR/slide-${IDX}.png" \
    -c:v libx264 -t $SLIDE_DUR -pix_fmt yuv420p \
    -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black" \
    -r 30 -preset ultrafast \
    "$DIR/clip-${IDX}.mp4" 2>/dev/null
done

# Step 2: Concatenate with xfade transitions
echo "   🔗 Birleştiriliyor (xfade)..."

# Build complex filter for xfade chain
# For N clips, we need N-1 xfade operations
# Each xfade offset = cumulative_duration - fade_duration

FILTER=""
CURRENT_INPUT="[0:v]"
CUMULATIVE=$SLIDE_DUR

for i in $(seq 1 $((NUM_SLIDES - 1))); do
  OFFSET=$(echo "$CUMULATIVE - $FADE_DUR" | bc)
  NEXT_INPUT="[$i:v]"
  OUT_LABEL="[v${i}]"
  
  if [ $i -eq $((NUM_SLIDES - 1)) ]; then
    # Last merge — output without label
    FILTER="${FILTER}${CURRENT_INPUT}${NEXT_INPUT}xfade=transition=fade:duration=${FADE_DUR}:offset=${OFFSET},format=yuv420p[outv]"
  else
    FILTER="${FILTER}${CURRENT_INPUT}${NEXT_INPUT}xfade=transition=fade:duration=${FADE_DUR}:offset=${OFFSET}${OUT_LABEL};"
    CURRENT_INPUT="$OUT_LABEL"
  fi
  
  CUMULATIVE=$(echo "$CUMULATIVE + $SLIDE_DUR - $FADE_DUR" | bc)
done

# Build input args
INPUT_ARGS=""
for i in $(seq 1 $NUM_SLIDES); do
  IDX=$(printf "%02d" $i)
  INPUT_ARGS="$INPUT_ARGS -i $DIR/clip-${IDX}.mp4"
done

ffmpeg -y $INPUT_ARGS \
  -filter_complex "$FILTER" \
  -map "[outv]" \
  -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p \
  -movflags +faststart \
  "$OUT" 2>/dev/null

# Clean up clip files
rm -f "$DIR"/clip-*.mp4

DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$OUT")
SIZE=$(du -h "$OUT" | cut -f1)

echo ""
echo "✅ Reel hazır!"
echo "   📁 $OUT"
echo "   ⏱️  ${DURATION}s"
echo "   💾 $SIZE"
