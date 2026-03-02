#!/bin/bash
set -e

DIR="$(dirname "$0")/reel-saglik-testi"
OUT="$(dirname "$0")/../social-posts/saglik-testi/reel-saglik-testi.mp4"
SLIDE_DUR=3.3
FADE_DUR=0.5
TOTAL_SLIDES=7

echo "🎬 Reel montajı başlıyor..."

# Step 1: Create individual segments (bg + overlay + Ken Burns)
for i in $(seq 1 $TOTAL_SLIDES); do
  idx=$(printf "%02d" $i)
  bg="$DIR/bg-${idx}.png"
  slide="$DIR/slide-${idx}.png"
  seg="$DIR/seg-${idx}.mp4"
  
  if [ ! -f "$bg" ]; then
    echo "⚠️ bg-${idx}.png bulunamadı, skip"
    continue
  fi
  
  echo "  📹 Segment $i: bg + overlay + Ken Burns zoom"
  
  # Ken Burns: slow zoom 12% over duration, with warm overlay
  ffmpeg -y -loop 1 -i "$bg" -loop 1 -i "$slide" \
    -filter_complex "
      [0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,
      zoompan=z='1+0.12*in/(83)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=83:s=1080x1920:fps=25,
      colorbalance=rs=0.05:gs=0.02:bs=-0.02,
      eq=brightness=0.02:contrast=1.05[bg];
      [1:v]scale=1080:1920[ov];
      [bg][ov]overlay=0:0:format=auto[out]
    " \
    -map "[out]" -t $SLIDE_DUR \
    -c:v libx264 -crf 23 -preset fast -pix_fmt yuv420p -an \
    "$seg" 2>/dev/null
    
  echo "  ✅ seg-${idx}.mp4"
done

# Step 2: Concatenate with xfade transitions
echo ""
echo "🔗 xfade ile birleştiriliyor..."

# Build the complex filter for xfade
# For 7 segments: 6 xfade operations
INPUTS=""
FILTER=""
PREV="[0:v]"

for i in $(seq 1 $TOTAL_SLIDES); do
  idx=$(printf "%02d" $i)
  INPUTS="$INPUTS -i $DIR/seg-${idx}.mp4"
done

# Calculate xfade offsets
# offset = cumulative_duration - fade_duration for each merge
CUM=0
for i in $(seq 0 $((TOTAL_SLIDES - 2))); do
  NEXT_IDX=$((i + 1))
  if [ $i -eq 0 ]; then
    OFFSET=$(echo "$SLIDE_DUR - $FADE_DUR" | bc)
    FILTER="${FILTER}[0:v][1:v]xfade=transition=fade:duration=${FADE_DUR}:offset=${OFFSET}[v1];"
    PREV="[v1]"
    CUM=$(echo "$SLIDE_DUR + $SLIDE_DUR - $FADE_DUR" | bc)
  else
    OFFSET=$(echo "$CUM - $FADE_DUR" | bc)
    OUT_LABEL="[v${NEXT_IDX}]"
    FILTER="${FILTER}${PREV}[$((i+1)):v]xfade=transition=fade:duration=${FADE_DUR}:offset=${OFFSET}${OUT_LABEL};"
    PREV="$OUT_LABEL"
    CUM=$(echo "$CUM + $SLIDE_DUR - $FADE_DUR" | bc)
  fi
done

# Remove trailing semicolon
FILTER="${FILTER%;}"

echo "  Filter: $FILTER"

ffmpeg -y $INPUTS \
  -filter_complex "$FILTER" \
  -map "$PREV" \
  -c:v libx264 -crf 22 -preset slow -pix_fmt yuv420p \
  -movflags +faststart -an \
  "$OUT" 2>/dev/null

SIZE=$(du -h "$OUT" | cut -f1)
DUR=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$OUT")

echo ""
echo "🎉 Reel tamamlandı!"
echo "  📁 $OUT"
echo "  ⏱️ ${DUR}s"
echo "  📦 $SIZE"
