import React from 'react';
import { usePrivy } from '@privy-io/react-auth';
import AuthButton from './AuthButton';
import AuthProvider from './AuthProvider';

export default function HomePage() {
  const { authenticated, user } = usePrivy();
  const [isConnectingFitbit, setIsConnectingFitbit] = React.useState(false);

  const FITBIT_CLIENT_ID = import.meta.env.PUBLIC_FITBIT_CLIENT_ID;
  const PUBLIC_API_URL = import.meta.env.PUBLIC_API_URL;
  const REDIRECT_URI = `${PUBLIC_API_URL}/callback`;
  const SCOPE = 'activity profile sleep';

  const handleFitbitConnect = () => {
    setIsConnectingFitbit(true);
    const state = Math.random().toString(36).substring(2);
    sessionStorage.setItem('oauth_state', state);
    const authUrl = `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${FITBIT_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPE)}&state=${state}`;
    window.location.href = authUrl;
  };

  React.useEffect(() => {
    // If user is authenticated and has wallet, check if they're already connected to Fitbit
    if (authenticated && user?.wallet) {
      const fitbitTokens = localStorage.getItem('fitbit_tokens');
      if (fitbitTokens) {
        // Redirect to dashboard if already connected to Fitbit
        window.location.href = '/dashboard';
      }
    }
  }, [authenticated, user]);

  return (
    <AuthProvider>
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#00B0B9] to-[#008C94]">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Venice</h1>
            <p className="text-gray-600">Your AI Fitness Assistant</p>
          </div>

          <div id="error" className="hidden mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline" id="errorMessage"></span>
          </div>

          <div className="space-y-4">
            <div id="auth-flow">
              <AuthButton />
            </div>

            {authenticated && user?.wallet && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Connect your Fitbit</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-600 mb-2">Connected Wallet:</p>
                  <p className="font-mono text-sm">{user.wallet.address}</p>
                </div>

                <button
                  onClick={handleFitbitConnect}
                  disabled={isConnectingFitbit}
                  className={`w-full bg-[#00B0B9] text-white px-6 py-3 rounded-lg hover:bg-[#008C94] transition-colors flex items-center justify-center space-x-2 ${
                    isConnectingFitbit ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isConnectingFitbit ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <>
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.9,17.39C17.64,16.59 16.89,16 16,16H15V13C15,12.45 14.55,12 14,12H8V10H10C10.55,10 11,9.55 11,9V7H13C14.1,7 15,6.1 15,5V4.59C17.93,5.77 20,8.64 20,12C20,14.08 19.2,15.97 17.9,17.39M11,19.93C7.05,19.44 4,16.08 4,12C4,11.38 4.08,10.78 4.21,10.21L9,15V16C9,17.1 9.9,18 11,18M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2Z" />
                      </svg>
                      <span>Connect with Fitbit</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </AuthProvider>
  );
}
