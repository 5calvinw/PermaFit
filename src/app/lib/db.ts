// src/lib/db.ts
import Dexie, { Table } from 'dexie';
// ✨ We only need to import the movements for seeding now
import { initialMovements } from './seedData';

// ... (All your interfaces remain the same)
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
  isCompleted?: boolean;
}
export interface IDetail {
  detailID?: number;
  movementID: number;
  totalSets: number;
  totalReps: number;
  goodRep: number;
  badRep: number;
  completedSets: number;
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
    this.version(2).stores({
      users: '++userID, name',
      sessions: '++sessionID, [day+isCompleted], day, *detailIDs',
      details: '++detailID, movementID',
      movement: '++movementID, configKey',
    });

    this.on('populate', () => this.populateDatabase());
  }

  async populateDatabase() {
    try {
      console.log('Database is being populated for the first time. Seeding movements...');
      await this.movement.bulkPut(initialMovements);
      console.log('✅ Initial movements have been successfully added.');
    } catch (error) {
      console.error(`Failed to populate database: ${error}`);
    }
  }
}

export const db = new MyAppDatabase();

export const addUser = async (user: IUser) => {
  return await db.users.add(user);
};
