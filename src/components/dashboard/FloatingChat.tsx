import React, { useState, useEffect, useRef } from "react";
import { useWalletStore } from "../../stores/walletStore";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface FloatingChatProps {
  healthData: any;
  onClose: () => void;
}

export default function FloatingChat({
  healthData,
  onClose,
}: FloatingChatProps) {
  const { walletAddress } = useWalletStore();
  const [isOpen, setIsOpen] = useState(true); // Start maximized
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fitbitId, setFitbitId] = useState<string | null>(null);
  const [hasUserMessage, setHasUserMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_URL = import.meta.env.PUBLIC_API_URL;

  // Fetch Fitbit ID on mount
  useEffect(() => {
    const fetchFitbitId = async () => {
      try {
        const tokens = JSON.parse(localStorage.getItem("fitbit_tokens") || "{}");
        if (!tokens.access_token) {
          console.log("No Fitbit access token found");
          // Don't show message immediately, let user see examples first
          return;
        }

        const res = await fetch(`${API_URL}/api/fitbit/profile`, {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        });

        if (res.ok) {
          const profileData = await res.json();
          const id = profileData.user?.encodedId;
          console.log("Got Fitbit ID:", id);

          if (id) {
            setFitbitId(id);
            checkNillionDatabase(id);
          } else {
            console.log("No encoded ID found in profile");
            throw new Error("No Fitbit ID found in profile");
          }
        } else {
          console.error("Failed to fetch Fitbit profile");
          throw new Error("Failed to fetch Fitbit profile");
        }
      } catch (error) {
        console.error("Error fetching Fitbit ID:", error);
        const errorMessage: Message = {
          id: Date.now().toString(),
          type: "assistant",
          content:
            "I couldn't access your Fitbit profile. Please make sure you're logged in to Fitbit and try again.",
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    };

    if (walletAddress) {
      // Only fetch if wallet is connected
      fetchFitbitId();
    }
  }, [walletAddress]); // Re-run when wallet address changes

  // Check Nillion database for existing user
  const checkNillionDatabase = async (fitbitId: string) => {
    try {
      const response = await fetch(
        `https://nillion-pi.vercel.app/get-latest-nft?fitbitid=${fitbitId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'fitbitid': fitbitId
          }
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          console.log("User not found in Nillion, creating account...");
          await createNillionAccount(fitbitId);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Found existing user in Nillion:", data);
      const welcomeBack: Message = {
        id: Date.now().toString(),
        type: "assistant",
        content: `Welcome back! You're currently at Level ${data.level}. Keep up the great work! 💪`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, welcomeBack]);
    } catch (error) {
      console.error("Error checking Nillion database:", error);
      // Only create account if we got a 404 (user not found)
      if (error.message?.includes("404")) {
        await createNillionAccount(fitbitId);
      } else {
        const errorMessage: Message = {
          id: Date.now().toString(),
          type: "assistant",
          content:
            "I had trouble checking your account status. Please try again later.",
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    }
  };

  // Create new user account in Nillion
  const createNillionAccount = async (fitbitId: string) => {
    try {
      // Format date as YYMMDDHHMM00
      const now = new Date();
      const dateString =
        now.getFullYear().toString().slice(-2) + // YY
        (now.getMonth() + 1).toString().padStart(2, "0") + // MM
        now.getDate().toString().padStart(2, "0") + // DD
        now.getHours().toString().padStart(2, "0") + // HH
        now.getMinutes().toString().padStart(2, "0") + // MM
        "00"; // Fixed suffix

      const response = await fetch("https://nillion-pi.vercel.app/add-nft-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fitbitid: fitbitId,
          dateofupdate: dateString,
          level: "1", // Start at level 1
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Nillion response:", data);

      const newMessage: Message = {
        id: Date.now().toString(),
        type: "assistant",
        content:
          "I've created your account in our secure Nillion database! You're starting at Level 1. Complete your daily fitness goals to level up and earn NFTs! 🎮🏃‍♂️",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, newMessage]);
    } catch (error) {
      console.error("Error creating Nillion account:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: "assistant",
        content:
          "I encountered an error while setting up your account. Please try again later.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  useEffect(() => {
    console.log("FloatingChat using wallet address:", walletAddress);
  }, [walletAddress]);

  // Format wallet address for display in UI only
  const formattedWalletAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : null;

  // Format wallet address for AI context
  const formatWalletForAI = (address: string | null) => {
    if (!address) return null;
    const prefix = address.startsWith("0x") ? "" : "0x";
    return prefix + address;
  };

  useEffect(() => {
    console.log("FloatingChat wallet display:", formattedWalletAddress);
  }, [formattedWalletAddress]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    // Check if Fitbit is connected before proceeding
    const tokens = JSON.parse(localStorage.getItem("fitbit_tokens") || "{}");
    if (!tokens.access_token) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: "assistant",
        content: "Please connect your Fitbit account first to start tracking your fitness journey!",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    setHasUserMessage(true);
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const tokens = JSON.parse(localStorage.getItem("fitbit_tokens") || "{}");
      if (!tokens.access_token) {
        throw new Error("No access token found. Please log in again.");
      }

      const formattedData = {
        message: input.trim(),
        context: {
          // Health data context
          steps: healthData?.activity?.summary?.steps,
          activeMinutes:
            (healthData?.activity?.summary?.fairlyActiveMinutes || 0) +
            (healthData?.activity?.summary?.veryActiveMinutes || 0),
          distance: healthData?.activity?.summary?.distances?.[0]?.distance,
          calories: healthData?.activity?.summary?.caloriesOut,
          sleepDuration: healthData?.sleep?.sleep?.[0]?.minutesAsleep,
          sleepEfficiency: healthData?.sleep?.sleep?.[0]?.efficiency,

          // Wallet context
          userWalletAddress: formatWalletForAI(walletAddress),
          isWalletConnected: !!walletAddress,
          canShowWalletAddress: true,
          walletType: "ethereum",
          showFullAddress: true,
        },
        accessToken: tokens.access_token,
      };

      console.log("Sending to AI - Context:", {
        ...formattedData.context,
        message: input.trim(),
      });

      const response = await fetch(
        `${import.meta.env.PUBLIC_API_URL}/api/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokens.access_token}`,
          },
          body: JSON.stringify(formattedData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const cleanResponse = (responseText: string) => {
        return responseText.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
      };

      const assistantMessage: Message = {
        id: Date.now().toString(),
        type: "assistant",
        content:
          cleanResponse(data.response) ||
          "I couldn't analyze your health data at this moment.",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: "assistant",
        content: "Sorry, I encountered an error processing your request.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Bubble - Only shown when chat is minimized */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#00B0B9] hover:bg-[#009199] text-white rounded-full shadow-lg flex items-center justify-center transition-transform"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </button>
      )}

      {/* Chat Window */}
      <div
        className={`fixed bottom-6 right-6 w-96 bg-blue-50 rounded-lg shadow-xl border-2 border-[#00B0B9] transition-all duration-300 transform ${
          isOpen ? "scale-100 translate-y-0" : "scale-0 translate-y-12"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-purple-50 to-white">
          <div>
            <h3 className="text-lg font-semibold">Health Assistant</h3>
            <p className="text-sm text-gray-600">
              Ask about your health metrics, get personalized advice, or earn
              rewards
            </p>
            {formattedWalletAddress && (
              <p className="text-xs text-gray-500 mt-1">
                Wallet: {formattedWalletAddress}
              </p>
            )}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {!hasUserMessage && (
            <div className="space-y-3 text-gray-600">
              <p className="font-medium">
                Ask me specific questions about your health data:
              </p>
              <ul className="space-y-2 text-sm">
                <li
                  className="flex items-center gap-2 cursor-pointer hover:text-[#00B0B9]"
                  onClick={() => setInput("How many steps have I taken today?")}
                >
                  <span className="w-1.5 h-1.5 bg-[#00B0B9] rounded-full"></span>
                  How many steps have I taken today?
                </li>
                <li
                  className="flex items-center gap-2 cursor-pointer hover:text-[#00B0B9]"
                  onClick={() =>
                    setInput("What's my sleep efficiency from last night?")
                  }
                >
                  <span className="w-1.5 h-1.5 bg-[#00B0B9] rounded-full"></span>
                  What's my sleep efficiency from last night?
                </li>
                <li
                  className="flex items-center gap-2 cursor-pointer hover:text-[#00B0B9]"
                  onClick={() =>
                    setInput("How many active minutes do I have today?")
                  }
                >
                  <span className="w-1.5 h-1.5 bg-[#00B0B9] rounded-full"></span>
                  How many active minutes do I have today?
                </li>
                <li
                  className="flex items-center gap-2 cursor-pointer hover:text-[#00B0B9]"
                  onClick={() =>
                    setInput("What's my total distance covered today?")
                  }
                >
                  <span className="w-1.5 h-1.5 bg-[#00B0B9] rounded-full"></span>
                  What's my total distance covered today?
                </li>
              </ul>
            </div>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.type === "user"
                    ? "bg-[#00B0B9] text-white"
                    : "bg-gray-100"
                }`}
              >
                {message.type === "assistant" && (
                  <div className="flex items-center gap-2 mb-1">
                    <svg
                      className="w-4 h-4 text-[#00B0B9]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" />
                      <path d="M10 6a4 4 0 100 8 4 4 0 000-8zm0 6a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                    <span className="text-xs font-medium text-[#00B0B9]">
                      AI Assistant
                    </span>
                  </div>
                )}
                <div
                  className={
                    message.type === "assistant" ? "text-gray-800" : ""
                  }
                >
                  {message.content}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Section */}
        <div className="p-4 border-t">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-[#00B0B9]"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="p-2 bg-[#00B0B9] text-white rounded-lg hover:bg-[#009199] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
