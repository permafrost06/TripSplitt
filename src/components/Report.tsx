import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Share2, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import type { Trip } from '../types';
import { calculateSettlement } from '../lib/settlement';
import { formatCurrency } from '../lib/utils';
import { Button } from '@/components/ui/button';

interface ReportProps {
    trip: Trip;
    onClose: () => void;
}

export function Report({ trip, onClose }: ReportProps) {
    const reportRef = useRef<HTMLDivElement>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const settlement = useMemo(
        () => calculateSettlement(trip.people, trip.expenses),
        [trip.people, trip.expenses]
    );

    const recentExpenses = useMemo(() => [...trip.expenses].reverse().slice(0, 5), [trip.expenses]);

    const handleDownload = () => {
        if (!imageUrl) {
            return;
        }

        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `${trip.name.replace(/\s+/g, '-')}-report.png`;
        link.click();
    };

    const generateReportImage = async () => {
        if (!reportRef.current) return;

        try {
            const reportElement = reportRef.current;

            const canvas = await html2canvas(reportElement, {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false,
                useCORS: true,
                scrollY: 0,
                width: 600,
                height: Math.max(800, reportElement.scrollHeight),
                windowWidth: 600,
                windowHeight: Math.max(800, reportElement.scrollHeight),
            });

            setImageUrl(canvas.toDataURL('image/png'));
            setGeneratedImage(canvas.toDataURL('image/png'));
        } catch (error) {
            console.error('Failed to generate report:', error);
        }
    };

    useEffect(() => {
        generateReportImage();
    }, []);

    const handleShare = async () => {
        if (!generatedImage) {
            generateReportImage();
        }

        if (generatedImage && typeof navigator !== 'undefined' && 'share' in navigator) {
            try {
                const response = await fetch(generatedImage);
                const blob = await response.blob();
                const file = new File([blob], `${trip.name}-report.png`, { type: 'image/png' });

                await navigator.share({
                    files: [file],
                    title: `${trip.name} Report`,
                    text: `Check out the trip report for ${trip.name}!`,
                });
            } catch (error) {
                console.error('Failed to share:', error);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 dark:bg-black/50 p-4 mb-0">
            <div className="relative w-full max-w-3xl bg-white dark:bg-stone-900 rounded-none shadow-xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-800 shrink-0">
                    <h2 className="text-lg font-serif text-stone-900 dark:text-stone-100">
                        Trip Report
                    </h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="flex-1 overflow-auto">
                    {!generatedImage ? (
                        <>
                            <div className="flex justify-center p-4 min-w-max relative">
                                <div className="inset-0 absolute bg-white z-5">
                                    <div className="absolute inset-0 z-10 bg-white/80 dark:bg-stone-950/80 flex items-center justify-center">
                                        <div className="w-8 h-8 border-2 border-stone-300 dark:border-stone-700 border-t-stone-900 dark:border-t-stone-100 animate-spin rounded-full" />
                                    </div>
                                </div>
                                <div
                                    ref={reportRef}
                                    className="bg-white dark:bg-stone-950 p-6 space-y-6"
                                    style={{ width: '600px', minHeight: '800px' }}
                                >
                                    <div className="text-center border-b border-stone-200 dark:border-stone-800 pb-4">
                                        <h1 className="text-2xl font-serif text-stone-900 dark:text-stone-100">
                                            {trip.name}
                                        </h1>
                                        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                                            {new Date().toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="text-center p-4 bg-stone-50 dark:bg-stone-900 rounded">
                                            <p className="text-sm text-stone-500 dark:text-stone-400">
                                                Total Trip Cost
                                            </p>
                                            <p className="text-2xl font-serif text-stone-900 dark:text-stone-100 mt-1">
                                                {formatCurrency(
                                                    settlement.totalCost,
                                                    trip.currency
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {trip.people.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-medium text-stone-900 dark:text-stone-100 mb-2">
                                                People ({trip.people.length})
                                            </h3>
                                            <div className="flex flex-wrap gap-1.5">
                                                {trip.people.map((person) => (
                                                    <span
                                                        key={person.name}
                                                        className="px-2 py-1 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-sm rounded"
                                                    >
                                                        {person.name}
                                                        {person.count > 1 && (
                                                            <span className="opacity-50">
                                                                {' '}
                                                                ×{person.count}
                                                            </span>
                                                        )}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {recentExpenses.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-medium text-stone-900 dark:text-stone-100 mb-2">
                                                Recent Expenses
                                            </h3>
                                            <div className="space-y-2">
                                                {recentExpenses.map((expense) => (
                                                    <div
                                                        key={expense.id}
                                                        className="flex items-center justify-between text-sm"
                                                    >
                                                        <span className="text-stone-700 dark:text-stone-300">
                                                            {expense.description}
                                                        </span>
                                                        <span className="text-stone-900 dark:text-stone-100 font-medium">
                                                            {formatCurrency(
                                                                expense.amount,
                                                                trip.currency
                                                            )}
                                                        </span>
                                                    </div>
                                                ))}
                                                {trip.expenses.length > 5 && (
                                                    <p className="text-xs text-stone-500 dark:text-stone-400">
                                                        ...and {trip.expenses.length - 5} more
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {settlement.individualCosts.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-medium text-stone-900 dark:text-stone-100 mb-2">
                                                Individual Costs
                                            </h3>
                                            <div className="space-y-1">
                                                {settlement.individualCosts.map(
                                                    ({ person, cost }) => (
                                                        <div
                                                            key={person}
                                                            className="flex items-center justify-between text-sm"
                                                        >
                                                            <span className="text-stone-700 dark:text-stone-300">
                                                                {person}
                                                            </span>
                                                            <span className="text-stone-900 dark:text-stone-100">
                                                                {formatCurrency(
                                                                    cost,
                                                                    trip.currency
                                                                )}
                                                            </span>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {settlement.transactions.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-medium text-stone-900 dark:text-stone-100 mb-2">
                                                Payments
                                            </h3>
                                            <div className="space-y-1">
                                                {settlement.transactions.map((t, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex items-center justify-between text-sm"
                                                    >
                                                        <span className="text-stone-700 dark:text-stone-300">
                                                            {t.from} → {t.to}
                                                        </span>
                                                        <span className="text-stone-900 dark:text-stone-100 font-medium">
                                                            {formatCurrency(
                                                                t.amount,
                                                                trip.currency
                                                            )}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="text-center pt-4 border-t border-stone-200 dark:border-stone-800">
                                        <p className="text-xs text-stone-400 dark:text-stone-500">
                                            Generated by TripSplitt
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="p-4 space-y-4 flex-col flex items-center">
                            <img
                                src={generatedImage || undefined}
                                alt="Trip Report"
                                className="rounded border border-stone-200 dark:border-stone-800"
                                style={{ maxWidth: '100%', maxHeight: '60vh', height: 'auto' }}
                            />
                            <div className="flex gap-3 shrink-0">
                                <Button onClick={handleDownload} className="flex-1 cursor-pointer">
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                </Button>
                                {typeof navigator !== 'undefined' && 'share' in navigator && (
                                    <Button
                                        variant="outline"
                                        onClick={handleShare}
                                        className="cursor-pointer"
                                    >
                                        <Share2 className="w-4 h-4 mr-2" />
                                        Share
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
