"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast, Toaster } from "sonner";

import { PlantForm, PlantFormData } from "@/components/PlantForm";
import { PlantPreviewCard } from "@/components/PlantPreviewCard";

const AddPlantPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<PlantFormData>({
    icon: "🪴",
    name: "",
    species: "",
    weeklyWaterMl: 500,
    humidity: 50,
  });

  const [errors, setErrors] = useState({
    name: "",
    species: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

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
      console.log("Plant data to be submitted:", formData);
      toast.success("Plant added successfully!");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Toaster position="top-right" />

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
        />
        <PlantPreviewCard plant={formData} />
      </div>
    </div>
  );
};

export default AddPlantPage;
