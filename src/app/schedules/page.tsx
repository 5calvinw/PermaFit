'use client'

import { useState, useEffect } from 'react';
import { db } from '../lib/db'; 
import Sidebar from "../../components/sidebar";
import ScheduleBox from "../../components/scheduleBox";


interface Session {
  sessionID: number;
  day: string; 
  time: string;
  detailID: number[];
}


interface Session {
  sessionID: number;
  day: string; 
  time: string;
  detailID: number[];
  calculatedDate: Date; // Add this property to store the calculated date
}

// --- (No changes to getThisWeeksDateForDay or formatDateParts functions) ---
function getThisWeeksDateForDay(targetDay: string): Date {
  const dayMapping: { [key: string]: number } = {
    'SUNDAY': 0, 'MONDAY': 1, 'TUESDAY': 2, 'WEDNESDAY': 3,
    'THURSDAY': 4, 'FRIDAY': 5, 'SATURDAY': 6,
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
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  if (targetDate < startOfToday) {
    targetDate.setDate(targetDate.getDate() + 7);
  }
  return targetDate;
}

const formatDateParts = (date: Date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return { day: 'ERR', dateNum: 0, month: 'ERR' };
  }
  return {
    day: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
    dateNum: date.getDate(),
    month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
  };
};

export default function SchedulesPage() {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        if (db) {
          const allSessions = await db.sessions.toArray();

          // ✨ 2. CALCULATE DATES FIRST, THEN SORT
          // Map each session to a new object that includes its calculated date
          const sessionsWithDates = allSessions.map(session => ({
            ...session,
            calculatedDate: getThisWeeksDateForDay(session.day)
          }));

          // Now, sort the new array based on the actual calendar date
          sessionsWithDates.sort((a, b) => a.calculatedDate.getTime() - b.calculatedDate.getTime());

          setSessions(sessionsWithDates);
        }
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
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
            // ✨ 3. USE THE PRE-CALCULATED DATE
            // The date is already on the session object, no need to calculate it again.
            const { day, dateNum, month } = formatDateParts(session.calculatedDate);

            return (
              <ScheduleBox
                key={session.sessionID}
                day={day}
                date={dateNum}
                month={month}
                title={`Workout Session ${index + 1}`}
                status={'UPCOMING'}
                scheduledTime={session.time}
              />
            );
          })}
        </div>
      </main>
    </div>
  );
}