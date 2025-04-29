"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash,
  Droplet,
  Thermometer,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { HealtScoreHistory } from "@/components/healtScoreHistory";
import { HumidityCompare } from "@/components/humidityCompare";
import { WaterCompare } from "@/components/waterCompare";

interface Plant {
  id: number;
  name: string;
  species: string;
  weeklyWaterMl: number;
  icon: string;
  humidity: number;
  location: string;
  longitude: number;
  latitude: number;
  createdAt: string;
  updatedAt: string;
  healthScore: number;
  healthTrend: "up" | "down" | "stable";
}

const PlantDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const plantId = params.id as string;

  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const fetchPlant = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
          }/api/plants/${plantId}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch plant");
        }

        const data = await response.json();
        setPlant(data.plant);
      } catch (error) {
        console.error("Error fetching plant:", error);
        toast.error("Failed to load plant data. Please try again later.");
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (plantId) {
      fetchPlant();
    }
  }, [plantId, router]);

  const handleEdit = () => {
    router.push(`/dashboard/plant/${plantId}/edit`);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
        }/api/plants/${plantId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete plant");
      }

      toast.success("Plant deleted successfully");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error deleting plant:", error);
      toast.error("Failed to delete plant. Please try again later.");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-planti-green-700 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <h2 className="text-xl font-semibold text-gray-700">Plant not found</h2>
        <p className="text-gray-500 mt-2">
          The plant you&apos;re looking for doesn&apos;t exist or was removed.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-4 bg-planti-green-600 text-white px-4 py-2 rounded hover:bg-planti-green-700"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-3 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-bold text-planti-green-900">
            Plant Details
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleEdit}
            className="p-1.5 bg-planti-green-600 text-white text-sm rounded hover:bg-planti-green-700 flex items-center"
          >
            <Edit size={16} className="mr-1" />
            Edit
          </button>
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="p-1.5 text-sm bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="p-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Confirm
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-600 flex items-center"
            >
              <Trash size={16} className="mr-1" />
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-3 border-b flex items-center">
              <div className="text-3xl mr-2">{plant.icon}</div>
              <div>
                <h2 className="text-lg font-bold text-planti-green-900 line-clamp-1">
                  {plant.name}
                </h2>
                <p className="text-xs text-gray-600 italic line-clamp-1">
                  {plant.species}
                </p>
              </div>
            </div>

            <div className="p-3 text-sm space-y-2.5">
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
                  <span className="text-xs font-bold">
                    {plant.healthScore}%
                  </span>
                </div>
                <div className="flex items-center text-xs">
                  <span className="bg-gray-200 h-1.5 w-full rounded-full overflow-hidden">
                    <span
                      className={`block h-full rounded-full ${
                        plant.healthScore >= 90
                          ? "bg-green-500"
                          : plant.healthScore >= 80
                          ? "bg-green-400"
                          : plant.healthScore >= 70
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${plant.healthScore}%` }}
                    ></span>
                  </span>
                  {plant.healthTrend === "up" && (
                    <span className="ml-2 text-green-600 flex items-center">
                      ↑
                    </span>
                  )}
                  {plant.healthTrend === "down" && (
                    <span className="ml-2 text-red-600 flex items-center">
                      ↓
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t pt-2 text-xs text-gray-500">
                <p>Added: {formatDate(plant.createdAt)}</p>
                <p>Updated: {formatDate(plant.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-3 gap-4 grid grid-cols-1">
          <HealtScoreHistory plantId={parseInt(plantId)} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <HumidityCompare plantId={parseInt(plantId)} />
            <WaterCompare plantId={parseInt(plantId)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantDetailPage;
