const clamp = (value) => Math.max(0, Math.min(1, value));
const smooth = (value) => value ** 3 * (value * (value * 6 - 15) + 10);

// One light transfers between adjacent facts. Its total intensity stays at one
// during every handoff, with zero velocity/acceleration at the phase boundaries.
export function factHighlights(progress, count) {
  if (!Number.isInteger(count) || count < 1) return [];
  const position =
    clamp(Number.isFinite(progress) ? progress : 0) * (count + 1);
  const phase = Math.floor(position);
  const blend = smooth(position - phase);
  return Array.from({ length: count }, (_, index) => {
    if (index === phase - 1) return 1 - blend;
    if (index === phase) return blend;
    return 0;
  });
}
