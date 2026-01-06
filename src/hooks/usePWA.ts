import { useState, useEffect, useCallback } from 'react';
import { registerSW } from 'virtual:pwa-register';

interface PWAState {
    needRefresh: boolean;
    offlineReady: boolean;
    updateAvailable: boolean;
    isInstallable: boolean;
    deferredPrompt: any;
}

export function usePWA() {
    const [state, setState] = useState<PWAState>({
        needRefresh: false,
        offlineReady: false,
        updateAvailable: false,
        isInstallable: false,
        deferredPrompt: null,
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

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setState((prev) => ({
                ...prev,
                isInstallable: true,
                deferredPrompt: e,
            }));
        };

        const handleAppInstalled = () => {
            setState((prev) => ({
                ...prev,
                isInstallable: false,
                deferredPrompt: null,
            }));
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const applyUpdate = useCallback(async () => {
        if (updateSW) {
            await updateSW(true);
        }
    }, [updateSW]);

    const dismissUpdate = useCallback(() => {
        setState((prev) => ({ ...prev, needRefresh: false, offlineReady: false }));
    }, []);

    const installPWA = useCallback(async () => {
        const { deferredPrompt } = state;
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setState((prev) => ({
                ...prev,
                isInstallable: false,
                deferredPrompt: null,
            }));
        }
    }, [state.deferredPrompt]);

    return {
        ...state,
        applyUpdate,
        dismissUpdate,
        installPWA,
    };
}
