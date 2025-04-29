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
      return <TrendingUp size={14} className="text-green-600 mr-1" />;
    } else if (healthTrend === "down") {
      return <TrendingDown size={14} className="text-red-500 mr-1" />;
    }
    return null; // No icon for stable
  };

  const getHealthColor = () => {
    if (healthScore >= 90) return "text-green-600";
    if (healthScore >= 80) return "text-green-500";
    if (healthScore >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div
      className={`bg-white shadow rounded-lg overflow-hidden h-[290px] w-full flex flex-col ${
        onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-start p-3 border-b border-gray-100">
        <div className="text-xl mr-2">{plant.icon}</div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-planti-green-900 truncate">
            {plant.name || (isPreview ? "My New Plant" : "Unknown Plant")}
          </h3>
          <p className="text-xs text-gray-600 italic truncate">
            {plant.species ||
              (isPreview ? "Select a species" : "Unknown species")}
          </p>
        </div>
        <div className="flex items-center ml-2">
          {renderHealthTrendIcon()}
          <span className={`text-xs font-semibold ${getHealthColor()}`}>
            {healthScore}%
          </span>
        </div>
      </div>

      <div className="flex-1 p-3 flex flex-col">
        {plant.location && (
          <div className="flex items-center mb-2 text-xs text-gray-500">
            <MapPin
              size={12}
              className="text-planti-green-600 mr-1 flex-shrink-0"
            />
            <span className="truncate">{plant.location}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 mt-auto">
          <div className="bg-blue-50 rounded p-2">
            <div className="flex items-center">
              <Droplet size={12} className="text-blue-500 mr-1" />
              <span className="text-xs font-medium text-blue-800">Water</span>
            </div>
            <p className="text-xs mt-1 font-semibold">
              {plant.weeklyWaterMl} ml
            </p>
          </div>

          <div className="bg-red-50 rounded p-2">
            <div className="flex items-center">
              <Thermometer size={12} className="text-red-500 mr-1" />
              <span className="text-xs font-medium text-red-800">Humidity</span>
            </div>
            <p className="text-xs mt-1 font-semibold">{plant.humidity}%</p>
          </div>
        </div>
      </div>

      <div className="bg-neutral-100 p-2 text-xs border-t border-gray-200">
        <div className="flex justify-between">
          <div className="flex items-center">
            <span className="text-gray-500 mr-1">Health:</span>
            <span className={`font-medium ${getHealthColor()}`}>
              {healthScore}%
            </span>
          </div>
          {plant.latitude !== undefined && plant.longitude !== undefined && (
            <span className="text-gray-400 truncate">
              {plant.latitude.toFixed(4)}, {plant.longitude.toFixed(4)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
