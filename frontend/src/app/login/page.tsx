import React from "react";
import Image from "next/image";

const page = () => {
  return (
    <div className="w-full min-h-screen flex flex-col lg:flex-row items-center justify-center p-4 relative bg-cover bg-center bg-[url('/planti-login-banner.jpeg')] lg:bg-none lg:bg-green-50">
      <div className="absolute inset-0 bg-planti-green-900/40 lg:hidden"></div>

      <div className="hidden lg:block lg:w-1/3 h-64 lg:h-[calc(100vh-2rem)] rounded-lg shadow-lg relative overflow-hidden mb-4 lg:mb-0 lg:mr-4">
        <Image
          src="/planti-login-banner.jpeg"
          alt="Planti Login Banner"
          fill
          priority
          quality={100}
          className="object-cover object-center"
        />
      </div>

      <div className="w-full lg:w-2/3 h-auto lg:h-[calc(100vh-2rem)] bg-white/90 lg:bg-white/60 backdrop-blur-sm lg:backdrop-blur-none rounded-lg p-8 lg:p-10 shadow-lg flex flex-col justify-center z-10">
        <h1 className="text-2xl lg:text-3xl font-bold text-planti-green-900 lg:text-planti-green-900 mb-6 lg:mb-8 text-center">
          Login to Planti 🪴
        </h1>

        <form className="space-y-4 lg:space-y-6 max-w-md mx-auto w-full">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-planti-green-800 lg:text-planti-green-900 mb-1"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="w-full p-3 rounded-md border border-planti-green-600 focus:outline-none focus:ring-2 focus:ring-planti-green-800"
              placeholder="Enter your email"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-planti-green-800 text-white font-medium py-3 px-4 rounded-md hover:bg-planti-green-900 transition-colors"
          >
            Send Magic Link
          </button>

          <div className="text-center mt-4 text-sm text-planti-green-700 lg:text-planti-green-800">
            <p>We&apos;ll send you a magic link for passwordless sign-in</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default page;
