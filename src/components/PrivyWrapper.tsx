// PrivyWrapper.tsx
import React from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import {SmartWalletsProvider} from '@privy-io/react-auth/smart-wallets';

export default function PrivyWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const appId = import.meta.env.PUBLIC_PRIVY_APP_ID;

  if (!appId) {
    console.error("Privy App ID is not set!");
    return <div>Error: Privy configuration is missing</div>;
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        embeddedWallets: { 
          ethereum: { 
            createOnLogin: 'all-users', // defaults to 'off'
          }, 
        },
        
      }}
    >
      <SmartWalletsProvider>
        {children}
      </SmartWalletsProvider>
      
    </PrivyProvider>
  );
}
