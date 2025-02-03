import React from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import type { ReactNode } from 'react';

export default function AppWrapper({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const appId = import.meta.env.PUBLIC_PRIVY_APP_ID;
  
  if (!mounted) {
    return null;
  }

  if (!appId) {
    console.error('Missing Privy App ID:', import.meta.env);
    return <div className="text-red-500 p-4">Missing Privy App ID</div>;
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
      {children}
    </PrivyProvider>
  );
}
