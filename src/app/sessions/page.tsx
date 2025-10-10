'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '../../components/sidebar';
import PoseTracker from '../../components/PoseTracker';
import { db } from '../lib/db'; // ✨ 1. IMPORT DB INSTANCE

// Define a type for the exercise data structure for type safety
type Exercise = {
  id: number; // This will correspond to detailID
  name: string;
  configKey: string; // Key to match the config object
  sets: number;
  reps: number;
  description: string;
  image: string;
  completedSets: number; // ADDED: To track set progress
  goodRep: number; // ADDED: To track cumulative good reps
  badRep: number; // ADDED: To track cumulative bad reps
};

const NoSessionCard: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-3xl font-bold text-gray-800">No session Today.</h2>
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
  const [initialSetNumber, setInitialSetNumber] = useState(1); // ADDED: State to handle resuming from a specific set

  // ✨ 3. FETCH AND COMBINE DATA, NOW WITH RESUME LOGIC
  useEffect(() => {
    const fetchWorkoutData = async () => {
      if (!db) {
        setIsLoading(false);
        return;
      }
      try {
        // Step 1: Get the first session
        const session = await db.sessions.orderBy('sessionID').first();
        if (!session || !session.detailIDs) {
          console.log('No session found in the database.');
          return;
        }

        // Step 2: Get all details for that session
        const details = await db.details.where('detailID').anyOf(session.detailIDs).toArray();

        // Step 3: Get all unique movement definitions needed
        const movementIDs = [...new Set(details.map((d) => d.movementID))];
        const movements = await db.movement.where('movementID').anyOf(movementIDs).toArray();
        const movementMap = new Map(movements.map((m) => [m.movementID, m]));

        // Step 4: Combine into the final exercise list, including progress
        const combinedExercises = details
          .map((detail) => {
            const movement = movementMap.get(detail.movementID);
            if (!movement) return null;

            return {
              id: detail.detailID,
              name: movement.movementName,
              configKey: movement.configKey,
              sets: detail.totalSets,
              reps: detail.totalReps,
              description: movement.movementDescription,
              image: movement.movementImage,
              completedSets: detail.completedSets || 0, // Load progress
              goodRep: detail.goodRep || 0, // Load progress
              badRep: detail.badRep || 0, // Load progress
            };
          })
          .filter((ex): ex is Exercise => ex !== null);

        // --- RESUME LOGIC ---
        // Find the first exercise that is not yet fully completed
        const firstUnfinishedExercise = combinedExercises.find((ex) => ex.completedSets < ex.sets);

        if (firstUnfinishedExercise) {
          setSessionExercises(combinedExercises);
          setSelectedExerciseId(firstUnfinishedExercise.id);
          // Start at the next uncompleted set (e.g., if 1 set is done, start at set 2)
          setInitialSetNumber(firstUnfinishedExercise.completedSets + 1);
        } else if (combinedExercises.length > 0) {
          // This means all exercises are already completed. Silently show the NoSessionCard.
          setSessionExercises([]);
        }
      } catch (error) {
        console.error('Failed to fetch workout data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkoutData();
  }, []); // Empty dependency array means this runs once on mount

  // ✨ 4. LISTEN FOR 'setFinished' EVENT TO UPDATE THE DATABASE
  useEffect(() => {
    const handleSetFinished = async (event: Event) => {
      const { configKey, goodRepsInSet, badRepsInSet, completedSetNumber } = (event as CustomEvent).detail;

      const exerciseToUpdate = sessionExercises.find((ex) => ex.configKey === configKey);
      if (!exerciseToUpdate) return;

      const newGoodReps = exerciseToUpdate.goodRep + goodRepsInSet;
      const newBadReps = exerciseToUpdate.badRep + badRepsInSet;

      // Update the database with new cumulative reps and completed sets
      await db.details.update(exerciseToUpdate.id, {
        goodRep: newGoodReps,
        badRep: newBadReps,
        completedSets: completedSetNumber,
      });

      // Also update our local React state so the UI reflects the change
      setSessionExercises((prevExercises) =>
        prevExercises.map((ex) =>
          ex.id === exerciseToUpdate.id
            ? { ...ex, goodRep: newGoodReps, badRep: newBadReps, completedSets: completedSetNumber }
            : ex
        )
      );
    };

    window.addEventListener('setFinished', handleSetFinished);
    return () => {
      window.removeEventListener('setFinished', handleSetFinished);
    };
  }, [sessionExercises]); // Re-bind listener if sessionExercises changes

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
      setInitialSetNumber(nextExercise.completedSets + 1); // Set the correct starting set for the next exercise
    } else {
      // This is called when the final exercise is completed.
      alert("Congrats! Today's workout is done.");
      setSessionExercises([]); // Clear exercises, which will cause NoSessionCard to render.
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

  const handleSkipExercise = async () => {
    if (!selectedExercise) return;

    console.log(`Skipping exercise: ${selectedExercise.name}`);

    // Step 1: Update the database to mark the current exercise as 'completed'
    await db.details.update(selectedExercise.id, {
      completedSets: selectedExercise.sets, // Set completed sets to total sets
    });

    // Step 2: Update the local React state to match, so the UI updates instantly
    setSessionExercises((prevExercises) =>
      prevExercises.map((ex) => (ex.id === selectedExercise.id ? { ...ex, completedSets: ex.sets } : ex))
    );

    // Step 3: Advance to the next exercise using the existing function
    advanceToNextExercise();
  };

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

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <main className="flex-1 p-8 font-sans ml-72">
        <div className="flex flex-col gap-8">
          {sessionExercises.length > 0 && selectedExercise ? (
            <>
              {/* Page Header Card */}
              <section className="bg-white p-6 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-gray-800">Workout Session</h1>
                <p className="text-md text-gray-500 mt-1">{today}</p>
              </section>
              {/* Top Card: Form Tracker */}
              <section className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-full bg-gray-200 rounded-md aspect-video flex justify-center items-center">
                  {isTracking ? (
                    <PoseTracker
                      exerciseName={selectedExercise.configKey}
                      workoutPlan={sessionExercises}
                      initialSet={initialSetNumber} // Pass the starting set number
                    />
                  ) : (
                    <div className="text-center text-gray-600">
                      <>
                        <h3 className="text-2xl font-bold text-gray-800">NEXT UP</h3>
                        <p className="text-4xl font-bold text-blue-600 mt-2">{selectedExercise.name}</p>
                        <p className="text-2xl text-gray-500 mt-1">
                          {selectedExercise.sets} SETS &times; {selectedExercise.reps} REPS
                        </p>
                        <p className="text-md text-gray-400 mt-1">
                          (Completed: {selectedExercise.completedSets} of {selectedExercise.sets} sets)
                        </p>
                        <button
                          onClick={handleSkipExercise}
                          className="mt-4 px-4 py-2 border border-red-500 text-red-500 font-semibold rounded-lg hover:bg-red-50 transition-all duration-200"
                        >
                          Skip Exercise
                        </button>
                      </>
                    </div>
                  )}
                </div>

                {!isTracking && (
                  <div className="flex justify-center items-center mt-4 gap-4">
                    <button
                      onClick={() => setIsTracking(true)}
                      className="px-6 py-3 text-green-500 bg-white font-semibold text-lg rounded-lg hover:bg-green-50 transition-all duration-200 border border-green-400"
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
                    {sessionExercises.map((exercise) => {
                      const isCompleted = exercise.completedSets >= exercise.sets;

                      if (isCompleted) {
                        // Render a special card for completed exercises
                        return (
                          <div
                            key={exercise.id}
                            className="p-4 rounded-md border-2 transition-all duration-200 bg-green-100 border-green-300"
                          >
                            <p className="font-semibold text-green-800">{exercise.name}</p>
                            <p className="text-sm text-green-600">{`${exercise.sets} Sets, ${exercise.reps} Reps`}</p>
                          </div>
                        );
                      } else {
                        // Render the standard card for in-progress exercises
                        return (
                          <div
                            key={exercise.id}
                            className={`p-4 rounded-md border-2 transition-all duration-200 relative overflow-hidden ${
                              selectedExerciseId === exercise.id
                                ? 'bg-blue-50 border-blue-500 shadow-sm'
                                : 'bg-white border-gray-200'
                            }`}
                          >
                            <div
                              className="absolute top-0 left-0 h-full bg-blue-100 transition-all duration-300"
                              style={{ width: `${(exercise.completedSets / exercise.sets) * 100}%` }}
                            ></div>
                            <div className="relative z-10">
                              <p className="font-semibold text-blue-600">{exercise.name}</p>
                              <p className="text-sm text-gray-500">{`${exercise.sets} Sets, ${exercise.reps} Reps`}</p>
                            </div>
                          </div>
                        );
                      }
                    })}
                  </div>
                </aside>
                <section className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">
                    Movement Details: {selectedExercise.name}
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
