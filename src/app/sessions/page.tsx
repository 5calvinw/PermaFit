'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '../../components/sidebar';
import PoseTracker from '../../components/PoseTracker';
import { db } from '../lib/db'; // ✨ 1. IMPORT DB INSTANCE

// Define a type for the exercise data structure for type safety
type Exercise = {
  id: number; // This will now correspond to detailID
  name: string;
  configKey: string; // Key to match the config object
  sets: number;
  reps: number;
  description: string;
  image: string;
};

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
  // ✨ 2. MANAGE STATE FOR DYNAMIC DATA AND LOADING
  const [sessionExercises, setSessionExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isWorkoutDone, setIsWorkoutDone] = useState(false);

  // ✨ 3. FETCH AND COMBINE DATA FROM DB ON COMPONENT MOUNT
  useEffect(() => {
    const fetchWorkoutData = async () => {
      if (!db) {
        setIsLoading(false);
        return;
      }
      try {
        // Step 1: Get the first session (e.g., Monday's session)
        const session = await db.sessions.orderBy('sessionID').first();
        if (!session || !session.detailIDs) {
          console.log('No session found in the database.');
          return;
        }

        // Step 2: Get all details for that session
        const details = await db.details.where('detailID').anyOf(session.detailIDs).toArray();

        // Step 3: Get all unique movement definitions needed for these details
        const movementIDs = [...new Set(details.map((d) => d.movementID))];
        const movements = await db.movement.where('movementID').anyOf(movementIDs).toArray();
        const movementMap = new Map(movements.map((m) => [m.movementID, m]));

        // Step 4: Combine details and movements into the final exercise list
        const combinedExercises = details
          .map((detail) => {
            const movement = movementMap.get(detail.movementID);
            if (!movement) return null;

            return {
              id: detail.detailID, // Use detailID as the unique ID
              name: movement.movementName,
              configKey: movement.configKey,
              sets: detail.totalSets,
              reps: detail.totalReps,
              description: movement.movementDescription,
              image: movement.movementImage,
            };
          })
          .filter((ex): ex is Exercise => ex !== null);

        setSessionExercises(combinedExercises);
        if (combinedExercises.length > 0) {
          setSelectedExerciseId(combinedExercises[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch workout data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkoutData();
  }, []); // Empty dependency array means this runs once on mount

  // Find the selected exercise from the state
  const selectedExercise = sessionExercises.find((ex) => ex.id === selectedExerciseId) || null;

  useEffect(() => {
    setIsTracking(false);
  }, [selectedExerciseId]);

  const advanceToNextExercise = () => {
    if (!selectedExerciseId) return;

    const currentIndex = sessionExercises.findIndex((ex) => ex.id === selectedExerciseId);
    const nextExercise = sessionExercises[currentIndex + 1];

    if (nextExercise) {
      setSelectedExerciseId(nextExercise.id);
    } else {
      alert('Congratulations, you have completed the workout!');
      setIsWorkoutDone(true);
      setIsTracking(false);
    }
  };

  useEffect(() => {
    const handleExerciseFinished = () => {
      advanceToNextExercise();
    };
    window.addEventListener('exerciseFinished', handleExerciseFinished);
    return () => {
      window.removeEventListener('exerciseFinished', handleExerciseFinished);
    };
  }, [selectedExerciseId, sessionExercises]); // Add sessionExercises dependency

  const handleSkipExercise = () => {
    console.log('Skipping exercise...');
    advanceToNextExercise();
  };

  // ✨ 5. RENDER LOADING STATE OR DYNAMIC DATA
  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-slate-100">
        <Sidebar />
        <main className="flex-1 p-8 font-sans ml-72 flex justify-center items-center">
          <p className="text-xl text-gray-500">Loading your workout session...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <main className="flex-1 p-8 font-sans ml-72">
        <div className="flex flex-col gap-8">
          {sessionExercises.length > 0 && selectedExercise ? (
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
                    <PoseTracker exerciseName={selectedExercise.configKey} workoutPlan={sessionExercises} />
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

                {!isTracking && !isWorkoutDone && (
                  <div className="flex justify-center items-center mt-4 gap-4">
                    <button
                      onClick={() => setIsTracking(true)}
                      className="px-5 py-2 border border-green-400 text-green-500 font-semibold rounded-lg hover:bg-green-500 hover:text-white transition-all duration-200"
                    >
                      Start Movement
                    </button>
                  </div>
                )}
              </section>

              {/* Bottom Section: Workout Details */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <aside className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">This Session</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {sessionExercises.map((exercise) => (
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
                  <div className="flex justify-center items-center">
                    <figure className="text-center">
                      <img
                        src={`/assets/${selectedExercise.image}`}
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
