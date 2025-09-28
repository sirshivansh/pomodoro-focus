import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface SessionStatsProps {
  sessionsCompleted: number;
  currentCycle: number;
  totalCycles: number;
  timeSpentToday: number; // in minutes
  className?: string;
}

export default function SessionStats({
  sessionsCompleted,
  currentCycle,
  totalCycles,
  timeSpentToday,
  className
}: SessionStatsProps) {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-5 h-5 text-chart-2" />
            </div>
            <div className="text-2xl font-bold" data-testid="text-sessions-completed">
              {sessionsCompleted}
            </div>
            <div className="text-xs text-muted-foreground">
              Sessions
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div className="text-lg font-semibold">
              <Badge variant="outline" data-testid="badge-current-cycle">
                {currentCycle}/{totalCycles}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              Cycle
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-chart-3" />
            </div>
            <div className="text-2xl font-bold" data-testid="text-time-today">
              {formatTime(timeSpentToday)}
            </div>
            <div className="text-xs text-muted-foreground">
              Today
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}