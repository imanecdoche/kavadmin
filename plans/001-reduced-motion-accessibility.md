# 001 — Support prefers-reduced-motion globally and disable Lenis smooth-scroll hijacking

- **Status**: DONE
- **Commit**: c2affdc
- **Severity**: HIGH
- **Category**: Accessibility
- **Estimated scope**: 2 files (`src/index.css`, `src/main.jsx`), ~35 lines

## Problem

The application provides zero accommodation for users who have enabled `prefers-reduced-motion: reduce` at the operating system level. Users with vestibular conditions, vertigo, or motion sensitivities are subjected to:
1. Compulsory 1.1-second inertial smooth-wheel hijacking across all pages via `ReactLenis`.
2. Screen-wide position translation and directional slides when switching dashboard views (`Dashboard.jsx`).
3. Elastic spring oscillations and scale pops on every modal and drawer opening.

Citations:
```javascript
/* src/main.jsx:60 — current */
<ReactLenis root options={{ lerp: 0.08, duration: 1.1, smoothWheel: true }}>
  <App />
</ReactLenis>
```

```css
/* src/index.css:56-65 — current */
* {
  @apply border-border;
}
body {
  background-color: #F3F3F3;
  color: #1A1A1A;
  font-family: 'Helvetica', Arial, -apple-system, BlinkMacSystemFont, sans-serif;
  @apply font-sans antialiased;
}
/* Note: Zero @media (prefers-reduced-motion) rules anywhere in file */
```

## Target

1. In `src/index.css`, add a respectful reduced-motion media block that cancels forced translation, scaling, and keyframe delays while preserving critical opacity feedback so state changes remain visible:

```css
/* target: src/index.css */
@media (prefers-reduced-motion: reduce) {
  *,
  ::before,
  ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

2. In `src/main.jsx`, configure `ReactLenis` to disable `smoothWheel` when reduced motion is preferred by the user:

```javascript
/* target: src/main.jsx */
const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// In render:
<ReactLenis
  root
  options={{
    lerp: prefersReducedMotion ? 1 : 0.08,
    duration: prefersReducedMotion ? 0 : 1.1,
    smoothWheel: !prefersReducedMotion,
  }}
>
  <App />
</ReactLenis>
```

## Repo conventions to follow

- Global styles live in `src/index.css`.
- Application root wrapper lives in `src/main.jsx`.
- Tailwind `@layer` structure is preserved.

## Steps

1. In `src/index.css`, append the `@media (prefers-reduced-motion: reduce)` block at the bottom of the base layer.
2. In `src/main.jsx`, create a helper `isReducedMotion()` or query `window.matchMedia('(prefers-reduced-motion: reduce)').matches` and feed `smoothWheel: !isReducedMotion` and `duration: isReducedMotion ? 0 : 1.1` to `<ReactLenis options={...}>`.

## Boundaries

- Do NOT delete the `ReactLenis` library or remove smooth scroll for users who do not have reduced motion enabled.
- Do NOT remove opacity fades — reduced motion eliminates disorientation from movement, not visibility cues.
- Do NOT touch business logic or component state.

## Verification

- **Mechanical**: Run `npm run build` — must complete with exit code 0.
- **Feel check**:
  1. Open Chrome DevTools $\rightarrow$ More Tools $\rightarrow$ Rendering $\rightarrow$ set "Emulate CSS media feature prefers-reduced-motion" to `prefers-reduced-motion: reduce`.
  2. Use mouse scroll wheel: page scrolling must immediately respond with native 1:1 hardware wheel ticks without 1.1s lag or lerp momentum.
  3. Open and close any modal or switch views: the transitions must execute instantly with simple opacity fade and zero spatial displacement (`translateX`/`scale`).
  4. Disable the emulation in DevTools: smooth scrolling and transitions must return to normal.
- **Done when**: `prefers-reduced-motion: reduce` completely stops forced smooth-wheel scrolling and spatial translation without throwing any console errors.
