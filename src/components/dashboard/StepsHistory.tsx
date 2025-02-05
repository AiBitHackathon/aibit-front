import React, { useEffect, useState } from "react";

interface StepsHistoryProps {
  accessToken: string;
}

interface DayData {
  dateTime: string;
  value: string;
}

export default function StepsHistory({ accessToken }: StepsHistoryProps) {
  const [stepsData, setStepsData] = useState<DayData[]>([]);
  const [average, setAverage] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStepsHistory = async () => {
      try {
        // Calculate date range for last 7 days
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 6); // Last 7 days including today

        // Format dates as YYYY-MM-dd for Fitbit API
        const formattedStartDate = startDate.toISOString().split("T")[0];
        const formattedEndDate = endDate.toISOString().split("T")[0];

        const response = await fetch(
          `${
            import.meta.env.PUBLIC_API_URL
          }/api/fitbit/proxy/1/user/-/activities/steps/date/${formattedStartDate}/${formattedEndDate}.json`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch steps data");
        }

        const data = await response.json();
        console.log("Steps data:", data); // For debugging

        if (!data["activities-steps"]) {
          throw new Error("Invalid data format received");
        }

        setStepsData(data["activities-steps"]);

        // Calculate average
        const totalSteps = data["activities-steps"].reduce(
          (sum: number, day: DayData) => sum + parseInt(day.value),
          0
        );
        setAverage(Math.round(totalSteps / 7));
      } catch (err) {
        console.error("Error fetching steps history:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch steps data"
        );
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchStepsHistory();
    }
  }, [accessToken]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="text-red-500">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Steps History</h2>

      <div className="overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                Date
              </th>
              <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">
                Steps
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {stepsData.map((day) => (
              <tr key={day.dateTime} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm text-gray-600">
                  {formatDate(day.dateTime)}
                </td>
                <td className="px-4 py-2 text-sm text-right font-medium text-gray-900">
                  {parseInt(day.value).toLocaleString()}
                </td>
              </tr>
            ))}
            <tr className="bg-blue-50">
              <td className="px-4 py-2 text-sm font-semibold text-blue-700">
                7-Day Average
              </td>
              <td className="px-4 py-2 text-sm text-right font-semibold text-blue-700">
                {average.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
