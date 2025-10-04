// src/lib/db.js
import Dexie from 'dexie';

// Create DB instance (top-level export)
export const db = typeof window !== 'undefined' ? new Dexie('MyAppDatabase') : null;

// Only configure Dexie if window exists
if (typeof window !== 'undefined' && db) {
  db.version(1).stores({
    users: '++userID,name,age,height,weight,health,preferredFrequency',
    sessions: '++sessionID,userID,date,time,detailID',
    progress: '++detailID,movementID,sessionDate,activity,totalSets,totalReps, goodRep, badRep',
    movement: '++movementID, movementName, movementDescription, movementImage, movementVideo'
  });
}

// Example helper function
export const addUser = async (user) => {
  if (!db) return; // avoid server-side errors
  return await db.users.add(user);
};
