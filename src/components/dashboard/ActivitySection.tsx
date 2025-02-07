import React from "react";

interface ActivitySectionProps {
  healthData: any;
}

export default function ActivitySection({ healthData }: ActivitySectionProps) {
  const data = healthData?.activity;

  return (
    <div className="bg-white rounded-xl p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        🏃‍♂️ Today's Activity
      </h2>
      <div className="grid grid-cols-2 gap-y-6">
        <div className="flex flex-col">
          <div className="text-blue-600 text-sm mb-1">👣 Steps</div>
          <div className="text-3xl font-bold">
            {data?.summary?.steps?.toLocaleString() || "-"}
          </div>
        </div>
        <div className="flex flex-col">
          <div className="text-blue-600 text-sm mb-1">🔥 Calories</div>
          <div className="text-3xl font-bold">
            {data?.summary?.caloriesOut?.toLocaleString() || "-"}
          </div>
        </div>
        <div className="flex flex-col">
          <div className="text-blue-600 text-sm mb-1">📏 Distance</div>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold mr-2">
              {data?.summary?.distances?.[0]?.distance?.toFixed(2) || "-"}
            </span>
            <span className="text-gray-600 text-lg">km</span>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="text-blue-600 text-sm mb-1">⏱️ Active</div>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold mr-2">
              {(data?.summary?.fairlyActiveMinutes || 0) +
                (data?.summary?.veryActiveMinutes || 0) || "-"}
            </span>
            <span className="text-gray-600 text-lg">min</span>
          </div>
        </div>
      </div>
    </div>
  );
}
