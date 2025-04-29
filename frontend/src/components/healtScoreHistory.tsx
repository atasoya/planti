"use client";

import { TrendingUp } from "lucide-react";
import React, { useState, useEffect } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface HealthHistoryProps {
  plantId: number;
}

interface HealthRecord {
  id: number;
  plantId: number;
  healthScore: number;
  humidity: number;
  weeklyWaterMl: number;
  createdAt: string;
}

interface FormattedHealthData {
  date: string;
  health: number;
  day: number;
  rawDate: string;
}

export function HealtScoreHistory({ plantId }: HealthHistoryProps) {
  const [healthData, setHealthData] = useState<FormattedHealthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trend, setTrend] = useState<number>(0);

  useEffect(() => {
    async function fetchHealthHistory() {
      try {
        setLoading(true);
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
          }/api/plants/${plantId}/history?limit=30`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch health history");
        }

        const data = await response.json();
        const rawRecords = data.history;
        const formattedData = rawRecords
          .sort(
            (a: HealthRecord, b: HealthRecord) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
          .map((record: HealthRecord, index: number) => ({
            date: formatDate(record.createdAt),
            health: record.healthScore,
            day: index + 1,
            rawDate: record.createdAt,
          }));

        setHealthData(formattedData);

        if (formattedData.length >= 2) {
          const oldestValue = formattedData[0].health;
          const latestValue = formattedData[formattedData.length - 1].health;
          const percentChange =
            ((latestValue - oldestValue) / oldestValue) * 100;
          setTrend(parseFloat(percentChange.toFixed(1)));
        }
      } catch (err) {
        console.error("Error fetching health history:", err);
        setError("Failed to load health history");
      } finally {
        setLoading(false);
      }
    }

    if (plantId) {
      fetchHealthHistory();
    }
  }, [plantId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Health Score History</CardTitle>
          <CardDescription>Loading data...</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-planti-green-700 rounded-full border-t-transparent"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Health Score History</CardTitle>
          <CardDescription>Error loading data</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-red-500">
          {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Score History</CardTitle>
        <CardDescription>Last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={healthData}
              margin={{
                top: 20,
                right: 30,
                left: 0,
                bottom: 10,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e5e7eb"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tickMargin={8}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value: number) => [`${value}%`, "Health Score"]}
                labelFormatter={(label) => {
                  const dataPoint = healthData.find(
                    (point) => point.date === label
                  );
                  if (dataPoint && dataPoint.rawDate) {
                    const date = new Date(dataPoint.rawDate);
                    return `${date.getDate()}/${
                      date.getMonth() + 1
                    }/${date.getFullYear()}`;
                  }
                  return label;
                }}
              />
              <Line
                type="monotone"
                dataKey="health"
                stroke="#AEC380"
                strokeWidth={3}
                dot={{
                  fill: "#AEC380",
                  stroke: "#AEC380",
                  r: 4,
                  strokeWidth: 2,
                }}
                activeDot={{
                  fill: "#AEC380",
                  stroke: "#ffffff",
                  r: 6,
                  strokeWidth: 2,
                }}
              ></Line>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          {trend > 0 ? (
            <>
              Trending up by {trend}% <TrendingUp className="h-4 w-4" />
            </>
          ) : trend < 0 ? (
            <>
              Trending down by {Math.abs(trend)}%{" "}
              <TrendingUp className="h-4 w-4 rotate-180" />
            </>
          ) : (
            <>
              Stable <TrendingUp className="h-4 w-4 rotate-90" />
            </>
          )}
        </div>
        <div className="leading-none text-muted-foreground">
          Showing plant health score trends over time
        </div>
      </CardFooter>
    </Card>
  );
}
