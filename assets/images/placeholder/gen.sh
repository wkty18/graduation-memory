#!/bin/bash
# Generate 10 artistic SVG placeholder images for album entries
cd "$(dirname "$0")"
gen() {
  local name="$1" w="$2" h="$3" c1="$4" c2="$5" kanji="$6" label="$7"
  local cx=$((w/2)) cy=$((h/2))
  cat > "$name.svg" <<EOF
<svg xmlns="http://www.w3.org/2000/svg" width="$w" height="$h" viewBox="0 0 $w $h">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="$c1"/>
      <stop offset="1" stop-color="$c2"/>
    </linearGradient>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.07 0"/></filter>
  </defs>
  <rect width="$w" height="$h" fill="url(#g)"/>
  <rect width="$w" height="$h" filter="url(#grain)"/>
  <circle cx="$cx" cy="$((cy-60))" r="$((w/6))" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="2"/>
  <text x="$cx" y="$((cy+35))" font-family="Songti SC, STSong, SimSun, serif" font-size="$((w/4))" fill="rgba(255,255,255,0.88)" text-anchor="middle">$kanji</text>
  <text x="$cx" y="$((cy+150))" font-family="Georgia, 'Times New Roman', serif" font-size="26" letter-spacing="10" fill="rgba(255,255,255,0.55)" text-anchor="middle">$label</text>
</svg>
EOF
}
gen chu-2023    1200 1500 '#A8BCC8' '#7E93A6' '初' '2023 · 09'
gen xia-2024    1200 1500 '#A9BFA4' '#7C9478' '夏' '2024 · 07'
gen ye-2025     1200 1500 '#4A4E5C' '#2E313D' '夜' '2025 · 03'
gen ben-2024    1500 1000 '#C29B7E' '#9A7458' '奔' '2024 · 04'
gen ju-2023     1500 1000 '#CBBFA8' '#A2906F' '聚' '2023 · 10'
gen du-2023     1200 1500 '#A8A08C' '#7E7765' '读' '2023 · 11'
gen shi-2024    1500 1000 '#93A67C' '#6C7E59' '食' '2024 · 05'
gen guang-2025  1200 1500 '#B7A0B8' '#8A718C' '光' '2025 · 06'
gen xiao-2024   1500 1000 '#B5BCC2' '#8A9299' '笑' '2024 · 12'
gen yuan-2026   1200 1500 '#C29AA0' '#9A7078' '远' '2026 · 06'
echo "generated: $(ls *.svg | wc -l) files"
