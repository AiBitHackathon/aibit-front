// App.tsx
import React, { useEffect, useState } from "react";
import AuthProvider from "./AuthProvider";
import HomePage from "./HomePage";

export default function App() {
  const [currentPath, setCurrentPath] = useState("/");

  useEffect(() => {
    // Set initial path
    setCurrentPath(window.location.pathname);

    // Listen for path changes (optional, if you're using client-side routing)
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  // Only render HomePage if we're actually on the index page
  if (currentPath !== "/") {
    return null;
  }

  return (
    <AuthProvider>
      <HomePage />
    </AuthProvider>
  );
}
