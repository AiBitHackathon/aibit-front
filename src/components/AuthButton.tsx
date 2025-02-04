// AuthButton.tsx
import React from "react";
import { usePrivy, useCreateWallet } from "@privy-io/react-auth";
import { WalletIcon, LogOutIcon } from "lucide-react";

export default function AuthButton() {
  const { login, logout, authenticated, user, ready } = usePrivy();
  const { createWallet } = useCreateWallet(); // Allows manual wallet creation
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    console.log("AuthButton state:");
    console.log("  authenticated:", authenticated);
    console.log("  user:", user);
  }, [authenticated, user]);

  if (!ready) {
    return (
      <div className="w-full flex items-center justify-center px-6 py-3 bg-white text-gray-800 rounded-lg shadow-sm border border-gray-200">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#00B0B9]" />
      </div>
    );
  }

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      await login();
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWallet = async () => {
    try {
      setIsLoading(true);
      const wallet = await createWallet();
      console.log("New wallet created:", wallet);
      // Force a page reload to update the Privy context with the new wallet info.
      window.location.reload();
    } catch (error) {
      console.error("Error creating wallet:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center px-6 py-3 bg-white text-gray-800 rounded-lg shadow-sm border border-gray-200">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#00B0B9]" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <button
        type="button"
        onClick={handleLogin}
        className="w-full flex items-center justify-center px-6 py-3 bg-white text-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 space-x-2"
      >
        <WalletIcon className="w-5 h-5" />
        <span>Connect Wallet</span>
      </button>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#00B0B9] rounded-full flex items-center justify-center">
            <WalletIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {user?.wallet?.address
                ? `${user.wallet.address.slice(
                    0,
                    6
                  )}...${user.wallet.address.slice(-4)}`
                : "Wallet Connected"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          className="text-sm text-red-600 hover:text-red-700"
        >
          <LogOutIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Button for manual embedded wallet creation */}
      <button
        type="button"
        onClick={handleCreateWallet}
        className="w-full flex items-center justify-center px-6 py-3 bg-white text-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200"
      >
        Create Embedded Wallet
      </button>
    </div>
  );
}
