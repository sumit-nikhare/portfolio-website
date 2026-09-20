// Pure, reversible poses: scrolling to the same position always gives the same
// composition. Angles are radians; there are no accumulated rotations or loops.
export const sculptureStages = ["Assemble", "Unfold", "Resolve"];
export const clampUnit = (value) =>
  Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
export const sculptureCameraDistance = (aspect) =>
  Math.max(
    12.4,
    4.9 / (Math.tan((35 * Math.PI) / 360) * Math.max(0.1, aspect)),
  );
const mix = (a, b, t) => a + (b - a) * t;
const smoothstep = (t) => t * t * (3 - 2 * t);
const panel = (position, rotation, scale = 1, opacity = 1) => ({
  position,
  rotation,
  scale,
  opacity,
});
const poses = [
  Array.from({ length: 3 }, (_, i) => {
    const n = 1 - i;
    return panel(
      [n * 0.48, n * 0.42, n * 0.38],
      [n * 0.025, n * 0.035, n * 0.04],
    );
  }),
  [
    panel([-1.5, 1.1, 0.5], [0.08, -0.2, -0.12], 0.9),
    panel([1.6, 0.8, -0.2], [-0.06, 0.2, 0.12], 0.9),
    panel([0.1, -1.1, -0.4], [0.12, 0.08, -0.05], 0.9),
  ],
  [
    panel([-1.96, 1.32, 0], [0, 0, 0], 0.95),
    panel([1.96, 1.32, 0], [0, 0, 0], 0.95),
    panel([0, -1.32, 0], [0, 0, 0], 0.95),
  ],
];
const rotations = [
  [-0.11, -0.38, -0.22],
  [0.06, 0.12, -0.04],
  [0, 0, 0],
];

export function sampleSculpture(value) {
  const progress = clampUnit(value);
  const position = progress * (poses.length - 1);
  const segment = Math.min(poses.length - 2, Math.floor(position));
  const t = smoothstep(position - segment);
  const vector = (a, b) => a.map((number, i) => mix(number, b[i], t));
  return {
    progress,
    stage: Math.min(sculptureStages.length - 1, Math.floor(position + 0.5)),
    rotation: vector(rotations[segment], rotations[segment + 1]),
    panels: poses[segment].map((from, i) => {
      const to = poses[segment + 1][i];
      return panel(
        vector(from.position, to.position),
        vector(from.rotation, to.rotation),
        mix(from.scale, to.scale, t),
        mix(from.opacity, to.opacity, t),
      );
    }),
  };
}

export function settleValue(current, target, seconds, speed = 12) {
  const next = mix(
    current,
    target,
    1 - Math.exp(-speed * Math.min(0.05, Math.max(0, seconds))),
  );
  return Math.abs(target - next) < 0.0001 ? target : next;
}
