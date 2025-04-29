"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WaterRecord {
  id: number;
  plantId: number;
  healthScore: number;
  humidity: number;
  weeklyWaterMl: number;
  createdAt: string;
}

interface WaterData {
  date: string;
  optimal: number;
  actual: number;
}

interface WaterCompareProps {
  plantId?: number;
}

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  optimal: {
    label: "Optimal",
    color: "#6B9071",
  },
  actual: {
    label: "Actual",
    color: "#AEC380",
  },
} satisfies ChartConfig;

export function WaterCompare({ plantId }: WaterCompareProps) {
  const [timeRange, setTimeRange] = React.useState("90d");
  const [waterData, setWaterData] = useState<WaterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWaterData() {
      if (!plantId) {
        setWaterData(generateDemoData());
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
          }/api/plants/${plantId}/history?limit=90`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch water data");
        }

        const data = await response.json();
        const plant = data.plant;
        const optimalWaterMl = plant.weeklyWaterMl;

        const formattedData = data.history
          .sort(
            (a: WaterRecord, b: WaterRecord) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
          .map((record: WaterRecord) => ({
            date: record.createdAt,
            optimal: optimalWaterMl,
            actual: record.weeklyWaterMl,
          }));

        setWaterData(formattedData);
      } catch (err) {
        console.error("Error fetching water data:", err);
        setError("Failed to load water data");
        setWaterData(generateDemoData());
      } finally {
        setLoading(false);
      }
    }

    fetchWaterData();
  }, [plantId]);

  const generateDemoData = (): WaterData[] => {
    const data: WaterData[] = [];
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 90);

    let currentDate = new Date(startDate);
    const optimalWaterMl = 250;

    while (currentDate <= endDate) {
      const actualWaterMl = Math.floor(Math.random() * 200) + 150;

      data.push({
        date: currentDate.toISOString(),
        optimal: optimalWaterMl,
        actual: actualWaterMl,
      });

      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return data;
  };

  const filteredData = waterData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date();
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Water Comparison</CardTitle>
          <CardDescription>Loading data...</CardDescription>
        </CardHeader>
        <CardContent className="h-[250px] flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-planti-green-700 rounded-full border-t-transparent"></div>
        </CardContent>
      </Card>
    );
  }

  if (error && waterData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Water Comparison</CardTitle>
          <CardDescription>Error loading data</CardDescription>
        </CardHeader>
        <CardContent className="h-[250px] flex items-center justify-center text-red-500">
          {error}
        </CardContent>
      </Card>
    );
  }

  if (waterData.length < 7) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Water Comparison</CardTitle>
          <CardDescription>Insufficient data</CardDescription>
        </CardHeader>
        <CardContent className="h-[250px] flex items-center justify-center text-gray-500 text-center px-4">
          Not enough water data available. At least 7 data points are needed for
          meaningful comparison.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Water Comparison</CardTitle>
          <CardDescription>
            Comparing optimal vs. actual water amounts (ml)
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillOptimal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6B9071" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6B9071" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#AEC380" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#AEC380" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getDate()}/${date.getMonth() + 1}`;
              }}
            />
            <YAxis hide domain={[0, "auto"]} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getDate()}/${
                      date.getMonth() + 1
                    }/${date.getFullYear()}`;
                  }}
                  formatter={(value) => [`${value} ml`, ""]}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="actual"
              type="natural"
              fill="url(#fillActual)"
              stroke="#AEC380"
            />
            <Area
              dataKey="optimal"
              type="natural"
              fill="url(#fillOptimal)"
              stroke="#6B9071"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
