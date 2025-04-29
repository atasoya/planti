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
  healthScore: number;
  healthTrend: "up" | "down" | "stable";
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
        setPlants(data.plants);
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
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
        <h1 className="text-xl font-bold text-planti-green-900">
          My Plants Collection
        </h1>

        <button
          onClick={() => router.push("/dashboard/plant/add")}
          className="bg-planti-green-700 text-white px-3 py-1.5 rounded-md hover:bg-planti-green-800 transition-colors flex items-center justify-center text-sm"
        >
          <Leaf size={16} className="mr-1.5" />
          Add New Plant
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-planti-green-700 rounded-full border-t-transparent"></div>
        </div>
      ) : plants.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {plants.map((plant) => (
            <div key={plant.id} className="flex flex-col">
              <PlantCard
                plant={plant}
                healthScore={plant.healthScore}
                healthTrend={plant.healthTrend}
                onClick={() => router.push(`/dashboard/plant/${plant.id}`)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <div className="text-4xl mb-3">🌱</div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            No plants yet
          </h2>
          <p className="text-gray-500 mb-4 text-sm">
            Add your first plant to start your collection
          </p>
          <button
            onClick={() => router.push("/dashboard/plant/add")}
            className="bg-planti-green-700 text-white px-3 py-1.5 rounded-md hover:bg-planti-green-800 transition-colors inline-flex items-center text-sm"
          >
            <Leaf size={14} className="mr-1.5" />
            Add Your First Plant
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
