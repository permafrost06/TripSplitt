import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { getDb, initDb, cleanupExpiredTrips } from './db';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use(
    '*',
    cors({
        origin: '*',
        allowMethods: ['GET', 'POST', 'OPTIONS'],
        allowHeaders: ['Content-Type'],
    })
);

// Share expiration: 30 days
const SHARE_EXPIRATION_MS = 30 * 24 * 60 * 60 * 1000;

// Generate short ID for sharing
function generateShareId(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// POST /api/share - Create a shared trip
app.post('/api/share', async (c) => {
    try {
        const body = await c.req.json();
        const { trip } = body;

        if (!trip || !trip.id) {
            return c.json({ error: 'Invalid trip data' }, 400);
        }

        const db = getDb();
        const shareId = generateShareId();
        const now = Date.now();
        const expiresAt = now + SHARE_EXPIRATION_MS;

        await db.execute({
            sql: 'INSERT INTO shared_trips (id, trip_data, created_at, expires_at) VALUES (?, ?, ?, ?)',
            args: [shareId, JSON.stringify(trip), now, expiresAt],
        });

        return c.json({ id: shareId, expiresAt });
    } catch (error) {
        console.error('Error sharing trip:', error);
        return c.json({ error: 'Failed to share trip' }, 500);
    }
});

// GET /api/share/:id - Fetch a shared trip
app.get('/api/share/:id', async (c) => {
    try {
        const shareId = c.req.param('id');
        const db = getDb();

        const result = await db.execute({
            sql: 'SELECT trip_data, expires_at FROM shared_trips WHERE id = ?',
            args: [shareId],
        });

        if (result.rows.length === 0) {
            return c.json({ error: 'Share not found' }, 404);
        }

        const row = result.rows[0];
        const expiresAt = row.expires_at as number;

        if (Date.now() > expiresAt) {
            // Cleanup expired share
            await db.execute({
                sql: 'DELETE FROM shared_trips WHERE id = ?',
                args: [shareId],
            });
            return c.json({ error: 'This share link has expired' }, 404);
        }

        const trip = JSON.parse(row.trip_data as string);
        return c.json({ trip });
    } catch (error) {
        console.error('Error fetching shared trip:', error);
        return c.json({ error: 'Failed to fetch shared trip' }, 500);
    }
});

// Health check
app.get('/api/health', (c) => {
    return c.json({ status: 'ok', timestamp: Date.now() });
});

// Initialize and start server
async function main() {
    try {
        await initDb();

        // Cleanup expired trips periodically (every hour)
        setInterval(
            async () => {
                const cleaned = await cleanupExpiredTrips();
                if (cleaned > 0) {
                    console.log(`Cleaned up ${cleaned} expired trips`);
                }
            },
            60 * 60 * 1000
        );

        const port = parseInt(process.env.PORT || '3001', 10);
        console.log(`Server starting on port ${port}...`);

        serve({
            fetch: app.fetch,
            port,
        });

        console.log(`Server running at http://localhost:${port}`);
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

main();
