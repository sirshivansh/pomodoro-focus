import StreakCounter from '../StreakCounter';

export default function StreakCounterExample() {
  return (
    <div className="p-8 bg-background max-w-md">
      <StreakCounter 
        currentStreak={7}
        longestStreak={15}
        todaySessions={6}
        dailyGoal={8}
      />
    </div>
  );
}