import * as THREE from 'three';
import { ROUTE } from '../data/route.js';
import { projectWaypoint } from './geo.js';

// Builds the smooth 3D curve the road/terrain follow, plus lookup helpers
// keyed by arc-length distance along the route (in game meters).
export function buildRoute() {
  const points = ROUTE.map(wp => {
    const p = projectWaypoint(wp);
    return new THREE.Vector3(p.x, p.y, p.z);
  });

  const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.25);
  curve.arcLengthDivisions = 4000;

  const totalLength = curve.getLength();

  // Distance-along-route (meters) for every waypoint, used for town trigger
  // zones, the progress bar, and picking which state/biome applies at a
  // given point along the drive.
  const cumulative = [0];
  for (let i = 1; i < points.length; i++) {
    cumulative.push(cumulative[i - 1] + points[i - 1].distanceTo(points[i]));
  }
  // Rescale so the last cumulative distance matches the curve's true length.
  const scaleFix = totalLength / cumulative[cumulative.length - 1];
  const waypointDistances = cumulative.map(d => d * scaleFix);

  const waypoints = ROUTE.map((wp, i) => ({
    ...wp,
    distance: waypointDistances[i],
    position: points[i]
  }));

  function waypointIndexAtDistance(dist) {
    let i = 0;
    while (i < waypoints.length - 2 && waypoints[i + 1].distance < dist) i++;
    return i;
  }

  function infoAtDistance(dist) {
    const i = waypointIndexAtDistance(dist);
    const a = waypoints[i];
    const b = waypoints[Math.min(i + 1, waypoints.length - 1)];
    const span = Math.max(1e-6, b.distance - a.distance);
    const t = THREE.MathUtils.clamp((dist - a.distance) / span, 0, 1);
    return { from: a, to: b, t, segmentIndex: i };
  }

  function nearestTown(dist) {
    const { from, to, t } = infoAtDistance(dist);
    return t < 0.5 ? from : to;
  }

  return { curve, totalLength, waypoints, infoAtDistance, nearestTown };
}
