import React from "react";
import { Droplet, Thermometer, Check } from "lucide-react";
import { PlantFormData } from "./PlantForm";

interface PlantPreviewCardProps {
  plant: PlantFormData;
}

export const PlantPreviewCard = ({ plant }: PlantPreviewCardProps) => {
  return (
    <div className="bg-white shadow-md p-6 rounded-lg">
      <h2 className="text-lg font-semibold text-planti-green-900 mb-3">
        Plant Preview
      </h2>
      <div className="bg-white shadow rounded-lg overflow-hidden max-w-xs mx-auto">
        <div className="p-4 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-2xl">{plant.icon}</span>
            <div className="flex items-center">
              <Check size={16} className="text-green-600 mr-2" />
              <span className="text-sm font-semibold text-green-600">100%</span>
            </div>
          </div>
          <h3 className="text-lg font-semibold mt-2 text-planti-green-900">
            {plant.name || "My New Plant"}
          </h3>
          <p className="text-sm text-gray-600 italic">
            {plant.species || "Select a species"}
          </p>
        </div>

        <div className="p-4 bg-green-50">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white rounded p-2 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Weekly Water</p>
              <div className="flex items-center">
                <Droplet size={14} className="text-blue-500 mr-1" />
                <span className="text-sm font-medium">
                  {plant.weeklyWaterMl} ml
                </span>
              </div>
            </div>

            <div className="bg-white rounded p-2 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Humidity</p>
              <div className="flex items-center">
                <Thermometer size={14} className="text-red-400 mr-1" />
                <span className="text-sm font-medium">{plant.humidity}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
