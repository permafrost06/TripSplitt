import { useState, useEffect, useCallback } from 'react';
import { registerSW } from 'virtual:pwa-register';

interface PWAState {
    needRefresh: boolean;
    offlineReady: boolean;
    updateAvailable: boolean;
}

export function usePWA() {
    const [state, setState] = useState<PWAState>({
        needRefresh: false,
        offlineReady: false,
        updateAvailable: false,
    });
    const [updateSW, setUpdateSW] = useState<((reload?: boolean) => Promise<void>) | null>(null);

    useEffect(() => {
        const update = registerSW({
            onNeedRefresh() {
                setState((prev) => ({ ...prev, needRefresh: true, updateAvailable: true }));
            },
            onOfflineReady() {
                setState((prev) => ({ ...prev, offlineReady: true }));
            },
            onRegisteredSW(swUrl, registration) {
                console.log('Service Worker registered:', swUrl);
                // Check for updates periodically (every hour)
                if (registration) {
                    setInterval(
                        () => {
                            registration.update();
                        },
                        60 * 60 * 1000
                    );
                }
            },
            onRegisterError(error) {
                console.error('Service Worker registration error:', error);
            },
        });

        setUpdateSW(() => update);
    }, []);

    const applyUpdate = useCallback(async () => {
        if (updateSW) {
            await updateSW(true);
        }
    }, [updateSW]);

    const dismissUpdate = useCallback(() => {
        setState((prev) => ({ ...prev, needRefresh: false, offlineReady: false }));
    }, []);

    return {
        ...state,
        applyUpdate,
        dismissUpdate,
    };
}
