import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TimerConfig } from "@shared/schema";
import { cn } from "@/lib/utils";

interface SettingsPanelProps {
  config: TimerConfig;
  onSave: (config: TimerConfig) => void;
  onClose: () => void;
  className?: string;
}

export default function SettingsPanel({ 
  config, 
  onSave, 
  onClose,
  className 
}: SettingsPanelProps) {
  const [settings, setSettings] = useState<TimerConfig>(config);

  const handleSave = () => {
    console.log('Settings saved:', settings);
    onSave(settings);
    onClose();
  };

  const handleCancel = () => {
    console.log('Settings cancelled');
    setSettings(config); // Reset to original
    onClose();
  };

  const updateSetting = (key: keyof TimerConfig, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader>
        <CardTitle>Timer Settings</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Duration settings */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="work-duration">Work Duration (minutes)</Label>
            <Input
              id="work-duration"
              type="number"
              min="1"
              max="60"
              value={Math.floor(settings.workDuration / 60)}
              onChange={(e) => updateSetting('workDuration', parseInt(e.target.value) * 60)}
              data-testid="input-work-duration"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="short-break-duration">Short Break (minutes)</Label>
            <Input
              id="short-break-duration"
              type="number"
              min="1"
              max="30"
              value={Math.floor(settings.shortBreakDuration / 60)}
              onChange={(e) => updateSetting('shortBreakDuration', parseInt(e.target.value) * 60)}
              data-testid="input-short-break-duration"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="long-break-duration">Long Break (minutes)</Label>
            <Input
              id="long-break-duration"
              type="number"
              min="1"
              max="60"
              value={Math.floor(settings.longBreakDuration / 60)}
              onChange={(e) => updateSetting('longBreakDuration', parseInt(e.target.value) * 60)}
              data-testid="input-long-break-duration"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sessions-until-long-break">Sessions until Long Break</Label>
            <Input
              id="sessions-until-long-break"
              type="number"
              min="2"
              max="10"
              value={settings.sessionsUntilLongBreak}
              onChange={(e) => updateSetting('sessionsUntilLongBreak', parseInt(e.target.value))}
              data-testid="input-sessions-until-long-break"
            />
          </div>
        </div>

        {/* Sound settings */}
        <div className="flex items-center justify-between">
          <Label htmlFor="sound-enabled" className="text-sm font-medium">
            Sound Notifications
          </Label>
          <Switch
            id="sound-enabled"
            checked={settings.soundEnabled}
            onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
            data-testid="switch-sound-enabled"
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-4">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleCancel}
            data-testid="button-cancel-settings"
          >
            Cancel
          </Button>
          <Button 
            className="flex-1"
            onClick={handleSave}
            data-testid="button-save-settings"
          >
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}