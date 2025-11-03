import { useEffect, useState } from 'react';

/**
 * Hook that monitors online/offline status of the browser.
 * @returns true if online, false if offline
 */
export function useOfflineStatus(): boolean {
	const [isOnline, setIsOnline] = useState(() => {
		if (typeof window !== 'undefined' && 'navigator' in window) {
			return navigator.onLine;
		}
		return true; // Default to online if navigator is not available
	});

	useEffect(() => {
		if (typeof window === 'undefined' || !('navigator' in window)) {
			return;
		}

		const handleOnline = () => {
			setIsOnline(true);
		};

		const handleOffline = () => {
			setIsOnline(false);
		};

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	}, []);

	return isOnline;
}

