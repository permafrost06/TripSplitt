import { useState, useEffect, useCallback } from 'react';
import type { Trip, Person, Expense } from '../types';
import * as db from '../db';

export function useTrips() {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const loadTrips = useCallback(async () => {
        try {
            setLoading(true);
            const allTrips = await db.getAllTrips();
            setTrips(allTrips);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to load trips'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTrips();
    }, [loadTrips]);

    const createTrip = useCallback(
        async (name: string) => {
            const trip = await db.createTrip(name);
            await loadTrips();
            return trip;
        },
        [loadTrips]
    );

    const deleteTrip = useCallback(
        async (id: string) => {
            await db.deleteTrip(id);
            await loadTrips();
        },
        [loadTrips]
    );

    return {
        trips,
        loading,
        error,
        createTrip,
        deleteTrip,
        refresh: loadTrips,
    };
}

export function useTrip(id: string | undefined) {
    const [trip, setTrip] = useState<Trip | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const loadTrip = useCallback(async () => {
        if (!id) {
            setTrip(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const loadedTrip = await db.getTrip(id);
            setTrip(loadedTrip || null);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to load trip'));
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadTrip();
    }, [loadTrip]);

    const updateTrip = useCallback(
        async (updates: Partial<Trip>) => {
            if (!trip) return;
            const updated = { ...trip, ...updates };
            await db.saveTrip(updated);
            setTrip(updated);
        },
        [trip]
    );

    const addPerson = useCallback(
        async (person: Person) => {
            if (!trip) return;
            const updated = {
                ...trip,
                people: [...trip.people, person],
            };
            await db.saveTrip(updated);
            setTrip(updated);
        },
        [trip]
    );

    const updatePerson = useCallback(
        async (index: number, person: Person) => {
            if (!trip) return;
            const people = [...trip.people];
            const oldName = people[index].name;
            people[index] = person;

            // Update expenses if person name changed
            let expenses = trip.expenses;
            if (oldName !== person.name) {
                expenses = expenses.map((expense) => ({
                    ...expense,
                    paidBy: expense.paidBy === oldName ? person.name : expense.paidBy,
                    paidFor: expense.paidFor.map((p) => (p === oldName ? person.name : p)),
                    items: expense.items?.map((item) => ({
                        ...item,
                        paidFor: item.paidFor.map((p) => (p === oldName ? person.name : p)),
                    })),
                }));
            }

            const updated = { ...trip, people, expenses };
            await db.saveTrip(updated);
            setTrip(updated);
        },
        [trip]
    );

    const removePerson = useCallback(
        async (index: number) => {
            if (!trip) return;
            const personName = trip.people[index].name;
            const people = trip.people.filter((_, i) => i !== index);

            // Remove person from expenses
            const expenses = trip.expenses.map((expense) => ({
                ...expense,
                paidFor: expense.paidFor.filter((p) => p !== personName),
                items: expense.items?.map((item) => ({
                    ...item,
                    paidFor: item.paidFor.filter((p) => p !== personName),
                })),
            }));

            const updated = { ...trip, people, expenses };
            await db.saveTrip(updated);
            setTrip(updated);
        },
        [trip]
    );

    const addExpense = useCallback(
        async (expense: Expense) => {
            if (!trip) return;
            const updated = {
                ...trip,
                expenses: [...trip.expenses, expense],
            };
            await db.saveTrip(updated);
            setTrip(updated);
        },
        [trip]
    );

    const updateExpense = useCallback(
        async (id: string, expense: Expense) => {
            if (!trip) return;
            const expenses = trip.expenses.map((e) => (e.id === id ? expense : e));
            const updated = { ...trip, expenses };
            await db.saveTrip(updated);
            setTrip(updated);
        },
        [trip]
    );

    const removeExpense = useCallback(
        async (id: string) => {
            if (!trip) return;
            const expenses = trip.expenses.filter((e) => e.id !== id);
            const updated = { ...trip, expenses };
            await db.saveTrip(updated);
            setTrip(updated);
        },
        [trip]
    );

    return {
        trip,
        loading,
        error,
        updateTrip,
        addPerson,
        updatePerson,
        removePerson,
        addExpense,
        updateExpense,
        removeExpense,
        refresh: loadTrip,
    };
}
