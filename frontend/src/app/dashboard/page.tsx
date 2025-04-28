"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const DashboardPage = () => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    console.log("Attempting logout...");

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    try {
      const response = await fetch(`${apiUrl}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        console.log("Logout successful on backend.");
        router.push("/login");
      } else {
        const data = await response.json();
        console.error(
          "Logout failed on backend:",
          data.error || "Unknown error"
        );
        toast.error("Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Network error during logout:", error);
      toast.error(
        "An error occurred during logout. Please check your connection."
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">
        Welcome to Planti Dashboard 🪴
      </h1>
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`px-4 py-2 rounded text-white transition-colors ${
          isLoggingOut
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-red-600 hover:bg-red-700"
        }`}
      >
        {isLoggingOut ? "Logging out..." : "Logout"}
      </button>
    </div>
  );
};

export default DashboardPage;
