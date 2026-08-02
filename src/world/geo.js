// Projects real lat/lon/elevation onto a flat local XZ game-space, preserving
// true geographic headings and relative distances between waypoints while
// compressing the ~4,700 km coast-to-coast trip down to a drivable size —
// the same "compressed but true-to-shape" trick long-haul driving sims use.

const KM_PER_DEG_LAT = 110.574;
const KM_PER_DEG_LON_AT_EQUATOR = 111.320;

// Reference latitude for the equirectangular projection (roughly the
// route's mean latitude), so east-west distances scale correctly.
const REF_LAT = 41.0;

// 1 real kilometer -> this many game-world meters. Keeps the whole
// coast-to-coast route at ~35-40 km of drivable road (roughly a
// 30-60 minute unhurried cross-country drive) while real road width,
// vehicle size, and town spacing all stay full-scale.
export const HORIZONTAL_SCALE = 0.008;

// Elevation uses a gentler multiplier than the horizontal compression so
// real mountain passes (Sierra Nevada, Rockies, Alleghenies) read as
// dramatic but drivable grades instead of cliffs.
export const ELEVATION_SCALE = 0.08;

export function projectLatLon(lat, lon) {
  const kmPerDegLon = KM_PER_DEG_LON_AT_EQUATOR * Math.cos((REF_LAT * Math.PI) / 180);
  const xKm = (lon - -98.0) * kmPerDegLon; // -98 deg ~ continental center, keeps coords near origin
  const zKm = (lat - REF_LAT) * KM_PER_DEG_LAT;
  return {
    x: xKm * HORIZONTAL_SCALE * 1000,
    z: -zKm * HORIZONTAL_SCALE * 1000
  };
}

export function projectWaypoint(wp) {
  const { x, z } = projectLatLon(wp.lat, wp.lon);
  const y = wp.elevM * ELEVATION_SCALE;
  return { x, y, z };
}
