#!/usr/bin/env bash
# Cut a short muted loop from a trailer for a case-file row.
# Usage: tools/clips.sh SRC START_SECONDS OUT [DURATION=12]
# 1920x1080 -> 960 wide by exact halving (flags=area keeps pixel art clean), 30 fps,
# H.264 high profile, no audio, faststart so it starts playing before it fully loads.
set -euo pipefail
src="$1" start="$2" out="$3" dur="${4:-12}"
ffmpeg -v error -y -ss "$start" -t "$dur" -i "$src" -an \
  -vf "scale=960:-2:flags=area,fps=30" \
  -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 27 -preset slow -movflags +faststart \
  "$out"
ls -l "$out"
