'use client';

import { db, ISession, IDetail, IMovement } from '../app/lib/db';
import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/sidebar';
import { IoIosCheckmarkCircle } from 'react-icons/io';
import { FaSquareXmark, FaClockRotateLeft, FaTrophy } from 'react-icons/fa6';

interface UpcomingMovement {
  detailID: number;
  name: string;
  day: string;
  time: string;
  calculatedDate: Date;
  isCompleted: boolean;
}

export default function Home() {
  const router = useRouter();

  const [stats, setStats] = useState({
    completedThisWeek: 0,
    missedThisWeek: 0,
    repsDone: 0,
    topWorkout: 'N/A',
  });

  const [upcomingMovements, setUpcomingMovements] = useState<UpcomingMovement[]>([]);

  useEffect(() => {
    const checkUserAndFetchStats = async () => {
      try {
        const userCount = await db.users.count();
        if (userCount === 0) {
          console.log('No user found, redirecting to onboarding.');
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

          const parseSessionDate = (session: ISession): Date => {
            const dayMapping: { [key: string]: number } = {
              MONDAY: 1,
              TUESDAY: 2,
              WEDNESDAY: 3,
              THURSDAY: 4,
              FRIDAY: 5,
              SATURDAY: 6,
              SUNDAY: 0,
            };
            const { startOfWeek } = getWeekBoundaries();
            const sessionDate = new Date(startOfWeek);
            const targetDayIndex = dayMapping[session.day.toUpperCase()];
            const startDayIndex = startOfWeek.getDay();
            sessionDate.setDate(startOfWeek.getDate() + (targetDayIndex - (startDayIndex === 0 ? 7 : startDayIndex)));
            const [hours, minutes] = session.time.split(':').map(Number);
            sessionDate.setHours(hours, minutes, 0, 0);

            if (sessionDate < now) {
              sessionDate.setDate(sessionDate.getDate() + 7);
            }
            return sessionDate;
          };

          const { startOfWeek, endOfWeek } = getWeekBoundaries();
          const sessionsThisWeek = allSessions.filter((s) => {
            const sessionDate = parseSessionDate(s);
            const originalDate = new Date(sessionDate);
            originalDate.setDate(sessionDate.getDate() - 7);
            return (
              (sessionDate >= startOfWeek && sessionDate <= endOfWeek) ||
              (originalDate >= startOfWeek && originalDate <= endOfWeek)
            );
          });
          sessionsThisWeek.forEach((session) => {
            const detailsForSession = allDetails.filter((d) => session.detailIDs.includes(d.detailID!));
            const isCompleted =
              detailsForSession.length > 0 && detailsForSession.every((d) => d.completedSets >= d.totalSets);
            if (isCompleted) {
              newStats.completedThisWeek++;
            } else if (parseSessionDate(session) < new Date()) {
              newStats.missedThisWeek++;
            }
          });
          newStats.repsDone = allDetails.reduce((sum, detail) => sum + detail.goodRep, 0);
          if (allDetails.length > 0 && allMovements.length > 0) {
            const movementCounts: { [key: number]: number } = {};
            allDetails.forEach((detail) => {
              if (detail.goodRep > 0) {
                movementCounts[detail.movementID] = (movementCounts[detail.movementID] || 0) + detail.goodRep;
              }
            });
            if (Object.keys(movementCounts).length > 0) {
              const topMovementId = Object.keys(movementCounts).reduce((a, b) =>
                movementCounts[parseInt(a)] > movementCounts[parseInt(b)] ? a : b
              );
              const topMovement = allMovements.find((m) => m.movementID === parseInt(topMovementId));
              if (topMovement) newStats.topWorkout = topMovement.movementName;
            }
          }
          setStats(newStats);

          const allPotentialMovements = allDetails
            .map((detail) => {
              const parentSession = allSessions.find((s) => s.detailIDs.includes(detail.detailID!));
              const movementInfo = allMovements.find((m) => m.movementID === detail.movementID);
              if (!parentSession || !movementInfo) return null;
              return {
                detailID: detail.detailID!,
                name: movementInfo.movementName,
                day: parentSession.day,
                time: parentSession.time,
                calculatedDate: parseSessionDate(parentSession),
                isCompleted: detail.completedSets >= detail.totalSets,
              };
            })
            .filter((item): item is NonNullable<typeof item> => item !== null);

          const nextFiveMovements = allPotentialMovements
            .filter((move) => !move.isCompleted && move.calculatedDate > now)
            .sort((a, b) => a.calculatedDate.getTime() - b.calculatedDate.getTime())
            .slice(0, 5);

          setUpcomingMovements(nextFiveMovements);
        }
      } catch (error) {
        console.error('Failed to check for user or fetch stats:', error);
      }
    };
    checkUserAndFetchStats();
  }, [router]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-slate-100 p-6 md:p-8 ml-72">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col bg-white p-6 shadow-lg rounded-xl gap-4">
            <h1 className="text-3xl font-bold text-black">Overview</h1>
            <p className="text-lg text-slate-600">A look at your workout progress this week.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              <StatBox
                icon={<IoIosCheckmarkCircle />}
                value={`${stats.completedThisWeek} Workout${stats.completedThisWeek !== 1 ? 's' : ''}`}
                label="Completed This Week"
                color="green"
              />
              <StatBox
                icon={<FaSquareXmark />}
                value={`${stats.missedThisWeek} Workout${stats.missedThisWeek !== 1 ? 's' : ''}`}
                label="Missed This Week"
                color="red"
              />
              <StatBox
                icon={<FaClockRotateLeft />}
                value={`${stats.repsDone} Reps`}
                label="Total Reps Done"
                color="blue"
              />
              <StatBox icon={<FaTrophy />} value={stats.topWorkout} label="Top Workout" color="yellow" />
            </div>
          </div>

          <div className="flex flex-col bg-white p-6 shadow-lg rounded-xl gap-4">
            <h2 className="text-3xl font-bold text-black">Workout Plan</h2>
            <p className="text-lg text-slate-600">Your next 5 upcoming exercises.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {upcomingMovements.length > 0 ? (
                upcomingMovements.map((move) => (
                  <MoveBox key={move.detailID} name={move.name} day={move.day} time={move.time} />
                ))
              ) : (
                <p className="text-gray-500 col-span-full text-center py-4">No upcoming workouts scheduled.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatBox({
  icon,
  value,
  label,
  color,
}: {
  icon: ReactNode;
  value: string | number;
  label: string;
  color: 'green' | 'red' | 'blue' | 'yellow';
}) {
  const colorClasses = {
    green: 'bg-[#E6F8E7] text-green-600',
    red: 'bg-[#FBE9E9] text-red-600',
    blue: 'bg-[#E3F2FD] text-blue-600',
    yellow: 'bg-[#FFF9C4] text-yellow-700',
  };

  return (
    <div className={`flex flex-col justify-start p-4 rounded-xl min-h-[140px] ${colorClasses[color]}`}>
      <div className="text-4xl mb-4">{icon}</div>
      <div className="text-3xl font-bold text-black truncate" title={String(value)}>
        {value}
      </div>
      <div className="text-md text-slate-700 mt-1">{label}</div>
    </div>
  );
}

// ✨ UPDATED COMPONENT: Resized to match the StatBox component from the Overview section.
function MoveBox({ name, day, time }: { name: string; day: string; time: string }) {
  return (
    // Applied same min-height, padding, and rounding as StatBox
    <div className="border border-slate-300 rounded-xl min-h-[140px] flex flex-col justify-between p-4 transition hover:shadow-md hover:border-slate-400">
      {/* Increased font size to better fill the larger card */}
      <div className="text-[#487FB2] font-bold text-2xl">{name}</div>
      <div>
        {/* Reverted font size to default */}
        <div className="text-slate-600 font-medium capitalize">{day.toLowerCase()}</div>
        <div className="text-slate-500">{time}</div>
      </div>
    </div>
  );
}
