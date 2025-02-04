import React, { useState } from "react";

interface AIAnalysisProps {
  healthData: any;
  onRefreshData: () => Promise<void>;
}

export default function AIAnalysis({
  healthData,
  onRefreshData,
}: AIAnalysisProps) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeData = async () => {
    try {
      setLoading(true);
      setError(null);

      const tokens = JSON.parse(localStorage.getItem("fitbit_tokens") || "{}");
      if (!tokens.access_token) {
        throw new Error("No access token found. Please log in again.");
      }

      const formattedData = {
        activity: healthData?.activity?.summary || {},
        sleep: healthData?.sleep?.sleep?.[0] || {},
        workouts: healthData?.workouts?.activities || [],
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
        const error = await response.json();
        throw new Error(error.details || "Failed to analyze health data");
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to analyze data"
      );
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
          <h2 className="text-xl font-bold text-gray-900 mb-2">{analysis.message}</h2>
          <p className="text-lg text-blue-600">
            Status: {evaluation.overall_status}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Health Metrics */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Health Metrics</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Activity Score</span>
                <span className="font-medium">{evaluation.metrics.activity_score}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sleep Score</span>
                <span className="font-medium">{evaluation.metrics.sleep_score}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Stress Level</span>
                <span className="font-medium">{evaluation.metrics.stress_level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Recovery Status</span>
                <span className="font-medium">{evaluation.metrics.recovery_status}</span>
              </div>
            </div>
          </div>

          {/* Workout Stats */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Workout Stats</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Frequency</span>
                <span className="font-medium">{facts.workout_frequency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Duration</span>
                <span className="font-medium">{facts.avg_workout_duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Calories</span>
                <span className="font-medium">{facts.total_workout_calories}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations Sections */}
        <div className="space-y-6 mt-8">
          {/* Achievements */}
          {evaluation.achievements?.length > 0 && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <h3 className="font-semibold text-green-900 mb-3">Achievements</h3>
              <ul className="space-y-2">
                {evaluation.achievements.map((achievement: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="text-green-800">{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Concerns */}
          {evaluation.concerns?.length > 0 && (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
              <h3 className="font-semibold text-yellow-900 mb-3">Areas of Attention</h3>
              <ul className="space-y-2">
                {evaluation.concerns.map((concern: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-yellow-500">!</span>
                    <span className="text-yellow-800">{concern}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {evaluation.recommendations && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="font-semibold text-blue-900 mb-3">Recommendations</h3>
              <div className="space-y-4">
                {Object.entries(evaluation.recommendations).map(([category, recs]) => (
                  <div key={category}>
                    <h4 className="font-medium text-blue-800 mb-2 capitalize">
                      {category.split('_')[0]}
                    </h4>
                    <ul className="space-y-1">
                      {(recs as string[]).map((rec, index) => (
                        <li key={index} className="flex items-start gap-2 text-blue-700">
                          <span>•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Button Section */}
      <div className="w-full px-6 py-4 bg-white rounded-xl shadow-sm border border-gray-100">
        <button
          onClick={analyzeData}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Analyzing...' : 'Analyze with AI'}
        </button>
  
        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}
      </div>
  
      {/* Results Section */}
      {analysis && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100">
          {renderAnalysisResults()}
        </div>
      )}
    </>
  );
}