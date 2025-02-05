import React from 'react';

interface WorkoutHistoryProps {
  data: any[];
}

export default function WorkoutHistory({ data }: WorkoutHistoryProps) {
  if (!data) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-full">
        <h2 className="text-xl font-bold text-gray-900 mb-4">💪 Recent Workouts</h2>
        <p className="text-gray-500 text-sm">No recent workouts found.</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  const formatDuration = (duration: number) => {
    // Convert milliseconds to minutes
    const minutes = Math.round(duration / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-full">
      <h2 className="text-xl font-bold text-gray-900 mb-4">💪 Recent Workouts</h2>
      
      <div className="overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Date</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Activity</th>
              <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">Duration</th>
              <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">Calories</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.slice(0, 7).map((workout, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm text-gray-600">
                  {formatDate(workout.startTime)}
                </td>
                <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                  {workout.activityName}
                </td>
                <td className="px-4 py-2 text-sm text-right text-gray-600">
                  {formatDuration(workout.duration)}
                </td>
                <td className="px-4 py-2 text-sm text-right text-gray-600">
                  {workout.calories}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
