'use client'; 

import { db, addUser } from '../app/lib/db';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "../components/sidebar"
import { IoIosCheckmarkCircle } from "react-icons/io";
import { FaSquareXmark } from "react-icons/fa6";
import { FaClockRotateLeft } from "react-icons/fa6";
import { FaTrophy } from "react-icons/fa6";




export default function Home() {

   

  const [availability, setAvailability] = useState({
  Tuesday:   ["09:00"],
  Saturday:    ["09:00"],
  Sunday:    ["09:00"]
  });



  let preferredFrequency = 3;
  const schedule = pickSchedule(availability, preferredFrequency);

    useEffect(() => {
    async function addUser() {
      await db.users.add({ name: 'Test', age: 0 });
      console.log("User added!");
    }
    addUser();
  }, []);

  let number1 = 1;
  let number2 = 2;
  let number3 = 100;
  let bestworkout = 'Bicep Curl';

   return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex flex-col flex-1 bg-slate-100 p-8 ml-72 gap-6">
        <div className="flex flex-col bg-white p-8 shadow-lg rounded-xl gap-4">
          <div className="text-3xl font-bold text-black">Overview</div>
          <div className="text-xl text-black">Take a look at your all-time workout progress statistics.</div>

           <div className="flex justify-between" >
            <div className="flex bg-[#C5FFC8] p-8 w-[22.5%] h-[150px] rounded-xl items-center">
                <div className="flex flex-col items-center gap-4">
                      <div className="flex items-center gap-6">
                        <div className="text-5xl text-green-600">
                           <IoIosCheckmarkCircle />
                        </div>
                        <div className='text-4xl font-bold text-black'>
                            {number1} Workout
                          </div>
                      </div>
                      <div className='flex text-2xl'>
                        Completed This Week
                      </div>
                </div>
            </div>
            <div className="flex bg-[#FFC5C5] p-8 w-[22.5%] h-[150px] rounded-xl">
                <div className="flex flex-col  gap-4">
                      <div className="flex items-center gap-6">
                        <div className="text-5xl text-red-600">
                           <FaSquareXmark />
                        </div>
                        <div className='text-4xl font-bold text-black'>
                            {number2} Workouts
                          </div>
                      </div>
                      <div className='flex text-2xl'>
                        Missed This Week
                      </div>
                </div>
            </div>
            <div className="flex bg-[#C8DBED] p-8 w-[22.5%] h-[150px] rounded-xl">
                <div className="flex flex-col  gap-4">
                      <div className="flex items-center gap-6">
                        <div className="text-4xl text-blue-600">
                           <FaClockRotateLeft />
                        </div>
                        <div className='text-4xl font-bold text-black'>
                            {number3} Minutes
                          </div>
                      </div>
                      <div className='flex text-2xl'>
                        Spent Working Out
                      </div>
                </div>
            </div>
            <div className="flex bg-[#FFF0C5] p-8 w-[22.5%] h-[150px] rounded-xl">
                <div className="flex flex-col  gap-4">
                      <div className="flex items-center gap-6">
                        <div className="text-5xl text-yellow-600">
                           <FaTrophy />
                        </div>
                        <div className='text-4xl font-bold text-black'>
                            {bestworkout}
                          </div>
                      </div>
                      <div className='flex text-2xl'>
                        Top Work-Out of All Time
                      </div>
                </div>
            </div>
          </div>
          </div>
          <div className="flex flex-col bg-white p-8 shadow-lg rounded-xl gap-4">
          <div className="text-3xl font-bold text-black">Workout Plan</div>
          <div className="text-xl text-black">Keep track of all your necessary workout movements.</div>
          <div className="flex justify-between">
            <MoveBox 
            name={'Bicep Curl'}
            day={'Monday'}
            time={'09:00-10:00'}
            />
            <MoveBox 
            name={'Bicep Curl'}
            day={'Monday'}
            time={'09:00-10:00'}
            />
            <MoveBox 
            name={'Bicep Curl'}
            day={'Monday'}
            time={'09:00-10:00'}
            />
            <MoveBox 
            name={'Bicep Curl'}
            day={'Monday'}
            time={'09:00-10:00'}
            />
            <MoveBox 
            name={'Bicep Curl'}
            day={'Monday'}
            time={'09:00-10:00'}
            />
          </div>


          </div>
          </main>
          </div>
  );
}


function pickSchedule(availability: any, sessions: number){

    const dayOrder: Record<string, number> = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
};


  const selectedSchedule: any[] = [];

  const availableSlots: {dayIndex : number; day: string; time: string }[] = [];

  Object.entries(availability).forEach(([day, slots]: any) => {  // this function is to fill an array availableSlots with a standardized
      slots.forEach((time: string) => {                   // [dayIndex (1-7), day, time]
      availableSlots.push({ dayIndex: dayOrder[day], day, time});
    });
  });


  availableSlots.sort((a, b) => a.dayIndex - b.dayIndex) // sort it from monday to sunday

  if(availableSlots.length === 0) return selectedSchedule;

  // now to space it out we need to count the maximum gap
  const gap = Math.floor(7/sessions);

  let curr = 1; // set curr to monday to start iterating from here

  for(let i = 0; i < sessions; i++){ // iterate number of frequency times
    const next = availableSlots.find(slot => slot.dayIndex >= curr); // set next to the next available slot starting from monday

    if(next){
      selectedSchedule.push({day: next.day, slot: next.time}); //push the the timeslot into the selected schedule
      curr = next.dayIndex + gap; //add the curr with the gap 
    }
  }
 

  return selectedSchedule;
}

function goToSessions() {
    router.push("/sessions");
  }

  function goToSchedules() {
    router.push("/schedules");
  }


  function MoveBox({ name, day, time }: { name: string; day: string, time: string }){
    return(
      <div className="border border-slate-300 rounded-xl  w-80 h-[150px] flex flex-col p-4 gap-2">
                <div className="text-[#487FB2] font-bold text-2xl py-2">
                  {name}
                </div>
                <div className="opacity-70">
                  {day}
                </div>
                <div className='opacity-70'>
                  {time}
                </div>
            </div>
    )
  }