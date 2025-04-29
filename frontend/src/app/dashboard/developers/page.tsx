"use client";

import React, { useState, useEffect } from "react";
import {
  Key,
  Copy,
  Trash,
  RefreshCw,
  AlertTriangle,
  Check,
  Shield,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string | null;
}

const DevelopersPage = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState("");
  const [showNewKey, setShowNewKey] = useState<string | null>(null);
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [showDocs, setShowDocs] = useState(false);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
        }/api/developer/keys`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch API keys");
      }

      const data = await response.json();
      setApiKeys(data.keys || []);
    } catch (error) {
      console.error("Error fetching API keys:", error);
      toast.error("Failed to load API keys. Please try again later.");
      setApiKeys([
        {
          id: "1",
          name: "Mobile App",
          key: "••••••••••••••••",
          createdAt: new Date(
            Date.now() - 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          lastUsed: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
        {
          id: "2",
          name: "Weather Integration",
          key: "••••••••••••••••",
          createdAt: new Date(
            Date.now() - 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          lastUsed: null,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a name for your API key");
      return;
    }

    try {
      setIsCreatingKey(true);
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
        }/api/developer/keys`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ name: newKeyName }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create API key");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to create API key");
      }

      const fullKey = data.key.key;

      setShowNewKey(fullKey);

      setApiKeys([
        {
          id: data.key.id.toString(),
          name: data.key.name,
          key: "••••••••••••••••",
          createdAt: data.key.createdAt,
          lastUsed: null,
        },
        ...apiKeys,
      ]);

      setNewKeyName("");
      toast.success("API key created successfully");
    } catch (error) {
      console.error("Error creating API key:", error);
      toast.error("Failed to create API key. Please try again later.");
    } finally {
      setIsCreatingKey(false);
    }
  };

  const deleteApiKey = async (id: string) => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
        }/api/developer/keys/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete API key");
      }

      setApiKeys(apiKeys.filter((key) => key.id !== id));
      toast.success("API key deleted successfully");
    } catch (error) {
      console.error("Error deleting API key:", error);
      toast.error("Failed to delete API key. Please try again later.");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("API key copied to clipboard");
      })
      .catch(() => {
        toast.error("Failed to copy API key");
      });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-planti-green-900">
            Developer API
          </h1>
          <p className="text-sm text-gray-600">
            Manage API keys to integrate with Planti
          </p>
        </div>
        <button
          onClick={() => setShowDocs(!showDocs)}
          className="flex items-center justify-center gap-1.5 text-sm bg-planti-green-100 text-planti-green-800 py-2 px-3 rounded hover:bg-planti-green-200"
        >
          <Shield size={16} />
          {showDocs ? "Hide API Docs" : "View API Docs"}
          {showDocs ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {showDocs && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-planti-green-900 mb-2">
            API Documentation
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Use the Planti API to access your plant data programmatically. All
            API requests require authentication using an API key.
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="text-md font-semibold text-gray-700">Base URL</h3>
              <p className="text-sm text-gray-600 mb-2">
                All API requests use the following base URL:
              </p>
              <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto">
                {`${
                  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
                }`}
              </pre>
            </div>

            <div>
              <h3 className="text-md font-semibold text-gray-700">
                Authentication
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Include your API key in the headers of all requests:
              </p>
              <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto">
                {`Authorization: Bearer YOUR_API_KEY`}
              </pre>
            </div>

            <div>
              <h3 className="text-md font-semibold text-gray-700">Endpoints</h3>

              <div className="space-y-2 mt-2">
                <div className="border-l-2 border-planti-green-500 pl-3">
                  <p className="text-xs font-semibold text-planti-green-800">
                    GET{" "}
                    {`${
                      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
                    }`}
                    /api/plants
                  </p>
                  <p className="text-xs text-gray-600">Retrieve all plants</p>
                </div>

                <div className="border-l-2 border-planti-green-500 pl-3">
                  <p className="text-xs font-semibold text-planti-green-800">
                    GET{" "}
                    {`${
                      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
                    }`}
                    /api/plants/:id
                  </p>
                  <p className="text-xs text-gray-600">
                    Get a specific plant by ID
                  </p>
                </div>

                <div className="border-l-2 border-planti-green-500 pl-3">
                  <p className="text-xs font-semibold text-planti-green-800">
                    GET{" "}
                    {`${
                      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
                    }`}
                    /api/plants/:id/health
                  </p>
                  <p className="text-xs text-gray-600">
                    Get health history for a specific plant
                  </p>
                </div>

                <div className="border-l-2 border-planti-green-500 pl-3">
                  <p className="text-xs font-semibold text-planti-green-800">
                    GET{" "}
                    {`${
                      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
                    }`}
                    /api/plants/:id/history
                  </p>
                  <p className="text-xs text-gray-600">
                    Get detailed history data for a specific plant
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-md font-semibold text-gray-700">
                Example Request
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Example of a complete API request using curl:
              </p>
              <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto">
                {`curl -X GET "${
                  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
                }/api/plants" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
              </pre>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-planti-green-900 mb-4">
          Create API Key
        </h2>

        <div className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="key-name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              API Key Name
            </label>
            <div className="flex gap-2">
              <input
                id="key-name"
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., Mobile App, Home Assistant Integration"
                className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-planti-green-300"
              />
              <button
                onClick={createApiKey}
                disabled={isCreatingKey || !newKeyName.trim()}
                className={`px-4 py-2 text-sm text-white rounded flex items-center gap-1.5 ${
                  isCreatingKey || !newKeyName.trim()
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-planti-green-600 hover:bg-planti-green-700"
                }`}
              >
                {isCreatingKey ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Key size={16} />
                    Create Key
                  </>
                )}
              </button>
            </div>
          </div>

          {showNewKey && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle size={18} className="text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800">
                    Copy your API key now - you won&apos;t see it again!
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <code className="bg-white p-1.5 text-xs rounded border border-yellow-300 font-mono flex-1 overflow-auto">
                      {showNewKey}
                    </code>
                    <button
                      onClick={() => copyToClipboard(showNewKey)}
                      className="p-1.5 bg-white rounded border border-yellow-300 hover:bg-yellow-100"
                    >
                      <Copy size={16} className="text-yellow-800" />
                    </button>
                  </div>
                  <button
                    onClick={() => setShowNewKey(null)}
                    className="mt-2 text-xs text-yellow-800 hover:text-yellow-600 flex items-center gap-1"
                  >
                    <Check size={14} />
                    I&apos;ve saved my API key
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-planti-green-900 mb-4">
          Your API Keys
        </h2>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-planti-green-700 rounded-full border-t-transparent"></div>
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="text-center py-8">
            <Key size={24} className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">No API keys created yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Key
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Used
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {apiKeys.map((key) => (
                  <tr key={key.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {key.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {key.key}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(key.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {key.lastUsed ? formatDate(key.lastUsed) : "Never used"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => deleteApiKey(key.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DevelopersPage;
