import SettingsPanel from '../SettingsPanel';

export default function SettingsPanelExample() {
  const mockConfig = {
    workDuration: 1500, // 25 minutes
    shortBreakDuration: 300, // 5 minutes
    longBreakDuration: 900, // 15 minutes
    sessionsUntilLongBreak: 4,
    soundEnabled: true,
    autoStart: false,
    notificationsEnabled: false,
  };

  return (
    <div className="p-8 bg-background">
      <SettingsPanel 
        config={mockConfig}
        onSave={() => {}}
        onClose={() => {}}
      />
    </div>
  );
}