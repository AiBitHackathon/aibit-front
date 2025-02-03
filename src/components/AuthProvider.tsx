import React from 'react';
import { PrivyProvider } from '@privy-io/react-auth';

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [mounted, setMounted] = React.useState(false);
  const appId = import.meta.env.PUBLIC_PRIVY_APP_ID;

  React.useEffect(() => {
    console.log('Auth Provider mounting with app ID:', appId);
    setMounted(true);
  }, [appId]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B0B9]" />
      </div>
    );
  }

  if (!appId) {
    console.error('Missing Privy App ID');
    return (
      <div className="text-red-500 p-4">
        Configuration Error: Missing Privy App ID
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
      }}
    >
      {children}
    </PrivyProvider>
  );
}
