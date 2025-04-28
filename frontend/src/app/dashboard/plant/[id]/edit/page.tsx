"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { PlantForm, PlantFormData } from "@/components/PlantForm";
import { PlantPreviewCard } from "@/components/PlantPreviewCard";

const EditPlantPage = () => {
  const router = useRouter();
  const params = useParams();
  const plantId = params.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState<PlantFormData>({
    icon: "🪴",
    name: "",
    species: "",
    location: "",
    longitude: 0,
    latitude: 0,
    weeklyWaterMl: 500,
    humidity: 50,
  });

  const [errors, setErrors] = useState({
    name: "",
    species: "",
    location: "",
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    const fetchPlant = async () => {
      try {
        setIsLoading(true);
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

        setFormData({
          icon: data.plant.icon,
          name: data.plant.name,
          species: data.plant.species,
          location: data.plant.location,
          longitude: data.plant.longitude,
          latitude: data.plant.latitude,
          weeklyWaterMl: data.plant.weeklyWaterMl,
          humidity: data.plant.humidity,
        });
      } catch (error) {
        console.error("Error fetching plant:", error);
        toast.error("Failed to load plant data. Please try again later.");
        router.push("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    if (plantId) {
      fetchPlant();
    }
  }, [plantId, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "latitude" || name === "longitude") {
      setFormData({
        ...formData,
        [name]: value === "" ? 0 : parseFloat(value),
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (errors[name as keyof typeof errors]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSliderChange = (name: keyof PlantFormData, value: number) => {
    setFormData({ ...formData, [name]: value });
  };

  const selectIcon = (icon: string) => {
    setFormData({ ...formData, icon });
  };

  const validateForm = () => {
    const newErrors = {
      name: "",
      species: "",
      location: "",
      latitude: "",
      longitude: "",
    };

    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Plant name is required";
      isValid = false;
    }

    if (!formData.species) {
      newErrors.species = "Please select a species";
      isValid = false;
    }

    if (!formData.location) {
      newErrors.location = "Please enter a location";
      isValid = false;
    }

    if (formData.latitude === 0) {
      newErrors.latitude = "Please enter a latitude value";
      isValid = false;
    }

    if (formData.longitude === 0) {
      newErrors.longitude = "Please enter a longitude value";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
        }/api/plants/${plantId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update plant");
      }

      const data = await response.json();
      console.log("Plant updated successfully:", data);

      toast.success("Plant updated successfully!");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-planti-green-700 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center">
        <button
          onClick={() => router.back()}
          className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-planti-green-900">Edit Plant</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <PlantForm
          formData={formData}
          errors={errors}
          isSubmitting={isSubmitting}
          onIconSelect={selectIcon}
          onInputChange={handleInputChange}
          onSliderChange={handleSliderChange}
          onSubmit={handleSubmit}
        />
        <PlantPreviewCard plant={formData} />
      </div>
    </div>
  );
};

export default EditPlantPage;
