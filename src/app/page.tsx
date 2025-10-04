'use client'; 

import { db, addUser } from '../app/lib/db';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";








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


   return (
    <div>
    <div>
      <li><Link href="/sessions">Home Page</Link></li>
      <li><Link href="/sessions">Sessions</Link></li>
      <li><Link href="/schedules">Schedules</Link></li>
          
    </div>
    <div>
      {schedule.map((item, i) => (
        <li key={i}>
          {item.day}: {item.slot}
        </li>
      ))}
    </div>
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