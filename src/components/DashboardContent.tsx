import React from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWalletStore } from "../stores/walletStore";
import HealthDashboard from "./HealthDashboard";

export default function DashboardContent() {
  const { user, authenticated, logout } = usePrivy();
  const { setWalletAddress } = useWalletStore();

  const handleLogout = async () => {
    try {
      await logout();
      setWalletAddress(null); // Clear wallet on logout
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (!authenticated) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="flex justify-between items-center mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Your Health Dashboard
          </h1>
          {user?.wallet?.address && (
            <p className="text-sm text-gray-600 mt-1">
              Wallet: {user.wallet.address.slice(0, 6)}...
              {user.wallet.address.slice(-4)}
            </p>
          )}
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

      <div className="grid grid-cols-1 gap-6 sm:gap-8">
        <HealthDashboard />
      </div>
    </div>
  );
}
