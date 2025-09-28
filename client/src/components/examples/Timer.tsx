import Timer from '../Timer';

export default function TimerExample() {
  return (
    <div className="p-8 bg-background">
      <Timer 
        timeRemaining={900}
        totalTime={1500}
        currentSession="work"
        state="running"
      />
    </div>
  );
}