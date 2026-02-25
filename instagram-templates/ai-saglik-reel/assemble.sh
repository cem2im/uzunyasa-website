#!/bin/bash
set -e
BASE="$(dirname "$0")"
BG="$BASE/backgrounds"
OV="$BASE/overlays"
TMP="/tmp/ai-saglik-reel"
mkdir -p "$TMP"

SLIDE_DUR=5
FADE=0.5

echo "🎬 Compositing text overlays on background videos..."

composite() {
  local NUM=$1
  echo "  🔄 slide$NUM (${SLIDE_DUR}s)..."
  
  ffmpeg -y \
    -i "$BG/slide$NUM.mp4" \
    -loop 1 -i "$OV/slide$NUM.png" \
    -filter_complex " \
      [0:v]scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,setsar=1,fps=30[bg]; \
      [1:v]scale=720:1280,format=rgba[ov]; \
      [bg][ov]overlay=0:0[v]" \
    -map "[v]" -c:v libx264 -profile:v high -pix_fmt yuv420p -t $SLIDE_DUR \
    "$TMP/slide$NUM.mp4" 2>/dev/null
  
  echo "  ✅ slide$NUM done"
}

for i in 1 2 3 4 5; do
  composite $i
done

echo ""
echo "🔗 Concatenating with crossfade transitions..."

CUR_DUR=$SLIDE_DUR

# Step 1: slide1 + slide2
OFFSET=$(echo "$CUR_DUR - $FADE" | bc)
CUR_DUR=$(echo "$CUR_DUR + $SLIDE_DUR - $FADE" | bc)
ffmpeg -y -i "$TMP/slide1.mp4" -i "$TMP/slide2.mp4" \
  -filter_complex "[0:v][1:v]xfade=transition=fade:duration=$FADE:offset=$OFFSET[v]" \
  -map "[v]" -c:v libx264 -pix_fmt yuv420p "$TMP/m01.mp4" 2>/dev/null
echo "  ✅ 1+2 (dur=$CUR_DUR)"

# Step 2: +slide3
OFFSET=$(echo "$CUR_DUR - $FADE" | bc)
CUR_DUR=$(echo "$CUR_DUR + $SLIDE_DUR - $FADE" | bc)
ffmpeg -y -i "$TMP/m01.mp4" -i "$TMP/slide3.mp4" \
  -filter_complex "[0:v][1:v]xfade=transition=fade:duration=$FADE:offset=$OFFSET[v]" \
  -map "[v]" -c:v libx264 -pix_fmt yuv420p "$TMP/m02.mp4" 2>/dev/null
echo "  ✅ +3 (dur=$CUR_DUR)"

# Step 3: +slide4
OFFSET=$(echo "$CUR_DUR - $FADE" | bc)
CUR_DUR=$(echo "$CUR_DUR + $SLIDE_DUR - $FADE" | bc)
ffmpeg -y -i "$TMP/m02.mp4" -i "$TMP/slide4.mp4" \
  -filter_complex "[0:v][1:v]xfade=transition=fade:duration=$FADE:offset=$OFFSET[v]" \
  -map "[v]" -c:v libx264 -pix_fmt yuv420p "$TMP/m03.mp4" 2>/dev/null
echo "  ✅ +4 (dur=$CUR_DUR)"

# Step 4: +slide5
OFFSET=$(echo "$CUR_DUR - $FADE" | bc)
CUR_DUR=$(echo "$CUR_DUR + $SLIDE_DUR - $FADE" | bc)
OUTPUT="$BASE/ai-saglik-reel-final.mp4"
ffmpeg -y -i "$TMP/m03.mp4" -i "$TMP/slide5.mp4" \
  -filter_complex "[0:v][1:v]xfade=transition=fade:duration=$FADE:offset=$OFFSET[v]" \
  -map "[v]" -c:v libx264 -pix_fmt yuv420p "$OUTPUT" 2>/dev/null
echo "  ✅ +5 (dur=$CUR_DUR)"

echo ""
echo "🎬 Final reel ready!"
FINAL_DUR=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$OUTPUT")
FINAL_SIZE=$(du -h "$OUTPUT" | cut -f1)
echo "  Duration: ${FINAL_DUR}s"
echo "  Size: $FINAL_SIZE"
echo "  Path: $OUTPUT"

# Copy to media inbound
cp "$OUTPUT" /home/clawdbot/.openclaw/media/inbound/ai-saglik-reel.mp4
echo "  📤 Copied to media/inbound/"
