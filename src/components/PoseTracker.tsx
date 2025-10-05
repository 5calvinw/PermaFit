// In components/PoseTracker.tsx

'use client';
import React, { useEffect, useRef } from 'react';

// Define types for the global functions we created in script.js
// This helps TypeScript understand that these functions exist on the window object.
declare global {
  interface Window {
    startPoseTracker: () => void;
    stopPoseTracker: () => void;
    isPoseTrackerActive: boolean;
  }
}

type PoseTrackerProps = {
  exerciseName: string;
};

const PoseTracker: React.FC<PoseTrackerProps> = ({ exerciseName }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // This effect now handles the STARTING and STOPPING of the pose tracker
  useEffect(() => {
    // Check if the global functions from script.js are available
    if (typeof window.startPoseTracker === 'function') {
      window.startPoseTracker();
    }

    // This is a cleanup function that React runs when the component unmounts
    return () => {
      if (typeof window.stopPoseTracker === 'function') {
        window.stopPoseTracker();
      }
    };
  }, []); // The empty dependency array [] means this effect runs only ONCE when the component mounts.

  // This effect remains to handle SWITCHING exercises while the tracker is active
  useEffect(() => {
    // Only try to switch if the tracker has been initialized
    if (window.isPoseTrackerActive) {
      const buttonId = `btn-${exerciseName}`;
      const targetButton = document.getElementById(buttonId) as HTMLButtonElement | null;

      if (targetButton) {
        console.log(`Switching exercise to: ${exerciseName}`);
        targetButton.click();
      }
    }
  }, [exerciseName]);

  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
      <video ref={videoRef} className="input_video hidden" width="1280" height="720"></video>
      <canvas ref={canvasRef} className="output_canvas w-full h-full" width="1280" height="720"></canvas>

      <div className="controls hidden">
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
        <button id="btn-reset">Reset</button>
      </div>
    </div>
  );
};

export default PoseTracker;
