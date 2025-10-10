'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '../lib/db';
import Sidebar from '../../components/sidebar';
import WorkoutSessionCard from '../../components/scheduleBox';

interface Session {
  sessionID?: number;
  day: string;
  time: string;
  detailIDs: number[];
  calculatedDate: Date;
  isCompleted?: boolean;
}

function getThisWeeksDateForDay(targetDay: string): Date {
  const dayOffsetFromMonday: { [key: string]: number } = {
    MONDAY: 0,
    TUESDAY: 1,
    WEDNESDAY: 2,
    THURSDAY: 3,
    FRIDAY: 4,
    SATURDAY: 5,
    SUNDAY: 6,
  };

  const upperCaseTargetDay = targetDay?.toUpperCase();
  if (!upperCaseTargetDay || dayOffsetFromMonday[upperCaseTargetDay] === undefined) {
    return new Date();
  }

  const offset = dayOffsetFromMonday[upperCaseTargetDay];
  const today = new Date();
  const todayDayIndex = today.getDay();

  const mondayOfThisWeek = new Date(today);
  mondayOfThisWeek.setHours(0, 0, 0, 0);

  const daysToSubtract = todayDayIndex === 0 ? 6 : todayDayIndex - 1;
  mondayOfThisWeek.setDate(today.getDate() - daysToSubtract);

  const targetDate = new Date(mondayOfThisWeek);
  targetDate.setDate(mondayOfThisWeek.getDate() + offset);

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
  const [isLoading, setIsLoading] = useState(true);

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
      } finally {
        setIsLoading(false);
      }
    };
    fetchSessions();
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-slate-100 p-8 ml-72">
        <div className="flex flex-col bg-white p-8 shadow-xl rounded-xl gap-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold text-black">This Week's Schedule</div>
            <Link href="/schedules/edit">
              <span className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                Edit Schedule
              </span>
            </Link>
          </div>
          <p className="text-gray-600 mb-4">
            Here are your scheduled workouts. You can only start a session on its scheduled day.
          </p>

          {isLoading ? (
            <p className="text-center py-10 text-gray-500">Loading your schedule...</p>
          ) : sessions.length > 0 ? (
            sessions.map((session, index) => {
              const { day, dateNum, month } = formatDateParts(session.calculatedDate);
              const status = getSessionStatus(session);
              const isClickable = status === 'TODAY';

              const cardContent = (
                <WorkoutSessionCard
                  day={day}
                  date={dateNum}
                  month={month}
                  title={`Workout Session`}
                  status={status}
                  scheduledTime={session.time}
                />
              );

              if (isClickable) {
                return (
                  <Link
                    key={session.sessionID}
                    href={`/sessions`}
                    className="block hover:bg-gray-50 rounded-xl transition-colors duration-200 cursor-pointer"
                  >
                    {cardContent}
                  </Link>
                );
              } else {
                return (
                  <div
                    key={session.sessionID}
                    className="block rounded-xl"
                    style={{ opacity: status === 'COMPLETED' || status === 'MISSED' ? 0.6 : 1 }}
                  >
                    {cardContent}
                  </div>
                );
              }
            })
          ) : (
            <div className="text-center py-10 text-gray-500 border-2 border-dashed rounded-lg">
              <p className="text-xl font-semibold">Your Schedule is Empty</p>
              <p className="mt-2">Complete your onboarding to create a personalized workout plan!</p>
              <Link
                href="/onboarding"
                className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
              >
                Go to Onboarding
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
