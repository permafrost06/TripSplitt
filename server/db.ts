import { createClient, type Client } from '@libsql/client';

let client: Client | null = null;

export function getDb(): Client {
    if (!client) {
        const url = process.env.TURSO_DATABASE_URL;
        const authToken = process.env.TURSO_AUTH_TOKEN;

        if (!url) {
            throw new Error('TURSO_DATABASE_URL environment variable is required');
        }

        client = createClient({
            url,
            authToken,
        });
    }
    return client;
}

export async function initDb(): Promise<void> {
    const db = getDb();

    await db.execute(`
        CREATE TABLE IF NOT EXISTS shared_trips (
            id TEXT PRIMARY KEY,
            trip_data TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            expires_at INTEGER NOT NULL
        )
    `);

    // Create index for expiration cleanup
    await db.execute(`
        CREATE INDEX IF NOT EXISTS idx_expires_at ON shared_trips(expires_at)
    `);

    console.log('Database initialized');
}

export async function cleanupExpiredTrips(): Promise<number> {
    const db = getDb();
    const now = Date.now();

    const result = await db.execute({
        sql: 'DELETE FROM shared_trips WHERE expires_at < ?',
        args: [now],
    });

    return result.rowsAffected;
}
