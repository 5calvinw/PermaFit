'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '../lib/db';
import Sidebar from '../../components/sidebar';
import WorkoutSessionCard from '../../components/scheduleBox';

// ✨ THIS INTERFACE IS UPDATED TO MATCH YOUR DATABASE ✨
interface Session {
  sessionID?: number; // Changed to optional to allow 'undefined'
  day: string;
  time: string;
  detailIDs: number[]; // Corrected property name from detailID to detailIDs
  calculatedDate: Date;
  isCompleted?: boolean;
}

// ... (No other changes are needed in the rest of the file) ...

function getThisWeeksDateForDay(targetDay: string): Date {
  const dayMapping: { [key: string]: number } = {
    SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4, FRIDAY: 5, SATURDAY: 6,
  };
  if (!targetDay) return new Date();
  const targetDayIndex = dayMapping[targetDay.toUpperCase()];
  if (targetDayIndex === undefined) return new Date();
  const today = new Date();
  const todayDayIndex = today.getDay();
  const mondayOfThisWeek = new Date(today);
  mondayOfThisWeek.setDate(today.getDate() - todayDayIndex + (todayDayIndex === 0 ? -6 : 1));
  const targetDate = new Date(mondayOfThisWeek);
  targetDate.setDate(mondayOfThisWeek.getDate() + (targetDayIndex - dayMapping.MONDAY));
  targetDate.setHours(0, 0, 0, 0);
  return targetDate;
}

const formatDateParts = (date: Date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return { day: 'ERR', dateNum: 0, month: 'ERR' };
  }
  return {
    day: date.toLocaleString('en-US', { weekday: 'short' }).toUpperCase(),
    dateNum: date.getDate(),
    month: date.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
  };
};

const getSessionStatus = (session: Session): 'COMPLETED' | 'TODAY' | 'UPCOMING' | 'MISSED' => {
  if (session.isCompleted) return 'COMPLETED';
  const now = new Date();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const isToday = session.calculatedDate.toDateString() === now.toDateString();
  if (isToday) return 'TODAY';
  if (session.calculatedDate < startOfToday) return 'MISSED';
  return 'UPCOMING';
};

export default function SchedulesPage() {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        if (db) {
          const allSessions = await db.sessions.toArray();
          const sessionsWithDates = allSessions.map((session) => ({
            ...session,
            calculatedDate: getThisWeeksDateForDay(session.day),
          }));
          sessionsWithDates.sort((a, b) => a.calculatedDate.getTime() - b.calculatedDate.getTime());
          setSessions(sessionsWithDates);
        }
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
      }
    };
    fetchSessions();
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-slate-100 p-8 ml-72">
        <div className="flex flex-col bg-white p-8 shadow-xl rounded-xl gap-4">
          <div className="text-2xl font-bold text-black">This Week</div>
          <div className="text-xl text-black">See your exercise dates and times. Start, reschedule, or skip as needed.</div>
          {sessions.map((session, index) => {
            const { day, dateNum, month } = formatDateParts(session.calculatedDate);
            const status = getSessionStatus(session);
            return (
              <Link
                key={session.sessionID}
                href={`/workout`}
                className="block hover:bg-gray-50 rounded-xl transition-colors duration-200"
              >
                <WorkoutSessionCard
                  day={day}
                  date={dateNum}
                  month={month}
                  title={`Workout Session ${index + 1}`}
                  status={status}
                  scheduledTime={session.time}
                />
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}