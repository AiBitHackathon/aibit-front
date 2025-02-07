import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";

const FITBIT_CLIENT_ID = import.meta.env.PUBLIC_FITBIT_CLIENT_ID;
const SCOPE = "activity heartrate profile sleep";

export default function FitbitLogin() {
  const { user } = usePrivy();
  const [isFitbitConnected, setIsFitbitConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const fitbitTokens = localStorage.getItem("fitbit_tokens");
      if (fitbitTokens) {
        const tokens = JSON.parse(fitbitTokens);
        // If you compute expires_at when storing tokens, this check works.
        // Otherwise you might want to compute expires_at using tokens.expires_in & a stored timestamp.
        const now = Date.now();
        if (tokens.expires_at && tokens.expires_at > now) {
          setIsFitbitConnected(true);
        } else {
          setIsFitbitConnected(false);
        }
      }
    } catch (error) {
      console.error("Error parsing fitbit tokens from localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleFitbitConnect = () => {
    // Ensure that the connected wallet address exists.
    if (!user?.wallet?.address) {
      console.error("Wallet address not found");
      return;
    }

    // Store wallet address for the callback
    sessionStorage.setItem("wallet_address", user.wallet.address);

    // Generate and store a random state for OAuth security
    const state = Math.random().toString(36).substring(2);
    sessionStorage.setItem("oauth_state", state);

    // Construct the redirect URI using the current origin
    const currentOrigin = window.location.origin;
    const redirect_uri = `${currentOrigin}/callback`;

    // Build the Fitbit authorization URL
    const authUrl = `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${FITBIT_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      redirect_uri
    )}&scope=${encodeURIComponent(SCOPE)}&state=${state}`;

    // Redirect the user to the Fitbit login page
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
