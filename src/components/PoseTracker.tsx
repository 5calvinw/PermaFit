'use client';
import React, { useEffect, useRef } from 'react';

// Define a type for a single exercise in the plan
type ExercisePlan = {
  id: number;
  name: string;
  configKey: string;
  sets: number;
  reps: number;
};

// Define types for the global functions we created in script.js
declare global {
  interface Window {
    // MODIFIED: Added the initialExerciseName parameter to fix the sync issue
    startPoseTracker: (
      videoEl: HTMLVideoElement,
      canvasEl: HTMLCanvasElement,
      controlsEl: HTMLDivElement,
      initialExerciseName: string,
      initialSet: number
    ) => void;
    stopPoseTracker: () => void;
    isPoseTrackerActive: boolean;
    setWorkoutPlan: (plan: any[]) => void;
  }
}

type PoseTrackerProps = {
  exerciseName: string;
  workoutPlan: ExercisePlan[];
  initialSet: number;
};

const PoseTracker: React.FC<PoseTrackerProps> = ({ exerciseName, workoutPlan, initialSet }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);

  // This useEffect hook handles the initial setup of the pose tracker
  useEffect(() => {
    if (typeof window.setWorkoutPlan === 'function') {
      window.setWorkoutPlan(workoutPlan);
    }

    // Pass the DOM elements directly from the refs, along with the initial set number
    if (videoRef.current && canvasRef.current && controlsRef.current) {
      if (typeof window.startPoseTracker === 'function') {
        // MODIFIED: Pass the exerciseName prop to the tracker's start function
        // This ensures the tracker initializes with the correct exercise from React's state.
        window.startPoseTracker(videoRef.current, canvasRef.current, controlsRef.current, exerciseName, initialSet);
      }
    }

    // Cleanup function to stop the tracker when the component unmounts
    return () => {
      if (typeof window.stopPoseTracker === 'function') {
        window.stopPoseTracker();
      }
    };
  }, []); // This effect should only run once when the component mounts

  // This effect handles SWITCHING exercises while the tracker is already active
  useEffect(() => {
    if (window.isPoseTrackerActive) {
      const buttonId = `btn-${exerciseName}`;
      const targetButton = document.getElementById(buttonId) as HTMLButtonElement | null;

      if (targetButton && !targetButton.classList.contains('active')) {
        console.log(`Switching exercise to: ${exerciseName}`);
        targetButton.click();
      }
    }
  }, [exerciseName]);

  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
      <video ref={videoRef} className="input_video hidden" width="1280" height="720"></video>
      <canvas ref={canvasRef} className="output_canvas w-full h-full" width="1280" height="720"></canvas>

      {/* Attach the ref to the controls div. These buttons are used by script.js to switch exercises. */}
      <div ref={controlsRef} className="controls hidden">
        <button id="btn-bicep_curl" className="exercise-btn">
          Bicep Curl
        </button>
        <button id="btn-squat" className="exercise-btn">
          Squat
        </button>
        <button id="btn-wall_push_up" className="exercise-btn">
          Wall Push Up
        </button>
        <button id="btn-glute_bridge" className="exercise-btn">
          Glute Bridge
        </button>
        <button id="btn-seated_leg_raise" className="exercise-btn">
          Seated Leg Raise
        </button>
      </div>
    </div>
  );
};

export default PoseTracker;
