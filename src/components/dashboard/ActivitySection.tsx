import React from "react";

interface ActivitySectionProps {
  data: any;
}

export default function ActivitySection({ data }: ActivitySectionProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        🏃‍♂️ Today's Activity
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <div className="text-blue-600 text-sm mb-1">👣 Steps</div>
          <div className="text-2xl font-semibold">
            {data?.summary?.steps?.toLocaleString() || "-"}
          </div>
        </div>
        <div>
          <div className="text-blue-600 text-sm mb-1">📏 Distance</div>
          <div className="text-2xl font-semibold">
            {data?.summary?.distances?.[0]?.distance?.toFixed(2) || "-"} km
          </div>
        </div>
        <div>
          <div className="text-blue-600 text-sm mb-1">⏱️ Active Minutes</div>
          <div className="text-2xl font-semibold">
            {data?.summary?.fairlyActiveMinutes + data?.summary?.veryActiveMinutes || "-"} min
          </div>
        </div>
        <div>
          <div className="text-blue-600 text-sm mb-1">🔥 Calories</div>
          <div className="text-2xl font-semibold">
            {data?.summary?.caloriesOut?.toLocaleString() || "-"}
          </div>
        </div>
      </div>
    </div>
  );
}
