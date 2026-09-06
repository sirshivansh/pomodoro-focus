import React from "react";

interface SplineBackgroundProps {
  enabled: boolean;
  opacity: number; // 0 to 100
}

export const SPLINE_SCENE_URL = "https://my.spline.design/backlightbgeffect-IMEktNLLr2dW8STNHisJr7RZ/";

export default function SplineBackground({ enabled, opacity }: SplineBackgroundProps) {
  if (!enabled || opacity <= 0) {
    return null;
  }

  const opacityValue = opacity / 100;

  return (
    <div 
      className="fixed inset-0 w-full h-full pointer-events-auto z-0 overflow-hidden transition-opacity duration-500 ease-in-out"
      style={{ opacity: opacityValue }}
      aria-hidden="true"
    >
      {/* Spline 3D Backlight Iframe - Pointer events active for dynamic mouse tracking */}
      <iframe
        src={SPLINE_SCENE_URL}
        frameBorder="0"
        width="100%"
        height="100%"
        className="w-full h-full border-0 pointer-events-auto scale-105"
        title="Spline 3D Backlight Effect"
        loading="lazy"
      />

      {/* Radial vignette gradient overlay for soft edge blending (clicks/mouse pass through vignette) */}
      <div 
        className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_25%,rgba(7,7,15,0.7)_80%,#07070f_100%)]" 
      />
    </div>
  );
}
