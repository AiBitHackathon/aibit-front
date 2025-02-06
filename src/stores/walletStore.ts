import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WalletState {
  walletAddress: string | null;
  setWalletAddress: (address: string | null) => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      walletAddress: null,
      setWalletAddress: (address) => {
        console.log('Setting wallet address in store:', address);
        set({ walletAddress: address });
        // Verify the state was updated
        const state = useWalletStore.getState();
        console.log('Verified store state:', state);
      },
    }),
    {
      name: 'wallet-storage',
      onRehydrateStorage: () => (state) => {
        console.log('Rehydrated state:', state);
      },
    }
  )
);

// Add store to window for debugging
if (typeof window !== 'undefined') {
  (window as any).useWalletStore = useWalletStore;
  
  // Log initial state
  console.log('Initial wallet store state:', useWalletStore.getState());
  
  // Subscribe to changes
  useWalletStore.subscribe(
    state => state.walletAddress,
    address => console.log('Wallet store updated:', address)
  );
}
