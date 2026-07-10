export const LOCATION_MODES = Object.freeze({
  BROWSE: "browse",
  NEARBY: "nearby",
});

export const LOCATION_PHASES = Object.freeze({
  IDLE: "idle",
  LOCATING: "locating",
  READY: "ready",
  DENIED: "denied",
  UNAVAILABLE: "unavailable",
  TIMEOUT: "timeout",
  UNSUPPORTED: "unsupported",
});

export const LOCATION_PERMISSIONS = Object.freeze({
  UNKNOWN: "unknown",
  PROMPT: "prompt",
  GRANTED: "granted",
  DENIED: "denied",
});

const VALID_MODES = new Set(Object.values(LOCATION_MODES));
const VALID_PHASES = new Set(Object.values(LOCATION_PHASES));
const VALID_PERMISSIONS = new Set(Object.values(LOCATION_PERMISSIONS));
const LOCATION_STALE_AFTER_MS = 5 * 60 * 1000;

export function createInitialLocationModel(overrides = {}) {
  return enforceLocationInvariants({
    mode: LOCATION_MODES.BROWSE,
    preference: null,
    phase: LOCATION_PHASES.IDLE,
    permission: LOCATION_PERMISSIONS.UNKNOWN,
    position: null,
    awaitingSettingsReturn: false,
    ...overrides,
  });
}

export function reduceLocationState(state, event) {
  const current = createInitialLocationModel(state);
  switch (event?.type) {
    case "HYDRATE":
      return enforceLocationInvariants({
        ...current,
        mode: event.preference === LOCATION_MODES.NEARBY ? LOCATION_MODES.NEARBY : LOCATION_MODES.BROWSE,
        preference: VALID_MODES.has(event.preference) ? event.preference : null,
        phase: VALID_PHASES.has(event.phase) ? event.phase : LOCATION_PHASES.IDLE,
        permission: normalizePermission(event.permission),
        position: null,
        awaitingSettingsReturn: false,
      });
    case "LOCATE_START":
      return enforceLocationInvariants({
        ...current,
        mode: LOCATION_MODES.NEARBY,
        preference: LOCATION_MODES.NEARBY,
        phase: LOCATION_PHASES.LOCATING,
        position: null,
        awaitingSettingsReturn: false,
      });
    case "LOCATE_SUCCESS":
      return enforceLocationInvariants({
        ...current,
        mode: LOCATION_MODES.NEARBY,
        preference: LOCATION_MODES.NEARBY,
        phase: LOCATION_PHASES.READY,
        permission: LOCATION_PERMISSIONS.GRANTED,
        position: normalizePosition(event.position),
        awaitingSettingsReturn: false,
      });
    case "LOCATE_FAILURE":
      return enforceLocationInvariants({
        ...current,
        mode: LOCATION_MODES.NEARBY,
        preference: LOCATION_MODES.NEARBY,
        phase: normalizeFailurePhase(event.phase),
        permission: event.phase === LOCATION_PHASES.DENIED ? LOCATION_PERMISSIONS.DENIED : current.permission,
        position: null,
      });
    case "CHOOSE_BROWSE":
      return enforceLocationInvariants({
        ...current,
        mode: LOCATION_MODES.BROWSE,
        preference: LOCATION_MODES.BROWSE,
        phase: LOCATION_PHASES.IDLE,
        position: null,
        awaitingSettingsReturn: false,
      });
    case "PERMISSION_CHANGE": {
      const permission = normalizePermission(event.permission);
      const hasAccess = permission === LOCATION_PERMISSIONS.GRANTED;
      return enforceLocationInvariants({
        ...current,
        permission,
        phase: !hasAccess && current.mode === LOCATION_MODES.NEARBY
          ? permission === LOCATION_PERMISSIONS.DENIED ? LOCATION_PHASES.DENIED : LOCATION_PHASES.IDLE
          : current.phase,
        position: hasAccess ? current.position : null,
      });
    }
    case "SETTINGS_HELP_OPENED":
      return enforceLocationInvariants({ ...current, awaitingSettingsReturn: true });
    case "SETTINGS_HELP_CLOSED":
      return enforceLocationInvariants({ ...current, awaitingSettingsReturn: false });
    default:
      return current;
  }
}

export function classifyLocationAccuracy(accuracyMeters) {
  const accuracy = Number(accuracyMeters);
  if (!Number.isFinite(accuracy) || accuracy < 0) return "unknown";
  if (accuracy <= 100) return "precise";
  if (accuracy <= 1000) return "approximate";
  return "low";
}

export function formatDistance(distanceKm, accuracyMeters = 0) {
  const distance = Number(distanceKm);
  if (!Number.isFinite(distance) || distance < 0) return "";
  const prefix = classifyLocationAccuracy(accuracyMeters) === "precise" ? "" : Number(accuracyMeters) > 100 ? "≈ " : "";
  if (distance < 1) {
    const meters = Math.max(0, Math.round((distance * 1000) / 10) * 10);
    return `${prefix}${meters} m`;
  }
  if (distance < 10) return `${prefix}${distance.toFixed(1)} km`;
  return `${prefix}${Math.round(distance)} km`;
}

export function haversineDistance(origin, destination) {
  if (!hasCoordinates(origin) || !hasCoordinates(destination)) return Number.POSITIVE_INFINITY;
  const radius = 6371;
  const dLat = toRad(Number(destination.lat) - Number(origin.lat));
  const dLng = toRad(Number(destination.lng) - Number(origin.lng));
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(Number(origin.lat))) * Math.cos(toRad(Number(destination.lat))) * Math.sin(dLng / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function sortRestaurantsForLocationMode(restaurants, state) {
  const items = Array.isArray(restaurants) ? [...restaurants] : [];
  if (state?.phase === LOCATION_PHASES.READY && hasCoordinates(state.position)) {
    return items.sort((a, b) => haversineDistance(state.position, a) - haversineDistance(state.position, b));
  }
  return items.sort((a, b) => {
    const updatedDifference = timestampOf(b.updated_at ?? b.updatedAt) - timestampOf(a.updated_at ?? a.updatedAt);
    if (updatedDifference) return updatedDifference;
    return String(a.name || a.id || "").localeCompare(String(b.name || b.id || ""));
  });
}

export function layoutBrowseMarkers(restaurants, bounds = {}) {
  const items = (Array.isArray(restaurants) ? restaurants : [])
    .map((restaurant) => ({ id: String(restaurant.id) }))
    .sort((a, b) => a.id.localeCompare(b.id));
  const width = Math.max(320, Number(bounds.width) || 900);
  const height = Math.max(320, Number(bounds.height) || 560);
  const markerWidth = width < 720 ? 86 : 104;
  const markerHeight = width < 720 ? 104 : 126;
  const minDx = (markerWidth / width) * 100;
  const minDy = (markerHeight / height) * 100;
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const points = items.map((item, index) => {
    if (items.length === 1) return { id: item.id, x: 50, y: 50 };
    const normalized = (index + 0.7) / Math.max(items.length, 2);
    const radius = 11 + Math.sqrt(normalized) * 31;
    const angle = goldenAngle * index + ((stableHash(item.id) % 31) - 15) / 100;
    return {
      id: item.id,
      x: 50 + Math.cos(angle) * radius,
      y: 50 + Math.sin(angle) * radius * 0.82,
    };
  });

  relaxMarkerCollisions(points, minDx, minDy);
  return points;
}

export function createLocationController({ gateway, preferenceStore, clock = Date, onChange = () => {} }) {
  let state = createInitialLocationModel();
  let attemptId = 0;
  let removePermissionObserver = null;

  const emit = (event) => {
    state = reduceLocationState(state, event);
    onChange(state, event);
    return state;
  };

  const savePreference = (mode) => {
    try {
      preferenceStore?.set?.(mode);
    } catch {
      // A blocked localStorage must not break location or browsing.
    }
  };

  const queryPermission = async () => {
    try {
      return normalizePermission(await gateway?.queryPermission?.());
    } catch {
      return LOCATION_PERMISSIONS.UNKNOWN;
    }
  };

  const locate = async ({ background = false } = {}) => {
    if (!gateway?.isSupported?.()) {
      emit({ type: "LOCATE_FAILURE", phase: LOCATION_PHASES.UNSUPPORTED });
      return state;
    }
    if (state.phase === LOCATION_PHASES.LOCATING) return state;
    savePreference(LOCATION_MODES.NEARBY);
    const thisAttempt = ++attemptId;
    emit({ type: "LOCATE_START" });
    try {
      const position = await gateway.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: background ? 60000 : 0,
      });
      if (thisAttempt !== attemptId || state.mode !== LOCATION_MODES.NEARBY) return state;
      emit({
        type: "LOCATE_SUCCESS",
        position: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          obtainedAt: Number(position.timestamp) || Number(clock.now()),
        },
      });
    } catch (error) {
      if (thisAttempt !== attemptId || state.mode !== LOCATION_MODES.NEARBY) return state;
      emit({ type: "LOCATE_FAILURE", phase: failurePhaseFromError(error) });
    }
    return state;
  };

  const handlePermissionChange = async (permission) => {
    const nextPermission = normalizePermission(permission);
    emit({ type: "PERMISSION_CHANGE", permission: nextPermission });
    if (nextPermission === LOCATION_PERMISSIONS.GRANTED && state.mode === LOCATION_MODES.NEARBY) {
      await locate({ background: true });
    }
  };

  return {
    getState: () => state,
    async bootstrap() {
      let preference = null;
      try {
        preference = preferenceStore?.get?.() ?? null;
      } catch {
        preference = null;
      }
      if (!gateway?.isSupported?.()) {
        emit({ type: "HYDRATE", preference, permission: LOCATION_PERMISSIONS.UNKNOWN, phase: LOCATION_PHASES.UNSUPPORTED });
        return state;
      }
      const permission = preference === LOCATION_MODES.BROWSE ? LOCATION_PERMISSIONS.UNKNOWN : await queryPermission();
      const phase = permission === LOCATION_PERMISSIONS.DENIED ? LOCATION_PHASES.DENIED : LOCATION_PHASES.IDLE;
      emit({ type: "HYDRATE", preference, permission, phase });
      removePermissionObserver = gateway?.observePermissionChange?.(handlePermissionChange) || null;
      if (preference === LOCATION_MODES.NEARBY && permission === LOCATION_PERMISSIONS.GRANTED) {
        await locate({ background: true });
      }
      return state;
    },
    requestNearby: () => locate({ background: false }),
    chooseBrowse() {
      attemptId += 1;
      savePreference(LOCATION_MODES.BROWSE);
      return emit({ type: "CHOOSE_BROWSE" });
    },
    openSettingsHelp() {
      return emit({ type: "SETTINGS_HELP_OPENED" });
    },
    closeSettingsHelp() {
      return emit({ type: "SETTINGS_HELP_CLOSED" });
    },
    async retryAfterSettings() {
      emit({ type: "SETTINGS_HELP_CLOSED" });
      const permission = await queryPermission();
      emit({ type: "PERMISSION_CHANGE", permission });
      return locate({ background: false });
    },
    async resume() {
      if (state.awaitingSettingsReturn) return this.retryAfterSettings();
      if (state.phase !== LOCATION_PHASES.READY || !state.position) return state;
      if (Number(clock.now()) - state.position.obtainedAt < LOCATION_STALE_AFTER_MS) return state;
      const permission = await queryPermission();
      if (permission !== LOCATION_PERMISSIONS.GRANTED) {
        emit({ type: "PERMISSION_CHANGE", permission });
        return state;
      }
      return locate({ background: true });
    },
    destroy() {
      attemptId += 1;
      removePermissionObserver?.();
      removePermissionObserver = null;
    },
  };
}

function enforceLocationInvariants(model) {
  const next = {
    mode: VALID_MODES.has(model.mode) ? model.mode : LOCATION_MODES.BROWSE,
    preference: VALID_MODES.has(model.preference) ? model.preference : null,
    phase: VALID_PHASES.has(model.phase) ? model.phase : LOCATION_PHASES.IDLE,
    permission: normalizePermission(model.permission),
    position: normalizePosition(model.position),
    awaitingSettingsReturn: Boolean(model.awaitingSettingsReturn),
  };
  if (next.mode === LOCATION_MODES.BROWSE || next.phase !== LOCATION_PHASES.READY) next.position = null;
  if (next.phase === LOCATION_PHASES.READY && !next.position) next.phase = LOCATION_PHASES.UNAVAILABLE;
  return next;
}

function normalizePosition(position) {
  if (!hasCoordinates(position)) return null;
  return {
    lat: Number(position.lat),
    lng: Number(position.lng),
    accuracy: Math.max(0, Number(position.accuracy) || 0),
    obtainedAt: Math.max(0, Number(position.obtainedAt) || 0),
  };
}

function normalizePermission(permission) {
  return VALID_PERMISSIONS.has(permission) ? permission : LOCATION_PERMISSIONS.UNKNOWN;
}

function normalizeFailurePhase(phase) {
  return [LOCATION_PHASES.DENIED, LOCATION_PHASES.UNAVAILABLE, LOCATION_PHASES.TIMEOUT, LOCATION_PHASES.UNSUPPORTED].includes(phase)
    ? phase
    : LOCATION_PHASES.UNAVAILABLE;
}

function failurePhaseFromError(error) {
  if (error?.code === 1) return LOCATION_PHASES.DENIED;
  if (error?.code === 3) return LOCATION_PHASES.TIMEOUT;
  return LOCATION_PHASES.UNAVAILABLE;
}

function hasCoordinates(value) {
  const lat = Number(value?.lat);
  const lng = Number(value?.lng);
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}

function timestampOf(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = Date.parse(value || "");
  return Number.isFinite(parsed) ? parsed : 0;
}

function stableHash(value) {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function relaxMarkerCollisions(points, minDx, minDy) {
  for (let pass = 0; pass < 12; pass += 1) {
    for (let a = 0; a < points.length; a += 1) {
      for (let b = a + 1; b < points.length; b += 1) {
        const first = points[a];
        const second = points[b];
        const dx = second.x - first.x;
        const dy = second.y - first.y;
        if (Math.abs(dx) >= minDx || Math.abs(dy) >= minDy) continue;
        const length = Math.hypot(dx, dy) || 1;
        const pushX = ((minDx - Math.abs(dx)) / 2 + 0.8) * (dx ? dx / length : a % 2 ? 1 : -1);
        const pushY = ((minDy - Math.abs(dy)) / 2 + 0.8) * (dy ? dy / length : b % 2 ? 1 : -1);
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
}

function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}
