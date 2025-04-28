import React from "react";
import { PlantFormData } from "./PlantForm";
import { PlantCard } from "./PlantCard";

interface PlantPreviewCardProps {
  plant: PlantFormData;
}

export const PlantPreviewCard = ({ plant }: PlantPreviewCardProps) => {
  return (
    <div className="bg-white shadow-md p-6 rounded-lg">
      <h2 className="text-lg font-semibold text-planti-green-900 mb-3">
        Plant Preview
      </h2>
      <PlantCard
        plant={plant}
        isPreview={true}
        healthScore={100}
        healthTrend="stable"
      />
    </div>
  );
};
