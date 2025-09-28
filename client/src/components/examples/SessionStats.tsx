import SessionStats from '../SessionStats';

export default function SessionStatsExample() {
  return (
    <div className="p-8 bg-background max-w-md">
      <SessionStats 
        sessionsCompleted={12}
        currentCycle={3}
        totalCycles={4}
        timeSpentToday={150}
      />
    </div>
  );
}