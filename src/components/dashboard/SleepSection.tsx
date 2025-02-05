import React from "react";

interface SleepSectionProps {
  data?: {
    sleep?: Array<{
      duration: number;
      efficiency: number;
      levels?: {
        summary?: {
          deep?: {
            minutes: number;
          };
          rem?: {
            minutes: number;
          };
        };
      };
    }>;
  };
}

export default function SleepSection({ data }: SleepSectionProps) {
  const sleep = data?.sleep?.[0];
  const duration = sleep?.duration ? sleep.duration / 3600000 : 8.3; // Convert from milliseconds to hours
  const deepSleep = sleep?.levels?.summary?.deep?.minutes ?? 72; // 1.2 hours in minutes
  const remSleep = sleep?.levels?.summary?.rem?.minutes ?? 96; // 1.6 hours in minutes

  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold p-3 bg-gradient-to-r from-indigo-50 to-white border-b">
        😴 Last Night's Sleep
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-3">
        <div className="p-2">
          <div className="text-sm text-gray-500">⏰ Duration</div>
          <div className="text-xl font-bold text-indigo-600">
            {`${duration.toFixed(1)}h`}
          </div>
        </div>

        <div className="p-2">
          <div className="text-sm text-gray-500">📈 Efficiency</div>
          <div className="text-xl font-semibold">
            {sleep?.efficiency ? `${sleep.efficiency}%` : "98%"}
          </div>
        </div>

        <div className="p-2">
          <div className="text-sm text-gray-500">💫 Deep Sleep</div>
          <div className="text-xl font-semibold">
            {`${(deepSleep / 60).toFixed(1)}h`}
          </div>
        </div>

        <div className="p-2">
          <div className="text-sm text-gray-500">🌙 REM Sleep</div>
          <div className="text-xl font-semibold">
            {`${(remSleep / 60).toFixed(1)}h`}
          </div>
        </div>
      </div>
    </section>
  );
}
