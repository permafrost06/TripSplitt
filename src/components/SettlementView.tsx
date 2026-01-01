import { useMemo } from 'react';
import { ArrowRight, Receipt } from 'lucide-react';
import type { Trip } from '../types';
import { calculateSettlement } from '../lib/settlement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

interface SettlementViewProps {
    trip: Trip;
}

export function SettlementView({ trip }: SettlementViewProps) {
    const settlement = useMemo(
        () => calculateSettlement(trip.people, trip.expenses),
        [trip.people, trip.expenses]
    );

    if (trip.expenses.length === 0) {
        return (
            <Card className="py-12">
                <CardContent>
                    <div className="text-center">
                        <Receipt className="w-8 h-8 mx-auto text-stone-300 dark:text-stone-700 mb-4" />
                        <p className="text-stone-500 dark:text-stone-400">
                            Add expenses to see settlement
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-8">
            {/* Summary */}
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <p className="text-sm text-stone-500 dark:text-stone-400">Total Cost</p>
                    <p className="text-3xl font-serif text-stone-900 dark:text-stone-100 mt-1">
                        {formatCurrency(settlement.totalCost, trip.currency)}
                    </p>
                </div>
                <div>
                    <p className="text-sm text-stone-500 dark:text-stone-400">Expenses</p>
                    <p className="text-3xl font-serif text-stone-900 dark:text-stone-100 mt-1">
                        {trip.expenses.length}
                    </p>
                </div>
            </div>

            {/* Individual Costs */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-wide">
                        Individual Costs
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="divide-y divide-stone-100 dark:divide-stone-800">
                        {settlement.individualCosts.map(({ person, cost }) => (
                            <div key={person} className="flex items-center justify-between py-3">
                                <span className="text-stone-900 dark:text-stone-100">{person}</span>
                                <span className="font-medium text-stone-900 dark:text-stone-100">
                                    {formatCurrency(cost, trip.currency)}
                                </span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Transactions */}
            {settlement.transactions.length > 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm uppercase tracking-wide">Payments</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="divide-y divide-stone-100 dark:divide-stone-800">
                            {settlement.transactions.map((transaction, index) => (
                                <div key={index} className="flex items-center justify-between py-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-stone-900 dark:text-stone-100">
                                            {transaction.from}
                                        </span>
                                        <ArrowRight className="w-4 h-4 text-stone-400" />
                                        <span className="text-stone-900 dark:text-stone-100">
                                            {transaction.to}
                                        </span>
                                    </div>
                                    <span className="font-medium text-stone-900 dark:text-stone-100">
                                        {formatCurrency(transaction.amount, trip.currency)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="py-8">
                        <div className="text-center">
                            <p className="text-lg font-serif text-stone-900 dark:text-stone-100">
                                All settled
                            </p>
                            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                                No payments needed
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
