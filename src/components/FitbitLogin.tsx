import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";

const FITBIT_CLIENT_ID = import.meta.env.PUBLIC_FITBIT_CLIENT_ID;
const SCOPE = "activity heartrate profile sleep";

export default function FitbitLogin() {
  const { user } = usePrivy();
  const [isFitbitConnected, setIsFitbitConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fitbitTokens = localStorage.getItem("fitbit_tokens");
    if (fitbitTokens) {
      const tokens = JSON.parse(fitbitTokens);
      const isValid = tokens.expires_at && tokens.expires_at > Date.now();
      setIsFitbitConnected(isValid);
    }
    setIsLoading(false);
  }, []);

  const handleFitbitConnect = () => {
    if (!user?.wallet?.address) {
      console.error("Wallet address not found");
      return;
    }

    // Store wallet address for the callback
    sessionStorage.setItem("wallet_address", user.wallet.address);

    // Generate and store state for OAuth
    const state = Math.random().toString(36).substring(2);
    sessionStorage.setItem("oauth_state", state);

    // Redirect to Fitbit auth
    const authUrl = `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${FITBIT_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      "https://localhost:8888/callback"
    )}&scope=${encodeURIComponent(SCOPE)}&state=${state}`;

    window.location.href = authUrl;
  };

  if (isLoading) {
    return <div className="animate-pulse h-10 bg-gray-200 rounded"></div>;
  }

  if (isFitbitConnected) {
    return (
      <div className="flex items-center gap-2 text-green-600 font-medium">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        Connected to Fitbit
      </div>
    );
  }

  return (
    <button
      onClick={handleFitbitConnect}
      className="flex items-center gap-2 bg-[#00B0B9] hover:bg-[#009199] text-white px-4 py-2 rounded-lg transition-colors"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
      Connect Fitbit Account
    </button>
  );
}
