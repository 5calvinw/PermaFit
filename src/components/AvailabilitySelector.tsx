'use client';

export type Day = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
export const DAYS_OF_WEEK: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

type TimeBlockLabel = 'Morning' | 'Afternoon' | 'Evening';

export type Availability = Record<Day, Record<TimeBlockLabel, boolean>>;

const TIME_BLOCKS = [
  { label: 'Morning' as TimeBlockLabel, time: '09:00', range: '08:00 - 12:00' },
  { label: 'Afternoon' as TimeBlockLabel, time: '14:00', range: '13:00 - 17:00' },
  { label: 'Evening' as TimeBlockLabel, time: '18:00', range: '18:00 - 21:00' },
];

interface AvailabilitySelectorProps {
  availability: Availability;
  onToggle: (day: Day, blockLabel: TimeBlockLabel) => void;
}

export default function AvailabilitySelector({ availability, onToggle }: AvailabilitySelectorProps) {
  return (
    <div className="bg-white p-8 shadow-xl rounded-xl">
      <h2 className="text-xl font-bold text-gray-800">Availability (Choose more than 1 day!)</h2>
      <p className="text-gray-600 mt-1 mb-4">
        Tell us about your availability so that we can give you the best possible schedule.
      </p>
      <div className="space-y-4">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} className="grid grid-cols-[100px_1fr] items-center gap-4">
            <span className="font-semibold text-gray-700 text-right text-lg">{day}</span>
            <div className="grid grid-cols-3 gap-4">
              {TIME_BLOCKS.map((block) => (
                <button
                  type="button"
                  key={block.label}
                  onClick={() => onToggle(day, block.label)}
                  className={`w-full rounded-md transition-colors h-16 flex flex-col items-center justify-center ${
                    availability[day]?.[block.label]
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <span className="font-bold text-sm">{block.range}</span>
                  <span className="text-xs">{block.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
