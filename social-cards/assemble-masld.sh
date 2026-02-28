#!/bin/bash
set -e
BASE="$(dirname "$0")"
BG="$BASE/masld-backgrounds"
OV="$BASE/masld-slides"
TMP="/tmp/masld-reel"
mkdir -p "$TMP"

HOOK_DUR=3
FACT_DUR=4
SUMMARY_DUR=4
CTA_DUR=3
FADE=0.5

echo "🎬 Compositing MASLD text overlays on background videos..."

composite() {
  local ID=$1 DUR=$2
  echo "  🔄 $ID (${DUR}s)..."

  # Loop the PNG overlay, overlay on bg video, trim to duration
  ffmpeg -y \
    -i "$BG/$ID.mp4" \
    -loop 1 -i "$OV/$ID.png" \
    -filter_complex " \
      [0:v]scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,setsar=1,fps=30[bg]; \
      [1:v]scale=720:1280,format=rgba[ov]; \
      [bg][ov]overlay=0:0[v]" \
    -map "[v]" -c:v libx264 -profile:v high -pix_fmt yuv420p -t $DUR \
    "$TMP/${ID}.mp4" 2>/dev/null

  local ACTUAL_DUR=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$TMP/${ID}.mp4")
  echo "  ✅ $ID (${ACTUAL_DUR}s)"
}

composite hook $HOOK_DUR
composite fact1 $FACT_DUR
composite fact2 $FACT_DUR
composite fact3 $FACT_DUR
composite fact4 $FACT_DUR
composite fact5 $FACT_DUR
composite summary $SUMMARY_DUR
composite cta $CTA_DUR

echo ""
echo "🔗 Concatenating MASLD scenes with crossfade transitions..."

# Track cumulative duration for xfade offsets
CUR_DUR=$HOOK_DUR

# Step 1: hook + fact1
OFFSET=$(echo "$CUR_DUR - $FADE" | bc)
CUR_DUR=$(echo "$CUR_DUR + $FACT_DUR - $FADE" | bc)
ffmpeg -y -i "$TMP/hook.mp4" -i "$TMP/fact1.mp4" \
  -filter_complex "[0:v][1:v]xfade=transition=fade:duration=$FADE:offset=$OFFSET[v]" \
  -map "[v]" -c:v libx264 -pix_fmt yuv420p "$TMP/m01.mp4" 2>/dev/null
echo "  ✅ hook+fact1 (dur=$CUR_DUR)"

# Step 2: +fact2
OFFSET=$(echo "$CUR_DUR - $FADE" | bc)
CUR_DUR=$(echo "$CUR_DUR + $FACT_DUR - $FADE" | bc)
ffmpeg -y -i "$TMP/m01.mp4" -i "$TMP/fact2.mp4" \
  -filter_complex "[0:v][1:v]xfade=transition=fade:duration=$FADE:offset=$OFFSET[v]" \
  -map "[v]" -c:v libx264 -pix_fmt yuv420p "$TMP/m02.mp4" 2>/dev/null
echo "  ✅ +fact2 (dur=$CUR_DUR)"

# Step 3: +fact3
OFFSET=$(echo "$CUR_DUR - $FADE" | bc)
CUR_DUR=$(echo "$CUR_DUR + $FACT_DUR - $FADE" | bc)
ffmpeg -y -i "$TMP/m02.mp4" -i "$TMP/fact3.mp4" \
  -filter_complex "[0:v][1:v]xfade=transition=fade:duration=$FADE:offset=$OFFSET[v]" \
  -map "[v]" -c:v libx264 -pix_fmt yuv420p "$TMP/m03.mp4" 2>/dev/null
echo "  ✅ +fact3 (dur=$CUR_DUR)"

# Step 4: +fact4
OFFSET=$(echo "$CUR_DUR - $FADE" | bc)
CUR_DUR=$(echo "$CUR_DUR + $FACT_DUR - $FADE" | bc)
ffmpeg -y -i "$TMP/m03.mp4" -i "$TMP/fact4.mp4" \
  -filter_complex "[0:v][1:v]xfade=transition=fade:duration=$FADE:offset=$OFFSET[v]" \
  -map "[v]" -c:v libx264 -pix_fmt yuv420p "$TMP/m04.mp4" 2>/dev/null
echo "  ✅ +fact4 (dur=$CUR_DUR)"

# Step 5: +fact5
OFFSET=$(echo "$CUR_DUR - $FADE" | bc)
CUR_DUR=$(echo "$CUR_DUR + $FACT_DUR - $FADE" | bc)
ffmpeg -y -i "$TMP/m04.mp4" -i "$TMP/fact5.mp4" \
  -filter_complex "[0:v][1:v]xfade=transition=fade:duration=$FADE:offset=$OFFSET[v]" \
  -map "[v]" -c:v libx264 -pix_fmt yuv420p "$TMP/m05.mp4" 2>/dev/null
echo "  ✅ +fact5 (dur=$CUR_DUR)"

# Step 6: +summary
OFFSET=$(echo "$CUR_DUR - $FADE" | bc)
CUR_DUR=$(echo "$CUR_DUR + $SUMMARY_DUR - $FADE" | bc)
ffmpeg -y -i "$TMP/m05.mp4" -i "$TMP/summary.mp4" \
  -filter_complex "[0:v][1:v]xfade=transition=fade:duration=$FADE:offset=$OFFSET[v]" \
  -map "[v]" -c:v libx264 -pix_fmt yuv420p "$TMP/m06.mp4" 2>/dev/null
echo "  ✅ +summary (dur=$CUR_DUR)"

# Step 7: +cta (FINAL)
OFFSET=$(echo "$CUR_DUR - $FADE" | bc)
CUR_DUR=$(echo "$CUR_DUR + $CTA_DUR - $FADE" | bc)
OUTPUT="$BASE/masld-reel-final.mp4"
ffmpeg -y -i "$TMP/m06.mp4" -i "$TMP/cta.mp4" \
  -filter_complex "[0:v][1:v]xfade=transition=fade:duration=$FADE:offset=$OFFSET[v]" \
  -map "[v]" -c:v libx264 -pix_fmt yuv420p "$OUTPUT" 2>/dev/null
echo "  ✅ +cta (dur=$CUR_DUR)"

echo ""
echo "🎬 MASLD reel ready!"
FINAL_DUR=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$OUTPUT")
FINAL_SIZE=$(stat -c%s "$OUTPUT")
FINAL_SIZE_MB=$(echo "scale=1; $FINAL_SIZE / 1048576" | bc)
echo "  Duration: ${FINAL_DUR}s"
echo "  Size: ${FINAL_SIZE_MB}MB"
echo "  Path: $OUTPUT"

# Check if size > 16MB, if so re-encode with 2-pass
if [ $(echo "$FINAL_SIZE_MB > 16" | bc) -eq 1 ]; then
  echo ""
  echo "⚠️ File too large (${FINAL_SIZE_MB}MB > 16MB), applying 2-pass encoding..."
  cd "$BASE"
  ffmpeg -y -i "$OUTPUT" \
    -c:v libx264 -b:v 4500k -pass 1 -an -f null /dev/null 2>/dev/null
  ffmpeg -y -i "$OUTPUT" \
    -c:v libx264 -b:v 4500k -pass 2 -pix_fmt yuv420p \
    "${OUTPUT%.mp4}-compressed.mp4" 2>/dev/null
  mv "${OUTPUT%.mp4}-compressed.mp4" "$OUTPUT"
  FINAL_SIZE=$(stat -c%s "$OUTPUT")
  FINAL_SIZE_MB=$(echo "scale=1; $FINAL_SIZE / 1048576" | bc)
  echo "  ✅ Re-encoded: ${FINAL_SIZE_MB}MB"
fi

echo ""
echo "📁 Copying to media folder..."
mkdir -p /home/clawdbot/.openclaw/media
cp "$OUTPUT" /home/clawdbot/.openclaw/media/masld-reel.mp4
echo "  ✅ Copied to: /home/clawdbot/.openclaw/media/masld-reel.mp4"
echo ""
echo "🎉 MASLD Instagram Reel production complete!"
