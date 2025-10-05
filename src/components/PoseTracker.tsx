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
    startPoseTracker: (videoEl: HTMLVideoElement, canvasEl: HTMLCanvasElement, controlsEl: HTMLDivElement) => void;
    stopPoseTracker: () => void;
    isPoseTrackerActive: boolean;
    setWorkoutPlan: (plan: any[]) => void;
  }
}

type PoseTrackerProps = {
  exerciseName: string;
  workoutPlan: ExercisePlan[]; // Pass the whole plan
};

const PoseTracker: React.FC<PoseTrackerProps> = ({ exerciseName, workoutPlan }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null); // ADDED: Ref for the controls div

  // MODIFIED: This useEffect hook is now much more reliable
  useEffect(() => {
    if (typeof window.setWorkoutPlan === 'function') {
      window.setWorkoutPlan(workoutPlan);
    }

    // Pass the DOM elements directly from the refs
    if (videoRef.current && canvasRef.current && controlsRef.current) {
      if (typeof window.startPoseTracker === 'function') {
        window.startPoseTracker(videoRef.current, canvasRef.current, controlsRef.current);
      }
    }

    return () => {
      if (typeof window.stopPoseTracker === 'function') {
        window.stopPoseTracker();
      }
    };
  }, []);

  // This effect remains to handle SWITCHING exercises while the tracker is active
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

      {/* ADDED: Attach the ref to the controls div */}
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
      </div>
    </div>
  );
};

export default PoseTracker;
