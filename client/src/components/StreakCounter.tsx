import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
  todaySessions: number;
  dailyGoal: number;
  className?: string;
}

export default function StreakCounter({
  currentStreak,
  longestStreak,
  todaySessions,
  dailyGoal = 8,
  className
}: StreakCounterProps) {
  const progressPercentage = Math.min((todaySessions / dailyGoal) * 100, 100);
  const isGoalReached = todaySessions >= dailyGoal;

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Flame className={cn(
                "w-6 h-6",
                currentStreak > 0 ? "text-chart-3" : "text-muted-foreground"
              )} />
              <div>
                <div className="text-2xl font-bold" data-testid="text-current-streak">
                  {currentStreak}
                </div>
                <div className="text-sm text-muted-foreground">
                  Day Streak
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-muted-foreground" />
            <div className="text-right">
              <div className="text-lg font-semibold" data-testid="text-longest-streak">
                {longestStreak}
              </div>
              <div className="text-xs text-muted-foreground">
                Best
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Today's Progress</span>
            <Badge variant={isGoalReached ? "default" : "secondary"} data-testid="badge-daily-progress">
              {todaySessions}/{dailyGoal}
            </Badge>
          </div>
          
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                isGoalReached ? "bg-chart-2" : "bg-primary"
              )}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          {isGoalReached && (
            <div className="text-sm text-chart-2 font-medium text-center">
              🎉 Daily goal achieved!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}