#!/bin/bash
set -e
cd "$(dirname "$0")/slides"

# Slide durations (seconds)
HOOK_DUR=3
FACT_DUR=3
SUMMARY_DUR=4
CTA_DUR=3
FADE=0.4

# 1. Convert each slide to a video segment with slow zoom (Ken Burns)
# zoom: 1.0 → 1.05 over duration, centered
for slide in hook fact1 fact2 fact3 fact4 fact5 summary cta; do
  case $slide in
    hook)    DUR=$HOOK_DUR ;;
    summary) DUR=$SUMMARY_DUR ;;
    cta)     DUR=$CTA_DUR ;;
    *)       DUR=$FACT_DUR ;;
  esac
  
  FPS=30
  FRAMES=$((DUR * FPS))
  
  ffmpeg -y -loop 1 -i "${slide}.jpg" \
    -vf "scale=1134:2016,zoompan=z='1+0.0005*in':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${FRAMES}:s=1080x1920:fps=${FPS},format=yuv420p" \
    -c:v libx264 -profile:v high -pix_fmt yuv420p -t ${DUR} \
    "${slide}_vid.mp4" 2>/dev/null
  
  echo "✅ ${slide}_vid.mp4 (${DUR}s)"
done

# 2. Scale down to 720x1280 for Instagram (matching original reel size)
for slide in hook fact1 fact2 fact3 fact4 fact5 summary cta; do
  ffmpeg -y -i "${slide}_vid.mp4" \
    -vf "scale=720:1280,format=yuv420p" \
    -c:v libx264 -profile:v high -pix_fmt yuv420p \
    "${slide}_720.mp4" 2>/dev/null
  echo "  → ${slide}_720.mp4"
done

# 3. Concatenate with crossfade transitions
# First pair: hook + fact1
ffmpeg -y -i hook_720.mp4 -i fact1_720.mp4 \
  -filter_complex "[0:v][1:v]xfade=transition=fade:duration=${FADE}:offset=$((HOOK_DUR-1))[v01]" \
  -map "[v01]" -c:v libx264 -profile:v high -pix_fmt yuv420p \
  merge_01.mp4 2>/dev/null
echo "✅ merge hook+fact1"

# Add fact2
OFFSET=$(echo "$HOOK_DUR + $FACT_DUR - $FADE - 1" | bc)
ffmpeg -y -i merge_01.mp4 -i fact2_720.mp4 \
  -filter_complex "[0:v][1:v]xfade=transition=fade:duration=${FADE}:offset=${OFFSET}[v]" \
  -map "[v]" -c:v libx264 -profile:v high -pix_fmt yuv420p \
  merge_02.mp4 2>/dev/null
echo "✅ merge +fact2"

# Add fact3
OFFSET=$(echo "$OFFSET + $FACT_DUR - $FADE" | bc)
ffmpeg -y -i merge_02.mp4 -i fact3_720.mp4 \
  -filter_complex "[0:v][1:v]xfade=transition=fade:duration=${FADE}:offset=${OFFSET}[v]" \
  -map "[v]" -c:v libx264 -profile:v high -pix_fmt yuv420p \
  merge_03.mp4 2>/dev/null
echo "✅ merge +fact3"

# Add fact4
OFFSET=$(echo "$OFFSET + $FACT_DUR - $FADE" | bc)
ffmpeg -y -i merge_03.mp4 -i fact4_720.mp4 \
  -filter_complex "[0:v][1:v]xfade=transition=fade:duration=${FADE}:offset=${OFFSET}[v]" \
  -map "[v]" -c:v libx264 -profile:v high -pix_fmt yuv420p \
  merge_04.mp4 2>/dev/null
echo "✅ merge +fact4"

# Add fact5
OFFSET=$(echo "$OFFSET + $FACT_DUR - $FADE" | bc)
ffmpeg -y -i merge_04.mp4 -i fact5_720.mp4 \
  -filter_complex "[0:v][1:v]xfade=transition=fade:duration=${FADE}:offset=${OFFSET}[v]" \
  -map "[v]" -c:v libx264 -profile:v high -pix_fmt yuv420p \
  merge_05.mp4 2>/dev/null
echo "✅ merge +fact5"

# Add summary
OFFSET=$(echo "$OFFSET + $FACT_DUR - $FADE" | bc)
ffmpeg -y -i merge_05.mp4 -i summary_720.mp4 \
  -filter_complex "[0:v][1:v]xfade=transition=fade:duration=${FADE}:offset=${OFFSET}[v]" \
  -map "[v]" -c:v libx264 -profile:v high -pix_fmt yuv420p \
  merge_06.mp4 2>/dev/null
echo "✅ merge +summary"

# Add CTA
OFFSET=$(echo "$OFFSET + $SUMMARY_DUR - $FADE" | bc)
ffmpeg -y -i merge_06.mp4 -i cta_720.mp4 \
  -filter_complex "[0:v][1:v]xfade=transition=fade:duration=${FADE}:offset=${OFFSET}[v]" \
  -map "[v]" -c:v libx264 -profile:v high -pix_fmt yuv420p \
  ../oral-wegovy-reel-final.mp4 2>/dev/null

echo ""
echo "🎬 Final reel: oral-wegovy-reel-final.mp4"
ls -la ../oral-wegovy-reel-final.mp4
