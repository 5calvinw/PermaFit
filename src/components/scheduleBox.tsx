import React from 'react';

// A simple icon component for the three dots.
const MoreVerticalIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);

// Define the type for the component's props
interface WorkoutSessionCardProps {
  day: string;
  date: number;
  month: string;
  title: string;
  status: 'UPCOMING' | 'COMPLETED' | 'IN_PROGRESS';
  scheduledTime: string;
}

// Define the type for the status badge styles
type StatusStyles = {
  [key in WorkoutSessionCardProps['status']]: {
    base: string;
    text: string;
  };
};

// Map status types to their corresponding Tailwind CSS classes
const statusStyles: StatusStyles = {
  UPCOMING: { base: 'bg-yellow-200', text: 'text-yellow-800' },
  COMPLETED: { base: 'bg-green-200', text: 'text-green-800' },
  IN_PROGRESS: { base: 'bg-blue-200', text: 'text-blue-800' },
};


const WorkoutSessionCard: React.FC<WorkoutSessionCardProps> = ({
  day,
  date,
  month,
  title,
  status,
  scheduledTime,
}) => {
  // FIX: Provide a default style object to prevent crashing if the status is invalid.
  const currentStatusStyle = statusStyles[status] || { base: 'bg-gray-200', text: 'text-gray-800' };

  return (
    // Main container with border, shadow, and padding
    <div className="bg-white border border-black/25 rounded-xl p-4 w-full  mx-auto ">
      <div className="flex items-center justify-between gap-4">
        
        <div className="flex flex-grow items-center gap-4">
          {/* Date Block */}
          <div className="flex flex-grow items-start gap-x-12"> 
          <div className="flex flex-col items-center justify-center bg-blue-100/60 text-blue-800 rounded-lg p-3 w-20 h-20">
            <span className="font-bold text-lg leading-tight">{day}</span>
            <span className="font-bold text-lg leading-tight">{date} {month}</span>
          </div>
          
          {/* Middle Section: Workout Details */}
          
            {/* Left side with title and status */}
            <div className="py-3">
              <h2 className="text-xl font-bold text-gray-800">{title}</h2>
              <div className="mt-1">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${currentStatusStyle.base} ${currentStatusStyle.text}`}>
                  {status}
                </span>
              </div>
            </div>
            {/* Right side with schedule time */}
            <div className="text-right py-4">
              <span className="text-sm text-gray-500">Scheduled For</span>
              <p className="font-medium text-medium text-gray-500 ">{scheduledTime}</p>
            </div>
          </div>
        </div>

        {/* Right Section: Options Button */}
        <button className="text-gray-400 hover:text-gray-600 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <MoreVerticalIcon />
        </button>

      </div>
    </div>
  );
};

export default WorkoutSessionCard;

