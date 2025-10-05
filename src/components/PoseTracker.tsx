// In components/PoseTracker.tsx

'use client';
import React, { useEffect, useRef } from 'react';

// Define the component's props
type PoseTrackerProps = {
  exerciseName: string; // e.g., 'bicep_curl', 'squat'
};

const PoseTracker: React.FC<PoseTrackerProps> = ({ exerciseName }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // This effect runs whenever the 'exerciseName' prop changes
  useEffect(() => {
    // The script.js file adds event listeners to buttons with the class 'exercise-btn'.
    // To change the exercise, we can simulate a click on a hidden button that
    // corresponds to the current exerciseName prop.
    const buttonId = `btn-${exerciseName}`;
    const targetButton = document.getElementById(buttonId) as HTMLButtonElement | null;

    if (targetButton) {
      console.log(`Switching exercise to: ${exerciseName}`);
      targetButton.click(); // Programmatically click the button
    }
  }, [exerciseName]); // This effect re-runs ONLY when exerciseName changes

  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
      {/* The script.js file looks for these specific class names */}
      <video ref={videoRef} className="input_video hidden" width="1280" height="720"></video>
      <canvas ref={canvasRef} className="output_canvas w-full h-full" width="1280" height="720"></canvas>

      {/* The 'controls' div and buttons are required by script.js for its event listeners.
        We can hide them since the main UI in page.tsx is handling the selection.
      */}
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
        {/* Add buttons for any other exercises defined in EXERCISE_CONFIG */}
        <button id="btn-reset">Reset</button>
      </div>
    </div>
  );
};

export default PoseTracker;
