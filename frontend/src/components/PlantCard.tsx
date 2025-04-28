import React from "react";
import {
  Droplet,
  Thermometer,
  MapPin,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

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
  const renderHealthTrendIcon = () => {
    if (healthTrend === "up") {
      return <TrendingUp size={16} className="text-green-600 mr-1" />;
    } else if (healthTrend === "down") {
      return <TrendingDown size={16} className="text-red-500 mr-1" />;
    }
    return null; // No icon for stable
  };

  return (
    <div
      className={`bg-white shadow rounded-lg overflow-hidden h-[360px] w-full flex flex-col ${
        onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""
      }`}
      onClick={onClick}
    >
      <div className="p-4 border-b border-gray-100 flex-1">
        <div className="flex justify-between items-center">
          <span className="text-2xl">{plant.icon}</span>
          <div className="flex items-center">
            {renderHealthTrendIcon()}
            <span
              className={`text-sm font-semibold ${
                healthScore >= 90
                  ? "text-green-600"
                  : healthScore >= 80
                  ? "text-green-500"
                  : healthScore >= 70
                  ? "text-yellow-500"
                  : "text-red-500"
              }`}
            >
              {healthScore}%
            </span>
          </div>
        </div>
        <h3 className="text-lg font-semibold mt-2 text-planti-green-900 line-clamp-1">
          {plant.name || (isPreview ? "My New Plant" : "Unknown Plant")}
        </h3>
        <p className="text-sm text-gray-600 italic line-clamp-1">
          {plant.species ||
            (isPreview ? "Select a species" : "Unknown species")}
        </p>

        {plant.location && (
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <MapPin
              size={14}
              className="text-planti-green-600 mr-1 flex-shrink-0"
            />
            <span className="truncate max-w-[200px] line-clamp-1">
              {plant.location}
            </span>
          </div>
        )}

        {plant.latitude !== undefined && plant.longitude !== undefined && (
          <p className="text-xs text-gray-400 mt-1 truncate">
            {plant.latitude.toFixed(5)}, {plant.longitude.toFixed(5)}
          </p>
        )}
      </div>

      <div className="p-4 bg-neutral-50">
        <div className="flex flex-col gap-2">
          <div className="bg-white rounded p-2 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Weekly Water</p>
            <div className="flex items-center">
              <Droplet size={14} className="text-blue-500 mr-1 flex-shrink-0" />
              <span className="text-sm font-medium">
                {plant.weeklyWaterMl} ml
              </span>
            </div>
          </div>

          <div className="bg-white rounded p-2 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Humidity</p>
            <div className="flex items-center">
              <Thermometer
                size={14}
                className="text-red-400 mr-1 flex-shrink-0"
              />
              <span className="text-sm font-medium">{plant.humidity}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
