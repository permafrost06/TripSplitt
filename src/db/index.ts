import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Trip } from '../types';

interface TripSplittDB extends DBSchema {
    trips: {
        key: string;
        value: Trip;
        indexes: { 'by-updated': number };
    };
}

const DB_NAME = 'tripsplitt';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<TripSplittDB>> | null = null;

function getDB(): Promise<IDBPDatabase<TripSplittDB>> {
    if (!dbPromise) {
        dbPromise = openDB<TripSplittDB>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                const tripStore = db.createObjectStore('trips', { keyPath: 'id' });
                tripStore.createIndex('by-updated', 'updatedAt');
            },
        });
    }
    return dbPromise;
}

export async function getAllTrips(): Promise<Trip[]> {
    const db = await getDB();
    const trips = await db.getAllFromIndex('trips', 'by-updated');
    return trips.reverse();
}

export async function getTripByName(name: string): Promise<Trip | undefined> {
    const db = await getDB();
    const trips = await db.getAll('trips');
    return trips.find((trip) => trip.name === name);
}

export async function tripExistsWithName(name: string): Promise<boolean> {
    const trips = await getAllTrips();
    return trips.some(
        (trip) =>
            trip.name === name ||
            trip.name === `${name} (Shared)` ||
            trip.name.startsWith(`${name} (`)
    );
}

export async function getTrip(id: string): Promise<Trip | undefined> {
    const db = await getDB();
    return db.get('trips', id);
}

export async function saveTrip(trip: Trip): Promise<void> {
    const db = await getDB();
    await db.put('trips', {
        ...trip,
        updatedAt: Date.now(),
    });
}

export async function deleteTrip(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('trips', id);
}

export async function createTrip(name: string, currency: 'USD' | 'BDT' = 'BDT'): Promise<Trip> {
    const trip: Trip = {
        id: crypto.randomUUID(),
        name,
        currency,
        people: [],
        expenses: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };
    await saveTrip(trip);
    return trip;
}

export async function importTrip(trip: Trip): Promise<void> {
    // Import a trip from external source (like shared URL)
    // This will overwrite if the trip already exists
    await saveTrip({
        ...trip,
        updatedAt: Date.now(),
    });
}
