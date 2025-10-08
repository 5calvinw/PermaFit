'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// ✨ 1. IMPORT IDetail along with the others
import { db, IUser, ISession, IDetail } from '../lib/db'; 

// --- (No changes to interfaces or other functions) ---
interface IFormData {
  name: string;
  age: string; 
  height: string;
  bodyWeight: string;
  gender: string;
  healthConditions: string;
  mobility: string;
  exerciseCapabilities: string;
  exerciseFrequency: string;
}
type TimeSlot = string;
type Day = string;
type Availability = Record<Day, Record<TimeSlot, boolean>>;
const DAYS_OF_WEEK: Day[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIME_SLOTS: TimeSlot[] = Array.from({ length: 17 }, (_, i) => `${String(i + 5).padStart(2, '0')}:00`);
const createInitialAvailability = (): Availability => {
  const initialState: Availability = {};
  DAYS_OF_WEEK.forEach(day => {
    initialState[day] = {};
    TIME_SLOTS.forEach(time => {
      initialState[day][time] = false;
    });
  });
  return initialState;
};
function pickSchedule(availability: any, sessions: number): {day: string, slot: string}[] {
    const dayOrder: Record<string, number> = {
      Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4,
      Friday: 5, Saturday: 6, Sunday: 7,
    };

    let potentialSlots: {dayIndex: number; day: string; time: string}[] = [];
    Object.entries(availability).forEach(([day, slots]: any) => {
        slots.forEach((time: string) => {
            potentialSlots.push({ dayIndex: dayOrder[day], day, time });
        });
    });
    potentialSlots.sort((a, b) => a.dayIndex - b.dayIndex);

    if (sessions <= 0 || potentialSlots.length === 0) {
        return [];
    }
    
    const selectedSchedule: {day: string, slot: string}[] = [];
    const gap = 7.0 / sessions; 
    let lastPickedDayIndex = -Infinity;

    while (selectedSchedule.length < sessions && potentialSlots.length > 0) {
        const nextSlot = potentialSlots.find(
            slot => slot.dayIndex >= lastPickedDayIndex + gap
        );

        if (nextSlot) {
            selectedSchedule.push({ day: nextSlot.day, slot: nextSlot.time });
            lastPickedDayIndex = nextSlot.dayIndex;
            potentialSlots = potentialSlots.filter(slot => slot !== nextSlot);
        } else {
            break; 
        }
    }
    
    if (selectedSchedule.length < sessions) {
        const pickedDays = selectedSchedule.map(s => s.day);
        const remainingSlots = potentialSlots.filter(s => !pickedDays.includes(s.day));
        const needed = sessions - selectedSchedule.length;
        
        for (let i = 0; i < needed && i < remainingSlots.length; i++) {
            selectedSchedule.push({ day: remainingSlots[i].day, slot: remainingSlots[i].time });
        }
    }

    return selectedSchedule;
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
    mobility: '',
    exerciseCapabilities: '',
    exerciseFrequency: '',
  });

  const [availability, setAvailability] = useState<Availability>(createInitialAvailability());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };
  
  const handleAvailabilityToggle = (day: Day, time: TimeSlot) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [time]: !prev[day][time],
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newUser: IUser = {
      name: formData.name,
      age: parseInt(formData.age, 10) || 0,
      height: parseFloat(formData.height) || 0,
      weight: parseFloat(formData.bodyWeight) || 0,
      health: formData.healthConditions,
      preferredFrequency: formData.exerciseFrequency,
    };
    
    try {
      const id = await db.users.add(newUser);
      console.log(`User data saved to database with ID: ${id}`);

      const sessionsPerWeek = parseInt(formData.exerciseFrequency, 10) || 0;

      const formattedAvailability: Record<string, string[]> = {};
      Object.entries(availability).forEach(([day, times]) => {
        const selectedTimes = Object.entries(times)
          .filter(([, isSelected]) => isSelected)
          .map(([time]) => time);
          
        if (selectedTimes.length > 0) {
          formattedAvailability[day] = selectedTimes;
        }
      });
      
      if (sessionsPerWeek > 0 && Object.keys(formattedAvailability).length > 0) {
        const generatedSchedule = pickSchedule(formattedAvailability, sessionsPerWeek);

        // ✨ 2. NEW LOGIC TO CREATE DETAILS AND SESSIONS
        // Define the preset workout plan
        const movementOrder = [1, 3, 2, 5, 4];
        
        // Loop through each session returned by pickSchedule
        for (const scheduleItem of generatedSchedule) {
          // A. Create the 5 detail records for this session
          const detailsToCreate: Omit<IDetail, 'detailID'>[] = movementOrder.map(mId => ({
            movementID: mId,
            totalSets: 3,
            totalReps: 10,
            goodRep: 0,
            badRep: 0,
            completedSets: 0,
          }));
          
          // B. Save the details and get their new primary keys (IDs)
          const newDetailIDs = await db.details.bulkAdd(detailsToCreate, { allKeys: true });

          // C. Create the session object with the new detail IDs
          const sessionToSave: Omit<ISession, 'sessionID'> = {
            day: scheduleItem.day,
            time: scheduleItem.slot,
            detailIDs: newDetailIDs as number[], // Link to the details we just created
          };

          // D. Save the new session to the database
          await db.sessions.add(sessionToSave);
        }
        console.log(`Generated and saved ${generatedSchedule.length} new sessions with custom details.`);
      }
      
      alert('Onboarding successful! You will be redirected to the homepage.');
      router.push('/');

    } catch (error) {
      console.error("Failed to save user data or schedule:", error);
      alert('There was an error submitting your information. Please try again.');
    }
  };

  const inputClasses = "w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400";

  return (
    // --- (The JSX for the form remains completely unchanged) ---
    <main className="flex-1 bg-slate-100 p-8">
      <form onSubmit={handleSubmit}>
          {/* --- Box 1: Onboarding Questions --- */}
          <div className="bg-white p-8 shadow-xl rounded-xl mb-8">
              <div className="mb-8">
                  <h1 className="text-2xl font-bold text-black">Onboarding</h1>
                  <p className="text-xl text-black mt-2">Tell us about yourself for us to give you the best experience on our application.</p>
              </div>
          
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                  <label htmlFor="name" className="block mb-2 font-medium text-gray-700">Name</label>
                  <input type="text" id="name" name="name" placeholder="Input Text..." value={formData.name} onChange={handleChange} className={inputClasses}/>
              </div>
              <div>
                  <label htmlFor="age" className="block mb-2 font-medium text-gray-700">Age</label>
                  <input type="number" id="age" name="age" placeholder="Input Number..." value={formData.age} onChange={handleChange} className={inputClasses}/>
              </div>
              <div>
                  <label htmlFor="height" className="block mb-2 font-medium text-gray-700">Height (cm)</label>
                  <input type="number" id="height" name="height" placeholder="Input Number..." value={formData.height} onChange={handleChange} className={inputClasses}/>
              </div>
              <div>
                  <label htmlFor="bodyWeight" className="block mb-2 font-medium text-gray-700">Body Weight (kg)</label>
                  <input type="number" id="bodyWeight" name="bodyWeight" placeholder="Input Number..." value={formData.bodyWeight} onChange={handleChange} className={inputClasses}/>
              </div>
              </div>
              <div className="space-y-6">
              <div>
                  <label htmlFor="gender" className="block mb-2 font-medium text-gray-700">Gender</label>
                  <select id="gender" name="gender" value={formData.gender} onChange={handleChange} className={`${inputClasses} ${formData.gender === '' ? 'text-gray-400' : ''}`}>
                  <option value="" disabled>Input Dropdown...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  </select>
              </div>
              <div>
                  <label htmlFor="healthConditions" className="block mb-2 font-medium text-gray-700">Do you have any health conditions or physical difficulties that might affect your exercise?</label>
                  <input type="text" id="healthConditions" name="healthConditions" placeholder="Input Text..." value={formData.healthConditions} onChange={handleChange} className={inputClasses}/>
              </div>
              <div>
                  <label htmlFor="exerciseCapabilities" className="block mb-2 font-medium text-gray-700">How would you describe your exercise capabilities right now?</label>
                  <input type="text" id="exerciseCapabilities" name="exerciseCapabilities" placeholder="Input Text..." value={formData.exerciseCapabilities} onChange={handleChange} className={inputClasses}/>
              </div>
                <div>
                  <label htmlFor="exerciseFrequency" className="block mb-2 font-medium text-gray-700">How often would you want to exercise per week?</label>
                  <select id="exerciseFrequency" name="exerciseFrequency" value={formData.exerciseFrequency} onChange={handleChange} className={`${inputClasses} ${formData.exerciseFrequency === '' ? 'text-gray-400' : ''}`}>
                      <option value="" disabled>Input Dropdown 1-7 days...</option>
                      {[...Array(7)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1} day{i > 0 && 's'}</option>
                      ))}
                  </select>
              </div>
              </div>
          </div>

          {/* --- Box 2: Availability & Submission --- */}
          <div className="bg-white p-8 shadow-xl rounded-xl">
              <h2 className="text-xl font-bold text-gray-800">Availability</h2>
              <p className="text-gray-600 mt-1 mb-4">Tell us about your availability so that we can give you the best possible schedule.</p>
              <div className="space-y-4">
                  {DAYS_OF_WEEK.map(day => (
                      <div key={day} className="grid grid-cols-[100px_1fr] items-center gap-4">
                          <span className="font-semibold text-gray-700 text-right">{day}</span>
                          <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-12 lg:grid-cols-17 gap-2">
                              {TIME_SLOTS.map(time => (
                                  <button 
                                      type="button" 
                                      key={time} 
                                      onClick={() => handleAvailabilityToggle(day, time)} 
                                      className={`w-full text-center py-2 text-sm rounded-md transition-colors ${
                                          availability[day][time]
                                          ? 'bg-green-500 text-white hover:bg-green-600' 
                                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                      }`}
                                  >
                                      
                                      {time}
                                  </button>
                              ))}
                          </div>
                      </div>
                  ))}
              </div>
              <button 
                  type="submit" 
                  className="mt-8 w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white font-semibold bg-[#487FB2] hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center gap-2"
                  >
                  Submit & Finish Onboarding →
              </button>
          </div>
      </form>
    </main>
  );
}