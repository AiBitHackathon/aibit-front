import React from 'react';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';

interface ClientProviderProps {
  children: React.ReactNode;
}

// This component ensures we only render children after Privy is ready
function PrivyInitializer({ children }: { children: React.ReactNode }) {
  const { ready } = usePrivy();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !ready) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B0B9]" />
      </div>
    );
  }

  return <>{children}</>;
}

export default function ClientProvider({ children }: ClientProviderProps) {
  const appId = import.meta.env.PUBLIC_PRIVY_APP_ID;

  if (!appId) {
    console.error('Missing Privy App ID');
    return (
      <div className="text-red-600 p-4">
        Error: Privy configuration is missing
      </div>
    );
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ['google', 'email'],
        appearance: {
          theme: 'light',
          accentColor: '#00B0B9',
          showWalletLoginFirst: false,
        },
        defaultChainId: 1,
      }}
    >
      <PrivyInitializer>{children}</PrivyInitializer>
    </PrivyProvider>
  );
}
