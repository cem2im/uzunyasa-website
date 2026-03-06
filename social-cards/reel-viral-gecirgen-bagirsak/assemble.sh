#!/bin/bash
# Assemble geçirgen bağırsak reel: background + slide overlay + voiceover
# Each slide duration matches its voiceover length + 0.5s padding

cd "$(dirname "$0")"

FADE=0.5
SLIDES=7

# Get audio durations
declare -a DURS
for i in $(seq 1 $SLIDES); do
  DURS[$i]=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 audio/voice-${i}.mp3)
  echo "Slide $i: ${DURS[$i]}s"
done

# Step 1: Create individual slide videos (bg + overlay + audio + Ken Burns)
echo ""
echo "=== Creating individual slide videos ==="
for i in $(seq 1 $SLIDES); do
  DUR=${DURS[$i]}
  # Add 0.8s padding after voice
  TOTAL_DUR=$(echo "$DUR + 0.8" | bc)
  
  echo "🎬 Slide $i (${TOTAL_DUR}s)..."
  
  # Ken Burns: slow zoom from 100% to 112% over the slide duration
  ffmpeg -y \
    -loop 1 -i backgrounds/bg-${i}-sized.png \
    -loop 1 -i slide-$(printf "%02d" $i).png \
    -i audio/voice-${i}.mp3 \
    -filter_complex "
      [0:v]scale=1080:1920,zoompan=z='1+0.0005*in':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${TOTAL_DUR}*30:s=1080x1920:fps=30[bg];
      [1:v]scale=1080:1920[overlay];
      [bg][overlay]overlay=0:0:format=auto[vid];
      [2:a]apad=pad_dur=0.8[aud]
    " \
    -map "[vid]" -map "[aud]" \
    -t $TOTAL_DUR \
    -c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p \
    -c:a aac -b:a 128k \
    segments/seg-${i}.mp4 2>/dev/null
  
  echo "✅ seg-${i}.mp4"
done

# Step 2: Concatenate all segments with xfade transitions
echo ""
echo "=== Concatenating with xfade ==="

# Create file list for concat
> concat-list.txt
for i in $(seq 1 $SLIDES); do
  echo "file 'segments/seg-${i}.mp4'" >> concat-list.txt
done

# Simple concat (no xfade for reliability)
ffmpeg -y -f concat -safe 0 -i concat-list.txt \
  -c:v libx264 -preset medium -crf 22 -pix_fmt yuv420p \
  -c:a aac -b:a 128k \
  gecirgen-bagirsak-reel.mp4 2>/dev/null

FINAL_DUR=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 gecirgen-bagirsak-reel.mp4)
FINAL_SIZE=$(stat -c%s gecirgen-bagirsak-reel.mp4)
FINAL_SIZE_MB=$(echo "scale=1; $FINAL_SIZE / 1048576" | bc)

echo ""
echo "🎉 REEL HAZIR!"
echo "   Dosya: gecirgen-bagirsak-reel.mp4"
echo "   Süre: ${FINAL_DUR}s"
echo "   Boyut: ${FINAL_SIZE_MB}MB"
