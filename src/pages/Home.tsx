import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MapPin, Users, Receipt, ArrowRight } from 'lucide-react';
import { useTrips } from '../hooks/useTrips';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Currency } from '@/types';
import { formatCurrency } from '@/lib/utils';

export function Home() {
    const { trips, loading, createTrip } = useTrips();
    const [newTripName, setNewTripName] = useState('');
    const [newTripCurrency, setNewTripCurrency] = useState<Currency>('BDT');
    const [showForm, setShowForm] = useState(false);

    const handleCreateTrip = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTripName.trim()) return;

        await createTrip(newTripName.trim(), newTripCurrency);
        setNewTripName('');
        setNewTripCurrency('BDT');
        setShowForm(false);
    };

    const handleCancel = () => {
        setShowForm(false);
        setNewTripName('');
        setNewTripCurrency('BDT');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-5 h-5 border border-stone-300 dark:border-stone-700 border-t-stone-900 dark:border-t-stone-100 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-12">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-serif text-stone-900 dark:text-stone-100">
                        Trips
                    </h1>
                    <p className="text-stone-500 dark:text-stone-400 mt-2">
                        Track and split expenses
                    </p>
                </div>
                <Button onClick={() => setShowForm(true)} variant="default">
                    <Plus className="w-4 h-4" />
                    New Trip
                </Button>
            </div>

            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>New Trip</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateTrip} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="tripName">Trip Name</Label>
                                <Input
                                    id="tripName"
                                    type="text"
                                    value={newTripName}
                                    onChange={(e) => setNewTripName(e.target.value)}
                                    placeholder="Trip name"
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="currency">Currency</Label>
                                <Select
                                    value={newTripCurrency}
                                    onValueChange={(value: Currency) => setNewTripCurrency(value)}
                                >
                                    <SelectTrigger id="currency">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USD">USD ($)</SelectItem>
                                        <SelectItem value="BDT">BDT (৳)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    type="submit"
                                    disabled={!newTripName.trim()}
                                    className="flex-1"
                                >
                                    Create
                                </Button>
                                <Button type="button" variant="outline" onClick={handleCancel}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {trips.length === 0 ? (
                <Card className="py-16">
                    <CardContent>
                        <div className="text-center">
                            <MapPin className="w-8 h-8 mx-auto text-stone-300 dark:text-stone-700 mb-4" />
                            <p className="text-stone-500 dark:text-stone-400 mb-6">No trips yet</p>
                            <Button onClick={() => setShowForm(true)} variant="outline">
                                Create your first trip
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-0">
                    {trips.map((trip) => (
                        <Link key={trip.id} to={`/trip/${trip.id}`}>
                            <article className="group border-b border-stone-200 dark:border-stone-800 py-6 hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-colors -mx-6 px-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-lg font-medium text-stone-900 dark:text-stone-100 truncate group-hover:text-stone-700 dark:group-hover:text-stone-300 transition-colors">
                                            {trip.name}
                                        </h2>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-stone-500 dark:text-stone-400">
                                            <span className="flex items-center gap-1.5">
                                                <Users className="w-4 h-4" />
                                                {trip.people.length}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Receipt className="w-4 h-4" />
                                                {trip.expenses.length}
                                            </span>
                                            <Badge variant="secondary" className="text-xs">
                                                {formatCurrency(0, trip.currency)
                                                    .replace('0.00', '')
                                                    .trim()}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Badge variant="secondary">
                                            {trip.expenses.length} expenses
                                        </Badge>
                                        <ArrowRight className="w-5 h-5 text-stone-300 group-hover:text-stone-500 transition-colors" />
                                    </div>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
