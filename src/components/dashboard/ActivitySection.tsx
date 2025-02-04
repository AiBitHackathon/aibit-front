import React from "react";

interface ActivitySectionProps {
  data?: {
    summary?: {
      steps: number;
      veryActiveMinutes: number;
      distances: Array<{ distance: number }>;
      caloriesOut: number;
    };
  };
}

export default function ActivitySection({ data }: ActivitySectionProps) {
  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <h2 className="text-lg sm:text-xl font-semibold p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-white border-b">
        Today's Activity
      </h2>
      <div className="grid grid-cols-2 divide-x divide-gray-100">
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div>
            <div className="text-sm font-medium text-gray-500">Steps</div>
            <div className="mt-1 text-2xl sm:text-3xl font-bold text-blue-600">
              {data?.summary?.steps?.toLocaleString() || "-"}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">
              Active Minutes
            </div>
            <div className="mt-1 text-xl sm:text-2xl font-semibold">
              {data?.summary?.veryActiveMinutes
                ? `${data.summary.veryActiveMinutes} min`
                : "-"}
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div>
            <div className="text-sm font-medium text-gray-500">Distance</div>
            <div className="mt-1 text-xl sm:text-2xl font-semibold">
              {data?.summary?.distances?.[0]?.distance
                ? `${data.summary.distances[0].distance.toFixed(2)} km`
                : "-"}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">
              Calories Burned
            </div>
            <div className="mt-1 text-xl sm:text-2xl font-semibold text-orange-500">
              {data?.summary?.caloriesOut?.toLocaleString() || "-"}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
