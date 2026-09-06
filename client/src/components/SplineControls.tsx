import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Sparkles, Eye, EyeOff, Layers } from "lucide-react";

interface SplineControlsProps {
  enabled: boolean;
  onToggleEnabled: (enabled: boolean) => void;
  opacity: number;
  onChangeOpacity: (opacity: number) => void;
}

export default function SplineControls({
  enabled,
  onToggleEnabled,
  opacity,
  onChangeOpacity,
}: SplineControlsProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={`relative rounded-full border transition-all duration-300 ${
            enabled
              ? "bg-white/10 border-indigo-500/40 text-indigo-300 hover:bg-white/20 hover:text-white shadow-[0_0_15px_rgba(99,102,241,0.25)]"
              : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white/70"
          }`}
          title="3D Backlight Effect Settings"
          aria-label="3D Backlight Settings"
        >
          <Sparkles className={`w-4 h-4 transition-transform duration-300 ${enabled ? "animate-pulse scale-110 text-indigo-400" : ""}`} />
          {enabled && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-72 bg-[#0d0e1b]/95 backdrop-blur-xl border border-white/10 text-white p-4 rounded-2xl shadow-2xl z-50 space-y-4"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">3D Backlight</h4>
              <p className="text-[10px] text-white/50">Spline Ambient Visuals</p>
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
            <span className="text-xs font-medium text-white/80">Enable 3D Effect</span>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={onToggleEnabled}
          />
        </div>

        {/* Opacity Slider */}
        {enabled && (
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
        )}
      </PopoverContent>
    </Popover>
  );
}
