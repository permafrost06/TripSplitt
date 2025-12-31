import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Check, AlertCircle } from 'lucide-react';
import { fetchSharedTrip } from '../api/share';
import { importTrip } from '../db';

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

                // Import to local storage
                await importTrip(trip);

                setStatus('success');

                // Redirect after a short delay
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
            <div className="text-center max-w-md mx-auto p-6">
                {status === 'loading' && (
                    <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
                        <h2 className="text-lg font-medium text-gray-900">
                            Loading shared trip...
                        </h2>
                        <p className="text-gray-500 mt-2">
                            Please wait while we fetch the trip data
                        </p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check className="w-6 h-6 text-green-600" />
                        </div>
                        <h2 className="text-lg font-medium text-gray-900">Trip imported!</h2>
                        <p className="text-gray-500 mt-2">
                            "{tripName}" has been added to your trips. Redirecting...
                        </p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <h2 className="text-lg font-medium text-gray-900">Failed to load trip</h2>
                        <p className="text-gray-500 mt-2">{error}</p>
                        <Link
                            to="/"
                            className="inline-block mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            Go to Home
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
