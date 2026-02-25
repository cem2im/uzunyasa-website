#!/bin/bash
set -e
BASE="$(dirname "$0")"
BG="$BASE/ai-saglik-bg"
OV="$BASE/ai-saglik-slides"
TMP="/tmp/reel-ai-saglik"
mkdir -p "$TMP"

HOOK_DUR=3
FACT_DUR=4
SUMMARY_DUR=4
CTA_DUR=3
FADE=0.5

echo "🎬 Compositing text overlays on AI background videos..."

composite() {
  local ID=$1 DUR=$2
  echo "  🔄 $ID (${DUR}s)..."
  ffmpeg -y \
    -i "$BG/$ID.mp4" \
    -loop 1 -i "$OV/$ID.png" \
    -filter_complex " \
      [0:v]scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,setsar=1,fps=30[bg]; \
      [1:v]scale=720:1280,format=rgba[ov]; \
      [bg][ov]overlay=0:0[v]" \
    -map "[v]" -c:v libx264 -profile:v high -pix_fmt yuv420p -t $DUR \
    "$TMP/${ID}.mp4" 2>/dev/null
  echo "  ✅ $ID"
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
echo "🔗 Concatenating with crossfade transitions..."

CUR_DUR=$HOOK_DUR

# hook + fact1
OFFSET=$(echo "$CUR_DUR - $FADE" | bc)
CUR_DUR=$(echo "$CUR_DUR + $FACT_DUR - $FADE" | bc)
ffmpeg -y -i "$TMP/hook.mp4" -i "$TMP/fact1.mp4" \
  -filter_complex "[0:v][1:v]xfade=transition=fade:duration=$FADE:offset=$OFFSET[v]" \
  -map "[v]" -c:v libx264 -pix_fmt yuv420p "$TMP/m01.mp4" 2>/dev/null
echo "  ✅ hook+fact1 (dur=$CUR_DUR)"

# +fact2
OFFSET=$(echo "$CUR_DUR - $FADE" | bc)
CUR_DUR=$(echo "$CUR_DUR + $FACT_DUR - $FADE" | bc)
ffmpeg -y -i "$TMP/m01.mp4" -i "$TMP/fact2.mp4" \
  -filter_complex "[0:v][1:v]xfade=transition=fade:duration=$FADE:offset=$OFFSET[v]" \
  -map "[v]" -c:v libx264 -pix_fmt yuv420p "$TMP/m02.mp4" 2>/dev/null
echo "  ✅ +fact2 (dur=$CUR_DUR)"

# +fact3
OFFSET=$(echo "$CUR_DUR - $FADE" | bc)
CUR_DUR=$(echo "$CUR_DUR + $FACT_DUR - $FADE" | bc)
ffmpeg -y -i "$TMP/m02.mp4" -i "$TMP/fact3.mp4" \
  -filter_complex "[0:v][1:v]xfade=transition=fade:duration=$FADE:offset=$OFFSET[v]" \
  -map "[v]" -c:v libx264 -pix_fmt yuv420p "$TMP/m03.mp4" 2>/dev/null
echo "  ✅ +fact3 (dur=$CUR_DUR)"

# +fact4
OFFSET=$(echo "$CUR_DUR - $FADE" | bc)
CUR_DUR=$(echo "$CUR_DUR + $FACT_DUR - $FADE" | bc)
ffmpeg -y -i "$TMP/m03.mp4" -i "$TMP/fact4.mp4" \
  -filter_complex "[0:v][1:v]xfade=transition=fade:duration=$FADE:offset=$OFFSET[v]" \
  -map "[v]" -c:v libx264 -pix_fmt yuv420p "$TMP/m04.mp4" 2>/dev/null
echo "  ✅ +fact4 (dur=$CUR_DUR)"

# +fact5
OFFSET=$(echo "$CUR_DUR - $FADE" | bc)
CUR_DUR=$(echo "$CUR_DUR + $FACT_DUR - $FADE" | bc)
ffmpeg -y -i "$TMP/m04.mp4" -i "$TMP/fact5.mp4" \
  -filter_complex "[0:v][1:v]xfade=transition=fade:duration=$FADE:offset=$OFFSET[v]" \
  -map "[v]" -c:v libx264 -pix_fmt yuv420p "$TMP/m05.mp4" 2>/dev/null
echo "  ✅ +fact5 (dur=$CUR_DUR)"

# +summary
OFFSET=$(echo "$CUR_DUR - $FADE" | bc)
CUR_DUR=$(echo "$CUR_DUR + $SUMMARY_DUR - $FADE" | bc)
ffmpeg -y -i "$TMP/m05.mp4" -i "$TMP/summary.mp4" \
  -filter_complex "[0:v][1:v]xfade=transition=fade:duration=$FADE:offset=$OFFSET[v]" \
  -map "[v]" -c:v libx264 -pix_fmt yuv420p "$TMP/m06.mp4" 2>/dev/null
echo "  ✅ +summary (dur=$CUR_DUR)"

# +cta → FINAL
OFFSET=$(echo "$CUR_DUR - $FADE" | bc)
CUR_DUR=$(echo "$CUR_DUR + $CTA_DUR - $FADE" | bc)
OUTPUT="$BASE/ai-saglik-reel-final.mp4"
ffmpeg -y -i "$TMP/m06.mp4" -i "$TMP/cta.mp4" \
  -filter_complex "[0:v][1:v]xfade=transition=fade:duration=$FADE:offset=$OFFSET[v]" \
  -map "[v]" -c:v libx264 -pix_fmt yuv420p "$OUTPUT" 2>/dev/null
echo "  ✅ +cta (dur=$CUR_DUR)"

echo ""
echo "🎬 Final AI Sağlık reel ready!"
FINAL_DUR=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$OUTPUT")
FINAL_SIZE=$(du -h "$OUTPUT" | cut -f1)
echo "  Duration: ${FINAL_DUR}s"
echo "  Size: $FINAL_SIZE"
echo "  Path: $OUTPUT"

# Compress for Telegram (<16MB)
echo ""
echo "📦 Compressing for Telegram..."
ffmpeg -y -i "$OUTPUT" -c:v libx264 -b:v 4500k -pass 1 -an -f null /dev/null 2>/dev/null
ffmpeg -y -i "$OUTPUT" -c:v libx264 -b:v 4500k -pass 2 -pix_fmt yuv420p \
  "$BASE/ai-saglik-reel-telegram.mp4" 2>/dev/null
TG_SIZE=$(du -h "$BASE/ai-saglik-reel-telegram.mp4" | cut -f1)
echo "  ✅ Telegram version: $TG_SIZE → $BASE/ai-saglik-reel-telegram.mp4"
