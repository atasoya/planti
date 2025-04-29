"use client";

import React, { useState, useEffect } from "react";
import { Leaf, ChevronLeft, ChevronRight, Search, Filter } from "lucide-react";
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

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const DashboardPage = () => {
  const router = useRouter();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [filteredPlants, setFilteredPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    location: "",
    species: "",
    healthScore: 0,
    weeklyWaterMin: 0,
    weeklyWaterMax: 10000,
    humidityMin: 0,
    humidityMax: 100,
  });
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 0,
  });

  const fetchPlants = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
        }/api/plants?page=${page}&limit=15`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch plants");
      }

      const data = await response.json();
      setPlants(data.plants);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching plants:", error);
      toast.error("Failed to load plants. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlants();
  }, []);

  useEffect(() => {
    let result = [...plants];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (plant) =>
          plant.name.toLowerCase().includes(term) ||
          plant.species.toLowerCase().includes(term) ||
          plant.location.toLowerCase().includes(term)
      );
    }

    if (filters.location) {
      result = result.filter((plant) =>
        plant.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.species) {
      result = result.filter((plant) =>
        plant.species.toLowerCase().includes(filters.species.toLowerCase())
      );
    }

    if (filters.healthScore > 0) {
      result = result.filter(
        (plant) => plant.healthScore >= filters.healthScore
      );
    }

    result = result.filter(
      (plant) =>
        plant.weeklyWaterMl >= filters.weeklyWaterMin &&
        plant.weeklyWaterMl <= filters.weeklyWaterMax
    );

    result = result.filter(
      (plant) =>
        plant.humidity >= filters.humidityMin &&
        plant.humidity <= filters.humidityMax
    );

    setFilteredPlants(result);
  }, [plants, searchTerm, filters]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    fetchPlants(newPage);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilters({
      location: "",
      species: "",
      healthScore: 0,
      weeklyWaterMin: 0,
      weeklyWaterMax: 10000,
      humidityMin: 0,
      humidityMax: 100,
    });
    setShowFilters(false);
  };

  const uniqueLocations = Array.from(
    new Set(plants.map((p) => p.location))
  ).sort();
  const uniqueSpecies = Array.from(
    new Set(plants.map((p) => p.species))
  ).sort();

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

      <div className="bg-white p-3 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-grow">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search plants by name, species or location..."
              className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-planti-green-300"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-2 border rounded-md flex items-center justify-center hover:bg-gray-50"
          >
            <Filter size={18} className="mr-1.5 text-planti-green-700" />
            <span>Filters</span>
          </button>
        </div>

        {showFilters && (
          <div className="mt-3 border-t pt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <select
                value={filters.location}
                onChange={(e) =>
                  setFilters({ ...filters, location: e.target.value })
                }
                className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-planti-green-300"
              >
                <option value="">All locations</option>
                {uniqueLocations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Species
              </label>
              <select
                value={filters.species}
                onChange={(e) =>
                  setFilters({ ...filters, species: e.target.value })
                }
                className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-planti-green-300"
              >
                <option value="">All species</option>
                {uniqueSpecies.map((species) => (
                  <option key={species} value={species}>
                    {species}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Health Score
              </label>
              <select
                value={filters.healthScore}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    healthScore: Number(e.target.value),
                  })
                }
                className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-planti-green-300"
              >
                <option value="0">Any</option>
                <option value="90">Excellent (90+)</option>
                <option value="80">Good (80+)</option>
                <option value="70">Average (70+)</option>
                <option value="50">Poor (50+)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weekly Water Need (ml)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  placeholder="Min"
                  value={filters.weeklyWaterMin || ""}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      weeklyWaterMin: Number(e.target.value) || 0,
                    })
                  }
                  className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-planti-green-300"
                />
                <span>-</span>
                <input
                  type="number"
                  min="0"
                  placeholder="Max"
                  value={filters.weeklyWaterMax || ""}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      weeklyWaterMax: Number(e.target.value) || 10000,
                    })
                  }
                  className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-planti-green-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relative Humidity (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Min"
                  value={filters.humidityMin || ""}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      humidityMin: Number(e.target.value) || 0,
                    })
                  }
                  className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-planti-green-300"
                />
                <span>-</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Max"
                  value={filters.humidityMax || ""}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      humidityMax: Number(e.target.value) || 100,
                    })
                  }
                  className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-planti-green-300"
                />
              </div>
            </div>

            <div className="sm:col-span-3 flex justify-end">
              <button
                onClick={resetFilters}
                className="text-sm px-3 py-1.5 border rounded-md hover:bg-gray-50"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-planti-green-700 rounded-full border-t-transparent"></div>
        </div>
      ) : plants.length > 0 ? (
        <>
          {filteredPlants.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredPlants.map((plant) => (
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
              <div className="text-4xl mb-3">🔍</div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                No matching plants
              </h2>
              <p className="text-gray-500 mb-4 text-sm">
                Try adjusting your search or filters
              </p>
              <button
                onClick={resetFilters}
                className="bg-planti-green-700 text-white px-3 py-1.5 rounded-md hover:bg-planti-green-800 transition-colors inline-flex items-center text-sm"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`p-2 rounded ${
                  pagination.page === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-planti-green-700 hover:bg-planti-green-100"
                }`}
              >
                <ChevronLeft size={20} />
              </button>

              <div className="text-sm">
                Page {pagination.page} of {pagination.totalPages}
              </div>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className={`p-2 rounded ${
                  pagination.page === pagination.totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-planti-green-700 hover:bg-planti-green-100"
                }`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
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
