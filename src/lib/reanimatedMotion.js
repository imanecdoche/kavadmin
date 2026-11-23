/**
 * ReAnimated & HoverItems Motion Engine for KAVADMIN
 *
 * Adapted directly from:
 * 1. com.pycodder.reanimated.anim.* (reanimated-26.1.2+1.7.1.jar)
 *    - Easing.java: clamp01, lerp, outCubic, outExpo, outBack, inOutCubic, press, approach
 *    - AnimProfile.java: durationMs=400, offsetY=15, cascadeDelayMs=45, pivot=CENTER, easing=OUT_CUBIC
 *    - ReAnimatedConfig.java:
 *      - containerDuration=0.45s, containerDistance=30px, containerEasing=OUT_BACK
 *      - transitionStyle=SLIDE_ZOOM, transitionSpeedTicks=3 (~150-200ms), transitionDistance=24px, TRANSITION_ZOOM=0.06
 *      - tooltipDurationMs=130, tooltipScale=0.92, tooltipOffsetY=5, tooltipEasing=OUT_CUBIC, GAP_MS=150
 *      - toastDurationMs=380, toastEasing=OUT_BACK
 *      - hoverScale=+0.07, hoverSpeed=14.0
 *      - pressScale=0.06 (0.94x), pressDuration=0.18s (25% outCubic compress -> 75% outBack release)
 * 2. me.cutebow.hover_items.* (HoverItems-1.0.0+26.1-26.2.jar)
 *    - HoverItemsHandledScreenMixin.java:
 *      - Hermite smoothstep: smooth(t) = t * t * (3 - 2 * t)
 *      - 3-stage damped bounce curve:
 *        [0.00 -> 0.25]: 1.0 -> peakScale
 *        [0.25 -> 0.60]: peakScale -> dipScale
 *        [0.60 -> 1.00]: dipScale -> targetScale
 *      - Interruptible smooth release from last scale back to 1.0
 */

// ============================================================================
// 1. PURE MATHEMATICAL FUNCTIONS (Easing.java & HoverItemsHandledScreenMixin)
// ============================================================================

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val))
}

export function clamp01(t) {
  return t < 0 ? 0 : t > 1 ? 1 : t
}

export function lerp(a, b, t) {
  return a + (b - a) * t
}

/** Hermite smoothstep from HoverItemsHandledScreenMixin.smooth(float) */
export function smoothstep(t) {
  const c = clamp01(t)
  return c * c * (3 - 2 * c)
}

/** Easing.outCubic: 1 - (1 - t)^3 */
export function outCubic(t) {
  const c = clamp01(t)
  const inv = 1 - c
  return 1 - inv * inv * inv
}

/** Easing.outExpo: 1 - 2^(-10t) */
export function outExpo(t) {
  const c = clamp01(t)
  return c >= 1 ? 1 : 1 - Math.pow(2, -10 * c)
}

/** Easing.outBack: 1 + c3*(t-1)^3 + c1*(t-1)^2 with c1 = 1.70158 */
export function outBack(t) {
  const c = clamp01(t)
  const c1 = 1.70158
  const c3 = 2.70158
  const p = c - 1
  return 1 + c3 * p * p * p + c1 * p * p
}

/** Easing.inOutCubic */
export function inOutCubic(t) {
  const c = clamp01(t)
  if (c < 0.5) return 4 * c * c * c
  const p = -2 * c + 2
  return 1 - (p * p * p) / 2
}

/**
 * Easing.press(float):
 * [0..0.25] -> outCubic(t / 0.25) (fast compression)
 * [0.25..1] -> 1 - outBack((t - 0.25) / 0.75) (springy release with slight rebound)
 */
export function pressCurve(t) {
  const c = clamp01(t)
  if (c < 0.25) {
    return outCubic(c / 0.25)
  }
  return 1 - outBack((c - 0.25) / 0.75)
}

/**
 * Easing.approach(current, target, speed, dt):
 * Frame-rate independent exponential decay interpolation
 */
export function approach(current, target, speed = 14.0, dt = 1 / 60) {
  const factor = clamp01(1 - Math.exp(-speed * dt))
  return current + (target - current) * factor
}

/**
 * HoverItems 3-stage smoothstep bounce scale evaluator
 * Adapted from HoverItemsHandledScreenMixin.hover_items$getHoverScale
 */
export function evaluateHoverItemsBounce(progress, targetScale = 1.06, bounceAmount = 0.04) {
  const t = clamp01(progress)
  const normBounce = clamp(bounceAmount / 0.2, 0, 1)
  const peakScale = targetScale + 0.6 * normBounce * (targetScale - 1)
  const dipScale = Math.max(0.3, targetScale - 0.3 * normBounce * (targetScale - 1))

  if (t < 0.25) {
    return lerp(1, peakScale, smoothstep(t / 0.25))
  }
  if (t < 0.6) {
    return lerp(peakScale, dipScale, smoothstep((t - 0.25) / 0.35))
  }
  return lerp(dipScale, targetScale, smoothstep((t - 0.6) / 0.4))
}

// ============================================================================
// 2. CUBIC-BEZIER & SPRING TOKENS FOR FRAMER MOTION / CSS
// ============================================================================

export const REANIMATED_EASING = {
  outCubic: [0.22, 1, 0.36, 1],
  outExpo: [0.16, 1, 0.3, 1],
  outBack: [0.34, 1.56, 0.64, 1],
  outBackSubtle: [0.34, 1.28, 0.64, 1],
  inOutCubic: [0.65, 0, 0.35, 1],
  snappyOut: [0.23, 1, 0.32, 1],
}

/**
 * ReAnimated Container / Modal Spring & Transition
 * Isotropic centered scaling (fixes aspect ratio distortion), OUT_BACK feel
 */
export const REANIMATED_MODAL_VARIANTS = {
  overlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.2, ease: REANIMATED_EASING.outCubic } },
    exit: { opacity: 0, transition: { duration: 0.16, ease: REANIMATED_EASING.outCubic } },
  },
  content: {
    initial: { opacity: 0, scale: 0.95, y: 16 },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 26,
        stiffness: 340,
        mass: 0.78,
        opacity: { duration: 0.16, ease: REANIMATED_EASING.outCubic },
      },
    },
    exit: {
      opacity: 0,
      scale: 0.97,
      y: 8,
      transition: {
        duration: 0.16,
        ease: REANIMATED_EASING.outCubic,
      },
    },
  },
}

/**
 * ReAnimated TransitionStyle.SLIDE_ZOOM for View / Screen Switchers
 * Distance = 24px (ReAnimatedConfig.transitionDistance), Zoom = 0.02..0.06
 */
export const REANIMATED_SLIDE_ZOOM_VARIANTS = {
  enter: (dir = 1) => ({
    x: dir > 0 ? 24 : dir < 0 ? -24 : 0,
    scale: 0.985,
    opacity: 0,
  }),
  center: {
    x: 0,
    scale: 1,
    opacity: 1,
    transition: {
      x: { duration: 0.2, ease: REANIMATED_EASING.snappyOut },
      scale: { duration: 0.2, ease: REANIMATED_EASING.outBackSubtle },
      opacity: { duration: 0.18, ease: 'easeOut' },
    },
  },
  exit: (dir = 1) => ({
    x: dir > 0 ? -24 : dir < 0 ? 24 : 0,
    scale: 0.985,
    opacity: 0,
    transition: {
      x: { duration: 0.16, ease: REANIMATED_EASING.snappyOut },
      scale: { duration: 0.15, ease: REANIMATED_EASING.snappyOut },
      opacity: { duration: 0.14, ease: 'easeOut' },
    },
  }),
}

/**
 * ReAnimated Cascade Stagger Profile (AnimProfile.java)
 * durationMs = 400ms, offsetY = 15px, cascadeDelayMs = 45ms (0.045s), easing = OUT_CUBIC
 */
export const REANIMATED_CASCADE_CONTAINER = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.01,
    },
  },
}

export const REANIMATED_CASCADE_ITEM = {
  hidden: { opacity: 0, y: 15, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.36,
      ease: REANIMATED_EASING.outCubic,
    },
  },
}
