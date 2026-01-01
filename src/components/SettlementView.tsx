import { useMemo, useState } from 'react';
import { ArrowRight, Check, Copy, Receipt } from 'lucide-react';
import type { Trip } from '../types';
import { calculateSettlement } from '../lib/settlement';
import { shareTrip } from '../api/share';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface SettlementViewProps {
    trip: Trip;
}

export function SettlementView({ trip }: SettlementViewProps) {
    const [sharing, setSharing] = useState(false);
    const [shareUrl, setShareUrl] = useState<string | null>(null);
    const [shareError, setShareError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const settlement = useMemo(
        () => calculateSettlement(trip.people, trip.expenses),
        [trip.people, trip.expenses]
    );

    const handleShare = async () => {
        setSharing(true);
        setShareError(null);

        try {
            const url = await shareTrip(trip);
            setShareUrl(url);
        } catch (error) {
            setShareError(error instanceof Error ? error.message : 'Failed to share trip');
        } finally {
            setSharing(false);
        }
    };

    const handleCopy = async () => {
        if (!shareUrl) return;

        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            const textArea = document.createElement('textarea');
            textArea.value = shareUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

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
            {/* Share */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Share Trip</span>
                        <Button
                            onClick={handleShare}
                            disabled={sharing}
                            size="sm"
                            variant="outline"
                        >
                            {sharing ? 'Sharing...' : 'Generate Link'}
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {shareUrl && (
                        <div className="flex items-center gap-2">
                            <Input
                                type="text"
                                value={shareUrl}
                                readOnly
                                className="flex-1 text-sm"
                            />
                            <Button
                                onClick={handleCopy}
                                size="sm"
                                variant="default"
                                className="gap-1.5"
                            >
                                {copied ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
                                {copied ? 'Copied' : 'Copy'}
                            </Button>
                        </div>
                    )}
                    {shareError && (
                        <p className="text-sm text-red-600 dark:text-red-400">{shareError}</p>
                    )}
                </CardContent>
            </Card>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <p className="text-sm text-stone-500 dark:text-stone-400">Total Cost</p>
                    <p className="text-3xl font-serif text-stone-900 dark:text-stone-100 mt-1">
                        ${settlement.totalCost.toFixed(2)}
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
                                    ${cost.toFixed(2)}
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
                                        ${transaction.amount.toFixed(2)}
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
