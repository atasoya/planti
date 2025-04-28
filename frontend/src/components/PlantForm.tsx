import React from "react";
import { Droplet, Thermometer, Save, AlertCircle, MapPin } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export const plantIcons = [
  "🪴",
  "🌿",
  "🌱",
  "🌵",
  "🌲",
  "🌳",
  "🍃",
  "🌸",
  "☘️",
];

export interface PlantFormData {
  icon: string;
  name: string;
  species: string;
  location: string;
  longitude: number;
  latitude: number;
  weeklyWaterMl: number;
  humidity: number;
}

interface PlantFormProps {
  formData: PlantFormData;
  errors: {
    name: string;
    species: string;
    location?: string;
    latitude?: string;
    longitude?: string;
  };
  isSubmitting: boolean;
  onIconSelect: (icon: string) => void;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onSliderChange: (name: keyof PlantFormData, value: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  onGetLocation?: () => void;
}

export const PlantForm = ({
  formData,
  errors,
  isSubmitting,
  onIconSelect,
  onInputChange,
  onSliderChange,
  onSubmit,
  onGetLocation,
}: PlantFormProps) => {
  return (
    <form onSubmit={onSubmit} className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Choose Plant Icon
        </label>
        <div className="grid grid-cols-9 gap-2">
          {plantIcons.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => onIconSelect(icon)}
              className={`text-2xl h-12 w-12 flex items-center justify-center rounded-lg transition-colors ${
                formData.icon === icon
                  ? "bg-planti-green-100 border-2 border-planti-green-600"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Plant Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={onInputChange}
          placeholder="e.g., Living Room Snake Plant"
          className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-planti-green-600 focus:outline-none ${
            errors.name ? "border-red-500" : "border-gray-300"
          }`}
          required
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle size={14} className="mr-1" />
            {errors.name}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label
          htmlFor="species"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Species <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="species"
          name="species"
          value={formData.species}
          onChange={onInputChange}
          placeholder="e.g., Monstera deliciosa"
          className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-planti-green-600 focus:outline-none ${
            errors.species ? "border-red-500" : "border-gray-300"
          }`}
          required
        />
        {errors.species && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle size={14} className="mr-1" />
            {errors.species}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label
          htmlFor="location"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Location Name <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center">
          <MapPin size={18} className="text-planti-green-600 mr-2" />
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={onInputChange}
            placeholder="e.g., Living Room, Office, Garden, etc."
            className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-planti-green-600 focus:outline-none ${
              errors.location ? "border-red-500" : "border-gray-300"
            }`}
            required
          />
          {onGetLocation && (
            <button
              type="button"
              onClick={onGetLocation}
              className="ml-2 p-2 bg-planti-green-100 text-planti-green-700 rounded-md hover:bg-planti-green-200 transition-colors"
              title="Get current location"
            >
              <MapPin size={16} />
            </button>
          )}
        </div>
        {errors.location && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle size={14} className="mr-1" />
            {errors.location}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Enter the name of where your plant is located (indoors or outdoors)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label
            htmlFor="latitude"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Latitude <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="latitude"
            name="latitude"
            value={formData.latitude || ""}
            onChange={onInputChange}
            placeholder="e.g., 40.7128"
            step="0.0001"
            className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-planti-green-600 focus:outline-none ${
              errors.latitude ? "border-red-500" : "border-gray-300"
            }`}
            required
          />
          {errors.latitude && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle size={14} className="mr-1" />
              {errors.latitude}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="longitude"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Longitude <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="longitude"
            name="longitude"
            value={formData.longitude || ""}
            onChange={onInputChange}
            placeholder="e.g., -74.0060"
            step="0.0001"
            className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-planti-green-600 focus:outline-none ${
              errors.longitude ? "border-red-500" : "border-gray-300"
            }`}
            required
          />
          {errors.longitude && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle size={14} className="mr-1" />
              {errors.longitude}
            </p>
          )}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Weekly Water (ml): {formData.weeklyWaterMl}ml
        </label>
        <div className="flex items-center">
          <Droplet size={18} className="text-blue-500 mr-2" />
          <Slider
            value={[formData.weeklyWaterMl]}
            onValueChange={(value) => onSliderChange("weeklyWaterMl", value[0])}
            max={20000}
            min={0}
            step={500}
            className="w-full"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Humidity Level: {formData.humidity}%
        </label>
        <div className="flex items-center">
          <Thermometer size={18} className="text-red-400 mr-2" />
          <Slider
            value={[formData.humidity]}
            onValueChange={(value) => onSliderChange("humidity", value[0])}
            max={90}
            min={10}
            step={5}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-6 py-3 rounded-md flex items-center justify-center transition-colors ${
            isSubmitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-planti-green-700 hover:bg-planti-green-800 text-white"
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save size={18} className="mr-2" />
              Save Plant
            </>
          )}
        </button>
      </div>
    </form>
  );
};
