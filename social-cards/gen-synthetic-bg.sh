#!/bin/bash
# Generate synthetic animated backgrounds for viral reel (ffmpeg-based)
set -e
cd /home/clawdbot/.openclaw/workspace-uzunyasa/website/social-cards
DIR="reel-viral-kas"
DUR=5
FPS=30
W=1080
H=1920

echo "🎨 Generating synthetic backgrounds..."

# BG1: Dark blue cinematic - slow gradient movement
echo "  [bg-01] Dark blue cinematic..."
ffmpeg -y -f lavfi -i "color=c=#0a1628:s=${W}x${H}:d=${DUR}:r=${FPS}" \
  -f lavfi -i "color=c=#1a3a5c:s=${W}x${H}:d=${DUR}:r=${FPS}" \
  -filter_complex "[0:v][1:v]blend=all_expr='A*(1-Y/H*0.6)+B*(Y/H*0.6)',format=yuv420p,
    noise=alls=3:allf=t+u,
    eq=brightness=-0.05:contrast=1.1[out]" \
  -map "[out]" -c:v libx264 -preset fast -crf 23 "$DIR/bg-01.mp4" 2>/dev/null
echo "  ✅ bg-01"

# BG2: Red/dark medical - pulsing red glow
echo "  [bg-02] Red muscular glow..."
ffmpeg -y -f lavfi -i "color=c=#1a0000:s=${W}x${H}:d=${DUR}:r=${FPS}" \
  -vf "format=yuv420p,
    drawbox=x=0:y=0:w=iw:h=ih:color=0x330000@0.3:t=fill,
    noise=alls=5:allf=t,
    eq=brightness='0.03*sin(2*PI*t/2.5)':contrast=1.2:saturation=1.5,
    vignette=PI/3" \
  -c:v libx264 -preset fast -crf 23 -t $DUR "$DIR/bg-02.mp4" 2>/dev/null
echo "  ✅ bg-02"

# BG3: Dark abstract aging - slow color shift
echo "  [bg-03] Dark abstract aging..."
ffmpeg -y -f lavfi -i "color=c=#0d0d12:s=${W}x${H}:d=${DUR}:r=${FPS}" \
  -vf "format=yuv420p,
    noise=alls=8:allf=t+u,
    eq=brightness='0.02*sin(2*PI*t/3)':contrast=1.15,
    hue=H='10*sin(2*PI*t/4)',
    vignette=PI/2.5" \
  -c:v libx264 -preset fast -crf 23 -t $DUR "$DIR/bg-03.mp4" 2>/dev/null
echo "  ✅ bg-03"

# BG4: Dark teal scientific lab
echo "  [bg-04] Teal scientific..."
ffmpeg -y -f lavfi -i "color=c=#0a1a1f:s=${W}x${H}:d=${DUR}:r=${FPS}" \
  -f lavfi -i "color=c=#0d3040:s=${W}x${H}:d=${DUR}:r=${FPS}" \
  -filter_complex "[0:v][1:v]blend=all_expr='A*(1-Y/H*0.5)+B*(Y/H*0.5)',format=yuv420p,
    noise=alls=4:allf=t,
    eq=brightness='0.02*sin(2*PI*t/2)':contrast=1.15,
    vignette=PI/3[out]" \
  -map "[out]" -c:v libx264 -preset fast -crf 23 "$DIR/bg-04.mp4" 2>/dev/null
echo "  ✅ bg-04"

# BG5: Dramatic dark gym lighting
echo "  [bg-05] Dramatic gym lighting..."
ffmpeg -y -f lavfi -i "color=c=#121015:s=${W}x${H}:d=${DUR}:r=${FPS}" \
  -vf "format=yuv420p,
    noise=alls=6:allf=t+u,
    eq=brightness='0.04*sin(2*PI*t/1.8)':contrast=1.3:saturation=0.8,
    vignette=PI/2" \
  -c:v libx264 -preset fast -crf 23 -t $DUR "$DIR/bg-05.mp4" 2>/dev/null
echo "  ✅ bg-05"

# BG6: Teal gradient with subtle motion
echo "  [bg-06] Teal gradient flow..."
ffmpeg -y -f lavfi -i "color=c=#0a2a2a:s=${W}x${H}:d=${DUR}:r=${FPS}" \
  -f lavfi -i "color=c=#1a4a4a:s=${W}x${H}:d=${DUR}:r=${FPS}" \
  -filter_complex "[0:v][1:v]blend=all_expr='A*(1-(Y+40*sin(2*PI*T/3+X/200))/H*0.7)+B*((Y+40*sin(2*PI*T/3+X/200))/H*0.7)',format=yuv420p,
    noise=alls=3:allf=t,
    eq=brightness='0.015*sin(2*PI*t/2.5)':contrast=1.1,
    vignette=PI/4[out]" \
  -map "[out]" -c:v libx264 -preset fast -crf 23 "$DIR/bg-06.mp4" 2>/dev/null
echo "  ✅ bg-06"

echo ""
echo "=== RESULTS ==="
for i in 01 02 03 04 05 06; do
  f="$DIR/bg-${i}.mp4"
  if [ -f "$f" ]; then
    size=$(du -h "$f" | cut -f1)
    echo "✅ bg-${i}.mp4 — $size"
  else
    echo "❌ bg-${i}.mp4 — MISSING"
  fi
done
