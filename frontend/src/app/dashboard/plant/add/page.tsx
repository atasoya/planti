"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Map } from "lucide-react";
import { toast } from "sonner";

import { PlantForm, PlantFormData } from "@/components/PlantForm";
import { PlantPreviewCard } from "@/components/PlantPreviewCard";

// Add Google Maps types
declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (element: HTMLElement, options: object) => unknown;
        Geocoder: new () => unknown;
        places: unknown;
      };
    };
  }
}

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

  // Load Google Maps script
  useEffect(() => {
    // Check if Google Maps script is already loaded
    if (window.google && window.google.maps) return;

    const loadGoogleMapsScript = () => {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => console.log("Google Maps script loaded");
      document.head.appendChild(script);
    };

    loadGoogleMapsScript();
  }, []);

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
        async (position) => {
          const { latitude, longitude } = position.coords;

          // Use Google Maps Geocoding API to get the address from coordinates
          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
            );

            const data = await response.json();

            if (
              data.status === "OK" &&
              data.results &&
              data.results.length > 0
            ) {
              // Extract location name components from the results
              const result = data.results[0];
              const addressComponents = result.address_components || [];

              // Try to find the most relevant location name
              let locationName = "";

              // First try to find a neighborhood, sublocality, or point of interest
              for (const component of addressComponents) {
                const types = component.types || [];
                if (
                  types.includes("neighborhood") ||
                  types.includes("sublocality") ||
                  types.includes("point_of_interest")
                ) {
                  locationName = component.long_name;
                  break;
                }
              }

              // If no specific location found, use the locality (city) or political area
              if (!locationName) {
                for (const component of addressComponents) {
                  const types = component.types || [];
                  if (
                    types.includes("locality") ||
                    types.includes("political")
                  ) {
                    locationName = component.long_name;
                    break;
                  }
                }
              }

              // If still no name found, use the formatted address but simplify it
              if (!locationName && result.formatted_address) {
                locationName = result.formatted_address.split(",")[0];
              }

              // Fall back to first address component if nothing else worked
              if (!locationName && addressComponents.length > 0) {
                locationName = addressComponents[0].long_name;
              }

              // If still no name, just use generic "Current Location"
              if (!locationName) {
                locationName = "Current Location";
              }

              setFormData({
                ...formData,
                location: locationName,
                latitude,
                longitude,
              });

              toast.success("Location found!");
            } else {
              // If geocoding fails, use a generic location name
              setFormData({
                ...formData,
                location: "Current Location",
                latitude,
                longitude,
              });

              toast.success("Location detected!");
            }
          } catch (error) {
            console.error("Error getting address:", error);
            // If there's an error with geocoding, use a generic name
            setFormData({
              ...formData,
              location: "Current Location",
              latitude,
              longitude,
            });

            toast.success("Location detected!");
          }
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

  const openGoogleMaps = () => {
    // For now, we'll open Google Maps in a new tab
    const url = "https://www.google.com/maps";
    window.open(url, "_blank");

    toast.info(
      "Find a location in Google Maps, then enter its coordinates in the form."
    );
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
      // Send request to the backend API
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
        }/api/plants`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Important for sending cookies with the request
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

        <button
          onClick={openGoogleMaps}
          className="ml-auto p-2 rounded-md bg-planti-green-600 text-white hover:bg-planti-green-700 flex items-center"
        >
          <Map size={16} className="mr-2" />
          Open Maps
        </button>
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
