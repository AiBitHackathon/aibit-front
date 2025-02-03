// PrivyWrapper.tsx
import React from "react";
import { PrivyProvider } from "@privy-io/react-auth";

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
        loginMethods: ["google", "email"],
        appearance: {
          theme: "light",
          accentColor: "#00B0B9",
          showWalletLoginFirst: false,
        },
        defaultChainId: 42161,
      }}
    >
      {children}
    </PrivyProvider>
  );
}
