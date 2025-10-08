'use client';

import { db, ISession, IDetail, IMovement } from '../app/lib/db';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/sidebar";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { FaSquareXmark } from "react-icons/fa6";
import { FaClockRotateLeft } from "react-icons/fa6";
import { FaTrophy } from "react-icons/fa6";

// ✨ 1. ADD a type for the upcoming session data
interface UpcomingSession {
  sessionID: number;
  name: string;
  day: string;
  time: string;
}

export default function Home() {
  const router = useRouter();

  const [stats, setStats] = useState({
    completedThisWeek: 0,
    missedThisWeek: 0,
    repsDone: 0,
    topWorkout: 'N/A',
  });
  
  // State now holds individual movements
  const [upcomingMovements, setUpcomingMovements] = useState<UpcomingMovement[]>([]);

  useEffect(() => {
    const checkUserAndFetchStats = async () => {
      try {
        const userCount = await db.users.count();
        if (userCount === 0) {
          console.log("No user found, redirecting to onboarding.");
          router.push('/onboarding');
        } else {
          const allSessions = await db.sessions.toArray();
          const allDetails = await db.details.toArray();
          const allMovements = await db.movement.toArray();
          const now = new Date();

          const newStats = {
            completedThisWeek: 0,
            missedThisWeek: 0,
            repsDone: 0,
            topWorkout: 'N/A',
          };

          const getWeekBoundaries = () => {
            const today = now.getDay();
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - today + (today === 0 ? -6 : 1));
            startOfWeek.setHours(0, 0, 0, 0);
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);
            return { startOfWeek, endOfWeek };
          };
          
          // ✨ 2. UPDATE date calculation to correctly loop to the next week
          const parseSessionDate = (session: ISession): Date => {
             const dayMapping: { [key: string]: number } = { 'MONDAY': 1, 'TUESDAY': 2, 'WEDNESDAY': 3, 'THURSDAY': 4, 'FRIDAY': 5, 'SATURDAY': 6, 'SUNDAY': 0 };
             const { startOfWeek } = getWeekBoundaries();
             const sessionDate = new Date(startOfWeek);
             const targetDayIndex = dayMapping[session.day.toUpperCase()];
             const startDayIndex = startOfWeek.getDay();
             sessionDate.setDate(startOfWeek.getDate() + (targetDayIndex - (startDayIndex === 0 ? 7 : startDayIndex)));
             const [hours, minutes] = session.time.split(':').map(Number);
             sessionDate.setHours(hours, minutes, 0, 0);

             // If the calculated date is in the past, move it to the next week
             if (sessionDate < now) {
                sessionDate.setDate(sessionDate.getDate() + 7);
             }
             return sessionDate;
          };

          // --- Stats Calculations (This logic remains the same) ---
          const { startOfWeek, endOfWeek } = getWeekBoundaries();
          const sessionsThisWeek = allSessions.filter(s => {
            const sessionDate = parseSessionDate(s);
            // We check a week before as well to catch sessions that have been pushed to the next week
            const originalDate = new Date(sessionDate);
            originalDate.setDate(sessionDate.getDate() - 7);
            return (sessionDate >= startOfWeek && sessionDate <= endOfWeek) || 
                   (originalDate >= startOfWeek && originalDate <= endOfWeek);
          });
          sessionsThisWeek.forEach(session => {
            const detailsForSession = allDetails.filter(d => session.detailIDs.includes(d.detailID!));
            const isCompleted = detailsForSession.length > 0 && detailsForSession.every(d => d.completedSets >= d.totalSets);
            if (isCompleted) {
              newStats.completedThisWeek++;
            } else if (parseSessionDate(session) < new Date()) {
              newStats.missedThisWeek++;
            }
          });
          newStats.repsDone = allDetails.reduce((sum, detail) => sum + detail.goodRep, 0);
          if (allDetails.length > 0 && allMovements.length > 0) {
            const movementCounts: { [key: number]: number } = {};
            allDetails.forEach(detail => {
              if (detail.goodRep > 0) {
                movementCounts[detail.movementID] = (movementCounts[detail.movementID] || 0) + detail.goodRep;
              }
            });
            if (Object.keys(movementCounts).length > 0) {
                const topMovementId = Object.keys(movementCounts).reduce((a, b) => movementCounts[parseInt(a)] > movementCounts[parseInt(b)] ? a : b);
                const topMovement = allMovements.find(m => m.movementID === parseInt(topMovementId));
                if (topMovement) newStats.topWorkout = topMovement.movementName;
            }
          }
          setStats(newStats);

          // ✨ 3. CREATE a flat list of all individual movements
          const allPotentialMovements = allDetails.map(detail => {
            const parentSession = allSessions.find(s => s.detailIDs.includes(detail.detailID!));
            const movementInfo = allMovements.find(m => m.movementID === detail.movementID);
            if (!parentSession || !movementInfo) return null;
            return {
              detailID: detail.detailID!,
              name: movementInfo.movementName,
              day: parentSession.day,
              time: parentSession.time,
              calculatedDate: parseSessionDate(parentSession),
              isCompleted: detail.completedSets >= detail.totalSets,
            };
          }).filter((item): item is NonNullable<typeof item> => item !== null);

          // ✨ 4. FILTER, SORT, and SLICE to get the next 5 upcoming movements
          const nextFiveMovements = allPotentialMovements
            .filter(move => !move.isCompleted && move.calculatedDate > now)
            .sort((a, b) => a.calculatedDate.getTime() - b.calculatedDate.getTime())
            .slice(0, 5);
          
          setUpcomingMovements(nextFiveMovements);
        }
      } catch (error) {
        console.error("Failed to check for user or fetch stats:", error);
      }
    };
    checkUserAndFetchStats();
  }, [router]);
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex flex-col flex-1 bg-slate-100 p-8 ml-72 gap-6">
        {/* --- Overview Section (This part is unchanged) --- */}
        <div className="flex flex-col bg-white p-8 shadow-lg rounded-xl gap-4">
          <div className="text-3xl font-bold text-black">Overview</div>
          <div className="text-xl text-black">Take a look at your all-time workout progress statistics.</div>
          <div className="flex flex-wrap justify-between">
            <div className="flex bg-[#C5FFC8] p-8 w-85 h-[150px] rounded-xl items-center">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-6">
                  <div className="text-5xl text-green-600">
                    <IoIosCheckmarkCircle />
                  </div>
                  <div className='text-4xl font-bold text-black'>
                    {stats.completedThisWeek} Workout{stats.completedThisWeek !== 1 && 's'}
                  </div>
                </div>
                <div className='flex text-2xl text-black'>
                  Completed This Week
                </div>
              </div>
            </div>
            <div className="flex bg-[#FFC5C5] p-8 w-85 h-[150px] rounded-xl">
              <div className="flex flex-col  gap-4">
                <div className="flex items-center gap-6">
                  <div className="text-5xl text-red-600">
                    <FaSquareXmark />
                  </div>
                  <div className='text-4xl font-bold text-black'>
                    {stats.missedThisWeek} Workout{stats.missedThisWeek !== 1 && 's'}
                  </div>
                </div>
                <div className='flex text-2xl text-black'>
                  Missed This Week
                </div>
              </div>
            </div>
            <div className="flex bg-[#C8DBED] p-8 w-85 h-[150px] rounded-xl">
              <div className="flex flex-col  gap-4">
                <div className="flex items-center gap-6">
                  <div className="text-4xl text-blue-600">
                    <FaClockRotateLeft />
                  </div>
                  <div className='text-4xl font-bold text-black'>
                    {stats.repsDone} Reps
                  </div>
                </div>
                <div className='flex text-2xl text-black'>
                  Reps Done
                </div>
              </div>
            </div>
            <div className="flex bg-[#FFF0C5] p-8 w-85 h-[150px] rounded-xl">
              <div className="flex flex-col  gap-4">
                <div className="flex items-center gap-6">
                  <div className="text-5xl text-yellow-600">
                    <FaTrophy />
                  </div>
                  <div className='text-4xl font-bold text-black'>
                    {stats.topWorkout}
                  </div>
                </div>
                <div className='flex text-2xl text-black'>
                  Top Work-Out of All Time
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col bg-white p-8 shadow-lg rounded-xl gap-4">
          <div className="text-3xl font-bold text-black">Workout Plan</div>
          <div className="text-xl text-black">Your next 5 upcoming exercises.</div>

          {/* ✨ 5. DYNAMICALLY RENDER MoveBox components from the new state */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {upcomingMovements.length > 0 ? (
              upcomingMovements.map(move => (
                <MoveBox 
                  key={move.detailID}
                  name={move.name}
                  day={move.day}
                  time={move.time}
                />
              ))
            ) : (
              <p className="text-gray-500 col-span-full">No upcoming workouts scheduled.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function MoveBox({ name, day, time }: { name: string; day: string, time: string }){
  return(
    <div className="border border-slate-300 rounded-xl h-[150px] flex flex-col p-4 gap-2">
      <div className="text-[#487FB2] font-bold text-2xl py-2">
        {name}
      </div>
      <div className="opacity-70 text-black">
        {day}
      </div>
      <div className='opacity-70 text-black'>
        {time}
      </div>
    </div>
  )
}