'use client';
import React from 'react';
import Link from 'next/link';
import Sidebar from '../../components/sidebar';
import PoseTracker from '../../components/PoseTracker';

// Define a type for the exercise data structure for type safety
type Exercise = {
  id: number;
  name: string;
  configKey: string; // Key to match the config object
  sets: number;
  reps: number;
  description: string;
  image: string; // MODIFIED: Changed from images object to a single image string
};

// Dummy data for the workout session
const workoutData: Exercise[] = [
  {
    id: 1,
    name: 'Bicep Curls',
    configKey: 'bicep_curl',
    sets: 3,
    reps: 12,
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    image: '/assets/bicep_curl.jpg', // MODIFIED
  },
  {
    id: 2,
    name: 'Squats',
    configKey: 'squat',
    sets: 3,
    reps: 15,
    description:
      'Squats are a fundamental exercise that targets your thighs, hips, and buttocks. Ensure your back remains straight and your knees do not go past your toes for proper form.',
    image: '/assets/squat.jpg', // MODIFIED
  },
  {
    id: 3,
    name: 'Wall Push Ups', // Changed name for clarity
    configKey: 'wall_push_up', // FIXED: This now correctly matches the key in EXERCISE_CONFIG
    sets: 3,
    reps: 10,
    description:
      'Wall push ups are a great upper body exercise. They work the triceps, pectoral muscles, and shoulders. When done with proper form, they can also strengthen the lower back and core.',
    image: '/assets/wall_push_up.jpg', // MODIFIED
  },
  {
    id: 4,
    name: 'Glute Bridges',
    configKey: 'glute_bridge', // Example for another exercise
    sets: 3,
    reps: 12,
    description:
      'Glute bridges are excellent for targeting the glutes and hamstrings. Lie on your back with your knees bent and feet flat on the floor, then lift your hips toward the ceiling.',
    image: '/assets/glute_bridge.jpg', // MODIFIED
  },
  {
    id: 5,
    name: 'Seated Leg Raise',
    configKey: 'seated_leg_raise', // Example for another exercise
    sets: 3,
    reps: 12,
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    image: '/assets/seated_leg_raise.png', // MODIFIED
  },
];

const NoSessionCard: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-3xl font-bold text-gray-800">No sessions are ongoing.</h2>
      <p className="mt-1 text-gray-500">Go to your workout schedule and start a session now</p>
      <Link
        href="/schedules"
        className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200"
      >
        Go to Workout Schedule
        <span aria-hidden="true">&rarr;</span>
      </Link>
    </div>
  );
};

const WorkoutSession: React.FC = () => {
  const [selectedExerciseId, setSelectedExerciseId] = React.useState<number | null>(
    workoutData.length > 0 ? workoutData[0].id : null
  );
  const [isTracking, setIsTracking] = React.useState(false);
  const [isWorkoutDone, setIsWorkoutDone] = React.useState(false);

  const selectedExercise = workoutData.find((ex) => ex.id === selectedExerciseId) || null;

  React.useEffect(() => {
    setIsTracking(false);
  }, [selectedExerciseId]);

  // Function to advance to the next exercise or end the workout
  const advanceToNextExercise = () => {
    if (!selectedExerciseId) return;

    const currentIndex = workoutData.findIndex((ex) => ex.id === selectedExerciseId);
    const nextExercise = workoutData[currentIndex + 1];

    if (nextExercise) {
      setSelectedExerciseId(nextExercise.id);
    } else {
      alert('Congratulations, you have completed the workout!');
      setIsWorkoutDone(true);
      setIsTracking(false);
    }
  };

  // Effect to handle automatic progression after finishing an exercise
  React.useEffect(() => {
    const handleExerciseFinished = () => {
      advanceToNextExercise();
    };

    window.addEventListener('exerciseFinished', handleExerciseFinished);

    return () => {
      window.removeEventListener('exerciseFinished', handleExerciseFinished);
    };
  }, [selectedExerciseId]);

  const handleSkipExercise = () => {
    console.log('Skipping exercise...');
    advanceToNextExercise();
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <main className="flex-1 p-8 font-sans ml-72">
        <div className="flex flex-col gap-8">
          {workoutData.length > 0 && selectedExercise ? (
            <>
              {/* Page Header Card */}
              <section className="bg-white p-6 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-gray-800">Workout Session 1</h1>
                <p className="text-md text-gray-500 mt-1">Sunday, October 5, 2025</p>
              </section>
              {/* Top Card: Form Tracker */}
              <section className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-full bg-gray-200 rounded-md aspect-video flex justify-center items-center">
                  {isTracking ? (
                    <PoseTracker exerciseName={selectedExercise.configKey} workoutPlan={workoutData} />
                  ) : (
                    <div className="text-center text-gray-600">
                      {isWorkoutDone ? (
                        <p className="text-xl font-bold text-green-600">Workout Complete!</p>
                      ) : (
                        <>
                          <h3 className="text-2xl font-bold text-gray-800">NEXT UP</h3>
                          <p className="text-4xl font-bold text-blue-600 mt-2">{selectedExercise.name}</p>
                          <p className="text-2xl text-gray-500 mt-1">
                            {selectedExercise.sets} SETS &times; {selectedExercise.reps} REPS
                          </p>
                          <button
                            onClick={handleSkipExercise}
                            className="px-5 py-2 border border-red-400 text-red-500 font-semibold rounded-lg hover:bg-red-500 hover:text-white transition-all duration-200"
                          >
                            Skip Exercise
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* ✨ MODIFIED SECTION: Added Skip Button ✨ */}
                {!isTracking && !isWorkoutDone && (
                  <div className="flex justify-center items-center mt-4 gap-4">
                    <button
                      onClick={() => setIsTracking(true)}
                      className="px-5 py-2 border border-green-400 text-green-500 font-semibold rounded-lg hover:bg-green-500 hover:text-white transition-all duration-200"
                    >
                      Start Movement
                    </button>
                    {/* 👇 NEW BUTTON HERE 👇 */}
                  </div>
                )}
              </section>

              {/* Bottom Section: Workout Details */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ... (rest of the JSX remains exactly the same) ... */}
                <aside className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">This Session</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {workoutData.map((exercise) => (
                      <div
                        key={exercise.id}
                        className={`p-4 rounded-md border-2 transition-all duration-200 ${
                          selectedExerciseId === exercise.id
                            ? 'bg-blue-50 border-blue-500 shadow-sm'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <p className="font-semibold text-blue-600">{exercise.name}</p>
                        <p className="text-sm text-gray-500">{`${exercise.sets} Sets, ${exercise.reps} Reps`}</p>
                      </div>
                    ))}
                  </div>
                </aside>
                <section className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">
                    Movement {selectedExercise.id}: {selectedExercise.name}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{selectedExercise.description}</p>
                  {/* MODIFIED: Displaying a single image instead of start and end positions */}
                  <div className="flex justify-center items-center">
                    <figure className="text-center">
                      <img
                        src={selectedExercise.image}
                        alt={`${selectedExercise.name} illustration`}
                        className="h-64 object-contain"
                      />
                      <figcaption className="text-sm text-gray-500 mt-2">Illustration</figcaption>
                    </figure>
                  </div>
                </section>
              </div>
            </>
          ) : (
            <NoSessionCard />
          )}
        </div>
      </main>
    </div>
  );
};

export default WorkoutSession;
