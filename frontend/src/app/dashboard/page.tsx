"use client";

import React, { useState, useEffect } from "react";
import { Leaf } from "lucide-react";
import { useRouter } from "next/navigation";
import { PlantCard } from "@/components/PlantCard";
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

const DashboardPage = () => {
  const router = useRouter();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
          }/api/plants`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch plants");
        }

        const data = await response.json();

        const enhancedPlants = data.plants.map((plant: Plant) => ({
          ...plant,
          healthScore: Math.floor(Math.random() * 30) + 70,
          healthTrend: ["up", "down", "stable"][
            Math.floor(Math.random() * 3)
          ] as "up" | "down" | "stable",
        }));

        setPlants(enhancedPlants);
      } catch (error) {
        console.error("Error fetching plants:", error);
        toast.error("Failed to load plants. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold text-planti-green-900">
          My Plants Collection
        </h1>

        <button
          onClick={() => router.push("/dashboard/plant/add")}
          className="bg-planti-green-700 text-white px-4 py-2 rounded-md hover:bg-planti-green-800 transition-colors flex items-center justify-center"
        >
          <Leaf size={18} className="mr-2" />
          Add New Plant
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-planti-green-700 rounded-full border-t-transparent"></div>
        </div>
      ) : plants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {plants.map((plant) => (
            <div key={plant.id} className="flex flex-col">
              <PlantCard
                plant={plant}
                healthScore={plant.healthScore}
                healthTrend={plant.healthTrend}
                onClick={() => router.push(`/dashboard/plant/${plant.id}`)}
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/dashboard/plant/${plant.id}/edit`);
                  }}
                  className="text-sm px-3 py-1 bg-planti-green-600 text-white rounded hover:bg-planti-green-700 transition-colors"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-5xl mb-4">🌱</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            No plants yet
          </h2>
          <p className="text-gray-500 mb-6">
            Add your first plant to start your collection
          </p>
          <button
            onClick={() => router.push("/dashboard/plant/add")}
            className="bg-planti-green-700 text-white px-4 py-2 rounded-md hover:bg-planti-green-800 transition-colors inline-flex items-center"
          >
            <Leaf size={16} className="mr-2" />
            Add Your First Plant
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
