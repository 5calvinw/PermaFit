// src/lib/db.ts
import Dexie, { Table } from 'dexie';
// ✨ 1. IMPORT SEED DATA from the new file
import { initialMovements, mySession, dummyDetails } from './seedData';

// Interfaces for data shapes
export interface IUser {
  userID?: number;
  name: string;
  age: number;
  height: number;
  weight: number;
  health: string;
  preferredFrequency: string;
}
export interface ISession {
  sessionID?: number;
  day: string;
  time: string;
  detailIDs: number[];
}

// MODIFIED: Added completedSets to the IDetail interface
export interface IDetail {
  detailID?: number;
  movementID: number;
  totalSets: number;
  totalReps: number;
  goodRep: number;
  badRep: number;
  completedSets: number; // ADDED THIS LINE
}

export interface IMovement {
  movementID?: number;
  movementName: string;
  configKey: string;
  movementDescription: string;
  movementImage: string;
  movementVideo: string;
}

export class MyAppDatabase extends Dexie {
  users!: Table<IUser, number>;
  sessions!: Table<ISession, number>;
  details!: Table<IDetail, number>;
  movement!: Table<IMovement, number>;

  constructor() {
    super('MyAppDatabase');
    // MODIFIED: Bumped the version number from 1 to 2
    // This correctly migrates the database for existing users to the new schema
    this.version(2).stores({
      // "++" defines an auto-incrementing primary key.
      users: '++userID, name',
      sessions: '++sessionID, day, *detailIDs', // "*" creates a multi-entry index for arrays.
      details: 'detailID, movementID', // Schema definition for keys/indexes is unchanged
      movement: 'movementID, configKey',
    });

    // The populate event only triggers once when the database is first created.
    this.on('populate', () => this.populateDatabase());
  }

  // ✨ 2. POPULATE METHOD now uses the imported data
  async populateDatabase() {
    try {
      console.log('Database is being populated for the first time. Seeding...');
      // Use bulkPut to respect the explicit primary keys in the seed data
      await this.movement.bulkPut(initialMovements);
      await this.sessions.bulkAdd(mySession); // bulkAdd is fine for auto-incrementing keys
      await this.details.bulkPut(dummyDetails);
      console.log('Initial data has been successfully added.');
    } catch (error) {
      console.error(`Failed to populate database: ${error}`);
    }
  }
}

// ✨ 3. SIMPLIFIED EXPORT
export const db = new MyAppDatabase();

// Helper function remains unchanged
export const addUser = async (user: IUser) => {
  return await db.users.add(user);
};
