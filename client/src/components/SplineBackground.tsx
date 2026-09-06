import React from "react";

interface SplineBackgroundProps {
  enabled: boolean;
  opacity: number; // 0 to 100
  mode?: "gpu-grid" | "spline-3d";
}

export const SPLINE_SCENE_URL = "https://my.spline.design/backlightbgeffect-IMEktNLLr2dW8STNHisJr7RZ/";

export default function SplineBackground({
  enabled,
  opacity,
  mode = "spline-3d",
}: SplineBackgroundProps) {
  if (!enabled || opacity <= 0) {
    return null;
  }

  const opacityValue = opacity / 100;

  return (
    <div 
      className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden transition-opacity duration-500 ease-in-out select-none"
      style={{ opacity: opacityValue }}
      aria-hidden="true"
    >
      {mode === "gpu-grid" ? (
        /* ULTRA-SMOOTH GPU HARDWARE ACCELERATED 3D BACKLIGHT GRID (120 FPS, ZERO LAG) */
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
          {/* Ambient Glowing Aura Orbs */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full opacity-60 blur-[100px] pointer-events-none animate-pulse"
            style={{
              background: "radial-gradient(circle, rgba(239, 68, 68, 0.35) 0%, rgba(245, 158, 11, 0.2) 45%, transparent 75%)",
              animationDuration: "8s"
            }}
          />

          {/* 3D Perspective Glowing Backlight Grid */}
          <div 
            className="absolute inset-x-0 -bottom-20 h-[120%] pointer-events-none origin-bottom opacity-40"
            style={{
              transform: "perspective(600px) rotateX(55deg) translateZ(0)",
              backgroundImage: `
                linear-gradient(to right, rgba(239, 68, 68, 0.35) 1.5px, transparent 1.5px),
                linear-gradient(to bottom, rgba(239, 68, 68, 0.35) 1.5px, transparent 1.5px)
              `,
              backgroundSize: "60px 60px",
              boxShadow: "inset 0 0 100px #07070f"
            }}
          />

          {/* Upper Ambient Gradient Blend */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#07070f] via-transparent to-[#07070f] opacity-80 pointer-events-none" />
        </div>
      ) : (
        /* SPLINE 3D WEBGL IFRAME (NON-BLOCKING POINTER EVENTS) */
        <iframe
          src={SPLINE_SCENE_URL}
          frameBorder="0"
          width="100%"
          height="100%"
          className="w-full h-full border-0 pointer-events-none scale-105"
          title="Spline 3D Backlight Effect"
          loading="lazy"
        />
      )}

      {/* Radial Vignette Gradient Overlay for Crisp Edge Blending */}
      <div 
        className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_20%,rgba(7,7,15,0.75)_75%,#07070f_100%)]" 
      />
    </div>
  );
}
