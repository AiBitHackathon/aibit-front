import React, { useEffect } from "react";
import { PrivyProvider, usePrivy } from "@privy-io/react-auth";
import { useWalletStore } from "../stores/walletStore";

const PRIVY_APP_ID = import.meta.env.PUBLIC_PRIVY_APP_ID;

interface Props {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: Props) {
  const handleLogin = () => {
    console.log("User logged in");
  };

  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      onSuccess={handleLogin}
      config={{
        loginMethods: ["wallet", "email"],
        appearance: {
          theme: "light",
          accentColor: "#00B0B9",
          showWalletLoginFirst: true,
        },
      }}
    >
      <WalletHandler>{children}</WalletHandler>
    </PrivyProvider>
  );
}

function WalletHandler({ children }: { children: React.ReactNode }) {
  const { ready, authenticated, user } = usePrivy();
  const { setWalletAddress } = useWalletStore();

  useEffect(() => {
    let mounted = true;

    const checkWallet = async () => {
      if (!ready || !authenticated || !user) {
        console.log('Not ready for wallet check:', { ready, authenticated, user });
        return;
      }

      try {
        // Try Privy's embedded provider first
        const provider = (window as any).ethereum;
        if (provider) {
          const accounts = await provider.request({ method: 'eth_accounts' });
          console.log('Got accounts from provider:', accounts);
          if (accounts?.[0] && mounted) {
            console.log('Setting wallet from provider:', accounts[0]);
            setWalletAddress(accounts[0]);
            return;
          }
        }

        // Then try user.wallet
        if (user.wallet?.address && mounted) {
          console.log('Setting wallet from user.wallet:', user.wallet.address);
          setWalletAddress(user.wallet.address);
          return;
        }

        // Finally try getEthereumAccounts
        const wallets = await user.getEthereumAccounts();
        if (wallets?.[0]?.address && mounted) {
          console.log('Setting wallet from getEthereumAccounts:', wallets[0].address);
          setWalletAddress(wallets[0].address);
          return;
        }
      } catch (error) {
        console.error('Error getting wallet:', error);
      }
    };

    // Check wallet when dependencies change
    checkWallet();

    // Set up account change listener
    const handleAccountsChanged = (accounts: string[]) => {
      if (!mounted) return;
      console.log('Accounts changed:', accounts);
      if (accounts?.[0]) {
        setWalletAddress(accounts[0]);
      } else {
        setWalletAddress(null);
      }
    };

    if (typeof window !== 'undefined' && (window as any).ethereum) {
      (window as any).ethereum.on('accountsChanged', handleAccountsChanged);
    }

    // Cleanup
    return () => {
      mounted = false;
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        (window as any).ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [ready, authenticated, user, setWalletAddress]);

  // Debug log state changes
  useEffect(() => {
    console.log('AuthProvider state:', {
      ready,
      authenticated,
      userWallet: user?.wallet?.address,
      storeWallet: useWalletStore.getState().walletAddress
    });
  }, [ready, authenticated, user?.wallet?.address]);

  return <>{children}</>;
}
