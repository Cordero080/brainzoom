// Numeric helpers shared by the 3D scenes.
export const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));

export const lerp = (a, b, t) => a + (b - a) * t;

// Smoothstep "fade" between [from, to]
export const range = (v, from, to) => clamp((v - from) / (to - from));

export const smooth = (t) => t * t * (3 - 2 * t);

// Fade in / fade out for stage opacities.
// fadeIn over [start, start + ramp], hold, fadeOut over [end - ramp, end]
export const stageOpacity = (p, start, end, ramp = 0.06) => {
  if (p < start - ramp) return 0;
  if (p > end + ramp) return 0;
  const fadeIn = smooth(range(p, start - ramp, start + ramp));
  const fadeOut = 1 - smooth(range(p, end - ramp, end + ramp));
  return Math.max(0, Math.min(fadeIn, fadeOut));
};
