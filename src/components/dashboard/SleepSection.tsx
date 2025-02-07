import React from "react";

interface SleepSectionProps {
  healthData: any;
}

export default function SleepSection({ healthData }: SleepSectionProps) {
  const data = healthData?.sleep;
  const latestSleep = data?.sleep?.[0];

  return (
    <div className="bg-white rounded-xl p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        😴 Last Night's Sleep
      </h2>
      <div className="grid grid-cols-2 gap-y-6">
        <div className="flex flex-col">
          <div className="text-blue-600 text-sm mb-1">⏰ Duration</div>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold mr-2">
              {latestSleep?.duration ? (latestSleep.duration / 3600000).toFixed(1) : "-"}
            </span>
            <span className="text-gray-600 text-lg">h</span>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="text-blue-600 text-sm mb-1">📈 Efficiency</div>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold mr-2">
              {latestSleep?.efficiency || "-"}
            </span>
            <span className="text-gray-600 text-lg">%</span>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="text-blue-600 text-sm mb-1">💫 Deep Sleep</div>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold mr-2">
              {latestSleep?.levels?.summary?.deep?.minutes
                ? (latestSleep.levels.summary.deep.minutes / 60).toFixed(1)
                : "-"}
            </span>
            <span className="text-gray-600 text-lg">h</span>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="text-blue-600 text-sm mb-1">🌙 REM Sleep</div>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold mr-2">
              {latestSleep?.levels?.summary?.rem?.minutes
                ? (latestSleep.levels.summary.rem.minutes / 60).toFixed(1)
                : "-"}
            </span>
            <span className="text-gray-600 text-lg">h</span>
          </div>
        </div>
      </div>
    </div>
  );
}
