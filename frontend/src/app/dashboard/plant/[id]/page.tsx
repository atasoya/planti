"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash,
  Droplet,
  Thermometer,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

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
  healthScore?: number;
  healthTrend?: "up" | "down" | "stable";
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

        setPlant({
          ...data.plant,
          healthScore: Math.floor(Math.random() * 30) + 70,
          healthTrend: ["up", "down", "stable"][
            Math.floor(Math.random() * 3)
          ] as "up" | "down" | "stable",
        });
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
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-planti-green-900">
            Plant Details
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleEdit}
            className="p-2 bg-planti-green-600 text-white rounded hover:bg-planti-green-700 flex items-center"
          >
            <Edit size={18} className="mr-1" />
            Edit
          </button>
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="p-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="p-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Confirm Delete
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center"
            >
              <Trash size={18} className="mr-1" />
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b flex items-center gap-4">
          <div className="text-6xl">{plant.icon}</div>
          <div>
            <h2 className="text-2xl font-bold text-planti-green-900">
              {plant.name}
            </h2>
            <p className="text-gray-600 italic">{plant.species}</p>
            <div className="flex items-center mt-2 text-sm">
              <span className="flex items-center bg-planti-green-100 text-planti-green-800 px-2 py-1 rounded">
                <div className="w-2 h-2 bg-planti-green-600 rounded-full mr-2"></div>
                {plant.healthScore}% Health
              </span>
              {plant.healthTrend === "up" && (
                <span className="ml-2 text-green-600 flex items-center">
                  ↑ Improving
                </span>
              )}
              {plant.healthTrend === "down" && (
                <span className="ml-2 text-red-600 flex items-center">
                  ↓ Declining
                </span>
              )}
              {plant.healthTrend === "stable" && (
                <span className="ml-2 text-blue-600 flex items-center">
                  → Stable
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Plant Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center text-planti-green-900 mb-2">
                <Droplet size={18} className="mr-2 text-blue-500" />
                <span className="font-medium">Water Needs</span>
              </div>
              <p className="text-gray-700">{plant.weeklyWaterMl} ml per week</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center text-planti-green-900 mb-2">
                <Thermometer size={18} className="mr-2 text-red-500" />
                <span className="font-medium">Humidity</span>
              </div>
              <p className="text-gray-700">
                {plant.humidity}% optimal humidity
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-medium mb-2">Location</h4>
            <p className="text-gray-700 mb-1">{plant.location}</p>
            <p className="text-gray-500 text-sm">
              Coordinates: {plant.latitude.toFixed(5)},{" "}
              {plant.longitude.toFixed(5)}
            </p>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center text-planti-green-900 mb-2">
              <Calendar size={18} className="mr-2 text-gray-500" />
              <span className="font-medium">Plant History</span>
            </div>
            <div className="text-sm text-gray-600">
              <p>Added on {formatDate(plant.createdAt)}</p>
              <p>Last updated on {formatDate(plant.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantDetailPage;
