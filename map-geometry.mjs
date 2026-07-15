const PLACEHOLDERS = [
  { icon: "🍜", top: "#f4c49d", bottom: "#fff7ed", accent: "#96694c" },
  { icon: "🥘", top: "#dce6af", bottom: "#fffaf4", accent: "#7a8450" },
  { icon: "🍰", top: "#f7d8cd", bottom: "#fff8f0", accent: "#b58a6b" },
  { icon: "🥗", top: "#cfe5cf", bottom: "#fffdf8", accent: "#556030" },
  { icon: "🍣", top: "#f4dfb8", bottom: "#fffaf4", accent: "#d4a373" },
  { icon: "☕", top: "#ead8c9", bottom: "#fff8f0", accent: "#68442d" },
];

export function clampMapPan(x, y, { width = 0, height = 0, limitRatio = 0.42 } = {}) {
  const maxX = Math.max(0, Number(width) * limitRatio);
  const maxY = Math.max(0, Number(height) * limitRatio);
  return {
    x: Math.max(-maxX, Math.min(maxX, Number(x) || 0)),
    y: Math.max(-maxY, Math.min(maxY, Number(y) || 0)),
  };
}

export function getBearing(origin, destination) {
  const lat1 = toRad(origin.lat);
  const lat2 = toRad(destination.lat);
  const dLng = toRad(destination.lng - origin.lng);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

export function mapPoint(distanceKm, bearing, index, zoom = 1) {
  const radius = Math.min((Math.max(0, Number(distanceKm) || 0) / 15) * 38 * zoom, 44);
  const jitter = ((Number(index) % 5) - 2) * 1.1;
  const angle = toRad(bearing);
  return {
    x: 50 + Math.sin(angle) * radius + jitter,
    y: 50 - Math.cos(angle) * radius - jitter,
  };
}

export function layoutRelativeMarkers(items, {
  currentLocation = null,
  zoom = 1,
  width = 900,
  height = 560,
  distanceBetween,
} = {}) {
  const mapWidth = Math.max(320, Number(width) || 900);
  const mapHeight = Math.max(320, Number(height) || 560);
  const markerWidth = mapWidth < 720 ? 86 : 104;
  const markerHeight = mapWidth < 720 ? 104 : 126;
  const minDx = (markerWidth / mapWidth) * 100;
  const minDy = (markerHeight / mapHeight) * 100;
  const distance = typeof distanceBetween === "function" ? distanceBetween : () => 0;
  const points = (Array.isArray(items) ? items : []).map((restaurant, index) => {
    const distanceKm = currentLocation ? distance(currentLocation, restaurant) : 0;
    const bearing = currentLocation ? getBearing(currentLocation, restaurant) : index * 137;
    return { id: restaurant.id, ...mapPoint(distanceKm, bearing, index, zoom) };
  });

  for (let pass = 0; pass < 10; pass += 1) {
    for (let firstIndex = 0; firstIndex < points.length; firstIndex += 1) {
      for (let secondIndex = firstIndex + 1; secondIndex < points.length; secondIndex += 1) {
        const first = points[firstIndex];
        const second = points[secondIndex];
        const dx = second.x - first.x;
        const dy = second.y - first.y;
        if (Math.abs(dx) >= minDx || Math.abs(dy) >= minDy) continue;
        const length = Math.hypot(dx, dy) || 1;
        const pushX = ((minDx - Math.abs(dx)) / 2 + 0.8) * (dx ? dx / length : firstIndex % 2 ? 1 : -1);
        const pushY = ((minDy - Math.abs(dy)) / 2 + 0.8) * (dy ? dy / length : secondIndex % 2 ? 1 : -1);
        first.x -= pushX;
        first.y -= pushY;
        second.x += pushX;
        second.y += pushY;
      }
    }
    points.forEach((point) => {
      point.x = Math.max(7, Math.min(93, point.x));
      point.y = Math.max(10, Math.min(90, point.y));
    });
  }
  return new Map(points.map((point) => [point.id, { x: point.x, y: point.y }]));
}

export function foodPlaceholderUrl(id, variant = 0) {
  const preset = PLACEHOLDERS[Math.abs(Number(variant) || 0) % PLACEHOLDERS.length];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 180">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="${preset.top}"/>
          <stop offset="1" stop-color="${preset.bottom}"/>
        </linearGradient>
        <pattern id="dots" width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1.2" fill="${preset.accent}" opacity=".16"/>
        </pattern>
      </defs>
      <rect width="240" height="180" rx="28" fill="url(#g)"/>
      <rect width="240" height="180" fill="url(#dots)"/>
      <circle cx="120" cy="92" r="54" fill="#fffaf4" opacity=".72"/>
      <text x="120" y="111" text-anchor="middle" font-size="62">${preset.icon}</text>
      <path d="M38 148 C80 132 148 168 202 143" fill="none" stroke="${preset.accent}" stroke-width="8" stroke-linecap="round" opacity=".28"/>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}

function toDeg(radians) {
  return (radians * 180) / Math.PI;
}
