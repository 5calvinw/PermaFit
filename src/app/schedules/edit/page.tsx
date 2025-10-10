'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../../lib/db';
import AvailabilitySelector, { Availability, Day, DAYS_OF_WEEK } from '../../../components/AvailabilitySelector'; 

const TIME_BLOCKS = [
  { label: 'Morning', time: '09:00' },
  { label: 'Afternoon', time: '14:00' },
  { label: 'Evening', time: '18:00' },
];

type FormattedAvailability = Record<Day, string[]>;
type ScheduleSlot = { day: string; slot: string };

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

const createInitialAvailability = (): Availability => {
  const initialState = {} as Availability;
  for (const day of DAYS_OF_WEEK) {
    initialState[day] = { Morning: false, Afternoon: false, Evening: false };
  }
  return initialState;
};

export default function EditSchedulePage() {
  const router = useRouter();
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const firstUser = await db.users.toCollection().first();
      if (firstUser && firstUser.userID) {
        setUserId(firstUser.userID);
        setAvailability(firstUser.availability || createInitialAvailability());
      } else {
        console.error('No user found in the database.');
        router.push('/onboarding');
      }
      setIsLoading(false);
    };
    fetchUserData();
  }, [router]);

  const handleAvailabilityToggle = useCallback((day: Day, blockLabel: 'Morning' | 'Afternoon' | 'Evening') => {
    setAvailability((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        [day]: { ...prev[day], [blockLabel]: !prev[day][blockLabel] },
      };
    });
  }, []);

  const handleSaveChanges = async () => {
    if (!availability || !userId) return;

    setIsLoading(true);

    try {
      await db.transaction('rw', db.users, db.sessions, db.details, async () => {
        await db.users.update(userId, { availability });

        const oldSessions = await db.sessions.toArray();
        if (oldSessions.length > 0) {
          const detailIdsToDelete = oldSessions.flatMap((session) => session.detailIDs);
          await db.details.bulkDelete(detailIdsToDelete);
          await db.sessions.clear();
        }

        const sessionsPerWeek = Object.values(availability).filter((daySlots) =>
          Object.values(daySlots).some((isSelected) => isSelected)
        ).length;

        if (sessionsPerWeek > 0) {
          const formattedAvailability: FormattedAvailability = {} as FormattedAvailability;
          const blockMap = Object.fromEntries(TIME_BLOCKS.map((b) => [b.label, b.time]));

          (Object.keys(availability) as Day[]).forEach((day) => {
            const selectedTimes = (Object.keys(availability[day]) as (keyof (typeof availability)[Day])[])
              .filter((label) => availability[day][label])
              .map((label) => blockMap[label]);

            if (selectedTimes.length > 0) {
              formattedAvailability[day] = selectedTimes;
            }
          });

          const newSchedule = pickSchedule(formattedAvailability, sessionsPerWeek);
          const movementOrder = [1, 3, 2, 5, 4];

          for (const item of newSchedule) {
            const detailsToCreate = movementOrder.map((mId) => ({
              movementID: mId,
              totalSets: 3,
              totalReps: 10,
              goodRep: 0,
              badRep: 0,
              completedSets: 0,
            }));
            const newDetailIDs = await db.details.bulkAdd(detailsToCreate, { allKeys: true });
            await db.sessions.add({
              day: item.day,
              time: item.slot,
              detailIDs: newDetailIDs as number[],
              isCompleted: false,
            });
          }
        }
      });

      alert('Schedule updated successfully!');
      router.push('/');
    } catch (error) {
      console.error('Failed to update schedule:', error);
      alert('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  if (isLoading || !availability) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-xl text-gray-600">Loading your schedule...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 bg-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Edit Your Weekly Availability</h1>
        <p className="text-gray-600 mb-6">
          Select your preferred workout times below. Your schedule for the week will be updated accordingly.
        </p>

        <AvailabilitySelector availability={availability} onToggle={handleAvailabilityToggle} />

        <div className="mt-8 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveChanges}
            className="py-2 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </main>
  );
}
