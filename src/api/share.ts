import type { Trip } from '../types';

// API base URL - in production, this would point to your backend
const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function shareTrip(trip: Trip): Promise<string> {
    const response = await fetch(`${API_BASE}/share`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trip }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to share trip' }));
        throw new Error(error.message || 'Failed to share trip');
    }

    const data = await response.json();
    const shareId = data.id;

    // Generate the share URL
    const baseUrl = window.location.origin;
    return `${baseUrl}/share/${shareId}`;
}

export async function fetchSharedTrip(shareId: string): Promise<Trip> {
    const response = await fetch(`${API_BASE}/share/${shareId}`);

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('This share link has expired or does not exist');
        }
        const error = await response
            .json()
            .catch(() => ({ message: 'Failed to fetch shared trip' }));
        throw new Error(error.message || 'Failed to fetch shared trip');
    }

    const data = await response.json();
    return data.trip;
}
