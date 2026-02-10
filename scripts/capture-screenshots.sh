#!/usr/bin/env bash
#
# capture-screenshots.sh — Capture app screenshots for the marketing website
#
# Usage:
#   ./capture-screenshots.sh <name>     Capture a specific screenshot
#   ./capture-screenshots.sh --list     Show status of all required screenshots
#   ./capture-screenshots.sh --help     Show this help
#
# Prerequisites: A simulator must be booted with the app running.
# Navigate to the correct screen BEFORE running each capture.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="${SCRIPT_DIR}/../images/screenshots"

# Required screenshots: name|description|navigation hint
SCREENSHOTS=(
  "home-menu-clean|Home Menu — main menu with game title and mode buttons|Open the app to the main menu"
  "game-setup|Game Setup — difficulty slider, game length, category picker|Tap 'Solo Adventure' from the main menu"
  "categories|Category Picker — grid of 8-12 category tiles|Tap 'Solo Adventure' > tap the category selector"
  "gameplay-timeline|Gameplay — timeline sorting mechanic in action|Start a game, play at least one round"
  "results-screen|Results — score breakdown, ranking, accuracy|Finish a game to see the results"
)

print_help() {
  cat <<'EOF'
capture-screenshots.sh — Capture app screenshots for the marketing website

Usage:
  ./capture-screenshots.sh <name>     Capture a specific screenshot
  ./capture-screenshots.sh --list     Show status of all required screenshots
  ./capture-screenshots.sh --help     Show this help

Valid names:
  home-menu-clean      Home Menu
  game-setup           Game Setup screen
  categories           Category Picker grid
  gameplay-timeline    Gameplay / timeline sorting
  results-screen       Results / score breakdown

The script uses 'xcrun simctl io booted screenshot' — a simulator must be
booted. Navigate to the correct screen BEFORE running the capture.
EOF
}

list_screenshots() {
  echo ""
  echo "=== MKT-002.1 Screenshot Inventory ==="
  echo ""
  printf "%-22s %-10s %-8s  %s\n" "NAME" "STATUS" "SIZE" "DESCRIPTION"
  printf "%-22s %-10s %-8s  %s\n" "----" "------" "----" "-----------"

  local captured=0 missing=0 total=${#SCREENSHOTS[@]}

  for entry in "${SCREENSHOTS[@]}"; do
    IFS='|' read -r name desc hint <<< "$entry"
    local file="${OUTPUT_DIR}/${name}.png"

    if [[ -f "$file" ]]; then
      local size
      size=$(du -h "$file" | cut -f1 | xargs)
      printf "%-22s %-10s %-8s  %s\n" "$name" "EXISTS" "$size" "$desc"
      captured=$((captured + 1))
    else
      printf "%-22s %-10s %-8s  %s\n" "$name" "MISSING" "--" "$desc"
      missing=$((missing + 1))
    fi
  done

  echo ""
  echo "Captured: ${captured}/${total}    Missing: ${missing}/${total}"
  echo "Output directory: ${OUTPUT_DIR}"
  echo ""
}

capture_screenshot() {
  local target="$1"
  local found=0

  for entry in "${SCREENSHOTS[@]}"; do
    IFS='|' read -r name desc hint <<< "$entry"
    if [[ "$name" == "$target" ]]; then
      found=1
      break
    fi
  done

  if [[ $found -eq 0 ]]; then
    echo "ERROR: Unknown screenshot name '${target}'"
    echo "Run with --list to see valid names."
    exit 1
  fi

  local file="${OUTPUT_DIR}/${name}.png"

  echo ""
  echo "=== Capturing: ${name} ==="
  echo "Description: ${desc}"
  echo "Navigation:  ${hint}"
  echo "Output:      ${file}"
  echo ""

  if [[ -f "$file" ]]; then
    echo "WARNING: ${file} already exists."
    read -rp "Overwrite? [y/N] " confirm
    if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
      echo "Skipped."
      exit 0
    fi
  fi

  if ! xcrun simctl list devices booted 2>/dev/null | grep -q "Booted"; then
    echo "ERROR: No simulator is currently booted."
    exit 1
  fi

  mkdir -p "$OUTPUT_DIR"

  echo "Capturing..."
  if xcrun simctl io booted screenshot "$file"; then
    if [[ -f "$file" ]]; then
      local size
      size=$(du -h "$file" | cut -f1 | xargs)
      echo "SUCCESS: ${file} (${size})"
    else
      echo "ERROR: Command succeeded but file not created."
      exit 1
    fi
  else
    echo "ERROR: Screenshot capture failed."
    exit 1
  fi
  echo ""
}

# ─── Main ────────────────────────────────────────────────────────────────────

if [[ $# -eq 0 ]]; then
  print_help
  exit 0
fi

case "$1" in
  --help|-h)  print_help ;;
  --list|-l)  list_screenshots ;;
  *)          capture_screenshot "$1" ;;
esac
