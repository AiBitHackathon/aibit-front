// AiAnalysis.tsx
import React, { useState } from "react";
import { useWalletStore } from "../../stores/walletStore";

interface AIAnalysisProps {
  healthData: any;
  onRefreshData: () => void;
  onAnalysisComplete: () => void;
}

export default function AIAnalysis({
  healthData,
  onRefreshData,
  onAnalysisComplete,
}: AIAnalysisProps) {
  const { walletAddress } = useWalletStore();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAnalyzeButton, setShowAnalyzeButton] = useState(true);

  const analyzeData = async () => {
    try {
      setLoading(true);
      setError(null);

      const tokens = JSON.parse(localStorage.getItem("fitbit_tokens") || "{}");
      if (!tokens.access_token) {
        throw new Error("No access token found. Please log in again.");
      }

      // Prepare the data payload. Note that walletAddress is injected as userWalletAddress.
      // This will be used on the backend (e.g., passed to the tools.checkAndMintNFT function).
      const formattedData = {
        activity: healthData?.activity?.summary || {},
        sleep: healthData?.sleep?.sleep?.[0] || {},
        workouts: healthData?.workouts?.activities || [],
        userWalletAddress: walletAddress, // Wallet address passed for backend tools usage.
        isWalletConnected: !!walletAddress,
        canShowWalletAddress: true,
        walletType: "ethereum",
        showFullAddress: true,
      };

      const response = await fetch(
        `${import.meta.env.PUBLIC_API_URL}/api/health-analysis`,
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
        const errorResponse = await response.json();
        throw new Error(
          errorResponse.details || "Failed to analyze health data"
        );
      }

      const data = await response.json();
      setAnalysis(data);
      setShowAnalyzeButton(false);
      onAnalysisComplete(); // Trigger chat or UI update in parent after analysis
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze data");
    } finally {
      setLoading(false);
    }
  };

  const renderRecommendationSection = (
    title: string,
    recommendations: string[]
  ) => {
    if (!recommendations || recommendations.length === 0) return null;
    return (
      <div className="mb-4">
        <h4 className="font-medium text-blue-900 mb-2">{title}</h4>
        <ul className="space-y-1">
          {recommendations.map((rec, index) => (
            <li key={index} className="flex items-start gap-2 text-blue-800">
              <span>•</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderAnalysisResults = () => {
    if (!analysis) return null;

    const { evaluation, facts } = analysis;
    return (
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="border-b pb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            ✨ {analysis.message}
          </h2>
          <p className="text-lg text-blue-600">
            Status: {evaluation.overall_status}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Health Metrics */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              📊 Health Metrics
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Activity Score</span>
                <span className="font-medium">
                  {evaluation.metrics.activity_score}/100
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sleep Score</span>
                <span className="font-medium">
                  {evaluation.metrics.sleep_score}/100
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Stress Level</span>
                <span className="font-medium">
                  {evaluation.metrics.stress_level}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Recovery Status</span>
                <span className="font-medium">
                  {evaluation.metrics.recovery_status}
                </span>
              </div>
            </div>
          </div>

          {/* Workout Stats */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              💪 Workout Stats
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Frequency</span>
                <span className="font-medium">{facts.workout_frequency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Duration</span>
                <span className="font-medium">
                  {facts.avg_workout_duration}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Calories</span>
                <span className="font-medium">
                  {facts.total_workout_calories}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {evaluation.achievements?.length > 0 && (
            <div className="bg-green-50 rounded-xl p-6 border border-green-100 h-full">
              <h3 className="text-lg font-semibold text-green-900 mb-4">
                <span className="flex items-center gap-2">🏆 Achievements</span>
              </h3>
              <ul className="space-y-3">
                {evaluation.achievements.map(
                  (achievement: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-500">✅</span>
                      <span className="text-green-800">{achievement}</span>
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          {evaluation.concerns?.length > 0 && (
            <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-100 h-full">
              <h3 className="text-lg font-semibold text-yellow-900 mb-4">
                <span className="flex items-center gap-2">
                  ⚠️ Areas of Attention
                </span>
              </h3>
              <ul className="space-y-3">
                {evaluation.concerns.map((concern: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-yellow-500">❗</span>
                    <span className="text-yellow-800">{concern}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {evaluation.recommendations && (
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 h-full md:col-span-2 lg:col-span-1">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">
                <span className="flex items-center gap-2">
                  💡 Recommendations
                </span>
              </h3>
              <div className="space-y-4">
                {Object.entries(evaluation.recommendations).map(
                  ([category, recs]) => (
                    <div key={category}>
                      <h4 className="font-medium text-blue-800 mb-2 capitalize">
                        {category === "activity_recommendations"
                          ? "🏃‍♂️ "
                          : "😴 "}
                        {category.split("_")[0]}
                      </h4>
                      <ul className="space-y-2">
                        {(recs as string[]).map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-blue-500">➡️</span>
                            <span className="text-blue-700">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Analysis Button Section */}
      {!analysis && showAnalyzeButton && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <button
            onClick={analyzeData}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Analyze with AI</span>
              </>
            )}
          </button>
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg flex items-start gap-2">
              <svg
                className="w-5 h-5 mt-0.5 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33975 16C2.56995 17.3333 3.53217 19 5.07183 19Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}
        </div>
      )}

      {/* Render Analysis Results */}
      {analysis && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {/* Header Section */}
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              ✨ {analysis.evaluation.message}
            </h2>
            <div className="flex items-center gap-2 text-lg">
              <div
                className={`w-3 h-3 rounded-full ${
                  analysis.evaluation.overall_status === "Excellent"
                    ? "bg-green-500"
                    : analysis.evaluation.overall_status === "Good"
                    ? "bg-blue-500"
                    : analysis.evaluation.overall_status === "Fair"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              ></div>
              <span className="font-medium text-blue-600">
                Status: {analysis.evaluation.overall_status}
              </span>
            </div>
          </div>

          {/* Metrics Grid Section */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  📊 Health Metrics
                </h3>
                <div className="space-y-3">
                  {Object.entries(analysis.evaluation.metrics).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between"
                      >
                        <span className="text-gray-600 capitalize">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className="font-medium text-gray-900">
                          {value}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  💪 Workout Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Frequency</span>
                    <span className="font-medium text-gray-900">
                      {analysis.facts.workout_frequency}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Avg Duration</span>
                    <span className="font-medium text-gray-900">
                      {analysis.facts.avg_workout_duration}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Calories</span>
                    <span className="font-medium text-gray-900">
                      {analysis.facts.total_workout_calories}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Insights Section */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analysis.evaluation.achievements?.length > 0 && (
                <div className="bg-green-50 rounded-xl p-6 border border-green-100 h-full">
                  <h3 className="text-lg font-semibold text-green-900 mb-4">
                    <span className="flex items-center gap-2">
                      🏆 Achievements
                    </span>
                  </h3>
                  <ul className="space-y-3">
                    {analysis.evaluation.achievements.map(
                      (achievement: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-500">✅</span>
                          <span className="text-green-800">{achievement}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {analysis.evaluation.concerns?.length > 0 && (
                <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-100 h-full">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-4">
                    <span className="flex items-center gap-2">
                      ⚠️ Areas of Attention
                    </span>
                  </h3>
                  <ul className="space-y-3">
                    {analysis.evaluation.concerns.map(
                      (concern: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-yellow-500">❗</span>
                          <span className="text-yellow-800">{concern}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {analysis.evaluation.recommendations && (
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 h-full md:col-span-2 lg:col-span-1">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">
                    <span className="flex items-center gap-2">
                      💡 Recommendations
                    </span>
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(analysis.evaluation.recommendations).map(
                      ([category, recs]) => (
                        <div key={category}>
                          <h4 className="font-medium text-blue-800 mb-2 capitalize">
                            {category === "activity_recommendations"
                              ? "🏃‍♂️ "
                              : "😴 "}
                            {category.split("_")[0]}
                          </h4>
                          <ul className="space-y-2">
                            {(recs as string[]).map((rec, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <span className="text-blue-500">➡️</span>
                                <span className="text-blue-700">{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
