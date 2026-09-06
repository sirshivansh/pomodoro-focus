import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Sparkles, Eye, EyeOff, Layers, Zap, Box } from "lucide-react";

interface SplineControlsProps {
  enabled: boolean;
  onToggleEnabled: (enabled: boolean) => void;
  opacity: number;
  onChangeOpacity: (opacity: number) => void;
  mode: "gpu-grid" | "spline-3d";
  onChangeMode: (mode: "gpu-grid" | "spline-3d") => void;
}

export default function SplineControls({
  enabled,
  onToggleEnabled,
  opacity,
  onChangeOpacity,
  mode,
  onChangeMode,
}: SplineControlsProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={`relative rounded-full border transition-all duration-300 ${
            enabled
              ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 hover:text-white shadow-[0_0_12px_rgba(99,102,241,0.3)]"
              : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white/70"
          }`}
          title="3D Backlight Effect Settings"
          aria-label="3D Backlight Settings"
        >
          <Sparkles className={`w-4 h-4 transition-transform duration-300 ${enabled ? "text-indigo-400 scale-105" : ""}`} />
          {enabled && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_6px_#6366f1]" />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 bg-[#0d0e1b]/95 backdrop-blur-xl border border-white/10 text-white p-4 rounded-2xl shadow-2xl z-50 space-y-4"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Backlight Ambient</h4>
              <p className="text-[10px] text-white/50">Performance & Glow Controls</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {enabled ? (
              <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Active
              </span>
            ) : (
              <span className="text-[10px] uppercase font-bold text-white/40 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                Off
              </span>
            )}
          </div>
        </div>

        {/* Toggle Switch */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2">
            {enabled ? <Eye className="w-4 h-4 text-indigo-400" /> : <EyeOff className="w-4 h-4 text-white/40" />}
            <span className="text-xs font-medium text-white/80">Enable Ambient Glow</span>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={onToggleEnabled}
          />
        </div>

        {enabled && (
          <>
            {/* Mode Selection Tabs */}
            <div className="space-y-1.5 pt-1 border-t border-white/5">
              <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">Engine Mode</span>
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => onChangeMode("gpu-grid")}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                    mode === "gpu-grid"
                      ? "bg-indigo-500 text-white shadow-md font-semibold"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Ultra 60FPS</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChangeMode("spline-3d")}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                    mode === "spline-3d"
                      ? "bg-indigo-500 text-white shadow-md font-semibold"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>Spline 3D</span>
                </button>
              </div>
            </div>

            {/* Opacity Slider */}
            <div className="space-y-2 pt-1 border-t border-white/5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/70 font-medium">Glow Intensity</span>
                <span className="font-mono text-indigo-300 font-bold">{opacity}%</span>
              </div>
              <Slider
                value={[opacity]}
                min={10}
                max={100}
                step={5}
                onValueChange={(val) => onChangeOpacity(val[0])}
                className="py-1"
              />
              <div className="flex justify-between text-[9px] text-white/40 tracking-wider">
                <span>Subtle (10%)</span>
                <span>Vibrant (100%)</span>
              </div>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
