#!/bin/bash
# Generate animated background videos with ffmpeg (fallback for when API credits are exhausted)
set -e

DIR="/home/clawdbot/.openclaw/workspace-uzunyasa/website/social-cards/reel-viral-adim"
DUR=5
FPS=30
RES="1080x1920"

echo "🎨 Generating animated backgrounds with ffmpeg..."

# BG1: Moving particles on dark blue (city walking vibe)
echo "   BG1: City walking particles..."
ffmpeg -y -f lavfi -i "color=c=#0a1628:s=${RES}:d=${DUR}:r=${FPS}" \
  -vf "
    drawtext=text='':fontcolor=white,
    geq=lum='if(lt(random(1)*1000,2),255,lum(X,Y))':cb=128:cr=128,
    boxblur=1:1,
    hue=h=220:s=2
  " \
  -c:v libx264 -pix_fmt yuv420p -preset ultrafast "$DIR/bg-01.mp4" 2>/dev/null || \
ffmpeg -y -f lavfi -i "color=c=#0a1628:s=${RES}:d=${DUR}:r=${FPS}" \
  -vf "format=yuv420p" \
  -c:v libx264 -preset ultrafast "$DIR/bg-01.mp4" 2>/dev/null
echo "   ✅ BG1"

# BG2: Warm dark retro with scanlines (Japanese 60s aesthetic)
echo "   BG2: Retro dark tones..."
ffmpeg -y -f lavfi -i "color=c=#1a0f0a:s=${RES}:d=${DUR}:r=${FPS}" \
  -f lavfi -i "nullsrc=s=${RES}:d=${DUR}:r=${FPS}" \
  -filter_complex "
    [1:v]geq=lum='if(mod(Y,4),20,0)':cb=128:cr=128[scanlines];
    [0:v][scanlines]blend=all_mode=addition:all_opacity=0.3,
    hue=h=30:s=1.5,
    format=yuv420p[out]
  " -map "[out]" -c:v libx264 -preset ultrafast "$DIR/bg-02.mp4" 2>/dev/null || \
ffmpeg -y -f lavfi -i "color=c=#1a0f0a:s=${RES}:d=${DUR}:r=${FPS}" \
  -vf "format=yuv420p" \
  -c:v libx264 -preset ultrafast "$DIR/bg-02.mp4" 2>/dev/null
echo "   ✅ BG2"

# BG3: Green data flowing upward on dark background
echo "   BG3: Green data visualization..."
ffmpeg -y -f lavfi -i "color=c=#050f05:s=${RES}:d=${DUR}:r=${FPS}" \
  -f lavfi -i "nullsrc=s=${RES}:d=${DUR}:r=${FPS}" \
  -filter_complex "
    [1:v]geq=lum='if(lt(random(1)*500,1),220,0)*if(gt(mod(Y+N*3,40),35),1,0)':cb=128:cr=100[data];
    [0:v][data]blend=all_mode=screen:all_opacity=0.7,
    hue=h=120:s=3,
    format=yuv420p[out]
  " -map "[out]" -c:v libx264 -preset ultrafast "$DIR/bg-03.mp4" 2>/dev/null || \
ffmpeg -y -f lavfi -i "gradients=s=${RES}:d=${DUR}:r=${FPS}:c0=#001a00:c1=#003300:speed=1" \
  -vf "format=yuv420p" \
  -c:v libx264 -preset ultrafast "$DIR/bg-03.mp4" 2>/dev/null || \
ffmpeg -y -f lavfi -i "color=c=#001a00:s=${RES}:d=${DUR}:r=${FPS}" \
  -vf "format=yuv420p" \
  -c:v libx264 -preset ultrafast "$DIR/bg-03.mp4" 2>/dev/null
echo "   ✅ BG3"

# BG4: Warm golden gradient (golden hour park)
echo "   BG4: Golden hour gradient..."
ffmpeg -y -f lavfi -i "color=c=#2a1f0a:s=${RES}:d=${DUR}:r=${FPS}" \
  -f lavfi -i "nullsrc=s=${RES}:d=${DUR}:r=${FPS}" \
  -filter_complex "
    [1:v]geq=lum='clip(255-Y/4+sin(N/15)*20,0,255)':cb=110:cr=140[grad];
    [0:v][grad]blend=all_mode=addition:all_opacity=0.4,
    format=yuv420p[out]
  " -map "[out]" -c:v libx264 -preset ultrafast "$DIR/bg-04.mp4" 2>/dev/null || \
ffmpeg -y -f lavfi -i "color=c=#2a1f0a:s=${RES}:d=${DUR}:r=${FPS}" \
  -vf "format=yuv420p" \
  -c:v libx264 -preset ultrafast "$DIR/bg-04.mp4" 2>/dev/null
echo "   ✅ BG4"

# BG5: Dark space with subtle red/green pulsing
echo "   BG5: Dark comparison space..."
ffmpeg -y -f lavfi -i "color=c=#0a0a0a:s=${RES}:d=${DUR}:r=${FPS}" \
  -vf "
    geq=r='clip(p(X,Y)+if(lt(X,540),sin(N/10)*15,0),0,30)':
        g='clip(p(X,Y)+if(gt(X,540),sin(N/10)*15,0),0,30)':
        b='p(X,Y)',
    format=yuv420p
  " \
  -c:v libx264 -preset ultrafast "$DIR/bg-05.mp4" 2>/dev/null || \
ffmpeg -y -f lavfi -i "color=c=#0a0a0a:s=${RES}:d=${DUR}:r=${FPS}" \
  -vf "format=yuv420p" \
  -c:v libx264 -preset ultrafast "$DIR/bg-05.mp4" 2>/dev/null
echo "   ✅ BG5"

# BG6: Teal-orange sunrise gradient
echo "   BG6: Sunrise teal-orange..."
ffmpeg -y -f lavfi -i "color=c=#0a2830:s=${RES}:d=${DUR}:r=${FPS}" \
  -f lavfi -i "nullsrc=s=${RES}:d=${DUR}:r=${FPS}" \
  -filter_complex "
    [1:v]geq=lum='clip(255-Y/5+sin(N/20)*10,0,255)':cb=100:cr=155[grad];
    [0:v][grad]blend=all_mode=addition:all_opacity=0.3,
    format=yuv420p[out]
  " -map "[out]" -c:v libx264 -preset ultrafast "$DIR/bg-06.mp4" 2>/dev/null || \
ffmpeg -y -f lavfi -i "color=c=#0a2830:s=${RES}:d=${DUR}:r=${FPS}" \
  -vf "format=yuv420p" \
  -c:v libx264 -preset ultrafast "$DIR/bg-06.mp4" 2>/dev/null
echo "   ✅ BG6"

echo ""
echo "🎉 All backgrounds generated:"
ls -la "$DIR"/bg-*.mp4
