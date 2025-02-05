import React, { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import ActivitySection from "../components/dashboard/ActivitySection";
import SleepSection from "../components/dashboard/SleepSection";
import StepsHistory from "../components/dashboard/StepsHistory";
import WorkoutHistory from "../components/dashboard/WorkoutHistory";
import FloatingChat from "../components/dashboard/FloatingChat";
import AIAnalysis from "../components/dashboard/AIAnalysis";

const API_URL = import.meta.env.PUBLIC_API_URL;

export default function HealthDashboard() {
  const { ready, authenticated, user, logout } = usePrivy();
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

  const handleLogout = async () => {
    try {
      localStorage.removeItem("fitbit_tokens");
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const tokens = JSON.parse(localStorage.getItem("fitbit_tokens") || "{}");
      if (!tokens.access_token) {
        throw new Error("No access token found. Please log in again.");
      }

      const [activityResponse, sleepResponse, workoutResponse] = await Promise.all([
        fetch(
          `${API_URL}/api/fitbit/proxy/1/user/-/activities/date/${
            new Date().toISOString().split("T")[0]
          }.json`,
          {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
          }
        ),
        fetch(
          `${API_URL}/api/fitbit/proxy/1.2/user/-/sleep/date/${
            new Date(Date.now() - 86400000).toISOString().split("T")[0]
          }/${new Date().toISOString().split("T")[0]}.json`,
          {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
          }
        ),
        fetch(`${API_URL}/api/fitbit/proxy/1/user/-/activities/list.json?beforeDate=${
          new Date().toISOString().split('T')[0]
        }&sort=desc&offset=0&limit=10`, {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        }),
      ]);

      const [activityData, sleepData, workoutData] = await Promise.all([
        activityResponse.json(),
        sleepResponse.json(),
        workoutResponse.json(),
      ]);

      setHealthData({
        activity: activityData,
        sleep: sleepData,
        workouts: workoutData,
      });
    } catch (error) {
      console.error("Error fetching health data:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalysisComplete = () => {
    setTimeout(() => setShowChat(true), 500);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="flex justify-between items-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Your Health Dashboard
        </h1>
        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <p className="text-sm text-gray-500">
              {ready &&
                authenticated &&
                user?.wallet?.address &&
                `${user.wallet.address.slice(
                  0,
                  6
                )}...${user.wallet.address.slice(-4)}`}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg border border-gray-200 shadow-sm flex items-center gap-2 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B0B9]"></div>
        </div>
      ) : (
        healthData && (
          <div className="space-y-6 sm:space-y-8">
            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Left Column */}
              <div className="space-y-6 sm:space-y-8">
                <ActivitySection data={healthData?.activity} />
                <StepsHistory 
                  accessToken={JSON.parse(localStorage.getItem("fitbit_tokens") || "{}").access_token} 
                />
              </div>
              
              {/* Right Column */}
              <div className="space-y-6 sm:space-y-8">
                <SleepSection data={healthData?.sleep} />
                <WorkoutHistory data={healthData?.workouts?.activities || []} />
              </div>
            </div>

            {/* AI Analysis Section */}
            <AIAnalysis
              healthData={healthData}
              onRefreshData={fetchData}
              onAnalysisComplete={handleAnalysisComplete}
            />

            {/* Floating Chat */}
            {showChat && <FloatingChat healthData={healthData} />}
          </div>
        )
      )}
    </div>
  );
}
