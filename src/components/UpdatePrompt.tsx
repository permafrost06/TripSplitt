import { RefreshCw, X } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

export function UpdatePrompt() {
    const { needRefresh, offlineReady, applyUpdate, dismissUpdate } = usePWA();

    if (!needRefresh && !offlineReady) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
            {offlineReady && !needRefresh && (
                <div className="flex items-center gap-3">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                            App ready to work offline
                        </p>
                        <p className="text-xs text-gray-500">
                            You can now use TripSplitt without internet
                        </p>
                    </div>
                    <button
                        onClick={dismissUpdate}
                        className="text-gray-400 hover:text-gray-600"
                        aria-label="Dismiss"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}

            {needRefresh && (
                <div className="flex items-center gap-3">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Update available</p>
                        <p className="text-xs text-gray-500">
                            A new version of TripSplitt is ready
                        </p>
                    </div>
                    <button
                        onClick={applyUpdate}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Update
                    </button>
                    <button
                        onClick={dismissUpdate}
                        className="text-gray-400 hover:text-gray-600"
                        aria-label="Dismiss"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
}
