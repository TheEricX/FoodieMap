export function validateCoordinates(lat, lng) {
  const parsedLat = Number(lat);
  const parsedLng = Number(lng);
  if (Number.isFinite(parsedLat) && Number.isFinite(parsedLng) && Math.abs(parsedLat) <= 90 && Math.abs(parsedLng) <= 180) {
    return { lat: parsedLat, lng: parsedLng };
  }
  return null;
}

export function parseGoogleMapsUrl(url) {
  if (!url || !isGoogleMapsUrl(url)) return null;
  const decoded = safeDecode(url);
  const atMatch = decoded.match(/@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/);
  const bangMatch = decoded.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  const queryMatch = decoded.match(/[?&](?:q|query|destination|ll)=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/);
  const coordinates = bangMatch || queryMatch || atMatch;
  const place = parseGoogleMapsPlace(decoded);
  if (!coordinates) return place.name || place.address ? place : null;
  return { lat: Number(coordinates[1]), lng: Number(coordinates[2]), ...place };
}

export function parseAppleMapsUrl(url) {
  if (!url || !isAppleMapsUrl(url)) return null;
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    return null;
  }
  const params = parsedUrl.searchParams;
  const queryCoordinates = parseCoordinatePair(params.get("q"));
  const coordinates = parseCoordinatePair(params.get("ll")) || parseCoordinatePair(params.get("sll")) || parseCoordinatePair(params.get("center")) || queryCoordinates;
  const queryText = cleanAppleMapsText(params.get("q") || "");
  const addressText = cleanAppleMapsText(params.get("address") || "");
  const result = {
    provider: "apple",
    name: queryText && !queryCoordinates && !looksLikeAddress(queryText) ? queryText : "",
    address: addressText || (queryText && looksLikeAddress(queryText) ? queryText : ""),
  };
  if (coordinates) Object.assign(result, coordinates);
  return result.lat != null || result.lng != null || result.name || result.address ? result : null;
}

export function parseMapUrl(url) {
  return parseGoogleMapsUrl(url) || parseAppleMapsUrl(url);
}

export function normalizeResolvedMapPlace(place) {
  if (!place || typeof place !== "object") return null;
  const coordinates = validateCoordinates(place.lat, place.lng);
  const normalized = { ...(coordinates || {}) };
  const name = String(place.name || "").trim();
  const address = String(place.address || "").trim();
  if (name) normalized.name = name;
  if (address) normalized.address = address;
  return Object.keys(normalized).length ? normalized : null;
}

export function isGoogleMapsShortLink(url) {
  return /^https?:\/\/(?:maps\.app\.goo\.gl|goo\.gl\/maps)\//i.test(url);
}

export function isGoogleMapsUrl(url) {
  return /^https?:\/\/(?:www\.google\.[^\s/]+\/maps|maps\.google\.[^\s/]+|maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(url);
}

export function isAppleMapsUrl(url) {
  return /^https?:\/\/maps\.apple\.com(?:\/|$|\?)/i.test(url);
}

export function isResolvableMapLink(url) {
  return isGoogleMapsShortLink(url);
}

export function extractGoogleMapsUrl(text) {
  return String(text || "").match(/https?:\/\/(?:www\.google\.[^\s/]+\/maps|maps\.google\.[^\s/]+|maps\.app\.goo\.gl|goo\.gl\/maps)[^\s)]*/i)?.[0] ?? "";
}

export function extractAppleMapsUrl(text) {
  return String(text || "").match(/https?:\/\/maps\.apple\.com[^\s)]*/i)?.[0] ?? "";
}

export function extractMapUrl(text) {
  return extractGoogleMapsUrl(text) || extractAppleMapsUrl(text);
}

export function sanitizeMapUrl(value) {
  let url = String(value || "").trim().replace(/^[<'"“”‘’\s]+/, "");
  while (/[>"'“”‘’\s),.;:!?，。；：！？]+$/.test(url)) url = url.slice(0, -1);
  return url;
}

function cleanAppleMapsText(value) {
  return safeDecode(String(value || "").replace(/\+/g, " ")).replace(/\s+/g, " ").trim();
}

function parseCoordinatePair(value) {
  const match = String(value || "").match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
  return match ? validateCoordinates(Number(match[1]), Number(match[2])) : null;
}

function parseGoogleMapsPlace(url) {
  const pathMatch = url.match(/\/maps\/place\/([^/@?]+)/);
  const queryText = parseGoogleMapsQueryText(url);
  const dataAddress = parseGoogleMapsDataAddress(url);
  const pathPlace = pathMatch ? splitPlaceAddressText(pathMatch[1].replace(/\+/g, " ")) : {};
  const queryPlace = queryText ? splitPlaceAddressText(queryText) : {};
  return {
    name: pathPlace.name || queryPlace.name || "",
    address: pathPlace.address || dataAddress || queryPlace.address || "",
  };
}

function parseGoogleMapsQueryText(url) {
  const query = url.split("?")[1] || "";
  if (!query) return "";
  const params = new URLSearchParams(query.split("#")[0]);
  const value = params.get("query") || params.get("q") || params.get("destination") || "";
  if (!value || /^-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?$/.test(value)) return "";
  return value.replace(/\+/g, " ").trim();
}

function parseGoogleMapsDataAddress(url) {
  const match = url.match(/!2s([^!]+)/);
  const value = match?.[1]?.replace(/\+/g, " ").trim() || "";
  return looksLikeAddress(value) ? value : "";
}

function splitPlaceAddressText(value) {
  const text = safeDecode(value).replace(/\s+/g, " ").trim();
  if (!text) return {};
  const parts = text.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2 && parts.slice(1).some(looksLikeAddress)) return { name: parts[0], address: parts.slice(1).join(", ") };
  return { name: text };
}

function looksLikeAddress(value) {
  return /\b\d{1,6}\b/.test(value) || /\b(?:street|st|road|rd|avenue|ave|boulevard|blvd|drive|dr|lane|ln|court|ct|way|place|pl|highway|hwy|king|queen|yonge|dundas)\b/i.test(value);
}

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
