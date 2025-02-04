import React from "react";

interface WorkoutSectionProps {
  data?: {
    activities?: Array<{
      name?: string;
      startTime: string;
      duration?: number;
      calories?: number;
      distance?: number;
    }>;
  };
}

export default function WorkoutSection({ data }: WorkoutSectionProps) {
  const workouts = data?.activities?.slice(0, 5) || []; // Show last 5 workouts

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <h2 className="text-lg sm:text-xl font-semibold p-4 sm:p-6 bg-gradient-to-r from-green-50 to-white border-b">
        Recent Workouts
      </h2>
      <div className="divide-y divide-gray-100 max-h-[280px] overflow-y-auto">
        {workouts.length === 0 ? (
          <div className="p-4 sm:p-6 text-gray-500">No recent workouts</div>
        ) : (
          workouts.map((workout, index) => (
            <div
              key={index}
              className="p-4 sm:p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {workout.name || "Workout"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(workout.startTime).toLocaleDateString()} •
                    {workout.duration
                      ? `${(workout.duration / 60000).toFixed(0)} min`
                      : "N/A"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-orange-500">
                    {workout.calories || 0} cal
                  </p>
                  {workout.distance && (
                    <p className="text-sm text-gray-500 mt-1">
                      {workout.distance} km
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
