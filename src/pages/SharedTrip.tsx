import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Check, AlertCircle } from 'lucide-react';
import { fetchSharedTrip } from '../api/share';
import { importTrip } from '../db';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Status = 'loading' | 'success' | 'error';

export function SharedTrip() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [status, setStatus] = useState<Status>('loading');
    const [error, setError] = useState<string | null>(null);
    const [tripName, setTripName] = useState<string | null>(null);

    useEffect(() => {
        async function loadSharedTrip() {
            if (!id) {
                setStatus('error');
                setError('Invalid share link');
                return;
            }

            try {
                const trip = await fetchSharedTrip(id);
                setTripName(trip.name);

                await importTrip(trip);

                setStatus('success');

                setTimeout(() => {
                    navigate(`/trip/${trip.id}`);
                }, 2000);
            } catch (err) {
                setStatus('error');
                setError(err instanceof Error ? err.message : 'Failed to load shared trip');
            }
        }

        loadSharedTrip();
    }, [id, navigate]);

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-md mx-auto">
                <CardContent className="py-12 text-center">
                    {status === 'loading' && (
                        <>
                            <div className="w-5 h-5 mx-auto border border-stone-300 dark:border-stone-700 border-t-stone-900 dark:border-t-stone-100 animate-spin mb-4" />
                            <h2 className="text-xl font-serif text-stone-900 dark:text-stone-100">
                                Loading shared trip...
                            </h2>
                            <p className="text-stone-500 dark:text-stone-400 mt-2">
                                Fetching trip data
                            </p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <Check className="w-8 h-8 mx-auto text-emerald-600 dark:text-emerald-400 mb-4" />
                            <h2 className="text-xl font-serif text-stone-900 dark:text-stone-100">
                                Trip imported
                            </h2>
                            <p className="text-stone-500 dark:text-stone-400 mt-2">
                                "{tripName}" added to your trips
                            </p>
                            <p className="text-sm text-stone-400 dark:text-stone-500 mt-4">
                                Redirecting...
                            </p>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <AlertCircle className="w-8 h-8 mx-auto text-red-600 dark:text-red-400 mb-4" />
                            <h2 className="text-xl font-serif text-stone-900 dark:text-stone-100">
                                Failed to load trip
                            </h2>
                            <p className="text-stone-500 dark:text-stone-400 mt-2">{error}</p>
                            <Link to="/">
                                <Button className="mt-6">Go to Home</Button>
                            </Link>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
