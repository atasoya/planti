"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { PlantForm, PlantFormData } from "@/components/PlantForm";
import { PlantPreviewCard } from "@/components/PlantPreviewCard";

const AddPlantPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Handle number inputs separately
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

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      toast.info("Getting your current location...");

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          setFormData({
            ...formData,
            location: "Current Location",
            latitude,
            longitude,
          });

          toast.success("Location detected!");
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast.error(
            "Could not get your location. Please check your browser permissions."
          );
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser.");
    }
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
        }/api/plants`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add plant");
      }

      const data = await response.json();
      console.log("Plant added successfully:", data);

      toast.success("Plant added successfully!");
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
        <h1 className="text-2xl font-bold text-planti-green-900">
          Add New Plant
        </h1>
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
          onGetLocation={getCurrentLocation}
        />
        <PlantPreviewCard plant={formData} />
      </div>
    </div>
  );
};

export default AddPlantPage;
