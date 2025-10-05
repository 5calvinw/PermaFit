// src/lib/db.js
import Dexie from 'dexie';

// Create DB instance (top-level export)
export const db = typeof window !== 'undefined' ? new Dexie('MyAppDatabase') : null;

// Only configure Dexie if window exists
if (typeof window !== 'undefined' && db) {
  db.version(1).stores({
    users: '++userID,name,age,height,weight,health,preferredFrequency',
    sessions: '++sessionID,day,time,*detailID',
    details: '++detailID,movementID,sessionDate,activity,totalSets,totalReps, goodRep, badRep',
    movement: '++movementID, movementName, movementDescription, movementImage, movementVideo'
  });

    const mySession = [
      {
       day: 'Monday',
       time: '09:00',
       detailIDs: [1,2,3,4]
       },
       {
       day: 'Wednesday',
       time: '13:00',
       detailIDs: [5,6,7,8]
       },
       {
       day: 'Friday',
       time: '18:00',
       detailIDs: [9,10,1,12]
       },  
      ];



    const initialMovements = [
    {
      movementName: 'Bicep Curl',
      movementDescription: 'bicep curl blalbalblablaballba',
      movementImage: '/',
      movementVideo: '/'
    },
    {
      movementName: 'Squat',
      movementDescription: 'Squat blalbalblablaballba',
      movementImage: '/',
      movementVideo: '/'
    },
    {
      movementName: 'Wall Pushup',
      movementDescription: 'Wall Pushup blalbalblablaballba',
      movementImage: '/',
      movementVideo: '/'
    },
    {
      movementName: 'movement 4',
      movementDescription: 'movement 4 blalbalblablaballba',
      movementImage: '/',
      movementVideo: '/'
    },
    {
      movementName: 'movement 5',
      movementDescription: 'movement 5 blalbalblablaballba',
      movementImage: '/',
      movementVideo: '/'
    },
  ]

  db.on('populate', async () => {
    try {
      console.log('Database is being populated for the first time. Seeding movements...');
      // Use bulkAdd() to efficiently add all initial movements.
      await db.movement.bulkAdd(initialMovements);
      await db.sessions.bulkAdd(mySession);
      console.log('Initial movements have been successfully added.');
    } catch (error) {
      console.error(`Failed to populate database: ${error}`);
    }
  });

}




  

// Example helper function
export const addUser = async (user) => {
  if (!db) return; // avoid server-side errors
  return await db.users.add(user);
};
