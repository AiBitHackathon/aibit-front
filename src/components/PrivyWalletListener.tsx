import { useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useWalletStore } from '../stores/walletStore';

export function PrivyWalletListener() {
  const { setWalletAddress } = useWalletStore();
  const privy = usePrivy();

  useEffect(() => {
    const checkWallet = async () => {
      // Try getting from window.ethereum first
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({
            method: 'eth_accounts',
          });
          if (accounts?.[0]) {
            console.log('Setting wallet from ethereum provider:', accounts[0]);
            setWalletAddress(accounts[0]);
            return;
          }
        } catch (e) {
          console.error('Error getting accounts from ethereum provider:', e);
        }
      }
    };

    checkWallet();

    // Listen for account changes
    const handleAccountsChanged = (accounts: string[]) => {
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

    return () => {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        (window as any).ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [setWalletAddress]);

  return null;
}
