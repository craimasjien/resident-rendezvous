import { useEffect, useState } from 'react';

interface OfflineToastProps {
	isOffline: boolean;
}

export default function OfflineToast({ isOffline }: OfflineToastProps) {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		if (isOffline) {
			setIsVisible(true);
		} else {
			// Delay hiding to show "back online" message briefly
			const timer = setTimeout(() => {
				setIsVisible(false);
			}, 2000);
			return () => clearTimeout(timer);
		}
	}, [isOffline]);

	if (!isVisible) {
		return null;
	}

	return (
		<div
			className={`notification has-shadow${
				isOffline ? ' is-warning' : ' is-success'
			}`}
			style={{
				position: 'fixed',
				bottom: '20px',
				right: '20px',
				zIndex: 9999,
				maxWidth: '400px',
				margin: 0,
			}}
			role="alert"
			aria-live="polite"
		>
			<button
				type="button"
				className="delete"
				onClick={() => setIsVisible(false)}
				aria-label="Close notification"
			/>
			<strong>{isOffline ? 'Offline' : 'Back Online'}</strong>
			<br />
			{isOffline
				? 'You are offline. Your bookings will be saved when connection is restored.'
				: 'Connection restored. Your changes have been saved.'}
		</div>
	);
}

