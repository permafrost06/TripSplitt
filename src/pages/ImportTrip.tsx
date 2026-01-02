import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check } from 'lucide-react';
import {
    decompressTripData,
    base64UrlToArrayBuffer,
    createTripFromSharedData,
} from '../lib/compression';
import * as db from '../db';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function ImportTrip() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [tripName, setTripName] = useState<string | null>(null);

    useEffect(() => {
        const dataParam = searchParams.get('d');
        if (!dataParam) {
            setError('No trip data found in URL');
            return;
        }

        const importTrip = async () => {
            try {
                const compressed = base64UrlToArrayBuffer(dataParam);
                const decompressed = await decompressTripData(compressed);
                const trip = createTripFromSharedData(decompressed);
                setTripName(trip.name);

                await db.saveTrip(trip);
                setSuccess(true);

                setTimeout(() => {
                    navigate(`/trip/${trip.id}`);
                }, 1500);
            } catch (err) {
                console.error('Failed to import trip:', err);
                setError('Failed to import trip data');
            }
        };

        importTrip();
    }, [searchParams, navigate]);

    const handleCancel = () => {
        navigate('/');
    };

    if (error) {
        return (
            <Card className="py-12">
                <CardContent>
                    <div className="text-center">
                        <h2 className="text-lg font-medium text-stone-900 dark:text-stone-100 mb-2">
                            Unable to Import
                        </h2>
                        <p className="text-stone-500 dark:text-stone-400 mb-6">{error}</p>
                        <Button onClick={handleCancel} variant="outline" className="cursor-pointer">
                            Go Home
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (success) {
        return (
            <Card className="py-12">
                <CardContent>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h2 className="text-lg font-medium text-stone-900 dark:text-stone-100 mb-2">
                            Trip Imported
                        </h2>
                        <p className="text-stone-500 dark:text-stone-400 mb-6">
                            {tripName} has been imported successfully
                        </p>
                        <p className="text-sm text-stone-400">Redirecting to trip...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-12">
            <div>
                <h1 className="text-3xl font-serif text-stone-900 dark:text-stone-100">
                    Import Trip
                </h1>
                <p className="text-stone-500 dark:text-stone-400 mt-2">
                    Decoding and importing shared trip...
                </p>
            </div>

            <Card>
                <CardContent className="py-12">
                    <div className="text-center">
                        <div className="w-5 h-5 border border-stone-300 dark:border-stone-700 border-t-stone-900 dark:border-t-stone-100 animate-spin mx-auto mb-4" />
                        <p className="text-stone-500 dark:text-stone-400">
                            Processing trip data...
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Button variant="outline" onClick={handleCancel} className="w-full cursor-pointer">
                Cancel
            </Button>
        </div>
    );
}
