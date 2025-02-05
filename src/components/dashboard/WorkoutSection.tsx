import React from 'react';
import { Popover } from '@headlessui/react';

interface Workout {
  date: string;
  duration: number;
  calories: number;
  distance: number;
}

interface WorkoutSectionProps {
  data?: {
    workouts?: Workout[];
  };
}

export default function WorkoutSection({ data }: WorkoutSectionProps) {
  // Sample data if no data provided
  const sampleWorkouts = [
    { date: '2025-02-04', duration: 66, calories: 502, distance: 4.35594 },
    { date: '2025-02-03', duration: 16, calories: 123, distance: 0 },
    { date: '2025-02-01', duration: 14, calories: 98, distance: 0.86334 },
  ];

  const workouts = data?.workouts || sampleWorkouts;
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDay = firstDayOfMonth.getDay();

  // Create calendar days array
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(today.getFullYear(), today.getMonth(), i + 1);
    const dateStr = date.toISOString().split('T')[0];
    const workout = workouts.find(w => w.date === dateStr);
    return {
      date: i + 1,
      workout,
      isToday: date.toDateString() === today.toDateString()
    };
  });

  // Add empty cells for days before the first day of the month
  const emptyCells = Array(startingDay).fill(null);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-100 h-full flex flex-col">
      <h2 className="text-lg font-semibold p-3 bg-gradient-to-r from-green-50 to-white border-b">
        Workouts
      </h2>
      <div className="p-3 flex-1 flex flex-col min-h-0">
        {/* Week days header */}
        <div className="grid grid-cols-7 mb-1">
          {weekDays.map(day => (
            <div key={day} className="text-xs text-center text-gray-500 pb-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 flex-1">
          {emptyCells.map((_, i) => (
            <div key={`empty-${i}`} className="relative w-full pt-[100%]" />
          ))}
          
          {days.map(({ date, workout, isToday }) => (
            <Popover key={date} className="relative w-full pt-[100%]">
              {({ open }) => (
                <>
                  <Popover.Button
                    className={`absolute inset-0 w-full h-full flex items-center justify-center
                      ${workout ? 'bg-green-50 hover:bg-green-100' : 'hover:bg-gray-50'} 
                      ${isToday ? 'ring-2 ring-blue-500' : ''}
                      ${workout ? 'cursor-pointer' : 'cursor-default'}
                      rounded transition-colors text-sm`}
                  >
                    <div className="flex flex-col items-center">
                      <span className={workout ? 'font-medium' : ''}>
                        {date}
                      </span>
                      {workout && (
                        <div className="w-1 h-1 bg-green-500 rounded-full mt-0.5" />
                      )}
                    </div>
                  </Popover.Button>

                  {workout && (
                    <Popover.Panel 
                      className={`absolute z-10 w-36 sm:w-48 p-2 bg-white rounded-lg shadow-lg border border-gray-200
                        ${open ? 'opacity-100' : 'opacity-0'}
                        transition-opacity duration-200`}
                      style={{
                        top: 'calc(100% + 4px)',
                        left: '50%',
                        transform: 'translateX(-50%)'
                      }}
                    >
                      <div className="space-y-1">
                        <div className="text-xs sm:text-sm font-medium text-gray-900">
                          Workout Details
                        </div>
                        <div className="text-xs text-gray-600">
                          Duration: {workout.duration} min
                        </div>
                        <div className="text-xs text-gray-600">
                          Calories: {workout.calories} cal
                        </div>
                        {workout.distance > 0 && (
                          <div className="text-xs text-gray-600">
                            Distance: {workout.distance.toFixed(2)} km
                          </div>
                        )}
                      </div>
                    </Popover.Panel>
                  )}
                </>
              )}
            </Popover>
          ))}
        </div>
      </div>
    </section>
  );
}
