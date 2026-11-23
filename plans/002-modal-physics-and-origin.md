# 002 — Fix distorted asymmetrical modal scaling and restore centered physicality

- **Status**: DONE
- **Commit**: c2affdc
- **Severity**: HIGH
- **Category**: Physicality & origin
- **Estimated scope**: 6 files (`ExitConfirmModal.jsx`, `ReceiptModal.jsx`, `StudentProfileDrawer.jsx`, `SlotCalendarModal.jsx`, `UpcomingSessionsModal.jsx`, `ModuleDetailModal.jsx`), ~70 lines

## Problem

Several custom modal dialogs throughout the application share a copy-pasted animation definition that produces an unnatural, jelly-like vertical squashing effect when opened:

```javascript
/* src/components/ExitConfirmModal.jsx:42-46 — current */
<motion.div
  initial={{ opacity: 0, scale: 0.84, scaleY: 0.74, scaleX: 0.90, y: 36 }}
  animate={{ opacity: 1, scale: 1, scaleY: 1, scaleX: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.86, scaleY: 0.78, scaleX: 0.92, y: 24 }}
  transition={{ type: 'spring', damping: 25, stiffness: 280, mass: 0.85 }}
  style={{ transformOrigin: '50% 80%' }}
  className="relative bg-white rounded-2xl border ..."
>
```

```javascript
/* src/components/ReceiptModal.jsx:149-160 — current */
/* src/components/StudentProfileDrawer.jsx:110-120 — current */
/* src/components/SlotCalendarModal.jsx:193-203 — current */
/* src/components/UpcomingSessionsModal.jsx:105-115 — current */
/* src/components/modules/ModuleDetailModal.jsx:106-111 — current */
<motion.div
  initial={{ opacity: 0, scale: 0.82, scaleY: 0.72, scaleX: 0.90, y: 48 }}
  animate={{ opacity: 1, scale: 1, scaleY: 1, scaleX: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.84, scaleY: 0.74, scaleX: 0.92, y: 38 }}
  transition={{
    type: 'spring',
    damping: 25,
    stiffness: 280,
    mass: 0.85,
    opacity: { duration: 0.22, ease: 'easeOut' }
  }}
  style={{ transformOrigin: '50% 85%' }}
```

Why this breaks craft and feels wrong:
1. **Asymmetric aspect distortion**: Simultaneously passing `scale: 0.82`, `scaleY: 0.72`, and `scaleX: 0.90` compresses the modal vertically to 72% while leaving horizontal width at 90%. Typography, avatars, and icons are deformed into squashed ovals during entrance.
2. **Artificial bottom pivot**: `transformOrigin: '50% 85%'` makes centered floating windows inflate from their lower third instead of expanding symmetrically.
3. **Excessive travel distance**: `y: 48` requires the window to travel nearly 50 pixels while decompressing, creating visual disorientation.

## Target

Standardize all centered modal dialogs to Emil Kowalski's solid-surface physical motion specification:
- Scale is isotropic (1:1 aspect ratio preserved): `scale: 0.96` to `1`.
- Origin is centered: `transformOrigin: 'center center'`.
- Vertical travel is subtle and grounded: `y: 12` down to `0`.
- Spring is tuned for crisp enterprise feel (no gelatinous ringing): `damping: 28, stiffness: 320, mass: 0.8`.
- Exit is swift and snappy: `y: 8, scale: 0.97, opacity: 0` in `160ms`.

```javascript
/* target for all 6 files */
<motion.div
  initial={{ opacity: 0, scale: 0.96, y: 12 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.97, y: 8 }}
  transition={{
    type: 'spring',
    damping: 28,
    stiffness: 320,
    mass: 0.8,
    opacity: { duration: 0.16, ease: [0.16, 1, 0.3, 1] }
  }}
  style={{ transformOrigin: 'center center' }}
  className="..."
>
```

## Repo conventions to follow

- Modals use Framer Motion `<AnimatePresence>` with portal backdrop overlays.
- Exemplar: [`src/components/Dashboard.jsx:471`](file:///media/fatihfarhat/New%20Volume1/PROJECTS/kavadmin-main/src/components/Dashboard.jsx#L471) delete confirmation modal uses uniform isotropic scale.

## Steps

1. In [`src/components/ExitConfirmModal.jsx`](file:///media/fatihfarhat/New%20Volume1/PROJECTS/kavadmin-main/src/components/ExitConfirmModal.jsx#L42), replace lines 42–46 with the target props.
2. In [`src/components/ReceiptModal.jsx`](file:///media/fatihfarhat/New%20Volume1/PROJECTS/kavadmin-main/src/components/ReceiptModal.jsx#L149), replace lines 149–160 with the target props.
3. In [`src/components/StudentProfileDrawer.jsx`](file:///media/fatihfarhat/New%20Volume1/PROJECTS/kavadmin-main/src/components/StudentProfileDrawer.jsx#L110), replace lines 110–120 with the target props.
4. In [`src/components/SlotCalendarModal.jsx`](file:///media/fatihfarhat/New%20Volume1/PROJECTS/kavadmin-main/src/components/SlotCalendarModal.jsx#L193), replace lines 193–203 with the target props.
5. In [`src/components/UpcomingSessionsModal.jsx`](file:///media/fatihfarhat/New%20Volume1/PROJECTS/kavadmin-main/src/components/UpcomingSessionsModal.jsx#L105), replace lines 105–115 with the target props.
6. In [`src/components/modules/ModuleDetailModal.jsx`](file:///media/fatihfarhat/New%20Volume1/PROJECTS/kavadmin-main/src/components/modules/ModuleDetailModal.jsx#L106), replace lines 106–111 with the target props.

## Boundaries

- Do NOT touch the contents, header buttons, form fields, or state handlers of these modals.
- Do NOT change the overlay backdrop styling or click-outside handlers.
- Only modify the `initial`, `animate`, `exit`, `transition`, and `style.transformOrigin` props of the inner modal card container.

## Verification

- **Mechanical**: Run `npm run build` — must succeed with zero errors.
- **Feel check**:
  1. Trigger "Keluar" (Exit Modal), "Lihat Profil", "Kuitansi", or "Detail Modul".
  2. Open Chrome DevTools $\rightarrow$ More Tools $\rightarrow$ Animations $\rightarrow$ throttle playback to 10% speed.
  3. Inspect modal entrance: the rectangular boundary, icons, and text must scale uniformly from the center without any vertical flattening or aspect-ratio distortion.
  4. Release throttle to 100%: modal must snap open crisp, professional, and tactile in ~220ms.
- **Done when**: All 6 modal dialogs open and close smoothly with uniform isotropic scaling and zero aspect ratio distortion.
