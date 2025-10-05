// src/lib/db.js
import Dexie from 'dexie';

// Create DB instance (top-level export)
export const db = typeof window !== 'undefined' ? new Dexie('MyAppDatabase') : null;

// Only configure Dexie if window exists
if (typeof window !== 'undefined' && db) {
  db.version(1).stores({
    users: '++userID,name,age,height,weight,health,preferredFrequency',
    sessions: '++sessionID,day,time,*detailID',
    details: '++detailID,movementID,totalSets,totalReps, goodRep, badRep',
    movement: '++movementID, movementName, configKey, movementDescription, movementImage, movementVideo'
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

      const dummyDetails = [
        {

    movementID: 1,
    totalSets: 3,
    reps: 12,
    goodRep: 0,
    badRep: 0
  },
  {

    movementID: 2,
    totalSets: 3,
    totalReps: 15,
    goodRep: 0,
    badRep: 0

    },
  {
   
    movementID: 3,
    totalSets: 3,
    totalReps: 10,
    goodRep: 0,
    badRep: 0
    
  },
  {

    movementID: 4,
    totalSets: 3,
    totalReps: 12,
    goodRep: 0,
    badRep: 0
    
  },
      ]

    const initialMovements = [
    {
      movementName: 'Bicep Curl',
      configKey: 'bicep_curl',
      movementDescription: 'bicep curl blalbalblablaballba',
      movementImage: '/',
      movementVideo: '/'
    },
    {
      movementName: 'Squat',
      configKey: 'squat',
      movementDescription: 'Squat blalbalblablaballba',
      movementImage: '/',
      movementVideo: '/'
    },
    {
      movementName: 'Wall Pushup',
      configKey: 'wall_push_up',
      movementDescription: 'Wall Pushup blalbalblablaballba',
      movementImage: '/',
      movementVideo: '/'
    },
    {
      movementName: 'Glute Bridges',
      configKey: 'glute_bridge',
      movementDescription: 'Glute Bridges blalbalblablaballba',
      movementImage: '/',
      movementVideo: '/'
    },
    {
      movementName: 'Seated Leg Raise',
      configKey: 'seated_leg_raise',
      movementDescription: 'Seated Leg Raise blalbalblablaballba',
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
      await db.details.bulkAdd(dummyDetails);
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
