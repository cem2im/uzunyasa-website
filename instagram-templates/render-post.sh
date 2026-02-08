#!/bin/bash
# Usage: ./render-post.sh [template.html output.png | --all]
# Renders Instagram carousel templates to PNG using Playwright + Chromium
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ "$1" = "--all" ]; then
  echo "Rendering all posts from posts.json..."
  cd "$SCRIPT_DIR"
  node render.js
else
  if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: $0 template.html output.png"
    echo "       $0 --all"
    exit 1
  fi
  npx playwright screenshot --viewport-size=1080,1350 "$1" "$2"
fi
