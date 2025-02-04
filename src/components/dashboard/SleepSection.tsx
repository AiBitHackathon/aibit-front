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
  const duration = sleep?.duration ? sleep.duration / 3600000 : null; // Convert from milliseconds to hours
  const deepSleep = sleep?.levels?.summary?.deep?.minutes ?? 0;
  const remSleep = sleep?.levels?.summary?.rem?.minutes ?? 0;

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <h2 className="text-lg sm:text-xl font-semibold p-4 sm:p-6 bg-gradient-to-r from-indigo-50 to-white border-b">
        Last Night's Sleep
      </h2>
      <div className="grid grid-cols-2 divide-x divide-gray-100">
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div>
            <div className="text-sm font-medium text-gray-500">Duration</div>
            <div className="mt-1 text-2xl sm:text-3xl font-bold text-indigo-600">
              {duration ? `${duration.toFixed(1)} hours` : "-"}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Deep Sleep</div>
            <div className="mt-1 text-xl sm:text-2xl font-semibold">
              {deepSleep ? `${(deepSleep / 60).toFixed(1)} hours` : "-"}
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div>
            <div className="text-sm font-medium text-gray-500">Efficiency</div>
            <div className="mt-1 text-xl sm:text-2xl font-semibold">
              {sleep?.efficiency ? `${sleep.efficiency}%` : "-"}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">REM Sleep</div>
            <div className="mt-1 text-xl sm:text-2xl font-semibold">
              {remSleep ? `${(remSleep / 60).toFixed(1)} hours` : "-"}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
