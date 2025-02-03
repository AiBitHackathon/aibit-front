import React from 'react';
import { usePrivy } from '@privy-io/react-auth';

interface HealthData {
  activity: {
    steps: number;
    veryActiveMinutes: number;
    distances: Array<{ distance: number }>;
    caloriesOut: number;
  };
  sleep?: {
    duration: number;
    efficiency: number;
    levels: {
      summary: {
        deep: { minutes: number };
        rem: { minutes: number };
      };
    };
  };
  workouts?: Array<{
    name: string;
    startTime: string;
    duration: number;
    calories: number;
    distance?: number;
  }>;
}

export default function Dashboard() {
  const { authenticated, user, logout } = usePrivy();
  const [healthData, setHealthData] = React.useState<HealthData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!authenticated || !user?.wallet) {
      window.location.href = '/';
      return;
    }

    const fetchData = async () => {
      try {
        const API_URL = import.meta.env.PUBLIC_API_URL;
        const tokens = JSON.parse(localStorage.getItem('fitbit_tokens') || '{}');
        
        if (!tokens.access_token) {
          throw new Error('No Fitbit access token found');
        }

        const [activityResponse, sleepResponse, workoutResponse] = await Promise.all([
          fetch(`${API_URL}/api/fitbit/proxy/1/user/-/activities/date/${new Date().toISOString().split('T')[0]}.json`, {
            headers: { 'Authorization': `Bearer ${tokens.access_token}` }
          }),
          fetch(`${API_URL}/api/fitbit/proxy/1.2/user/-/sleep/date/${new Date(Date.now() - 86400000).toISOString().split('T')[0]}/${new Date().toISOString().split('T')[0]}.json`, {
            headers: { 'Authorization': `Bearer ${tokens.access_token}` }
          }),
          fetch(`${API_URL}/api/fitbit/workouts`, {
            headers: { 'Authorization': `Bearer ${tokens.access_token}` }
          })
        ]);

        const [activityData, sleepData, workoutData] = await Promise.all([
          activityResponse.json(),
          sleepResponse.json(),
          workoutResponse.json()
        ]);

        setHealthData({
          activity: activityData.summary,
          sleep: sleepData.sleep?.[0],
          workouts: workoutData.activities
        });
      } catch (error) {
        console.error('Error fetching health data:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch health data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authenticated, user]);

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('fitbit_tokens');
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B0B9]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="flex justify-between items-center mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Health Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            Wallet: {user?.wallet.address.slice(0, 6)}...{user?.wallet.address.slice(-4)}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg border border-gray-200 shadow-sm flex items-center gap-2 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <h2 className="text-lg sm:text-xl font-semibold p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-white border-b">
            Today's Activity
          </h2>
          <div className="grid grid-cols-2 divide-x divide-gray-100">
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div>
                <div className="text-sm font-medium text-gray-500">Steps</div>
                <div className="mt-1 text-2xl sm:text-3xl font-bold text-blue-600">
                  {healthData?.activity.steps?.toLocaleString() || '-'}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Active Minutes</div>
                <div className="mt-1 text-xl sm:text-2xl font-semibold">
                  {healthData?.activity.veryActiveMinutes || '-'} min
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div>
                <div className="text-sm font-medium text-gray-500">Distance</div>
                <div className="mt-1 text-xl sm:text-2xl font-semibold">
                  {healthData?.activity.distances?.[0]?.distance.toFixed(2) || '-'} km
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Calories Burned</div>
                <div className="mt-1 text-xl sm:text-2xl font-semibold text-orange-500">
                  {healthData?.activity.caloriesOut?.toLocaleString() || '-'}
                </div>
              </div>
            </div>
          </div>
        </section>

        {healthData?.sleep && (
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <h2 className="text-lg sm:text-xl font-semibold p-4 sm:p-6 bg-gradient-to-r from-indigo-50 to-white border-b">
              Last Night's Sleep
            </h2>
            <div className="grid grid-cols-2 divide-x divide-gray-100">
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div>
                  <div className="text-sm font-medium text-gray-500">Duration</div>
                  <div className="mt-1 text-2xl sm:text-3xl font-bold text-indigo-600">
                    {(healthData.sleep.duration / 3600000).toFixed(1)} hours
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Deep Sleep</div>
                  <div className="mt-1 text-xl sm:text-2xl font-semibold">
                    {((healthData.sleep.levels?.summary?.deep?.minutes || 0) / 60).toFixed(1)} hours
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div>
                  <div className="text-sm font-medium text-gray-500">Efficiency</div>
                  <div className="mt-1 text-xl sm:text-2xl font-semibold">
                    {healthData.sleep.efficiency}%
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">REM Sleep</div>
                  <div className="mt-1 text-xl sm:text-2xl font-semibold">
                    {((healthData.sleep.levels?.summary?.rem?.minutes || 0) / 60).toFixed(1)} hours
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
