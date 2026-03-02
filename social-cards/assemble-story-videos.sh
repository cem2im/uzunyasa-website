#!/bin/bash
set -e

CARDS="$(dirname "$0")"
STORY_BG="$CARDS/story-saglik-testi"
STORY_OVERLAY="$CARDS/../social-posts/saglik-testi"
HERO_VIDEO="$CARDS/../assets/videos/hero-couple-running.mp4"
OUT_DIR="$CARDS/../social-posts/saglik-testi"
DUR=4

echo "🎬 Story videoları üretiliyor (5 adet, 4 saniye)..."
echo ""

# Story 1: Photo bg + Ken Burns + text overlay
echo "📱 Story 1: Merak — 'Sana bir soru...'"
ffmpeg -y -loop 1 -i "$STORY_BG/bg-story-01.png" -loop 1 -i "$STORY_OVERLAY/story-01.png" \
  -filter_complex "
    [0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,
    zoompan=z='1+0.10*in/(${DUR}*25)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=$((DUR*25)):s=1080x1920:fps=25,
    colorbalance=rs=0.03:gs=0.01:bs=-0.01,
    eq=brightness=-0.15:contrast=1.1[bg];
    [1:v]scale=1080:1920[ov];
    [bg][ov]overlay=0:0:format=auto[out]
  " -map "[out]" -t $DUR -c:v libx264 -crf 22 -preset fast -pix_fmt yuv420p -an \
  "$OUT_DIR/story-01-video.mp4" 2>/dev/null
echo "  ✅ story-01-video.mp4"

# Story 2: Doctor/patient bg + data overlay
echo "📱 Story 2: Farkındalık — Türkiye verisi"
ffmpeg -y -loop 1 -i "$STORY_BG/bg-story-02.png" -loop 1 -i "$STORY_OVERLAY/story-02.png" \
  -filter_complex "
    [0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,
    zoompan=z='1+0.08*in/(${DUR}*25)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=$((DUR*25)):s=1080x1920:fps=25,
    colorbalance=rs=0.02:gs=0.01,
    eq=brightness=-0.12:contrast=1.1[bg];
    [1:v]scale=1080:1920[ov];
    [bg][ov]overlay=0:0:format=auto[out]
  " -map "[out]" -t $DUR -c:v libx264 -crf 22 -preset fast -pix_fmt yuv420p -an \
  "$OUT_DIR/story-02-video.mp4" 2>/dev/null
echo "  ✅ story-02-video.mp4"

# Story 3: HERO VIDEO (couple running) + text overlay
echo "📱 Story 3: Umut — Harvard +14 yıl (hero video bg)"
ffmpeg -y -i "$HERO_VIDEO" -loop 1 -i "$STORY_OVERLAY/story-03.png" \
  -filter_complex "
    [0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,
    eq=brightness=-0.05:contrast=1.05[bg];
    [1:v]scale=1080:1920[ov];
    [bg][ov]overlay=0:0:format=auto[out]
  " -map "[out]" -t $DUR -c:v libx264 -crf 22 -preset fast -pix_fmt yuv420p -an \
  "$OUT_DIR/story-03-video.mp4" 2>/dev/null
echo "  ✅ story-03-video.mp4"

# Story 4: Phone/wellness bg + test preview
echo "📱 Story 4: Davet — 'Merak ettin mi?'"
ffmpeg -y -loop 1 -i "$STORY_BG/bg-story-04.png" -loop 1 -i "$STORY_OVERLAY/story-04.png" \
  -filter_complex "
    [0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,
    zoompan=z='1+0.08*in/(${DUR}*25)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=$((DUR*25)):s=1080x1920:fps=25,
    colorbalance=rs=0.02:gs=0.01,
    eq=brightness=-0.10:contrast=1.1[bg];
    [1:v]scale=1080:1920[ov];
    [bg][ov]overlay=0:0:format=auto[out]
  " -map "[out]" -t $DUR -c:v libx264 -crf 22 -preset fast -pix_fmt yuv420p -an \
  "$OUT_DIR/story-04-video.mp4" 2>/dev/null
echo "  ✅ story-04-video.mp4"

# Story 5: Community/park bg + CTA
echo "📱 Story 5: CTA — 'Hadi birlikte bakalım'"
ffmpeg -y -loop 1 -i "$STORY_BG/bg-story-05.png" -loop 1 -i "$STORY_OVERLAY/story-05.png" \
  -filter_complex "
    [0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,
    zoompan=z='1+0.10*in/(${DUR}*25)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=$((DUR*25)):s=1080x1920:fps=25,
    eq=brightness=-0.08:contrast=1.05[bg];
    [1:v]scale=1080:1920[ov];
    [bg][ov]overlay=0:0:format=auto[out]
  " -map "[out]" -t $DUR -c:v libx264 -crf 22 -preset fast -pix_fmt yuv420p -an \
  "$OUT_DIR/story-05-video.mp4" 2>/dev/null
echo "  ✅ story-05-video.mp4"

echo ""
echo "🎉 5 story video tamamlandı!"
for i in 01 02 03 04 05; do
  size=$(du -h "$OUT_DIR/story-${i}-video.mp4" | cut -f1)
  echo "  📹 story-${i}-video.mp4 → $size"
done
