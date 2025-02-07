import React, { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import ActivitySection from "../components/dashboard/ActivitySection";
import SleepSection from "../components/dashboard/SleepSection";
import StepsHistory from "../components/dashboard/StepsHistory";
import WorkoutHistory from "../components/dashboard/WorkoutHistory";
import FloatingChat from "../components/dashboard/FloatingChat";
import AIAnalysis from "../components/dashboard/AIAnalysis";
import NFTDisplay from "../components/dashboard/NFTDisplay";
import { useWalletStore } from "../stores/walletStore";

// If PUBLIC_API_URL is undefined, default to a relative URL.
const API_URL = import.meta.env.PUBLIC_API_URL || "";

export default function HealthDashboard() {
  const { ready, authenticated, user } = usePrivy();
  const { walletAddress, setWalletAddress } = useWalletStore();
  const [healthData, setHealthData] = useState<any>(null);
  const [fitbitId, setFitbitId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

  // Initialize wallet address as soon as Privy is ready
  useEffect(() => {
    const initWallet = async () => {
      if (!ready) {
        console.log("Privy not ready yet");
        return;
      }
      try {
        // Try to get wallet via injected provider (e.g. MetaMask)
        const provider = (window as any).ethereum;
        if (provider) {
          const accounts = await provider.request({ method: "eth_accounts" });
          console.log("Got accounts from provider:", accounts);
          if (accounts && accounts[0]) {
            console.log("Setting wallet address from provider:", accounts[0]);
            setWalletAddress(accounts[0]);
            return;
          }
        }
      } catch (error) {
        console.error("Error getting accounts from provider:", error);
      }
    };
    initWallet();
  }, [ready, setWalletAddress]);

  // Get user's wallet address from Privy when authenticated
  useEffect(() => {
    const getWalletAddress = async () => {
      console.log("Checking wallet address...", { ready, authenticated, user });
      if (ready && authenticated && user) {
        try {
          // First try user.wallet.address (if provided)
          console.log("Checking user.wallet:", user.wallet);
          if (user.wallet?.address) {
            console.log(
              "Got wallet address from user.wallet:",
              user.wallet.address
            );
            setWalletAddress(user.wallet.address);
            return;
          }
          // Then try getEthereumAccounts
          console.log("Trying getEthereumAccounts...");
          const wallets = await user.getEthereumAccounts();
          console.log("Got ethereum accounts:", wallets);
          const primaryWallet = wallets[0];
          if (primaryWallet?.address) {
            console.log(
              "Got wallet address from getEthereumAccounts:",
              primaryWallet.address
            );
            setWalletAddress(primaryWallet.address);
            return;
          }
          console.warn("No wallet address found in Privy");
        } catch (error) {
          console.error("Error getting wallet address from Privy:", error);
        }
      } else {
        console.log("Not ready to get wallet:", { ready, authenticated, user });
      }
    };
    getWalletAddress();
  }, [ready, authenticated, user, setWalletAddress]);

  // Log whenever wallet address changes
  useEffect(() => {
    console.log("Current wallet state:", {
      address: walletAddress,
      storeAddress: useWalletStore.getState().walletAddress,
    });
  }, [walletAddress]);

  // Call the backend NFT endpoint only after we have confirmed the wallet address
  useEffect(() => {
    const callNFTEndpoint = async () => {
      if (!walletAddress) {
        console.log("No wallet address available for NFT call");
        return;
      }

      try {
        console.log("Calling NFT tool with wallet address:", walletAddress);
        const response = await fetch(`${API_URL}/api/nft`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userWalletAddress: walletAddress }),
        });

        if (!response.ok) {
          throw new Error("Network response was not OK");
        }
        const data = await response.json();
        console.log("NFT tool response:", data);
      } catch (err) {
        console.error("Error calling NFT tool:", err);
      }
    };

    callNFTEndpoint();
  }, [walletAddress]);

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

      const [activityResponse, sleepResponse, workoutResponse] =
        await Promise.all([
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
          fetch(
            `${API_URL}/api/fitbit/proxy/1/user/-/activities/list.json?beforeDate=${
              new Date().toISOString().split("T")[0]
            }&sort=desc&offset=0&limit=10`,
            {
              headers: { Authorization: `Bearer ${tokens.access_token}` },
            }
          ),
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

  // Fetch Fitbit profile to get the user ID
  useEffect(() => {
    async function fetchFitbitProfile() {
      const tokens = JSON.parse(localStorage.getItem("fitbit_tokens") || "{}");
      if (!tokens.access_token) return;
      try {
        const res = await fetch(`${API_URL}/api/fitbit/profile`, {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        if (res.ok) {
          const profileData = await res.json();
          setFitbitId(profileData.user?.encodedId || null);
        } else {
          console.error("Failed to fetch Fitbit profile");
        }
      } catch (error) {
        console.error("Error fetching Fitbit profile:", error);
      }
    }
    fetchFitbitProfile();
  }, []);

  // Fetch health data on component load
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
          {fitbitId && (
            <p className="text-sm text-gray-500">Fitbit ID: {fitbitId}</p>
          )}
          <a
            href="/leaderboard"
            className="text-sm bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg border border-gray-200 shadow-sm flex items-center gap-2 transition-colors"
          >
            Leaderboard
          </a>
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

      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B0B9]"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center p-4">{error}</div>
      ) : (
        healthData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <ActivitySection healthData={healthData} />
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <SleepSection healthData={healthData} />
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <NFTDisplay walletAddress={walletAddress} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <StepsHistory
                  accessToken={
                    JSON.parse(localStorage.getItem("fitbit_tokens") || "{}")
                      .access_token
                  }
                />
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <WorkoutHistory data={healthData?.workouts?.activities || []} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <AIAnalysis
                healthData={healthData}
                onRefreshData={fetchData}
                onAnalysisComplete={handleAnalysisComplete}
                className="mt-6"
              />
            </div>
            {showChat && (
              <FloatingChat
                healthData={healthData}
                walletAddress={walletAddress}
              />
            )}
          </div>
        )
      )}
    </div>
  );
}