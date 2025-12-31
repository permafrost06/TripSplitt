import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, MapPin, Users, Receipt } from 'lucide-react';
import { useTrips } from '../hooks/useTrips';

export function Home() {
    const { trips, loading, createTrip, deleteTrip } = useTrips();
    const [newTripName, setNewTripName] = useState('');
    const [showForm, setShowForm] = useState(false);

    const handleCreateTrip = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTripName.trim()) return;

        await createTrip(newTripName.trim());
        setNewTripName('');
        setShowForm(false);
    };

    const handleDeleteTrip = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete "${name}"?`)) {
            await deleteTrip(id);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Your Trips</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    New Trip
                </button>
            </div>

            {showForm && (
                <form
                    onSubmit={handleCreateTrip}
                    className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
                >
                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor="tripName"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Trip Name
                            </label>
                            <input
                                id="tripName"
                                type="text"
                                value={newTripName}
                                onChange={(e) => setNewTripName(e.target.value)}
                                placeholder="e.g., Beach Weekend, Europe Trip"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                autoFocus
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={!newTripName.trim()}
                                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Create Trip
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    setNewTripName('');
                                }}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {trips.length === 0 ? (
                <div className="text-center py-12">
                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-lg font-medium text-gray-900 mb-2">No trips yet</h2>
                    <p className="text-gray-500">
                        Create your first trip to start splitting expenses
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {trips.map((trip) => (
                        <div
                            key={trip.id}
                            className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:border-blue-300 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <Link to={`/trip/${trip.id}`} className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold text-gray-900 truncate hover:text-blue-600">
                                        {trip.name}
                                    </h3>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Users className="w-4 h-4" />
                                            {trip.people.length} people
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Receipt className="w-4 h-4" />
                                            {trip.expenses.length} expenses
                                        </span>
                                    </div>
                                </Link>
                                <button
                                    onClick={() => handleDeleteTrip(trip.id, trip.name)}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                    aria-label="Delete trip"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
