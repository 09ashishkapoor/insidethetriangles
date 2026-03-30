#!/usr/bin/env bash
# optimize-image.sh
# Usage: ./optimize-image.sh /path/to/original.jpg
# Outputs two files (feature + card) into public/images/YYYY/MM/
set -euo pipefail
if [ "$#" -ne 1 ]; then
  echo "Usage: $0 /path/to/original.jpg"
  exit 2
fi
INFILE="$1"
if [ ! -f "$INFILE" ]; then
  echo "Input file not found: $INFILE"
  exit 2
fi
DATE_DIR="$(date +%Y/%m)"
OUT_DIR="public/images/$DATE_DIR"
mkdir -p "$OUT_DIR"
BASE_NAME="update-$(date +%Y-%m-%d)"
FEATURE_OUT="$OUT_DIR/${BASE_NAME}.jpg"
CARD_OUT="$OUT_DIR/${BASE_NAME}-card.jpg"
# Feature: max width 1600, progressive JPEG
convert "$INFILE" -strip -interlace Plane -quality 82 -resize 1600x\> "$FEATURE_OUT"
# Card: max width 600, progressive JPEG
convert "$INFILE" -strip -interlace Plane -quality 78 -resize 600x\> "$CARD_OUT"
# Optional further optimization if jpegoptim available
if command -v jpegoptim >/dev/null 2>&1; then
  jpegoptim --strip-all --max=85 "$FEATURE_OUT" "$CARD_OUT" || true
fi
# Print created files (site expects paths under /images/YYYY/MM/...)
echo "Created: $FEATURE_OUT"
echo "Created: $CARD_OUT"

echo "To use these images in the post, ensure front-matter points to /images/$(date +%Y)/$(date +%m)/${BASE_NAME}.jpg and -card.jpg"
