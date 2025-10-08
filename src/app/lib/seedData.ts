// src/lib/seedData.ts

// This file separates the initial database data from the database schema definition.


export const dummyDetails = [
  // Detail ID: 1-4 for Monday
  { detailID: 1, movementID: 1, totalSets: 3, totalReps: 12, goodRep: 0, badRep: 0, completedSets: 0 },
  { detailID: 2, movementID: 2, totalSets: 3, totalReps: 15, goodRep: 0, badRep: 0, completedSets: 0 },
  { detailID: 3, movementID: 3, totalSets: 3, totalReps: 10, goodRep: 0, badRep: 0, completedSets: 0 },
  { detailID: 4, movementID: 4, totalSets: 3, totalReps: 12, goodRep: 0, badRep: 0, completedSets: 0 },
  // Detail ID: 5-8 for Wednesday
  { detailID: 5, movementID: 5, totalSets: 3, totalReps: 12, goodRep: 0, badRep: 0, completedSets: 0 },
  { detailID: 6, movementID: 1, totalSets: 4, totalReps: 10, goodRep: 0, badRep: 0, completedSets: 0 },
  { detailID: 7, movementID: 2, totalSets: 3, totalReps: 20, goodRep: 0, badRep: 0, completedSets: 0 },
  { detailID: 8, movementID: 3, totalSets: 3, totalReps: 15, goodRep: 0, badRep: 0, completedSets: 0 },
  // Detail ID: 9-12 for Friday
  { detailID: 9, movementID: 4, totalSets: 5, totalReps: 8, goodRep: 0, badRep: 0, completedSets: 0 },
  { detailID: 10, movementID: 5, totalSets: 3, totalReps: 12, goodRep: 0, badRep: 0, completedSets: 0 },
  { detailID: 11, movementID: 1, totalSets: 3, totalReps: 12, goodRep: 0, badRep: 0, completedSets: 0 },
  { detailID: 12, movementID: 2, totalSets: 4, totalReps: 12, goodRep: 0, badRep: 0, completedSets: 0 },
];

export const initialMovements = [
  {
    movementID: 1,
    movementName: 'Bicep Curl',
    configKey: 'bicep_curl',
    movementDescription: 'A classic exercise that isolates the biceps muscles, performed by flexing the elbow.',
    movementImage: 'bicep_curl.jpg',
    movementVideo: '/',
  },
  {
    movementID: 2,
    movementName: 'Squat',
    configKey: 'squat',
    movementDescription: 'A fundamental compound exercise that targets the thighs, hips, and buttocks.',
    movementImage: 'squat.jpg',
    movementVideo: '/',
  },
  {
    movementID: 3,
    movementName: 'Wall Pushup',
    configKey: 'wall_push_up',
    movementDescription:
      'A beginner-friendly variation of the pushup that strengthens the chest, shoulders, and triceps.',
    movementImage: 'wall_push_up.jpg',
    movementVideo: '/',
  },
  {
    movementID: 4,
    movementName: 'Glute Bridges',
    configKey: 'glute_bridge',
    movementDescription: 'An exercise for targeting the glutes and hamstrings by lifting the hips off the floor.',
    movementImage: 'glute_bridge.jpg',
    movementVideo: '/',
  },
  {
    movementID: 5,
    movementName: 'Seated Leg Raise',
    configKey: 'seated_leg_raise',
    movementDescription: 'An exercise that targets the lower abdominal muscles and hip flexors from a seated position.',
    movementImage: 'seated_leg_raise.png',
    movementVideo: '/',
  },
];
