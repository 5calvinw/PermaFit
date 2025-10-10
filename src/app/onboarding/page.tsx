'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { db, IUser, ISession, IDetail } from '../lib/db';
import AvailabilitySelector, { Availability, Day, DAYS_OF_WEEK } from '../../components/AvailabilitySelector';

interface IFormData {
  name: string;
  age: string;
  height: string;
  bodyWeight: string;
  gender: string;
  healthConditions: string;
}

type FormattedAvailability = Record<Day, string[]>;
type ScheduleSlot = { day: string; slot: string };

const TIME_BLOCKS = [
  { label: 'Morning', time: '09:00', range: '08:00 - 12:00' },
  { label: 'Afternoon', time: '14:00', range: '13:00 - 17:00' },
  { label: 'Evening', time: '18:00', range: '18:00 - 21:00' },
];

/**
 * Creates the initial state for the availability grid.
 * ✨ REVISED to be more explicit and type-safe, avoiding a risky cast.
 * @returns {Availability} The initial availability object.
 */
const createInitialAvailability = (): Availability => {
  const initialState = {} as Availability;
  for (const day of DAYS_OF_WEEK) {
    initialState[day] = {
      Morning: false,
      Afternoon: false,
      Evening: false,
    };
  }
  return initialState;
};

/**
 * Selects a weekly exercise schedule based on user availability, aiming for an even distribution of sessions.
 * @param {FormattedAvailability} availability - The user's available time slots (as representative times).
 * @param {number} sessions - The desired number of sessions per week.
 * @returns {ScheduleSlot[]} An array of selected schedule slots.
 */
function pickSchedule(availability: FormattedAvailability, sessions: number): ScheduleSlot[] {
  const dayOrder: Record<string, number> = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 7,
  };

  const allAvailableSlots = Object.entries(availability)
    .flatMap(([day, slots]) => slots.map((time) => ({ dayIndex: dayOrder[day], day, time })))
    .sort((a, b) => a.dayIndex - b.dayIndex || a.time.localeCompare(b.time));

  const uniqueDaySlotsMap = new Map<string, { dayIndex: number; day: string; time: string }>();
  for (const slot of allAvailableSlots) {
    if (!uniqueDaySlotsMap.has(slot.day)) {
      uniqueDaySlotsMap.set(slot.day, slot);
    }
  }
  let potentialSlots = Array.from(uniqueDaySlotsMap.values());

  if (sessions <= 0 || potentialSlots.length === 0) return [];

  const selectedSchedule: ScheduleSlot[] = [];
  const gap = 7.0 / sessions;
  let lastPickedDayIndex = -Infinity;

  while (selectedSchedule.length < sessions && potentialSlots.length > 0) {
    const nextSlotIndex = potentialSlots.findIndex((slot) => slot.dayIndex >= lastPickedDayIndex + gap);

    if (nextSlotIndex !== -1) {
      const [nextSlot] = potentialSlots.splice(nextSlotIndex, 1);
      selectedSchedule.push({ day: nextSlot.day, slot: nextSlot.time });
      lastPickedDayIndex = nextSlot.dayIndex;
    } else {
      break;
    }
  }

  if (selectedSchedule.length < sessions) {
    const pickedDays = new Set(selectedSchedule.map((s) => s.day));
    const remainingSlots = potentialSlots.filter((s) => !pickedDays.has(s.day));
    const needed = sessions - selectedSchedule.length;

    for (let i = 0; i < needed && i < remainingSlots.length; i++) {
      selectedSchedule.push({ day: remainingSlots[i].day, slot: remainingSlots[i].time });
    }
  }

  return selectedSchedule;
}

/**
 * Validates the form data before submission.
 * @param {IFormData} data - The form data to validate.
 * @returns {string | null} An error message string if validation fails, otherwise null.
 */
function validateFormData(data: IFormData): string | null {
  const age = parseInt(data.age, 10);
  const height = parseInt(data.height, 10);
  const weight = parseInt(data.bodyWeight, 10);

  if (data.name.trim() === '') return 'Name is required.';
  if (!age || age < 1 || age > 120) return 'Please enter a valid age between 1 and 120.';
  if (!height || height < 50 || height > 200) return 'Please enter a valid height between 50 and 200 cm.';
  if (!weight || weight < 20 || weight > 200) return 'Please enter a valid body weight between 20 and 200 kg.';
  if (data.gender === '') return 'Please select a gender.';
  if (data.healthConditions === '') return 'Please select a health condition option.';
  return null;
}

export default function SchedulesPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<IFormData>({
    name: '',
    age: '',
    height: '',
    bodyWeight: '',
    gender: '',
    healthConditions: '',
  });

  const [availability, setAvailability] = useState<Availability>(createInitialAvailability());

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let processedValue = value;
    if (['age', 'height', 'bodyWeight'].includes(name)) {
      processedValue = value.replace(/\D/g, '');
    } else if (name === 'name') {
      processedValue = value.replace(/[^a-zA-Z\s]/g, '');
    }
    setFormData((prevState) => ({ ...prevState, [name]: processedValue }));
  }, []);

  const handleAvailabilityToggle = useCallback((day: Day, blockLabel: 'Morning' | 'Afternoon' | 'Evening') => {
    setAvailability((prev) => ({
      ...prev,
      [day]: { ...prev[day], [blockLabel]: !prev[day][blockLabel] },
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const validationError = validateFormData(formData);
      if (validationError) {
        alert(validationError);
        return;
      }

      try {
        const newUser: IUser = {
          name: formData.name,
          age: parseInt(formData.age, 10),
          height: parseInt(formData.height, 10),
          weight: parseInt(formData.bodyWeight, 10),
          health: formData.healthConditions,
          preferredFrequency: '',
          availability: availability,
        };
        await db.users.add(newUser);
        
        const sessionsPerWeek = Object.values(availability).filter((daySlots) =>
          Object.values(daySlots).some((isSelected) => isSelected)
        ).length;

        const formattedAvailability: FormattedAvailability = {} as FormattedAvailability;
        const blockTimeToLabelMap = Object.fromEntries(TIME_BLOCKS.map((b) => [b.label, b.time]));

        (Object.keys(availability) as Day[]).forEach((day) => {
          const blocks = availability[day];
          const timeBlockLabels = Object.keys(blocks) as ('Morning' | 'Afternoon' | 'Evening')[];

          const selectedTimes = timeBlockLabels
            .filter((blockLabel) => blocks[blockLabel])
            .map((blockLabel) => blockTimeToLabelMap[blockLabel]);

          if (selectedTimes.length > 0) {
            formattedAvailability[day] = selectedTimes;
          }
        });

        if (sessionsPerWeek > 0 && Object.keys(formattedAvailability).length > 0) {
          const generatedSchedule = pickSchedule(formattedAvailability, sessionsPerWeek);
          const movementOrder = [1, 3, 2, 5, 4];

          for (const scheduleItem of generatedSchedule) {
            const detailsToCreate: Omit<IDetail, 'detailID'>[] = movementOrder.map((mId) => ({
              movementID: mId,
              totalSets: 3,
              totalReps: 10,
              goodRep: 0,
              badRep: 0,
              completedSets: 0,
            }));
            const newDetailIDs = await db.details.bulkAdd(detailsToCreate, { allKeys: true });
            const sessionToSave: Omit<ISession, 'sessionID'> = {
              day: scheduleItem.day,
              time: scheduleItem.slot,
              detailIDs: newDetailIDs as number[],
            };
            await db.sessions.add(sessionToSave);
          }
        }

        alert('Onboarding successful! You will be redirected to the homepage.');
        router.push('/');
      } catch (error) {
        console.error('Failed to save user data or schedule:', error);
        alert('There was an error submitting your information. Please try again.');
      }
    },
    [formData, availability, router]
  );

  const inputClasses =
    'w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 text-black';

  return (
    <main className="flex-1 bg-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="bg-white p-8 shadow-xl rounded-xl mb-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-black">Onboarding</h1>
              <p className="text-xl text-black mt-2">
                Tell us about yourself for us to give you the best experience on our application.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {[
                { id: 'name', label: 'Name', placeholder: 'Input Text...', type: 'text' },
                { id: 'age', label: 'Age', placeholder: 'e.g., 25', inputMode: 'numeric' },
                { id: 'height', label: 'Height (cm)', placeholder: 'e.g., 170', inputMode: 'numeric' },
                { id: 'bodyWeight', label: 'Body Weight (kg)', placeholder: 'e.g., 75', inputMode: 'numeric' },
              ].map((field) => (
                <div key={field.id}>
                  <label htmlFor={field.id} className="block mb-2 font-medium text-gray-700">
                    {field.id.charAt(0).toUpperCase() + field.id.slice(1).replace(/([A-Z])/g, ' $1')}
                  </label>
                  <input
                    suppressHydrationWarning
                    type={field.type || 'text'}
                    id={field.id}
                    name={field.id}
                    placeholder={field.placeholder}
                    value={formData[field.id as keyof IFormData]}
                    onChange={handleChange}
                    className={inputClasses}
                    inputMode={field.inputMode as 'numeric' | undefined}
                  />
                </div>
              ))}
            </div>
            <div className="space-y-6">
              <div>
                <label htmlFor="gender" className="block mb-2 font-medium text-gray-700">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`${inputClasses} ${formData.gender === '' ? 'text-gray-400' : 'text-black'}`}
                >
                  <option value="" disabled>
                    Select your gender...
                  </option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label htmlFor="healthConditions" className="block mb-2 font-medium text-gray-700">
                  Do you have any health conditions or physical difficulties that might affect your exercise?
                </label>
                <select
                  id="healthConditions"
                  name="healthConditions"
                  value={formData.healthConditions}
                  onChange={handleChange}
                  className={`${inputClasses} ${formData.healthConditions === '' ? 'text-gray-400' : 'text-black'}`}
                >
                  <option value="" disabled>
                    Select an option...
                  </option>
                  <option value="None">None</option>
                  <option value="Asthma">Asthma</option>
                  <option value="Heart Condition">Heart Condition</option>
                  <option value="High Blood Pressure">High Blood Pressure</option>
                  <option value="Back/Knee Pain">Back/Knee Pain</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <AvailabilitySelector availability={availability} onToggle={handleAvailabilityToggle} />

          <div className="mt-8 flex justify-center">
            <button
              type="submit"
              className="py-3 px-6 border border-transparent rounded-md shadow-sm text-white font-semibold bg-[#487FB2] hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center gap-2"
            >
              Submit & Finish Onboarding →
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
