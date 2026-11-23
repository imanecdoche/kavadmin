# 003 — Fix dashboard view switcher transition easing, duration, and sluggish layout animations

- **Status**: DONE
- **Commit**: c2affdc
- **Severity**: HIGH
- **Category**: Easing & duration
- **Estimated scope**: 1 file (`src/components/Dashboard.jsx`), ~35 lines

## Problem

In [`src/components/Dashboard.jsx`](file:///media/fatihfarhat/New%20Volume1/PROJECTS/kavadmin-main/src/components/Dashboard.jsx#L285-L315), the view switcher between "Daftar Siswa" and "Matriks Jadwal" has multiple motion anti-patterns:

```javascript
/* src/components/Dashboard.jsx:286-312 — current */
const smoothTransition = {
  duration: 0.38,
  ease: [0.16, 1, 0.3, 1]
}

const viewSlideVariants = {
  enter: (dir) => ({
    x: dir > 0 ? 28 : dir < 0 ? -28 : 0,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
      opacity: { duration: 0.24, ease: 'easeOut' }
    }
  },
  exit: (dir) => ({
    x: dir > 0 ? -28 : dir < 0 ? 28 : 0,
    opacity: 0,
    transition: {
      x: { duration: 0.24, ease: [0.16, 1, 0.3, 1] },
      opacity: { duration: 0.16, ease: 'easeIn' }
    }
  })
}
```

Why this feels wrong:
1. **`ease-in` on UI exit**: `opacity: { duration: 0.16, ease: 'easeIn' }` starts slow, creating a brief perceptible delay before the old table begins fading out. Under Kowalski's core easing rule: *Entering or exiting elements must ALWAYS use `ease-out`* so the interface starts moving the millisecond the user clicks.
2. **Sluggish duration budget**: `duration: 0.38` (380ms) on `smoothTransition` and `0.32` on `x` exceeds the 200–250ms budget for view switchers hit dozens of times per day.
3. **Excessive travel distance**: `x: 28` causes an overly wide horizontal drift that draws unnecessary attention away from the data being loaded.

## Target

Refactor the transition to a snappy, responsive 200ms `ease-out` standard curve (`[0.23, 1, 0.32, 1]`):
- Outgoing view fades out cleanly in `140ms` with `ease-out`.
- Incoming view arrives in `200ms` with subtle `x: 18` travel.
- Root container layout transition trimmed from `380ms` to `220ms`.

```javascript
/* target: src/components/Dashboard.jsx */
const smoothTransition = {
  duration: 0.22,
  ease: [0.23, 1, 0.32, 1]
}

const viewSlideVariants = {
  enter: (dir) => ({
    x: dir > 0 ? 18 : dir < 0 ? -18 : 0,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { duration: 0.20, ease: [0.23, 1, 0.32, 1] },
      opacity: { duration: 0.18, ease: 'easeOut' }
    }
  },
  exit: (dir) => ({
    x: dir > 0 ? -18 : dir < 0 ? 18 : 0,
    opacity: 0,
    transition: {
      x: { duration: 0.16, ease: [0.23, 1, 0.32, 1] },
      opacity: { duration: 0.14, ease: 'easeOut' }
    }
  })
}
```

## Repo conventions to follow

- `viewSlideVariants` is consumed by `<AnimatePresence mode="wait" custom={slideDirection}>` in [`src/components/Dashboard.jsx:342`](file:///media/fatihfarhat/New%20Volume1/PROJECTS/kavadmin-main/src/components/Dashboard.jsx#L342).
- Framer Motion animation configurations remain co-located with their host view.

## Steps

1. In [`src/components/Dashboard.jsx`](file:///media/fatihfarhat/New%20Volume1/PROJECTS/kavadmin-main/src/components/Dashboard.jsx#L286-L312), replace `smoothTransition` and `viewSlideVariants` with the target code block.

## Boundaries

- Do NOT modify the `viewMode` state logic or `slideDirection` calculation.
- Do NOT change child components `StudentTableView` or `SlotMatrix`.
- Do NOT modify any props passed into `StudentTableView` or `SlotMatrix`.

## Verification

- **Mechanical**: Run `npm run build` — must succeed with zero errors.
- **Feel check**:
  1. Click between "Daftar Siswa" and "Matriks Jadwal" on the Dashboard.
  2. Confirm the outgoing table fades out instantly without any initial pause or stickiness.
  3. Confirm the new view lands promptly in ~200ms without excessive horizontal sweeping.
  4. Spam the toggle repeatedly: the transition must remain clean and interruptible without hitching or layout jumps.
- **Done when**: View switching feels snappy, instantaneous to the touch, and completely free of `ease-in` exit hesitation.
