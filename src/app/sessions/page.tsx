'use client';
import React from 'react';
import Sidebar from '../../components/sidebar';
import PoseTracker from '../../components/PoseTracker'; //  Import the new component

// Define a type for the exercise data structure for type safety
type Exercise = {
  id: number;
  name: string;
  configKey: string; // Key to match the config object
  sets: number;
  reps: number;
  description: string;
  images: {
    start: string;
    end: string;
  };
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
    images: {
      start: 'https://i.imgur.com/zDb4zJq.png',
      end: 'https://i.imgur.com/z6p8yvG.png',
    },
  },
  {
    id: 2,
    name: 'Squats',
    configKey: 'squat',
    sets: 3,
    reps: 15,
    description:
      'Squats are a fundamental exercise that targets your thighs, hips, and buttocks. Ensure your back remains straight and your knees do not go past your toes for proper form.',
    images: {
      start: 'https://i.imgur.com/zDb4zJq.png',
      end: 'https://i.imgur.com/z6p8yvG.png',
    },
  },
  {
    id: 3,
    name: 'Wall Push Ups', // Changed name for clarity
    configKey: 'wall_push_up', // FIXED: This now correctly matches the key in EXERCISE_CONFIG
    sets: 3,
    reps: 10,
    description:
      'Wall push ups are a great upper body exercise. They work the triceps, pectoral muscles, and shoulders. When done with proper form, they can also strengthen the lower back and core.',
    images: {
      start: 'https://i.imgur.com/zDb4zJq.png',
      end: 'https://i.imgur.com/z6p8yvG.png',
    },
  },
  {
    id: 4,
    name: 'Glute Bridges',
    configKey: 'glute_bridge', // Example for another exercise
    sets: 3,
    reps: 12,
    description:
      'Glute bridges are excellent for targeting the glutes and hamstrings. Lie on your back with your knees bent and feet flat on the floor, then lift your hips toward the ceiling.',
    images: {
      start: 'https://i.imgur.com/zDb4zJq.png',
      end: 'https://i.imgur.com/z6p8yvG.png',
    },
  },
];

const WorkoutSession: React.FC = () => {
  const [selectedExerciseId, setSelectedExerciseId] = React.useState<number>(1);
  const selectedExercise = workoutData.find((ex) => ex.id === selectedExerciseId) || workoutData[0];

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <main className="flex-1 p-8 font-sans ml-72">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Workout Session 1</h1>
          <p className="text-md text-gray-500">Sunday, 5 October 2025</p>
        </div>

        <div className="flex flex-col gap-8">
          {/* Top Card: Form Tracker */}
          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Form Tracker</h2>
            <p className="text-gray-600 mb-4">
              Current Movement: <span className="font-medium">{selectedExercise.name}</span>
            </p>

            {/* The PoseTracker component is now integrated and receives the exercise key */}
            <PoseTracker exerciseName={selectedExercise.configKey} />
          </section>

          {/* Bottom Section: Workout Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: List of exercises in the session */}
            <aside className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">This Session</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {workoutData.map((exercise) => (
                  <div
                    key={exercise.id}
                    onClick={() => setSelectedExerciseId(exercise.id)}
                    className={`p-4 rounded-md cursor-pointer border-2 transition-all duration-200 ${
                      selectedExerciseId === exercise.id
                        ? 'bg-blue-50 border-blue-500 shadow-sm'
                        : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-semibold text-blue-600">{exercise.name}</p>
                    <p className="text-sm text-gray-500">{`${exercise.sets} Sets, ${exercise.reps} Reps`}</p>
                  </div>
                ))}
              </div>
            </aside>

            {/* Right Column: Details of the selected movement */}
            <section className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">
                Movement {selectedExercise.id}: {selectedExercise.name}
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">{selectedExercise.description}</p>
              <div className="flex justify-center items-center gap-8">
                <figure className="text-center">
                  <img
                    src={selectedExercise.images.start}
                    alt={`${selectedExercise.name} start position`}
                    className="h-48 object-contain"
                  />
                  <figcaption className="text-sm text-gray-500 mt-2">Start</figcaption>
                </figure>
                <figure className="text-center">
                  <img
                    src={selectedExercise.images.end}
                    alt={`${selectedExercise.name} end position`}
                    className="h-48 object-contain"
                  />
                  <figcaption className="text-sm text-gray-500 mt-2">End</figcaption>
                </figure>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WorkoutSession;
