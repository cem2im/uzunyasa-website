#!/bin/bash
# Assemble IF reel: video backgrounds + transparent PNG overlays → final reel
set -e

SLIDES_DIR="slides-if"
BG_DIR="backgrounds-if"
OUT_DIR="composited-if"
FINAL="if-reel-final.mp4"

mkdir -p "$OUT_DIR"

NAMES=("hook" "fact1" "fact2" "fact3" "fact4" "fact5" "summary" "cta")

echo "🎬 Compositing slides onto backgrounds..."
for name in "${NAMES[@]}"; do
  echo "  ▶ $name"
  ffmpeg -y -i "$BG_DIR/$name.mp4" -loop 1 -i "$SLIDES_DIR/$name.png" \
    -filter_complex "[1:v]scale=720:1280[ovr];[0:v]scale=720:1280[bg];[bg][ovr]overlay=0:0:shortest=1" \
    -c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p -t 3.5 \
    "$OUT_DIR/$name.mp4" -loglevel error
done

echo ""
echo "🔗 Concatenating with xfade transitions..."
FADE=0.5

# Build filter chain
# Merge step by step: out0=hook+fact1, out1=out0+fact2, etc
ffmpeg -y \
  -i "$OUT_DIR/hook.mp4" \
  -i "$OUT_DIR/fact1.mp4" \
  -i "$OUT_DIR/fact2.mp4" \
  -i "$OUT_DIR/fact3.mp4" \
  -i "$OUT_DIR/fact4.mp4" \
  -i "$OUT_DIR/fact5.mp4" \
  -i "$OUT_DIR/summary.mp4" \
  -i "$OUT_DIR/cta.mp4" \
  -filter_complex "
    [0:v][1:v]xfade=transition=fade:duration=$FADE:offset=3.0[v01];
    [v01][2:v]xfade=transition=fade:duration=$FADE:offset=5.5[v02];
    [v02][3:v]xfade=transition=fade:duration=$FADE:offset=8.0[v03];
    [v03][4:v]xfade=transition=fade:duration=$FADE:offset=10.5[v04];
    [v04][5:v]xfade=transition=fade:duration=$FADE:offset=13.0[v05];
    [v05][6:v]xfade=transition=fade:duration=$FADE:offset=15.5[v06];
    [v06][7:v]xfade=transition=fade:duration=$FADE:offset=18.0[vout]
  " \
  -map "[vout]" -c:v libx264 -preset medium -crf 22 -pix_fmt yuv420p \
  "$FINAL" -loglevel error

SIZE=$(du -h "$FINAL" | cut -f1)
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$FINAL" | cut -d. -f1)
echo ""
echo "✅ Reel hazır: $FINAL ($SIZE, ${DUR}s)"
