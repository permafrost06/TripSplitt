import { RefreshCw, X, Wifi } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function UpdatePrompt() {
    const { needRefresh, offlineReady, applyUpdate, dismissUpdate } = usePWA();

    if (!needRefresh && !offlineReady) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
            <Card>
                <CardContent className="p-4">
                    {offlineReady && !needRefresh && (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 flex items-center justify-center bg-stone-100 dark:bg-stone-800">
                                <Wifi className="w-5 h-5 text-stone-900 dark:text-stone-100" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
                                    Offline ready
                                </p>
                                <p className="text-xs text-stone-500 dark:text-stone-400">
                                    TripSplitt works offline
                                </p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={dismissUpdate}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    )}

                    {needRefresh && (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 flex items-center justify-center bg-stone-100 dark:bg-stone-800">
                                <RefreshCw className="w-5 h-5 text-stone-900 dark:text-stone-100" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
                                    Update available
                                </p>
                                <p className="text-xs text-stone-500 dark:text-stone-400">
                                    A new version is ready
                                </p>
                            </div>
                            <Button onClick={applyUpdate} size="sm" className="gap-1.5">
                                <RefreshCw className="w-4 h-4" />
                                Update
                            </Button>
                            <Button variant="ghost" size="icon" onClick={dismissUpdate}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
