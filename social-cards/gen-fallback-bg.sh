#!/bin/bash
# Generate animated fallback backgrounds with ffmpeg
set -e
DIR="/home/clawdbot/.openclaw/workspace-uzunyasa/website/social-cards/reel-viral-yalnizlik"
DUR=5
FPS=30
W=1080
H=1920

echo "🎨 Generating fallback animated backgrounds..."

# BG1: Dark moody blue with slow-moving gradient (lonely city night feel)
echo "  BG1: Dark blue moody atmosphere..."
ffmpeg -y -f lavfi -i "color=c=#0a0a1a:s=${W}x${H}:d=${DUR}:r=${FPS}" \
  -f lavfi -i "color=c=#1a2a4a:s=${W}x${H}:d=${DUR}:r=${FPS}" \
  -filter_complex "[0:v][1:v]blend=all_mode=addition:all_opacity=0.5,
    noise=alls=15:allf=t,
    eq=brightness=-0.05:contrast=1.2:saturation=0.8,
    vignette=PI/3,
    zoompan=z='min(zoom+0.0003,1.05)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${DUR}*${FPS}:s=${W}x${H}:fps=${FPS},
    format=yuv420p" \
  -c:v libx264 -preset fast -crf 23 -t $DUR "$DIR/bg-01.mp4" 2>/dev/null
echo "    ✅"

# BG2: Dark red particles flowing (abstract organic)
echo "  BG2: Dark red particles..."
ffmpeg -y -f lavfi -i "color=c=#1a0505:s=${W}x${H}:d=${DUR}:r=${FPS}" \
  -filter_complex "[0:v]noise=alls=40:allf=t,
    hue=h=0:s=3,
    eq=brightness=-0.1:contrast=1.5:saturation=2,
    gblur=sigma=3,
    vignette=PI/2.5,
    zoompan=z='min(zoom+0.0005,1.08)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${DUR}*${FPS}:s=${W}x${H}:fps=${FPS},
    format=yuv420p" \
  -c:v libx264 -preset fast -crf 23 -t $DUR "$DIR/bg-02.mp4" 2>/dev/null
echo "    ✅"

# BG3: Dark background with subtle light particles (comparison visualization)
echo "  BG3: Dark with subtle light particles..."
ffmpeg -y -f lavfi -i "color=c=#0d0d12:s=${W}x${H}:d=${DUR}:r=${FPS}" \
  -filter_complex "[0:v]noise=alls=25:allf=t,
    eq=brightness=-0.08:contrast=1.8,
    gblur=sigma=2,
    vignette=PI/3,
    format=yuv420p" \
  -c:v libx264 -preset fast -crf 23 -t $DUR "$DIR/bg-03.mp4" 2>/dev/null
echo "    ✅"

# BG4: Dark red medical visualization (inflammation)
echo "  BG4: Dark medical red visualization..."
ffmpeg -y -f lavfi -i "color=c=#1a0808:s=${W}x${H}:d=${DUR}:r=${FPS}" \
  -f lavfi -i "color=c=#300a0a:s=${W}x${H}:d=${DUR}:r=${FPS}" \
  -filter_complex "[0:v][1:v]blend=all_mode=screen:all_opacity=0.3,
    noise=alls=30:allf=t,
    eq=brightness=-0.05:contrast=1.4:saturation=1.5,
    gblur=sigma=4,
    vignette=PI/2.5,
    zoompan=z='min(zoom+0.0004,1.06)':x='iw/2-(iw/zoom/2)':y='ih/3-(ih/zoom/3)':d=${DUR}*${FPS}:s=${W}x${H}:fps=${FPS},
    format=yuv420p" \
  -c:v libx264 -preset fast -crf 23 -t $DUR "$DIR/bg-04.mp4" 2>/dev/null
echo "    ✅"

# BG5: Warm golden light (gathering, togetherness)
echo "  BG5: Warm golden light..."
ffmpeg -y -f lavfi -i "color=c=#1a1505:s=${W}x${H}:d=${DUR}:r=${FPS}" \
  -f lavfi -i "color=c=#3a2a0a:s=${W}x${H}:d=${DUR}:r=${FPS}" \
  -filter_complex "[0:v][1:v]blend=all_mode=addition:all_opacity=0.4,
    noise=alls=20:allf=t,
    hue=h=40:s=2,
    eq=brightness=0.02:contrast=1.3:saturation=1.5,
    gblur=sigma=3,
    vignette=PI/3,
    zoompan=z='min(zoom+0.0003,1.05)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${DUR}*${FPS}:s=${W}x${H}:fps=${FPS},
    format=yuv420p" \
  -c:v libx264 -preset fast -crf 23 -t $DUR "$DIR/bg-05.mp4" 2>/dev/null
echo "    ✅"

# BG6: Teal and dark blue flowing (abstract)
echo "  BG6: Teal flowing abstract..."
ffmpeg -y -f lavfi -i "color=c=#051a1a:s=${W}x${H}:d=${DUR}:r=${FPS}" \
  -f lavfi -i "color=c=#0a2a2a:s=${W}x${H}:d=${DUR}:r=${FPS}" \
  -filter_complex "[0:v][1:v]blend=all_mode=addition:all_opacity=0.5,
    noise=alls=20:allf=t,
    hue=h=180:s=2.5,
    eq=brightness=-0.03:contrast=1.3:saturation=1.2,
    gblur=sigma=3,
    vignette=PI/3,
    zoompan=z='min(zoom+0.0004,1.06)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${DUR}*${FPS}:s=${W}x${H}:fps=${FPS},
    format=yuv420p" \
  -c:v libx264 -preset fast -crf 23 -t $DUR "$DIR/bg-06.mp4" 2>/dev/null
echo "    ✅"

echo ""
echo "🏁 All 6 fallback backgrounds generated!"
ls -lh "$DIR"/bg-*.mp4
