import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { cn } from "@/lib/utils";

interface AnalyticsProps {
  className?: string;
}

type Period = "daily" | "weekly" | "monthly" | "yearly";

export default function Analytics({ className }: AnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("weekly");

  // TODO: remove mock data - replace with real analytics data
  const getAnalyticsData = (period: Period) => {
    switch (period) {
      case "daily":
        return {
          chartData: [
            { name: "00:00", sessions: 0 },
            { name: "06:00", sessions: 0 },
            { name: "09:00", sessions: 4 },
            { name: "12:00", sessions: 2 },
            { name: "15:00", sessions: 6 },
            { name: "18:00", sessions: 3 },
            { name: "21:00", sessions: 1 },
          ],
          totalSessions: 16,
          totalTime: 400, // minutes
          averageSession: 25,
        };
      case "weekly":
        return {
          chartData: [
            { name: "Mon", sessions: 12 },
            { name: "Tue", sessions: 8 },
            { name: "Wed", sessions: 16 },
            { name: "Thu", sessions: 14 },
            { name: "Fri", sessions: 10 },
            { name: "Sat", sessions: 6 },
            { name: "Sun", sessions: 4 },
          ],
          totalSessions: 70,
          totalTime: 1750, // minutes
          averageSession: 25,
        };
      case "monthly":
        return {
          chartData: [
            { name: "Week 1", sessions: 45 },
            { name: "Week 2", sessions: 52 },
            { name: "Week 3", sessions: 38 },
            { name: "Week 4", sessions: 41 },
          ],
          totalSessions: 176,
          totalTime: 4400, // minutes
          averageSession: 25,
        };
      case "yearly":
        return {
          chartData: [
            { name: "Jan", sessions: 120 },
            { name: "Feb", sessions: 110 },
            { name: "Mar", sessions: 140 },
            { name: "Apr", sessions: 130 },
            { name: "May", sessions: 150 },
            { name: "Jun", sessions: 135 },
          ],
          totalSessions: 785,
          totalTime: 19625, // minutes
          averageSession: 25,
        };
    }
  };

  const sessionTypeData = [
    { name: "Work", value: 75, color: "hsl(var(--primary))" },
    { name: "Short Break", value: 20, color: "hsl(var(--chart-3))" },
    { name: "Long Break", value: 5, color: "hsl(var(--chart-2))" },
  ];

  const data = getAnalyticsData(selectedPeriod);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Period selector */}
      <div className="flex gap-2 justify-center">
        {(["daily", "weekly", "monthly", "yearly"] as Period[]).map((period) => (
          <Button
            key={period}
            variant={selectedPeriod === period ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod(period)}
            data-testid={`button-period-${period}`}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </Button>
        ))}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary" data-testid="text-total-sessions">
              {data.totalSessions}
            </div>
            <div className="text-sm text-muted-foreground">Sessions</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-chart-2" data-testid="text-total-time">
              {formatTime(data.totalTime)}
            </div>
            <div className="text-sm text-muted-foreground">Total Time</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-chart-3" data-testid="text-average-session">
              {data.averageSession}m
            </div>
            <div className="text-sm text-muted-foreground">Avg Session</div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Session Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Bar dataKey="sessions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Session types pie chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Session Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sessionTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                >
                  {sessionTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex justify-center gap-4 mt-4">
            {sessionTypeData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm">{entry.name}: {entry.value}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}