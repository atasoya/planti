"use client";

import React, { useEffect, Suspense } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useSearchParams, useRouter } from "next/navigation";

function VerifyPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  useEffect(() => {
    const token = searchParams.get("token");
    console.log("Verification Token:", token);

    const verifyEmail = async () => {
      const response = await fetch(`${apiUrl}/api/auth/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ token }),
      });
      console.log("Response:", response);
      if (response.ok) {
        router.push("/dashboard");
      } else {
        router.push("/login?error=verification_failed");
      }
    };

    if (token) {
      verifyEmail();
    } else {
      console.error("No token found in URL");
      router.push("/login?error=missing_token");
    }
  }, [searchParams, router, apiUrl]);

  return (
    <div className="bg-green-50 min-h-screen flex items-center justify-center flex-col">
      <div className="flex items-center justify-center w-40 h-40">
        <DotLottieReact src="/loader.lottie" loop autoplay speed={0.5} />
      </div>

      <h1 className="mt-4 text-lg font-medium text-planti-green-800">
        🪴 Verifying your magic link...
      </h1>
    </div>
  );
}

const VerifyPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <VerifyPageContent />
    </Suspense>
  );
};

export default VerifyPage;
