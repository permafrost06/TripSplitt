import { useMemo, useState } from 'react';
import { ArrowRight, Share2, Check, Copy } from 'lucide-react';
import type { Trip } from '../types';
import { calculateSettlement } from '../lib/settlement';
import { shareTrip } from '../api/share';

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
            // Fallback for older browsers
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
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
                <p className="text-gray-500">Add some expenses to see the settlement</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Settlement</h3>
                <button
                    onClick={handleShare}
                    disabled={sharing}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                    <Share2 className="w-4 h-4" />
                    {sharing ? 'Sharing...' : 'Share Trip'}
                </button>
            </div>

            {shareUrl && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-green-800 mb-2">Share this link:</p>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={shareUrl}
                            readOnly
                            className="flex-1 px-3 py-2 text-sm bg-white border border-green-300 rounded-lg"
                        />
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                </div>
            )}

            {shareError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-800">{shareError}</p>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Total Cost</p>
                    <p className="text-2xl font-bold text-gray-900">
                        ${settlement.totalCost.toFixed(2)}
                    </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Expenses</p>
                    <p className="text-2xl font-bold text-gray-900">{trip.expenses.length}</p>
                </div>
            </div>

            <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Individual Costs</h4>
                <div className="space-y-2">
                    {settlement.individualCosts.map(({ person, cost }) => (
                        <div
                            key={person}
                            className="flex items-center justify-between py-2 border-b border-gray-100"
                        >
                            <span className="font-medium text-gray-900">{person}</span>
                            <span className="text-gray-600">${cost.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            </div>

            {settlement.transactions.length > 0 ? (
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Payments to Settle</h4>
                    <div className="space-y-3">
                        {settlement.transactions.map((transaction, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between bg-blue-50 rounded-lg p-4"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="font-medium text-gray-900">
                                        {transaction.from}
                                    </span>
                                    <ArrowRight className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium text-gray-900">
                                        {transaction.to}
                                    </span>
                                </div>
                                <span className="text-lg font-bold text-blue-600">
                                    ${transaction.amount.toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="bg-green-50 rounded-lg p-4 text-center">
                    <p className="text-green-700 font-medium">All settled! No payments needed.</p>
                </div>
            )}
        </div>
    );
}
