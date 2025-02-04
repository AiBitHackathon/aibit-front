// App.tsx
import React from "react";
import AuthProvider from "./AuthProvider";
import HomePage from "./HomePage";

export default function App() {
  return (
    <AuthProvider>
      <HomePage />
    </AuthProvider>
  );
}