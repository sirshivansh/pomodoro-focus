# Design Spec: Spline 3D Backlight Background Integration

## Overview
Integrate the Spline 3D backlight background effect (`https://my.spline.design/backlightbgeffect-IMEktNLLr2dW8STNHisJr7RZ/`) into PomoFocusTrack as a full-bleed viewport background with interactive controls, glassmorphism UI card overlays, and battery/performance optimization toggles.

## Architectural Changes

### 1. `client/src/components/SplineBackground.tsx` (New Component)
- **Viewport Layout**: Fixed `inset-0 w-full h-full z-0 overflow-hidden pointer-events-none`.
- **Iframe Integration**: Embedded Spline 3D viewer iframe (`https://my.spline.design/backlightbgeffect-IMEktNLLr2dW8STNHisJr7RZ/`).
- **Overlays**:
  - Radial dark vignette around view edges (`bg-[radial-gradient(ellipse_at_center,transparent_30%,#07070f_100%)]`).
  - Adjustable opacity filter based on user settings (Default: `85%`, Low: `50%`, Off: `0%`).
- **Pointer Events**: Set `pointer-events-none` so mouse interactions pass seamlessly to all timer UI controls, buttons, modals, and sheets.

### 2. `client/src/components/SplineControls.tsx` or Header Control
- **Header Action Button**: Sleek 3D/Sparkles button added to the main top navigation bar next to Settings & Analytics.
- **Dropdown / Modal Controls**:
  - Toggle 3D background ON / OFF.
  - Adjust Opacity / Glow intensity (100%, 75%, 50%).
- **Local Storage Persistence**: Persist settings under key `ft_spline_bg`.

### 3. Glassmorphism & UI Adjustments (`PomodoroApp.tsx`, `Timer.tsx`, `SessionStats.tsx`, etc.)
- Update card overlays to use backdrop blur (`backdrop-blur-xl bg-[#0b0c16]/60 border-white/10`) so UI elements float above the 3D red grid backlight while maintaining crisp legibility.

### 4. Performance & Fallbacks
- `loading="lazy"` on the Spline iframe.
- Fallback dark background (`#07070f`) if 3D effect is toggled OFF or fails to load.

## User Interaction Flow
1. On app load, `SplineBackground` initializes the 3D backlight in the background.
2. User can toggle or tune the background intensity at any time using the header button.
3. Timer, analytics, settings, and streak counter float smoothly over the dynamic 3D backlight.
