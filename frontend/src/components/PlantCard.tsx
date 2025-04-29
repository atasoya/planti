import React from "react";
import { Droplet, Thermometer, MapPin } from "lucide-react";

export interface PlantCardProps {
  plant: {
    id?: number;
    icon: string;
    name: string;
    species: string;
    location: string;
    longitude: number;
    latitude: number;
    weeklyWaterMl: number;
    humidity: number;
  };
  isPreview?: boolean;
  healthScore?: number;
  healthTrend?: "up" | "down" | "stable";
  onClick?: () => void;
}

export const PlantCard = ({
  plant,
  isPreview = false,
  healthScore = 100,
  healthTrend = "stable",
  onClick,
}: PlantCardProps) => {
  return (
    <div
      className={`bg-white shadow-sm rounded-lg overflow-hidden h-[250px] w-full flex flex-col ${
        onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""
      }`}
      onClick={onClick}
    >
      <div className="p-3 border-b flex items-center">
        <div className="text-3xl mr-2">{plant.icon}</div>
        <div>
          <h2 className="text-lg font-bold text-planti-green-900 line-clamp-1">
            {plant.name || (isPreview ? "My New Plant" : "Unknown Plant")}
          </h2>
          <p className="text-xs text-gray-600 italic line-clamp-1">
            {plant.species ||
              (isPreview ? "Select a species" : "Unknown species")}
          </p>
        </div>
      </div>

      <div className="p-3 text-sm space-y-2.5 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-planti-green-900">
            <Droplet size={14} className="mr-1.5 text-blue-500" />
            <span className="font-medium text-xs">Water</span>
          </div>
          <span className="text-xs">{plant.weeklyWaterMl} ml</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-planti-green-900">
            <Thermometer size={14} className="mr-1.5 text-red-500" />
            <span className="font-medium text-xs">Humidity</span>
          </div>
          <span className="text-xs">{plant.humidity}%</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-planti-green-900">
            <MapPin size={14} className="mr-1.5 text-green-500" />
            <span className="font-medium text-xs">Location</span>
          </div>
          <span className="text-xs truncate max-w-[120px]">
            {plant.location}
          </span>
        </div>

        <div className="bg-planti-green-50 rounded p-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium">Health Score</span>
            <span className="text-xs font-bold">{healthScore}%</span>
          </div>
          <div className="flex items-center text-xs">
            <span className="bg-gray-200 h-1.5 w-full rounded-full overflow-hidden">
              <span
                className={`block h-full rounded-full ${
                  healthScore >= 90
                    ? "bg-green-500"
                    : healthScore >= 80
                    ? "bg-green-400"
                    : healthScore >= 70
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${healthScore}%` }}
              ></span>
            </span>
            {healthTrend === "up" && (
              <span className="ml-2 text-green-600 flex items-center">↑</span>
            )}
            {healthTrend === "down" && (
              <span className="ml-2 text-red-600 flex items-center">↓</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
