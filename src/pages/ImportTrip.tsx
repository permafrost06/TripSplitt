import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, X, Loader2, AlertTriangle } from 'lucide-react';
import {
    decompressTripData,
    base64UrlToArrayBuffer,
    createTripFromSharedData,
} from '../lib/compression';
import * as db from '../db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Trip } from '../types';
import { formatCurrency } from '../lib/utils';

export function ImportTrip() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [tripData, setTripData] = useState<Trip | null>(null);
    const [importing, setImporting] = useState(false);
    const [duplicateWarning, setDuplicateWarning] = useState(false);
    const [baseTripName, setBaseTripName] = useState('');

    useEffect(() => {
        const dataParam = searchParams.get('d');
        if (!dataParam) {
            setError('No trip data found in URL');
            setLoading(false);
            return;
        }

        const decodeTrip = async () => {
            try {
                const compressed = base64UrlToArrayBuffer(dataParam);
                const decompressed = await decompressTripData(compressed);
                const trip = createTripFromSharedData(decompressed);

                setBaseTripName(trip.name.split(' (Shared)')[0]);
                const exists = await db.tripExistsWithName(baseTripName);
                setDuplicateWarning(exists);

                setTripData(trip);
            } catch (err) {
                console.error('Failed to decode trip:', err);
                setError('Failed to decode trip data');
            } finally {
                setLoading(false);
            }
        };

        decodeTrip();
    }, [searchParams, baseTripName]);

    const handleImport = async () => {
        if (!tripData) return;

        setImporting(true);
        try {
            await db.saveTrip(tripData);
            navigate(`/trip/${tripData.id}`);
        } catch (err) {
            console.error('Failed to save trip:', err);
            setError('Failed to save trip');
            setImporting(false);
        }
    };

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

    if (loading || !tripData) {
        return (
            <div className="space-y-12">
                <div>
                    <h1 className="text-3xl font-serif text-stone-900 dark:text-stone-100">
                        Import Trip
                    </h1>
                    <p className="text-stone-500 dark:text-stone-400 mt-2">
                        Decoding shared trip...
                    </p>
                </div>

                <Card>
                    <CardContent className="py-12">
                        <div className="text-center">
                            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-4 text-stone-400" />
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

    return (
        <div className="space-y-12">
            <div>
                <h1 className="text-3xl font-serif text-stone-900 dark:text-stone-100">
                    Import Trip
                </h1>
                <p className="text-stone-500 dark:text-stone-400 mt-2">
                    Review the trip data before importing
                </p>
            </div>

            {duplicateWarning && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                            Trip with this name already exists
                        </p>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                            A trip named "{baseTripName}" or "{baseTripName} (Shared)" already
                            exists in your trips. Importing will create a duplicate.
                        </p>
                    </div>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>{tripData.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                            <span className="text-stone-500 dark:text-stone-400">Currency</span>
                            <p className="font-medium text-stone-900 dark:text-stone-100">
                                {tripData.currency}
                            </p>
                        </div>
                        <div>
                            <span className="text-stone-500 dark:text-stone-400">People</span>
                            <p className="font-medium text-stone-900 dark:text-stone-100">
                                {tripData.people.length}
                            </p>
                        </div>
                        <div>
                            <span className="text-stone-500 dark:text-stone-400">Expenses</span>
                            <p className="font-medium text-stone-900 dark:text-stone-100">
                                {tripData.expenses.length}
                            </p>
                        </div>
                    </div>

                    {tripData.people.length > 0 && (
                        <div>
                            <span className="text-sm text-stone-500 dark:text-stone-400">
                                People
                            </span>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {tripData.people.map((person) => (
                                    <span
                                        key={person.name}
                                        className="px-2 py-1 bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm rounded"
                                    >
                                        {person.name}
                                        {person.count > 1 && (
                                            <span className="opacity-50"> ×{person.count}</span>
                                        )}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {tripData.expenses.length > 0 && (
                        <div>
                            <span className="text-sm text-stone-500 dark:text-stone-400">
                                Expenses
                            </span>
                            <div className="space-y-1 mt-1">
                                {tripData.expenses.map((expense) => (
                                    <div
                                        key={expense.id}
                                        className="flex items-center justify-between text-sm"
                                    >
                                        <span className="text-stone-700 dark:text-stone-300">
                                            {expense.description}
                                        </span>
                                        <span className="text-stone-900 dark:text-stone-100">
                                            {formatCurrency(expense.amount, tripData.currency)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex gap-3">
                <Button
                    onClick={handleImport}
                    disabled={importing}
                    className="flex-1 cursor-pointer"
                >
                    {importing ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Importing...
                        </>
                    ) : (
                        <>
                            <Check className="w-4 h-4 mr-2" />
                            Import Trip
                        </>
                    )}
                </Button>
                <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={importing}
                    className="cursor-pointer"
                >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                </Button>
            </div>
        </div>
    );
}
